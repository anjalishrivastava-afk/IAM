/**
 * Assign roles to a privilege set — DataGrid pattern aligned with ManageUsersDrawer.
 */
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
import Slide from '@mui/material/Slide'
import type { SlideProps } from '@mui/material/Slide'
import Snackbar from '@mui/material/Snackbar'
import type {
  GridColDef,
  GridRenderCellParams,
  GridRowId,
  GridRowSelectionModel,
} from '@mui/x-data-grid-pro'
import type { Theme } from '@mui/material/styles'
import {
  Avatar,
  Box,
  Button,
  Chip,
  DataGrid,
  Drawer,
  EnhancedTextField,
  Icon,
  IconButton,
  Stack,
  Tab,
  Tabs,
  Tooltip,
  Typography,
  getInitials,
  stringToColor,
} from '@exotel-npm-dev/signal-design-system'
import type { UserManagementRoleRow } from '../../data/userManagementRoles'
import { avatarFillFromHue } from '../../utils/avatarSurface'
import { BulkDrawerSelectionToolbar } from './BulkDrawerSelectionToolbar'
import { RbacListEmptyPlaceholder, rbacQuotedSearch } from './RbacListEmptyPlaceholder'

const HEADER_BG = '#f1f1f1'
const DRAWER_WIDTH_PX = 726

