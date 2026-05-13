import { useNavigate } from 'react-router-dom'
import { Box, Button, Link, Stack, Typography } from '@exotel-npm-dev/signal-design-system'
import { OnboardingLayout } from '../../components/onboarding/OnboardingLayout'
import { Stepper } from '../../components/onboarding/Stepper'
import { TeamSizeChip, IndustryChip } from '../../components/onboarding/SelectionCard'
import { useOnboarding } from '../../context/OnboardingContext'
import { SCREEN4_COPY, TEAM_SIZES, INDUSTRIES } from '../../lib/onboardingCopy'
import { setPlaygroundAuthenticated } from '../../auth/playgroundSession'

export function PersonalizeStep() {
  const navigate = useNavigate()
  const { firstName, teamSize, industry, setTeamSize, setIndustry } = useOnboarding()

  const canProceed = teamSize !== null && industry !== null

  const handleNext = () => {
    setPlaygroundAuthenticated()
    navigate('/', { replace: true })
  }

  const handleSkip = () => {
    setPlaygroundAuthenticated()
    navigate('/', { replace: true })
  }

  return (
    <OnboardingLayout showBack onBack={() => navigate('/onboarding/need')} footerVariant="onboarding">
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
        <Stack spacing={3} sx={{ width: '100%', maxWidth: 560 }}>
          {/* Welcome → Title → Stepper */}
          <Stack spacing={1} alignItems="center">
            <Typography sx={{ fontSize: 13, color: 'text.secondary', textAlign: 'center' }}>
              {SCREEN4_COPY.welcome(firstName || 'there')}
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
              {SCREEN4_COPY.title}
            </Typography>
            <Box sx={{ pt: 0.5 }}>
              <Stepper currentStep={3} />
            </Box>
          </Stack>

          {/* Team Size */}
          <Box>
            <Typography sx={{ fontWeight: 600, fontSize: 14, mb: 1.5, color: 'text.primary' }}>
              {SCREEN4_COPY.teamSizeLabel}
              <Box component="span" sx={{ color: 'error.main' }}>*</Box>
            </Typography>
            <Box
              role="radiogroup"
              aria-label="Select team size"
              sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 1.25 }}
            >
              {TEAM_SIZES.map((size) => (
                <TeamSizeChip
                  key={size}
                  label={size}
                  selected={teamSize === size}
                  onSelect={() => setTeamSize(size)}
                />
              ))}
            </Box>
          </Box>

          {/* Industry */}
          <Box>
            <Typography sx={{ fontWeight: 600, fontSize: 14, mb: 1.5, color: 'text.primary' }}>
              {SCREEN4_COPY.industryLabel}
              <Box component="span" sx={{ color: 'error.main' }}>*</Box>
            </Typography>
            <Box
              role="radiogroup"
              aria-label="Select industry"
              sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 1.25 }}
            >
              {INDUSTRIES.map((ind) => (
                <IndustryChip
                  key={ind.label}
                  label={ind.label}
                  icon={ind.icon}
                  selected={industry === ind.label}
                  onSelect={() => setIndustry(ind.label)}
                />
              ))}
            </Box>
          </Box>

          {/* CTA + skip */}
          <Stack spacing={1.5} alignItems="center">
            <Button
              variant="contained"
              color="primary"
              size="large"
              fullWidth
              disabled={!canProceed}
              aria-disabled={!canProceed}
              onClick={handleNext}
            >
              {SCREEN4_COPY.cta}
            </Button>
            <Link
              component="button"
              type="button"
              underline="hover"
              onClick={handleSkip}
              sx={{
                fontSize: 14, fontWeight: 500, color: 'text.primary',
                cursor: 'pointer', bgcolor: 'transparent', border: 0, p: 0, fontFamily: 'inherit',
              }}
            >
              {SCREEN4_COPY.skip}
            </Link>
          </Stack>
        </Stack>
      </Box>
    </OnboardingLayout>
  )
}
