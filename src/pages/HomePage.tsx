import { useState } from 'react'
import { alpha } from '@mui/material/styles'
import type { Theme } from '@mui/material/styles'
import {
  Box,
  Card,
  Chip,
  Icon,
  Link,
  Stack,
  Typography,
} from '@exotel-npm-dev/signal-design-system'
import { useNavigate } from 'react-router-dom'
import { useOnboarding } from '../context/OnboardingContext'

// ─── Static data ──────────────────────────────────────────────────────────────

const SUGGESTED_CHIPS = [
  { label: 'Add 20 Agents to my Team',      bg: 'success.main'  },
  { label: 'Buy phone numbers for support', bg: 'info.main'     },
  { label: 'Setup IVR Flow',                bg: 'info.light'    },
  { label: 'Configure Call Routing',        bg: 'primary.main'  },
  { label: 'View Call Analytics',           bg: 'primary.light' },
  { label: 'Import Customer Database',      bg: 'primary.dark'  },
]


const CHECKLIST = [
  { label: 'Add your first team member',     time: '2 min'  },
  { label: 'Configure your primary product', time: '5 min'  },
  { label: 'Setup integrations',             time: '10 min' },
  { label: 'Test your first workflow',       time: '15 min' },
]

const QUICK_ACCESS = [
  { label: 'Admin Portal',     icon: 'gear', path: '/admin' },
  { label: 'Developer Portal', icon: 'code', path: null     },
]

const DEFAULT_USE_CASES = ['Inbound customer support', 'IVR and call routing']
const MAX_CHARS = 250

const CARD_SX = {
  borderRadius: 2,
  border: '1px solid',
  borderColor: 'divider',
  bgcolor: 'background.paper',
  overflow: 'hidden',
} as const

// ─── AI Section (centered, no card bg) ───────────────────────────────────────

