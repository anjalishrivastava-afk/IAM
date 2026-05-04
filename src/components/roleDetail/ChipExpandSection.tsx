/**
 * Assign / chip section pattern used on Role detail (Assigned Users) and Privilege set detail (Assign Roles).
 */
import { Fragment } from 'react'
import type { ChangeEvent, ReactElement } from 'react'
import type { SxProps, Theme } from '@mui/material/styles'
import Tooltip from '@mui/material/Tooltip'
import {
  Box,
  Button,
  Chip,
  Divider,
  EnhancedTextField,
  Icon,
  Stack,
  Typography,
} from '@exotel-npm-dev/signal-design-system'
import { RbacListEmptyPlaceholder, rbacQuotedSearch } from './RbacListEmptyPlaceholder'

const VIEW_MODE_TOOLTIP = 'You are in view mode'

/** Tooltip + cursor on disabled controls (native `disabled` blocks hover without a wrapper). */
export function ViewModeDisabledWrap({
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

const SECTION_LEFT_COL_MAX_PX = 324
const SECTION_GAP_PX = 200
const SECTION_RIGHT_COL_MAX_PX = 506

export const SECTION_ROW_LAYOUT = {
  display: 'flex',
  flexDirection: { xs: 'column', md: 'row' },
  alignItems: 'flex-start',
  gap: { xs: 2, md: `${SECTION_GAP_PX}px` },
  py: { xs: 2, md: 2.5 },
} as const

export const SECTION_ASIDE_BOX = {
  flexShrink: 0,
  width: '100%',
  maxWidth: { md: SECTION_LEFT_COL_MAX_PX },
}

export const SECTION_CONTENT_STACK = {
  flexShrink: 0,
  width: '100%',
  minWidth: 0,
  maxWidth: { md: SECTION_RIGHT_COL_MAX_PX },
}

export const SEARCH_ROW_TEXTFIELD_SX = {
  '& .MuiOutlinedInput-root': {
    minHeight: 40,
    alignItems: 'center',
    boxSizing: 'border-box',
  },
} as const

export interface ChipExpandSectionProps<T extends { label: string; keyStr: string }> {
  title: string
  description: string
  searchPlaceholder: string
  search: string
  onSearchChange: (v: string) => void
  manageLabel: string
  onManage: () => void
  filteredItems: T[]
  collapsedCap: number
  expanded: boolean
  onToggleExpand: () => void
  renderChip: (item: T, index: number) => ReactElement
  collapseExpandLabelCollapsed: string
  editMode: boolean
  /** Count before applying `search` — drives empty-state copy when the chip row is blank. */
  sourceTotalCount?: number
  /** Plural noun for messaging, e.g. "users" / "roles". */
  emptyListNounPlural?: string
}

export function ChipExpandSection<T extends { label: string; keyStr: string }>({
  title,
  description,
  searchPlaceholder,
  search,
  onSearchChange,
  manageLabel,
  onManage,
  filteredItems,
  collapsedCap,
  expanded,
  onToggleExpand,
  renderChip,
  collapseExpandLabelCollapsed,
  editMode,
  sourceTotalCount,
  emptyListNounPlural,
}: ChipExpandSectionProps<T>) {
  const truncated = filteredItems.length > collapsedCap
  const showExpandControl = truncated
  const displayItems =
    expanded || !truncated ? filteredItems : filteredItems.slice(0, collapsedCap)
  const remainder = truncated && !expanded ? filteredItems.length - collapsedCap : 0

  const chipZoneEmptyMessaging = (() => {
    if (displayItems.length > 0) return null
    const qTrim = search.trim()
    const quoted = rbacQuotedSearch(search)
    if (sourceTotalCount !== undefined && emptyListNounPlural) {
      if (sourceTotalCount === 0) {
        return {
          title: `No ${emptyListNounPlural} assigned yet`,
          description: editMode
            ? `Click ${manageLabel} to assign ${emptyListNounPlural}.`
            : `Switch to edit mode and use ${manageLabel} to assign ${emptyListNounPlural}.`,
        }
      }
      return {
        title: quoted ? `No results for ${quoted}` : 'No matching results',
        description: 'Try different keywords or clear the search.',
      }
    }
    if (qTrim) {
      return {
        title: quoted ? `No results for ${quoted}` : 'No matching results',
        description: 'Try different keywords or clear the search.',
      }
    }
    return null
  })()

  return (
    <>
      <Box sx={SECTION_ROW_LAYOUT}>
        <Box sx={SECTION_ASIDE_BOX}>
          <Typography variant="title3" component="h2">
            {title}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75 }}>
            {description}
          </Typography>
        </Box>
        <Stack spacing={2} sx={SECTION_CONTENT_STACK}>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1}
            alignItems={{ sm: 'center' }}
            sx={{ width: '100%' }}
          >
            <Box sx={{ flex: 1, minWidth: 0, alignSelf: { xs: 'stretch', sm: 'stretch' } }}>
              <EnhancedTextField
                showLabel={false}
                placeholder={searchPlaceholder}
                value={search}
                onChange={(e: ChangeEvent<HTMLInputElement>) => onSearchChange(e.target.value)}
                sx={{
                  width: '100%',
                  ...SEARCH_ROW_TEXTFIELD_SX,
                }}
                slotProps={{
                  input: {
                    startAdornment: (
                      <Box component="span" sx={{ mr: 0.75, display: 'inline-flex' }}>
                        <Icon name="magnifying-glass" size="sm" sx={{ opacity: 0.7 }} />
                      </Box>
                    ),
                    sx: {
                      typography: 'body2',
                      fontFamily: (theme: Theme) => theme.typography.fontFamily,
                    },
                  },
                }}
                size="medium"
                fullWidth
              />
            </Box>
            <ViewModeDisabledWrap
              viewOnly={!editMode}
              wrapperSx={{
                flexShrink: 0,
                alignSelf: { xs: 'stretch', sm: 'center' },
                display: 'inline-flex',
              }}
            >
              <Button
                variant="tonal"
                color="primary"
                disabled={!editMode}
                size="medium"
                onClick={onManage}
                sx={{
                  flexShrink: 0,
                  alignSelf: { xs: 'stretch', sm: 'center' },
                  minHeight: 40,
                  boxSizing: 'border-box',
                }}
              >
                {manageLabel}
              </Button>
            </ViewModeDisabledWrap>
          </Stack>

          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 1,
              alignItems: 'center',
              minHeight: displayItems.length === 0 ? 52 : undefined,
            }}
          >
            {chipZoneEmptyMessaging ? (
              <Box sx={{ width: '100%' }}>
                <RbacListEmptyPlaceholder
                  title={chipZoneEmptyMessaging.title}
                  description={chipZoneEmptyMessaging.description}
                  sx={{
                    py: 0.5,
                    px: 0,
                    alignItems: 'flex-start',
                    textAlign: 'left',
                  }}
                />
              </Box>
            ) : (
              <>
                {displayItems.map((item, i) => (
                  <Fragment key={item.keyStr}>{renderChip(item, i)}</Fragment>
                ))}
                {remainder > 0 ? (
                  <Chip size="small" variant="filled" label={`+${remainder}`} color="default" />
                ) : null}
              </>
            )}
          </Box>

          {showExpandControl ? (
            <Box>
              <Button
                variant="text"
                size="small"
                onClick={onToggleExpand}
                sx={{ textTransform: 'none', fontWeight: 500 }}
              >
                <Stack direction="row" spacing={0.5} alignItems="center">
                  <Typography
                    component="span"
                    sx={{ typography: 'body2', color: 'primary.main', fontFamily: 'inherit' }}
                  >
                    {expanded ? 'Collapse all' : collapseExpandLabelCollapsed}
                  </Typography>
                  <Icon
                    name={expanded ? 'caret-up' : 'caret-down'}
                    size="sm"
                    sx={{ color: 'primary.main' }}
                  />
                </Stack>
              </Button>
            </Box>
          ) : null}
        </Stack>
      </Box>
      <Divider sx={{ mx: -2 }} />
    </>
  )
}
