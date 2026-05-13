import { Box, Stack } from '@exotel-npm-dev/signal-design-system'

interface StepperProps {
  currentStep: number
  totalSteps?: number
}

export function Stepper({ currentStep, totalSteps = 4 }: StepperProps) {
  return (
    <Stack direction="row" spacing={0.75} justifyContent="center" aria-label={`Step ${currentStep} of ${totalSteps}`}>
      {Array.from({ length: totalSteps }).map((_, i) => (
        <Box
          key={i}
          role="presentation"
          sx={{
            width: 44,
            height: 6,
            borderRadius: 3,
            bgcolor: i < currentStep ? 'success.main' : 'action.disabledBackground',
            transition: 'background-color 0.25s ease',
          }}
        />
      ))}
    </Stack>
  )
}
