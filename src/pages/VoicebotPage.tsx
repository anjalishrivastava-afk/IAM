import { useState } from 'react'
import type { Theme } from '@mui/material/styles'
import { alpha } from '@mui/material/styles'
import {
  Box,
  Button,
  Chip,
  Icon,
  Stack,
  Typography,
} from '@exotel-npm-dev/signal-design-system'

// ─── Constants ────────────────────────────────────────────────────────────────

const TABS = ['Overview', 'Conversations', 'Bot Flows', 'Analytics', 'Settings']

const STATS = [
  {
    icon: 'phone',
    iconBg: '#EEF2FF', iconColor: '#3B5BDB',
    delta: '+12.5%', deltaUp: true,
    label: 'Total Calls', value: '12,543',
  },
  {
    icon: 'check-circle',
    iconBg: '#ECFDF5', iconColor: '#059669',
    delta: '+8.2%', deltaUp: true,
    label: 'Successful', value: '10,234',
  },
  {
    icon: 'clock',
    iconBg: '#FDF4FF', iconColor: '#9333EA',
    delta: '-5.1%', deltaUp: false,
    label: 'Avg Duration', value: '3m 24s',
  },
  {
    icon: 'trend-up',
    iconBg: '#FFF7ED', iconColor: '#EA580C',
    delta: '+2.3%', deltaUp: true,
    label: 'Success Rate', value: '81.6%',
  },
]

const BOT_FLOWS = [
  {
    name: 'Customer Support Bot',
    status: 'active',
    calls: '3,456 calls',
    success: '85% success',
    updated: 'Updated 2 hours ago',
  },
  {
    name: 'Order Status Bot',
    status: 'active',
    calls: '2,990 calls',
    success: '92% success',
    updated: 'Updated 5 hours ago',
  },
  {
    name: 'Feedback Collection Bot',
    status: 'inactive',
    calls: '1,234 calls',
    success: '78% success',
    updated: 'Updated 1 day ago',
  },
  {
    name: 'Appointment Booking Bot',
    status: 'active',
    calls: '4,567 calls',
    success: '88% success',
    updated: 'Updated 30 minutes ago',
  },
]

const CONVERSATIONS = [
  { id: 'CONV-001', customer: '+91 98765 43210', botFlow: 'Customer Support Bot',    duration: '4m 32s', status: 'completed', time: '10 minutes ago'  },
  { id: 'CONV-002', customer: '+91 98765 43211', botFlow: 'Order Status Bot',         duration: '2m 16s', status: 'completed', time: '25 minutes ago'  },
  { id: 'CONV-003', customer: '+91 98765 43212', botFlow: 'Appointment Booking Bot',  duration: '5m 48s', status: 'failed',    time: '1 hour ago'      },
]

