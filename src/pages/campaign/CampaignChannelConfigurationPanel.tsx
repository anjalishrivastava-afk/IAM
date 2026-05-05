/**
 * Campaign Channel Configuration — Figma Create-Campaign frame 656:21859 (layout matches Basic Settings rhythm).
 */
import { type ChangeEvent, type ReactElement, type SyntheticEvent } from 'react'
import type { SxProps, Theme } from '@mui/material/styles'
import FormControlLabel from '@mui/material/FormControlLabel'
import InputAdornment from '@mui/material/InputAdornment'
import MenuItem from '@mui/material/MenuItem'
import Radio from '@mui/material/Radio'
import RadioGroup from '@mui/material/RadioGroup'
import {
  ARCHBEE_DOC_VOICEMAIL_CONFIGURATION,
  openArchbeeDoc,
} from '../../integrations/archbeeWidget'

import {
  Box,
  Button,
  Checkbox,
  Divider,
  EnhancedTextField,
  Icon,
  Stack,
  Switch,
  Tab,
  Tabs,
  Tooltip,
  Typography,
} from '@exotel-npm-dev/signal-design-system'

const SECTION_LEFT_COL_MAX_PX = 324
const SECTION_GAP_PX = 200
const SECTION_RIGHT_COL_MAX_PX = 506

const SECTION_ROW_LAYOUT = {
  display: 'flex',
  flexDirection: { xs: 'column', md: 'row' },
  alignItems: 'flex-start',
  gap: { xs: 2, md: `${SECTION_GAP_PX}px` },
  py: { xs: 2, md: 2.5 },
} as const

const SECTION_ASIDE_BOX = {
  flexShrink: 0,
  width: '100%',
  maxWidth: { md: SECTION_LEFT_COL_MAX_PX },
}

const SECTION_CONTENT_STACK = {
  flexShrink: 0,
  width: '100%',
  minWidth: 0,
  maxWidth: { md: SECTION_RIGHT_COL_MAX_PX },
}

const VOICEMAIL_PROMPT_OPTIONS = ['Standard finish prompt', 'Custom finish prompt']
const NOTIFY_EMAIL_OPTIONS = ['ops-team@moneyassure.com', 'campaign-alerts@moneyassure.com']

function emptySelectDisplay(placeholder: string) {
  return (selected: unknown) =>
    selected != null && String(selected).trim() !== '' ? (
      String(selected)
    ) : (
      <Typography variant="body2" color="text.secondary">
        {placeholder}
      </Typography>
    )
}

const VIEW_MODE_TOOLTIP = 'You are in view mode'

function ViewModeDisabledWrap({
  viewOnly,
  wrapperSx,
  children,
}: {
  viewOnly: boolean
  wrapperSx?: SxProps<Theme>
  children: ReactElement
}) {
  if (!viewOnly) return children
  return (
    <Tooltip title={VIEW_MODE_TOOLTIP} placement="top">
      <Box component="span" sx={[{ cursor: 'not-allowed' }, ...(wrapperSx ? [wrapperSx] : [])]}>
        {children}
      </Box>
    </Tooltip>
  )
}

function SectionRow({ aside, children }: { aside: React.ReactNode; children: React.ReactNode }) {
  return (
    <Box sx={SECTION_ROW_LAYOUT}>
      <Box sx={SECTION_ASIDE_BOX}>{aside}</Box>
      <Stack spacing={2} sx={SECTION_CONTENT_STACK}>
        {children}
      </Stack>
    </Box>
  )
}

export type ChannelTabKey = 'call' | 'whatsapp' | 'mail' | 'webchat' | 'social'

export type CampaignChannelFormState = {
  callEnabled: boolean
  acwSeconds: string
  acwDualConfig: boolean
  peakCount: string
  voiceLogEnabled: boolean
  playPeriodicBeep: boolean
  autoAnswer: 'enable' | 'disable' | 'inherit'
  voicemailFinish: string
  voicemailStart: string
  notifyEmailIds: string
}

export const INITIAL_CAMPAIGN_CHANNEL_FORM: CampaignChannelFormState = {
  callEnabled: true,
  acwSeconds: '',
  acwDualConfig: true,
  peakCount: '',
  voiceLogEnabled: true,
  playPeriodicBeep: true,
  autoAnswer: 'enable',
  voicemailFinish: '',
  voicemailStart: '',
  notifyEmailIds: '',
}

