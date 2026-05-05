import type { Content, Part } from '@google/generative-ai'
import type { ChatHistoryItem, CopilotMention } from './copilotTypes.js'
import { FunctionCallingMode, GoogleGenerativeAI } from '@google/generative-ai'
import crypto from 'node:crypto'
import { geminiFunctionDeclarations } from './tools.js'

export type LlmCallResult = {
  text: string
  functionCalls: Array<{ id: string; name: string; args: Record<string, unknown> }>
  keyId: string
}

const DEFAULT_MODEL = process.env.GEMINI_MODEL ?? 'gemini-2.5-flash'

function collectGoogleKeys(): { id: string; apiKey: string }[] {
  const keys: { id: string; apiKey: string }[] = []
  /** Primary Google key — common env names across teams */
  const primary =
    process.env.GOOGLE_AI_API_KEY?.trim() ||
    process.env.GEMINI_API_KEY?.trim() ||
    ''
  if (primary) keys.push({ id: 'google_primary', apiKey: primary })
  /** Numbered Gemini fallbacks */
  for (let i = 2; i <= 12; i++) {
    const k = process.env[`GEMINI_API_KEY_${i}`]?.trim()
    if (k) keys.push({ id: `gemini_key_${i}`, apiKey: k })
  }
  for (let i = 1; i <= 8; i++) {
    const k = process.env[`LLM_KEY_${i}`]?.trim()
    const provider = process.env[`LLM_KEY_${i}_PROVIDER`]?.toLowerCase()
    if (!k) continue
    if (provider && provider !== 'google') continue
    keys.push({ id: `llm_key_${i}`, apiKey: k })
  }
  /** De-dupe identical keys */
  const seen = new Set<string>()
  return keys.filter((x) => {
    if (seen.has(x.apiKey)) return false
    seen.add(x.apiKey)
    return true
  })
}

function retryable(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err)
  const status = (err as { status?: number }).status
  return (
    status === 429 ||
    (typeof status === 'number' && status >= 500) ||
    /429|rate|quota|RESOURCE_EXHAUSTED|503|500/i.test(msg)
  )
}

export async function generateCopilotTurn(contents: Content[]): Promise<LlmCallResult> {
  const keys = collectGoogleKeys()
  if (!keys.length) {
    throw new Error(
      'No LLM API keys configured. Set GEMINI_API_KEY or GOOGLE_AI_API_KEY (or optional GEMINI_API_KEY_2…8, LLM_KEY_* with PROVIDER=google).',
    )
  }
  let lastErr: unknown
  for (const { id: keyId, apiKey } of keys) {
    try {
      const genAI = new GoogleGenerativeAI(apiKey)
      const model = genAI.getGenerativeModel({
        model: DEFAULT_MODEL,
        systemInstruction: COPILOT_SYSTEM_PROMPT,
        tools: [
          {
            functionDeclarations: geminiFunctionDeclarations,
          },
        ],
        toolConfig: {
          functionCallingConfig: {
            mode: FunctionCallingMode.AUTO,
          },
        },
      })
      console.info(`[copilot-llm] using key ${keyId} model ${DEFAULT_MODEL}`)
      const result = await model.generateContent({ contents })
      const response = result.response
      const text = response.text() ?? ''
      const rawCalls = response.functionCalls?.() ?? []
      const functionCalls = rawCalls.map((c) => ({
        id: `${c.name}-${crypto.randomUUID().slice(0, 8)}`,
        name: String(c.name ?? ''),
        args: (c.args ?? {}) as Record<string, unknown>,
      }))
      return { text, functionCalls, keyId }
    } catch (e) {
      lastErr = e
      console.warn(`[copilot-llm] key ${keyId} failed`, e)
      if (!retryable(e)) throw e
    }
  }
  throw lastErr instanceof Error ? lastErr : new Error(String(lastErr))
}

