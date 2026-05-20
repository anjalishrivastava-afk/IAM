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
  { label: 'Show my API credentials',     bg: 'primary.main'  },
  { label: 'How do I send an SMS?',       bg: 'success.main'  },
  { label: 'Setup a webhook',             bg: 'info.main'     },
  { label: 'View Voice API docs',         bg: 'primary.dark'  },
  { label: 'Test in sandbox',             bg: 'info.light'    },
  { label: 'Install the SDK',             bg: 'primary.light' },
]

const QUICK_ACCESS_ITEMS = [
  { id: 'api',       icon: 'book-open',        title: 'API Reference',         subtitle: 'Full endpoint docs with request/response examples',  href: 'https://developer.exotel.com/api'      },
  { id: 'sdk',       icon: 'cube',             title: 'SDK & Libraries',        subtitle: 'Client libraries for Python, Node.js, Java & more',  href: 'https://developer.exotel.com/sdk'      },
  { id: 'webhooks',  icon: 'arrows-clockwise', title: 'Webhooks Guide',         subtitle: 'Real-time event delivery, signing, and retries',     href: 'https://developer.exotel.com/webhooks' },
  { id: 'sandbox',   icon: 'flask',            title: 'Sandbox Environment',    subtitle: 'Test your integrations without live traffic',         href: 'https://developer.exotel.com/sandbox'  },
]

const API_LABELS: Record<string, string> = {
  sms: 'SMS API', voice: 'Voice API', whatsapp: 'WhatsApp API', verify: 'Verify API',
}

type ResourceTag = 'REST' | 'Events' | 'SDK' | 'Guide' | 'Community'
const TAG_COLOR: Record<ResourceTag, 'primary' | 'success' | 'secondary'> = {
  REST:      'primary',
  Events:    'success',
  SDK:       'secondary',
  Guide:     'primary',
  Community: 'success',
}

const RESOURCES = [
  { id: 'sms-api',    icon: 'chat-teardrop',    title: 'SMS API',               tag: 'REST'      as ResourceTag, description: 'Send and receive SMS messages programmatically across global networks'     },
  { id: 'voice-api',  icon: 'phone',            title: 'Voice API',             tag: 'REST'      as ResourceTag, description: 'Initiate, receive and control calls with a simple HTTP API'               },
  { id: 'whatsapp',   icon: 'chats',            title: 'WhatsApp API',          tag: 'REST'      as ResourceTag, description: 'Send templated and session messages via WhatsApp Business API'            },
  { id: 'verify',     icon: 'shield-check',     title: 'Verify API',            tag: 'REST'      as ResourceTag, description: 'One-tap OTP and number verification with built-in retry logic'            },
  { id: 'events',     icon: 'arrows-clockwise', title: 'Events & Webhooks',     tag: 'Events'    as ResourceTag, description: 'Subscribe to real-time call and message events via webhooks'               },
  { id: 'community',  icon: 'users',            title: 'Developer Community',   tag: 'Community' as ResourceTag, description: 'Ask questions, share solutions, and learn from other developers'          },
]

const CHECKLIST = [
  { label: 'Copy your Account SID and API key',    time: '1 min'  },
  { label: 'Install the SDK for your language',    time: '2 min'  },
  { label: 'Send your first test request',         time: '5 min'  },
  { label: 'Set up your webhook endpoint',         time: '10 min' },
]

const DEFAULT_RECS = ['Try the SMS API quickstart', 'Set up a Voice call flow']
const MAX_CHARS = 250

const CARD_SX = {
  borderRadius: 2,
  border: '1px solid',
  borderColor: 'divider',
  bgcolor: 'background.paper',
  overflow: 'hidden',
} as const

// ─── AI section ───────────────────────────────────────────────────────────────

function AiSection({ firstName, devApi }: { firstName: string; devApi: string | null }) {
  const [query, setQuery] = useState('')
  const canSend = query.trim().length > 0
  const apiLabel = devApi ? (API_LABELS[devApi] ?? devApi) : null

  return (
    <Box sx={{ maxWidth: 580, mx: 'auto', textAlign: 'center', pt: '70px', pb: '40px' }}>
      <Typography sx={{ fontSize: 18, fontWeight: 500, color: 'text.secondary', mb: 0.75 }}>
        Hi{' '}
        <Box component="span" sx={{ color: 'primary.main', fontWeight: 600 }}>
          {firstName || 'Developer'}
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
      {apiLabel && (
        <Typography sx={{ fontSize: 13, color: 'text.secondary', mb: 2 }}>
          Your sandbox is ready — start building with the{' '}
          <Box component="span" sx={{ fontWeight: 600, color: 'primary.main' }}>{apiLabel}</Box>.
        </Typography>
      )}

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
          placeholder="Ask me anything… e.g. How to send an SMS, show API credentials, setup webhook..."
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
        {QUICK_ACCESS_ITEMS.map(({ id, icon, title, subtitle, href }) => (
          <Card
            key={id}
            elevation={0}
            component="a"
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            sx={{ ...CARD_SX, cursor: 'pointer', textDecoration: 'none', transition: 'box-shadow 0.15s', '&:hover': { boxShadow: 2 } }}
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
                Open
              </Button>
            </Stack>
          </Card>
        ))}
      </Box>
    </Box>
  )
}

// ─── Resources ────────────────────────────────────────────────────────────────

function ResourcesSection() {
  return (
    <Box sx={{ mb: 4 }}>
      <Typography sx={{ fontWeight: 700, fontSize: 18, mb: 2, color: 'text.primary' }}>APIs & Resources</Typography>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, gap: 2 }}>
        {RESOURCES.map(({ id, icon, title, tag, description }) => (
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
                <Chip
                  label={tag}
                  size="small"
                  color={TAG_COLOR[tag]}
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
                View docs
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
          <Typography sx={{ fontWeight: 700, fontSize: 15 }}>Quick Start</Typography>
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
                <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.4 }}>Try: {item}</Typography>
                <Typography variant="caption" color="text.secondary">Based on your setup</Typography>
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
          Our AI Assistant and developer community are here to help you build faster.
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

export function DeveloperHomePage() {
  const { firstName, devApi, useCases } = useOnboarding()

  return (
    <Box sx={{ maxWidth: 1100, mx: 'auto', px: { xs: 2, sm: 3 }, pb: 4 }}>
      <AiSection firstName={firstName} devApi={devApi} />
      <QuickAccessSection />
      <ResourcesSection />

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
