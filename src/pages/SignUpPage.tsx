import { useState, type ChangeEvent, type SyntheticEvent } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
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

const LANG_FLAG =
  'https://www.figma.com/api/mcp/asset/2c305f9e-4c36-4cd9-848b-91eb19903d2f'

const FEATURE_CARDS = [
  {
    icon: 'phone',
    title: 'Voice & Calling',
    desc: 'Make and receive calls, build sophisticated call flows.',
  },
  {
    icon: 'microphone',
    title: 'AI Voice Workflows',
    desc: 'Automate sales, support, and service with AI agents.',
  },
  {
    icon: 'chats',
    title: 'Omnichannel Inbox',
    desc: 'SMS, chat, voice, and email in a single agent view.',
  },
  {
    icon: 'gear',
    title: 'Built for Admins',
    desc: 'Custom domains, webhooks, agent views — your way.',
  },
]

const TRUSTED_BRANDS = [
  { name: 'zomato', italic: false },
  { name: 'Swiggy', italic: false },
  { name: 'Uber', italic: false },
  { name: 'Flipkart', italic: false },
  { name: 'ixigo', italic: false },
  { name: 'ICICI', italic: true },
]

const COUNTRY_CODES = [
  { code: '+91' },
  { code: '+1' },
  { code: '+44' },
  { code: '+65' },
  { code: '+971' },
  { code: '+61' },
  { code: '+49' },
  { code: '+33' },
  { code: '+81' },
]

const COUNTRIES = [
  'India',
  'United States',
  'United Kingdom',
  'Singapore',
  'United Arab Emirates',
  'Australia',
  'Canada',
  'Germany',
  'France',
  'Japan',
  'Brazil',
  'South Africa',
  'Indonesia',
  'Philippines',
  'Malaysia',
  'Thailand',
]

export function SignUpPage() {
  return <Navigate to="/signup" replace />
}

