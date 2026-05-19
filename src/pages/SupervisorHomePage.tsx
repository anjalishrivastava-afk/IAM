import type { Theme } from '@mui/material/styles'
import { alpha } from '@mui/material/styles'
import { Box, Button, Card, Chip, Icon, Stack, Typography } from '@exotel-npm-dev/signal-design-system'
import { useOnboarding } from '../context/OnboardingContext'

// ─── Static data ──────────────────────────────────────────────────────────────

const AGENT_STATUS = [
  { name: 'Rahul Sharma',  status: 'online',  channel: 'voice',    handling: 'Priya Nair'     },
  { name: 'Deepa Pillai',  status: 'online',  channel: 'chat',     handling: 'Suresh Kumar'   },
  { name: 'Amit Verma',    status: 'break',   channel: null,       handling: null             },
  { name: 'Sneha Rao',     status: 'online',  channel: 'whatsapp', handling: 'Karan Mehta'    },
  { name: 'Kiran Bhat',    status: 'offline', channel: null,       handling: null             },
]

const QUEUE_STATS = [
  { label: 'Waiting',         value: '7',       icon: 'list-bullets', color: '#F59E0B', bg: '#FFFBEB' },
  { label: 'Avg Wait Time',   value: '2m 34s',  icon: 'clock',        color: '#EF4444', bg: '#FEF2F2' },
  { label: 'Agents Online',   value: '3 / 5',   icon: 'users',        color: '#10B981', bg: '#ECFDF5' },
  { label: 'SLA Breach Risk', value: '2',       icon: 'warning',      color: '#7C3AED', bg: '#F5F3FF' },
]

const TEAM_METRICS = [
  { label: 'Calls Today',      value: '142', delta: '+12%', up: true  },
  { label: 'Avg Handle Time',  value: '4m 08s', delta: '-6%',  up: true  },
  { label: 'CSAT (avg)',       value: '4.6',     delta: '+0.2', up: true  },
  { label: 'Escalations',      value: '5',       delta: '+2',   up: false },
]

const AGENT_STATUS_COLOR: Record<string, { bg: string; color: string; label: string }> = {
  online:  { bg: '#ECFDF5', color: '#059669', label: 'Online'  },
  break:   { bg: '#FFFBEB', color: '#D97706', label: 'Break'   },
  offline: { bg: '#F9FAFB', color: '#6B7280', label: 'Offline' },
}

