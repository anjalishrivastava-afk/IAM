import type { ReactNode } from 'react'
import { Box, Link, Stack, Typography } from '@exotel-npm-dev/signal-design-system'

interface DevOnboardingLayoutProps {
  children: ReactNode
  step: number
  totalSteps?: number
  stepLabel: string
}

export function DevOnboardingLayout({
  children,
  step,
  totalSteps = 3,
  stepLabel,
}: DevOnboardingLayoutProps) {
  const pct = Math.round((step / totalSteps) * 100)

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        bgcolor: 'background.default',
      }}
    >
      {/* ── Full-width progress bar ───────────────────────────────────── */}
      <Box sx={{ height: 3, bgcolor: 'action.disabledBackground', flexShrink: 0 }}>
        <Box
          sx={{
            height: '100%',
            width: `${pct}%`,
            bgcolor: 'primary.main',
            transition: 'width 0.4s ease',
          }}
        />
      </Box>

      {/* ── Step indicator row ────────────────────────────────────────── */}
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ px: { xs: 2, sm: 4 }, pt: 1.5, pb: 1.25, flexShrink: 0 }}
      >
        <Typography sx={{ fontSize: 12, color: 'text.secondary', fontWeight: 500 }}>
          Step {step} of {totalSteps}
        </Typography>
        <Typography sx={{ fontSize: 12, color: 'text.secondary', fontWeight: 500 }}>
          {stepLabel}
        </Typography>
      </Stack>

      {/* ── Scrollable body ───────────────────────────────────────────── */}
      <Box
        sx={{
          flex: 1,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          px: { xs: 2, sm: 3 },
          pb: 4,
        }}
      >
        {/* White card — gradient banner at top, form sections below */}
        <Box
          sx={{
            width: '100%',
            maxWidth: 500,
            borderRadius: 3,
            bgcolor: 'background.paper',
            border: '1px solid',
            borderColor: 'divider',
            boxShadow: '0px 4px 24px rgba(10, 13, 18, 0.08)',
            overflow: 'hidden',
          }}
        >
          {/* Gradient hero */}
          <Box
            sx={{
              background: 'linear-gradient(135deg, #3B5BDB 0%, #6741D9 55%, #9B51E0 100%)',
              px: 3,
              py: 2.5,
              display: 'flex',
              alignItems: 'center',
              gap: 2,
            }}
          >
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: 2,
                bgcolor: 'rgba(255,255,255,0.18)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                fontSize: 22,
              }}
            >
              ✦
            </Box>
            <Box>
              <Typography sx={{ fontWeight: 700, fontSize: 18, color: '#fff', lineHeight: 1.3 }}>
                Welcome to Exotel
              </Typography>
              <Typography sx={{ fontSize: 12, color: 'rgba(255,255,255,0.80)', mt: 0.25 }}>
                Let's set up your workspace in just a few steps
              </Typography>
            </Box>
          </Box>

          {/* Form content */}
          <Box sx={{ px: 3, pt: 2.5, pb: 3 }}>
            {children}
          </Box>
        </Box>

        {/* Already have an account */}
        <Typography sx={{ fontSize: 13, color: 'text.secondary', mt: 2.5 }}>
          Already have an account?{' '}
          <Link href="/sign-in" underline="hover" sx={{ fontWeight: 600, color: 'primary.main' }}>
            Log in
          </Link>
        </Typography>
      </Box>
    </Box>
  )
}
