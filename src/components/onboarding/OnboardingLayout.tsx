import { type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Icon,
  IconButton,
  Link,
  Stack,
  Typography,
  useLoadDataByTheme,
  useThemeMode,
} from '@exotel-npm-dev/signal-design-system'
import brandLogoLight from '../../assets/exotel-playground-logo-light.svg'
import brandLogoDark from '../../assets/exotel-playground-logo-dark.svg'

const LANG_FLAG = 'https://www.figma.com/api/mcp/asset/2c305f9e-4c36-4cd9-848b-91eb19903d2f'

interface OnboardingLayoutProps {
  children: ReactNode
  showBack?: boolean
  onBack?: () => void
  /** 'signup' = left-right footer; 'onboarding' = centered © */
  footerVariant?: 'signup' | 'onboarding'
}

export function OnboardingLayout({
  children,
  showBack = false,
  onBack,
  footerVariant = 'onboarding',
}: OnboardingLayoutProps) {
  const navigate = useNavigate()
  const { toggleMode } = useThemeMode()
  const brandLogo = useLoadDataByTheme(brandLogoDark, brandLogoLight)

  const handleBack = onBack ?? (() => navigate(-1))

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        bgcolor: 'background.default',
        overflow: 'hidden',
      }}
    >
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ px: 4, py: 1.5, flexShrink: 0 }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <img
            src={brandLogo}
            alt="Exotel"
            style={{ height: 36, width: 'auto', display: 'block' }}
          />
        </Box>

        <Stack direction="row" alignItems="center" spacing={1} sx={{ flexShrink: 0 }}>
          <IconButton
            size="small"
            color="inherit"
            onClick={toggleMode}
            aria-label="Toggle light or dark mode"
            sx={{ border: 1, borderColor: 'divider', borderRadius: 1, width: 34, height: 34 }}
          >
            <Icon name="circle-half" size="sm" />
          </IconButton>

          <Stack
            direction="row"
            alignItems="center"
            spacing={0.5}
            sx={{
              height: 34,
              px: '5px',
              py: 0.5,
              border: 1,
              borderColor: 'divider',
              borderRadius: 1,
              boxShadow: '0px 1px 2px 0px rgba(10,13,18,0.05)',
              bgcolor: 'background.paper',
            }}
          >
            <Box
              sx={{
                width: 18,
                height: 13,
                position: 'relative',
                overflow: 'hidden',
                flexShrink: 0,
                borderRadius: 0.25,
              }}
            >
              <img
                src={LANG_FLAG}
                alt=""
                style={{
                  position: 'absolute',
                  height: '1982.82%',
                  left: '-419.47%',
                  top: '-394.86%',
                  width: '767.88%',
                  maxWidth: 'none',
                }}
              />
            </Box>
            <Typography sx={{ fontSize: 14, fontWeight: 500, lineHeight: '18px' }}>EN</Typography>
          </Stack>
        </Stack>
      </Stack>

      {/* ── Back arrow (Screens 3 & 4 only) ────────────────────────────── */}
      {showBack && (
        <Box sx={{ px: 4, pb: 0.5, flexShrink: 0 }}>
          <IconButton
            onClick={handleBack}
            size="small"
            aria-label="Go back"
            sx={{ border: 1, borderColor: 'divider', borderRadius: 1, width: 32, height: 32 }}
          >
            <Icon name="arrow-left" size="sm" />
          </IconButton>
        </Box>
      )}

      {/* ── Scrollable content ──────────────────────────────────────────── */}
      <Box sx={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>{children}</Box>

      {/* ── Footer ─────────────────────────────────────────────────────── */}
      {footerVariant === 'signup' ? (
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{ flexShrink: 0, minHeight: 56, px: 4, py: 1 }}
        >
          <Link
            href="https://docs.exotel.com"
            target="_blank"
            rel="noopener noreferrer"
            underline="hover"
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              color: 'info.main',
              fontSize: 14,
              fontWeight: 400,
            }}
          >
            <Icon name="book-open" size="sm" />
            Help and Documentation
          </Link>
          <Typography sx={{ fontSize: 14, color: 'text.primary' }}>© Exotel 2026</Typography>
        </Stack>
      ) : (
        <Box sx={{ flexShrink: 0, py: 2, textAlign: 'center' }}>
          <Typography sx={{ fontSize: 13, color: 'text.disabled' }}>© Exotel 2025</Typography>
        </Box>
      )}
    </Box>
  )
}
