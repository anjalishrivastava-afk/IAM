import { keyframes, useTheme, type Theme } from '@mui/material/styles'
import { useCallback, useEffect, useRef, useState, type KeyboardEvent, type MouseEvent } from 'react'
import Markdown from 'react-markdown'
import { useNavigate } from 'react-router-dom'
import {
  CaretDown,
  Check,
  CopySimple,
  ListBullets,
  NotePencil,
  Sparkle,
  SpinnerGap,
  Target,
  Users,
  X,
} from '@phosphor-icons/react'
import { CircularProgress } from '@mui/material'
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Icon,
  IconButton,
  InputBase,
  Snackbar,
  Stack,
  Typography,
} from '@exotel-npm-dev/signal-design-system'

import { CopilotComposer, MENTION_PILL_SX, type UserMessageSegment, type CopilotComposerHandle } from './CopilotComposer'
import type { ChatHistoryItem, CopilotMentionPayload } from '../../types/copilot'
import { RBAC_LISTS_REFRESH_EVENT } from '../../constants/rbacEvents'

const PANEL_WIDTH = 400

const shimmer = keyframes`
  0% { background-position: 0% 50%; }
  100% { background-position: 100% 50%; }
`

const blink = keyframes`
  0%, 49% { opacity: 1; }
  50%, 100% { opacity: 0; }
`

const spinGlow = keyframes`
  to { transform: rotate(360deg); }
`

/** Four-dot Thinking header pulse (campaign Copilot parity). */
const thinkingDotPulse = keyframes`
  0%, 80%, 100% { opacity: 0.25; transform: scale(0.85); }
  40% { opacity: 1; transform: scale(1); }
`

/** Single play on mount — empty-state greeting. */
const waveHandOnce = keyframes`
  0% { transform: rotate(0deg); }
  12% { transform: rotate(16deg); }
  24% { transform: rotate(-10deg); }
  36% { transform: rotate(14deg); }
  48% { transform: rotate(-6deg); }
  60% { transform: rotate(10deg); }
  72% { transform: rotate(0deg); }
  100% { transform: rotate(0deg); }
`

export type RolesPrivilegesCopilotDrawerProps = {
  open: boolean
  onClose: () => void
}

type TimelineStatus = 'thinking' | 'running' | 'done' | 'failed' | 'pending'

type TimelineNode = {
  id: string
  toolName: string
  label: string
  status: TimelineStatus
  subtitle?: string
  durationMs?: number
  startedAt: number
  confirmation?: 'pending' | 'confirmed' | 'cancelled'
  preview?: { title: string; impact: string; details: Record<string, unknown> }
  error?: string
  handoffPath?: string
  handoffLabel?: string
  /** Shown after user confirms/cancels destructive action */
  confirmationNote?: string
}

type UiMessage =
  | {
      kind: 'user'
      id: string
      flatText: string
      mentions?: CopilotMentionPayload[]
      segments: UserMessageSegment[]
      at: number
    }
  | { kind: 'assistant'; id: string; text: string }
  | { kind: 'timeline'; id: string; nodes: TimelineNode[] }

function humanizeTool(name: string, input: unknown): string {
  const o = (input ?? {}) as Record<string, unknown>
  switch (name) {
    case 'search_users':
      return `Searching users matching "${o.query}"`
    case 'search_privilege_sets':
      return `Searching privilege sets for "${o.query}"`
    case 'list_permissions':
      return 'Listing available permissions'
    case 'list_roles':
      return o.query ? `Listing roles matching "${o.query}"` : 'Listing roles'
    case 'create_role':
      return `Creating role "${o.name}"`
    case 'assign_users_to_role':
      return `Assigning ${Array.isArray(o.userIds) ? o.userIds.length : 0} user(s) to role`
    case 'create_privilege_set':
      return `Creating privilege set "${o.name}"`
    case 'attach_privilege_set_to_role':
      return 'Attaching privilege set to role'
    case 'detach_privilege_set_from_role':
      return 'Removing privilege set from role'
    case 'delete_role':
      return 'Deleting role'
    case 'unassign_user_from_role':
      return 'Removing user from role'
    default:
      return name.replace(/_/g, ' ')
  }
}

function extractHandoff(output: unknown): { path: string; label: string } | null {
  if (!output || typeof output !== 'object') return null
  const p = (output as Record<string, unknown>).handoffPath
  if (typeof p !== 'string' || !p.startsWith('/')) return null
  if (p.includes('roles/')) return { path: p, label: 'View role →' }
  if (p.includes('privilege-sets/')) return { path: p, label: 'View privilege set →' }
  return { path: p, label: 'Open →' }
}

/** Copilot tools that do not mutate roles / privilege-set lists */
const COPILOT_READONLY_TOOLS = new Set([
  'search_users',
  'search_privilege_sets',
  'list_permissions',
  'list_roles',
])

