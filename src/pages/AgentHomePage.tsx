import type { Theme } from '@mui/material/styles'
import { alpha } from '@mui/material/styles'
import { Box, Button, Card, Chip, Icon, Stack, Typography } from '@exotel-npm-dev/signal-design-system'
import { useOnboarding } from '../context/OnboardingContext'

// ─── Static data ──────────────────────────────────────────────────────────────

const QUEUE_ITEMS = [
  { id: 1, name: 'Rahul Sharma',   channel: 'voice',    wait: '2m 14s', priority: 'high'   },
  { id: 2, name: 'Priya Nair',     channel: 'chat',     wait: '0m 48s', priority: 'normal' },
  { id: 3, name: 'Amit Verma',     channel: 'whatsapp', wait: '4m 01s', priority: 'high'   },
  { id: 4, name: 'Sneha Rao',      channel: 'voice',    wait: '1m 22s', priority: 'normal' },
]

const RECENT_INTERACTIONS = [
  { id: 1, name: 'Karan Mehta',    channel: 'voice',    duration: '5m 32s', status: 'resolved', time: '10 min ago'  },
  { id: 2, name: 'Deepa Pillai',   channel: 'chat',     duration: '8m 15s', status: 'resolved', time: '28 min ago'  },
  { id: 3, name: 'Suresh Kumar',   channel: 'voice',    duration: '3m 44s', status: 'escalated', time: '45 min ago' },
  { id: 4, name: 'Meena Iyer',     channel: 'whatsapp', duration: '6m 10s', status: 'resolved', time: '1 hr ago'    },
]

const STATS = [
  { label: 'Handled Today',   value: '24',   icon: 'phone',        color: '#10B981', bg: '#ECFDF5' },
  { label: 'Avg Handle Time', value: '4m 12s', icon: 'clock',      color: '#3B5BDB', bg: '#EEF2FF' },
  { label: 'CSAT Score',      value: '4.7 / 5', icon: 'star',      color: '#F59E0B', bg: '#FFFBEB' },
  { label: 'In Queue',        value: '4',    icon: 'list-bullets', color: '#7C3AED', bg: '#F5F3FF' },
]

const CHANNEL_ICON: Record<string, string> = {
  voice:    'phone',
  chat:     'chat',
  whatsapp: 'chats',
}

const PRIORITY_COLOR: Record<string, 'error' | 'warning'> = {
  high:   'error',
  normal: 'warning',
}

