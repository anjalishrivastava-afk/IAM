import { useState } from 'react'
import type { Theme } from '@mui/material/styles'
import { alpha } from '@mui/material/styles'
import {
  Box,
  Button,
  Card,
  Chip,
  Icon,
  Link,
  Stack,
  Typography,
} from '@exotel-npm-dev/signal-design-system'
import { useOnboarding } from '../context/OnboardingContext'

// ─── Nav items ────────────────────────────────────────────────────────────────

const NAV_ITEMS = [
  { id: 'overview',          label: 'Overview',          icon: 'house',      live: false },
  { id: 'agent-activity',    label: 'Agent Activity',    icon: 'headset',    live: true  },
  { id: 'group-activity',    label: 'Group Activity',    icon: 'users',      live: true  },
  { id: 'agent-performance', label: 'Agent Performance', icon: 'chart-line', live: false },
  { id: 'group-performance', label: 'Group Performance', icon: 'chart-bar',  live: false },
]

// ─── Static content data ──────────────────────────────────────────────────────

const SUGGESTED_CHIPS = [
  { label: 'Show my current queue',        bg: 'success.main' },
  { label: 'How many calls did I handle?', bg: 'info.main'    },
  { label: 'View my CSAT score',           bg: 'primary.main' },
  { label: 'Put me on break',              bg: 'warning.main' },
  { label: 'Transfer a call',              bg: 'info.light'   },
  { label: 'View my schedule',             bg: 'primary.dark' },
]

const QUICK_ACCESS_ITEMS = [
  { id: 'queue',       icon: 'list-bullets', title: 'My Queue',        subtitle: 'View and accept waiting customers'     },
  { id: 'contact',     icon: 'phone',        title: 'Contact Centre',  subtitle: 'Go to your live interaction workspace' },
  { id: 'schedule',    icon: 'calendar',     title: 'My Schedule',     subtitle: 'Shifts, breaks, and upcoming tasks'    },
  { id: 'performance', icon: 'chart-line',   title: 'My Performance',  subtitle: 'CSAT, handle time, and daily targets'  },
]

const METRICS_ROW1 = ['Call Volume', 'Completed Calls', 'Abandoned in IVR', 'Abandoned in Queue', 'Agent Unanswered']
const METRICS_ROW2 = ['Avg. Talk Time', 'Avg. Queue Time', 'Longest Queue Time', 'Avg. Abandon Time', 'Avg. Speed of Answer']

type InteractionTag = 'Voice' | 'Chat' | 'WhatsApp'
const TAG_COLOR: Record<InteractionTag, 'primary' | 'success' | 'secondary'> = {
  Voice: 'primary', Chat: 'success', WhatsApp: 'secondary',
}

const QUEUE_ITEMS = [
  { id: 'q1', icon: 'phone', title: 'Rahul Sharma',  tag: 'Voice'    as InteractionTag, description: 'Waiting 2m 14s — Billing enquiry about recent invoice'   },
  { id: 'q2', icon: 'chat',  title: 'Priya Nair',    tag: 'Chat'     as InteractionTag, description: 'Waiting 0m 48s — Product support request, high priority' },
  { id: 'q3', icon: 'chats', title: 'Amit Verma',    tag: 'WhatsApp' as InteractionTag, description: 'Waiting 4m 01s — Order tracking question'                },
  { id: 'q4', icon: 'phone', title: 'Sneha Rao',     tag: 'Voice'    as InteractionTag, description: 'Waiting 1m 22s — Account reset assistance needed'        },
  { id: 'q5', icon: 'chat',  title: 'Karan Mehta',   tag: 'Chat'     as InteractionTag, description: 'Waiting 3m 07s — Technical issue with login'             },
  { id: 'q6', icon: 'chats', title: 'Deepa Pillai',  tag: 'WhatsApp' as InteractionTag, description: 'Waiting 5m 22s — Delivery status update request'         },
]

const CHECKLIST = [
  { label: 'Set your status to Online',           time: '1 min' },
  { label: "Review today's queue and priorities", time: '2 min' },
  { label: 'Check your performance targets',      time: '3 min' },
  { label: 'Complete your first interaction',     time: '5 min' },
]

