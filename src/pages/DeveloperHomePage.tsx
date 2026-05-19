import type { Theme } from '@mui/material/styles'
import { alpha } from '@mui/material/styles'
import { Box, Button, Card, Chip, Icon, Link, Stack, Typography } from '@exotel-npm-dev/signal-design-system'
import { useOnboarding } from '../context/OnboardingContext'

// ─── Static data ─────────────────────────────────────────────────────────────

const API_LABELS: Record<string, string> = {
  sms: 'SMS API',
  voice: 'Voice API',
  whatsapp: 'WhatsApp API',
  verify: 'Verify API',
}

const API_DOCS: Record<string, string> = {
  sms: 'https://developer.exotel.com/api/#sms',
  voice: 'https://developer.exotel.com/api/#voice',
  whatsapp: 'https://developer.exotel.com/api/#whatsapp',
  verify: 'https://developer.exotel.com/api/#verify',
}

interface QuickStartStep {
  step: number
  title: string
  description: string
  icon: string
  cta: string
  ctaIcon: string
}

const QUICK_START: QuickStartStep[] = [
  {
    step: 1,
    title: 'Get your API credentials',
    description: 'Copy your Account SID and API key from the credentials panel.',
    icon: 'key',
    cta: 'View credentials',
    ctaIcon: 'arrow-right',
  },
  {
    step: 2,
    title: 'Install the SDK',
    description: 'Add the Exotel SDK to your project with one command.',
    icon: 'cube',
    cta: 'View SDK docs',
    ctaIcon: 'arrow-right',
  },
  {
    step: 3,
    title: 'Send your first request',
    description: 'Run a sample request and see real API responses in the sandbox.',
    icon: 'sparkle',
    cta: 'Open sandbox',
    ctaIcon: 'arrow-right',
  },
]

interface ResourceCard {
  icon: string
  title: string
  description: string
  badge?: string
  gradient: string
  href: string
}

const RESOURCES: ResourceCard[] = [
  {
    icon: 'book-open',
    title: 'API Reference',
    description: 'Complete endpoint docs with request/response examples.',
    gradient: 'linear-gradient(135deg, #4F9EE8 0%, #5B6ED6 100%)',
    href: 'https://developer.exotel.com/api',
  },
  {
    icon: 'chats',
    title: 'Code Samples',
    description: 'Runnable snippets in Python, Node.js, Java, and more.',
    gradient: 'linear-gradient(135deg, #34D399 0%, #10B981 100%)',
    href: 'https://developer.exotel.com/samples',
  },
  {
    icon: 'arrows-clockwise',
    title: 'Webhooks Guide',
    description: 'Real-time event delivery — setup, signing, and retries.',
    gradient: 'linear-gradient(135deg, #F59E0B 0%, #EF4444 100%)',
    href: 'https://developer.exotel.com/webhooks',
  },
  {
    icon: 'chat-teardrop',
    title: 'Developer Community',
    description: 'Ask questions, share solutions, get help from other devs.',
    badge: 'Active',
    gradient: 'linear-gradient(135deg, #9B51E0 0%, #6741D9 100%)',
    href: 'https://community.exotel.com',
  },
]

// ─── Setup tag ────────────────────────────────────────────────────────────────