function AiSection({ firstName }: { firstName: string }) {
  const [query, setQuery] = useState('')
  const canSend = query.trim().length > 0

  return (
    <Box sx={{ maxWidth: 580, mx: 'auto', mb: 4, textAlign: 'center', pt: '70px', pb: '40px' }}>
      <Typography sx={{ fontSize: 18, fontWeight: 500, color: 'text.secondary', mb: 0.75 }}>
        Hi{' '}
        <Box component="span" sx={{ color: 'primary.main', fontWeight: 600 }}>
          {firstName || 'there'}
        </Box>{' '}
        👋
      </Typography>
      <Typography
        sx={{
          fontWeight: 700,
          fontSize: { xs: '1.4rem', md: '1.65rem' },
          letterSpacing: '-0.02em',
          lineHeight: 1.2,
          color: 'text.primary',
          mb: 2.5,
        }}
      >
        I'm your AI Workspace Assistant
      </Typography>

      {/* Input box */}
      <Box
        sx={(theme: Theme) => ({
          bgcolor: 'background.paper',
          border: '1.5px solid',
          borderColor: theme.palette.divider,
          borderRadius: 2, overflow: 'hidden',
          textAlign: 'left', mb: 2,
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
          placeholder="What would you like to setup today? e.g. Add agents, Buy numbers, config IVR..."
          rows={2}
          sx={{
            width: '100%', border: 'none', outline: 'none', resize: 'none',
            px: 2, pt: 2, pb: 1,
            fontSize: 14, lineHeight: 1.6, fontFamily: 'inherit',
            bgcolor: 'transparent', color: 'text.primary', display: 'block',
            '&::placeholder': { color: 'text.disabled' },
          }}
        />
        <Stack
          direction="row" alignItems="center" justifyContent="space-between"
          sx={{ px: 1.5, py: 1 }}
        >
          <Stack direction="row" spacing={0.75}>
            {/* Icon tiles — small bordered square containers */}
            {(['paperclip', 'at'] as const).map((name) => (
              <Box
                key={name}
                component="button"
                aria-label={name}
                sx={{
                  width: 30, height: 30, borderRadius: 1,
                  border: '1px solid', borderColor: 'divider',
                  bgcolor: 'background.paper',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', color: 'text.secondary',
                  '&:hover': { bgcolor: 'action.hover', borderColor: 'text.disabled' },
                }}
              >
                <Icon name={name} size="sm" />
              </Box>
            ))}
          </Stack>

          <Stack direction="row" alignItems="center" spacing={1.25}>
            <Typography variant="caption" sx={{ color: 'text.disabled' }}>
              {query.length}/{MAX_CHARS}
            </Typography>
            <Box
              component="button"
              aria-label="Send"
              onClick={() => {}}
              sx={(theme: Theme) => ({
                width: 30, height: 30, borderRadius: 1, border: 'none',
                cursor: canSend ? 'pointer' : 'default',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                bgcolor: canSend ? theme.palette.primary.main : theme.palette.action.disabledBackground,
                color: canSend ? '#fff' : theme.palette.text.disabled,
                transition: 'background-color 0.15s',
                '&:hover': canSend ? { bgcolor: theme.palette.primary.dark } : {},
              })}
            >
              <Icon name="arrow-up" size="sm" />
            </Box>
          </Stack>
        </Stack>
      </Box>

      {/* Suggested chips */}
      <Stack direction="row" flexWrap="wrap" justifyContent="center" sx={{ gap: 1 }}>
        {SUGGESTED_CHIPS.map(({ label, bg }) => (
          <Chip
            key={label}
            label={label}
            size="small"
            onClick={() => setQuery(label)}
            icon={
              <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: bg, flexShrink: 0, ml: '8px !important' }} />
            }
            sx={{
              bgcolor: 'background.paper',
              border: '1px solid', borderColor: 'divider',
              color: 'text.primary', fontWeight: 500, fontSize: 12,
              cursor: 'pointer', height: 28,
              '& .MuiChip-icon': { mr: 0 },
              '&:hover': { bgcolor: 'action.hover', borderColor: 'text.disabled' },
            }}
          />
        ))}
      </Stack>
    </Box>
  )
}

// ─── 4 Quick Action Cards ─────────────────────────────────────────────────────

// ─── Contact Centre product card ──────────────────────────────────────────────

function ContactCentreCard({ useCases }: { useCases: string[] }) {
  const usingFor = useCases.length > 0 ? useCases.join(', ') : DEFAULT_USE_CASES.join(', ')

  return (
    <Card elevation={0} sx={{ ...CARD_SX, borderColor: 'rgba(57,79,182,0.50)' }}>
      <Box sx={{ p: 2.5 }}>
        <Stack direction="row" alignItems="flex-start" justifyContent="space-between" sx={{ mb: 1.5 }}>
          <Stack direction="row" alignItems="center" spacing={1.25}>
            <Box
              sx={{
                width: 36, height: 36, borderRadius: 1.5, flexShrink: 0,
                bgcolor: 'rgba(57,79,182,0.10)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#394FB6',
              }}
            >
              <Icon name="phone" size="sm" />
            </Box>
            <Box>
              <Typography sx={{ fontWeight: 700, fontSize: 15, lineHeight: 1.3, color: 'text.primary' }}>
                Contact Centre
              </Typography>
              <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>Your primary product</Typography>
            </Box>
          </Stack>
          <Box sx={{ px: 1.25, py: 0.4, bgcolor: 'success.main', borderRadius: 10, display: 'inline-flex', alignItems: 'center' }}>
            <Typography sx={{ fontSize: 11, fontWeight: 700, color: '#fff', lineHeight: 1 }}>Active</Typography>
          </Box>
        </Stack>

        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
          You're using this for: {usingFor}
        </Typography>

        <Box
          component="button"
          onClick={() => {}}
          sx={(theme: Theme) => ({
            width: '100%', py: 1.25, px: 2,
            bgcolor: 'rgba(57,73,171,0.16)', border: 'none', borderRadius: 1.5,
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: theme.typography.fontFamily,
            fontWeight: 600, fontSize: 14, color: '#394FB6',
            transition: 'background-color 0.15s',
            '&:hover': { bgcolor: 'rgba(57,73,171,0.24)' },
          })}
        >
          Open Contact Centre →
        </Box>
      </Box>
    </Card>
  )
}

// ─── Stat tiles ───────────────────────────────────────────────────────────────

function StatTiles() {
  const tiles = [
    { icon: 'users',          label: 'Team Size',   value: '11',  color: 'success.main' },
    { icon: 'calendar-blank', label: 'Active Days', value: '1',   color: 'info.main'    },
    { icon: 'chart-bar',      label: 'Setup',       value: '25%', color: 'primary.main' },
  ]
  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 1.5 }}>
      {tiles.map(({ icon, label, value, color }) => (
        <Card key={label} elevation={0} sx={{ ...CARD_SX, p: 2, cursor: 'pointer', transition: 'box-shadow 0.15s', '&:hover': { boxShadow: 2 } }}>
          <Stack spacing={0.75}>
            <Stack direction="row" alignItems="center" spacing={0.75}>
              <Box sx={{ color, display: 'flex' }}><Icon name={icon} size="sm" /></Box>
              <Typography variant="caption" color="text.secondary">{label}</Typography>
            </Stack>
            <Typography sx={{ fontWeight: 700, fontSize: 26, lineHeight: 1.1, color: 'text.primary' }}>
              {value}
            </Typography>
          </Stack>
        </Card>
      ))}
    </Box>
  )
}

// ─── Recommended for You ──────────────────────────────────────────────────────