export function SignUpPageFull() {
  const navigate = useNavigate()
  const { toggleMode } = useThemeMode()
  const brandLogo = useLoadDataByTheme(brandLogoDark, brandLogoLight)

  const [name, setName] = useState('')
  const [company, setCompany] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [countryCode, setCountryCode] = useState('+91')
  const [country, setCountry] = useState<string | null>('India')

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    navigate('/sign-in')
  }

  return (
    <Box
      sx={{
        display: 'flex',
        height: '100vh',
        flexDirection: { xs: 'column', md: 'row' },
        bgcolor: 'background.default',
        overflow: 'hidden',
      }}
    >
      {/* Left: feature content — same inset + rounding treatment as SignIn hero */}
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
            bgcolor: '#5B5BD6',
            display: 'flex',
            flexDirection: 'column',
            p: 4,
            gap: 2.5,
          }}
        >
          {/* Overline */}
          <Typography
            sx={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '1.8px',
              textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.55)',
            }}
          >
            Enterprise Contact Center
          </Typography>

          {/* Heading + subtitle */}
          <Stack spacing={1.5}>
            <Typography
              sx={{
                fontWeight: 800,
                fontSize: 28,
                lineHeight: 1.2,
                letterSpacing: '-0.4px',
                color: '#ffffff',
              }}
            >
              Launch a smarter contact center in minutes.
            </Typography>
            <Typography
              sx={{ fontSize: 14, lineHeight: 1.6, color: 'rgba(255,255,255,0.72)' }}
            >
              Voice, AI, and omnichannel — all from one dashboard. Go live in 2 minutes, scale to
              thousands of agents.
            </Typography>
          </Stack>

          {/* 2×2 feature cards */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 2,
            }}
          >
            {FEATURE_CARDS.map(({ icon, title, desc }) => (
              <Box
                key={title}
                sx={{
                  bgcolor: 'rgba(255,255,255,0.10)',
                  border: '1px solid rgba(255,255,255,0.14)',
                  borderRadius: '12px',
                  p: 2,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1.5,
                }}
              >
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    bgcolor: 'rgba(255,255,255,0.15)',
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
                      fontWeight: 700,
                      fontSize: 14,
                      color: '#ffffff',
                      lineHeight: 1.4,
                      mb: 0.5,
                    }}
                  >
                    {title}
                  </Typography>
                  <Typography
                    sx={{ fontSize: 13, color: 'rgba(255,255,255,0.68)', lineHeight: 1.55 }}
                  >
                    {desc}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>

          {/* Spacer */}
          <Box sx={{ flex: 1 }} />

          {/* Trusted by */}
          <Box>
            <Typography
              sx={{
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: '1.8px',
                textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.45)',
                mb: 1.5,
              }}
            >
              Trusted by India's fastest-growing companies
            </Typography>
            <Stack
              direction="row"
              flexWrap="wrap"
              sx={{ gap: '12px 24px', mb: 1.5 }}
            >
              {TRUSTED_BRANDS.map(({ name, italic }) => (
                <Typography
                  key={name}
                  sx={{
                    fontWeight: 700,
                    fontSize: 16,
                    color: '#ffffff',
                    lineHeight: 1.5,
                    fontStyle: italic ? 'italic' : 'normal',
                  }}
                >
                  {name}
                </Typography>
              ))}
            </Stack>
            <Typography sx={{ fontSize: 13, color: 'rgba(255,255,255,0.68)', lineHeight: 1.5 }}>
              <Box component="span" sx={{ fontWeight: 700, color: '#ffffff' }}>
                7,000+ businesses
              </Box>{' '}
              handle{' '}
              <Box component="span" sx={{ fontWeight: 700, color: '#ffffff' }}>
                1B+ conversations
              </Box>{' '}
              on Exotel each year
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Mobile: branded strip */}
      <Box
        sx={{
          display: { xs: 'block', md: 'none' },
          flexShrink: 0,
          px: 2,
          pt: 2,
        }}
      >
        <Box
          sx={{
            borderRadius: '16px',
            bgcolor: '#5B5BD6',
            p: 3,
          }}
        >
          <Typography
            sx={{
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: '1.6px',
              textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.55)',
              mb: 1,
            }}
          >
            Enterprise Contact Center
          </Typography>
          <Typography
            sx={{ fontWeight: 800, fontSize: 20, lineHeight: 1.2, color: '#ffffff', mb: 1 }}
          >
            Launch a smarter contact center in minutes.
          </Typography>
          <Typography sx={{ fontSize: 13, color: 'rgba(255,255,255,0.72)', lineHeight: 1.55 }}>
            Voice, AI, and omnichannel — all from one dashboard.
          </Typography>
        </Box>
      </Box>

      {/* Right: form column — mirrors SignIn right column exactly */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minHeight: 0,
          height: '100%',
          bgcolor: 'background.paper',
          color: 'text.primary',
          minWidth: 0,
          overflow: 'hidden',
        }}
      >
        {/* Header — identical to SignIn header */}
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{ px: 4, py: 2, flexShrink: 0 }}
        >
          <Box sx={{ minWidth: 0, display: 'flex', alignItems: 'center' }}>
            <img
              src={brandLogo}
              alt="Exotel"
              style={{ height: 40, width: 'auto', display: 'block' }}
            />
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

        {/* Centered form — max-width 420px, same padding as SignIn */}
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
          <Stack spacing={2} sx={{ width: '100%', maxWidth: 420, px: 2.5, py: 1, my: 'auto' }}>
            {/* Title + subtitle — exact same typography as SignIn */}
            <Stack spacing={0.75}>
              <Typography
                sx={{
                  fontWeight: 600,
                  fontSize: 28,
                  lineHeight: '32px',
                  letterSpacing: '-0.56px',
                  color: 'text.primary',
                }}
              >
                Hi there! 👋
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: 'text.secondary', lineHeight: '21px', fontSize: 14 }}
              >
                Create your account and get live in 2 mins
              </Typography>
            </Stack>

            {/* Form fields */}
            <Stack spacing={2} sx={{ width: '100%' }}>
              <EnhancedTextField
                label="Name"
                placeholder="Enter Your Name"
                value={name}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
                fullWidth
                size="large"
                required
                autoComplete="name"
              />

              <EnhancedTextField
                label="Company"
                placeholder="Enter Company Name"
                value={company}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setCompany(e.target.value)}
                fullWidth
                size="large"
                required
                autoComplete="organization"
              />

              <EnhancedTextField
                label="Email"
                placeholder="Enter Your Email ID"
                type="email"
                value={email}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                fullWidth
                size="large"
                required
                autoComplete="email"
              />

              {/* Phone Number with inline country-code picker */}
              <EnhancedTextField
                label="Phone Number"
                placeholder="Enter Your Phone Number"
                value={phone}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setPhone(e.target.value)}
                fullWidth
                size="large"
                required
                autoComplete="tel"
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
                            fontSize: 14,
                            fontWeight: 500,
                            color: 'text.primary',
                            minWidth: 52,
                            '& .MuiSelect-select': {
                              pr: '20px !important',
                              py: 0,
                              lineHeight: 'inherit',
                            },
                            '& .MuiSelect-icon': { right: 0 },
                          }}
                        >
                          {COUNTRY_CODES.map((c) => (
                            <MenuItem key={c.code} value={c.code} sx={{ fontSize: 14 }}>
                              {c.code}
                            </MenuItem>
                          ))}
                        </Select>
                        <MuiDivider
                          orientation="vertical"
                          flexItem
                          sx={{ mx: 1, height: 20, alignSelf: 'center' }}
                        />
                      </InputAdornment>
                    ),
                  },
                }}
              />

              {/* Primary Country of Operation */}
              <Autocomplete
                options={COUNTRIES}
                value={country}
                onChange={(_: SyntheticEvent, val: string | null) => setCountry(val)}
                renderInput={(params: object) => (
                  <EnhancedTextField
                    {...params}
                    label="Primary Country of Operation"
                    placeholder="Select Country"
                    size="large"
                    required
                  />
                )}
              />

              <Button
                type="submit"
                variant="contained"
                color="primary"
                size="large"
                fullWidth
                sx={{ fontWeight: 700, letterSpacing: '0.5px' }}
              >
                START MY FREE TRIAL
              </Button>
            </Stack>

            {/* Terms */}
            <Typography
              component="p"
              sx={{
                textAlign: 'center',
                fontSize: 12,
                lineHeight: 1.6,
                color: 'text.secondary',
                m: 0,
              }}
            >
              By clicking on the above button, you agree to our{' '}
              <Link href="#" underline="hover" sx={{ color: 'info.main', fontSize: 12 }}>
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link href="#" underline="hover" sx={{ color: 'info.main', fontSize: 12 }}>
                Privacy Policy
              </Link>
            </Typography>

            {/* Already a customer — below terms, centered */}
            <Typography
              component="p"
              sx={{
                textAlign: 'center',
                fontSize: 14,
                fontWeight: 500,
                letterSpacing: '0.1px',
                m: 0,
              }}
            >
              <Box component="span" sx={{ color: 'text.primary' }}>
                Already a customer?
              </Box>{' '}
              <Link
                href="/sign-in"
                underline="hover"
                sx={{ color: 'info.main', fontWeight: 600, fontSize: 14 }}
              >
                Login
              </Link>
            </Typography>
          </Stack>
        </Box>

        {/* Footer — identical to SignIn footer */}
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{
            flexShrink: 0,
            minHeight: 64,
            px: 4,
            py: 1.5,
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
