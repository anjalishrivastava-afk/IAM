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

// ─── Static data ──────────────────────────────────────────────────────────────

const SUGGESTED_CHIPS = [
  { label: 'How many agents are online?',   bg: 'success.main'  },
  { label: 'Show team performance today',   bg: 'primary.main'  },
  { label: 'View customers waiting',        bg: 'warning.main'  },
  { label: 'Generate a weekly report',      bg: 'info.main'     },
  { label: 'Monitor a live call',           bg: 'primary.dark'  },
  { label: 'View SLA breach risk',          bg: 'error.main'    },
]

const QUICK_ACCESS_ITEMS = [
  { id: 'monitor',  icon: 'monitor',    title: 'Live Monitor',    subtitle: 'Listen in and barge on active calls in real time'  },
  { id: 'reports',  icon: 'chart-line', title: 'View Reports',    subtitle: 'Daily, weekly, and custom performance reports'      },
  { id: 'agents',   icon: 'users',      title: 'Manage Agents',   subtitle: 'Assign queues, set schedules and permissions'       },
  { id: 'contact',  icon: 'phone',      title: 'Contact Centre',  subtitle: 'Queue status, routing rules, and live feed'         },
]

type AgentStatus = 'Online' | 'On Break' | 'Offline'
const TAG_COLOR: Record<AgentStatus, 'success' | 'warning' | 'secondary'> = {
  'Online':   'success',
  'On Break': 'warning',
  'Offline':  'secondary',
}

const AGENTS = [
  { id: 'a1', icon: 'user', name: 'Rahul Sharma',  status: 'Online'   as AgentStatus, description: 'Handling: Priya Nair (Voice) · 3m 22s'      },
  { id: 'a2', icon: 'user', name: 'Deepa Pillai',  status: 'Online'   as AgentStatus, description: 'Handling: Suresh Kumar (Chat) · 1m 07s'      },
  { id: 'a3', icon: 'user', name: 'Amit Verma',    status: 'On Break' as AgentStatus, description: 'Break since 2:15 PM · expected back in 5m'   },
  { id: 'a4', icon: 'user', name: 'Sneha Rao',     status: 'Online'   as AgentStatus, description: 'Handling: Karan Mehta (WhatsApp) · 0m 44s'   },
  { id: 'a5', icon: 'user', name: 'Kiran Bhat',    status: 'Offline'  as AgentStatus, description: 'Last seen: 1:48 PM'                           },
  { id: 'a6', icon: 'user', name: 'Meena Iyer',    status: 'Online'   as AgentStatus, description: 'Available · waiting for next interaction'     },
]

const CHECKLIST = [
  { label: 'Review today\'s queue metrics',   time: '2 min'  },
  { label: 'Check SLA compliance status',     time: '3 min'  },
  { label: 'Assign agent break schedules',    time: '5 min'  },
  { label: 'Approve pending escalations',     time: '10 min' },
]

const DEFAULT_RECS = ['Review CSAT scores by agent', 'Adjust queue routing rules']
const MAX_CHARS = 250

const CARD_SX = {
  borderRadius: 2,
  border: '1px solid',
  borderColor: 'divider',
  bgcolor: '#F1F1F1',
  overflow: 'hidden',
} as const

// ─── AI section ───────────────────────────────────────────────────────────────

function AiSection({ firstName }: { firstName: string }) {
  const [query, setQuery] = useState('')
  const canSend = query.trim().length > 0

  return (
    <Box sx={{ maxWidth: 580, mx: 'auto', textAlign: 'center', pt: '70px', pb: '40px' }}>
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
          placeholder="Ask me anything… e.g. Show team performance, how many agents online, SLA status..."
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

// ─── Quick Access ─────────────────────────────────────────────────────────────

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

// ─── Agent Overview ───────────────────────────────────────────────────────────

function AgentOverviewSection() {
  return (
    <Box sx={{ mb: 4 }}>
      <Typography sx={{ fontWeight: 700, fontSize: 18, mb: 2, color: 'text.primary' }}>Agent Overview</Typography>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, gap: 2 }}>
        {AGENTS.map(({ id, icon, name, status, description }) => (
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
                  <Typography sx={{ fontWeight: 600, fontSize: 14, color: 'text.primary' }}>{name}</Typography>
                </Stack>
                <Chip
                  label={status}
                  size="small"
                  color={TAG_COLOR[status]}
                  variant="tonal"
                  sx={{ fontWeight: 600, fontSize: 11, height: 22 }}
                />
              </Stack>
              <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.5, mb: 2, fontSize: 13 }}>
                {description}
              </Typography>
              <Button
                variant="outlined" color="neutral" size="small"
                endIcon={<Icon name="arrow-right" size="sm" />}
                sx={{ textTransform: 'none', fontWeight: 500 }}
              >
                Monitor
              </Button>
            </Box>
          </Card>
        ))}
      </Box>
    </Box>
  )
}