const TABLE_COLS = ['CONVERSATION ID', 'CUSTOMER', 'BOT FLOW', 'DURATION', 'STATUS', 'TIME']

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({
  icon, iconBg, iconColor, delta, deltaUp, label, value,
}: typeof STATS[number]) {
  return (
    <Box
      sx={{
        border: '1px solid', borderColor: 'divider',
        borderRadius: 2, bgcolor: 'background.paper', p: 2.5,
      }}
    >
      <Stack direction="row" alignItems="flex-start" justifyContent="space-between" sx={{ mb: 1.5 }}>
        <Box
          sx={{
            width: 44, height: 44, borderRadius: '50%', flexShrink: 0,
            bgcolor: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: iconColor,
          }}
        >
          <Icon name={icon} size="md" />
        </Box>
        <Typography
          sx={{
            fontSize: 12, fontWeight: 700,
            color: deltaUp ? 'success.main' : 'error.main',
          }}
        >
          {delta}
        </Typography>
      </Stack>
      <Typography sx={{ fontSize: 12, color: 'text.secondary', mb: 0.5 }}>{label}</Typography>
      <Typography sx={{ fontWeight: 800, fontSize: 24, color: 'text.primary', lineHeight: 1.1 }}>
        {value}
      </Typography>
    </Box>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function VoicebotPage() {
  const [activeTab, setActiveTab] = useState('Overview')

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100%' }}>

      {/* ── Page header ───────────────────────────────────────────────── */}
      <Box
        sx={{
          bgcolor: 'background.paper',
          borderBottom: '1px solid', borderColor: 'divider',
          px: 3, pt: 2.5, pb: 0,
        }}
      >
        <Stack direction="row" alignItems="flex-start" justifyContent="space-between" sx={{ mb: 1.5 }}>
          <Box>
            <Typography sx={{ fontWeight: 800, fontSize: 22, color: 'text.primary', lineHeight: 1.2 }}>
              Voicebot
            </Typography>
            <Typography sx={{ fontSize: 13, color: 'text.secondary', mt: 0.25 }}>
              Automated voice interactions powered by AI
            </Typography>
          </Box>
          <Stack direction="row" spacing={1.25} alignItems="center">
            <Button
              variant="outlined" color="neutral" size="small"
              startIcon={<Icon name="gear" size="sm" />}
              sx={{ textTransform: 'none', fontWeight: 500 }}
            >
              Settings
            </Button>
            <Button
              variant="contained" size="small"
              startIcon={<Icon name="plus" size="sm" />}
              sx={{
                textTransform: 'none', fontWeight: 600,
                bgcolor: '#F97316', '&:hover': { bgcolor: '#EA580C' },
              }}
            >
              Create New Bot
            </Button>
          </Stack>
        </Stack>

        {/* Tab bar */}
        <Stack direction="row" spacing={0}>
          {TABS.map((tab) => (
            <Box
              key={tab}
              onClick={() => setActiveTab(tab)}
              sx={{
                px: 2, py: 1.25,
                cursor: 'pointer',
                fontSize: 14, fontWeight: activeTab === tab ? 600 : 400,
                color: activeTab === tab ? '#F97316' : 'text.secondary',
                borderBottom: activeTab === tab ? '2px solid #F97316' : '2px solid transparent',
                userSelect: 'none', transition: 'color 0.15s',
                '&:hover': { color: '#F97316' },
              }}
            >
              {tab}
            </Box>
          ))}
        </Stack>
      </Box>

      <Box sx={{ p: 3 }}>

        {/* ── Stats row ─────────────────────────────────────────────────── */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(4, 1fr)' },
            gap: 2, mb: 3,
          }}
        >
          {STATS.map((s) => <StatCard key={s.label} {...s} />)}
        </Box>

        {/* ── Active Bot Flows ──────────────────────────────────────────── */}
        <Box
          sx={{
            border: '1px solid', borderColor: 'divider',
            borderRadius: 2, bgcolor: 'background.paper',
            overflow: 'hidden', mb: 3,
          }}
        >
          <Box sx={{ px: 2.5, py: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
            <Typography sx={{ fontWeight: 700, fontSize: 16 }}>Active Bot Flows</Typography>
          </Box>

          {BOT_FLOWS.map((bot, i) => (
            <Stack
              key={bot.name}
              direction="row" alignItems="center"
              sx={{
                px: 2.5, py: 2,
                borderBottom: i < BOT_FLOWS.length - 1 ? '1px solid' : 'none',
                borderColor: 'divider',
                '&:hover': { bgcolor: 'action.hover' },
                cursor: 'pointer',
              }}
            >
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
                  <Typography sx={{ fontWeight: 600, fontSize: 15, color: 'text.primary' }}>
                    {bot.name}
                  </Typography>
                  <Chip
                    label={bot.status}
                    size="small"
                    sx={{
                      height: 20, fontSize: 11, fontWeight: 700,
                      bgcolor: bot.status === 'active' ? '#DCFCE7' : '#F3F4F6',
                      color: bot.status === 'active' ? '#15803D' : '#6B7280',
                      borderRadius: 0.75,
                    }}
                  />
                </Stack>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Stack direction="row" alignItems="center" spacing={0.5}>
                    <Box sx={{ color: 'text.disabled', display: 'flex' }}>
                      <Icon name="phone" size="sm" />
                    </Box>
                    <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>{bot.calls}</Typography>
                  </Stack>
                  <Stack direction="row" alignItems="center" spacing={0.5}>
                    <Box sx={{ color: 'success.main', display: 'flex' }}>
                      <Icon name="trend-up" size="sm" />
                    </Box>
                    <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>{bot.success}</Typography>
                  </Stack>
                  <Stack direction="row" alignItems="center" spacing={0.5}>
                    <Box sx={{ color: 'text.disabled', display: 'flex' }}>
                      <Icon name="clock" size="sm" />
                    </Box>
                    <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>{bot.updated}</Typography>
                  </Stack>
                </Stack>
              </Box>
              <Stack direction="row" spacing={1} sx={{ flexShrink: 0 }}>
                <Box
                  sx={(theme: Theme) => ({
                    width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                    border: '1px solid', borderColor: theme.palette.divider,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'text.secondary', cursor: 'pointer',
                    '&:hover': { bgcolor: 'action.hover' },
                  })}
                >
                  <Icon name="play" size="sm" />
                </Box>
                <Box
                  sx={(theme: Theme) => ({
                    width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                    border: '1px solid', borderColor: theme.palette.divider,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'text.secondary', cursor: 'pointer',
                    '&:hover': { bgcolor: 'action.hover' },
                  })}
                >
                  <Icon name="gear" size="sm" />
                </Box>
              </Stack>
            </Stack>
          ))}
        </Box>

        {/* ── Recent Conversations ──────────────────────────────────────── */}
        <Box
          sx={{
            border: '1px solid', borderColor: 'divider',
            borderRadius: 2, bgcolor: 'background.paper',
            overflow: 'hidden',
          }}
        >
          <Box sx={{ px: 2.5, py: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
            <Typography sx={{ fontWeight: 700, fontSize: 16 }}>Recent Conversations</Typography>
          </Box>

          {/* Table header */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: '160px 1fr 1fr 100px 110px 130px',
              px: 2.5, py: 1.25,
              borderBottom: '1px solid', borderColor: 'divider',
              bgcolor: 'action.hover',
            }}
          >
            {TABLE_COLS.map((col) => (
              <Typography
                key={col}
                sx={{ fontSize: 11, fontWeight: 700, color: 'text.disabled', letterSpacing: '0.05em' }}
              >
                {col}
              </Typography>
            ))}
          </Box>

          {/* Rows */}
          {CONVERSATIONS.map((row, i) => (
            <Box
              key={row.id}
              sx={{
                display: 'grid',
                gridTemplateColumns: '160px 1fr 1fr 100px 110px 130px',
                px: 2.5, py: 1.75, alignItems: 'center',
                borderBottom: i < CONVERSATIONS.length - 1 ? '1px solid' : 'none',
                borderColor: 'divider',
                '&:hover': { bgcolor: 'action.hover' },
                cursor: 'pointer',
              }}
            >
              <Typography sx={{ fontSize: 14, fontWeight: 700, color: 'text.primary' }}>
                {row.id}
              </Typography>
              <Typography sx={{ fontSize: 14, color: 'text.primary' }}>{row.customer}</Typography>
              <Typography sx={{ fontSize: 14, color: 'text.primary' }}>{row.botFlow}</Typography>
              <Typography sx={{ fontSize: 14, color: 'text.secondary' }}>{row.duration}</Typography>
              <Box>
                <Chip
                  label={row.status}
                  size="small"
                  sx={{
                    height: 22, fontSize: 12, fontWeight: 600,
                    bgcolor: row.status === 'completed'
                      ? alpha('#22C55E', 0.12)
                      : alpha('#EF4444', 0.12),
                    color: row.status === 'completed' ? '#15803D' : '#DC2626',
                    borderRadius: 0.75,
                  }}
                />
              </Box>
              <Typography sx={{ fontSize: 14, color: 'text.secondary' }}>{row.time}</Typography>
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  )
}
