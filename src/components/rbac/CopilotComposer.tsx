import {
  forwardRef,
  type SyntheticEvent,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react'
import Tab from '@mui/material/Tab'
import type { Theme } from '@mui/material/styles'
import {
  ArrowUp,
} from '@phosphor-icons/react'
import {
  Box,
  Divider,
  Icon,
  IconButton,
  InputBase,
  List,
  ListItemButton,
  Popover,
  Stack,
  Tabs,
  Typography,
} from '@exotel-npm-dev/signal-design-system'

import type { CopilotMentionPayload } from '../../types/copilot'

/** Mention chips tuned for lavender user bubble (aligns Campaign / RBAC Copilot specs). */
export const MENTION_PILL_SX = {
  display: 'inline-flex',
  alignItems: 'center',
  verticalAlign: 'baseline',
  backgroundColor: 'rgba(61, 52, 128, 0.08)',
  color: '#1A1A1A',
  border: '1px solid rgba(0, 0, 0, 0.08)',
  borderRadius: '4px',
  padding: '2px 6px',
  fontSize: '14px',
  lineHeight: 1.35,
  fontWeight: 600,
  whiteSpace: 'nowrap' as const,
  userSelect: 'none' as const,
  margin: '0 1px',
}

const INPUT_CARD_BORDER = '#E6E5E0'
const MAX_CHARS = 2000

type RoleRow = {
  id: string
  roleName: string
  scopeType: string
  assignedUserCount: number
}

type PsRow = {
  id: string
  privilegeSetName: string
  assignedRoleCount: number
  scopeType: string
}

type UserRow = {
  id: string
  displayName: string
  email: string | null
  branch: string | null
  source?: 'directory' | 'rbac_assignment'
}

function textLengthOfRoot(root: HTMLElement): number {
  return (root.innerText || '').length
}

export type UserMessageSegment =
  | { kind: 'text'; value: string }
  | ({ kind: 'mention' } & CopilotMentionPayload)

function walkSerialize(root: HTMLElement): {
  text: string
  mentions: CopilotMentionPayload[]
  segments: UserMessageSegment[]
} {
  const mentions: CopilotMentionPayload[] = []
  const segments: UserMessageSegment[] = []
  let text = ''
  let pending = ''

  const flushPending = () => {
    const raw = pending.replace(/\u200b/g, '')
    if (raw.length > 0) {
      segments.push({ kind: 'text', value: raw })
      text += pending
    }
    pending = ''
  }

  const walk = (node: Node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      pending += node.textContent ?? ''
      return
    }
    if (node.nodeType !== Node.ELEMENT_NODE) return
    const el = node as HTMLElement
    if (el.dataset.entityType && el.dataset.entityId) {
      flushPending()
      const label = (el.dataset.entityLabel || el.textContent || '').replace(/^\s*@\s*/, '').trim() || 'item'
      const entityType = el.dataset.entityType as CopilotMentionPayload['entityType']
      const m = { entityType, id: el.dataset.entityId, label }
      mentions.push(m)
      segments.push({ kind: 'mention', ...m })
      text += `@${label} `
      return
    }
    el.childNodes.forEach(walk)
  }
  root.childNodes.forEach(walk)
  flushPending()
  const clean = text.replace(/\u200b/g, '').replace(/\s+$/u, '')
  return {
    text: clean,
    mentions,
    segments,
  }
}

function createMentionSpan(m: CopilotMentionPayload): HTMLSpanElement {
  const span = document.createElement('span')
  span.contentEditable = 'false'
  span.dataset.entityType = m.entityType
  span.dataset.entityId = m.id
  span.dataset.entityLabel = m.label
  Object.assign(span.style, {
    display: 'inline-flex',
    alignItems: 'center',
    verticalAlign: 'baseline',
    backgroundColor: '#EEECFB',
    color: '#4B3FD6',
    border: '1px solid rgba(75, 63, 214, 0.22)',
    borderRadius: '4px',
    padding: '2px 6px',
    fontSize: '14px',
    lineHeight: '1.35',
    fontWeight: '500',
    whiteSpace: 'nowrap',
    userSelect: 'none',
    margin: '0 1px',
  })
  span.textContent = `@${m.label}`
  return span
}

function insertAtCaret(root: HTMLElement, node: Node) {
  root.focus()
  const sel = window.getSelection()
  if (!sel || sel.rangeCount === 0) {
    root.appendChild(node)
    const z = document.createTextNode('\u200b')
    root.appendChild(z)
    return
  }
  const r = sel.getRangeAt(0)
  if (!root.contains(r.commonAncestorContainer)) {
    root.appendChild(node)
    const z = document.createTextNode('\u200b')
    root.appendChild(z)
    return
  }
  r.deleteContents()
  r.insertNode(node)
  r.setStartAfter(node)
  r.collapse(true)
  sel.removeAllRanges()
  sel.addRange(r)
  const z = document.createTextNode('\u200b')
  r.insertNode(z)
  r.setStartAfter(z)
  r.collapse(true)
  sel.removeAllRanges()
  sel.addRange(r)
}

