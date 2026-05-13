import { alpha } from '@mui/material/styles'
import type { Theme } from '@mui/material/styles'
import { Box, Button, Card, Icon, Stack, Typography } from '@exotel-npm-dev/signal-design-system'

// ─── Static data ──────────────────────────────────────────────────────────────

const STATS = [
  { label: 'Total Roles',    value: '5',   icon: 'shield',        color: 'primary.main'   },
  { label: 'Active Users',   value: '106', icon: 'users',         color: 'success.main'   },
  { label: 'Permissions',    value: '28',  icon: 'lock',          color: 'secondary.main' },
]

const ROLE_DISTRIBUTION = [
  { name: 'Developer',        count: 45, pct: 100 },
  { name: 'Support Agent',    count: 28, pct: 62  },
  { name: 'Analytics Viewer', count: 18, pct: 40  },
  { name: 'Account Manager',  count: 12, pct: 27  },
  { name: 'Super Admin',      count: 3,  pct: 7   },
]

const RECENT_ACTIVITY = [
  { user: 'Shivku',       action: 'assigned',               target: 'Super Admin',     time: '2 hours ago' },
  { user: 'Priya Sharma', action: 'role changed from Developer to', target: 'Account Manager', time: '3 hours ago' },
  { user: 'System',       action: 'created new role',       target: 'Analytics Viewer', time: '1 day ago'   },
  { user: 'Amit Patel',   action: 'removed from',           target: 'Support Agent',   time: '2 days ago'  },
]

const CARD_SX = {
  borderRadius: 2,
  border: '1px solid',
  borderColor: 'divider',
  bgcolor: 'background.paper',
  overflow: 'hidden',
} as const

// ─── Page ─────────────────────────────────────────────────────────────────────

export function AdminUserManagementPage() {
  return (
    <Box sx={{ maxWidth: 1100, mx: 'auto', px: 3, py: 3 }}>
      {/* Header */}
      <Stack direction="row" alignItems="flex-start" justifyContent="space-between" sx={{ mb: 3 }}>
        <Box>
          <Typography sx={{ fontWeight: 700, fontSize: 24, letterSpacing: '-0.02em', color: 'text.primary', mb: 0.5 }}>
            User Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage users, roles, and access across your organization
          </Typography>
        </Box>
        <Stack direction="row" spacing={1.5}>
          <Button variant="outlined" color="neutral" size="medium" startIcon={<Icon name="upload" size="sm" />}>
            Bulk Invite
          </Button>
          <Button variant="contained" color="primary" size="medium" startIcon={<Icon name="user-plus" size="sm" />}>
            Invite User
          </Button>
        </Stack>
      </Stack>

      {/* Stat cards */}
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2, mb: 3 }}>
        {STATS.map(({ label, value, icon, color }) => (
          <Card key={label} elevation={0} sx={{ ...CARD_SX, p: 2.5 }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 0.75 }}>{label}</Typography>
                <Typography sx={{ fontWeight: 700, fontSize: 32, lineHeight: 1.1, color: 'text.primary' }}>{value}</Typography>
              </Box>
              <Box
                sx={(theme: Theme) => ({
                  width: 44, height: 44, borderRadius: '50%',
                  bgcolor: alpha(
                    color.includes('primary') ? theme.palette.primary.main
                    : color.includes('success') ? theme.palette.success.main
                    : theme.palette.secondary.main,
                    0.10
                  ),
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color,
                })}
              >
                <Icon name={icon} size="sm" />
              </Box>
            </Stack>
          </Card>
        ))}
      </Box>

      {/* Two-column: Role Distribution + Recent Activity */}
      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 3 }}>
        {/* Role Distribution */}
        <Card elevation={0} sx={CARD_SX}>
          <Box sx={{ p: 2.5 }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Role Distribution</Typography>
              <Typography
                component="span"
                sx={{ fontSize: 13, fontWeight: 600, color: 'primary.main', cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
              >
                View All
              </Typography>
            </Stack>
            <Stack spacing={1.75}>
              {ROLE_DISTRIBUTION.map(({ name, count, pct }) => (
                <Box key={name}>
                  <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 0.6 }}>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>{name}</Typography>
                    <Typography variant="body2" color="text.secondary">{count}</Typography>
                  </Stack>
                  <Box sx={{ height: 6, borderRadius: 3, bgcolor: 'action.hover', overflow: 'hidden' }}>
                    <Box sx={{ height: '100%', width: `${pct}%`, borderRadius: 3, bgcolor: 'primary.main', transition: 'width 0.4s ease' }} />
                  </Box>
                </Box>
              ))}
            </Stack>
          </Box>
        </Card>

        {/* Recent Activity */}
        <Card elevation={0} sx={CARD_SX}>
          <Box sx={{ p: 2.5 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>Recent Activity</Typography>
            <Stack spacing={2}>
              {RECENT_ACTIVITY.map(({ user, action, target, time }, i) => (
                <Stack key={i} direction="row" alignItems="flex-start" spacing={1.25}>
                  <Box
                    sx={(theme: Theme) => ({
                      width: 8, height: 8, borderRadius: '50%', flexShrink: 0, mt: 0.75,
                      bgcolor: alpha(theme.palette.primary.main, 0.80),
                    })}
                  />
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" sx={{ lineHeight: 1.5 }}>
                      <Box component="span" sx={{ fontWeight: 600 }}>{user}</Box>
                      {' '}{action}{' '}
                      <Box component="span" sx={{ color: 'primary.main', fontWeight: 500, cursor: 'pointer' }}>{target}</Box>
                    </Typography>
                    <Typography variant="caption" color="text.disabled">{time}</Typography>
                  </Box>
                </Stack>
              ))}
            </Stack>
          </Box>
        </Card>
      </Box>

      {/* Security Recommendation */}
      <Box
        sx={(theme: Theme) => ({
          p: 2.5, borderRadius: 2,
          bgcolor: alpha(theme.palette.warning.main, 0.06),
          border: `1px solid ${alpha(theme.palette.warning.main, 0.30)}`,
          display: 'flex', alignItems: 'flex-start', gap: 1.5,
        })}
      >
        <Box sx={{ color: 'warning.main', display: 'flex', flexShrink: 0, mt: 0.2 }}>
          <Icon name="warning" size="sm" />
        </Box>
        <Box sx={{ flex: 1 }}>
          <Typography sx={{ fontWeight: 700, fontSize: 14, color: 'warning.dark', mb: 0.5 }}>
            Security Recommendation
          </Typography>
          <Typography variant="body2" sx={{ color: 'warning.dark', mb: 1.5 }}>
            3 users have not been assigned a role. Review Super Admin assignments periodically.
          </Typography>
          <Button variant="outlined" size="small" sx={{ borderColor: 'warning.main', color: 'warning.dark', '&:hover': { bgcolor: alpha('#ED6C02', 0.06) } }}>
            Review Settings
          </Button>
        </Box>
      </Box>
    </Box>
  )
}
