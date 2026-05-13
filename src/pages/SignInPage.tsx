import { useState, type ChangeEvent } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import {
  Alert,
  Box,
  Button,
  EnhancedTextField,
  Icon,
  IconButton,
  InputAdornment,
  Link,
  Stack,
  Typography,
  useLoadDataByTheme,
  useThemeMode,
} from '@exotel-npm-dev/signal-design-system'
import brandLogoLight from '../assets/exotel-playground-logo-light.svg'
import brandLogoDark from '../assets/exotel-playground-logo-dark.svg'
import signInHero from '../assets/sign-in-hero.png'
import googleSocialIcon from '../assets/google-social-icon.svg'
import {
  isPlaygroundAuthenticated,
  setPlaygroundAuthenticated,
  validatePlaygroundCredentials,
} from '../auth/playgroundSession'

const LANG_FLAG =
  'https://www.figma.com/api/mcp/asset/2c305f9e-4c36-4cd9-848b-91eb19903d2f'

/** Theme-aware outlined style — avoids hardcoded light-only greys in dark mode */
const socialLoginButtonSx = {
  borderColor: 'divider',
  color: 'text.primary',
  py: 1.25,
  fontSize: 14,
  fontWeight: 500,
  letterSpacing: '0.1px',
  lineHeight: 1.57,
  textTransform: 'none',
  '&:hover': {
    borderColor: 'divider',
    backgroundColor: 'action.hover',
  },
} as const