const DEFAULT_RECS = ['Handle Voice calls first', 'Review CSAT feedback']
const MAX_CHARS = 250

const CARD_SX = {
  borderRadius: 2,
  border: '1px solid',
  borderColor: 'divider',
  bgcolor: '#F1F1F1',
  overflow: 'hidden',
} as const

// ─── Left sidebar ─────────────────────────────────────────────────────────────

function AgentSidebar({
  active,
  onSelect,
}: {
  active: string
  onSelect: (id: string) => void
}) {
  return (
    <Box
      sx={{
        width: 230, flexShrink: 0,
        bgcolor: 'background.paper',
        borderRight: '1px solid', borderColor: 'divider',
        overflowY: 'auto',
        display: 'flex', flexDirection: 'column',
        py: 1.5, px: 1,
      }}
    >
      {NAV_ITEMS.map((item) => {
        const isActive = active === item.id
        return (
          <Box
            key={item.id}
            onClick={() => onSelect(item.id)}
            sx={(theme: Theme) => ({
              display: 'flex', alignItems: 'center', gap: 1,
              px: 1.5, py: 0.875, borderRadius: 1.5,
              cursor: 'pointer', mb: 0.25,
              bgcolor: isActive ? alpha(theme.palette.primary.main, 0.08) : 'transparent',
              color: isActive ? 'primary.main' : 'text.secondary',
              transition: 'background-color 0.15s',
              '&:hover': {
                bgcolor: alpha(theme.palette.primary.main, isActive ? 0.08 : 0.04),
              },
            })}
          >
            <Box sx={{ display: 'flex', flexShrink: 0 }}>
              <Icon name={item.icon} size="sm" />
            </Box>
            <Typography
              sx={{
                fontSize: 14,
                fontWeight: isActive ? 600 : 400,
                color: 'inherit',
                flex: 1,
                lineHeight: 1.4,
              }}
            >
              {item.label}
            </Typography>
            {item.live && (
              <Box
                sx={{
                  px: 0.75, py: '2px',
                  borderRadius: '4px',
                  bgcolor: '#EEF2FF',
                  color: '#3B5BDB',
                  fontSize: 10, fontWeight: 700,
                  letterSpacing: '0.04em',
                  lineHeight: '14px',
                  flexShrink: 0,
                }}
              >
                LIVE
              </Box>
            )}
          </Box>
        )
      })}
    </Box>
  )
}

// ─── 1. AI section ────────────────────────────────────────────────────────────