function RecommendedSection({ useCases }: { useCases: string[] }) {
  const items = [useCases[0] ?? DEFAULT_USE_CASES[0], useCases[1] ?? DEFAULT_USE_CASES[1]]

  return (
    <Card elevation={0} sx={CARD_SX}>
      <Box sx={{ p: 2.5 }}>
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
          <Box sx={{ color: 'primary.main', display: 'flex' }}><Icon name="target" size="sm" /></Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Recommended for You</Typography>
        </Stack>
        <Stack spacing={1.25}>
          {items.map((item) => (
            <Stack
              key={item}
              direction="row" alignItems="center" spacing={1.5}
              sx={{
                p: 1.5, borderRadius: 2, cursor: 'pointer',
                bgcolor: 'action.hover',
                transition: 'background-color 0.15s',
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
                <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.4 }}>Setup: {item}</Typography>
                <Typography variant="caption" color="text.secondary">Based on your use case</Typography>
              </Box>
              <Box sx={{ color: 'text.disabled', flexShrink: 0 }}><Icon name="caret-right" size="sm" /></Box>
            </Stack>
          ))}
        </Stack>
      </Box>
    </Card>
  )
}

// ─── Getting Started ──────────────────────────────────────────────────────────

function GettingStartedCard() {
  return (
    <Card elevation={0} sx={CARD_SX}>
      <Box sx={{ p: 2.5 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.5 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Getting Started</Typography>
          <Typography variant="caption" color="text.secondary">0/4 complete</Typography>
        </Stack>
        <Stack spacing={0.5}>
          {CHECKLIST.map(({ label, time }) => (
            <Stack
              key={label}
              direction="row" alignItems="center" spacing={1.5}
              sx={{
                cursor: 'pointer',
                mx: -1.5, px: 1.5, py: 0.5,
                borderRadius: 1.5,
                transition: 'background-color 0.15s',
                '&:hover': { bgcolor: 'action.hover' },
              }}
            >
              <Box
                sx={{
                  width: 22, height: 22, flexShrink: 0,
                  borderRadius: '50%', border: '1.5px solid', borderColor: 'divider',
                }}
              />
              <Stack spacing={0} sx={{ flex: 1, py: '2px' }}>
                <Typography variant="body2" sx={{ fontWeight: 500, lineHeight: 1.2, mb: 0.1 }}>{label}</Typography>
                <Typography variant="caption" color="text.disabled" sx={{ lineHeight: 1.2 }}>{time}</Typography>
              </Stack>
            </Stack>
          ))}
        </Stack>
      </Box>
    </Card>
  )
}

// ─── Quick Access ─────────────────────────────────────────────────────────────

function QuickAccessCard() {
  const navigate = useNavigate()
  return (
    <Card elevation={0} sx={CARD_SX}>
      <Box sx={{ p: 2.5 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>Quick Access</Typography>
        <Stack spacing={1.25}>
          {QUICK_ACCESS.map(({ label, icon, path }) => (
            <Stack
              key={label}
              direction="row" alignItems="center" spacing={1.5}
              onClick={() => path && navigate(path)}
              sx={{
                p: 1.5, borderRadius: 2, cursor: 'pointer',
                bgcolor: 'action.hover',
                transition: 'background-color 0.15s',
                '&:hover': { bgcolor: 'action.selected' },
                '&:hover .qa-label': { color: 'primary.main' },
              }}
            >
              <Box
                sx={{
                  width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                  bgcolor: 'action.selected',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'text.secondary',
                }}
              >
                <Icon name={icon} size="sm" />
              </Box>
              <Typography className="qa-label" variant="body2" sx={{ fontWeight: 500, transition: 'color 0.15s' }}>
                {label}
              </Typography>
            </Stack>
          ))}
        </Stack>
      </Box>
    </Card>
  )
}

// ─── Need Help? ───────────────────────────────────────────────────────────────

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
        <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 0.75 }}>Need Help?</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6, mb: 1.5 }}>
          Our AI assistant is here to help you navigate and set up your workspace.
        </Typography>
        <Link
          component="button" type="button" underline="hover"
          sx={{ fontSize: 14, fontWeight: 600, color: 'primary.main', cursor: 'pointer', bgcolor: 'transparent', border: 0, p: 0, fontFamily: 'inherit' }}
        >
          Contact Support →
        </Link>
      </Box>
    </Card>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function HomePage() {
  const { firstName, useCases } = useOnboarding()

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', py: { xs: 6, md: 8 }, px: { xs: 2, sm: 3 } }}>
      {/* 1. AI section — centered */}
      <AiSection firstName={firstName} />

      {/* 2. Two-column content */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' },
          gap: 2.5,
          alignItems: 'start',
        }}
      >
        <Stack spacing={2.5}>
          <ContactCentreCard useCases={useCases} />
          <StatTiles />
          <RecommendedSection useCases={useCases} />
        </Stack>
        <Stack spacing={2.5}>
          <GettingStartedCard />
          <QuickAccessCard />
          <NeedHelpCard />
        </Stack>
      </Box>
    </Box>
  )
}