export function RolesPrivilegesCopilotDrawer({ open, onClose }: RolesPrivilegesCopilotDrawerProps) {
  const navigate = useNavigate()
  const [, renderTick] = useState(0)
  const [conversationId, setConversationId] = useState(() => crypto.randomUUID())
  const [messages, setMessages] = useState<UiMessage[]>([])
  const [chatHistory, setChatHistory] = useState<ChatHistoryItem[]>([])
  const [streaming, setStreaming] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const [fatalError, setFatalError] = useState<string | null>(null)
  const [online, setOnline] = useState(() => navigator.onLine)
  const [newChatConfirmOpen, setNewChatConfirmOpen] = useState(false)
  const [feedbackOpen, setFeedbackOpen] = useState(false)
  const [feedbackText, setFeedbackText] = useState('')
  const [panelFadeOut, setPanelFadeOut] = useState(false)
  const abortRef = useRef<AbortController | null>(null)
  const scrollRef = useRef<HTMLDivElement | null>(null)
  const composerRef = useRef<CopilotComposerHandle | null>(null)
  const copilotToolNamesByCallIdRef = useRef(new Map<string, string>())

  useEffect(() => {
    if (!open) return
    const id = window.setInterval(() => renderTick((n) => n + 1), 400)
    return () => clearInterval(id)
  }, [open, streaming])

  useEffect(() => {
    if (!open) {
      setMessages([])
      setChatHistory([])
      setFatalError(null)
      setStreaming(false)
      setPanelFadeOut(false)
      abortRef.current?.abort()
      abortRef.current = null
      copilotToolNamesByCallIdRef.current.clear()
      composerRef.current?.clear()
      return
    }
    setConversationId(crypto.randomUUID())
  }, [open])

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    el.scrollTop = el.scrollHeight
  }, [messages, streaming, open, renderTick])

  useEffect(() => {
    const onOff = () => setOnline(navigator.onLine)
    window.addEventListener('online', onOff)
    window.addEventListener('offline', onOff)
    return () => {
      window.removeEventListener('online', onOff)
      window.removeEventListener('offline', onOff)
    }
  }, [])

  useEffect(() => {
    if (!open) return
    const onKey = (e: globalThis.KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'K')) {
        e.preventDefault()
        composerRef.current?.focus()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  const flushTokensToAssistant = useCallback((text: string) => {
    if (!text) return
    setMessages((prev) => {
      const next = [...prev]
      const last = next[next.length - 1]
      if (last?.kind === 'assistant') {
        next[next.length - 1] = { ...last, text: last.text + text }
        return next
      }
      next.push({ kind: 'assistant', id: `asst-${crypto.randomUUID().slice(0, 8)}`, text })
      return next
    })
  }, [])

  const setTimelineNodes = useCallback((updater: (nodes: TimelineNode[]) => TimelineNode[]) => {
    setMessages((prev) => {
      const next = [...prev]
      const idx = [...next].reverse().findIndex((m) => m.kind === 'timeline')
      const realIdx = idx === -1 ? -1 : next.length - 1 - idx
      if (realIdx === -1) return prev
      const tl = next[realIdx] as Extract<UiMessage, { kind: 'timeline' }>
      next[realIdx] = { ...tl, nodes: updater(tl.nodes) }
      return next
    })
  }, [])

  const upsertTimelineNode = useCallback(
    (id: string, patch: Partial<TimelineNode>) => {
      setTimelineNodes((nodes) => {
        const i = nodes.findIndex((n) => n.id === id)
        if (i === -1) return nodes
        const copy = [...nodes]
        copy[i] = { ...copy[i], ...patch }
        return copy
      })
    },
    [setTimelineNodes],
  )

  const clearChatConfirmed = useCallback(() => {
    setMessages([])
    setChatHistory([])
    setFatalError(null)
    setConversationId(crypto.randomUUID())
    composerRef.current?.clear()
    setNewChatConfirmOpen(false)
  }, [])

  const requestNewChat = useCallback(() => {
    if (messages.length > 0) {
      setNewChatConfirmOpen(true)
      return
    }
    clearChatConfirmed()
  }, [clearChatConfirmed, messages.length])

  const sendConfirmRequest = useCallback(
    async (toolCallId: string, confirmed: boolean): Promise<boolean> => {
      const res = await fetch('/api/copilot/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversation_id: conversationId,
          tool_call_id: toolCallId,
          confirmed,
        }),
      })
      return res.ok
    },
    [conversationId],
  )

  const handleDestructiveChoice = useCallback(
    async (toolCallId: string, confirmed: boolean) => {
      const ok = await sendConfirmRequest(toolCallId, confirmed)
      if (!ok) return
      const t = new Date()
      const time = t.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
      upsertTimelineNode(toolCallId, {
        confirmation: confirmed ? 'confirmed' : 'cancelled',
        confirmationNote: confirmed ? `Confirmed at ${time}` : `Cancelled at ${time}`,
      })
    },
    [sendConfirmRequest, upsertTimelineNode],
  )

  const runChat = useCallback(
    async (userText: string, mentions?: CopilotMentionPayload[], segments?: UserMessageSegment[]) => {
      const trimmed = userText.trim()
      if (!trimmed || streaming) return

      setFatalError(null)
      setStreaming(true)

      const tid = `tl-${crypto.randomUUID().slice(0, 8)}`
      const safeSegments =
        segments && segments.length > 0 ? segments : ([{ kind: 'text' as const, value: trimmed }] satisfies UserMessageSegment[])
      const userMsg: UiMessage = {
        kind: 'user',
        id: `u-${crypto.randomUUID().slice(0, 8)}`,
        flatText: trimmed,
        mentions,
        segments: safeSegments,
        at: Date.now(),
      }
      setMessages((prev) => [
        ...prev,
        userMsg,
        {
          kind: 'timeline',
          id: tid,
          nodes: [
            {
              id: 'thinking-local',
              toolName: 'thinking',
              label: 'Analysing request',
              status: 'thinking',
              startedAt: Date.now(),
            },
          ],
        },
      ])

      const ac = new AbortController()
      abortRef.current = ac

      let sseCriticalError = false
      let assistantSummary = ''

      const removeThinking = () => {
        setTimelineNodes((nodes) => nodes.filter((n) => n.id !== 'thinking-local'))
      }

      try {
        const res = await fetch('/api/copilot/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: ac.signal,
          body: JSON.stringify({
            conversation_id: conversationId,
            message: trimmed,
            ...(mentions?.length ? { mentions } : {}),
            history: chatHistory,
          }),
        })

        if (!res.ok || !res.body) {
          throw new Error(`Chat request failed (${res.status})`)
        }

        const reader = res.body.getReader()
        const decoder = new TextDecoder()
        let buffer = ''

        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split('\n')
          buffer = lines.pop() ?? ''

          for (const line of lines) {
            if (!line.startsWith('data: ')) continue
            let evt: { type: string; payload?: unknown }
            try {
              evt = JSON.parse(line.slice(6)) as { type: string; payload?: unknown }
            } catch {
              continue
            }

            switch (evt.type) {
              case 'assistant_token': {
                removeThinking()
                const p = evt.payload as { text?: string } | string | undefined
                const chunk = typeof p === 'string' ? p : typeof p?.text === 'string' ? p.text : ''
                flushTokensToAssistant(chunk)
                break
              }
              case 'agent_thinking': {
                const msg = (evt.payload as { message?: string } | undefined)?.message
                if (msg && msg !== '') {
                  removeThinking()
                  setTimelineNodes((nodes) => {
                    if (nodes.some((n) => n.id === 'think-status')) return nodes
                    return [
                      ...nodes,
                      {
                        id: 'think-status',
                        toolName: 'status',
                        label: msg,
                        status: 'running',
                        startedAt: Date.now(),
                      },
                    ]
                  })
                } else {
                  setTimelineNodes((nodes) => nodes.filter((n) => n.id !== 'think-status'))
                }
                break
              }
              case 'tool_call_start': {
                removeThinking()
                const p = evt.payload as { id: string; name: string; input?: unknown }
                copilotToolNamesByCallIdRef.current.set(p.id, p.name)
                const label = humanizeTool(p.name, p.input)
                setTimelineNodes((nodes) => [
                  ...nodes.filter((n) => n.id !== 'thinking-local'),
                  {
                    id: p.id,
                    toolName: p.name,
                    label,
                    status: 'running',
                    startedAt: Date.now(),
                  },
                ])
                break
              }
              case 'confirmation_required': {
                const p = evt.payload as {
                  actionId?: string
                  preview?: TimelineNode['preview']
                }
                const aid = p.actionId
                if (!aid) break
                upsertTimelineNode(aid, {
                  confirmation: 'pending',
                  preview: p.preview,
                })
                break
              }
              case 'tool_call_end': {
                const p = evt.payload as { id?: string; output?: unknown; duration?: number }
                if (!p.id) break
                const toolName = copilotToolNamesByCallIdRef.current.get(p.id)
                copilotToolNamesByCallIdRef.current.delete(p.id)
                const hf = extractHandoff(p.output)
                upsertTimelineNode(p.id, {
                  status: 'done',
                  durationMs: typeof p.duration === 'number' ? p.duration : undefined,
                  subtitle: summarizeOutput(p.output),
                  handoffPath: hf?.path,
                  handoffLabel: hf?.label,
                })
                if (hf) setToast('Action completed')
                if (toolName && !COPILOT_READONLY_TOOLS.has(toolName)) {
                  window.dispatchEvent(new CustomEvent(RBAC_LISTS_REFRESH_EVENT))
                }
                break
              }
              case 'tool_call_error': {
                const p = evt.payload as { id?: string; error?: string }
                if (p.id) copilotToolNamesByCallIdRef.current.delete(p.id)
                if (!p.id) break
                upsertTimelineNode(p.id, {
                  status: 'failed',
                  error: p.error ?? 'Unknown error',
                  subtitle: p.error,
                })
                break
              }
              case 'assistant_message_complete': {
                const p = evt.payload as { text?: string } | undefined
                const text =
                  typeof p?.text === 'string'
                    ? p.text
                    : typeof evt.payload === 'string'
                      ? evt.payload
                      : ''
                assistantSummary = text
                setMessages((prev) => {
                  const next = [...prev]
                  for (let i = next.length - 1; i >= 0; i--) {
                    if (next[i].kind === 'assistant') {
                      next[i] = {
                        ...(next[i] as Extract<UiMessage, { kind: 'assistant' }>),
                        text,
                      }
                      return next
                    }
                  }
                  if (text) next.push({ kind: 'assistant', id: `asst-${crypto.randomUUID().slice(0, 8)}`, text })
                  return next
                })
                break
              }
              case 'error': {
                const p = evt.payload as { message?: string } | undefined
                setFatalError(p?.message ?? 'Request failed')
                sseCriticalError = true
                break
              }
              default:
                break
            }
          }
        }

        if (!sseCriticalError) {
          const userHist: Extract<ChatHistoryItem, { role: 'user' }> =
            mentions?.length ?
              { role: 'user', content: trimmed, mentions }
            : { role: 'user', content: trimmed }
          setChatHistory((h) => [...h, userHist, { role: 'assistant', content: assistantSummary || '(Copilot responded.)' }])
        }
      } catch (e) {
        if ((e as Error).name === 'AbortError') return
        const msg = e instanceof Error ? e.message : String(e)
        setFatalError(msg)
        setMessages((prev) => [
          ...prev,
          {
            kind: 'assistant',
            id: `asst-${crypto.randomUUID().slice(0, 8)}`,
            text: `Something went wrong: ${msg}`,
          },
        ])
      } finally {
        setStreaming(false)
        setTimelineNodes((nodes) => nodes.filter((n) => n.id !== 'thinking-local' && n.id !== 'think-status'))
        abortRef.current = null
      }
    },
    [
      chatHistory,
      conversationId,
      flushTokensToAssistant,
      streaming,
      setTimelineNodes,
      upsertTimelineNode,
    ],
  )

  const onSendFromComposer = useCallback(() => {
    const composer = composerRef.current
    if (!composer || streaming || !online) return
    const { text, mentions, segments } = composer.getPayload()
    const trimmed = text.trim()
    if (!trimmed) return
    composer.clear()
    void runChat(trimmed, mentions, segments)
  }, [online, runChat, streaming])

  const lastUserMessage = [...messages].reverse().find((m) => m.kind === 'user') as
    | Extract<UiMessage, { kind: 'user' }>
    | undefined

  const retryLastTurn = useCallback(() => {
    if (!lastUserMessage) return
    void runChat(lastUserMessage.flatText, lastUserMessage.mentions, lastUserMessage.segments)
  }, [lastUserMessage, runChat])

  const closePanel = useCallback(() => {
    setPanelFadeOut(true)
    window.setTimeout(() => {
      setPanelFadeOut(false)
      onClose()
    }, 220)
  }, [onClose])

  if (!open) return null

  return (
    <>
      <Box
        sx={(theme: Theme) => ({
          order: { xs: 2, md: 2 },
          flexShrink: 0,
          width: { xs: '100%', md: PANEL_WIDTH },
          maxWidth: { xs: '100vw', md: PANEL_WIDTH },
          minHeight: { xs: 'min(48vh, 500px)', md: 0 },
          maxHeight: { xs: 'min(52vh, 560px)', md: 'none' },
          overflow: 'hidden',
          borderLeft: { xs: 'none', md: `1px solid ${theme.palette.mode === 'light' ? '#E6E5E0' : theme.palette.divider}` },
          borderTop: { xs: '1px solid', md: 'none' },
          borderColor: 'divider',
          bgcolor: 'background.paper',
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
          opacity: panelFadeOut ? 0 : 1,
          transition: theme.transitions.create(['opacity'], { duration: 220 }),
          alignSelf: { md: 'stretch' },
          flex: { md: '0 0 auto', xs: '0 0 auto' },
        })}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, py: 1, px: 1, flexShrink: 0 }}>
          <IconButton size="small" variant="outlined" aria-label="Start new chat" onClick={requestNewChat} sx={{ color: 'text.primary' }}>
            <NotePencil size={16} weight="regular" aria-hidden />
          </IconButton>
          <IconButton size="small" variant="outlined" aria-label="Close assistant" onClick={closePanel}>
            <Icon name="x" size="sm" />
          </IconButton>
        </Box>

        {!online ? (
          <Alert severity="warning" sx={{ mx: 1, mb: 0.5 }}>
            Reconnecting… You appear to be offline. Messages cannot be sent until you are back online.
          </Alert>
        ) : null}

        <Box
          ref={scrollRef}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 3,
            minHeight: 0,
            flex: 1,
            px: 1.5,
            py: 1.5,
            overflowY: 'auto',
          }}
        >
          {messages.length === 0 ? (
            <EmptyState onDraftLine={(line) => composerRef.current?.appendPlainText(line)} />
          ) : (
            messages.map((m, i) => {
              if (m.kind === 'assistant' && messages[i - 1]?.kind === 'timeline') {
                return null
              }
              const pairedAssistant =
                m.kind === 'timeline' && messages[i + 1]?.kind === 'assistant' ?
                  (messages[i + 1] as Extract<UiMessage, { kind: 'assistant' }>)
                : undefined
              const streamOnPaired =
                Boolean(
                  streaming &&
                    pairedAssistant &&
                    i + 1 === messages.length - 1 &&
                    messages[messages.length - 1]?.kind === 'assistant',
                )
              return (
                <MessageBlock
                  key={m.id}
                  message={m}
                  pairedAssistant={pairedAssistant}
                  streamingCursor={streamOnPaired}
                  onNavigate={(path) => {
                    setPanelFadeOut(true)
                    window.setTimeout(() => {
                      navigate(path)
                      onClose()
                      setPanelFadeOut(false)
                    }, 170)
                  }}
                  onDestructiveChoice={handleDestructiveChoice}
                />
              )
            })
          )}
          {fatalError ? (
            <Box sx={{ py: 1 }}>
              <Typography variant="body2" color="error">
                {fatalError.includes('keys')
                  ? fatalError
                  : "I'm having trouble reaching the AI service. Please try again in a moment."}
              </Typography>
              {lastUserMessage ? (
                <Button sx={{ mt: 1 }} size="small" variant="outlined" onClick={() => void retryLastTurn()}>
                  Retry
                </Button>
              ) : null}
            </Box>
          ) : null}
        </Box>

        <Box
          sx={(theme: Theme) => ({
            flexShrink: 0,
            borderTop: '1px solid',
            borderColor: 'divider',
            pt: 0.75,
            pb: 0.75,
            px: 0.75,
            background: `linear-gradient(180deg, transparent 0%, ${theme.palette.background.paper} 20%)`,
          })}
        >
          <CopilotComposer ref={composerRef} disabled={streaming || !online} onSubmit={onSendFromComposer} />
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mt: 0.5, px: 0.5, pt: 0.75, maxWidth: 700, mx: 'auto' }}>
            <Typography sx={{ fontSize: 12, color: '#616161' }}>AI can make mistakes, so double check it</Typography>
            <Button
              variant="text"
              size="small"
              onClick={() => setFeedbackOpen(true)}
              sx={{ fontSize: 12, color: '#616161', textDecoration: 'underline', minWidth: 0 }}
            >
              Send Feedback
            </Button>
          </Stack>
        </Box>
      </Box>

      <Dialog open={newChatConfirmOpen} onClose={() => setNewChatConfirmOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Start a new chat?</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            Current conversation will be lost. Closing the assistant also clears this chat — it is not saved.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNewChatConfirmOpen(false)} color="inherit" variant="text">
            Cancel
          </Button>
          <Button onClick={() => clearChatConfirmed()} variant="contained" color="primary">
            Start new
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={feedbackOpen} onClose={() => setFeedbackOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Send feedback</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Describe the issue or idea. Sending opens your email client with this text.
          </Typography>
          <InputBase
            multiline
            minRows={4}
            fullWidth
            value={feedbackText}
            placeholder="Feedback…"
            onChange={(e) => setFeedbackText(e.target.value)}
            sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, px: 1, py: 1, alignItems: 'flex-start', fontSize: 14 }}
          />
        </DialogContent>
        <DialogActions>
          <Button variant="text" onClick={() => setFeedbackOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              const subject = encodeURIComponent('RBAC Copilot feedback')
              const body = encodeURIComponent(feedbackText.trim() || '(empty)')
              window.open(`mailto:feedback@exotel.com?subject=${subject}&body=${body}`)
              setFeedbackOpen(false)
              setFeedbackText('')
            }}
          >
            Open email draft
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={Boolean(toast)}
        autoHideDuration={4000}
        onClose={() => setToast(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success" variant="filled" onClose={() => setToast(null)} sx={{ width: '100%' }}>
          {toast}
        </Alert>
      </Snackbar>
    </>
  )
}

