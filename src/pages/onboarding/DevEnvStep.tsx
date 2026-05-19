import { useState, type KeyboardEvent, type ChangeEvent } from 'react'
import type { Theme } from '@mui/material/styles'
import { alpha } from '@mui/material/styles'
import { useNavigate } from 'react-router-dom'
import MenuItem from '@mui/material/MenuItem'
import { Box, Button, EnhancedTextField, Icon, Link, Stack, Typography } from '@exotel-npm-dev/signal-design-system'
import { OnboardingLayout } from '../../components/onboarding/OnboardingLayout'
import { Stepper } from '../../components/onboarding/Stepper'
import { useOnboarding } from '../../context/OnboardingContext'
import type { DevEnvironment } from '../../context/OnboardingContext'
import { setPlaygroundAuthenticated } from '../../auth/playgroundSession'

// ─── Static data ─────────────────────────────────────────────────────────────

const COUNTRY_CODES = [
  { code: '+91',  flag: '🇮🇳', name: 'India' },
  { code: '+1',   flag: '🇺🇸', name: 'United States' },
  { code: '+44',  flag: '🇬🇧', name: 'United Kingdom' },
  { code: '+65',  flag: '🇸🇬', name: 'Singapore' },
  { code: '+971', flag: '🇦🇪', name: 'UAE' },
  { code: '+61',  flag: '🇦🇺', name: 'Australia' },
  { code: '+49',  flag: '🇩🇪', name: 'Germany' },
  { code: '+33',  flag: '🇫🇷', name: 'France' },
  { code: '+81',  flag: '🇯🇵', name: 'Japan' },
]

const API_LABELS: Record<string, string> = {
  sms: 'SMS API', voice: 'Voice API', whatsapp: 'WhatsApp API', verify: 'Verify API',
}

interface EnvOption {
  id: DevEnvironment & string
  label: string
  description: string
}

const ENV_OPTIONS: EnvOption[] = [
  { id: 'sandbox', label: 'Development sandbox', description: 'Test with free credits and sandbox numbers' },
  { id: 'production', label: 'Connect to production later', description: 'Start with sandbox, upgrade when ready' },
]

// ─── Environment card (same border/bg pattern as SelectionCard) ───────────────

