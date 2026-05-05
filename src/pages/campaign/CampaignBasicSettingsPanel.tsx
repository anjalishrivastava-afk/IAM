/**
 * Campaign Basic Settings — matches Figma Create-Campaign frame 1760:7401 layout (Role detail left/right rhythm).
 */
import { type ChangeEvent, type ReactElement, type SyntheticEvent } from 'react'
import type { SxProps, Theme } from '@mui/material/styles'
import InputAdornment from '@mui/material/InputAdornment'
import MenuItem from '@mui/material/MenuItem'
import {
  Autocomplete,
  Box,
  Button,
  Divider,
  EnhancedTextField,
  Icon,
  Stack,
  Switch,
  Tooltip,
  Typography,
} from '@exotel-npm-dev/signal-design-system'

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

/** Same rhythm as `RoleDetailPage` section rows */
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

const SCHEDULE_PREVIEW_DOT_GRID_URL =
  'https://www.figma.com/api/mcp/asset/c6728e98-7912-4c20-9fe2-e6592462ff9d'

export type CampaignBasicFormState = {
  process: string
  campaignName: string
  campaignDescription: string
  campaignType: string
  scheduleEnabled: boolean
  dispositionPlan: string
  acwDuration: string
  timezoneMapperType: string
}

export const INITIAL_CAMPAIGN_BASIC_FORM: CampaignBasicFormState = {
  process: 'MoneyAssure Bank Card',
  campaignName: 'Credit Card Campaign',
  campaignDescription:
    'Handles all inbound and outbound support for credit card services under MoneyAssure Bank',
  campaignType: 'Omni Campaign',
  scheduleEnabled: false,
  dispositionPlan: '',
  acwDuration: '',
  timezoneMapperType: '',
}

const PROCESS_OPTIONS = ['MoneyAssure Bank Card', 'Retail Banking', 'Enterprise']
const CAMPAIGN_TYPE_OPTIONS = ['Omni Campaign', 'Voice Only', 'Blended']
const DISPOSITION_OPTIONS = ['Standard Plan', 'Sales Disposition', 'Support L1']
const TZ_MAPPER_OPTIONS = ['Use contact timezone', 'Campaign timezone', 'Agent timezone']

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

function InlineLink({
  children,
  onClick,
  disabled,
}: {
  children: React.ReactNode
  onClick: () => void
  disabled?: boolean
}) {
  return (
    <Box
      component="button"
      type="button"
      disabled={disabled}
      onClick={onClick}
      sx={{
        border: 'none',
        background: 'none',
        padding: 0,
        margin: 0,
        cursor: disabled ? 'not-allowed' : 'pointer',
        color: 'primary.main',
        font: 'inherit',
        textAlign: 'left',
        textDecoration: 'underline',
        opacity: disabled ? 0.5 : 1,
      }}
    >
      {children}
    </Box>
  )
}