function summarizeOutput(output: unknown): string | undefined {
  if (!output || typeof output !== 'object') return undefined
  const o = output as Record<string, unknown>
  if (o.cancelled) return 'Cancelled'
  if (o.removed === true && typeof o.privilegeSetName === 'string')
    return `Removed "${o.privilegeSetName}"`
  if (typeof o.roleName === 'string') return String(o.roleName)
  if (typeof o.roleId === 'string' && typeof o.assignedUserCount === 'number') {
    const upro = o.removedFromOtherRoles
    if (Array.isArray(upro) && upro.length > 0) {
      const bits = upro
        .map((row) => {
          if (!row || typeof row !== 'object') return null
          const r = row as Record<string, unknown>
          const rn = typeof r.roleName === 'string' ? r.roleName : '?'
          const nu = Array.isArray(r.removedUserNames) ? r.removedUserNames : []
          const nm = nu.filter((x): x is string => typeof x === 'string').join(', ')
          return nm ? `${rn}: ${nm}` : rn
        })
        .filter(Boolean)
      if (bits.length) return `${o.assignedUserCount} assignment(s); removed from ${bits.join('; ')}`
    }
    return `${o.assignedUserCount} assignment(s)`
  }
  if (typeof o.total === 'number') return `${o.total} match(es)`
  if (typeof o.error === 'string') return o.error
  return undefined
}