export function SignInPage() {
  const navigate = useNavigate()
  const { toggleMode } = useThemeMode()
  const brandLogo = useLoadDataByTheme(brandLogoDark, brandLogoLight)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState(false)

  if (isPlaygroundAuthenticated()) {
    return <Navigate to="/" replace />
  }

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(false)
    if (validatePlaygroundCredentials(email, password)) {
      setPlaygroundAuthenticated()
      navigate('/', { replace: true })
      return
    }
    setError(true)
  }

  return (
    <Box
      sx={{
        display: 'flex',
        minHeight: '100vh',
        flexDirection: { xs: 'column', md: 'row' },
        bgcolor: 'background.default',
      }}
    >
      {/* Left: hero image (Figma — rounded inset, ~20px gutter) */}
      <Box
        sx={{
          display: { xs: 'none', md: 'flex' },
          width: { md: '50%' },
          maxWidth: { md: 720 },
          flexShrink: 0,
          p: '20px',
          boxSizing: 'border-box',
        }}
      >
        <Box
          sx={{
            position: 'relative',
            flex: 1,
            minHeight: { md: 'calc(100vh - 40px)' },
            borderRadius: '20px',
            overflow: 'hidden',
          }}
        >
          <img
            src={signInHero}
            alt=""
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
        </Box>
      </Box>

      {/* Mobile hero strip */}
      <Box
        sx={{
          display: { xs: 'block', md: 'none' },
          height: 200,
          flexShrink: 0,
          px: 2,
          pt: 2,
        }}
      >
        <img
          src={signInHero}
          alt=""
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            borderRadius: 20,
          }}
        />
      </Box>

      {/* Right: form column */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minHeight: 0,
          bgcolor: 'background.paper',
          color: 'text.primary',
          minWidth: 0,
        }}
      >
        {/* Header — px 32 py 24 */}
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{ px: 4, py: 3, flexShrink: 0 }}
        >
          <Box sx={{ minWidth: 0, display: 'flex', alignItems: 'center' }}>
            <img src={brandLogo} alt="Exotel" style={{ height: 48, width: 'auto', display: 'block' }} />
          </Box>

          <Stack direction="row" alignItems="center" spacing={1} sx={{ flexShrink: 0 }}>
            <IconButton
              size="small"
              color="inherit"
              onClick={toggleMode}
              aria-label="Toggle light or dark mode"
              sx={{
                border: 1,
                borderColor: 'divider',
                borderRadius: 1,
                width: 34,
                height: 34,
              }}
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

        {/* Centered form — max width 420px, padding 20 */}
        <Box
          component="form"
          onSubmit={onSubmit}
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            px: 4,
            py: 2,
            minHeight: 0,
          }}
        >
          <Stack spacing={3} sx={{ width: '100%', maxWidth: 420, p: 2.5 }}>
            <Stack spacing={1.5}>
              <Typography
                sx={{
                  fontWeight: 600,
                  fontSize: 28,
                  lineHeight: '32px',
                  letterSpacing: '-0.56px',
                  color: 'text.primary',
                }}
              >
                Welcome 👋
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: 'text.secondary', lineHeight: '21px', fontSize: 14 }}
              >
                Log in to start supporting your customers
              </Typography>
            </Stack>

            <Alert severity="info" variant="standard" sx={{ alignItems: 'center', py: 0.5 }}>
              Email and Password: Exotel
            </Alert>

            {error ? (
              <Alert severity="error" variant="standard">
                Enter email <strong>Exotel</strong> and password <strong>Exotel</strong> to continue.
              </Alert>
            ) : null}

            <Stack spacing={3} sx={{ width: '100%' }}>
              <EnhancedTextField
                label="Email"
                placeholder="abc@xyz.com"
                value={email}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                fullWidth
                size="large"
                autoComplete="email"
              />

              <Stack spacing={0.5}>
                <EnhancedTextField
                  label="Passsword"
                  placeholder="Enter Password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                  fullWidth
                  size="large"
                  autoComplete="current-password"
                  slotProps={{
                    input: {
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label={showPassword ? 'Hide password' : 'Show password'}
                            onClick={() => setShowPassword((s) => !s)}
                            edge="end"
                            size="small"
                            type="button"
                          >
                            <Icon name={showPassword ? 'eye-slash' : 'eye'} size="sm" />
                          </IconButton>
                        </InputAdornment>
                      ),
                    },
                  }}
                />
                <Link
                  component="button"
                  type="button"
                  variant="body2"
                  underline="hover"
                  sx={{
                    alignSelf: 'flex-end',
                    cursor: 'pointer',
                    fontSize: 14,
                    lineHeight: 1.43,
                    letterSpacing: '0.17px',
                    color: 'text.secondary',
                    border: 0,
                    bgcolor: 'transparent',
                    p: 0,
                    fontFamily: 'inherit',
                  }}
                >
                  Forgot Password?
                </Link>
              </Stack>

              <Button type="submit" variant="contained" color="primary" size="large" fullWidth>
                Sign In
              </Button>
            </Stack>

            <Stack spacing={2} sx={{ width: '100%', pt: 0.5 }}>
              <Stack direction="row" alignItems="center" spacing={1} sx={{ width: '100%' }}>
                <Box
                  sx={{
                    flex: 1,
                    borderBottom: '1px dashed',
                    borderColor: 'divider',
                    height: 0,
                  }}
                />
                <Typography
                  sx={{
                    fontSize: 12,
                    fontWeight: 500,
                    lineHeight: '16px',
                    color: 'text.disabled',
                  }}
                >
                  OR
                </Typography>
                <Box
                  sx={{
                    flex: 1,
                    borderBottom: '1px dashed',
                    borderColor: 'divider',
                    height: 0,
                  }}
                />
              </Stack>

              <Button
                type="button"
                variant="outlined"
                fullWidth
                size="large"
                startIcon={
                  <img
                    src={googleSocialIcon}
                    alt=""
                    width={20}
                    height={20}
                    style={{ display: 'block' }}
                  />
                }
                sx={socialLoginButtonSx}
              >
                Login with Google
              </Button>

              <Button
                type="button"
                variant="outlined"
                fullWidth
                size="large"
                startIcon={<Icon name="key" size="sm" />}
                sx={socialLoginButtonSx}
              >
                Login with SSO
              </Button>
            </Stack>

            <Typography
              component="p"
              sx={{ textAlign: 'center', fontSize: 14, fontWeight: 500, letterSpacing: '0.1px', m: 0 }}
            >
              <Box component="span" sx={{ color: 'text.primary' }}>
              New to Exotel?
            </Box>{' '}
              <Link href="/signup" underline="hover" sx={{ color: 'info.main', fontWeight: 500, fontSize: 14 }}>
                Sign up
              </Link>
            </Typography>
          </Stack>
        </Box>

        {/* Footer — height ~96, px 32 */}
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{
            flexShrink: 0,
            minHeight: 96,
            px: 4,
            py: 2,
          }}
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
              lineHeight: '20px',
              fontWeight: 400,
            }}
          >
            <Icon name="book-open" size="sm" />
            Help and Documentation
          </Link>
          <Typography sx={{ fontSize: 14, lineHeight: '20px', color: 'text.primary' }}>
            © Exotel 2026
          </Typography>
        </Stack>
      </Box>
    </Box>
  )
}
