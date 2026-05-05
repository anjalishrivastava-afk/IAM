import type { Express, Request, Response } from 'express'
import { z } from 'zod'
import type { CopilotChatBody, CopilotConfirmBody } from './copilotTypes.js'
import type { CopilotSseType } from './copilotTypes.js'
import { orchestrateCopilotChat } from './orchestrator.js'
import { resolveConfirmation } from './pendingConfirmations.js'

const mentionSchema = z.object({
  entityType: z.enum(['role', 'privilege_set', 'user']),
  id: z.string().min(1),
  label: z.string().min(1),
})

const chatBodySchema = z.object({
  conversation_id: z.string().min(1),
  message: z.string().min(1),
  mentions: z.array(mentionSchema).optional(),
  history: z.array(
    z.union([
      z.object({
        role: z.literal('user'),
        content: z.string(),
        mentions: z.array(mentionSchema).optional(),
      }),
      z.object({
        role: z.literal('assistant'),
        content: z.string(),
      }),
    ]),
  ),
})

const confirmBodySchema = z.object({
  conversation_id: z.string().min(1),
  tool_call_id: z.string().min(1),
  confirmed: z.boolean(),
})

function sseInit(res: Response): void {
  res.setHeader('Content-Type', 'text/event-stream; charset=utf-8')
  res.setHeader('Cache-Control', 'no-cache, no-transform')
  res.setHeader('Connection', 'keep-alive')
  res.setHeader('X-Accel-Buffering', 'no')
  /** @see https://github.com/expressjs/express/issues/4598 */
  res.flushHeaders()
}

export function registerCopilotRoutes(app: Express): void {
  app.post('/api/copilot/chat', async (req: Request, res: Response) => {
    const parsed = chatBodySchema.safeParse(req.body)
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.message })
      return
    }

    sseInit(res)
    req.socket.setTimeout(0)

    const send = (type: CopilotSseType, payload?: unknown): void => {
      res.write(`data: ${JSON.stringify({ type, payload })}\n\n`)
    }

    try {
      await orchestrateCopilotChat(parsed.data as CopilotChatBody, send)
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      send('error', { message: msg })
      send(
        'assistant_message_complete',
        {
          text: "I'm having trouble reaching the AI service. Please try again in a moment.",
        },
      )
    } finally {
      send('done')
      res.end()
    }
  })

  app.post('/api/copilot/confirm', (req: Request, res: Response) => {
    const parsed = confirmBodySchema.safeParse(req.body)
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.message })
      return
    }
    const b = parsed.data as CopilotConfirmBody
    const ok = resolveConfirmation(b.conversation_id, b.tool_call_id, b.confirmed)
    if (!ok) {
      res.status(404).json({ error: 'No pending confirmation for this action' })
      return
    }
    res.json({ ok: true })
  })
}
