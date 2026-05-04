import {
  Fragment,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
  type MouseEvent as ReactMouseEvent,
  type SyntheticEvent,
} from 'react'
import Accordion from '@mui/material/Accordion'
import AccordionDetails from '@mui/material/AccordionDetails'
import AccordionSummary from '@mui/material/AccordionSummary'
import Slide from '@mui/material/Slide'
import type { SlideProps } from '@mui/material/Slide'
import Snackbar from '@mui/material/Snackbar'
import type { Theme } from '@mui/material/styles'
import {
  Box,
  Button,
  Chip,
  Drawer,
  EnhancedTextField,
  Icon,
  IconButton,
  Stack,
  Tab,
  Tabs,
  Tooltip,
  Typography,
} from '@exotel-npm-dev/signal-design-system'
import { fetchPrivilegeSetDetail } from '../../api/rbacApi'
import type { PrivilegeSetDetailModel } from '../../data/privilegeSetDetailData'
import type { PrivilegeSetRow } from '../../data/privilegeSets'

const HEADER_BG = '#f1f1f1'

/** Matches Manage Users drawer width (node 18:6117). */
const DRAWER_WIDTH_PX = 726

/** App route segment for privilege set detail — keep in sync with `App.tsx`. */
export function privilegeSetDetailPath(privilegeSetId: string): string {
  return `/closed-interaction/user-management/privilege-sets/${encodeURIComponent(privilegeSetId)}`
}

function openPrivilegeSetInNewTab(privilegeSetId: string): void {
  const url = new URL(privilegeSetDetailPath(privilegeSetId), window.location.origin).href
  window.open(url, '_blank', 'noopener,noreferrer')
}

function sortIdsStable(ids: Set<string>): string[] {
  return [...ids].sort((a, b) => a.localeCompare(b))
}

function countSetDiff(committed: Set<string>, draft: Set<string>): number {
  let n = 0
  for (const id of draft) if (!committed.has(id)) n += 1
  for (const id of committed) if (!draft.has(id)) n += 1
  return n
}

function snackbarSlideUp(props: SlideProps) {
  return <Slide {...props} direction="up" />
}

const PLAN_GATED_CHIP_TOOLTIP =
  'This privilege is not included in your current plan. Contact sales to add it to your subscription.'

function PrivilegeChipsPreview({ privilegeSetId }: { privilegeSetId: string }) {
  const [detail, setDetail] = useState<PrivilegeSetDetailModel | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoading(true)
      setError(null)
      try {
        const d = await fetchPrivilegeSetDetail(privilegeSetId)
        if (!cancelled) setDetail(d)
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'Could not load privileges')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [privilegeSetId])

  if (loading) {
    return (
      <Typography variant="body2" color="text.secondary" sx={{ py: 1 }}>
        Loading privileges…
      </Typography>
    )
  }
  if (error) {
    return (
      <Typography variant="body2" color="error" sx={{ py: 1 }}>
        {error}
      </Typography>
    )
  }
  if (!detail) return null

  const categorySections = detail.categories
    .map((cat) => {
      const subgroupsRendered = cat.subgroups
        .map((sg) => {
          const granted = sg.permissions.filter((p) => p.granted)
          if (granted.length === 0) return null
          return (
            <Box key={sg.id}>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: 'block' }}>
                {sg.title}
              </Typography>
              <Box
                sx={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 0.75,
                  mt: 0.75,
                  alignItems: 'flex-start',
                }}
              >
                {granted.map((p) => {
                  const planGated = Boolean(p.isKey)
                  const inner = (
                    <Chip
                      size="small"
                      variant="tonal"
                      color={planGated ? 'warning' : 'info'}
                      label={p.label}
                      icon={planGated ? <Icon name="key" size="xs" /> : undefined}
                      sx={{
                        maxWidth: '100%',
                        '& .MuiChip-label': { whiteSpace: 'normal', textAlign: 'left' },
                      }}
                    />
                  )
                  return planGated ? (
                    <Tooltip key={p.id} title={PLAN_GATED_CHIP_TOOLTIP} placement="top" arrow>
                      <Box component="span" sx={{ maxWidth: '100%', display: 'inline-flex' }}>
                        {inner}
                      </Box>
                    </Tooltip>
                  ) : (
                    <Box key={p.id} component="span" sx={{ display: 'inline-flex', maxWidth: '100%' }}>
                      {inner}
                    </Box>
                  )
                })}
              </Box>
            </Box>
          )
        })
        .filter(Boolean)

      if (subgroupsRendered.length === 0) return null

      return (
        <Box key={cat.id}>
          <Typography variant="body2" sx={{ fontWeight: 700, mb: 0.75 }}>
            {cat.title}
          </Typography>
          <Stack spacing={1.75} sx={{ pl: { xs: 0, sm: 0.5 } }}>
            {subgroupsRendered}
          </Stack>
        </Box>
      )
    })
    .filter(Boolean)

  if (categorySections.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary" sx={{ py: 1 }}>
        No privileges are included in this privilege set yet.
      </Typography>
    )
  }

  return <Stack spacing={2} sx={{ pt: 0.5, pb: 1 }}>{categorySections}</Stack>
}