function MessageBlock({
  message: m,
  pairedAssistant,
  streamingCursor,
  onNavigate,
  onDestructiveChoice,
}: {
  message: UiMessage
  pairedAssistant?: Extract<UiMessage, { kind: 'assistant' }>
  streamingCursor?: boolean
  onNavigate: (path: string) => void
  onDestructiveChoice: (toolCallId: string, confirmed: boolean) => Promise<void>
}) {
  if (m.kind === 'user') {
    return (
      <Stack sx={{ alignItems: 'flex-end', width: '100%', gap: 0.75, px: '4px', maxWidth: 700, mx: 'auto' }}>
        <Box sx={{ alignSelf: 'flex-end', maxWidth: '90%' }}>
          <Box
            title={new Date(m.at).toLocaleString()}
            sx={{
              px: '12px',
              py: '12px',
              borderRadius: '12px',
              borderTopRightRadius: '2px',
              bgcolor: '#ECEEFA',
              color: '#1A1A1A',
            }}
          >
            <Typography variant="body2" component="div" sx={{ lineHeight: 1.43, letterSpacing: '0.17px' }}>
              {m.segments.map((s, i) =>
                s.kind === 'text' ? (
                  <span key={i}>{s.value}</span>
                ) : (
                  <Box key={i} component="span" sx={MENTION_PILL_SX}>
                    @{s.label}
                  </Box>
                ),
              )}
            </Typography>
          </Box>
          <Stack direction="row" justifyContent="flex-start" sx={{ mt: '4px' }}>
            <IconButton
              size="small"
              variant="text"
              aria-label="Copy message"
              sx={{ ml: '-4px', color: '#616161' }}
              onClick={() => void navigator.clipboard.writeText(m.flatText)}
            >
              <CopySimple size={16} weight="regular" aria-hidden />
            </IconButton>
          </Stack>
        </Box>
      </Stack>
    )
  }

  if (m.kind === 'assistant') {
    return (
      <Stack direction="row" alignItems="flex-start" spacing={1} sx={{ pr: 1, px: '4px', maxWidth: 700, mx: 'auto' }}>
        <Sparkle size={16} weight="fill" aria-hidden style={{ color: '#3949AB', marginTop: 4, flexShrink: 0 }} />
        <Box sx={{ flex: 1, minWidth: 0, '& p': { margin: 0 }, '& ul': { mt: 0.5 }, '& p+p': { mt: 1 } }}>
          <Markdown>{m.text}</Markdown>
          {streamingCursor ? (
            <Box
              component="span"
              aria-hidden
              sx={{
                display: 'inline-block',
                width: 6,
                height: '1em',
                ml: 0.25,
                bgcolor: 'primary.main',
                verticalAlign: 'text-bottom',
                animation: `${blink} 1s steps(2, jump-none) infinite`,
              }}
            />
          ) : null}
        </Box>
      </Stack>
    )
  }

  return (
    <ThinkingAccordion
      nodes={m.nodes}
      pairedAssistant={pairedAssistant}
      streamingCursor={streamingCursor}
      onNavigate={onNavigate}
      onDestructiveChoice={onDestructiveChoice}
    />
  )
}