const tabsSx = (theme: Theme) => ({
  minHeight: 48,
  '& .MuiTab-root': {
    minHeight: 48,
    textTransform: 'none' as const,
    fontWeight: 500,
    fontSize: theme.typography.pxToRem(14),
  },
  '& .Mui-selected': {
    color: 'primary.main',
  },
})

export function serializeCampaignChannelForm(form: CampaignChannelFormState): string {
  return JSON.stringify(form)
}

export function CampaignChannelConfigurationPanel({
  viewOnly,
  form,
  onPatch,
  channelTab,
  onChannelTabChange,
  onSectionEdit,
}: {
  viewOnly: boolean
  form: CampaignChannelFormState
  onPatch: (patch: Partial<CampaignChannelFormState>) => void
  channelTab: ChannelTabKey
  onChannelTabChange: (k: ChannelTabKey) => void
  onSectionEdit?: () => void
}) {
  return (
    <Box
      sx={{
        flex: '1 1 0%',
        minHeight: 0,
        width: '100%',
        minWidth: 0,
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'background.paper',
      }}
    >
      <Box sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Box sx={{ p: 1.5, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Stack direction="row" alignItems="flex-start" justifyContent="space-between" spacing={2}>
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="title2" component="h2">
                Channel Configuration
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                Select communication channel and configure channel settings
              </Typography>
            </Box>
            <Stack direction="row" spacing={1} alignItems="center" flexShrink={0}>
              {viewOnly && onSectionEdit ?
                <Button
                  variant="outlined"
                  color="neutral"
                  size="medium"
                  startIcon={<Icon name="pencil-simple-line" size="sm" />}
                  onClick={() => onSectionEdit()}
                >
                  Edit
                </Button>
              : null}
              <ViewModeDisabledWrap viewOnly={viewOnly} wrapperSx={{ flexShrink: 0 }}>
                <Button
                  variant="tonal"
                  color="primary"
                  size="medium"
                  startIconProps={{ name: 'copy-simple', size: 'sm' }}
                  disabled={viewOnly}
                  onClick={() => {
                    onPatch({ ...INITIAL_CAMPAIGN_CHANNEL_FORM })
                  }}
                >
                  Copy from other Campaigns
                </Button>
              </ViewModeDisabledWrap>
            </Stack>
          </Stack>

          <Box sx={{ mx: -1.5 }}>
            <Box
              sx={{
                flexShrink: 0,
                borderBottom: 1,
                borderColor: 'divider',
                px: { xs: 1.5, sm: 2 },
                bgcolor: 'background.paper',
              }}
            >
              <Tabs
                value={channelTab}
                onChange={(_: SyntheticEvent, v: string | number) => onChannelTabChange(v as ChannelTabKey)}
                aria-label="Channel types"
                variant="scrollable"
                scrollButtons="auto"
                sx={(theme: Theme) => tabsSx(theme)}
              >
                <Tab
                  value="call"
                  icon={<Icon name="phone" size="sm" />}
                  iconPosition="start"
                  label="Call"
                />
                <Tab
                  value="whatsapp"
                  icon={<Icon name="whatsapp-logo" size="sm" />}
                  iconPosition="start"
                  label="Whatsapp"
                />
                <Tab value="mail" icon={<Icon name="envelope-simple" size="sm" />} iconPosition="start" label="Mail" />
                <Tab
                  value="webchat"
                  icon={<Icon name="chat-teardrop" size="sm" />}
                  iconPosition="start"
                  label="Web Chat"
                />
                <Tab
                  value="social"
                  icon={<Icon name="share-network" size="sm" />}
                  iconPosition="start"
                  label="Social Media"
                />
              </Tabs>
            </Box>
          </Box>
        </Box>

        <Box sx={{ flex: 1, minHeight: 0, overflow: 'auto', px: 1.5, pb: 2, pt: 0 }}>
          {channelTab !== 'call' ? (
            <Box sx={{ py: 4, px: 1 }}>
              <Typography variant="body2" color="text.secondary">
                {channelTab === 'whatsapp' && 'WhatsApp channel settings will appear here when connected.'}
                {channelTab === 'mail' && 'Mail channel settings will appear here when connected.'}
                {channelTab === 'webchat' && 'Web Chat channel settings will appear here when connected.'}
                {channelTab === 'social' && 'Social media channel settings will appear here when connected.'}
              </Typography>
            </Box>
          ) : (
            <Stack divider={<Divider flexItem />} spacing={0}>
              <SectionRow
                aside={
                  <>
                    <Typography variant="title3" component="h3">
                      Enable Call Channel
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                      Turn on voice calling for this campaign
                    </Typography>
                  </>
                }
              >
                <ViewModeDisabledWrap viewOnly={viewOnly} wrapperSx={{ display: 'inline-flex' }}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Switch
                      checked={form.callEnabled}
                      disabled={viewOnly}
                      onChange={(_ev: SyntheticEvent, checked: boolean) => onPatch({ callEnabled: checked })}
                    />
                    <Typography variant="body2">{form.callEnabled ? 'Enabled' : 'Disabled'}</Typography>
                  </Stack>
                </ViewModeDisabledWrap>
              </SectionRow>

              <SectionRow
                aside={
                  <>
                    <Typography variant="title3" component="h3">
                      After Call Work (ACW)
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                      Allow agents time to complete notes or tasks after a call ends
                    </Typography>
                  </>
                }
              >
                <ViewModeDisabledWrap viewOnly={viewOnly} wrapperSx={{ display: 'block', width: '100%' }}>
                  <EnhancedTextField
                    label="Time"
                    type="number"
                    value={form.acwSeconds}
                    disabled={viewOnly}
                    placeholder="Time"
                    onChange={(e: ChangeEvent<HTMLInputElement>) => onPatch({ acwSeconds: e.target.value })}
                    fullWidth
                    size="medium"
                    slotProps={{
                      input: {
                        endAdornment: <InputAdornment position="end">secs</InputAdornment>,
                      },
                    }}
                  />
                </ViewModeDisabledWrap>
                <ViewModeDisabledWrap viewOnly={viewOnly} wrapperSx={{ display: 'inline-flex' }}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={form.acwDualConfig}
                        disabled={viewOnly}
                        onChange={(_e: ChangeEvent<HTMLInputElement>, checked: boolean) =>
                          onPatch({ acwDualConfig: checked })}
                      />
                    }
                    label={
                      <Typography variant="body2">
                        Configure For Connected and Not Connected Calls
                      </Typography>
                    }
                  />
                </ViewModeDisabledWrap>
              </SectionRow>

              <SectionRow
                aside={
                  <>
                    <Typography variant="title3" component="h3">
                      Peak Count
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                      Set the maximum number of simultaneous active calls allowed
                    </Typography>
                  </>
                }
              >
                <ViewModeDisabledWrap viewOnly={viewOnly} wrapperSx={{ display: 'block', width: '100%' }}>
                  <EnhancedTextField
                    label="Peak Count"
                    type="number"
                    value={form.peakCount}
                    disabled={viewOnly}
                    placeholder="Peak Count"
                    onChange={(e: ChangeEvent<HTMLInputElement>) => onPatch({ peakCount: e.target.value })}
                    fullWidth
                    size="medium"
                  />
                </ViewModeDisabledWrap>
              </SectionRow>

              <SectionRow
                aside={
                  <>
                    <Typography variant="title3" component="h3">
                      Voice Log
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                      Record and store calls for compliance, training, and review
                    </Typography>
                  </>
                }
              >
                <ViewModeDisabledWrap viewOnly={viewOnly} wrapperSx={{ display: 'inline-flex' }}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Switch
                      checked={form.voiceLogEnabled}
                      disabled={viewOnly}
                      onChange={(_ev: SyntheticEvent, checked: boolean) =>
                        onPatch({ voiceLogEnabled: checked })}
                    />
                    <Typography variant="body2">Enable Voice Log</Typography>
                  </Stack>
                </ViewModeDisabledWrap>
                <ViewModeDisabledWrap viewOnly={viewOnly} wrapperSx={{ display: 'inline-flex' }}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Switch
                      checked={form.playPeriodicBeep}
                      disabled={viewOnly}
                      onChange={(_ev: SyntheticEvent, checked: boolean) =>
                        onPatch({ playPeriodicBeep: checked })}
                    />
                    <Typography variant="body2">Play Periodic Beep</Typography>
                  </Stack>
                </ViewModeDisabledWrap>
              </SectionRow>

              <SectionRow
                aside={
                  <>
                    <Typography variant="title3" component="h3">
                      Auto Answer
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                      Automatically connect incoming calls to agents without manual pickup.
                    </Typography>
                  </>
                }
              >
                <ViewModeDisabledWrap viewOnly={viewOnly} wrapperSx={{ display: 'block', width: '100%' }}>
                  <RadioGroup
                    value={form.autoAnswer}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      onPatch({ autoAnswer: e.target.value as CampaignChannelFormState['autoAnswer'] })}
                  >
                    <FormControlLabel
                      value="enable"
                      disabled={viewOnly}
                      control={<Radio size="small" color="primary" />}
                      label={<Typography variant="body2">Enable</Typography>}
                    />
                    <FormControlLabel
                      value="disable"
                      disabled={viewOnly}
                      control={<Radio size="small" color="primary" />}
                      label={<Typography variant="body2">Disable</Typography>}
                    />
                    <FormControlLabel
                      value="inherit"
                      disabled={viewOnly}
                      control={<Radio size="small" color="primary" />}
                      label={<Typography variant="body2">Inherit from Parent</Typography>}
                    />
                  </RadioGroup>
                </ViewModeDisabledWrap>
              </SectionRow>

              <SectionRow
                aside={
                  <Stack spacing={1.25}>
                    <Box>
                      <Typography variant="title3" component="h3">
                        Voicemail Configuration
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                        Capture messages when agents are unavailable to answer calls
                      </Typography>
                    </Box>
                    <Box
                      component="button"
                      type="button"
                      onClick={() => openArchbeeDoc(ARCHBEE_DOC_VOICEMAIL_CONFIGURATION)}
                      sx={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 0.75,
                        m: 0,
                        p: 0,
                        border: 'none',
                        bgcolor: 'transparent',
                        cursor: 'pointer',
                        font: 'inherit',
                        textAlign: 'left',
                        '&:focus-visible': { outline: '2px solid', outlineOffset: 2 },
                      }}
                      aria-label="Open documentation: Understanding Voicemail Configuration"
                    >
                      <Icon name="book-open" size="sm" sx={{ color: 'info.main' }} aria-hidden />
                      <Typography
                        variant="caption"
                        component="span"
                        sx={{
                          fontWeight: 500,
                          color: 'info.main',
                          textDecoration: 'underline',
                          textUnderlineOffset: 2,
                        }}
                      >
                        Understanding Voicemail Configuration
                      </Typography>
                    </Box>
                  </Stack>
                }
              >
                <ViewModeDisabledWrap viewOnly={viewOnly} wrapperSx={{ display: 'block', width: '100%' }}>
                  <Stack spacing={2}>
                    <EnhancedTextField
                      select
                      label="Finish Voice Mail Prompt"
                      value={form.voicemailFinish}
                      disabled={viewOnly}
                      fullWidth
                      size="medium"
                      onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        onPatch({ voicemailFinish: String(e.target.value) })}
                      SelectProps={{
                        displayEmpty: true,
                        renderValue: emptySelectDisplay('Finish Voice Mail Prompt'),
                      }}
                    >
                      <MenuItem value="">
                        <em>Select prompt</em>
                      </MenuItem>
                      {VOICEMAIL_PROMPT_OPTIONS.map((o) => (
                        <MenuItem key={o} value={o}>
                          {o}
                        </MenuItem>
                      ))}
                    </EnhancedTextField>
                    <EnhancedTextField
                      select
                      label="Start Voice Mail Prompt"
                      value={form.voicemailStart}
                      disabled={viewOnly}
                      fullWidth
                      size="medium"
                      onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        onPatch({ voicemailStart: String(e.target.value) })}
                      SelectProps={{
                        displayEmpty: true,
                        renderValue: emptySelectDisplay('Start Voice Mail Prompt'),
                      }}
                    >
                      <MenuItem value="">
                        <em>Select prompt</em>
                      </MenuItem>
                      {VOICEMAIL_PROMPT_OPTIONS.map((o) => (
                        <MenuItem key={`s-${o}`} value={o}>
                          {o}
                        </MenuItem>
                      ))}
                    </EnhancedTextField>
                    <EnhancedTextField
                      select
                      label="Notify Email IDs"
                      value={form.notifyEmailIds}
                      disabled={viewOnly}
                      fullWidth
                      size="medium"
                      onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        onPatch({ notifyEmailIds: String(e.target.value) })}
                      SelectProps={{
                        displayEmpty: true,
                        renderValue: emptySelectDisplay('Notify Email IDs'),
                      }}
                    >
                      <MenuItem value="">
                        <em>Select</em>
                      </MenuItem>
                      {NOTIFY_EMAIL_OPTIONS.map((o) => (
                        <MenuItem key={o} value={o}>
                          {o}
                        </MenuItem>
                      ))}
                    </EnhancedTextField>
                  </Stack>
                </ViewModeDisabledWrap>
              </SectionRow>
            </Stack>
          )}
        </Box>
      </Box>
    </Box>
  )
}
