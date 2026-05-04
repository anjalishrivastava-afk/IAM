import { useState, type ChangeEvent, type SyntheticEvent } from 'react'
import type { AutocompleteRenderGetTagProps } from '@mui/material/Autocomplete'
import type { Theme } from '@mui/material/styles'
import {
  Autocomplete,
  Box,
  Checkbox,
  Chip,
  Divider,
  EnhancedTextField,
  FormControlLabel,
  FormGroup,
  FormHelperText,
  FormLabel,
  Icon,
  IconButton,
  Link,
  PageHeader,
  Paper,
  Radio,
  RadioGroup,
  Stack,
  Switch,
  Tab,
  Tabs,
  Typography,
} from '@exotel-npm-dev/signal-design-system'

/** Figma MCP asset URLs (node 14346:12195) — promotional banner artwork */
const BANNER_IMAGE_PRIMARY =
  'https://www.figma.com/api/mcp/asset/88df326d-7c52-4471-b867-16f507a7f118'
const BANNER_IMAGE_SECONDARY =
  'https://www.figma.com/api/mcp/asset/77d88213-429b-4852-8014-094baffd5519'

const profileOptions = [
  { id: '1', label: 'Option 1', value: 'opt1' },
  { id: '2', label: 'Option 2', value: 'opt2' },
  { id: '3', label: 'Option 3', value: 'opt3' },
  { id: '4', label: 'Option 4', value: 'opt4' },
]

type ProfileOption = (typeof profileOptions)[number]

function SettingRow({
  title,
  description,
  children,
}: {
  title: string
  description?: string
  children: React.ReactNode
}) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        alignItems: 'flex-start',
        gap: { xs: 2, md: '200px' },
        width: '100%',
      }}
    >
      <Box sx={{ width: { md: 324 }, maxWidth: '100%', flexShrink: 0 }}>
        <Typography
          color="text.primary"
          sx={{ fontWeight: 600, fontSize: 14, lineHeight: 1.57, letterSpacing: '0.1px' }}
        >
          {title}
        </Typography>
        {description ? (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {description}
          </Typography>
        ) : null}
      </Box>
      <Box sx={{ width: { md: 506 }, maxWidth: '100%', flexShrink: 0 }}>{children}</Box>
    </Box>
  )
}

