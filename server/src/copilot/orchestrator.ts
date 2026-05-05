import type { CopilotChatBody, CopilotSseType } from './copilotTypes.js'
import { getCachedResult, setCachedResult } from './idempotency.js'
import { additiveToolCacheKey } from './idempotencyKey.js'
import {
  appendFunctionResponses,
  appendModelTurn,
  buildSeedContents,
  generateCopilotTurn,
} from './llmRouter.js'
import { waitForConfirmation } from './pendingConfirmations.js'
import {
  buildDestructivePreview,
  executeToolNamed,
  toolRegistry,
  type ToolName,
} from './tools.js'

export type CopilotSseSend = (type: CopilotSseType, payload?: unknown) => void

async function sleep(ms: number): Promise<void> {
  await new Promise((r) => setTimeout(r, ms))
}

async function streamAssistantTokens(send: CopilotSseSend, text: string): Promise<void> {
  if (!text) return
  const step = Math.max(8, Math.ceil(text.length / 48))
  for (let i = 0; i < text.length; i += step) {
    send('assistant_token', { text: text.slice(i, i + step) })
    await sleep(6)
  }
}

function serializeForGeminiResponse(value: unknown): Record<string, unknown> {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return JSON.parse(JSON.stringify(value)) as Record<string, unknown>
  }
  return { value: JSON.parse(JSON.stringify(value)) }
}

export async function orchestrateCopilotChat(
  body: CopilotChatBody,
  send: CopilotSseSend,
): Promise<void> {
  const { conversation_id: conversationId, message, mentions, history } = body
  const contents = buildSeedContents(history, message, mentions)
  const maxRounds = 12

  send('agent_thinking', { message: 'Analyzing request…' })

  try {
    for (let round = 0; round < maxRounds; round++) {
      let llm: Awaited<ReturnType<typeof generateCopilotTurn>>
      try {
        llm = await generateCopilotTurn(contents)
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e)
        send('agent_thinking', { message: '' })
        send('error', {
          message:
            llmKeysLikelyMissing(msg) ? msg : `I'm having trouble reaching the AI service. ${msg}`,
        })
        send('assistant_message_complete', {
          text: "I'm having trouble reaching the AI service. Please try again in a moment.",
        })
        return
      }

      send('agent_thinking', { message: '' })
      await streamAssistantTokens(send, llm.text)

      if (llm.functionCalls.length === 0) {
        appendModelTurn(contents, llm.text, [])
        send('assistant_message_complete', { text: llm.text })
        return
      }

      appendModelTurn(contents, llm.text, llm.functionCalls)

      const functionResponses: Array<{ name: string; response: Record<string, unknown> }> = []

      for (const call of llm.functionCalls) {
        const t0 = Date.now()
        send('tool_call_start', {
          id: call.id,
          name: call.name,
          input: call.args,
        })

        const def = toolRegistry[call.name as ToolName]

        if (def?.isDestructive) {
          const preview = buildDestructivePreview(call.name as ToolName, call.args)
          send('confirmation_required', {
            actionId: call.id,
            action: call.name,
            preview,
          })
          const confirmed = await waitForConfirmation(conversationId, call.id)
          if (!confirmed) {
            const durationMs = Date.now() - t0
            send('tool_call_end', {
              id: call.id,
              output: { cancelled: true },
              duration: durationMs,
            })
            functionResponses.push({
              name: call.name,
              response: serializeForGeminiResponse({ cancelled: true }),
            })
            continue
          }
        }

        const cacheKey =
          def && !def.isDestructive
            ? additiveToolCacheKey(conversationId, call.name, call.args)
            : null
        if (cacheKey) {
          const cached = getCachedResult<unknown>(cacheKey)
          if (cached !== undefined) {
            const durationMs = Date.now() - t0
            send('tool_call_end', {
              id: call.id,
              output: cached,
              duration: durationMs,
              cached: true,
            })
            functionResponses.push({
              name: call.name,
              response: serializeForGeminiResponse(cached),
            })
            continue
          }
        }

        try {
          const exec = await executeToolNamed(call.name, call.args, {})
          const durationMs = Date.now() - t0

          if (exec.ok === false) {
            send('tool_call_error', { id: call.id, error: exec.error })
            functionResponses.push({
              name: call.name,
              response: serializeForGeminiResponse({ error: exec.error }),
            })
          } else {
            if (cacheKey) setCachedResult(cacheKey, exec.result)
            send('tool_call_end', {
              id: call.id,
              output: exec.result,
              duration: durationMs,
            })
            functionResponses.push({
              name: call.name,
              response: serializeForGeminiResponse(exec.result),
            })
          }
        } catch (e) {
          const err = e instanceof Error ? e.message : String(e)
          send('tool_call_error', { id: call.id, error: err })
          functionResponses.push({
            name: call.name,
            response: serializeForGeminiResponse({ error: err }),
          })
        }
      }

      appendFunctionResponses(contents, functionResponses)

      send('agent_thinking', { message: 'Summarizing results…' })
    }

    send('assistant_message_complete', {
      text: 'I stopped after too many reasoning steps. Please narrow the request.',
    })
  } finally {
    send('agent_thinking', { message: '' })
  }
}

function llmKeysLikelyMissing(msg: string): boolean {
  return /No LLM API keys configured/i.test(msg)
}
