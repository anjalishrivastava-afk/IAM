import { useNavigate } from 'react-router-dom'
import { Box, Button, Link, Stack, Typography } from '@exotel-npm-dev/signal-design-system'
import { OnboardingLayout } from '../../components/onboarding/OnboardingLayout'
import { Stepper } from '../../components/onboarding/Stepper'
import { RoleCard } from '../../components/onboarding/SelectionCard'
import { useOnboarding } from '../../context/OnboardingContext'
import { SCREEN2_COPY, ROLES } from '../../lib/onboardingCopy'

export function RoleStep() {
  const navigate = useNavigate()
  const { firstName, role, setRole } = useOnboarding()

  const handleNext = () => {
    navigate('/onboarding/need')
  }

  const handleSkip = () => {
    navigate('/onboarding/need')
  }

  return (
    <OnboardingLayout footerVariant="onboarding">
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          px: { xs: 2, sm: 4 },
          pt: 3,
          pb: 4,
        }}
      >
        <Stack spacing={2.5} sx={{ width: '100%', maxWidth: 560 }}>
          {/* Welcome → Title → Stepper */}
          <Stack spacing={1} alignItems="center">
            <Typography sx={{ fontSize: 13, color: 'text.secondary', textAlign: 'center' }}>
              {SCREEN2_COPY.welcome(firstName || 'there')}
            </Typography>
            <Typography
              sx={{
                fontWeight: 700,
                fontSize: { xs: 22, sm: 26 },
                lineHeight: 1.25,
                letterSpacing: '-0.3px',
                textAlign: 'center',
                color: 'text.primary',
              }}
            >
              {SCREEN2_COPY.title}
            </Typography>
            <Box sx={{ pt: 0.5 }}>
              <Stepper currentStep={1} />
            </Box>
          </Stack>

          {/* 2×2 role cards */}
          <Box
            role="radiogroup"
            aria-label="Select your role"
            sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}
          >
            {ROLES.map((r) => (
              <RoleCard
                key={r.id}
                title={r.title}
                description={r.description}
                selected={role === r.id}
                onSelect={() => setRole(r.id)}
              />
            ))}
          </Box>

          {/* CTA + skip */}
          <Stack spacing={1.5} alignItems="center">
            <Button
              variant="contained"
              color="primary"
              size="large"
              fullWidth
              disabled={role === null}
              aria-disabled={role === null}
              onClick={handleNext}
            >
              {SCREEN2_COPY.cta}
            </Button>

            <Link
              component="button"
              type="button"
              underline="hover"
              onClick={handleSkip}
              sx={{
                fontSize: 14,
                color: 'text.secondary',
                cursor: 'pointer',
                bgcolor: 'transparent',
                border: 0,
                p: 0,
                fontFamily: 'inherit',
              }}
            >
              {SCREEN2_COPY.skip}
            </Link>
          </Stack>
        </Stack>
      </Box>
    </OnboardingLayout>
  )
}
