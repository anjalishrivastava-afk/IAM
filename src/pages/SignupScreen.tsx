import { useState, type ChangeEvent, type SyntheticEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import MuiDivider from '@mui/material/Divider'
import {
  Autocomplete,
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
import { useOnboarding } from '../context/OnboardingContext'
import {
  SCREEN1_COPY,
  LEFT_PANEL,
  FEATURE_CARDS,
  COUNTRY_CODES,
  COUNTRIES,
} from '../lib/onboardingCopy'

const LANG_FLAG = 'https://www.figma.com/api/mcp/asset/2c305f9e-4c36-4cd9-848b-91eb19903d2f'

export function SignupScreen() {
  const navigate = useNavigate()
  const { toggleMode } = useThemeMode()
  const brandLogo = useLoadDataByTheme(brandLogoDark, brandLogoLight)
  const { setFirstName } = useOnboarding()

  const [name, setName] = useState('Riti Singh')
  const [company, setCompany] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [countryCode, setCountryCode] = useState('+91')
  const [country, setCountry] = useState<string | null>('India')

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleProceed()
  }

  const handleProceed = () => {
    setFirstName(name.trim().split(' ')[0] || name.trim())
    navigate('/onboarding/role')
  }

  return (
    <Box
      sx={{
        display: 'flex',
        height: '100vh',
        flexDirection: { xs: 'column', md: 'row' },
        bgcolor: 'background.default',
        overflow: 'hidden',
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      }}
    >
      {/* ── Left panel (desktop) ─────────────────────────────────────── */}
      <Box
        sx={{
          display: { xs: 'none', md: 'flex' },
          width: { md: '50%' },
          maxWidth: { md: 720 },
          flexShrink: 0,
          p: '20px',
          boxSizing: 'border-box',
          height: '100%',
        }}
      >
        <Box
          sx={{
            flex: 1,
            height: '100%',
            borderRadius: '20px',
            overflow: 'hidden',
            background: 'linear-gradient(160deg, #4F5BD5 0%, #6A6FD8 55%, #8A8AD9 100%)',
            display: 'flex',
            flexDirection: 'column',
            p: 4,
            gap: 2.5,
            fontFamily: "'Inter', -apple-system, sans-serif",
          }}
        >
          {/* Eyebrow — 13px / 500 / 0.12em tracking */}
          <Typography
            sx={{
              fontSize: 13,
              fontWeight: 500,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.55)',
            }}
          >
            {LEFT_PANEL.eyebrow}
          </Typography>

          {/* Headline + subhead */}
          <Stack spacing={1.5}>
            <Typography
              sx={{
                fontWeight: 600,
                fontSize: 38,
                lineHeight: 1.15,
                letterSpacing: '-0.02em',
                color: '#ffffff',
              }}
            >
              {LEFT_PANEL.headline}
            </Typography>
            <Typography sx={{ fontSize: 16, lineHeight: 1.55, color: 'rgba(255,255,255,0.78)' }}>
              {LEFT_PANEL.subhead}
            </Typography>
          </Stack>

          {/* 2×2 feature cards */}
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            {FEATURE_CARDS.map(({ icon, title, desc }) => (
              <Box
                key={title}
                sx={{
                  bgcolor: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.14)',
                  borderRadius: '14px',
                  p: 2.5,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1.75,
                  backdropFilter: 'blur(10px)',
                }}
              >
                <Box
                  sx={{
                    width: 38,
                    height: 38,
                    bgcolor: 'rgba(255,255,255,0.18)',
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#ffffff',
                  }}
                >
                  <Icon name={icon} size="sm" />
                </Box>
                <Box>
                  <Typography
                    sx={{
                      fontWeight: 600,
                      fontSize: 15,
                      color: '#ffffff',
                      lineHeight: 1.4,
                      letterSpacing: '-0.01em',
                      mb: 0.5,
                    }}
                  >
                    {title}
                  </Typography>
                  <Typography sx={{ fontSize: 13, color: 'rgba(255,255,255,0.78)', lineHeight: 1.45 }}>
                    {desc}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>

          <Box sx={{ flex: 1 }} />

          {/* Trusted by */}
          <Box>
            <Typography
              sx={{
                fontSize: 12,
                fontWeight: 500,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.55)',
                mb: 2.25,
              }}
            >
              {LEFT_PANEL.trustedLabel}
            </Typography>
            <Stack direction="row" flexWrap="wrap" sx={{ gap: '10px 28px', mb: 2.75 }}>
              {LEFT_PANEL.trustedBrands.map(({ name: brand, italic }) => (
                <Typography
                  key={brand}
                  sx={{
                    fontWeight: 700,
                    fontSize: 18,
                    color: 'rgba(255,255,255,0.85)',
                    letterSpacing: '-0.02em',
                    lineHeight: 1,
                    fontStyle: italic ? 'italic' : 'normal',
                  }}
                >
                  {brand}
                </Typography>
              ))}
            </Stack>
            <Typography sx={{ fontSize: 13, color: 'rgba(255,255,255,0.78)', lineHeight: 1.5 }}>
              <Box component="span" sx={{ fontWeight: 600, color: '#ffffff' }}>
                7,000+ businesses
              </Box>{' '}
              handle{' '}
              <Box component="span" sx={{ fontWeight: 600, color: '#ffffff' }}>
                1B+ conversations
              </Box>{' '}
              on Exotel each year
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* ── Mobile branded strip ─────────────────────────────────────── */}
      <Box sx={{ display: { xs: 'block', md: 'none' }, flexShrink: 0, px: 2, pt: 2 }}>
        <Box sx={{
          borderRadius: '16px',
          background: 'linear-gradient(160deg, #4F5BD5 0%, #6A6FD8 55%, #8A8AD9 100%)',
          p: 3,
        }}>
          <Typography
            sx={{
              fontSize: 12, fontWeight: 500, letterSpacing: '0.12em',
              textTransform: 'uppercase', color: 'rgba(255,255,255,0.55)', mb: 1,
            }}
          >
            {LEFT_PANEL.eyebrow}
          </Typography>
          <Typography sx={{ fontWeight: 600, fontSize: 22, lineHeight: 1.2, letterSpacing: '-0.02em', color: '#ffffff', mb: 1 }}>
            {LEFT_PANEL.headline}
          </Typography>
          <Typography sx={{ fontSize: 14, color: 'rgba(255,255,255,0.78)', lineHeight: 1.55 }}>
            {LEFT_PANEL.subhead.split('.')[0]}.
          </Typography>
        </Box>
      </Box>

      {/* ── Right: form column ───────────────────────────────────────── */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          minHeight: 0,
          bgcolor: 'background.paper',
          color: 'text.primary',
          minWidth: 0,
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{ px: 4, py: 2, flexShrink: 0 }}
        >
          <Box sx={{ minWidth: 0, display: 'flex', alignItems: 'center' }}>
            <img src={brandLogo} alt="Exotel" style={{ height: 40, width: 'auto', display: 'block' }} />
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
                height: 34, px: '5px', py: 0.5,
                border: 1, borderColor: 'divider', borderRadius: 1,
                boxShadow: '0px 1px 2px 0px rgba(10,13,18,0.05)',
                bgcolor: 'background.paper',
              }}
            >
              <Box sx={{ width: 18, height: 13, position: 'relative', overflow: 'hidden', flexShrink: 0, borderRadius: 0.25 }}>
                <img
                  src={LANG_FLAG}
                  alt=""
                  style={{ position: 'absolute', height: '1982.82%', left: '-419.47%', top: '-394.86%', width: '767.88%', maxWidth: 'none' }}
                />
              </Box>
              <Typography sx={{ fontSize: 14, fontWeight: 500, lineHeight: '18px' }}>EN</Typography>
            </Stack>
          </Stack>
        </Stack>

        {/* Form area */}
        <Box
          component="form"
          onSubmit={onSubmit}
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            minHeight: 0,
            overflowY: 'auto',
            px: 4,
            py: 1,
          }}
        >
          <Stack spacing={2} sx={{ width: '100%', maxWidth: 420, px: 2.5, py: 1, my: 'auto', fontFamily: "'Inter', -apple-system, sans-serif" }}>
            <Stack spacing={1}>
              <Typography
                sx={{
                  fontWeight: 700,
                  fontSize: 32,
                  lineHeight: 1.15,
                  letterSpacing: '-0.02em',
                  color: 'text.primary',
                }}
              >
                {SCREEN1_COPY.title}
              </Typography>
              <Typography sx={{ color: 'text.secondary', lineHeight: 1.5, fontSize: 15 }}>
                {SCREEN1_COPY.subtitle}
              </Typography>
            </Stack>

            <Stack spacing={2} sx={{ width: '100%' }}>
              <EnhancedTextField
                label="Full Name"
                placeholder="Riti Singh"
                value={name}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
                fullWidth size="large" autoComplete="name"
              />
              <EnhancedTextField
                label="Company Name"
                placeholder="Enter Company Name"
                value={company}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setCompany(e.target.value)}
                fullWidth size="large" autoComplete="organization"
              />
              <EnhancedTextField
                label="Email ID"
                placeholder="Enter Your Email ID"
                type="email"
                value={email}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                fullWidth size="large" autoComplete="email"
              />

              {/* Phone with country code */}
              <EnhancedTextField
                label="Phone Number"
                placeholder="Phone Number"
                value={phone}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setPhone(e.target.value)}
                fullWidth size="large" autoComplete="tel"
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start" sx={{ mr: 0.5 }}>
                        <Select
                          value={countryCode}
                          onChange={(e) => setCountryCode(e.target.value as string)}
                          variant="standard"
                          disableUnderline
                          sx={{
                            fontSize: 14, fontWeight: 500, color: 'text.primary', minWidth: 52,
                            '& .MuiSelect-select': { pr: '20px !important', py: 0, lineHeight: 'inherit' },
                            '& .MuiSelect-icon': { right: 0 },
                          }}
                        >
                          {COUNTRY_CODES.map((c) => (
                            <MenuItem key={c.code} value={c.code} sx={{ fontSize: 14 }}>{c.code}</MenuItem>
                          ))}
                        </Select>
                        <MuiDivider orientation="vertical" flexItem sx={{ mx: 1, height: 20, alignSelf: 'center' }} />
                      </InputAdornment>
                    ),
                  },
                }}
              />

              {/* Country of Operation */}
              <Autocomplete
                options={COUNTRIES}
                value={country}
                onChange={(_: SyntheticEvent, val: string | null) => setCountry(val)}
                renderInput={(params: object) => (
                  <EnhancedTextField {...params} label="Country of Operation" placeholder="Select Country" size="large" />
                )}
              />

              <Button
                type="button"
                variant="contained"
                color="primary"
                size="large"
                fullWidth
                onClick={handleProceed}
                sx={{ fontWeight: 700, letterSpacing: '0.3px' }}
              >
                {SCREEN1_COPY.cta}
              </Button>
            </Stack>

            {/* Terms */}
            <Typography
              component="p"
              sx={{ textAlign: 'center', fontSize: 12, lineHeight: 1.6, color: 'text.secondary', m: 0 }}
            >
              {SCREEN1_COPY.terms}{' '}
              <Link href="#" underline="always" sx={{ color: 'info.main', fontSize: 12 }}>
                Terms of Service
              </Link>
              ,{' '}
              <Link href="#" underline="always" sx={{ color: 'info.main', fontSize: 12 }}>
                Privacy Policy
              </Link>{' '}
              and{' '}
              <Link href="#" underline="always" sx={{ color: 'info.main', fontSize: 12 }}>
                Cookie Notice
              </Link>
            </Typography>

            {/* Already a customer */}
            <Typography
              component="p"
              sx={{ textAlign: 'center', fontSize: 14, fontWeight: 500, letterSpacing: '0.1px', m: 0 }}
            >
              <Box component="span" sx={{ color: 'text.primary' }}>
                {SCREEN1_COPY.alreadyCustomer}
              </Box>{' '}
              <Link href="/sign-in" underline="hover" sx={{ color: 'info.main', fontWeight: 600, fontSize: 14 }}>
                {SCREEN1_COPY.loginLink}
              </Link>
            </Typography>
          </Stack>
        </Box>

        {/* Footer */}
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
            sx={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'info.main', fontSize: 14, fontWeight: 400 }}
          >
            <Icon name="book-open" size="sm" />
            Help and Documentation
          </Link>
          <Typography sx={{ fontSize: 14, color: 'text.primary' }}>© Exotel 2026</Typography>
        </Stack>
      </Box>
    </Box>
  )
}