function AiSection({ firstName }: { firstName: string }) {
  const [query, setQuery] = useState('')
  const canSend = query.trim().length > 0

  return (
    <Box sx={{ maxWidth: 580, mx: 'auto', textAlign: 'center', pt: '60px', pb: '36px' }}>
      <Typography sx={{ fontSize: 18, fontWeight: 500, color: 'text.secondary', mb: 0.75 }}>
        Hi{' '}
        <Box component="span" sx={{ color: 'primary.main', fontWeight: 600 }}>
          {firstName || 'there'}
        </Box>{' '}
        👋
      </Typography>
      <Typography
        sx={{
          fontWeight: 700, fontSize: { xs: '1.4rem', md: '1.65rem' },
          letterSpacing: '-0.02em', lineHeight: 1.2, color: 'text.primary', mb: 2.5,
        }}
      >
        I'm your AI Workspace Assistant
      </Typography>

      <Box
        sx={(theme: Theme) => ({
          bgcolor: 'background.paper',
          border: '1.5px solid', borderColor: theme.palette.divider,
          borderRadius: 2, overflow: 'hidden', textAlign: 'left', mb: 2,
          transition: 'border-color 0.15s',
          '&:focus-within': { borderColor: theme.palette.primary.main },
        })}
      >
        <Box
          component="textarea"
          value={query}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
            if (e.target.value.length <= MAX_CHARS) setQuery(e.target.value)
          }}
          placeholder="Ask me anything… e.g. Show my queue, transfer a call, view my stats..."
          rows={2}
          sx={{
            width: '100%', border: 'none', outline: 'none', resize: 'none',
            px: 2, pt: 2, pb: 1, fontSize: 14, lineHeight: 1.6,
            fontFamily: 'inherit', bgcolor: 'transparent', color: 'text.primary', display: 'block',
            '&::placeholder': { color: 'text.disabled' },
          }}
        />
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ px: 1.5, py: 1 }}>
          <Stack direction="row" spacing={0.5}>
            {(['paperclip', 'at'] as const).map((name) => (
              <Box
                key={name}
                component="button"
                sx={{
                  width: 30, height: 30, borderRadius: 1, border: '1px solid', borderColor: 'divider',
                  bgcolor: 'background.paper', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', color: 'text.secondary', '&:hover': { bgcolor: 'action.hover' },
                }}
              >
                <Icon name={name} size="sm" />
              </Box>
            ))}
          </Stack>
          <Stack direction="row" alignItems="center" spacing={1.25}>
            <Typography variant="caption" sx={{ color: 'text.disabled' }}>{query.length}/{MAX_CHARS}</Typography>
            <Box
              component="button"
              onClick={() => {}}
              sx={(theme: Theme) => ({
                width: 30, height: 30, borderRadius: 1, border: 'none',
                cursor: canSend ? 'pointer' : 'default',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                bgcolor: canSend ? theme.palette.primary.main : theme.palette.action.disabledBackground,
                color: canSend ? '#fff' : theme.palette.text.disabled,
                transition: 'background-color 0.15s',
              })}
            >
              <Icon name="arrow-up" size="sm" />
            </Box>
          </Stack>
        </Stack>
      </Box>

      <Stack direction="row" flexWrap="wrap" justifyContent="center" sx={{ gap: 1 }}>
        {SUGGESTED_CHIPS.map(({ label, bg }) => (
          <Chip
            key={label}
            label={label}
            size="small"
            onClick={() => setQuery(label)}
            icon={<Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: bg, flexShrink: 0, ml: '8px !important' }} />}
            sx={{
              bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider',
              color: 'text.primary', fontWeight: 500, fontSize: 12, cursor: 'pointer', height: 28,
              '& .MuiChip-icon': { mr: 0 }, '&:hover': { bgcolor: 'action.hover' },
            }}
          />
        ))}
      </Stack>
    </Box>
  )
}

// ─── 2. Live Calls + Live Agent Status ────────────────────────────────────────