export interface ManagePrivilegeSetsDrawerProps {
  open: boolean
  onClose: (event?: SyntheticEvent) => void
  privilegeSets: PrivilegeSetRow[]
  /** Snapshot from server — draft resets when the drawer opens. */
  assignedPrivilegeSetIds: string[]
  onSave?: (privilegeSetIds: string[]) => void | Promise<void>
}

export function ManagePrivilegeSetsDrawer({
  open,
  onClose,
  privilegeSets,
  assignedPrivilegeSetIds,
  onSave,
}: ManagePrivilegeSetsDrawerProps) {
  const [tab, setTab] = useState(0)
  const [search, setSearch] = useState('')
  const [draftSet, setDraftSet] = useState<Set<string>>(() => new Set())
  const [committedSet, setCommittedSet] = useState<Set<string>>(() => new Set())
  const [snackbarOpen, setSnackbarOpen] = useState(false)
  const [snackbarMessage, setSnackbarMessage] = useState('')
  const [savePending, setSavePending] = useState(false)

  const committedKey = useMemo(
    () => [...assignedPrivilegeSetIds].sort().join('\0'),
    [assignedPrivilegeSetIds],
  )

  useEffect(() => {
    if (!open) return
    const next = new Set(assignedPrivilegeSetIds)
    setCommittedSet(next)
    setDraftSet(new Set(next))
    setTab(0)
    setSearch('')
  }, [open, committedKey, assignedPrivilegeSetIds])

  const assignedRows = useMemo(() => {
    const q = search.trim().toLowerCase()
    return privilegeSets
      .filter((ps) => draftSet.has(ps.id))
      .filter((ps) => {
        if (!q) return true
        return (
          ps.privilegeSetName.toLowerCase().includes(q) ||
          (ps.description && ps.description.toLowerCase().includes(q))
        )
      })
      .sort((a, b) => a.privilegeSetName.localeCompare(b.privilegeSetName))
  }, [privilegeSets, draftSet, search])

  const unassignedRows = useMemo(() => {
    const q = search.trim().toLowerCase()
    return privilegeSets
      .filter((ps) => !draftSet.has(ps.id))
      .filter((ps) => {
        if (!q) return true
        return (
          ps.privilegeSetName.toLowerCase().includes(q) ||
          (ps.description && ps.description.toLowerCase().includes(q))
        )
      })
      .sort((a, b) => a.privilegeSetName.localeCompare(b.privilegeSetName))
  }, [privilegeSets, draftSet, search])

  const rows = tab === 0 ? assignedRows : unassignedRows
  const assignedCount = useMemo(
    () => privilegeSets.filter((ps) => draftSet.has(ps.id)).length,
    [privilegeSets, draftSet],
  )
  const unassignedCount = privilegeSets.length - assignedCount

  const changeStats = useMemo(() => {
    const total = countSetDiff(committedSet, draftSet)
    const added: string[] = []
    const removed: string[] = []
    for (const id of draftSet) if (!committedSet.has(id)) added.push(id)
    for (const id of committedSet) if (!draftSet.has(id)) removed.push(id)
    const name = (pid: string) =>
      privilegeSets.find((p) => p.id === pid)?.privilegeSetName ?? pid
    const addedLabels = added.map(name)
    const removedLabels = removed.map(name)
    const tooltipParts: string[] = []
    if (addedLabels.length) tooltipParts.push(`Add: ${addedLabels.join(', ')}`)
    if (removedLabels.length) tooltipParts.push(`Remove: ${removedLabels.join(', ')}`)
    return {
      totalChanges: total,
      tooltipDetail: tooltipParts.join(' · ') || 'No unsaved changes',
    }
  }, [committedSet, draftSet, privilegeSets])

  /** Discard drafts and notify parent — Cancel, backdrop, or Close (✕). */
  const discardAndDismiss = useCallback(
    (e?: SyntheticEvent) => {
      setSearch('')
      setTab(0)
      const baseline = new Set(assignedPrivilegeSetIds)
      setCommittedSet(baseline)
      setDraftSet(baseline)
      onClose(e)
    },
    [assignedPrivilegeSetIds, onClose],
  )

  /** After successful save — parent refreshes IDs; drawer only closes. */
  const dismissPlain = useCallback(
    (e?: SyntheticEvent) => {
      setSearch('')
      setTab(0)
      onClose(e)
    },
    [onClose],
  )

  const assignIds = useCallback((ids: string[]) => {
    setDraftSet((prev) => {
      const next = new Set(prev)
      for (const id of ids) next.add(id)
      return next
    })
  }, [])

  const removeIds = useCallback((ids: string[]) => {
    setDraftSet((prev) => {
      const next = new Set(prev)
      for (const id of ids) next.delete(id)
      return next
    })
  }, [])

  const handleSave = useCallback(async () => {
    if (!onSave || savePending) return
    setSavePending(true)
    try {
      await Promise.resolve(onSave(sortIdsStable(draftSet)))
      dismissPlain()
    } catch (e) {
      const msg =
        e instanceof Error ? e.message : typeof e === 'string' ? e : 'Could not save privilege sets'
      setSnackbarMessage(msg)
      setSnackbarOpen(true)
    } finally {
      setSavePending(false)
    }
  }, [draftSet, dismissPlain, onSave, savePending])

  const handleTabChange = useCallback((_e: SyntheticEvent, v: number) => {
    setTab(v)
    setSearch('')
  }, [])

  return (
    <>
      <Drawer
        anchor="right"
        open={open}
        onClose={(e?: SyntheticEvent) => discardAndDismiss(e)}
        slotProps={{
          backdrop: {
            sx: (theme: Theme) => ({
              backdropFilter: 'blur(1.50px)',
              WebkitBackdropFilter: 'blur(1.50px)',
              backgroundColor:
                theme.palette.mode === 'light' ? 'rgba(15, 23, 42, 0.18)' : 'rgba(0, 0, 0, 0.48)',
            }),
          },
          paper: {
            sx: {
              width: { xs: '100%', sm: `${DRAWER_WIDTH_PX}px` },
              maxWidth: '100vw',
              boxSizing: 'border-box',
              boxShadow:
                '0px 6px 10px rgba(0, 0, 0, 0.14), 0px 1px 18px rgba(0, 0, 0, 0.12)',
            },
          },
        }}
        headerContent={
          <Stack spacing={0} sx={{ flexShrink: 0 }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                px: 2,
                py: `${13}px`,
                bgcolor: HEADER_BG,
                borderBottom: 1,
                borderColor: 'divider',
              }}
            >
              <Stack spacing={0.25} sx={{ minWidth: 0, flex: 1 }}>
                <Typography variant="title3" component="h2" sx={{ fontWeight: 700, lineHeight: 1.25 }}>
                  Privilege sets
                </Typography>
              </Stack>
              <IconButton
                size="small"
                variant="outlined"
                aria-label="Close"
                onClick={(e: ReactMouseEvent) => discardAndDismiss(e)}
              >
                <Icon name="x" size="sm" />
              </IconButton>
            </Box>
            <Box
              sx={{
                bgcolor: 'background.paper',
                pb: 1,
                borderBottom: 1,
                borderColor: 'divider',
              }}
            >
              <Tabs
                value={tab}
                onChange={handleTabChange}
                aria-label="Privilege set assignment tabs"
                sx={{
                  px: 2,
                  '& .MuiTabs-indicator': { height: 2 },
                  '& .MuiTab-root': {
                    textTransform: 'none',
                    minHeight: 48,
                    fontWeight: (t: Theme) => t.typography.fontWeightMedium,
                  },
                  '& .Mui-selected': { color: 'primary.main', fontWeight: 700 },
                }}
              >
                <Tab label={`Assigned sets (${assignedCount})`} id="tab-assigned-priv-sets" />
                <Tab label={`Unassigned sets (${unassignedCount})`} id="tab-unassigned-priv-sets" />
              </Tabs>
              <Box
                sx={{
                  bgcolor: 'surface.elevation1',
                  px: 2,
                  py: (theme: Theme) => theme.spacing(1.5),
                }}
              >
                <EnhancedTextField
                  showLabel={false}
                  placeholder="Search privilege sets"
                  value={search}
                  size="medium"
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
                  fullWidth
                  slotProps={{
                    input: {
                      startAdornment: (
                        <Box component="span" sx={{ mr: 1, display: 'inline-flex' }}>
                          <Icon name="magnifying-glass" size="sm" sx={{ opacity: 0.55 }} />
                        </Box>
                      ),
                    },
                  }}
                />
              </Box>
            </Box>
          </Stack>
        }
        footerActions={
          <Fragment>
            <Tooltip
              title={changeStats.totalChanges === 0 ? 'No unsaved changes' : changeStats.tooltipDetail}
              placement="top"
            >
              <Typography
                variant="body3"
                color="text.secondary"
                sx={{ cursor: 'default', maxWidth: 200, whiteSpace: 'nowrap' }}
                noWrap
              >
                {changeStats.totalChanges === 0
                  ? 'No changes'
                  : `${changeStats.totalChanges} change${changeStats.totalChanges === 1 ? '' : 's'} made`}
              </Typography>
            </Tooltip>
            <Button variant="outlined" color="neutral" size="medium" disabled={savePending} onClick={(e: ReactMouseEvent) => discardAndDismiss(e)}>
              Cancel
            </Button>
            <Button variant="contained" color="primary" size="medium" disabled={savePending} onClick={handleSave}>
              Save
            </Button>
          </Fragment>
        }
      >
        <Stack spacing={1} sx={{ px: 0, pt: 2, pb: 1 }}>
          {rows.length === 0 ? (
            <Typography variant="body2" color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
              {tab === 0 ? 'No privilege sets assigned to this role.' : 'All privilege sets are already assigned.'}
            </Typography>
          ) : (
            rows.map((ps) => (
                <Accordion
                  key={ps.id}
                  disableGutters
                  elevation={0}
                  TransitionProps={{ unmountOnExit: true }}
                  sx={{
                    bgcolor: 'background.paper',
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 1,
                    '&:before': { display: 'none' },
                    overflow: 'hidden',
                  }}
                >
                  <AccordionSummary
                    expandIcon={<Icon name="caret-down" size="sm" sx={{ flexShrink: 0 }} />}
                    sx={{
                      minHeight: 56,
                      px: 2,
                      bgcolor: 'background.paper',
                      '&.Mui-expanded': {
                        minHeight: 56,
                        bgcolor: 'background.paper',
                      },
                      alignItems: 'center',
                      '& .MuiAccordionSummary-content': {
                        alignItems: 'center',
                        gap: 1,
                        overflow: 'hidden',
                        mr: 1,
                        flex: 1,
                        margin: 0,
                        '&.Mui-expanded': { margin: 0 },
                      },
                      '& .MuiAccordionSummary-expandIconWrapper': {
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        alignSelf: 'stretch',
                      },
                    }}
                  >
                    <Stack spacing={0.25} sx={{ flex: 1, minWidth: 0, alignSelf: 'center' }}>
                      <Typography variant="body2" sx={{ fontWeight: 700 }} noWrap title={ps.privilegeSetName}>
                        {ps.privilegeSetName}
                      </Typography>
                      {ps.description ? (
                        <Typography variant="caption" color="text.secondary" sx={{ WebkitLineClamp: 2, display: '-webkit-box', WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                          {ps.description}
                        </Typography>
                      ) : null}
                    </Stack>
                    <Stack
                      direction="row"
                      spacing={0.5}
                      alignItems="center"
                      flexWrap="nowrap"
                      onClick={(e: ReactMouseEvent) => e.stopPropagation()}
                    >
                      <Tooltip title="Open in new tab" placement="top">
                        <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', lineHeight: 0 }}>
                          <IconButton
                            size="small"
                            variant="outlined"
                            aria-label={`Open ${ps.privilegeSetName} in new tab`}
                            onClick={(e: ReactMouseEvent) => {
                              e.stopPropagation()
                              openPrivilegeSetInNewTab(ps.id)
                            }}
                          >
                            <Icon name="arrow-square-out" size="sm" />
                          </IconButton>
                        </Box>
                      </Tooltip>
                      {tab === 0 ? (
                        <Button
                          variant="outlined"
                          color="primary"
                          size="small"
                          sx={{ flexShrink: 0, textTransform: 'none', fontWeight: 500 }}
                          onClick={(e: ReactMouseEvent) => {
                            e.stopPropagation()
                            removeIds([ps.id])
                          }}
                        >
                          Remove
                        </Button>
                      ) : (
                        <Button
                          variant="outlined"
                          color="primary"
                          size="small"
                          sx={{ flexShrink: 0, textTransform: 'none', fontWeight: 500 }}
                          onClick={(e: ReactMouseEvent) => {
                            e.stopPropagation()
                            assignIds([ps.id])
                          }}
                        >
                          Assign
                        </Button>
                      )}
                    </Stack>
                  </AccordionSummary>
                  <AccordionDetails
                    sx={{
                      px: 2,
                      pt: 0,
                      pb: 2,
                      borderTop: 1,
                      borderColor: 'divider',
                      bgcolor: 'background.paper',
                    }}
                  >
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1, fontWeight: 600 }}>
                      Included privileges
                    </Typography>
                    <PrivilegeChipsPreview privilegeSetId={ps.id} />
                  </AccordionDetails>
                </Accordion>
              ))
            )}
        </Stack>
      </Drawer>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6500}
        TransitionComponent={snackbarSlideUp}
        onClose={() => setSnackbarOpen(false)}
        message={snackbarMessage}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      />
    </>
  )
}
