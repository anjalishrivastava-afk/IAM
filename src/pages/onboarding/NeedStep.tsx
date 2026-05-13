import { useNavigate } from 'react-router-dom'
import { Box, Button, Link, Stack, Typography } from '@exotel-npm-dev/signal-design-system'
import { OnboardingLayout } from '../../components/onboarding/OnboardingLayout'
import { Stepper } from '../../components/onboarding/Stepper'
import { ProductCard, UseCaseRow } from '../../components/onboarding/SelectionCard'
import { useOnboarding } from '../../context/OnboardingContext'
import { SCREEN3_COPY, PRODUCTS, USE_CASES_BY_PRODUCT } from '../../lib/onboardingCopy'
import type { OnboardingNeed } from '../../context/OnboardingContext'

export function NeedStep() {
  const navigate = useNavigate()
  const { firstName, primaryNeed, setPrimaryNeed, useCases, setUseCases } = useOnboarding()

  const selectedProduct = PRODUCTS.find((p) => p.id === primaryNeed)
  const availableUseCases = primaryNeed ? USE_CASES_BY_PRODUCT[primaryNeed] : []
  const canProceed = primaryNeed !== null && useCases.length > 0

  const handleProductSelect = (id: NonNullable<OnboardingNeed>) => {
    if (primaryNeed !== id) {
      // Changed product → clear previous use case selections
      setUseCases([])
    }
    setPrimaryNeed(id)
  }

  const toggleUseCase = (label: string, checked: boolean) => {
    setUseCases(checked ? [...useCases, label] : useCases.filter((u) => u !== label))
  }

  const handleNext = () => navigate('/onboarding/personalize')
  const handleSkip = () => navigate('/onboarding/personalize')

  return (
    <OnboardingLayout showBack onBack={() => navigate('/onboarding/role')} footerVariant="onboarding">
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
              {SCREEN3_COPY.welcome(firstName || 'there')}
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
              {SCREEN3_COPY.title}
            </Typography>
            <Box sx={{ pt: 0.5 }}>
              <Stepper currentStep={2} />
            </Box>
          </Stack>

          {/* 2-column × 3-row product cards */}
          <Box
            role="radiogroup"
            aria-label="Select your primary need"
            sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}
          >
            {PRODUCTS.map((p) => (
              <ProductCard
                key={p.id}
                icon={p.icon}
                title={p.title}
                description={p.description}
                gradient={p.gradient}
                selected={primaryNeed === p.id}
                onSelect={() => handleProductSelect(p.id)}
              />
            ))}
          </Box>

          {/* Use-case section — visible only when a product is selected */}
          {primaryNeed && (
            <Box>
              <Typography sx={{ fontWeight: 600, fontSize: 14, mb: 0.5, color: 'text.primary' }}>
                {SCREEN3_COPY.useCaseLabel(selectedProduct?.displayName ?? '')}
              </Typography>
              <Typography sx={{ fontSize: 12, color: 'text.secondary', mb: 1.5 }}>
                {SCREEN3_COPY.useCaseSubLabel}
              </Typography>
              <Stack spacing={1}>
                {availableUseCases.map((label) => (
                  <UseCaseRow
                    key={label}
                    label={label}
                    checked={useCases.includes(label)}
                    onChange={(checked) => toggleUseCase(label, checked)}
                  />
                ))}
              </Stack>
            </Box>
          )}

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
              {SCREEN3_COPY.cta}
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
              {SCREEN3_COPY.skip}
            </Link>
          </Stack>
        </Stack>
      </Box>
    </OnboardingLayout>
  )
}