function DonutChart() {
  const r = 45, cx = 60, cy = 60, sw = 14
  const circ = 2 * Math.PI * r
  const availLen = circ * (21 / 28)
  const offLen   = circ - availLen

  return (
    <Box sx={{ position: 'relative', width: 120, height: 120, mx: 'auto' }}>
      <svg width="120" height="120" style={{ display: 'block' }}>
        <g transform={`rotate(-90 ${cx} ${cy})`}>
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="#E5E7EB" strokeWidth={sw} />
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="#22C55E" strokeWidth={sw}
            strokeDasharray={`${availLen} ${circ}`} strokeLinecap="butt" />
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="#6B7280" strokeWidth={sw}
            strokeDasharray={`${offLen} ${circ}`} strokeDashoffset={-availLen} strokeLinecap="butt" />
        </g>
      </svg>
      <Box sx={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <Box sx={{ color: 'text.secondary', display: 'flex', mb: 0.25 }}><Icon name="users" size="sm" /></Box>
        <Typography sx={{ fontWeight: 700, fontSize: 20, lineHeight: 1.1, color: 'text.primary' }}>28</Typography>
        <Typography sx={{ fontSize: 10, color: 'text.secondary', textAlign: 'center' }}>Total Agents</Typography>
      </Box>
    </Box>
  )
}

function LiveSection() {
  return (
    <Box sx={{ mb: 4 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
        <Typography sx={{ fontWeight: 700, fontSize: 18, color: 'text.primary' }}>Live Overview</Typography>
        <Box
          sx={{
            display: 'inline-flex', alignItems: 'center', gap: 0.5,
            px: 1.5, py: 0.75, border: '1px solid', borderColor: 'divider',
            borderRadius: 1, bgcolor: 'background.paper', cursor: 'pointer',
            '&:hover': { bgcolor: 'action.hover' },
          }}
        >
          <Typography sx={{ fontSize: 13, fontWeight: 500, color: 'text.primary' }}>All Calls</Typography>
          <Box sx={{ color: 'text.secondary', display: 'flex' }}><Icon name="caret-down" size="sm" /></Box>
        </Box>
      </Stack>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
        {/* Live Calls */}
        <Box sx={{ ...CARD_SX, borderRadius: 2, p: 2.5 }}>
          <Stack direction="row" alignItems="center" spacing={0.75} sx={{ mb: 2.5 }}>
            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#22C55E', flexShrink: 0 }} />
            <Typography sx={{ fontWeight: 600, fontSize: 14 }}>Live Calls</Typography>
          </Stack>

          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.25 }}>
            <Box sx={{ color: 'text.secondary', display: 'flex' }}><Icon name="phone" size="sm" /></Box>
            <Typography sx={{ fontSize: 13, fontWeight: 500, color: 'text.primary' }}>Incoming On Call Flow</Typography>
          </Stack>
          {[{ label: 'In Progress:', v: 0 }, { label: 'In Queue:', v: 0 }].map(({ label, v }) => (
            <Stack key={label} direction="row" alignItems="center" sx={{ pl: 4, mb: 0.75 }}>
              <Stack direction="row" alignItems="center" spacing={0.5} sx={{ flex: 1 }}>
                <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#22C55E', flexShrink: 0 }} />
                <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>{label}</Typography>
              </Stack>
              <Typography sx={{ fontSize: 13, fontWeight: 600, color: 'text.primary' }}>{v}</Typography>
            </Stack>
          ))}

          <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 2, mb: 1.25 }}>
            <Box sx={{ color: 'text.secondary', display: 'flex' }}><Icon name="phone" size="sm" /></Box>
            <Typography sx={{ fontSize: 13, fontWeight: 500, color: 'text.primary' }}>Outgoing</Typography>
          </Stack>
          <Stack direction="row" alignItems="center" sx={{ pl: 4, mb: 0.75 }}>
            <Stack direction="row" alignItems="center" spacing={0.5} sx={{ flex: 1 }}>
              <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#3B82F6', flexShrink: 0 }} />
              <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>In Progress:</Typography>
            </Stack>
            <Typography sx={{ fontSize: 13, fontWeight: 600, color: 'text.primary' }}>0</Typography>
          </Stack>

          <Box sx={{ textAlign: 'center', mt: 3 }}>
            <Typography sx={{ fontWeight: 700, fontSize: 28, color: 'text.primary', lineHeight: 1.2 }}>0</Typography>
            <Typography sx={{ fontSize: 13, color: 'text.secondary', mt: 0.25 }}>Total Calls</Typography>
          </Box>
        </Box>

        {/* Live Agent Status */}
        <Box sx={{ ...CARD_SX, borderRadius: 2, p: 2.5 }}>
          <Stack direction="row" alignItems="center" spacing={0.75} sx={{ mb: 3 }}>
            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#22C55E', flexShrink: 0 }} />
            <Typography sx={{ fontWeight: 600, fontSize: 14 }}>Live Agent Status</Typography>
          </Stack>

          <DonutChart />

          <Stack spacing={1} sx={{ mt: 3 }}>
            {[
              { color: '#EF4444', label: 'Busy',     value: 0  },
              { color: '#22C55E', label: 'Available', value: 21 },
              { color: '#6B7280', label: 'Offline',   value: 7  },
            ].map(({ color, label, value }) => (
              <Stack key={label} direction="row" alignItems="center">
                <Stack direction="row" alignItems="center" spacing={0.75} sx={{ flex: 1 }}>
                  <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: color, flexShrink: 0 }} />
                  <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>{label}:</Typography>
                </Stack>
                <Typography sx={{ fontSize: 13, fontWeight: 600, color: 'text.primary' }}>{value}</Typography>
              </Stack>
            ))}
          </Stack>
        </Box>
      </Box>
    </Box>
  )
}

// ─── 3. Today's Activity ──────────────────────────────────────────────────────

