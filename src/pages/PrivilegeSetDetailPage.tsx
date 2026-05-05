/**
 * Privilege Set detail — layout from Figma 48:15931 (hero + Basic Details, Assign Roles, Select Privileges).
 */
import {
  Fragment,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
  type ElementType,
  type MouseEvent as ReactMouseEvent,
  type ReactElement,
  type SyntheticEvent,
} from 'react'
import MenuItem from '@mui/material/MenuItem'
import Slide from '@mui/material/Slide'
import type { SlideProps } from '@mui/material/Slide'
import Snackbar from '@mui/material/Snackbar'
import Alert from '@mui/material/Alert'
import Accordion from '@mui/material/Accordion'
import AccordionDetails from '@mui/material/AccordionDetails'
import AccordionSummary from '@mui/material/AccordionSummary'
import { Navigate, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { DetailPageLoadingSkeleton } from '../components/rbac/DetailPageLoadingSkeleton'
import { useAiChatAssistLayout } from '../context/AiChatAssistLayoutContext'
import { ChatWithAiButton } from '../components/rbac/ChatWithAiButton'
import {
  ChipExpandSection,
  SECTION_ROW_LAYOUT,
  SECTION_ASIDE_BOX,
  SECTION_CONTENT_STACK,
} from '../components/roleDetail/ChipExpandSection'
import { ManageRolesForPrivilegeDrawer } from '../components/roleDetail/ManageRolesForPrivilegeDrawer'
import { avatarFillFromHue } from '../utils/avatarSurface'
import type { SxProps, Theme } from '@mui/material/styles'
import { alpha } from '@mui/material/styles'
import {
  Avatar,
  Box,
  Button,
  Checkbox,
  Chip,
  Divider,
  EnhancedTextField,
  FormControlLabel,
  Icon,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  Paper,
  Stack,
  stringToColor,
  Tooltip,
  Typography,
  getInitials,
} from '@exotel-npm-dev/signal-design-system'
import type {
  PermissionNode,
  PrivilegeCategoryNode,
  PrivilegeSubgroupNode,
  PrivilegeSetDetailModel,
} from '../data/privilegeSetDetailData'
import { buildGrantMapFromDetail } from '../data/privilegeSetDetailData'
import { ROLE_DETAIL_COLLAPSED_CHIP_CAP } from '../data/roleDetailData'
import type { UserManagementRoleRow } from '../data/userManagementRoles'
import {
  deletePrivilegeSet,
  duplicatePrivilegeSet,
  fetchRoles,
  fetchPrivilegeSetDetail,
  patchPrivilegeSet,
  patchPrivilegeSetGrants,
  patchPrivilegeSetRoles,
} from '../api/rbacApi'

const VIEW_MODE_TOOLTIP = 'You are in view mode'
const PLAN_GATED_PRIVILEGE_TOOLTIP =
  'This privilege is not included in your current plan. Contact sales to add it to your subscription.'

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

function ScopeChip({ scopeType }: { scopeType: UserManagementRoleRow['scopeType'] }) {
  if (scopeType === 'default') {
    return <Chip size="small" label="Default" variant="tonal" color="default" />
  }
  return <Chip size="small" label="Custom" variant="tonal" color="info" />
}

function UserChipAvatar({ name }: { name: string }) {
  const raw = stringToColor(name)
  return (
    <Avatar
      variant="circular"
      alt=""
      sx={(theme: Theme) => ({
        width: 24,
        height: 24,
        fontSize: theme.typography.pxToRem(12),
        lineHeight: 1,
        fontWeight: theme.typography.fontWeightRegular,
        flexShrink: 0,
        bgcolor: avatarFillFromHue(raw, theme),
        color: theme.palette.common.white,
      })}
    >
      {getInitials(name)}
    </Avatar>
  )
}

function AssignedRoleChip({ name }: { name: string }) {
  return (
    <Box
      component="span"
      sx={(theme: Theme) => ({
        boxSizing: 'border-box',
        display: 'inline-flex',
        alignItems: 'center',
        gap: `${6}px`,
        maxWidth: '100%',
        minWidth: 0,
        verticalAlign: 'middle',
        border: `1px solid ${theme.palette.mode === 'light' ? 'rgba(0, 0, 0, 0.23)' : theme.palette.divider}`,
        borderRadius: '8px',
        bgcolor: 'background.paper',
        px: `${8}px`,
        pl: `${4}px`,
        py: `${4}px`,
      })}
    >
      <UserChipAvatar name={name} />
      <Typography
        variant="body2"
        component="span"
        noWrap
        title={name}
        sx={(theme: Theme) => ({
          fontSize: theme.typography.pxToRem(13),
          fontWeight: theme.typography.fontWeightMedium,
          lineHeight: '18px',
          letterSpacing: 0.16,
          color: 'text.primary',
        })}
      >
        {name}
      </Typography>
    </Box>
  )
}

const SEARCH_TF_SX = {
  '& .MuiOutlinedInput-root': {
    minHeight: 40,
    alignItems: 'center',
    boxSizing: 'border-box',
  },
} as const

/** Very light grey accordion / panel tint (replacing primary-tint). */
function accordionSurfaceBg(theme: Theme) {
  return theme.palette.mode === 'light'
    ? (theme.palette.grey[100] ?? 'rgba(0,0,0,0.04)')
    : alpha(theme.palette.common.white, 0.04)
}

function privilegeSetSaveSnackbarSlide(props: SlideProps) {
  return <Slide {...props} direction="up" />
}

const SEARCH_MATCH_HIGHLIGHT_BG = 'rgba(255, 235, 59, 0.55)'

function splitHighlightSegments(text: string, query: string): { text: string; hit: boolean }[] {
  const q = query.trim()
  if (!q) return [{ text, hit: false }]
  const lower = text.toLowerCase()
  const ql = q.toLowerCase()
  const out: { text: string; hit: boolean }[] = []
  let start = 0
  while (start < text.length) {
    const idx = lower.indexOf(ql, start)
    if (idx === -1) {
      if (start < text.length) out.push({ text: text.slice(start), hit: false })
      break
    }
    if (idx > start) out.push({ text: text.slice(start, idx), hit: false })
    out.push({ text: text.slice(idx, idx + q.length), hit: true })
    start = idx + q.length
  }
  return out.length > 0 ? out : [{ text, hit: false }]
}

function HighlightedSearchText({
  text,
  query,
  variant = 'body2',
  component = 'span',
  noWrap,
  sx,
}: {
  text: string
  query: string
  variant?: 'body2' | 'body3' | 'title3' | 'label2'
  component?: ElementType
  noWrap?: boolean
  sx?: SxProps<Theme>
}) {
  const q = query.trim()
  const segs = splitHighlightSegments(text, q)
  return (
    <Typography component={component} variant={variant} noWrap={noWrap} sx={sx}>
      {segs.map((seg, i) =>
        seg.hit ? (
          <Box
            key={i}
            component="mark"
            sx={{
              bgcolor: SEARCH_MATCH_HIGHLIGHT_BG,
              color: 'inherit',
              fontWeight: 'inherit',
              fontSize: 'inherit',
              lineHeight: 'inherit',
              padding: 0,
            }}
          >
            {seg.text}
          </Box>
        ) : (
          <Fragment key={i}>{seg.text}</Fragment>
        ),
      )}
    </Typography>
  )
}

/**
 * Returns a category tree for search: non-matching categories are omitted.
 * Permission rows are included only when their labels match. Subgroups stay visible when
 * the subgroup or parent category text matches but no permission labels do — with an empty
 * permission list and `searchHeaderOnlyMatch` on the subgroup copy.
 */
function getCategorySearchView(
  category: PrivilegeCategoryNode,
  rawSearch: string,
): PrivilegeCategoryNode | null {
  const q = rawSearch.trim().toLowerCase()
  if (!q) return category

  const catTextMatch =
    category.title.toLowerCase().includes(q) ||
    (category.description || '').toLowerCase().includes(q)

  if (category.subgroups.length === 0) {
    return catTextMatch ? category : null
  }

  const nextSubgroups: PrivilegeSubgroupNode[] = []

  for (const sg of category.subgroups) {
    const sgTextMatch =
      sg.title.toLowerCase().includes(q) || (sg.description || '').toLowerCase().includes(q)
    const permHits = sg.permissions.filter((p) => p.label.toLowerCase().includes(q))

    const include = permHits.length > 0 || sgTextMatch || catTextMatch
    if (!include) continue

    const searchHeaderOnlyMatch = permHits.length === 0 && (sgTextMatch || catTextMatch)

    nextSubgroups.push({
      ...sg,
      permissions: permHits,
      searchHeaderOnlyMatch,
    })
  }

  if (nextSubgroups.length === 0) return null

  return {
    ...category,
    subgroups: nextSubgroups,
  }
}

function isPermissionGranted(
  p: PermissionNode,
  grantByPermissionId: Record<string, boolean>,
): boolean {
  const v = grantByPermissionId[p.id]
  return v !== undefined ? v : p.granted
}

/** Key / plan-gated privileges cannot be granted in the UI — always “off” for counts and checkbox. */
function isPermissionEffectiveGranted(
  p: PermissionNode,
  grantByPermissionId: Record<string, boolean>,
): boolean {
  if (p.isKey) return false
  return isPermissionGranted(p, grantByPermissionId)
}

function tallyCategoryGrants(
  category: PrivilegeCategoryNode,
  grantByPermissionId: Record<string, boolean>,
): { granted: number; total: number } {
  let granted = 0
  let total = 0
  for (const sg of category.subgroups) {
    for (const p of sg.permissions) {
      total += 1
      if (isPermissionEffectiveGranted(p, grantByPermissionId)) granted += 1
    }
  }
  return { granted, total }
}

function tallySubgroupGrants(
  sg: PrivilegeCategoryNode['subgroups'][number],
  grantByPermissionId: Record<string, boolean>,
): { granted: number; total: number } {
  let granted = 0
  const total = sg.permissions.length
  for (const p of sg.permissions) {
    if (isPermissionEffectiveGranted(p, grantByPermissionId)) granted += 1
  }
  return { granted, total }
}

function PrivilegesCategorySection({
  category,
  lookupCategory,
  editMode,
  grantByPermissionId,
  onTogglePermission,
  onBulkCategoryGrant,
  onBulkSubgroupGrant,
  expanded,
  onExpandedChange,
  highlightQuery,
  privilegesSearchActive,
}: {
  category: PrivilegeCategoryNode
  /** Full category (same id) for counts and bulk actions when `category` is search-narrowed. */
  lookupCategory: PrivilegeCategoryNode
  editMode: boolean
  grantByPermissionId: Record<string, boolean>
  onTogglePermission: (permissionId: string) => void
  onBulkCategoryGrant: (category: PrivilegeCategoryNode, granted: boolean) => void
  onBulkSubgroupGrant: (sg: PrivilegeSubgroupNode, granted: boolean) => void
  expanded: boolean
  onExpandedChange: (expanded: boolean) => void
  highlightQuery: string
  privilegesSearchActive: boolean
}) {
  const catCounts = useMemo(
    () => tallyCategoryGrants(lookupCategory, grantByPermissionId),
    [lookupCategory, grantByPermissionId],
  )

  const accordionExpanded = privilegesSearchActive ? true : expanded
  const handleAccordionChange = privilegesSearchActive
    ? () => {}
    : (_: SyntheticEvent, exp: boolean) => {
        onExpandedChange(exp)
      }
  if (category.subgroups.length === 0) {
    return (
      <Accordion
        expanded={accordionExpanded}
        onChange={handleAccordionChange}
        disableGutters
        sx={{
          '&:before': { display: 'none' },
          boxShadow: 'none',
          bgcolor: 'transparent',
        }}
      >
        <AccordionSummary
          expandIcon={<Icon name="caret-down" size="sm" />}
          sx={{
            px: { xs: 2, sm: 2 },
            py: 0,
            minHeight: 48,
            bgcolor: accordionSurfaceBg,
            borderBottom: accordionExpanded ? 1 : 0,
            borderColor: 'divider',
            '& .MuiAccordionSummary-content': { alignItems: 'flex-start', my: 1.5 },
          }}
        >
          <Stack spacing={0.5} sx={{ minWidth: 0 }}>
            <HighlightedSearchText variant="title3" component="h3" text={category.title} query={highlightQuery} />
            <HighlightedSearchText
              variant="body2"
              component="span"
              text={category.description || '\u00a0'}
              query={highlightQuery}
              sx={{ color: 'text.secondary', display: 'block', fontWeight: 400 }}
            />
          </Stack>
        </AccordionSummary>
        <AccordionDetails sx={{ px: { xs: 1, sm: 2 }, pb: 3, pt: 1 }}>
          <Box
            sx={{
              px: { xs: 1, sm: 2 },
              py: 4,
              border: '1px dashed',
              borderColor: 'divider',
              borderRadius: 1,
            }}
          >
            <Typography variant="body2" color="text.secondary">
              Detailed permissions for this category are managed outside the playground.
            </Typography>
          </Box>
        </AccordionDetails>
      </Accordion>
    )
  }

  return (
    <Accordion
      expanded={accordionExpanded}
      onChange={handleAccordionChange}
      disableGutters
      sx={{
        '&:before': { display: 'none' },
        boxShadow: 'none',
        bgcolor: 'transparent',
        '&.MuiPaper-root.MuiAccordion-root.Mui-expanded': {
          mb: 0,
        },
      }}
    >
      <AccordionSummary
        expandIcon={<Icon name="caret-down" size="sm" />}
        sx={{
          px: { xs: 2, sm: 2 },
          py: 0,
          alignItems: { xs: 'flex-start', sm: 'center' },
          bgcolor: accordionSurfaceBg,
          borderBottom: accordionExpanded ? 1 : 0,
          borderColor: 'divider',
          '& .MuiAccordionSummary-expandIconWrapper': {
            color: 'action.active',
          },
          '& .MuiAccordionSummary-content': {
            flexWrap: 'wrap',
            gap: 2,
            my: { xs: 1.25, sm: 1.5 },
            alignItems: { xs: 'flex-start', sm: 'center' },
            overflow: 'hidden',
          },
        }}
      >
        <Stack spacing={0.5} sx={{ minWidth: 0, flex: '1 1 240px', maxWidth: '100%' }}>
          <HighlightedSearchText variant="title3" component="h3" text={category.title} query={highlightQuery} />
          <HighlightedSearchText
            variant="body2"
            component="span"
            text={category.description}
            query={highlightQuery}
            sx={{ color: 'text.secondary', display: 'block', fontWeight: 400 }}
          />
        </Stack>
        <Stack
          direction="row"
          spacing={2}
          alignItems="center"
          flexShrink={0}
          onClick={(e: ReactMouseEvent<HTMLDivElement>) => e.stopPropagation()}
          sx={{
            flexWrap: 'wrap',
            justifyContent: { xs: 'flex-start', sm: 'flex-end' },
          }}
        >
          <Typography variant="body2" color="text.secondary">
            {catCounts.granted}/{catCounts.total}
          </Typography>
          <ViewModeDisabledWrap viewOnly={!editMode}>
            <Stack direction="row" spacing={1}>
              <Button
                variant="outlined"
                size="small"
                color="neutral"
                disabled={!editMode}
                onClick={(e: ReactMouseEvent<HTMLButtonElement>) => {
                  e.stopPropagation()
                  if (editMode) onBulkCategoryGrant(lookupCategory, true)
                }}
              >
                Select All
              </Button>
              <Button
                variant="outlined"
                size="small"
                color="neutral"
                disabled={!editMode}
                onClick={(e: ReactMouseEvent<HTMLButtonElement>) => {
                  e.stopPropagation()
                  if (editMode) onBulkCategoryGrant(lookupCategory, false)
                }}
              >
                Disable all
              </Button>
            </Stack>
          </ViewModeDisabledWrap>
        </Stack>
      </AccordionSummary>
      <AccordionDetails sx={{ p: 0 }}>
        <Stack
          spacing={2}
          sx={{
            px: { xs: 2, sm: 2 },
            py: 2,
            bgcolor: accordionSurfaceBg,
          }}
        >
          {category.subgroups.map((sgView) => {
            const sgFull =
              lookupCategory.subgroups.find((s) => s.id === sgView.id) ?? sgView
            const sgCounts = tallySubgroupGrants(sgFull, grantByPermissionId)
            return (
              <Box
                key={sgView.id}
                sx={{
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 1,
                  bgcolor: 'background.paper',
                  boxShadow: 'none',
                  overflow: 'hidden',
                }}
              >
                <Box sx={{ px: 2, py: 1.5 }}>
                  <Stack
                    direction={{ xs: 'column', sm: 'row' }}
                    spacing={2}
                    alignItems={{ xs: 'flex-start', sm: 'center' }}
                    justifyContent="space-between"
                  >
                    <Stack spacing={0.25} sx={{ minWidth: 0 }}>
                      <HighlightedSearchText
                        variant="label2"
                        component="h4"
                        text={sgView.title}
                        query={highlightQuery}
                      />
                      <HighlightedSearchText
                        variant="body3"
                        component="span"
                        text={sgView.description}
                        query={highlightQuery}
                        sx={{ color: 'text.secondary' }}
                      />
                    </Stack>
                    <Stack direction="row" spacing={2} alignItems="center" flexShrink={0}>
                      <Typography variant="body2" color="text.secondary">
                        {sgCounts.granted}/{sgCounts.total}
                      </Typography>
                      <ViewModeDisabledWrap viewOnly={!editMode}>
                        <Stack direction="row" spacing={1}>
                          <Button
                            variant="outlined"
                            size="small"
                            color="neutral"
                            disabled={!editMode}
                            onClick={(e: ReactMouseEvent<HTMLButtonElement>) => {
                              e.stopPropagation()
                              if (editMode) onBulkSubgroupGrant(sgFull, true)
                            }}
                          >
                            Select All
                          </Button>
                          <Button
                            variant="outlined"
                            size="small"
                            color="neutral"
                            disabled={!editMode}
                            onClick={(e: ReactMouseEvent<HTMLButtonElement>) => {
                              e.stopPropagation()
                              if (editMode) onBulkSubgroupGrant(sgFull, false)
                            }}
                          >
                            Disable all
                          </Button>
                        </Stack>
                      </ViewModeDisabledWrap>
                    </Stack>
                  </Stack>
                </Box>
                <Divider />
                <Box sx={{ p: 2, pt: 2 }}>
                  {sgView.searchHeaderOnlyMatch ? (
                    <Typography variant="body2" color="text.secondary">
                      No matching result was found.
                    </Typography>
                  ) : (
                    <Box
                      sx={{
                        display: 'grid',
                        gap: { xs: 1, sm: 1.25, md: 2 },
                        rowGap: { xs: 1.5, md: 2 },
                        gridTemplateColumns: {
                          xs: '1fr',
                          sm: 'repeat(2, minmax(0, 1fr))',
                          md: 'repeat(3, minmax(0, 1fr))',
                          lg: 'repeat(5, minmax(0, 1fr))',
                        },
                      }}
                    >
                      {sgView.permissions.map((p) => {
                        const granted = isPermissionEffectiveGranted(p, grantByPermissionId)
                        const planGated = Boolean(p.isKey)
                        const rowDisabled = !editMode || planGated
                        const hoverTooltip =
                          planGated
                            ? PLAN_GATED_PRIVILEGE_TOOLTIP
                            : !editMode
                              ? VIEW_MODE_TOOLTIP
                              : ''

                        const permissionRow = (
                          <FormControlLabel
                            sx={{
                              alignItems: 'center',
                              m: 0,
                              gap: '4px',
                              minHeight: 32,
                              maxWidth: '100%',
                              cursor: editMode && !planGated ? 'pointer' : 'not-allowed',
                              '& .MuiFormControlLabel-label': {
                                overflow: 'hidden',
                              },
                              ...(editMode
                                ? planGated
                                  ? {
                                      opacity: 0.9,
                                    }
                                  : {}
                                : {
                                    cursor: 'not-allowed',
                                    opacity: 0.85,
                                  }),
                            }}
                            disableTypography
                            disabled={rowDisabled}
                            label={
                              <Stack
                                component="span"
                                direction="row"
                                alignItems="center"
                                spacing={0.5}
                                sx={{ minWidth: 0, flex: 1 }}
                              >
                                <HighlightedSearchText
                                  component="span"
                                  variant="body2"
                                  text={p.label}
                                  query={highlightQuery}
                                  noWrap
                                  sx={{ minWidth: 0 }}
                                />
                                {planGated ? (
                                  <Icon name="key" size="sm" sx={{ color: 'secondary.main', flexShrink: 0 }} />
                                ) : null}
                              </Stack>
                            }
                            control={
                              <Checkbox
                                size="small"
                                checked={granted}
                                disabled={rowDisabled}
                                onChange={
                                  editMode && !planGated
                                    ? () => {
                                        onTogglePermission(p.id)
                                      }
                                    : undefined
                                }
                              />
                            }
                          />
                        )

                        return (
                          <Fragment key={p.id}>
                            {hoverTooltip ? (
                              <Tooltip title={hoverTooltip} placement="top">
                                <Box
                                  component="span"
                                  sx={{
                                    display: 'block',
                                    width: '100%',
                                    maxWidth: '100%',
                                  }}
                                >
                                  {permissionRow}
                                </Box>
                              </Tooltip>
                            ) : (
                              permissionRow
                            )}
                          </Fragment>
                        )
                      })}
                    </Box>
                  )}
                </Box>
              </Box>
            )
          })}
        </Stack>
      </AccordionDetails>
    </Accordion>
  )
}

export function PrivilegeSetDetailPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const { privilegeSetId } = useParams<{ privilegeSetId: string }>()
  const { openChat } = useAiChatAssistLayout()

  const [detail, setDetail] = useState<PrivilegeSetDetailModel | null>(null)
  const [loading, setLoading] = useState(true)
  const [pageError, setPageError] = useState<string | null>(null)
  const [saveError, setSaveError] = useState<string | null>(null)

  useEffect(() => {
    if (!privilegeSetId) return
    let cancelled = false
    ;(async () => {
      setLoading(true)
      setPageError(null)
      try {
        const d = await fetchPrivilegeSetDetail(privilegeSetId)
        if (!cancelled) setDetail(d)
      } catch (e) {
        if (cancelled) return
        const msg = e instanceof Error ? e.message : String(e)
        if (/privilege set not found/i.test(msg)) {
          navigate('/closed-interaction/user-management', {
            replace: true,
            state: { umMainTab: 'privileges' },
          })
          return
        }
        setPageError(msg)
        setDetail(null)
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [privilegeSetId, navigate])

  const [editMode, setEditMode] = useState(false)
  const [privSearch, setPrivSearch] = useState('')
  const [focusedCategoryId, setFocusedCategoryId] = useState<string | null>(null)
  const [menuAnchorEl, setMenuAnchorEl] = useState<HTMLElement | null>(null)
  const [grantByPermissionId, setGrantByPermissionId] = useState<Record<string, boolean>>({})
  const [committedGrantByPermissionId, setCommittedGrantByPermissionId] = useState<
    Record<string, boolean>
  >({})
  const [expandedCategoryId, setExpandedCategoryId] = useState<string | null>(null)
  const [manageAssignRolesDrawerOpen, setManageAssignRolesDrawerOpen] = useState(false)
  const [assignRolesSearch, setAssignRolesSearch] = useState('')
  const [assignRolesExpanded, setAssignRolesExpanded] = useState(false)
  const [allRoleRows, setAllRoleRows] = useState<UserManagementRoleRow[]>([])
  const [privilegeSetSavedSnackbarOpen, setPrivilegeSetSavedSnackbarOpen] = useState(false)
  const [committedPrivilegeSetName, setCommittedPrivilegeSetName] = useState('')
  const [committedLongDescription, setCommittedLongDescription] = useState('')
  const [draftPrivilegeSetName, setDraftPrivilegeSetName] = useState('')
  const [draftLongDescription, setDraftLongDescription] = useState('')

  useEffect(() => {
    fetchRoles()
      .then(setAllRoleRows)
      .catch(() => {})
  }, [])

  const visibleCategories = useMemo(() => {
    if (!detail) return []
    return detail.categories
      .map((c) => getCategorySearchView(c, privSearch))
      .filter((c): c is PrivilegeCategoryNode => c != null)
  }, [detail, privSearch])

  useEffect(() => {
    if (!detail) return
    const m = buildGrantMapFromDetail(detail)
    const name = detail.base.privilegeSetName
    const longDesc = detail.longDescription
    setCommittedPrivilegeSetName(name)
    setCommittedLongDescription(longDesc)
    setDraftPrivilegeSetName(name)
    setDraftLongDescription(longDesc)
    setCommittedGrantByPermissionId(m)
    setGrantByPermissionId(m)
    setExpandedCategoryId(detail.categories[0]?.id ?? null)
    setPrivSearch('')
    setEditMode(searchParams.get('mode') === 'edit')
    setFocusedCategoryId(null)
    setManageAssignRolesDrawerOpen(false)
    setAssignRolesSearch('')
    setAssignRolesExpanded(false)
  }, [detail, privilegeSetId, searchParams])

  useEffect(() => {
    if (privSearch.trim()) return
    setExpandedCategoryId((current) => {
      if (visibleCategories.length === 0) return null
      if (current != null && visibleCategories.some((c) => c.id === current)) return current
      return visibleCategories[0]?.id ?? null
    })
  }, [visibleCategories, privSearch])

  const togglePermission = useCallback((permissionId: string) => {
    setGrantByPermissionId((prev) => ({
      ...prev,
      [permissionId]: !prev[permissionId],
    }))
  }, [])

  const bulkCategoryGrant = useCallback(
    (category: PrivilegeCategoryNode, granted: boolean) => {
      setGrantByPermissionId((prev) => {
        const next = { ...prev }
        const full =
          detail?.categories.find((c) => c.id === category.id) ?? category
        for (const sg of full.subgroups) {
          for (const p of sg.permissions) {
            if (!p.isKey) next[p.id] = granted
          }
        }
        return next
      })
    },
    [detail],
  )

  const bulkSubgroupGrant = useCallback(
    (sg: PrivilegeSubgroupNode, granted: boolean) => {
      setGrantByPermissionId((prev) => {
        const next = { ...prev }
        let resolved = sg
        if (detail) {
          for (const cat of detail.categories) {
            const hit = cat.subgroups.find((g) => g.id === sg.id)
            if (hit) {
              resolved = hit
              break
            }
          }
        }
        for (const p of resolved.permissions) {
          if (!p.isKey) next[p.id] = granted
        }
        return next
      })
    },
    [detail],
  )

  const scrollPrivilegesToCategory = useCallback((categoryId: string) => {
    setFocusedCategoryId(categoryId)
    setExpandedCategoryId(categoryId)
    queueMicrotask(() => {
      const el = document.getElementById(`priv-cat-${categoryId}`)
      el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
  }, [])

  const grants = useMemo(() => {
    if (!detail) return { granted: 0, total: 0 }
    let granted = 0
    let total = 0
    for (const c of detail.categories) {
      for (const sg of c.subgroups) {
        for (const p of sg.permissions) {
          total += 1
          if (isPermissionEffectiveGranted(p, grantByPermissionId)) granted += 1
        }
      }
    }
    return { granted, total }
  }, [detail, grantByPermissionId])

  const handleBack = () =>
    navigate('/closed-interaction/user-management', { state: { umMainTab: 'privileges' } })

  const openMenu = (e: ReactMouseEvent<HTMLElement>) => setMenuAnchorEl(e.currentTarget)
  const closeMenu = () => setMenuAnchorEl(null)

  const handleCancelEdit = () => {
    setDraftPrivilegeSetName(committedPrivilegeSetName)
    setDraftLongDescription(committedLongDescription)
    setGrantByPermissionId({ ...committedGrantByPermissionId })
    setSaveError(null)
    setEditMode(false)
    setSearchParams({}, { replace: true })
  }

  const handleSaveEdit = async () => {
    if (!privilegeSetId || !detail) return
    setSaveError(null)
    try {
      const nameChanged = draftPrivilegeSetName.trim() !== committedPrivilegeSetName.trim()
      const descChanged = draftLongDescription !== committedLongDescription
      if (nameChanged || descChanged) {
        await patchPrivilegeSet(privilegeSetId, {
          ...(nameChanged ? { privilegeSetName: draftPrivilegeSetName.trim() } : {}),
          ...(descChanged
            ? { description: draftLongDescription, longDescription: draftLongDescription }
            : {}),
        })
      }

      const grantPatch: Record<string, boolean> = {}
      const keys = new Set([
        ...Object.keys(grantByPermissionId),
        ...Object.keys(committedGrantByPermissionId),
      ])
      for (const pid of keys) {
        const next = !!grantByPermissionId[pid]
        const prev = !!committedGrantByPermissionId[pid]
        if (next !== prev) grantPatch[pid] = next
      }
      if (Object.keys(grantPatch).length > 0) {
        await patchPrivilegeSetGrants(privilegeSetId, grantPatch)
      }

      const fresh = await fetchPrivilegeSetDetail(privilegeSetId)
      setDetail(fresh)
      setEditMode(false)
      setSearchParams({}, { replace: true })
      setPrivilegeSetSavedSnackbarOpen(true)
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : 'Save failed')
    }
  }

  const handleDuplicatePrivilegeSet = async () => {
    if (!privilegeSetId) return
    closeMenu()
    try {
      const row = await duplicatePrivilegeSet(privilegeSetId)
      navigate(`/closed-interaction/user-management/privilege-sets/${row.id}`)
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : 'Duplicate failed')
    }
  }

  const handleDeletePrivilegeSet = async () => {
    const name = detail?.base.privilegeSetName ?? ''
    if (
      !privilegeSetId ||
      !window.confirm(`Permanently delete privilege set "${name}"? It will be removed from every role.`)
    )
      return
    closeMenu()
    try {
      await deletePrivilegeSet(privilegeSetId)
      navigate('/closed-interaction/user-management', { state: { umMainTab: 'privileges' } })
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : 'Delete failed')
    }
  }

  const handleHeroMenuViewDetails = () => {
    closeMenu()
    if (editMode) {
      setDraftPrivilegeSetName(committedPrivilegeSetName)
      setDraftLongDescription(committedLongDescription)
      setGrantByPermissionId({ ...committedGrantByPermissionId })
      setSaveError(null)
      setEditMode(false)
    }
    setSearchParams({}, { replace: true })
  }

  const handleHeroMenuEdit = () => {
    closeMenu()
    setEditMode(true)
    setSearchParams({ mode: 'edit' }, { replace: true })
  }

  const handleSavePrivilegeSetRoles = useCallback(
    async (roleIds: string[]) => {
      if (!privilegeSetId) throw new Error('Missing privilege set')
      await patchPrivilegeSetRoles(privilegeSetId, roleIds)
      const fresh = await fetchPrivilegeSetDetail(privilegeSetId)
      setDetail(fresh)
      setSaveError(null)
    },
    [privilegeSetId],
  )

  const assignedRoleNamesList = detail?.assignedRoleNames ?? []

  const filteredAssignRoles = useMemo(() => {
    const q = assignRolesSearch.trim().toLowerCase()
    const list = assignedRoleNamesList
    const names = !q ? list : list.filter((name) => name.toLowerCase().includes(q))
    return names.map((label) => ({ label, keyStr: label }))
  }, [assignedRoleNamesList, assignRolesSearch])

  const assignedRoleIdsForDrawer = useMemo(() => {
    if (!detail) return []
    const set = new Set(detail.assignedRoleNames.map((n) => n.trim().toLowerCase()))
    return allRoleRows.filter((r) => set.has(r.roleName.trim().toLowerCase())).map((r) => r.id)
  }, [detail, allRoleRows])

  if (!privilegeSetId) {
    return <Navigate to="/closed-interaction/user-management" replace />
  }

  if (loading) {
    return <DetailPageLoadingSkeleton showPrivilegeSidebar />
  }

  if (pageError || !detail) {
    return (
      <Box sx={{ height: '100%', p: 2 }}>
        <Stack spacing={2} alignItems="flex-start">
          <Button
            variant="outlined"
            startIcon={<Icon name="arrow-left" size="sm" />}
            onClick={handleBack}
          >
            Back to User Management
          </Button>
          <Typography color="error">{pageError ?? 'Could not load this privilege set.'}</Typography>
          <Typography variant="body2" color="text.secondary">
            Start the API in another terminal: <code>cd server && npm run dev</code>
          </Typography>
        </Stack>
      </Box>
    )
  }

  const { base } = detail

  const heroTitle = editMode ? draftPrivilegeSetName : committedPrivilegeSetName
  const heroSubtitle =
    editMode ? draftLongDescription : base.description || committedLongDescription

  return (
    <Box sx={{ height: '100%', width: '100%', minWidth: 0, display: 'flex', flexDirection: 'column' }}>
      <Paper
        elevation={0}
        sx={{
          flex: 1,
          minHeight: 0,
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'divider',
          overflow: 'hidden',
          bgcolor: 'background.paper',
        }}
      >
        {/* Hero */}
        <Stack
          direction="row"
          alignItems="flex-start"
          justifyContent="space-between"
          spacing={2}
          sx={{
            px: 2,
            py: 2,
            borderBottom: 1,
            borderColor: 'divider',
            flexShrink: 0,
          }}
        >
          <Stack direction="row" spacing={1.5} alignItems="flex-start" sx={{ minWidth: 0 }}>
            <IconButton size="small" variant="outlined" aria-label="Back" onClick={handleBack}>
              <Icon name="arrow-left" size="sm" />
            </IconButton>
            <Box sx={{ minWidth: 0 }}>
              <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
                <Typography variant="title2" component="h1" noWrap>
                  {heroTitle}
                </Typography>
                <ScopeChip scopeType={base.scopeType} />
              </Stack>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                {heroSubtitle}
              </Typography>
            </Box>
          </Stack>

          <Stack direction="row" spacing={1} alignItems="center" flexShrink={0}>
            {!editMode ? (
              <Button
                variant="outlined"
                color="neutral"
                size="medium"
                startIcon={<Icon name="pencil-simple-line" size="sm" />}
                onClick={() => {
                  setEditMode(true)
                  setSearchParams({ mode: 'edit' }, { replace: true })
                }}
              >
                Edit
              </Button>
            ) : null}
            <IconButton
              size="small"
              variant="outlined"
              aria-label="More actions"
              onClick={openMenu}
            >
              <Icon name="dots-three-vertical" size="sm" />
            </IconButton>
            <Menu
              anchorEl={menuAnchorEl}
              open={Boolean(menuAnchorEl)}
              onClose={closeMenu}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
              slotProps={{ paper: { sx: { minWidth: 200 } } }}
            >
              <MenuItem onClick={handleHeroMenuViewDetails}>
                <ListItemIcon>
                  <Icon name="list-bullets" size="sm" />
                </ListItemIcon>
                <ListItemText primary="View details" />
              </MenuItem>
              <MenuItem onClick={handleHeroMenuEdit}>
                <ListItemIcon>
                  <Icon name="pencil-simple-line" size="sm" />
                </ListItemIcon>
                <ListItemText primary="Edit" />
              </MenuItem>
              <MenuItem onClick={() => void handleDuplicatePrivilegeSet()}>
                <ListItemIcon>
                  <Icon name="copy-simple" size="sm" />
                </ListItemIcon>
                <ListItemText primary="Duplicate" />
              </MenuItem>
              <Divider />
              <MenuItem onClick={() => void handleDeletePrivilegeSet()} sx={{ color: 'error.main' }}>
                <ListItemIcon sx={{ color: 'inherit' }}>
                  <Icon name="trash-simple" size="sm" />
                </ListItemIcon>
                <ListItemText
                  primary="Delete"
                  slotProps={{ primary: { sx: { color: 'error.main' } } }}
                />
              </MenuItem>
            </Menu>
          </Stack>
        </Stack>

        <Box sx={{ px: 2, pb: 2, flex: 1, minHeight: 0, overflow: 'auto' }}>
          {saveError ? (
            <Alert severity="error" onClose={() => setSaveError(null)} sx={{ mb: 2 }}>
              {saveError}
            </Alert>
          ) : null}
          {/* Basic Details */}
          <Box sx={SECTION_ROW_LAYOUT}>
            <Box sx={SECTION_ASIDE_BOX}>
              <Typography variant="title3" component="h2">
                Basic Details
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75 }}>
                Name and describe this privilege set for administrators.
              </Typography>
            </Box>
            <Stack spacing={2} sx={SECTION_CONTENT_STACK}>
              <ViewModeDisabledWrap viewOnly={!editMode} wrapperSx={{ display: 'block', width: '100%' }}>
                <EnhancedTextField
                  label="Privilege Set Name"
                  value={editMode ? draftPrivilegeSetName : committedPrivilegeSetName}
                  disabled={!editMode}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setDraftPrivilegeSetName(e.target.value)
                  }
                  fullWidth
                  size="medium"
                />
              </ViewModeDisabledWrap>
              <ViewModeDisabledWrap viewOnly={!editMode} wrapperSx={{ display: 'block', width: '100%' }}>
                <EnhancedTextField
                  label="Privilege Set Description"
                  value={editMode ? draftLongDescription : committedLongDescription}
                  disabled={!editMode}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setDraftLongDescription(e.target.value)
                  }
                  fullWidth
                  multiline
                  minRows={3}
                  size="medium"
                />
              </ViewModeDisabledWrap>
            </Stack>
          </Box>

          <Divider sx={{ mx: -2 }} />

          <ChipExpandSection
            title="Assign Roles"
            description="View, assign, and manage which roles include this privilege set."
            searchPlaceholder="Search by role name"
            search={assignRolesSearch}
            onSearchChange={setAssignRolesSearch}
            manageLabel="Manage"
            onManage={() => {
              if (editMode) setManageAssignRolesDrawerOpen(true)
            }}
            filteredItems={filteredAssignRoles}
            collapsedCap={ROLE_DETAIL_COLLAPSED_CHIP_CAP}
            expanded={assignRolesExpanded}
            onToggleExpand={() => setAssignRolesExpanded((v) => !v)}
            renderChip={(item) => <AssignedRoleChip name={item.label} />}
            collapseExpandLabelCollapsed="View all roles"
            editMode={editMode}
            sourceTotalCount={assignedRoleNamesList.length}
            emptyListNounPlural="roles"
          />

          {/* Select Privileges */}
          <Stack spacing={1.5} sx={{ py: { xs: 2, md: 2.5 } }}>
            <Stack
              direction={{ xs: 'column', md: 'row' }}
              spacing={2}
              alignItems={{ md: 'center' }}
              justifyContent="space-between"
            >
              <Box sx={{ maxWidth: { md: 900 } }}>
                <Typography variant="title3" component="h2">
                  Select Privileges
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75 }}>
                  Search for category, parameter, or individual permissions below.
                </Typography>
              </Box>
              <Stack
                direction="row"
                spacing={1}
                alignItems="center"
                sx={{ width: '100%', maxWidth: { md: 520 }, flexShrink: 0 }}
              >
                <ChatWithAiButton onClick={openChat} />
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <EnhancedTextField
                    showLabel={false}
                    placeholder="Search for category, parameter or permissions"
                    value={privSearch}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setPrivSearch(e.target.value)}
                    fullWidth
                    size="small"
                    sx={SEARCH_TF_SX}
                    slotProps={{
                      input: {
                        startAdornment: (
                          <Box component="span" sx={{ mr: 0.75, display: 'inline-flex' }}>
                            <Icon name="magnifying-glass" size="sm" sx={{ opacity: 0.7 }} />
                          </Box>
                        ),
                      },
                    }}
                  />
                </Box>
              </Stack>
            </Stack>

            <Stack
              direction={{ xs: 'column', lg: 'row' }}
              spacing={2}
              sx={{
                alignItems: { lg: 'flex-start' },
              }}
            >
              <Box
                sx={{
                  width: '100%',
                  maxWidth: { lg: 248 },
                  flexShrink: 0,
                  position: 'sticky',
                  top: 0,
                  zIndex: 2,
                  display: 'flex',
                  flexDirection: 'column',
                  maxHeight: {
                    xs: 'min(280px, 40vh)',
                    lg: 'min(560px, calc(100dvh - 240px))',
                  },
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 1,
                  bgcolor: 'background.paper',
                  boxShadow: 'none',
                  overflow: 'hidden',
                }}
              >
                <Typography
                  component="span"
                  sx={(theme: Theme) => ({
                    px: 2,
                    pt: 2,
                    pb: 1,
                    flexShrink: 0,
                    fontSize: theme.typography.pxToRem(12),
                    fontWeight: theme.typography.fontWeightMedium,
                    lineHeight: 1.57,
                    letterSpacing: '0.1px',
                    color: 'text.disabled',
                    fontFamily: theme.typography.fontFamily,
                  })}
                >
                  CATEGORY
                </Typography>
                <Stack
                  component="nav"
                  spacing={0}
                  aria-label="Jump to privilege categories"
                  sx={{
                    px: 0,
                    pb: 1,
                    overflowY: 'auto',
                    flex: '1 1 auto',
                    minHeight: 0,
                  }}
                >
                  {visibleCategories.map((c) => {
                    const fullCat = detail.categories.find((x) => x.id === c.id) ?? c
                    const active = focusedCategoryId === c.id
                    const tally =
                      fullCat.subgroups.length === 0
                        ? null
                        : tallyCategoryGrants(fullCat, grantByPermissionId)
                    const sidebarChipLabel =
                      tally === null ? fullCat.sidebarCountLabel : `${tally.granted}/${tally.total}`
                    return (
                      <Box
                        key={c.id}
                        component="button"
                        type="button"
                        onClick={() => scrollPrivilegesToCategory(c.id)}
                        sx={{
                          width: '100%',
                          display: 'flex',
                          flexDirection: 'row',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: 1,
                          px: 2,
                          py: '10px',
                          minHeight: 35,
                          border: 'none',
                          cursor: 'pointer',
                          bgcolor: active ? 'action.selected' : 'transparent',
                          borderRadius: 1,
                          fontFamily: (theme: Theme) => theme.typography.fontFamily,
                          textAlign: 'left',
                          '&:hover': {
                            bgcolor: active ? 'action.selected' : 'action.hover',
                          },
                          '&:focus-visible': {
                            outline: '2px solid',
                            outlineColor: 'primary.main',
                            outlineOffset: 2,
                          },
                        }}
                      >
                        <HighlightedSearchText
                          variant="body2"
                          component="span"
                          text={c.title}
                          query={privSearch}
                          sx={{
                            flex: '1 1 auto',
                            minWidth: 0,
                            fontWeight: (theme: Theme) => theme.typography.fontWeightRegular,
                            color: 'text.primary',
                          }}
                        />
                        <Chip
                          size="small"
                          variant="tonal"
                          color="primary"
                          label={sidebarChipLabel}
                          sx={{ flexShrink: 0 }}
                        />
                      </Box>
                    )
                  })}
                </Stack>
              </Box>

              <Box
                sx={{
                  flex: 1,
                  minWidth: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 1,
                  overflow: 'hidden',
                  bgcolor: 'background.paper',
                  maxHeight: { lg: 'min(780px, calc(100dvh - 240px))' },
                }}
              >
                <Box
                  sx={{
                    flex: '1 1 auto',
                    minHeight: { xs: 400, lg: 360 },
                    overflowY: 'auto',
                  }}
                >
                  {visibleCategories.length === 0 && privSearch.trim() ? (
                    <Box sx={{ px: 2, py: 6, textAlign: 'center' }}>
                      <Typography variant="body2" color="text.secondary">
                        Nothing matches “{privSearch.trim()}”. Try another search term.
                      </Typography>
                    </Box>
                  ) : (
                    visibleCategories.map((c, idx) => {
                      const lookupCategory = detail.categories.find((x) => x.id === c.id) ?? c
                      return (
                        <Box
                          key={c.id}
                          id={`priv-cat-${c.id}`}
                          sx={(theme: Theme) => ({
                            scrollMarginTop: theme.spacing(2),
                            borderBottom:
                              idx < visibleCategories.length - 1
                                ? `1px solid ${theme.palette.divider}`
                                : 'none',
                          })}
                        >
                          <PrivilegesCategorySection
                            category={c}
                            lookupCategory={lookupCategory}
                            editMode={editMode}
                            grantByPermissionId={grantByPermissionId}
                            onTogglePermission={togglePermission}
                            onBulkCategoryGrant={bulkCategoryGrant}
                            onBulkSubgroupGrant={bulkSubgroupGrant}
                            expanded={expandedCategoryId === c.id}
                            onExpandedChange={(open) =>
                              setExpandedCategoryId(open ? c.id : null)
                            }
                            highlightQuery={privSearch}
                            privilegesSearchActive={Boolean(privSearch.trim())}
                          />
                        </Box>
                      )
                    })
                  )}
                  <Box
                    sx={{
                      px: 2,
                      py: 1.5,
                      borderTop: 1,
                      borderColor: 'divider',
                      bgcolor: 'background.default',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <Typography variant="body2" color="text.secondary">
                      {grants.granted} of {grants.total} Permissions Granted
                    </Typography>
                    <Icon name="caret-down" size="sm" sx={{ opacity: 0.5 }} aria-hidden />
                  </Box>
                </Box>
              </Box>
            </Stack>
          </Stack>
        </Box>

        <Slide in={editMode} direction="up" mountOnEnter unmountOnExit>
          <Box
            sx={{
              width: '100%',
              borderTop: '1px solid',
              borderColor: 'divider',
              bgcolor: 'background.paper',
              px: 2,
              py: 2,
              display: 'flex',
              justifyContent: 'flex-end',
              alignItems: 'center',
              gap: 1,
              flexShrink: 0,
              boxSizing: 'border-box',
            }}
          >
            <Button variant="outlined" color="neutral" size="medium" onClick={handleCancelEdit}>
              Cancel
            </Button>
            <Button variant="contained" color="primary" size="medium" onClick={handleSaveEdit}>
              Save
            </Button>
          </Box>
        </Slide>
      </Paper>

      <ManageRolesForPrivilegeDrawer
        open={manageAssignRolesDrawerOpen}
        onClose={() => setManageAssignRolesDrawerOpen(false)}
        privilegeSetDisplayName={committedPrivilegeSetName}
        roles={allRoleRows}
        assignedRoleIds={assignedRoleIdsForDrawer}
        onSave={async (ids) => {
          try {
            await handleSavePrivilegeSetRoles(ids)
          } catch (e) {
            const msg = e instanceof Error ? e.message : 'Could not update roles'
            setSaveError(msg)
            throw e instanceof Error ? e : new Error(msg)
          }
        }}
      />

      <Snackbar
        open={privilegeSetSavedSnackbarOpen}
        autoHideDuration={5500}
        TransitionComponent={privilegeSetSaveSnackbarSlide}
        onClose={() => setPrivilegeSetSavedSnackbarOpen(false)}
        message="Privilege set updated."
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      />
    </Box>
  )
}
