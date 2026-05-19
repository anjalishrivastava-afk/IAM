import type { KeyboardEvent } from 'react'
import type { Theme } from '@mui/material/styles'
import { alpha } from '@mui/material/styles'
import { useNavigate } from 'react-router-dom'
import { Box, Button, Icon, Link, Stack, Typography } from '@exotel-npm-dev/signal-design-system'
import { OnboardingLayout } from '../../components/onboarding/OnboardingLayout'
import { Stepper } from '../../components/onboarding/Stepper'
import { useOnboarding } from '../../context/OnboardingContext'
import type { DevStartMode } from '../../context/OnboardingContext'

// ─── Static data ─────────────────────────────────────────────────────────────

interface ApiOption {
  id: string
  label: string
  description: string
  icon: string
  gradient: string
}

const API_OPTIONS: ApiOption[] = [
  {
    id: 'sms',
    label: 'SMS API',
    description: 'Send transactional and marketing messages',
    icon: 'chats',
    gradient: 'linear-gradient(135deg, #4F9EE8 0%, #5B6ED6 100%)',
  },
  {
    id: 'voice',
    label: 'Voice API',
    description: 'Build calling, IVR, and call routing',
    icon: 'phone',
    gradient: 'linear-gradient(135deg, #9B51E0 0%, #6741D9 100%)',
  },
  {
    id: 'whatsapp',
    label: 'WhatsApp API',
    description: 'Engage customers on WhatsApp Business',
    icon: 'chat-circle',
    gradient: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
  },
  {
    id: 'verify',
    label: 'Verify API',
    description: 'OTP and identity verification',
    icon: 'shield-check',
    gradient: 'linear-gradient(135deg, #F59E0B 0%, #EF4444 100%)',
  },
]

const LANGUAGES = ['Node.js', 'Python', 'Java', 'PHP', 'Go', 'Ruby', 'C#']

interface StartOption {
  id: DevStartMode & string
  label: string
  description: string
}

const START_OPTIONS: StartOption[] = [
  { id: 'code', label: 'Code with examples', description: 'Get started with code samples and SDKs' },
  { id: 'nocode', label: 'No-code with Studio', description: 'Build workflows with visual tools' },
]

// ─── Selection cards ──────────────────────────────────────────────────────────