function snackbarSlideUp(props: SlideProps) {
  return <Slide {...props} direction="up" />
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

export function roleDetailPath(roleId: string): string {
  return `/closed-interaction/user-management/roles/${encodeURIComponent(roleId)}`
}

function emptySelection(): GridRowSelectionModel {
  return { type: 'include', ids: new Set() }
}

function selectionSize(model: GridRowSelectionModel): number {
  return model.type === 'include' ? model.ids.size : 0
}

type RoleGridRow = UserManagementRoleRow

const dataGridSx = {
  border: '1px solid',
  borderColor: 'divider',
  borderRadius: 1,
  backgroundColor: 'background.paper',
  '& .MuiDataGrid-main': {
    backgroundColor: 'background.paper',
  },
  '& .MuiDataGrid-cell': {
    display: 'flex',
    alignItems: 'center',
    overflow: 'hidden',
    minWidth: 0,
  },
  '& .MuiDataGrid-columnHeaders': {
    backgroundColor: (theme: Theme) =>
      theme.palette.mode === 'light' ? 'rgba(0, 0, 0, 0.02)' : 'action.hover',
  },
  '& .MuiDataGrid-columnHeaders .MuiDataGrid-columnHeader': {
    alignItems: 'center',
  },
} as const

function headerWithTitleAndKebab(header: string, menuAria: string) {
  return () => (
    <Stack direction="row" alignItems="center" justifyContent="space-between" width="100%" pr={0.5}>
      <Typography variant="body2" sx={{ fontWeight: 700, lineHeight: 1.43 }}>
        {header}
      </Typography>
      <IconButton size="small" aria-label={menuAria} variant="text" sx={{ mr: -0.5 }}>
        <Icon name="dots-three-vertical" size="sm" />
      </IconButton>
    </Stack>
  )
}

export interface ManageRolesForPrivilegeDrawerProps {
  open: boolean
  onClose: (event?: SyntheticEvent) => void
  privilegeSetDisplayName: string
  roles: UserManagementRoleRow[]
  assignedRoleIds: string[]
  onSave?: (roleIds: string[]) => void | Promise<void>
}

export function ManageRolesForPrivilegeDrawer({
  open,
  onClose,
  privilegeSetDisplayName,
  roles,
  assignedRoleIds,
  onSave,
}: ManageRolesForPrivilegeDrawerProps) {
  const [tab, setTab] = useState(0)
  const [search, setSearch] = useState('')
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 })
  const [selectionModel, setSelectionModel] = useState<GridRowSelectionModel>(() =>
    emptySelection(),
  )
  const [draftSet, setDraftSet] = useState<Set<string>>(() => new Set())
  const [committedSet, setCommittedSet] = useState<Set<string>>(() => new Set())
  const [snackbarOpen, setSnackbarOpen] = useState(false)
  const [snackbarMessage, setSnackbarMessage] = useState('')
  const [savePending, setSavePending] = useState(false)

  const committedKey = useMemo(
    () => [...assignedRoleIds].sort().join('\0'),
    [assignedRoleIds],
  )

  useEffect(() => {
    if (!open) return
    const next = new Set(assignedRoleIds)
    setCommittedSet(next)
    setDraftSet(new Set(next))
    setTab(0)
    setSearch('')
    setPaginationModel((p) => ({ ...p, page: 0 }))
    setSelectionModel(emptySelection())
  }, [open, committedKey, assignedRoleIds])

  const assignedRowsFiltered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return roles
      .filter((r) => draftSet.has(r.id))
      .filter((r) => {
        if (!q) return true
        return (
          r.roleName.toLowerCase().includes(q) ||
          (r.description || '').toLowerCase().includes(q) ||
          r.scopeType.toLowerCase().includes(q)
        )
      })
      .sort((a, b) => a.roleName.localeCompare(b.roleName))
  }, [roles, draftSet, search])

  const unassignedRowsFiltered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return roles
      .filter((r) => !draftSet.has(r.id))
      .filter((r) => {
        if (!q) return true
        return (
          r.roleName.toLowerCase().includes(q) ||
          (r.description || '').toLowerCase().includes(q) ||
          r.scopeType.toLowerCase().includes(q)
        )
      })
      .sort((a, b) => a.roleName.localeCompare(b.roleName))
  }, [roles, draftSet, search])

  const rows: RoleGridRow[] = useMemo(() => {
    const list = tab === 0 ? assignedRowsFiltered : unassignedRowsFiltered
    return [...list]
  }, [tab, assignedRowsFiltered, unassignedRowsFiltered])

  const assignedCount = useMemo(() => roles.filter((r) => draftSet.has(r.id)).length, [roles, draftSet])
  const unassignedCount = roles.length - assignedCount
  const selectedOnUnassigned = tab === 1 ? selectionSize(selectionModel) : 0
  const selectedOnAssigned = tab === 0 ? selectionSize(selectionModel) : 0

  const searchTrimRolesDrawer = search.trim()
  const rolesDrawerListEmptyMessaging = useMemo((): { title: string; description: string } | null => {
    if (rows.length > 0) return null
    const quoted = rbacQuotedSearch(search)
    if (tab === 0) {
      if (assignedCount === 0) {
        return searchTrimRolesDrawer
          ? {
              title: 'No roles assigned',
              description: `Nothing matches ${quoted || 'that search'}. Clear the search or open the Unassigned tab to assign roles.`,
            }
          : {
              title: 'No roles assigned',
              description: 'Open the Unassigned tab to attach roles to this privilege set.',
            }
      }
      return {
        title: quoted ? `No results for ${quoted}` : 'No matching roles',
        description: 'Try different keywords or clear the search.',
      }
    }
    if (unassignedCount === 0) {
      return searchTrimRolesDrawer
        ? {
            title: quoted ? `No results for ${quoted}` : 'No matching roles',
            description: 'Try different keywords or clear the search.',
          }
        : {
            title: 'All roles are assigned',
            description: 'Every role in this catalog already includes this privilege set.',
          }
    }
    return {
      title: quoted ? `No results for ${quoted}` : 'No matching roles',
      description: 'Try different keywords or clear the search.',
    }
  }, [
    rows.length,
    tab,
    assignedCount,
    unassignedCount,
    search,
    searchTrimRolesDrawer,
  ])

  const changeStats = useMemo(() => {
    const total = countSetDiff(committedSet, draftSet)
    const added: string[] = []
    const removed: string[] = []
    for (const id of draftSet) if (!committedSet.has(id)) added.push(id)
    for (const id of committedSet) if (!draftSet.has(id)) removed.push(id)
    const roleName = (id: string) => roles.find((r) => r.id === id)?.roleName ?? id
    const addedLabels = added.map(roleName)
    const removedLabels = removed.map(roleName)
    const tooltipParts: string[] = []
    if (addedLabels.length) tooltipParts.push(`Add: ${addedLabels.join(', ')}`)
    if (removedLabels.length) tooltipParts.push(`Remove: ${removedLabels.join(', ')}`)
    return {
      totalChanges: total,
      tooltipDetail: tooltipParts.join(' · ') || 'No unsaved changes',
    }
  }, [committedSet, draftSet, roles])

  useEffect(() => {
    setPaginationModel((p) => ({ ...p, page: 0 }))
  }, [search, tab])

  useEffect(() => {
    setSelectionModel(emptySelection())
  }, [tab])

  const assignIds = useCallback((ids: string[]) => {
    if (ids.length === 0) return
    setDraftSet((prev) => {
      const next = new Set(prev)
      for (const id of ids) next.add(id)
      return next
    })
    setSelectionModel(emptySelection())
    setPaginationModel((p) => ({ ...p, page: 0 }))
  }, [])

  const removeIdsOne = useCallback((id: string) => {
    setDraftSet((prev) => {
      const next = new Set(prev)
      next.delete(id)
      return next
    })
    setPaginationModel((p) => ({ ...p, page: 0 }))
  }, [])

  const handleAssignSelected = useCallback(
    (selectedIds: GridRowId[]) => {
      assignIds(selectedIds.map((id) => String(id)))
    },
    [assignIds],
  )

  const removeMultipleIds = useCallback((ids: string[]) => {
    if (ids.length === 0) return
    setDraftSet((prev) => {
      const next = new Set(prev)
      for (const id of ids) next.delete(id)
      return next
    })
    setSelectionModel(emptySelection())
    setPaginationModel((p) => ({ ...p, page: 0 }))
  }, [])

  const handleBulkDiscardRoles = useCallback(() => {
    setSelectionModel(emptySelection())
  }, [])

  const confirmBulkAssignRoles = useCallback(() => {
    if (tab !== 1 || selectionModel.type !== 'include') return
    handleAssignSelected([...selectionModel.ids])
  }, [tab, selectionModel, handleAssignSelected])

  const confirmBulkRemoveRoles = useCallback(() => {
    if (tab !== 0 || selectionModel.type !== 'include') return
    removeMultipleIds([...selectionModel.ids].map(String))
  }, [tab, selectionModel, removeMultipleIds])

  const discardAndDismiss = useCallback(
    (e?: SyntheticEvent) => {
      setSearch('')
      setTab(0)
      setPaginationModel((p) => ({ ...p, page: 0 }))
      setSelectionModel(emptySelection())
      const baseline = new Set(assignedRoleIds)
      setCommittedSet(baseline)
      setDraftSet(baseline)
      onClose(e)
    },
    [assignedRoleIds, onClose],
  )

  const dismissPlain = useCallback(
    (e?: SyntheticEvent) => {
      setSearch('')
      setTab(0)
      setPaginationModel((p) => ({ ...p, page: 0 }))
      setSelectionModel(emptySelection())
      onClose(e)
    },
    [onClose],
  )

  const handleSave = useCallback(async () => {
    if (!onSave || savePending) return
    setSavePending(true)
    try {
      await Promise.resolve(onSave(sortIdsStable(draftSet)))
      dismissPlain()
    } catch (e) {
      const msg = e instanceof Error ? e.message : typeof e === 'string' ? e : 'Could not save roles'
      setSnackbarMessage(msg)
      setSnackbarOpen(true)
    } finally {
      setSavePending(false)
    }
  }, [draftSet, dismissPlain, onSave, savePending])

  const handleTabChange = useCallback((_e: SyntheticEvent, v: number) => {
    setTab(v)
    setPaginationModel((p) => ({ ...p, page: 0 }))
    setSelectionModel(emptySelection())
  }, [])

  const openRoleDetailInNewTab = useCallback((roleId: string) => {
    const url = new URL(roleDetailPath(roleId), window.location.origin).href
    window.open(url, '_blank', 'noopener,noreferrer')
  }, [])

  const columns: GridColDef<RoleGridRow>[] = useMemo(() => {
    const nameCol: GridColDef<RoleGridRow> = {
      field: 'roleName',
      headerName: 'Name',
      flex: 1,
      minWidth: 160,
      sortable: true,
      renderHeader: headerWithTitleAndKebab('Name', 'Name column options'),
      renderCell: (params: GridRenderCellParams<RoleGridRow>) => {
        const raw = stringToColor(params.row.roleName)
        return (
          <Stack direction="row" spacing={1.25} alignItems="center" sx={{ minWidth: 0 }}>
            <Avatar
              variant="circular"
              alt=""
              sx={(theme: Theme) => ({
                width: 24,
                height: 24,
                fontSize: theme.typography.pxToRem(12),
                fontWeight: theme.typography.fontWeightMedium,
                bgcolor: avatarFillFromHue(raw, theme),
                color: theme.palette.common.white,
              })}
            >
              {getInitials(params.row.roleName)}
            </Avatar>
            <Typography variant="body2" noWrap title={params.row.roleName}>
              {params.row.roleName}
            </Typography>
          </Stack>
        )
      },
    }

    const descCol: GridColDef<RoleGridRow> = {
      field: 'description',
      headerName: 'Description',
      flex: 1.2,
      minWidth: 200,
      sortable: true,
      renderHeader: headerWithTitleAndKebab('Description', 'Description column options'),
      renderCell: (params) => (
        <Typography variant="body2" color="text.secondary" noWrap title={params.value || ''}>
          {params.row.description?.trim() ? params.row.description : '—'}
        </Typography>
      ),
    }

    const typeCol: GridColDef<RoleGridRow> = {
      field: 'scopeType',
      headerName: 'Type',
      width: 132,
      sortable: true,
      renderHeader: headerWithTitleAndKebab('Type', 'Type column options'),
      renderCell: (params: GridRenderCellParams<RoleGridRow>) =>
        params.row.scopeType === 'default' ? (
          <Chip size="small" label="Default" variant="tonal" color="default" sx={{ maxWidth: '100%' }} />
        ) : (
          <Chip size="small" label="Custom" variant="tonal" color="info" sx={{ maxWidth: '100%' }} />
        ),
    }

    const actionsCol: GridColDef<RoleGridRow> = {
      field: '_actions',
      headerName: ' ',
      width: 154,
      sortable: false,
      align: 'right',
      headerAlign: 'right',
      disableColumnMenu: true,
      renderCell: (params: GridRenderCellParams<RoleGridRow>) => (
        <Stack direction="row" spacing={0.5} alignItems="center" justifyContent="flex-end" width="100%">
          <Tooltip title="Open in new tab" placement="top">
            <IconButton
              size="small"
              variant="outlined"
              aria-label={`Open ${params.row.roleName} in new tab`}
              onClick={(e: ReactMouseEvent) => {
                e.stopPropagation()
                openRoleDetailInNewTab(params.row.id)
              }}
            >
              <Icon name="arrow-square-out" size="sm" />
            </IconButton>
          </Tooltip>
          <Button
            variant="outlined"
            color="primary"
            size="small"
            sx={{ textTransform: 'none', fontWeight: 500, flexShrink: 0 }}
            onClick={(e: ReactMouseEvent) => {
              e.stopPropagation()
              if (tab === 0) {
                removeIdsOne(params.row.id)
              } else {
                assignIds([params.row.id])
              }
            }}
          >
            {tab === 0 ? 'Remove' : 'Assign'}
          </Button>
        </Stack>
      ),
    }

    return [nameCol, descCol, typeCol, actionsCol]
  }, [tab, assignIds, removeIdsOne, openRoleDetailInNewTab])

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
                  Roles
                </Typography>
                <Typography variant="body2" color="text.secondary" noWrap title={privilegeSetDisplayName}>
                  {privilegeSetDisplayName}
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
            <Button
              variant="outlined"
              color="neutral"
              size="medium"
              disabled={savePending}
              onClick={(e: ReactMouseEvent) => discardAndDismiss(e)}
            >
              Cancel
            </Button>
            <Button variant="contained" color="primary" size="medium" disabled={savePending} onClick={handleSave}>
              Save
            </Button>
          </Fragment>
        }
      >
        <Stack spacing={2}>
          <Box sx={{ mx: -2, mt: -1 }}>
            <Tabs
              value={tab}
              onChange={handleTabChange}
              aria-label="Role assignment tabs"
              sx={{
                px: 0,
                borderBottom: 1,
                borderColor: 'divider',
                '& .MuiTabs-indicator': { height: 2 },
                '& .MuiTab-root': {
                  textTransform: 'none',
                  minHeight: 48,
                  fontWeight: (t: Theme) => t.typography.fontWeightMedium,
                },
                '& .Mui-selected': { color: 'primary.main', fontWeight: 700 },
              }}
            >
              <Tab label={`Assigned roles (${assignedCount})`} id="tab-assigned-priv-roles" />
              <Tab label={`Unassigned roles (${unassignedCount})`} id="tab-unassigned-priv-roles" />
            </Tabs>
          </Box>

          <Box
            sx={{
              bgcolor: 'surface.elevation1',
              mx: -2,
              px: 2,
              py: (theme: Theme) => theme.spacing(1.5),
            }}
          >
            <EnhancedTextField
              showLabel={false}
              placeholder="Search by name or description"
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

          <BulkDrawerSelectionToolbar
            visible={
              (tab === 1 && selectedOnUnassigned > 0) || (tab === 0 && selectedOnAssigned > 0)
            }
            kind={tab === 1 ? 'assign' : 'remove'}
            selectedCount={tab === 1 ? selectedOnUnassigned : selectedOnAssigned}
            nounSingular="role"
            nounPlural="roles"
            onConfirm={tab === 1 ? confirmBulkAssignRoles : confirmBulkRemoveRoles}
            onDiscard={handleBulkDiscardRoles}
          />

          <Box
            sx={{
              mx: -2,
              flex: 1,
              minHeight: 360,
              minWidth: 0,
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              '& > div': {
                width: '100%',
                minWidth: 0,
                flex: 1,
                minHeight: 0,
                display: 'flex',
                flexDirection: 'column',
              },
              '& .MuiDataGrid-root': { border: 'none' },
            }}
          >
            {rolesDrawerListEmptyMessaging ? (
              <RbacListEmptyPlaceholder roomy {...rolesDrawerListEmptyMessaging} />
            ) : (
            <DataGrid
              key={`manage-roles-grid-${tab}`}
              showToolbar
              listView={false}
              sortingMode="client"
              onRefresh={() => setPaginationModel((p) => ({ ...p, page: 0 }))}
              density="standard"
              rows={rows}
              columns={columns}
              getRowId={(row: RoleGridRow) => row.id}
              pagination
              paginationMode="client"
              paginationModel={paginationModel}
              onPaginationModelChange={setPaginationModel}
              pageSizeOptions={[5, 10, 25]}
              checkboxSelection
              rowSelectionModel={selectionModel}
              onRowSelectionModelChange={setSelectionModel}
              disableRowSelectionOnClick
              disableColumnMenu
              sx={{
                ...dataGridSx,
                minWidth: { xs: 200, sm: 280 },
                width: '100%',
                maxWidth: '100%',
                flex: 1,
                minHeight: 0,
                '& .MuiDataGrid-root': {
                  bgcolor: 'background.paper',
                  width: '100%',
                },
                '& .MuiDataGrid-main': {
                  bgcolor: 'background.paper',
                },
              }}
            />
            )}
          </Box>
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