function SetupTag({ label, icon }: { label: string; icon: string }) {
  return (
    <Stack
      direction="row"
      alignItems="center"
      spacing={0.5}
      sx={{
        px: 1.25, py: 0.5,
        borderRadius: 99,
        bgcolor: 'rgba(255,255,255,0.15)',
        border: '1px solid rgba(255,255,255,0.2)',
      }}
    >
      <Box sx={{ color: 'rgba(255,255,255,0.75)', display: 'flex' }}>
        <Icon name={icon} size="sm" />
      </Box>
      <Typography sx={{ fontSize: 12, fontWeight: 500, color: '#fff' }}>
        {label}
      </Typography>
    </Stack>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function DeveloperHomePage() {
  const { firstName, devApi, devLanguage, devEnvironment } = useOnboarding()

  const apiLabel = devApi ? (API_LABELS[devApi] ?? devApi) : 'SMS API'
  const docsUrl = devApi ? (API_DOCS[devApi] ?? '#') : '#'

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* ── Hero banner ───────────────────────────────────────────────── */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #3B5BDB 0%, #6741D9 55%, #9B51E0 100%)',
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
              <Icon name="sparkle" size="md" />
            </Box>
            <Typography
              sx={{
                fontSize: 12, fontWeight: 600, letterSpacing: '0.08em',
                textTransform: 'uppercase', color: 'rgba(255,255,255,0.7)',
              }}
            >
              Developer Portal
            </Typography>
          </Stack>

          <Typography sx={{ fontWeight: 800, fontSize: { xs: 26, md: 34 }, color: '#fff', lineHeight: 1.2, mb: 1 }}>
            Welcome{firstName ? `, ${firstName}` : ''}! 👋
          </Typography>
          <Typography sx={{ fontSize: 16, color: 'rgba(255,255,255,0.82)', mb: 3, maxWidth: 520 }}>
            Your sandbox is ready. Start building with the {apiLabel} — your first request is seconds away.
          </Typography>

          {/* Setup summary tags */}
          <Stack direction="row" flexWrap="wrap" gap={1}>
            {devApi && <SetupTag label={apiLabel} icon="check-circle" />}
            {devLanguage && <SetupTag label={devLanguage} icon="gear" />}
            {devEnvironment && (
              <SetupTag
                label={devEnvironment === 'sandbox' ? 'Sandbox' : 'Production'}
                icon="shield-check"
              />
            )}
          </Stack>
        </Box>
      </Box>

      <Box sx={{ maxWidth: 960, mx: 'auto', px: { xs: 3, md: 6 }, py: 4 }}>
        {/* ── API Credentials card ────────────────────────────────────── */}
        <Card
          elevation={0}
          sx={{
            borderRadius: 2, border: '1px solid', borderColor: 'divider',
            bgcolor: 'background.paper', mb: 4, overflow: 'hidden',
          }}
        >
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            alignItems={{ sm: 'center' }}
            justifyContent="space-between"
            spacing={2}
            sx={{ px: 3, py: 2.5 }}
          >
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <Box
                sx={(theme: Theme) => ({
                  width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
                  bgcolor: alpha(theme.palette.primary.main, 0.10),
                  color: 'primary.main',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                })}
              >
                <Icon name="key" size="sm" />
              </Box>
              <Box>
                <Typography sx={{ fontWeight: 700, fontSize: 15, color: 'text.primary' }}>
                  API Credentials
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Your Account SID and API key for authenticating requests
                </Typography>
              </Box>
            </Stack>
            <Stack direction="row" spacing={2} alignItems="center">
              <Box
                sx={(theme: Theme) => ({
                  px: 2, py: 1, borderRadius: 1.5,
                  bgcolor: alpha(theme.palette.text.primary, 0.04),
                  border: '1px solid', borderColor: 'divider',
                  fontFamily: 'monospace', fontSize: 13, color: 'text.secondary',
                  letterSpacing: '0.05em',
                })}
              >
                SID: EX•••••••••••
              </Box>
              <Button
                variant="outlined"
                color="neutral"
                size="small"
                startIcon={<Icon name="copy-simple" size="sm" />}
              >
                Copy keys
              </Button>
            </Stack>
          </Stack>
        </Card>

        {/* ── Quick start ─────────────────────────────────────────────── */}
        <Typography sx={{ fontWeight: 700, fontSize: 18, color: 'text.primary', mb: 0.5 }}>
          Quick start with {apiLabel}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
          Follow these three steps to make your first API call.
        </Typography>

        <Stack spacing={1.5} sx={{ mb: 4 }}>
          {QUICK_START.map((item) => (
            <Card
              key={item.step}
              elevation={0}
              sx={{
                borderRadius: 2, border: '1px solid', borderColor: 'divider',
                bgcolor: 'background.paper', overflow: 'hidden',
                transition: 'box-shadow 0.15s',
                '&:hover': { boxShadow: 2 },
              }}
            >
              <Stack direction="row" alignItems="center" spacing={2} sx={{ px: 3, py: 2 }}>
                <Box
                  sx={(theme: Theme) => ({
                    width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                    bgcolor: alpha(theme.palette.primary.main, 0.10),
                    color: 'primary.main',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  })}
                >
                  <Icon name={item.icon} size="sm" />
                </Box>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography sx={{ fontSize: 11, fontWeight: 600, color: 'text.disabled', textTransform: 'uppercase', letterSpacing: '0.06em', mb: 0.25 }}>
                    Step {item.step}
                  </Typography>
                  <Typography sx={{ fontWeight: 600, fontSize: 14, color: 'text.primary' }}>
                    {item.title}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {item.description}
                  </Typography>
                </Box>
                <Button
                  variant="outlined"
                  color="neutral"
                  size="small"
                  endIcon={<Icon name={item.ctaIcon} size="sm" />}
                  sx={{ flexShrink: 0, textTransform: 'none' }}
                >
                  {item.cta}
                </Button>
              </Stack>
            </Card>
          ))}
        </Stack>

        {/* ── Resources ───────────────────────────────────────────────── */}
        <Stack direction="row" alignItems="baseline" justifyContent="space-between" sx={{ mb: 2 }}>
          <Typography sx={{ fontWeight: 700, fontSize: 18, color: 'text.primary' }}>
            Resources
          </Typography>
          <Link
            href={docsUrl}
            target="_blank"
            rel="noopener noreferrer"
            underline="hover"
            sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, fontSize: 14, fontWeight: 600, color: 'primary.main' }}
          >
            Full docs
            <Icon name="arrow-right" size="sm" />
          </Link>
        </Stack>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1.5 }}>
          {RESOURCES.map((res) => (
            <Card
              key={res.title}
              elevation={0}
              sx={{
                borderRadius: 2, border: '1px solid', borderColor: 'divider',
                bgcolor: 'background.paper', overflow: 'hidden', cursor: 'pointer',
                transition: 'box-shadow 0.15s',
                '&:hover': { boxShadow: 2 },
              }}
            >
              <Stack direction="row" alignItems="flex-start" spacing={1.5} sx={{ p: 2 }}>
                <Box
                  sx={{
                    width: 36, height: 36, borderRadius: '10px', flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: res.gradient, color: '#fff',
                  }}
                >
                  <Icon name={res.icon} size="sm" />
                </Box>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.25 }}>
                    <Typography sx={{ fontWeight: 600, fontSize: 14, color: 'text.primary' }}>
                      {res.title}
                    </Typography>
                    {res.badge && (
                      <Chip
                        label={res.badge}
                        size="small"
                        color="success"
                        variant="tonal"
                        sx={{ fontWeight: 600, fontSize: 10, height: 18 }}
                      />
                    )}
                  </Stack>
                  <Typography sx={{ fontSize: 12, color: 'text.secondary', lineHeight: 1.5 }}>
                    {res.description}
                  </Typography>
                </Box>
                <Box sx={{ color: 'text.disabled', display: 'flex', flexShrink: 0, mt: 0.25 }}>
                  <Icon name="arrow-right" size="sm" />
                </Box>
              </Stack>
            </Card>
          ))}
        </Box>
      </Box>
    </Box>
  )
}