const STATUS_COLOR: Record<string, 'success' | 'error'> = {
  resolved:  'success',
  escalated: 'error',
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatCard({ label, value, icon, color, bg }: typeof STATS[number]) {
  return (
    <Card
      elevation={0}
      sx={{ borderRadius: 2, border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper', p: 2.5 }}
    >
      <Stack direction="row" alignItems="center" spacing={1.5}>
        <Box
          sx={{
            width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
            bgcolor: bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
            color,
          }}
        >
          <Icon name={icon} size="sm" />
        </Box>
        <Box>
          <Typography sx={{ fontWeight: 700, fontSize: 20, color: 'text.primary', lineHeight: 1.2 }}>
            {value}
          </Typography>
          <Typography variant="caption" color="text.secondary">{label}</Typography>
        </Box>
      </Stack>
    </Card>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function AgentHomePage() {
  const { firstName } = useOnboarding()

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* ── Hero banner ───────────────────────────────────────────────── */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #059669 0%, #10B981 55%, #34D399 100%)',
          px: { xs: 3, md: 6 },
          pt: 5,
          pb: 6,
        }}
      >
        <Box sx={{ maxWidth: 960, mx: 'auto' }}>
          <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 2 }}>
            <Box
              sx={{
                width: 40, height: 40, borderRadius: 2,
                bgcolor: 'rgba(255,255,255,0.18)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', flexShrink: 0,
              }}
            >
              <Icon name="headset" size="md" />
            </Box>
            <Typography
              sx={{
                fontSize: 12, fontWeight: 600, letterSpacing: '0.08em',
                textTransform: 'uppercase', color: 'rgba(255,255,255,0.7)',
              }}
            >
              Agent Workspace
            </Typography>
          </Stack>

          <Typography sx={{ fontWeight: 800, fontSize: { xs: 26, md: 34 }, color: '#fff', lineHeight: 1.2, mb: 1 }}>
            Good day{firstName ? `, ${firstName}` : ''}! 👋
          </Typography>
          <Typography sx={{ fontSize: 16, color: 'rgba(255,255,255,0.82)', mb: 3, maxWidth: 520 }}>
            You have <strong>4 customers waiting</strong> in your queue. Handle them with care.
          </Typography>

          <Stack direction="row" flexWrap="wrap" gap={1}>
            <Stack
              direction="row" alignItems="center" spacing={0.5}
              sx={{ px: 1.25, py: 0.5, borderRadius: 99, bgcolor: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.2)' }}
            >
              <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#fff' }} />
              <Typography sx={{ fontSize: 12, fontWeight: 500, color: '#fff' }}>Online</Typography>
            </Stack>
            <Stack
              direction="row" alignItems="center" spacing={0.5}
              sx={{ px: 1.25, py: 0.5, borderRadius: 99, bgcolor: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.2)' }}
            >
              <Box sx={{ color: 'rgba(255,255,255,0.75)', display: 'flex' }}>
                <Icon name="clock" size="sm" />
              </Box>
              <Typography sx={{ fontSize: 12, fontWeight: 500, color: '#fff' }}>Shift: 9:00 AM – 6:00 PM</Typography>
            </Stack>
          </Stack>
        </Box>
      </Box>

      <Box sx={{ maxWidth: 960, mx: 'auto', px: { xs: 3, md: 6 }, py: 4 }}>
        {/* ── Performance stats ─────────────────────────────────────────── */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(4, 1fr)' },
            gap: 2,
            mb: 4,
          }}
        >
          {STATS.map((s) => <StatCard key={s.label} {...s} />)}
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
          {/* ── My Queue ────────────────────────────────────────────────── */}
          <Box>
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
              <Typography sx={{ fontWeight: 700, fontSize: 18, color: 'text.primary' }}>My Queue</Typography>
              <Button variant="outlined" color="neutral" size="small" endIcon={<Icon name="arrow-right" size="sm" />}
                sx={{ textTransform: 'none', fontWeight: 500 }}>
                Go to Contact Centre
              </Button>
            </Stack>
            <Stack spacing={1.5}>
              {QUEUE_ITEMS.map((item) => (
                <Card
                  key={item.id}
                  elevation={0}
                  sx={{
                    borderRadius: 2, border: '1px solid', borderColor: 'divider',
                    bgcolor: 'background.paper', overflow: 'hidden',
                    transition: 'box-shadow 0.15s', '&:hover': { boxShadow: 2 },
                  }}
                >
                  <Stack direction="row" alignItems="center" spacing={2} sx={{ px: 2.5, py: 1.75 }}>
                    <Box
                      sx={(theme: Theme) => ({
                        width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                        bgcolor: alpha(theme.palette.success.main, 0.10),
                        color: 'success.main',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      })}
                    >
                      <Icon name={CHANNEL_ICON[item.channel] ?? 'phone'} size="sm" />
                    </Box>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography sx={{ fontWeight: 600, fontSize: 14, color: 'text.primary' }}>{item.name}</Typography>
                      <Typography variant="caption" color="text.secondary">Waiting {item.wait}</Typography>
                    </Box>
                    <Chip
                      label={item.priority === 'high' ? 'High' : 'Normal'}
                      size="small"
                      color={PRIORITY_COLOR[item.priority]}
                      variant="tonal"
                      sx={{ fontWeight: 600, fontSize: 11, height: 22 }}
                    />
                    <Button variant="contained" color="primary" size="small" sx={{ textTransform: 'none', flexShrink: 0 }}>
                      Accept
                    </Button>
                  </Stack>
                </Card>
              ))}
            </Stack>
          </Box>

          {/* ── Recent Interactions ──────────────────────────────────────── */}
          <Box>
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
              <Typography sx={{ fontWeight: 700, fontSize: 18, color: 'text.primary' }}>Recent Interactions</Typography>
              <Button variant="outlined" color="neutral" size="small" endIcon={<Icon name="arrow-right" size="sm" />}
                sx={{ textTransform: 'none', fontWeight: 500 }}>
                View History
              </Button>
            </Stack>
            <Stack spacing={1.5}>
              {RECENT_INTERACTIONS.map((item) => (
                <Card
                  key={item.id}
                  elevation={0}
                  sx={{
                    borderRadius: 2, border: '1px solid', borderColor: 'divider',
                    bgcolor: 'background.paper', overflow: 'hidden',
                    cursor: 'pointer', transition: 'box-shadow 0.15s', '&:hover': { boxShadow: 2 },
                  }}
                >
                  <Stack direction="row" alignItems="center" spacing={2} sx={{ px: 2.5, py: 1.75 }}>
                    <Box
                      sx={(theme: Theme) => ({
                        width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                        bgcolor: alpha(theme.palette.text.primary, 0.05),
                        color: 'text.secondary',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      })}
                    >
                      <Icon name={CHANNEL_ICON[item.channel] ?? 'phone'} size="sm" />
                    </Box>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography sx={{ fontWeight: 600, fontSize: 14, color: 'text.primary' }}>{item.name}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {item.duration} · {item.time}
                      </Typography>
                    </Box>
                    <Chip
                      label={item.status === 'resolved' ? 'Resolved' : 'Escalated'}
                      size="small"
                      color={STATUS_COLOR[item.status] ?? 'default'}
                      variant="tonal"
                      sx={{ fontWeight: 600, fontSize: 11, height: 22 }}
                    />
                  </Stack>
                </Card>
              ))}
            </Stack>
          </Box>
        </Box>

        {/* ── Quick Actions ─────────────────────────────────────────────── */}
        <Box sx={{ mt: 4 }}>
          <Typography sx={{ fontWeight: 700, fontSize: 18, color: 'text.primary', mb: 2 }}>Quick Actions</Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' }, gap: 2 }}>
            {[
              { icon: 'phone',       label: 'Make a Call',       desc: 'Start an outbound call'          },
              { icon: 'calendar',    label: 'View My Schedule',   desc: 'Check shifts and breaks'          },
              { icon: 'chart-line',  label: 'My Performance',     desc: 'Stats, CSAT, and daily targets'   },
            ].map((action) => (
              <Card
                key={action.label}
                elevation={0}
                sx={{
                  borderRadius: 2, border: '1px solid', borderColor: 'divider',
                  bgcolor: 'background.paper', cursor: 'pointer',
                  transition: 'box-shadow 0.15s', '&:hover': { boxShadow: 2 },
                }}
              >
                <Stack direction="row" alignItems="center" spacing={1.5} sx={{ p: 2.5 }}>
                  <Box
                    sx={(theme: Theme) => ({
                      width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
                      bgcolor: alpha(theme.palette.success.main, 0.10),
                      color: 'success.main',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    })}
                  >
                    <Icon name={action.icon} size="sm" />
                  </Box>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography sx={{ fontWeight: 600, fontSize: 14, color: 'text.primary' }}>{action.label}</Typography>
                    <Typography variant="caption" color="text.secondary">{action.desc}</Typography>
                  </Box>
                  <Box sx={{ color: 'text.disabled', flexShrink: 0 }}>
                    <Icon name="caret-right" size="sm" />
                  </Box>
                </Stack>
              </Card>
            ))}
          </Box>
        </Box>
      </Box>
    </Box>
  )
}