export function ExampleSettingsPage() {
  const [channelTab, setChannelTab] = useState(1)
  const [bannerOpen, setBannerOpen] = useState(true)
  const [whatsappEnabled, setWhatsappEnabled] = useState(true)
  const [demoField, setDemoField] = useState('Value')
  const [autoAnswer, setAutoAnswer] = useState('enable')
  const [profiles, setProfiles] = useState<ProfileOption[]>(() => [...profileOptions])
  const [checks, setChecks] = useState({ l1: true, l2: false, l3: false })

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 1,
        minHeight: '100%',
        display: 'flex',
        flexDirection: 'column',
        padding: 1,
        overflow: 'hidden',
        bgcolor: 'surface.elevation1',
      }}
    >
        <PageHeader
          title="Channel Configuration"
          subtitle="Select communication channel and configure channel settings"
          actions={[
            { id: 'discard', variant: 'outlined', color: 'error', children: 'Discard' },
            { id: 'save', variant: 'contained', color: 'primary', children: 'Save' },
          ]}
        />
        <Divider />

      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        <Box
          sx={{
            borderBottom: 1,
            borderColor: 'divider',
            // Inherit Paper surface — avoid sx `bgcolor: 'background.paper'` here, which can
            // resolve to the light palette under CSS-variables theming while MuiPaper uses
            // the active scheme (shows as a white tab strip in dark mode).
            position: 'sticky',
            zIndex: 1,
          }}
        >
          <Tabs
            value={channelTab}
            onChange={(_: SyntheticEvent, v: number) => setChannelTab(v)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              mb: '-1px',
              bgcolor: 'transparent',
              '& .MuiTabs-scroller': { bgcolor: 'transparent' },
              '& .MuiTabs-list, & .MuiTabs-flexContainer': { bgcolor: 'transparent' },
              '& .MuiTabScrollButton-root': { bgcolor: 'transparent' },
            }}
          >
            <Tab icon={<Icon name="phone" size="sm" />} iconPosition="start" label="Call" />
            <Tab
              icon={<Icon name="whatsapp-logo" size="sm" />}
              iconPosition="start"
              label="Whatsapp"
            />
            <Tab icon={<Icon name="envelope-simple" size="sm" />} iconPosition="start" label="Mail" />
            <Tab icon={<Icon name="chat-teardrop" size="sm" />} iconPosition="start" label="Web Chat" />
            <Tab
              icon={<Icon name="share-network" size="sm" />}
              iconPosition="start"
              label="Social Media"
            />
          </Tabs>
        </Box>

        <Box sx={{ flex: 1, p: 1, overflow: 'auto' }}>
          <Stack sx={{ gap: '42px', mt: 1}}>
            {bannerOpen ? (
              <Stack direction="row" sx={{ alignItems: 'stretch', borderRadius: 1.5, overflow: 'hidden' }}>
                <Box
                  sx={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: 2,
                    pl: { xs: 2, md: 4 },
                    pr: 1,
                    py: 2,
                    bgcolor: (t: Theme) =>
                      t.palette.mode === 'light' ? 'rgba(46, 125, 50, 0.08)' : 'rgba(46, 125, 50, 0.12)',
                  }}
                >
                  <Stack spacing={2} sx={{ maxWidth: 480, minWidth: 220 }}>
                    <Stack spacing={1.25}>
                      <Typography
                        sx={{
                          fontWeight: 700,
                          fontSize: 20,
                          lineHeight: 1.334,
                          letterSpacing: 0,
                          color: 'text.primary',
                        }}
                      >
                        Integrate{' '}
                        <Box component="span" sx={{ color: '#40c451' }}>
                          WhatsApp
                        </Box>{' '}
                        for Faster Support!!
                      </Typography>
                      <Typography variant="body2" color="text.primary">
                        Handle inbound queries and deliver personalized outbound messages with two-way
                        messaging.
                      </Typography>
                    </Stack>
                    <Stack spacing={1.375}>
                      <Link
                        component="button"
                        type="button"
                        variant="body2"
                        underline="hover"
                        onClick={() => {}}
                        sx={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px',
                          fontSize: 12,
                          lineHeight: 1.57,
                          letterSpacing: '0.1px',
                          fontWeight: 500,
                          textAlign: 'left',
                        }}
                      >
                        <Icon name="book-open" size="xs" />
                        How to connect your business profile
                      </Link>
                      <Link
                        component="button"
                        type="button"
                        variant="body2"
                        underline="hover"
                        onClick={() => {}}
                        sx={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px',
                          fontSize: 12,
                          lineHeight: 1.57,
                          letterSpacing: '0.1px',
                          fontWeight: 500,
                          textAlign: 'left',
                        }}
                      >
                        <Icon name="book-open" size="xs" />
                        Create WhatsApp Templates
                      </Link>
                    </Stack>
                  </Stack>
                  <Box
                    sx={{
                      position: 'relative',
                      width: { xs: '100%', sm: 280, md: 400 },
                      height: 211,
                      flexShrink: 0,
                      borderRadius: 1,
                      overflow: 'hidden',
                      bgcolor: 'transparent',
                    }}
                  >
                    <Box
                      sx={{
                        position: 'absolute',
                        border: '2px solid #c6e5ae',
                        borderRadius: '10px',
                        width: 192,
                        height: 141,
                        left: 26,
                        top: -6,
                        overflow: 'hidden',
                      }}
                    >
                      <img
                        src={BANNER_IMAGE_SECONDARY}
                        alt=""
                        style={{
                          position: 'absolute',
                          height: '534%',
                          width: '100%',
                          left: 0,
                          top: '-320%',
                          objectFit: 'cover',
                        }}
                      />
                    </Box>
                    <Box
                      sx={{
                        position: 'absolute',
                        border: '2px solid #c6e5ae',
                        borderRadius: '10px',
                        width: 256,
                        height: 509,
                        left: { xs: 120, md: 178 },
                        top: -318,
                        overflow: 'hidden',
                      }}
                    >
                      <img
                        src={BANNER_IMAGE_PRIMARY}
                        alt=""
                        style={{
                          position: 'absolute',
                          height: '100%',
                          width: '216%',
                          left: 0,
                          top: 0,
                          objectFit: 'cover',
                        }}
                      />
                    </Box>
                  </Box>
                </Box>
                <Box
                  sx={{
                    width: 32,
                    flexShrink: 0,
                    bgcolor: (t: Theme) =>
                      t.palette.mode === 'light' ? 'rgba(46, 125, 50, 0.08)' : 'rgba(46, 125, 50, 0.12)',
                    pt: 1,
                    pr: 1,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'flex-start'
                  }}
                >
                  <IconButton size="small" aria-label="Dismiss banner" onClick={() => setBannerOpen(false)}>
                    <Icon name="x" size="sm" />
                  </IconButton>
                </Box>
              </Stack>
            ) : null}

            <Stack sx={{ gap: '24px' }}>
              <SettingRow
                title="Enable WhatsApp Channel"
                description="Contact customers or allow customers to connect via WhatsApp messaging."
              >
                <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                  <Switch
                    checked={whatsappEnabled}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setWhatsappEnabled(e.target.checked)}
                    color="primary"
                    size="medium"
                  />
                  <Typography variant="body2" color="text.primary">
                    {whatsappEnabled ? 'Enabled' : 'Disabled'}
                  </Typography>
                </Stack>
              </SettingRow>

              <Divider />

              <SettingRow title="WhatsApp Charges per SMS">
                <Link
                  href="#"
                  variant="body2"
                  color="info"
                  sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: 14,
                    lineHeight: 1.43,
                    letterSpacing: '0.17px',
                  }}
                >
                  WhatsApp Pricing
                  <Icon name="arrow-square-out" size="xs" />
                </Link>
              </SettingRow>

              <Divider />

              <SettingRow
                title="Enable WhatsApp Channel"
                description="Contact customers or allow customers to connect via WhatsApp messaging."
              >
                <EnhancedTextField
                  label="Text Field"
                  value={demoField}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setDemoField(e.target.value)}
                  size="medium"
                  fullWidth
                />
              </SettingRow>

              <Divider />

              <SettingRow
                title="Auto Answer"
                description="Automatically connect incoming calls to agents without manual pickup"
              >
                <RadioGroup value={autoAnswer} onChange={(e: ChangeEvent<HTMLInputElement>) => setAutoAnswer(e.target.value)} sx={{ pb: '12px', gap: 0 }}>
                  <FormControlLabel
                    value="enable"
                    control={<Radio color="primary" size="medium" />}
                    label="Enable"
                    sx={{ '& .MuiFormControlLabel-label': { typography: 'body2', letterSpacing: '0.17px' } }}
                  />
                  <FormControlLabel
                    value="disable"
                    control={<Radio color="primary" size="medium" />}
                    label="Disable"
                    sx={{ '& .MuiFormControlLabel-label': { typography: 'body2', letterSpacing: '0.17px' } }}
                  />
                  <FormControlLabel
                    value="inherit"
                    control={<Radio color="primary" size="medium" />}
                    label="Inherit from Parent"
                    sx={{ '& .MuiFormControlLabel-label': { typography: 'body2', letterSpacing: '0.17px' } }}
                  />
                </RadioGroup>
              </SettingRow>

              <Divider />

              <SettingRow
                title="Whatsapp Profile"
                description="Record and store calls for compliance, training, and review"
              >
                <Autocomplete
                  multiple
                  label="Option"
                  id="whatsapp-profile-autocomplete"
                  options={profileOptions}
                  value={profiles}
                  onChange={(_e: SyntheticEvent, v: ProfileOption[]) => setProfiles(v)}
                  getOptionLabel={(o: ProfileOption) => o.label}
                  isOptionEqualToValue={(a: ProfileOption, b: ProfileOption) => a.value === b.value}
                  fullWidth
                  size="medium"
                  renderTags={(tagValue: ProfileOption[], getTagProps: AutocompleteRenderGetTagProps) => {
                    const maxVisible = 2
                    const shown = tagValue.slice(0, maxVisible)
                    const extra = tagValue.length - maxVisible
                    return (
                      <>
                        {shown.map((option: ProfileOption, index: number) => (
                          <Chip {...getTagProps({ index })} key={option.value} label={option.label} size="small" />
                        ))}
                        {extra > 0 ? (
                          <Typography
                            variant="body2"
                            color="text.primary"
                            component="span"
                            sx={{ alignSelf: 'center', ml: 0.5, letterSpacing: '0.17px' }}
                          >
                            +{extra}
                          </Typography>
                        ) : null}
                      </>
                    )
                  }}
                />
              </SettingRow>

              <Divider />

              <SettingRow
                title="Checkbox Example"
                description="Record and store calls for compliance, training, and review"
              >
                <FormGroup
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                  }}
                >
                  <FormLabel sx={{ mb: 0, typography: 'body2', color: 'text.primary', letterSpacing: '0.17px' }}>
                    Select
                  </FormLabel>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={checks.l1}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => setChecks((c) => ({ ...c, l1: e.target.checked }))}
                        color="primary"
                        size="medium"
                      />
                    }
                    label="Label 1"
                    sx={{ '& .MuiFormControlLabel-label': { typography: 'body2', letterSpacing: '0.17px' } }}
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={checks.l2}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => setChecks((c) => ({ ...c, l2: e.target.checked }))}
                        color="primary"
                        size="medium"
                      />
                    }
                    label="Label 2"
                    sx={{ '& .MuiFormControlLabel-label': { typography: 'body2', letterSpacing: '0.17px' } }}
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={checks.l3}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => setChecks((c) => ({ ...c, l3: e.target.checked }))}
                        color="primary"
                        size="medium"
                      />
                    }
                    label="Label 3"
                    sx={{ '& .MuiFormControlLabel-label': { typography: 'body2', letterSpacing: '0.17px' } }}
                  />
                  <FormHelperText sx={{ typography: 'caption', color: 'text.secondary', m: 0, mt: '3px' }}>
                    Helper text
                  </FormHelperText>
                </FormGroup>
              </SettingRow>
            </Stack>
          </Stack>
        </Box>
      </Box>
    </Paper>
  )
}