function ApiCard({ option, selected, onSelect }: { option: ApiOption; selected: boolean; onSelect: () => void }) {
  const handleKey = (e: KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect() }
  }
  return (
    <Box
      role="radio" aria-checked={selected} tabIndex={0}
      onClick={onSelect} onKeyDown={handleKey}
      sx={(theme: Theme) => ({
        position: 'relative',
        border: `1.5px solid ${selected ? theme.palette.primary.main : theme.palette.divider}`,
        bgcolor: selected ? alpha(theme.palette.primary.main, 0.05) : theme.palette.background.paper,
        borderRadius: 2, p: 2, cursor: 'pointer',
        display: 'flex', flexDirection: 'row', alignItems: 'flex-start', gap: 1.5,
        transition: 'border-color 0.15s, background-color 0.15s', outline: 'none',
        '&:hover': { borderColor: theme.palette.primary.light },
        '&:focus-visible': { outline: `2px solid ${theme.palette.primary.main}`, outlineOffset: 2 },
      })}
    >
      {selected && (
        <Box sx={{ position: 'absolute', top: 10, right: 10, color: 'primary.main', display: 'flex' }}>
          <Icon name="check" size="sm" />
        </Box>
      )}
      <Box sx={{ width: 40, height: 40, borderRadius: '10px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: option.gradient, color: '#fff' }}>
        <Icon name={option.icon} size="sm" />
      </Box>
      <Stack spacing={0.25} sx={{ minWidth: 0, pt: 0.25 }}>
        <Typography sx={{ fontWeight: 600, fontSize: 13, lineHeight: 1.4, color: 'text.primary' }}>
          {option.label}
        </Typography>
        <Typography sx={{ color: 'text.secondary', fontSize: 12, lineHeight: 1.5, pr: 2 }}>
          {option.description}
        </Typography>
      </Stack>
    </Box>
  )
}

function StartCard({ option, selected, onSelect }: { option: StartOption; selected: boolean; onSelect: () => void }) {
  const handleKey = (e: KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect() }
  }
  return (
    <Box
      role="radio" aria-checked={selected} tabIndex={0}
      onClick={onSelect} onKeyDown={handleKey}
      sx={(theme: Theme) => ({
        position: 'relative', flex: 1,
        border: `1.5px solid ${selected ? theme.palette.primary.main : theme.palette.divider}`,
        bgcolor: selected ? alpha(theme.palette.primary.main, 0.05) : theme.palette.background.paper,
        borderRadius: 2, p: 1.75, cursor: 'pointer',
        transition: 'border-color 0.15s, background-color 0.15s', outline: 'none',
        '&:hover': { borderColor: theme.palette.primary.light },
        '&:focus-visible': { outline: `2px solid ${theme.palette.primary.main}`, outlineOffset: 2 },
      })}
    >
      {selected && (
        <Box sx={{ position: 'absolute', top: 10, right: 10, color: 'primary.main', display: 'flex' }}>
          <Icon name="check" size="sm" />
        </Box>
      )}
      <Typography sx={{ fontWeight: 600, fontSize: 14, lineHeight: 1.4, color: 'text.primary', mb: 0.5 }}>
        {option.label}
      </Typography>
      <Typography sx={{ fontSize: 12, color: 'text.secondary', lineHeight: 1.5, pr: 2 }}>
        {option.description}
      </Typography>
    </Box>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function DevApiStep() {
  const navigate = useNavigate()
  const { firstName, devApi, setDevApi, devLanguage, setDevLanguage, devStartMode, setDevStartMode } = useOnboarding()

  const canProceed = devApi !== null && devLanguage !== null && devStartMode !== null

  return (
    <OnboardingLayout showBack onBack={() => navigate('/onboarding/role')} footerVariant="onboarding">
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', px: { xs: 2, sm: 4 }, pt: 3, pb: 4 }}>
        <Stack spacing={2.5} sx={{ width: '100%', maxWidth: 560 }}>

          {/* Welcome → Title → Stepper */}
          <Stack spacing={1} alignItems="center">
            <Typography sx={{ fontSize: 13, color: 'text.secondary', textAlign: 'center' }}>
              Welcome to Exotel, {firstName || 'there'}
            </Typography>
            <Typography sx={{ fontWeight: 700, fontSize: { xs: 22, sm: 26 }, lineHeight: 1.25, letterSpacing: '-0.3px', textAlign: 'center', color: 'text.primary' }}>
              Pick your starting API 🔌
            </Typography>
            <Box sx={{ pt: 0.5 }}>
              <Stepper currentStep={2} totalSteps={3} />
            </Box>
          </Stack>

          {/* API cards — 2 × 2 */}
          <Box role="radiogroup" aria-label="Select an API" sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
            {API_OPTIONS.map((opt) => (
              <ApiCard key={opt.id} option={opt} selected={devApi === opt.id} onSelect={() => setDevApi(opt.id)} />
            ))}
          </Box>

          {/* Preferred language */}
          <Box>
            <Typography sx={{ fontWeight: 600, fontSize: 14, mb: 1.25, color: 'text.primary' }}>
              Your preferred language
            </Typography>
            <Stack direction="row" flexWrap="wrap" gap={1}>
              {LANGUAGES.map((lang) => {
                const isSelected = devLanguage === lang
                return (
                  <Box
                    key={lang}
                    role="radio" aria-checked={isSelected} tabIndex={0}
                    onClick={() => setDevLanguage(lang)}
                    onKeyDown={(e: KeyboardEvent) => {
                      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setDevLanguage(lang) }
                    }}
                    sx={(theme: Theme) => ({
                      px: 1.75, py: 0.625, borderRadius: 1.5, cursor: 'pointer', outline: 'none',
                      border: `1.5px solid ${isSelected ? theme.palette.primary.main : theme.palette.divider}`,
                      bgcolor: isSelected ? alpha(theme.palette.primary.main, 0.06) : theme.palette.background.paper,
                      transition: 'border-color 0.15s, background-color 0.15s',
                      '&:hover': { borderColor: theme.palette.primary.light },
                      '&:focus-visible': { outline: `2px solid ${theme.palette.primary.main}`, outlineOffset: 2 },
                    })}
                  >
                    <Typography sx={{ fontSize: 13, fontWeight: isSelected ? 600 : 400, color: isSelected ? 'primary.main' : 'text.primary' }}>
                      {lang}
                    </Typography>
                  </Box>
                )
              })}
            </Stack>
          </Box>

          {/* How will you start? */}
          <Box>
            <Typography sx={{ fontWeight: 600, fontSize: 14, mb: 1.25, color: 'text.primary' }}>
              How will you start?
            </Typography>
            <Stack direction="row" spacing={1.5}>
              {START_OPTIONS.map((opt) => (
                <StartCard
                  key={opt.id}
                  option={opt}
                  selected={devStartMode === opt.id}
                  onSelect={() => setDevStartMode(opt.id as DevStartMode)}
                />
              ))}
            </Stack>
          </Box>

          {/* CTA + skip */}
          <Stack spacing={1.5} alignItems="center">
            <Button
              variant="contained" color="primary" size="large" fullWidth
              disabled={!canProceed} aria-disabled={!canProceed}
              onClick={() => navigate('/onboarding/dev/env')}
            >
              Continue
            </Button>
            <Link
              component="button" type="button" underline="hover"
              onClick={() => navigate('/onboarding/dev/env')}
              sx={{ fontSize: 14, color: 'text.secondary', cursor: 'pointer', bgcolor: 'transparent', border: 0, p: 0, fontFamily: 'inherit' }}
            >
              Skip for now
            </Link>
          </Stack>

        </Stack>
      </Box>
    </OnboardingLayout>
  )
}