function EnvCard({ option, selected, onSelect }: { option: EnvOption; selected: boolean; onSelect: () => void }) {
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
      <Typography sx={{ fontWeight: 600, fontSize: 14, lineHeight: 1.3, color: 'text.primary', mb: 0.5, pr: 2 }}>
        {option.label}
      </Typography>
      <Typography sx={{ fontSize: 12, color: 'text.secondary', lineHeight: 1.5 }}>
        {option.description}
      </Typography>
    </Box>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function DevEnvStep() {
  const navigate = useNavigate()
  const {
    firstName, devApi, devLanguage, devStartMode,
    devWebhook, setDevWebhook,
    devEnvironment, setDevEnvironment,
    devTestPhone, setDevTestPhone,
  } = useOnboarding()

  const [countryCode, setCountryCode] = useState(COUNTRY_CODES[0])

  const canProceed = devEnvironment !== null && (devTestPhone ?? '').trim().length >= 6

  const handleFinish = () => {
    setPlaygroundAuthenticated()
    navigate('/developer', { replace: true })
  }

  return (
    <OnboardingLayout showBack onBack={() => navigate('/onboarding/dev/api')} footerVariant="onboarding">
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', px: { xs: 2, sm: 4 }, pt: 3, pb: 4 }}>
        <Stack spacing={2.5} sx={{ width: '100%', maxWidth: 560 }}>

          {/* Welcome → Title → Stepper */}
          <Stack spacing={1} alignItems="center">
            <Typography sx={{ fontSize: 13, color: 'text.secondary', textAlign: 'center' }}>
              Welcome to Exotel, {firstName || 'there'}
            </Typography>
            <Typography sx={{ fontWeight: 700, fontSize: { xs: 22, sm: 26 }, lineHeight: 1.25, letterSpacing: '-0.3px', textAlign: 'center', color: 'text.primary' }}>
              ⚙️ Configure your environment
            </Typography>
            <Box sx={{ pt: 0.5 }}>
              <Stepper currentStep={3} totalSteps={3} />
            </Box>
          </Stack>

          {/* Webhook URL */}
          <Box>
            <Typography sx={{ fontWeight: 600, fontSize: 14, mb: 0.75, color: 'text.primary' }}>
              Your webhook URL{' '}
              <Box component="span" sx={{ color: 'text.secondary', fontWeight: 400, fontSize: 13 }}>(optional)</Box>
            </Typography>
            <EnhancedTextField
              showLabel={false}
              size="small"
              fullWidth
              placeholder="https://your-domain.com/webhooks/exotel"
              value={devWebhook ?? ''}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setDevWebhook(e.target.value)}
            />
            <Typography sx={{ fontSize: 12, color: 'text.secondary', mt: 0.625 }}>
              We'll POST status updates here.
            </Typography>
          </Box>

          {/* Environment */}
          <Box>
            <Typography sx={{ fontWeight: 600, fontSize: 14, mb: 1, color: 'text.primary' }}>
              Environment{' '}
              <Box component="span" sx={{ color: 'error.main' }}>*</Box>
            </Typography>
            <Stack direction="row" spacing={1.5}>
              {ENV_OPTIONS.map((opt) => (
                <EnvCard
                  key={opt.id}
                  option={opt}
                  selected={devEnvironment === opt.id}
                  onSelect={() => setDevEnvironment(opt.id as DevEnvironment)}
                />
              ))}
            </Stack>
          </Box>

          {/* Test phone number */}
          <Box>
            <Typography sx={{ fontWeight: 600, fontSize: 14, mb: 1, color: 'text.primary' }}>
              Send a test message to{' '}
              <Box component="span" sx={{ color: 'error.main' }}>*</Box>
            </Typography>
            <Stack direction="row" spacing={1} alignItems="stretch">
              {/* Country code */}
              <EnhancedTextField
                select
                showLabel={false}
                size="small"
                value={countryCode.code}
                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                  const found = COUNTRY_CODES.find((c) => c.code === e.target.value)
                  if (found) setCountryCode(found)
                }}
                SelectProps={{
                  renderValue: (val: unknown) => {
                    const c = COUNTRY_CODES.find((x) => x.code === val)
                    return (
                      <Stack direction="row" alignItems="center" spacing={0.75} sx={{ py: 0 }}>
                        <Box component="span" sx={{ fontSize: 17, lineHeight: 1, flexShrink: 0 }}>{c?.flag}</Box>
                        <Typography sx={{ fontSize: 13, fontWeight: 500, lineHeight: 1 }}>{c?.code}</Typography>
                      </Stack>
                    )
                  },
                }}
                sx={{
                  flexShrink: 0,
                  width: 'auto',
                  '& .MuiInputBase-root': { height: '100%' },
                }}
              >
                {COUNTRY_CODES.map((c) => (
                  <MenuItem key={c.code} value={c.code}>
                    <Stack direction="row" alignItems="center" spacing={1.25} sx={{ width: '100%' }}>
                      <Box component="span" sx={{ fontSize: 18, lineHeight: 1, flexShrink: 0 }}>{c.flag}</Box>
                      <Typography sx={{ fontSize: 13, flex: 1 }}>{c.name}</Typography>
                      <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>{c.code}</Typography>
                    </Stack>
                  </MenuItem>
                ))}
              </EnhancedTextField>

              {/* Phone number */}
              <EnhancedTextField
                showLabel={false}
                size="small"
                fullWidth
                placeholder="Enter phone number"
                value={devTestPhone ?? ''}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setDevTestPhone(e.target.value)}
                inputProps={{ inputMode: 'tel' }}
                sx={{ flex: 1 }}
              />
            </Stack>
            <Typography sx={{ fontSize: 12, color: 'text.secondary', mt: 0.625 }}>
              We'll use this number as your sandbox recipient.
            </Typography>
          </Box>

          {/* Developer setup summary */}
          <Box
            sx={(theme: Theme) => ({
              borderRadius: 2,
              border: `1px solid ${theme.palette.divider}`,
              bgcolor: alpha(theme.palette.text.primary, 0.025),
              p: 2,
            })}
          >
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
              <Box sx={{ color: 'primary.main', display: 'flex' }}>
                <Icon name="code" size="sm" />
              </Box>
              <Typography sx={{ fontWeight: 700, fontSize: 14, color: 'text.primary' }}>
                Your developer setup
              </Typography>
            </Stack>
            <Stack spacing={1}>
              {[
                { label: 'API', value: devApi ? API_LABELS[devApi] : null },
                { label: 'Language', value: devLanguage },
                { label: 'Start mode', value: devStartMode === 'code' ? 'Code with examples' : devStartMode === 'nocode' ? 'No-code with Studio' : null },
                { label: 'Environment', value: devEnvironment === 'sandbox' ? 'Development sandbox' : devEnvironment === 'production' ? 'Production' : null },
                { label: 'Test recipient', value: devTestPhone ? `${countryCode.flag} ${countryCode.code} ${devTestPhone}` : null },
              ].map(({ label, value }) => (
                <Stack key={label} direction="row" alignItems="center" spacing={1}>
                  <Box sx={{ width: 18, height: 18, flexShrink: 0, color: value ? 'success.main' : 'action.disabled', display: 'flex', alignItems: 'center' }}>
                    <Icon name={value ? 'check-circle' : 'circle'} size="sm" />
                  </Box>
                  <Typography sx={{ fontSize: 13, color: 'text.primary' }}>
                    <Box component="span" sx={{ fontWeight: 600 }}>{label}:</Box>{' '}
                    <Box component="span" sx={{ color: value ? 'text.primary' : 'text.disabled' }}>
                      {value ?? '—'}
                    </Box>
                  </Typography>
                </Stack>
              ))}
            </Stack>
          </Box>

          {/* CTA + skip */}
          <Stack spacing={1.5} alignItems="center">
            <Button
              variant="contained" color="primary" size="large" fullWidth
              disabled={!canProceed} aria-disabled={!canProceed}
              onClick={handleFinish}
            >
              Open Developer Portal →
            </Button>
            <Link
              component="button" type="button" underline="hover"
              onClick={handleFinish}
              sx={{ fontSize: 14, fontWeight: 500, color: 'text.primary', cursor: 'pointer', bgcolor: 'transparent', border: 0, p: 0, fontFamily: 'inherit' }}
            >
              Skip for now
            </Link>
          </Stack>

        </Stack>
      </Box>
    </OnboardingLayout>
  )
}