// ─── Bottom cards ─────────────────────────────────────────────────────────────

function GettingStartedCard() {
  return (
    <Card elevation={0} sx={CARD_SX}>
      <Box sx={{ p: 2.5 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
          <Typography sx={{ fontWeight: 700, fontSize: 15 }}>Getting Started</Typography>
          <Typography variant="caption" color="text.secondary">0/4 complete</Typography>
        </Stack>
        <Stack spacing={0.5}>
          {CHECKLIST.map(({ label, time }) => (
            <Stack
              key={label}
              direction="row" alignItems="center" spacing={1.5}
              sx={{
                cursor: 'pointer', mx: -1.5, px: 1.5, py: 0.5, borderRadius: 1.5,
                transition: 'background-color 0.15s', '&:hover': { bgcolor: 'action.hover' },
              }}
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
  )
}

function RecommendationCard({ useCases }: { useCases: string[] }) {
  const items = [useCases[0] ?? DEFAULT_RECS[0], useCases[1] ?? DEFAULT_RECS[1]]
  return (
    <Card elevation={0} sx={CARD_SX}>
      <Box sx={{ p: 2.5 }}>
        <Typography sx={{ fontWeight: 700, fontSize: 15, mb: 2 }}>Recommendation for you</Typography>
        <Stack spacing={1.25}>
          {items.map((item) => (
            <Stack
              key={item}
              direction="row" alignItems="center" spacing={1.5}
              sx={{
                p: 1.5, borderRadius: 2, cursor: 'pointer',
                bgcolor: 'action.hover', transition: 'background-color 0.15s',
                '&:hover': { bgcolor: 'action.selected' },
              }}
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
                <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.4 }}>Review: {item}</Typography>
                <Typography variant="caption" color="text.secondary">Based on your team activity</Typography>
              </Box>
              <Box sx={{ color: 'text.disabled', flexShrink: 0 }}>
                <Icon name="caret-right" size="sm" />
              </Box>
            </Stack>
          ))}
        </Stack>
      </Box>
    </Card>
  )
}

function NeedHelpCard() {
  return (
    <Card
      elevation={0}
      sx={(theme: Theme) => ({
        ...CARD_SX,
        bgcolor: alpha(theme.palette.primary.main, 0.06),
        borderColor: theme.palette.primary.light,
      })}
    >
      <Box sx={{ p: 2.5 }}>
        <Typography sx={{ fontWeight: 700, fontSize: 15, mb: 0.75 }}>Need Help?</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6, mb: 2 }}>
          Our AI Assistant is here to help you monitor your team and manage your contact centre.
        </Typography>
        <Link
          component="button" type="button" underline="hover"
          sx={{
            fontSize: 14, fontWeight: 600, color: 'primary.main', cursor: 'pointer',
            bgcolor: 'transparent', border: 0, p: 0, fontFamily: 'inherit',
            display: 'inline-flex', alignItems: 'center', gap: 0.5,
          }}
        >
          Contact Support →
        </Link>
      </Box>
    </Card>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function SupervisorHomePage() {
  const { firstName, useCases } = useOnboarding()

  return (
    <Box sx={{ maxWidth: 1100, mx: 'auto', px: { xs: 2, sm: 3 }, pb: 4 }}>
      <AiSection firstName={firstName} />
      <QuickAccessSection />
      <AgentOverviewSection />

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 2, mb: 4 }}>
        <GettingStartedCard />
        <RecommendationCard useCases={useCases} />
        <NeedHelpCard />
      </Box>

      <Box sx={{ textAlign: 'center', pb: 2 }}>
        <Typography variant="caption" color="text.disabled">
          AI can make mistakes, always verify.{' '}
          <Link href="#" underline="hover" sx={{ color: 'primary.main', fontSize: 'inherit' }}>
            Send Feedback
          </Link>
        </Typography>
      </Box>
    </Box>
  )
}