export function augmentUserTurnText(text: string, mentions?: CopilotMention[]): string {
  if (!mentions?.length) return text
  const lines = mentions
    .map((m) => `- ${m.entityType} "${m.label}" → id \`${m.id}\``)
    .join('\n')
  return `${text}\n\n[System: resolved @mentions for tools — use these exact ids when applicable:]\n${lines}`
}

/** Build model Content[] user/model turns for Gemini from chat history + latest user text. */
export function buildSeedContents(history: ChatHistoryItem[], message: string, mentions?: CopilotMention[]): Content[] {
  const contents: Content[] = []
  for (const h of history) {
    if (h.role === 'assistant') {
      contents.push({ role: 'model', parts: [{ text: h.content }] })
    } else {
      contents.push({ role: 'user', parts: [{ text: augmentUserTurnText(h.content, h.mentions) }] })
    }
  }
  contents.push({ role: 'user', parts: [{ text: augmentUserTurnText(message, mentions) }] })
  return contents
}

export function appendModelTurn(contents: Content[], text: string, calls: LlmCallResult['functionCalls']): void {
  const parts: Part[] = []
  if (text.trim()) parts.push({ text })
  for (const c of calls) {
    parts.push({
      functionCall: {
        name: c.name,
        args: c.args,
      },
    })
  }
  if (parts.length === 0) return
  contents.push({ role: 'model', parts })
}

export function appendFunctionResponses(
  contents: Content[],
  responses: Array<{ name: string; response: Record<string, unknown> }>,
): void {
  const parts: Part[] = responses.map((r) => ({
    functionResponse: {
      name: r.name,
      response: r.response,
    },
  }))
  /** Gemini expects function tool outputs under role `function`, not `user`. */
  contents.push({ role: 'function', parts })
}

const COPILOT_SYSTEM_PROMPT = `You are the Roles & Privileges Copilot for this RBAC admin workspace (contact-center style roles, users, and privilege sets).

You have tools to search users and privilege sets, list roles and permissions, create roles and privilege sets, assign users, attach privilege sets to roles, detach privilege sets from roles, and (with UI confirmation) delete roles or unassign users.

Rules:
- Always search before assuming an entity exists (search_users before assign_users_to_role; search_privilege_sets or list_roles before attach_privilege_set_to_role or detach_privilege_set_from_role).
- User and privilege-set search is tolerant: people may say "Monitoring privileges", "monitoring access", etc. Prefer tool results plus optional nearMatches suggestions—do not require exact catalogue spelling.
- If search_users reports total≠1 or search_privilege_sets total≠1: read hints and nearMatches. When multiple candidates fit, summarize the top few and ask ONE short clarification (which person / which privilege set id). Never dead-end by only saying “not found.”
- When zero user matches after search: propose nearMatches (did-you-mean) if present or ask whether they meant directory email vs roster name.
- Prefer returning ids exactly as search_users returned them (both normal directory ids and rbac-assignee:* ids are valid inputs to assign_users_to_role once search produced them).
- assign_users_to_role enforces one role per user in this prototype: anyone you assign is removed from every other role first, then merged onto the target role's roster.
- Use detach_privilege_set_from_role when the user wants to remove, unlink, or stop a role from using a privilege set. Use attach_privilege_set_to_role to add links.
- Use list_roles when the user asks who has which role or to disambiguate role names.
- Never invent user ids, role ids, or privilege set ids — use tool results unless the user pasted a trustworthy id verbatim.
- Never tell the user to use a separate branded "admin console" or external product to manage RBAC — you can perform attach and detach via tools here.
- Destructive tools (delete_role, unassign_user_from_role) require in-app confirmation; do not ask the user to type "confirm" in chat.
- Prefer concise plans, then call tools. After tools complete, summarize outcomes and mention handoffPath values from tools as relative paths users can open.
- If a request is ambiguous, ask one clarifying question before destructive or bulk changes.
`