export function CampaignBasicSettingsPanel({
  viewOnly,
  form,
  onPatch,
  onNavigateSection,
  onSectionEdit,
}: {
  viewOnly: boolean
  form: CampaignBasicFormState
  onPatch: (patch: Partial<CampaignBasicFormState>) => void
  onNavigateSection: (navKey: string) => void
  /** RBAC UX: Edit at section scope (campaign shell only). */
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
      <Box sx={{ p: 1.5, flex: 1, minHeight: 0, overflow: 'auto', display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Stack direction="row" alignItems="flex-start" justifyContent="space-between" spacing={2}>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="title2" component="h2">
              Basic Settings
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Enter the core information to define and identify your campaign
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
                  onPatch({
                    scheduleEnabled: false,
                    dispositionPlan: '',
                    acwDuration: '',
                    timezoneMapperType: '',
                  })
                }}
              >
                Copy from other Campaigns
              </Button>
            </ViewModeDisabledWrap>
          </Stack>
        </Stack>

        <Divider />

        <SectionRow
          aside={
            <>
              <Typography variant="title3" component="h3">
                Campaign Identity
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                Enter the core information to define and identify your campaign
              </Typography>
            </>
          }
        >
          <ViewModeDisabledWrap viewOnly={viewOnly} wrapperSx={{ display: 'block', width: '100%' }}>
            <Autocomplete
              disableClearable
              label="Select Process"
              options={PROCESS_OPTIONS}
              value={form.process}
              onChange={(_e: SyntheticEvent, v: string | null) => {
                if (v != null) onPatch({ process: v })
              }}
              getOptionLabel={(o: string) => o}
              isOptionEqualToValue={(a: string, b: string) => a === b}
              disabled={viewOnly}
              fullWidth
              size="medium"
            />
          </ViewModeDisabledWrap>
          <ViewModeDisabledWrap viewOnly={viewOnly} wrapperSx={{ display: 'block', width: '100%' }}>
            <EnhancedTextField
              label="Campaign Name"
              value={form.campaignName}
              disabled={viewOnly}
              onChange={(e: ChangeEvent<HTMLInputElement>) => onPatch({ campaignName: e.target.value })}
              fullWidth
              size="medium"
            />
          </ViewModeDisabledWrap>
          <ViewModeDisabledWrap viewOnly={viewOnly} wrapperSx={{ display: 'block', width: '100%' }}>
            <EnhancedTextField
              label="Campaign Description"
              value={form.campaignDescription}
              disabled={viewOnly}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                onPatch({ campaignDescription: e.target.value })}
              fullWidth
              multiline
              minRows={3}
              size="medium"
            />
          </ViewModeDisabledWrap>
          <ViewModeDisabledWrap viewOnly={viewOnly} wrapperSx={{ display: 'block', width: '100%' }}>
            <EnhancedTextField
              select
              label="Campaign Type"
              value={form.campaignType}
              disabled={viewOnly}
              onChange={(e: ChangeEvent<HTMLInputElement>) => onPatch({ campaignType: e.target.value })}
              fullWidth
              size="medium"
            >
              {CAMPAIGN_TYPE_OPTIONS.map((o) => (
                <MenuItem key={o} value={o}>
                  {o}
                </MenuItem>
              ))}
            </EnhancedTextField>
          </ViewModeDisabledWrap>
        </SectionRow>

        <Divider />

        <Typography variant="caption" sx={{ fontWeight: 700, letterSpacing: '0.08em', color: 'text.secondary' }}>
          Call channel
        </Typography>

        <SectionRow
          aside={
            <>
              <Typography variant="title3" component="h3">
                Campaign Schedule
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                Configure when your campaign should run. All the agents will unassigned after expiration
              </Typography>
            </>
          }
        >
          <ViewModeDisabledWrap viewOnly={viewOnly} wrapperSx={{ display: 'inline-flex' }}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <Switch
                checked={form.scheduleEnabled}
                disabled={viewOnly}
                onChange={(_ev: SyntheticEvent, checked: boolean) =>
                  onPatch({ scheduleEnabled: checked })}
              />
              <Typography variant="body2">{form.scheduleEnabled ? 'Enabled' : 'Disabled'}</Typography>
            </Stack>
          </ViewModeDisabledWrap>
        </SectionRow>

        <Divider />

        <SectionRow
          aside={
            <>
              <Typography variant="title3" component="h3">
                Disposition Plan
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                Capture messages when agents are unavailable to answer calls
              </Typography>
            </>
          }
        >
          <ViewModeDisabledWrap viewOnly={viewOnly} wrapperSx={{ display: 'block', width: '100%' }}>
            <Autocomplete
              label="Disposition Plan"
              options={DISPOSITION_OPTIONS}
              value={form.dispositionPlan || null}
              onChange={(_e: SyntheticEvent, v: string | null) => onPatch({ dispositionPlan: v ?? '' })}
              getOptionLabel={(o: string) => o}
              isOptionEqualToValue={(a: string | null, b: string | null) => (a ?? '') === (b ?? '')}
              disabled={viewOnly}
              fullWidth
              size="medium"
              slotProps={{
                textField: {
                  placeholder: 'Select Disposition Plan',
                },
              }}
            />
          </ViewModeDisabledWrap>
        </SectionRow>

        <Divider />

        <SectionRow
          aside={
            <>
              <Typography variant="title3" component="h3">
                After Call Work (ACW) Duration
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                Allow agents time to complete notes or tasks after a call or chat ends
              </Typography>
            </>
          }
        >
          <ViewModeDisabledWrap viewOnly={viewOnly} wrapperSx={{ display: 'block', width: '100%' }}>
            <EnhancedTextField
              label="Time"
              type="number"
              value={form.acwDuration}
              disabled={viewOnly}
              onChange={(e: ChangeEvent<HTMLInputElement>) => onPatch({ acwDuration: e.target.value })}
              fullWidth
              size="medium"
              slotProps={{
                input: {
                  endAdornment: <InputAdornment position="end">secs</InputAdornment>,
                },
              }}
            />
          </ViewModeDisabledWrap>
          <Typography variant="body2" color="text.primary" sx={{ lineHeight: 1.43 }}>
            This time will be configured for all the channels. To set up After-Call Work (ACW) for specific
            channels, go to{' '}
            <InlineLink disabled={viewOnly} onClick={() => !viewOnly && onNavigateSection('channel-config')}>
              Channel Configuration
            </InlineLink>
          </Typography>
        </SectionRow>

        <Divider />

        <SectionRow
          aside={
            <>
              <Typography variant="title3" component="h3">
                Timezone Mapper Type
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                Set the maximum number of simultaneous active calls allowed
              </Typography>
            </>
          }
        >
          <ViewModeDisabledWrap viewOnly={viewOnly} wrapperSx={{ display: 'block', width: '100%' }}>
            <EnhancedTextField
              select
              label="Timezone Mapper Type"
              value={form.timezoneMapperType}
              disabled={viewOnly}
              fullWidth
              size="medium"
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                onPatch({ timezoneMapperType: String(e.target.value) })}
              SelectProps={{
                displayEmpty: true,
                renderValue: (selected: unknown) =>
                  selected != null && String(selected).trim() !== '' ? (
                    String(selected)
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      Select
                    </Typography>
                  ),
              }}
            >
              <MenuItem value="">
                <em>Select</em>
              </MenuItem>
              {TZ_MAPPER_OPTIONS.map((o) => (
                <MenuItem key={o} value={o}>
                  {o}
                </MenuItem>
              ))}
            </EnhancedTextField>
          </ViewModeDisabledWrap>
        </SectionRow>

        <Divider />

        <SectionRow
          aside={
            <>
              <Typography variant="title3" component="h3">
                Define Working Hours &amp; Holiday Calendar
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                Define working hours and holidays to keep operations on track
              </Typography>
            </>
          }
        >
          <Stack spacing={1.5}>
            <Typography variant="body2">
              Go to{' '}
              <InlineLink disabled={viewOnly} onClick={() => !viewOnly && onNavigateSection('workforce')}>
                Workforce and Availability
              </InlineLink>{' '}
              to set Office Hours &amp; Holiday Calendar
            </Typography>
            <Box
              sx={{
                bgcolor: '#e4e1b8',
                borderRadius: 1.5,
                pt: '28px',
                pb: '32px',
                px: { xs: 2, md: `${121}px` },
                position: 'relative',
                overflow: 'hidden',
                minHeight: 237,
                display: 'flex',
                justifyContent: 'center',
              }}
            >
              <Box
                aria-hidden
                sx={{
                  position: 'absolute',
                  inset: 0,
                  opacity: 0.55,
                  backgroundImage: `url(${SCHEDULE_PREVIEW_DOT_GRID_URL})`,
                  backgroundSize: '400px 400px',
                  pointerEvents: 'none',
                }}
              />
              <Box
                sx={{
                  width: '100%',
                  maxWidth: 265,
                  bgcolor: 'background.paper',
                  borderRadius: '12px',
                  px: `${19}px`,
                  py: 2,
                  boxShadow:
                    '0px 8px 17px rgba(0,0,0,0.1), 0px 30px 30px rgba(0,0,0,0.09), 0px 122px 49px rgba(0,0,0,0)',
                  borderTopLeftRadius: '12px',
                  borderTopRightRadius: '12px',
                  zIndex: 1,
                  filter: viewOnly ? 'grayscale(0.25)' : 'none',
                }}
              >
                <Stack spacing={`${11}px`}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography sx={{ fontSize: '12px', fontWeight: 600 }}>Monday</Typography>
                    <Stack direction="row" spacing={`${11}px`} alignItems="center">
                      <Icon name="clock" size="sm" sx={{ color: 'text.secondary' }} aria-hidden />
                      <Icon name="calendar-blank" size="sm" sx={{ color: 'text.secondary' }} aria-hidden />
                    </Stack>
                  </Stack>
                  <ScheduleBlock
                    tint="#f0ffee"
                    title="MORNING SHIFT"
                    titleColor="#577153"
                    primary="Working Hour"
                    secondary="9AM - 2PM"
                  />
                  <ScheduleBlock
                    tint="#fff4ee"
                    title="MORNING SHIFT"
                    titleColor="#726056"
                    primary="Lunch"
                    secondary="2PM - 3PM"
                  />
                  <ScheduleBlock
                    tint="#edf0ff"
                    title="AFTERNOON SHIFT"
                    titleColor="#4f546d"
                    primary="1st Half"
                    secondary="9AM - 2PM"
                  />
                </Stack>
              </Box>
            </Box>
          </Stack>
        </SectionRow>
      </Box>
    </Box>
  )
}

function ScheduleBlock({
  tint,
  title,
  titleColor,
  primary,
  secondary,
}: {
  tint: string
  title: string
  titleColor: string
  primary: string
  secondary: string
}) {
  return (
    <Box sx={{ bgcolor: tint, borderRadius: 1, px: `${12}px`, py: `${8}px`, width: '100%' }}>
      <Stack spacing={`${9}px`}>
        <Typography sx={{ fontSize: '10px', fontWeight: 600, color: titleColor, letterSpacing: '0.04em', lineHeight: 1.43 }}>
          {title}
        </Typography>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography sx={{ fontSize: '12px', fontWeight: 500 }}>{primary}</Typography>
          <Typography sx={{ fontSize: '12px', fontWeight: 500, whiteSpace: 'nowrap' }}>{secondary}</Typography>
        </Stack>
      </Stack>
    </Box>
  )
}