function TodaysActivity() {
  const [activityTab, setActivityTab] = useState('incoming')

  return (
    <Box sx={{ mb: 4 }}>
      <Typography sx={{ fontWeight: 700, fontSize: 18, mb: 2, color: 'text.primary' }}>Today's Activity</Typography>
      <Box sx={{ ...CARD_SX, borderRadius: 2 }}>
        {/* Header */}
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ px: 2.5, pt: 2, pb: 1 }}>
          <Stack direction="row" spacing={0}>
            {[
              { id: 'incoming', label: 'Incoming On Call Flow' },
              { id: 'outgoing', label: 'Outgoing' },
            ].map((t) => (
              <Box
                key={t.id}
                onClick={() => setActivityTab(t.id)}
                sx={{
                  py: 1, pr: 2.5, cursor: 'pointer', fontSize: 13,
                  fontWeight: activityTab === t.id ? 600 : 400,
                  color: activityTab === t.id ? 'primary.main' : 'text.secondary',
                  borderBottom: activityTab === t.id ? '2px solid' : '2px solid transparent',
                  borderColor: activityTab === t.id ? 'primary.main' : 'transparent',
                  userSelect: 'none', '&:hover': { color: 'primary.main' },
                }}
              >
                {t.label}
              </Box>
            ))}
          </Stack>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>last updated 28 minutes ago</Typography>
            <Box sx={{ color: 'text.secondary', display: 'flex', cursor: 'pointer' }}>
              <Icon name="arrows-clockwise" size="sm" />
            </Box>
          </Stack>
        </Stack>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', px: 2.5, pb: 1 }}>
          <Stack direction="row" alignItems="center" spacing={0.5} sx={{ cursor: 'pointer' }}>
            <Typography sx={{ fontSize: 13, color: 'primary.main', fontWeight: 500 }}>Today so far</Typography>
            <Box sx={{ color: 'primary.main', display: 'flex' }}><Icon name="caret-down" size="sm" /></Box>
          </Stack>
        </Box>

        {/* Metrics row 1 */}
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', borderTop: '1px solid', borderColor: 'divider' }}>
          {METRICS_ROW1.map((m, i) => (
            <Box key={m} sx={{ px: 3, py: 2.5, borderRight: i < 4 ? '1px solid' : 'none', borderColor: 'divider' }}>
              <Typography sx={{ fontSize: 12, color: 'text.secondary', mb: 0.5 }}>{m}</Typography>
              <Typography sx={{ fontSize: 20, fontWeight: 700, color: 'text.primary', lineHeight: 1.2, mb: 0.25 }}>N/A</Typography>
              <Typography sx={{ fontSize: 12, color: 'primary.main', mb: 0.1 }}>N/A change</Typography>
              <Typography sx={{ fontSize: 12, color: 'text.disabled' }}>N/A prev. day</Typography>
            </Box>
          ))}
        </Box>

        {/* Metrics row 2 */}
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', borderTop: '1px solid', borderColor: 'divider' }}>
          {METRICS_ROW2.map((m, i) => (
            <Box key={m} sx={{ px: 3, py: 2.5, borderRight: i < 4 ? '1px solid' : 'none', borderColor: 'divider' }}>
              <Typography sx={{ fontSize: 12, color: 'text.secondary', mb: 0.5 }}>{m}</Typography>
              <Typography sx={{ fontSize: 20, fontWeight: 700, color: 'text.primary', lineHeight: 1.2, mb: 0.25 }}>N/A</Typography>
              <Typography sx={{ fontSize: 12, color: 'primary.main', mb: 0.1 }}>N/A change</Typography>
              <Typography sx={{ fontSize: 12, color: 'text.disabled' }}>N/A prev. day</Typography>
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  )
}

// ─── 4. Quick Access ──────────────────────────────────────────────────────────

function QuickAccessSection() {
  return (
    <Box sx={{ mb: 4 }}>
      <Typography sx={{ fontWeight: 700, fontSize: 18, mb: 2, color: 'text.primary' }}>Quick Access</Typography>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
        {QUICK_ACCESS_ITEMS.map(({ id, icon, title, subtitle }) => (
          <Card
            key={id}
            elevation={0}
            sx={{ ...CARD_SX, cursor: 'pointer', transition: 'box-shadow 0.15s', '&:hover': { boxShadow: 2 } }}
          >
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ p: 2.5 }}>
              <Stack direction="row" alignItems="center" spacing={1.5}>
                <Box
                  sx={(theme: Theme) => ({
                    width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
                    bgcolor: alpha(theme.palette.primary.main, 0.10),
                    display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'primary.main',
                  })}
                >
                  <Icon name={icon} size="sm" />
                </Box>
                <Box>
                  <Typography sx={{ fontWeight: 600, fontSize: 15, color: 'text.primary', lineHeight: 1.3 }}>
                    {title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">{subtitle}</Typography>
                </Box>
              </Stack>
              <Button
                variant="outlined" color="neutral" size="small"
                endIcon={<Icon name="arrow-right" size="sm" />}
                sx={{ textTransform: 'none', fontWeight: 500, flexShrink: 0 }}
              >
                Explore
              </Button>
            </Stack>
          </Card>
        ))}
      </Box>
    </Box>
  )
}