const CHANNEL_ICON: Record<string, string> = {
  voice:    'phone',
  chat:     'chat',
  whatsapp: 'chats',
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function QueueStatCard({ label, value, icon, color, bg }: typeof QUEUE_STATS[number]) {
  return (
    <Card
      elevation={0}
      sx={{ borderRadius: 2, border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper', p: 2.5 }}
    >
      <Stack direction="row" alignItems="center" spacing={1.5}>
        <Box
          sx={{
            width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
            bgcolor: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color,
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

export function SupervisorHomePage() {
  const { firstName } = useOnboarding()

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* ── Hero banner ───────────────────────────────────────────────── */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #B45309 0%, #D97706 55%, #F59E0B 100%)',
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
              <Icon name="chart-bar" size="md" />
            </Box>
            <Typography
              sx={{
                fontSize: 12, fontWeight: 600, letterSpacing: '0.08em',
                textTransform: 'uppercase', color: 'rgba(255,255,255,0.7)',
              }}
            >
              Supervisor Dashboard
            </Typography>
          </Stack>

          <Typography sx={{ fontWeight: 800, fontSize: { xs: 26, md: 34 }, color: '#fff', lineHeight: 1.2, mb: 1 }}>
            Welcome back{firstName ? `, ${firstName}` : ''}! 👋
          </Typography>
          <Typography sx={{ fontSize: 16, color: 'rgba(255,255,255,0.82)', mb: 3, maxWidth: 520 }}>
            <strong>3 agents online</strong> · <strong>7 customers waiting</strong> · 2 at risk of SLA breach.
          </Typography>

          <Stack direction="row" flexWrap="wrap" gap={1}>
            {[
              { icon: 'users',      label: '5 Agents in Team'   },
              { icon: 'shield',     label: 'SLA Target: 80%'    },
              { icon: 'clock',      label: 'Shift: 8:00 AM – 8:00 PM' },
            ].map(({ icon, label }) => (
              <Stack
                key={label}
                direction="row" alignItems="center" spacing={0.5}
                sx={{ px: 1.25, py: 0.5, borderRadius: 99, bgcolor: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.2)' }}
              >
                <Box sx={{ color: 'rgba(255,255,255,0.75)', display: 'flex' }}>
                  <Icon name={icon} size="sm" />
                </Box>
                <Typography sx={{ fontSize: 12, fontWeight: 500, color: '#fff' }}>{label}</Typography>
              </Stack>
            ))}
          </Stack>
        </Box>
      </Box>

      <Box sx={{ maxWidth: 960, mx: 'auto', px: { xs: 3, md: 6 }, py: 4 }}>
        {/* ── Queue stats ───────────────────────────────────────────────── */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(4, 1fr)' },
            gap: 2,
            mb: 4,
          }}
        >
          {QUEUE_STATS.map((s) => <QueueStatCard key={s.label} {...s} />)}
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3, mb: 4 }}>
          {/* ── Agent Status ────────────────────────────────────────────── */}
          <Box>
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
              <Typography sx={{ fontWeight: 700, fontSize: 18, color: 'text.primary' }}>Agent Status</Typography>
              <Button variant="outlined" color="neutral" size="small" endIcon={<Icon name="arrow-right" size="sm" />}
                sx={{ textTransform: 'none', fontWeight: 500 }}>
                Live Monitor
              </Button>
            </Stack>
            <Stack spacing={1.5}>
              {AGENT_STATUS.map((agent) => {
                const statusMeta = AGENT_STATUS_COLOR[agent.status]
                return (
                  <Card
                    key={agent.name}
                    elevation={0}
                    sx={{
                      borderRadius: 2, border: '1px solid', borderColor: 'divider',
                      bgcolor: 'background.paper',
                      transition: 'box-shadow 0.15s', '&:hover': { boxShadow: 2 },
                    }}
                  >
                    <Stack direction="row" alignItems="center" spacing={2} sx={{ px: 2.5, py: 1.75 }}>
                      <Box
                        sx={{
                          width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                          bgcolor: statusMeta.bg,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: statusMeta.color,
                        }}
                      >
                        <Icon name="user" size="sm" />
                      </Box>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography sx={{ fontWeight: 600, fontSize: 14, color: 'text.primary' }}>
                          {agent.name}
                        </Typography>
                        {agent.handling ? (
                          <Stack direction="row" alignItems="center" spacing={0.5}>
                            <Box sx={{ color: 'text.disabled', display: 'flex' }}>
                              <Icon name={CHANNEL_ICON[agent.channel ?? ''] ?? 'phone'} size="sm" />
                            </Box>
                            <Typography variant="caption" color="text.secondary">
                              Handling: {agent.handling}
                            </Typography>
                          </Stack>
                        ) : (
                          <Typography variant="caption" color="text.disabled">
                            {agent.status === 'break' ? 'On break' : 'Not signed in'}
                          </Typography>
                        )}
                      </Box>
                      <Chip
                        label={statusMeta.label}
                        size="small"
                        sx={{
                          fontWeight: 600, fontSize: 11, height: 22,
                          bgcolor: statusMeta.bg, color: statusMeta.color,
                          border: '1px solid', borderColor: statusMeta.color + '33',
                        }}
                      />
                    </Stack>
                  </Card>
                )
              })}
            </Stack>
          </Box>

          {/* ── Team Performance ─────────────────────────────────────────── */}
          <Box>
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
              <Typography sx={{ fontWeight: 700, fontSize: 18, color: 'text.primary' }}>Team Performance</Typography>
              <Button variant="outlined" color="neutral" size="small" endIcon={<Icon name="arrow-right" size="sm" />}
                sx={{ textTransform: 'none', fontWeight: 500 }}>
                Full Report
              </Button>
            </Stack>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
              {TEAM_METRICS.map((m) => (
                <Card
                  key={m.label}
                  elevation={0}
                  sx={{ borderRadius: 2, border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper', p: 2.5 }}
                >
                  <Typography sx={{ fontWeight: 700, fontSize: 22, color: 'text.primary', lineHeight: 1.2 }}>
                    {m.value}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.75 }}>
                    {m.label}
                  </Typography>
                  <Stack direction="row" alignItems="center" spacing={0.5}>
                    <Box sx={{ color: m.up ? 'success.main' : 'error.main', display: 'flex' }}>
                      <Icon name={m.up ? 'trend-up' : 'trend-down'} size="sm" />
                    </Box>
                    <Typography
                      variant="caption"
                      sx={{ fontWeight: 600, color: m.up ? 'success.main' : 'error.main' }}
                    >
                      {m.delta} vs yesterday
                    </Typography>
                  </Stack>
                </Card>
              ))}
            </Box>
          </Box>
        </Box>

        {/* ── Quick Actions ─────────────────────────────────────────────── */}
        <Typography sx={{ fontWeight: 700, fontSize: 18, color: 'text.primary', mb: 2 }}>Quick Actions</Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' }, gap: 2 }}>
          {[
            { icon: 'monitor',     label: 'Live Monitor',    desc: 'Listen in on active calls'      },
            { icon: 'chart-line',  label: 'View Reports',    desc: 'Daily, weekly, and custom views' },
            { icon: 'users',       label: 'Manage Agents',   desc: 'Assign queues and set schedules' },
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
                    bgcolor: alpha(theme.palette.warning.main, 0.10),
                    color: 'warning.dark',
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
  )
}