function useDebounced<T>(value: T, ms: number): T {
  const [d, setD] = useState(value)
  useEffect(() => {
    const t = window.setTimeout(() => setD(value), ms)
    return () => clearTimeout(t)
  }, [value, ms])
  return d
}

export type CopilotComposerHandle = {
  focus: () => void
  clear: () => void
  openMentionPicker: () => void
  appendPlainText: (chunk: string) => void
  getPayload: () => { text: string; mentions: CopilotMentionPayload[]; segments: UserMessageSegment[] }
}

type CopilotComposerProps = {
  disabled?: boolean
  onPayloadChange?: (len: number) => void
  onSubmit?: () => void
}

export const CopilotComposer = forwardRef<CopilotComposerHandle, CopilotComposerProps>(
  function CopilotComposer({ disabled, onPayloadChange, onSubmit }, ref) {
    const rootRef = useRef<HTMLDivElement | null>(null)
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
    const [tab, setTab] = useState(0)
    const [q, setQ] = useState('')
    const debouncedQ = useDebounced(q, 200)
    const [hl, setHl] = useState(0)
    const [roles, setRoles] = useState<RoleRow[]>([])
    const [pss, setPss] = useState<PsRow[]>([])
    const [users, setUsers] = useState<UserRow[]>([])
    const [len, setLen] = useState(0)
    const listRef = useRef<HTMLDivElement | null>(null)

    const popoverOpen = Boolean(anchorEl)

    const loadLists = useCallback(async () => {
      try {
        const [r1, r2] = await Promise.all([fetch('/api/roles'), fetch('/api/privilege-sets')])
        if (r1.ok) setRoles((await r1.json()) as RoleRow[])
        if (r2.ok) setPss((await r2.json()) as PsRow[])
      } catch {
        /* ignore */
      }
    }, [])

    useEffect(() => {
      void loadLists()
    }, [loadLists])

    useEffect(() => {
      if (!popoverOpen) return
      const run = async () => {
        try {
          const res = await fetch(`/api/users?q=${encodeURIComponent(debouncedQ)}`)
          if (res.ok) setUsers((await res.json()) as UserRow[])
        } catch {
          setUsers([])
        }
      }
      void run()
    }, [debouncedQ, popoverOpen])

    const filteredRoles = useMemo(() => {
      const s = debouncedQ.trim().toLowerCase()
      if (!s) return roles
      return roles.filter(
        (r) =>
          r.roleName.toLowerCase().includes(s) ||
          r.id.toLowerCase().includes(s) ||
          r.scopeType.toLowerCase().includes(s),
      )
    }, [roles, debouncedQ])

    const filteredPs = useMemo(() => {
      const s = debouncedQ.trim().toLowerCase()
      if (!s) return pss
      return pss.filter(
        (p) =>
          p.privilegeSetName.toLowerCase().includes(s) ||
          p.id.toLowerCase().includes(s) ||
          p.scopeType.toLowerCase().includes(s),
      )
    }, [pss, debouncedQ])

    const rows = tab === 0 ? filteredRoles : tab === 1 ? filteredPs : users

    const syncLen = useCallback(() => {
      const el = rootRef.current
      if (!el) return
      const n = textLengthOfRoot(el)
      setLen(n)
      onPayloadChange?.(n)
    }, [onPayloadChange])

    const enforceLimit = useCallback(() => {
      const el = rootRef.current
      if (!el) return
      while (textLengthOfRoot(el) > MAX_CHARS) {
        const last = el.lastChild
        if (!last) break
        el.removeChild(last)
      }
      syncLen()
    }, [syncLen])

    const getPayload = useCallback(() => {
      const el = rootRef.current
      if (!el) return { text: '', mentions: [] as CopilotMentionPayload[], segments: [] as UserMessageSegment[] }
      return walkSerialize(el)
    }, [])

    const clear = useCallback(() => {
      const el = rootRef.current
      if (el) el.innerHTML = ''
      setLen(0)
      onPayloadChange?.(0)
    }, [onPayloadChange])

    const focus = useCallback(() => {
      rootRef.current?.focus()
    }, [])

    const openPicker = useCallback((el: HTMLElement | null) => {
      setAnchorEl(el ?? rootRef.current)
      setQ('')
      setHl(0)
      setTab(0)
    }, [])

    const appendPlainText = useCallback(
      (chunk: string) => {
        const el = rootRef.current
        if (!el || disabled) return
        const t = document.createTextNode(chunk)
        insertAtCaret(el, t)
        enforceLimit()
        syncLen()
      },
      [disabled, enforceLimit, syncLen],
    )

    useImperativeHandle(
      ref,
      () => ({
        focus,
        clear,
        openMentionPicker: () => openPicker(rootRef.current),
        appendPlainText,
        getPayload,
      }),
      [appendPlainText, clear, focus, getPayload, openPicker],
    )

    const insertMention = useCallback(
      (m: CopilotMentionPayload) => {
        const el = rootRef.current
        if (!el || disabled) return
        const span = createMentionSpan(m)
        insertAtCaret(el, span)
        setAnchorEl(null)
        enforceLimit()
        syncLen()
      },
      [disabled, enforceLimit, syncLen],
    )

    const onInput = () => {
      enforceLimit()
      syncLen()
      const el = rootRef.current
      if (!el) return
      const sel = window.getSelection()
      if (!sel || sel.rangeCount === 0) return
      const r = sel.getRangeAt(0)
      if (!r.collapsed) return
      let n: Node | null = r.startContainer
      if (n.nodeType === Node.ELEMENT_NODE) {
        const ele = n as HTMLElement
        if (ele.isContentEditable === false) return
      }
      if (n.nodeType === Node.TEXT_NODE) {
        const t = n.textContent ?? ''
        const i = r.startOffset
        if (i > 0 && t[i - 1] === '@') {
          openPicker(el)
        }
      }
    }

    const onKeyDown = (e: React.KeyboardEvent) => {
      if (popoverOpen) {
        if (e.key === 'Escape') {
          e.preventDefault()
          setAnchorEl(null)
          return
        }
        if (e.key === 'ArrowDown') {
          e.preventDefault()
          setHl((h) => Math.min(h + 1, Math.max(0, rows.length - 1)))
          return
        }
        if (e.key === 'ArrowUp') {
          e.preventDefault()
          setHl((h) => Math.max(0, h - 1))
          return
        }
        if (e.key === 'Enter') {
          e.preventDefault()
          const pick = rows[hl]
          if (!pick) return
          if (tab === 0) {
            insertMention({
              entityType: 'role',
              id: (pick as RoleRow).id,
              label: (pick as RoleRow).roleName,
            })
          } else if (tab === 1) {
            insertMention({
              entityType: 'privilege_set',
              id: (pick as PsRow).id,
              label: (pick as PsRow).privilegeSetName,
            })
          } else {
            insertMention({
              entityType: 'user',
              id: (pick as UserRow).id,
              label: (pick as UserRow).displayName,
            })
          }
        }
      } else if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        onSubmit?.()
      }
    }

    useEffect(() => {
      setHl(0)
    }, [tab, debouncedQ, rows.length])

    const nearLimit = len > MAX_CHARS - 50
    const canSend = len > 0 && len <= MAX_CHARS && !disabled

    return (
      <Stack spacing={1} sx={{ width: '100%', maxWidth: 700, mx: 'auto' }}>
        <Box
          sx={{
            border: `1px solid ${INPUT_CARD_BORDER}`,
            borderRadius: '10px',
            bgcolor: 'background.paper',
            p: 1.25,
            minHeight: 120,
            maxHeight: 200,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Box
            ref={rootRef}
            contentEditable={!disabled}
            suppressContentEditableWarning
            onInput={onInput}
            onKeyDown={onKeyDown}
            data-placeholder="Ask me anything... (Ctrl +K)"
            sx={(theme: Theme) => ({
              flex: 1,
              overflowY: 'auto',
              minHeight: 48,
              maxHeight: 110,
              outline: 'none',
              fontFamily: theme.typography.fontFamily,
              fontSize: theme.typography.body2.fontSize,
              lineHeight: 1.45,
              letterSpacing: 0.17,
              color: 'text.primary',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              '&:empty::before': {
                content: 'attr(data-placeholder)',
                color: theme.palette.text.disabled,
                pointerEvents: 'none',
              },
            })}
          />
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 1, flexWrap: 'wrap' }}>
            <IconButton
              size="small"
              variant="outlined"
              aria-label="Insert mention"
              disabled={disabled}
              onClick={() => openPicker(rootRef.current)}
            >
              <Icon name="at" size="sm" />
            </IconButton>
            <Box sx={{ flex: 1 }} />
            <Typography
              variant="body2"
              sx={{
                fontSize: 12,
                color: nearLimit ? 'error.main' : 'text.disabled',
              }}
            >
              {len}/{MAX_CHARS}
            </Typography>
            <Box
              component="button"
              type="button"
              aria-label="Send message"
              disabled={!canSend}
              sx={(theme: Theme) => ({
                width: 32,
                height: 32,
                flexShrink: 0,
                border: 'none',
                borderRadius: '8px',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: canSend ? 'pointer' : 'default',
                bgcolor: theme.palette.primary.main,
                color: '#fff',
                opacity: canSend ? 1 : 0.32,
              })}
              onClick={() => onSubmit?.()}
            >
              <ArrowUp size={18} weight="bold" aria-hidden />
            </Box>
          </Stack>
        </Box>

        <Popover
          open={popoverOpen}
          anchorEl={anchorEl}
          onClose={() => setAnchorEl(null)}
          anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
          transformOrigin={{ vertical: 'bottom', horizontal: 'left' }}
          slotProps={{
            paper: {
              sx: {
                mt: -1,
                width: 320,
                maxHeight: 340,
                display: 'flex',
                flexDirection: 'column',
              },
            },
          }}
        >
          <Tabs value={tab} onChange={(_e: SyntheticEvent, v: number) => setTab(v)} variant="fullWidth" sx={{ minHeight: 40 }}>
            <Tab label="Roles" sx={{ minHeight: 40, py: 0, fontSize: 13 }} />
            <Tab label="Privilege Sets" sx={{ minHeight: 40, py: 0, fontSize: 13 }} />
            <Tab label="Users" sx={{ minHeight: 40, py: 0, fontSize: 13 }} />
          </Tabs>
          <Divider />
          <InputBase
            placeholder="Search…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            sx={{ px: 1.5, py: 1, fontSize: 14 }}
            fullWidth
            autoFocus
          />
          <Divider />
          <List dense ref={listRef} sx={{ overflow: 'auto', py: 0 }}>
            {tab === 0 &&
              filteredRoles.map((row, idx) => (
                <ListItemButton
                  key={row.id}
                  selected={hl === idx}
                  onClick={() =>
                    insertMention({ entityType: 'role', id: row.id, label: row.roleName })
                  }
                >
                  <Box sx={{ mr: 1, width: 28, display: 'flex', justifyContent: 'center', color: 'text.secondary' }}>
                    <Typography variant="body2">◆</Typography>
                  </Box>
                  <Stack spacing={0.25} sx={{ minWidth: 0 }}>
                    <Typography variant="body2" noWrap sx={{ fontWeight: 600 }}>
                      {row.roleName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" noWrap>
                      {row.scopeType} · {row.assignedUserCount} users
                    </Typography>
                  </Stack>
                </ListItemButton>
              ))}
            {tab === 1 &&
              filteredPs.map((row, idx) => (
                <ListItemButton
                  key={row.id}
                  selected={hl === idx}
                  onClick={() =>
                    insertMention({
                      entityType: 'privilege_set',
                      id: row.id,
                      label: row.privilegeSetName,
                    })
                  }
                >
                  <Box sx={{ mr: 1, width: 28, display: 'flex', justifyContent: 'center', color: 'text.secondary' }}>
                    <Typography variant="body2">◎</Typography>
                  </Box>
                  <Stack spacing={0.25} sx={{ minWidth: 0 }}>
                    <Typography variant="body2" noWrap sx={{ fontWeight: 600 }}>
                      {row.privilegeSetName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" noWrap>
                      {row.scopeType} · on {row.assignedRoleCount} roles
                    </Typography>
                  </Stack>
                </ListItemButton>
              ))}
            {tab === 2 &&
              users.map((row, idx) => (
                <ListItemButton
                  key={row.id}
                  selected={hl === idx}
                  onClick={() =>
                    insertMention({ entityType: 'user', id: row.id, label: row.displayName })
                  }
                >
                  <Box sx={{ mr: 1 }}>
                    <Box
                      sx={{
                        width: 28,
                        height: 28,
                        borderRadius: '50%',
                        bgcolor: 'action.hover',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 12,
                      }}
                    >
                      {row.displayName.slice(0, 1).toUpperCase()}
                    </Box>
                  </Box>
                  <Stack spacing={0.25} sx={{ minWidth: 0 }}>
                    <Typography variant="body2" noWrap sx={{ fontWeight: 600 }}>
                      {row.displayName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" noWrap>
                      {row.email || (row.source === 'rbac_assignment' ? 'On role roster' : '—')}
                      {row.branch ? ` · ${row.branch}` : ''}
                    </Typography>
                  </Stack>
                </ListItemButton>
              ))}
            {rows.length === 0 ? (
              <Box sx={{ px: 2, py: 2 }}>
                <Typography variant="caption" color="text.secondary">
                  No matches
                </Typography>
              </Box>
            ) : null}
          </List>
        </Popover>
      </Stack>
    )
  },
)