// ─── 5. My Queue ──────────────────────────────────────────────────────────────

function MyQueueSection() {
  return (
    <Box sx={{ mb: 4 }}>
      <Typography sx={{ fontWeight: 700, fontSize: 18, mb: 2, color: 'text.primary' }}>My Queue</Typography>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, gap: 2 }}>
        {QUEUE_ITEMS.map(({ id, icon, title, tag, description }) => (
          <Card
            key={id}
            elevation={0}
            sx={{ ...CARD_SX, cursor: 'pointer', transition: 'box-shadow 0.15s', '&:hover': { boxShadow: 2 } }}
          >
            <Box sx={{ p: 2.5 }}>
              <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.25 }}>
                <Stack direction="row" alignItems="center" spacing={1.25}>
                  <Box
                    sx={(theme: Theme) => ({
                      width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                      bgcolor: alpha(theme.palette.primary.main, 0.10),
                      display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'primary.main',
                    })}
                  >
                    <Icon name={icon} size="sm" />
                  </Box>
                  <Typography sx={{ fontWeight: 600, fontSize: 14, color: 'text.primary' }}>{title}</Typography>
                </Stack>
                <Chip label={tag} size="small" color={TAG_COLOR[tag]} variant="tonal" sx={{ fontWeight: 600, fontSize: 11, height: 22 }} />
              </Stack>
              <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.5, mb: 2, fontSize: 13 }}>
                {description}
              </Typography>
              <Button
                variant="contained" color="primary" size="small"
                endIcon={<Icon name="arrow-right" size="sm" />}
                sx={{ textTransform: 'none', fontWeight: 500 }}
              >
                Accept
              </Button>
            </Box>
          </Card>
        ))}
      </Box>
    </Box>
  )
}

// ─── 6. Bottom cards ──────────────────────────────────────────────────────────