function ThinkingDotsHeader() {
  return (
    <Stack direction="row" alignItems="center" justifyContent="center" sx={{ width: 28, height: 28, gap: '5px', flexShrink: 0 }}>
      {[0, 1, 2, 3].map((i) => (
        <Box
          key={i}
          sx={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            bgcolor: '#3949AB',
            animation: `${thinkingDotPulse} 1.1s ease-in-out infinite`,
            animationDelay: `${i * 0.12}s`,
          }}
        />
      ))}
    </Stack>
  )
}

function StepRowIcon({
  node,
}: {
  node: TimelineNode
}) {
  const failed = node.status === 'failed'
  const running = node.status === 'running' || node.status === 'thinking'

  if (failed)
    return (
      <Box
        sx={{
          width: 16,
          height: 16,
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <X size={14} weight="bold" color="#d32f2f" aria-hidden />
      </Box>
    )
  if (node.confirmation === 'pending') {
    return (
      <Box sx={{ width: 16, height: 16, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3949AB' }}>
        <CircularProgress size={14} thickness={5} sx={{ color: '#3949AB' }} aria-hidden variant="indeterminate" />
      </Box>
    )
  }
  if (running && (node.toolName === 'thinking' || node.toolName === 'status')) {
    return (
      <Box sx={{ width: 16, height: 16, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3949AB' }}>
        <Box sx={{ animation: `${spinGlow} 0.9s linear infinite`, display: 'flex' }}>
          <SpinnerGap size={16} aria-hidden />
        </Box>
      </Box>
    )
  }
  if (running) {
    return (
      <Box sx={{ width: 16, height: 16, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'primary.main' }}>
        <CircularProgress size={14} thickness={5} sx={{ color: '#3949AB' }} aria-hidden variant="indeterminate" />
      </Box>
    )
  }
  if (
    node.status === 'done' ||
    node.confirmation === 'confirmed' ||
    node.confirmation === 'cancelled'
  )
    return (
      <Box sx={{ width: 16, height: 16, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Check size={14} weight="bold" color="#2E7D32" aria-hidden />
      </Box>
    )
  return (
    <Box sx={{ width: 16, height: 16, flexShrink: 0, borderRadius: '50%', border: '2px solid', borderColor: 'grey.400' }} />
  )
}

function ThinkingAccordion({
  nodes,
  pairedAssistant,
  streamingCursor,
  onNavigate,
  onDestructiveChoice,
}: {
  nodes: TimelineNode[]
  pairedAssistant?: Extract<UiMessage, { kind: 'assistant' }>
  streamingCursor?: boolean
  onNavigate: (path: string) => void
  onDestructiveChoice: (toolCallId: string, confirmed: boolean) => Promise<void>
}) {
  const theme = useTheme()
  const [expanded, setExpanded] = useState(true)
  const headerBusy = Boolean(
    streamingCursor || nodes.some((n) => n.status === 'running' || n.status === 'thinking' || n.confirmation === 'pending'),
  )

  return (
    <Box
      sx={{
        width: '100%',
        maxWidth: 790,
        mx: 'auto',
        px: '4px',
        bgcolor: '#fff',
        borderRadius: '8px',
        border: '1px solid #F1F1F1',
        overflow: 'hidden',
      }}
    >
      <Stack
        direction="row"
        alignItems="center"
        spacing={1.5}
        onClick={() => setExpanded((prev) => !prev)}
        role="button"
        tabIndex={0}
        onKeyDown={(e: KeyboardEvent<HTMLElement>) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            setExpanded((ex) => !ex)
          }
        }}
        sx={{
          px: 1,
          py: '6px',
          cursor: 'pointer',
          userSelect: 'none',
          justifyContent: 'space-between',
          bgcolor: '#fff',
        }}
      >
        <Stack direction="row" spacing={1.5} alignItems="center" sx={{ flex: 1, minWidth: 0 }}>
          <Box sx={{ flexShrink: 0 }}>
            {headerBusy ?
              <ThinkingDotsHeader />
            : <Box sx={{ width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Check size={18} weight="bold" color="#2E7D32" aria-hidden />
              </Box>
            }
          </Box>
          <Typography
            variant="body2"
            sx={{
              flex: 1,
              minWidth: 0,
              fontWeight: 400,
              letterSpacing: '0.17px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            Thinking
          </Typography>
        </Stack>
        <Box sx={{ color: '#616161', display: 'flex', flexShrink: 0, transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform 160ms ease' }}>
          <CaretDown size={20} weight="bold" aria-hidden />
        </Box>
      </Stack>

      {expanded ?
        <>
          <Box sx={{ bgcolor: '#F8F8F8', borderTop: '1px solid #F1F1F1' }}>
            {nodes.map((node) => (
              <Box key={node.id}>
                <Stack
                  direction="row"
                  alignItems="center"
                  sx={{
                    px: 1,
                    py: '6px',
                    gap: 1,
                    bgcolor: '#F8F8F8',
                    borderBottom: '1px solid rgba(241,241,241,0.95)',
                  }}
                >
                  <StepRowIcon node={node} />
                  <Typography
                    variant="body2"
                    sx={{
                      flex: 1,
                      minWidth: 0,
                      fontWeight: 500,
                      letterSpacing: '0.1px',
                      lineHeight: 1.57,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {node.label}
                  </Typography>
                  <CaretDown size={20} weight="bold" aria-hidden style={{ color: '#9E9E9E', flexShrink: 0, opacity: 0.75 }} />
                </Stack>
                {slowRunning(node) && node.status === 'running' ?
                  <Box
                    sx={{
                      mx: 1,
                      mb: 0.5,
                      height: 3,
                      borderRadius: 1,
                      background: `linear-gradient(90deg, transparent, ${theme.palette.primary.light}, transparent)`,
                      backgroundSize: '200% 100%',
                      animation: `${shimmer} 1.8s linear infinite`,
                    }}
                  />
                : null}
                {node.subtitle ?
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', px: 1, pb: 0.5, pl: 4.5 }}>
                    {node.subtitle}
                    {node.status === 'done' && typeof node.durationMs === 'number' ?
                      ` · ${(node.durationMs / 1000).toFixed(1)}s`
                    : null}
                  </Typography>
                : node.status === 'done' && typeof node.durationMs === 'number' ?
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', px: 1, pb: 0.5, pl: 4.5 }}>
                    {`${(node.durationMs / 1000).toFixed(1)}s`}
                  </Typography>
                : null}
                <Box sx={{ px: 1, pb: 0.5, pl: 4.5 }}>
                  <DestructivePreviewCard node={node} onDestructiveChoice={onDestructiveChoice} />
                  {node.handoffPath ?
                    <Button
                      variant="text"
                      size="small"
                      onClick={(e: MouseEvent<HTMLElement>) => {
                        e.stopPropagation()
                        onNavigate(node.handoffPath!)
                      }}
                      sx={{ mt: 0.25, px: 0, fontSize: 13, fontWeight: 600 }}
                    >
                      {node.handoffLabel ?? 'Open →'}
                    </Button>
                  : null}
                </Box>
              </Box>
            ))}
          </Box>

          <Box sx={{ bgcolor: '#fff', px: 1, py: 1.5, borderTop: '1px solid #F1F1F1' }}>
            {pairedAssistant?.text ?
              <Box sx={{ '& p': { margin: 0, fontSize: 14, lineHeight: 1.43, letterSpacing: '0.17px' }, '& p+p': { mt: 1 }, '& ul': { pl: 2, my: 0.5 } }}>
                <Markdown>{pairedAssistant.text}</Markdown>
                {streamingCursor ?
                  <Box
                    component="span"
                    aria-hidden
                    sx={{
                      display: 'inline-block',
                      width: 6,
                      height: '1em',
                      ml: 0.25,
                      bgcolor: 'primary.main',
                      verticalAlign: 'text-bottom',
                      animation: `${blink} 1s steps(2, jump-none) infinite`,
                    }}
                  />
                : null}
              </Box>
            : streamingCursor ?
              <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.43 }}>
                Generating response…
              </Typography>
            : null}
          </Box>
        </>
      : null}
    </Box>
  )
}

function DestructivePreviewCard({
  node,
  onDestructiveChoice,
}: {
  node: TimelineNode
  onDestructiveChoice: (toolCallId: string, confirmed: boolean) => Promise<void>
}) {
  const toolCallId = node.id
  if (
    !node.preview ||
    !node.confirmation ||
    node.toolName === 'thinking' ||
    node.toolName === 'status'
  ) {
    return null
  }
  const pend = node.confirmation === 'pending'
  return (
    <Box
      onClick={(e: MouseEvent<HTMLElement>) => e.stopPropagation()}
      sx={{
        mt: 1,
        p: 1.5,
        borderRadius: 1,
        border: '1px solid',
        borderColor: 'divider',
        bgcolor: '#fffefb',
        borderLeft: '3px solid',
        borderLeftColor: 'error.main',
      }}
    >
      <Stack direction="row" spacing={1} alignItems="flex-start" sx={{ mb: 0.75 }}>
        <Icon name="warning" size="sm" sx={{ color: 'error.main', mt: '2px', flexShrink: 0 }} />
        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
          {node.preview.title}
        </Typography>
      </Stack>
      <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: 13 }}>
        {node.preview.impact}
      </Typography>
      <Stack direction="row" spacing={1} justifyContent="flex-end" sx={{ mt: 1.5 }}>
        <Button
          size="small"
          variant="text"
          disabled={!pend}
          onClick={(e: MouseEvent<HTMLElement>) => {
            e.stopPropagation()
            void onDestructiveChoice(toolCallId, false)
          }}
        >
          Cancel
        </Button>
        <Button
          size="small"
          variant="contained"
          color="error"
          disabled={!pend}
          onClick={(e: MouseEvent<HTMLElement>) => {
            e.stopPropagation()
            void onDestructiveChoice(toolCallId, true)
          }}
        >
          Confirm delete
        </Button>
      </Stack>
      {!pend && node.confirmationNote ?
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
          {node.confirmationNote}
        </Typography>
      : null}
    </Box>
  )
}

function slowRunning(node: TimelineNode): boolean {
  if (node.status !== 'running') return false
  return Date.now() - node.startedAt > 2000
}

const QUICK_ACTIONS = [
  {
    label: 'Duplicate Role',
    draft: 'Duplicate the role named ',
    Icon: CopySimple,
    iconColor: '#2e7d32',
  },
  {
    label: 'Add Agents to Role',
    draft: 'Add agents to the role named ',
    Icon: Users,
    iconColor: '#1565c0',
  },
  {
    label: 'Create Privilege',
    draft: 'Create a new privilege set named ',
    Icon: Target,
    iconColor: '#6a1b9a',
  },
  {
    label: 'Modify Privileges',
    draft: 'Help me modify privileges for the role named ',
    Icon: ListBullets,
    iconColor: '#ef6c00',
  },
] as const

function EmptyState({ onDraftLine }: { onDraftLine: (s: string) => void }) {
  return (
    <Stack
      spacing={2}
      alignItems="center"
      justifyContent="center"
      sx={{
        py: { xs: 2, sm: 4 },
        px: 0,
        textAlign: 'center',
        width: '100%',
        flex: 1,
        minHeight: 280,
      }}
    >
      <Box
        sx={{
          width: 48,
          height: 48,
          borderRadius: 1.5,
          position: 'relative',
          overflow: 'hidden',
          flexShrink: 0,
          border: '0.3px solid',
          borderColor: 'rgba(10,13,18,0.12)',
          background: 'linear-gradient(219deg, #394FB6 5.1%, #5E79D5 50.9%, #394FB6 96.3%)',
          boxShadow:
            '0px 1.5px 1.5px -0.5px rgba(10,13,18,0.13), 0px 1.5px 4.5px 0px rgba(10,13,18,0.10), inset 0px -0.75px 0.75px 0px rgba(10,13,18,0.10)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          '&::after': {
            content: '""',
            position: 'absolute',
            inset: 0,
            opacity: 0.12,
            backgroundImage:
              'repeating-linear-gradient(90deg, rgba(255,255,255,0.15) 0 1px, transparent 1px 8px), repeating-linear-gradient(0deg, rgba(255,255,255,0.15) 0 1px, transparent 1px 8px)',
          },
        }}
      >
        <Sparkle size={26} weight="fill" style={{ position: 'relative', zIndex: 1 }} color="#fff" aria-hidden />
      </Box>
      <Stack spacing={1} alignItems="center" sx={{ width: '100%' }}>
        <Stack spacing={0.5} alignItems="center">
          <Typography
            variant="body2"
            color="text.secondary"
            component="div"
            sx={{ fontWeight: 500, fontSize: '1rem', lineHeight: '16px' }}
          >
            <Box
              component="span"
              aria-hidden
              sx={{
                display: 'inline-block',
                mr: '0.35em',
                transformOrigin: '70% 70%',
                animation: `${waveHandOnce} 0.95s ease-in-out 1 forwards`,
              }}
            >
              👋
            </Box>
            Hi there
          </Typography>
          <Typography variant="title3" sx={{ color: 'primary.main', fontWeight: 600, fontSize: '18px', lineHeight: 1.6 }}>
            How can I help you?
          </Typography>
        </Stack>
        <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 260, letterSpacing: 0.17, lineHeight: 1.43 }}>
          Create or modify roles and privileges
        </Typography>
      </Stack>
      <Stack
        direction="row"
        flexWrap="wrap"
        useFlexGap
        spacing={1}
        justifyContent="center"
        sx={{ columnGap: 1, rowGap: 1, width: '100%' }}
      >
        {QUICK_ACTIONS.map(({ label, draft, Icon: PI, iconColor }) => (
          <Button
            key={label}
            type="button"
            variant="outlined"
            color="inherit"
            size="small"
            onClick={() => onDraftLine(draft)}
            sx={{
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '0.8125rem',
              bgcolor: '#fff',
              borderColor: '#E6E5E6',
              color: 'text.primary',
              borderRadius: '8px',
              py: '6px',
              px: '12px',
              boxShadow: '0px 1px 2px rgba(10, 13, 18, 0.13)',
              '&:hover': {
                bgcolor: '#fafafa',
                borderColor: '#d6d6d6',
              },
            }}
            startIcon={<PI size={16} weight="duotone" color={iconColor} aria-hidden />}
          >
            {label}
          </Button>
        ))}
      </Stack>
    </Stack>
  )
}