function BottomCards({ useCases }: { useCases: string[] }) {
  const items = [useCases[0] ?? DEFAULT_RECS[0], useCases[1] ?? DEFAULT_RECS[1]]

  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 2, mb: 4 }}>
      {/* Getting Started */}
      <Card elevation={0} sx={CARD_SX}>
        <Box sx={{ p: 2.5 }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
            <Typography sx={{ fontWeight: 700, fontSize: 15 }}>Getting Started</Typography>
            <Typography variant="caption" color="text.secondary">0/4 complete</Typography>
          </Stack>
          <Stack spacing={0.5}>
            {CHECKLIST.map(({ label, time }) => (
              <Stack
                key={label} direction="row" alignItems="center" spacing={1.5}
                sx={{ cursor: 'pointer', mx: -1.5, px: 1.5, py: 0.5, borderRadius: 1.5, transition: 'background-color 0.15s', '&:hover': { bgcolor: 'action.hover' } }}
              >
                <Box sx={{ width: 20, height: 20, flexShrink: 0, borderRadius: '50%', border: '1.5px solid', borderColor: 'divider' }} />
                <Stack spacing={0} sx={{ flex: 1, py: '2px' }}>
                  <Typography variant="body2" sx={{ fontWeight: 500, lineHeight: 1.3 }}>{label}</Typography>
                  <Typography variant="caption" color="text.disabled" sx={{ lineHeight: 1.3 }}>{time}</Typography>
                </Stack>
              </Stack>
            ))}
          </Stack>
        </Box>
      </Card>

      {/* Recommendation */}
      <Card elevation={0} sx={CARD_SX}>
        <Box sx={{ p: 2.5 }}>
          <Typography sx={{ fontWeight: 700, fontSize: 15, mb: 2 }}>Recommendation for you</Typography>
          <Stack spacing={1.25}>
            {items.map((item) => (
              <Stack
                key={item} direction="row" alignItems="center" spacing={1.5}
                sx={{ p: 1.5, borderRadius: 2, cursor: 'pointer', bgcolor: 'action.hover', transition: 'background-color 0.15s', '&:hover': { bgcolor: 'action.selected' } }}
              >
                <Box
                  sx={(theme: Theme) => ({
                    width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                    bgcolor: alpha(theme.palette.primary.main, 0.12),
                    display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'primary.main',
                  })}
                >
                  <Icon name="check-circle" size="sm" />
                </Box>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.4 }}>Setup: {item}</Typography>
                  <Typography variant="caption" color="text.secondary">Based on your role</Typography>
                </Box>
                <Box sx={{ color: 'text.disabled', flexShrink: 0 }}><Icon name="caret-right" size="sm" /></Box>
              </Stack>
            ))}
          </Stack>
        </Box>
      </Card>

      {/* Need Help */}
      <Card
        elevation={0}
        sx={(theme: Theme) => ({ ...CARD_SX, bgcolor: alpha(theme.palette.primary.main, 0.06), borderColor: theme.palette.primary.light })}
      >
        <Box sx={{ p: 2.5 }}>
          <Typography sx={{ fontWeight: 700, fontSize: 15, mb: 0.75 }}>Need Help?</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6, mb: 2 }}>
            Our AI Assistant is here to help you with calls, transfers, and workspace setup.
          </Typography>
          <Link
            component="button" type="button" underline="hover"
            sx={{ fontSize: 14, fontWeight: 600, color: 'primary.main', cursor: 'pointer', bgcolor: 'transparent', border: 0, p: 0, fontFamily: 'inherit', display: 'inline-flex', alignItems: 'center', gap: 0.5 }}
          >
            Contact Support →
          </Link>
        </Box>
      </Card>
    </Box>
  )
}

// ─── Placeholder for other tabs ───────────────────────────────────────────────

function ComingSoon({ label }: { label: string }) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: 10 }}>
      <Box
        sx={(theme: Theme) => ({
          width: 64, height: 64, borderRadius: '50%', mb: 2,
          bgcolor: alpha(theme.palette.primary.main, 0.08),
          display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'primary.main',
        })}
      >
        <Icon name="chart-line" size="lg" />
      </Box>
      <Typography sx={{ fontWeight: 700, fontSize: 18, color: 'text.primary', mb: 0.75 }}>{label}</Typography>
      <Typography sx={{ fontSize: 14, color: 'text.secondary' }}>This section is coming soon.</Typography>
    </Box>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function AgentHomePage() {
  const { firstName, useCases } = useOnboarding()
  const [activeTab, setActiveTab] = useState('overview')

  const activeLabel = NAV_ITEMS.find((n) => n.id === activeTab)?.label ?? ''

  return (
    <Box sx={{ display: 'flex', height: 'calc(100vh - 56px)', bgcolor: 'transparent' }}>

      {/* Left sidebar navigation */}
      <AgentSidebar active={activeTab} onSelect={setActiveTab} />

      {/* Main scrollable content */}
      <Box sx={{ flex: 1, overflowY: 'auto', bgcolor: 'transparent', minWidth: 0 }}>
        {activeTab === 'overview' ? (
          <Box sx={{ maxWidth: 1100, mx: 'auto', px: { xs: 2, sm: 3 }, pb: 4 }}>
            <AiSection firstName={firstName} />
            <LiveSection />
            <TodaysActivity />
            <QuickAccessSection />
            <MyQueueSection />
            <BottomCards useCases={useCases} />
            <Box sx={{ textAlign: 'center', pb: 2 }}>
              <Typography variant="caption" color="text.disabled">
                AI can make mistakes, always verify.{' '}
                <Link href="#" underline="hover" sx={{ color: 'primary.main', fontSize: 'inherit' }}>
                  Send Feedback
                </Link>
              </Typography>
            </Box>
          </Box>
        ) : (
          <ComingSoon label={activeLabel} />
        )}
      </Box>
    </Box>
  )
}
