/**
 * User Management » Users — Harmony Admin inner shell (Figma frame 2030:4881).
 * @see https://www.figma.com/design/nwOtFKxcMoTHpQlZ4xtPBa/Harmony-Admin?node-id=2030-4881
 */
import { useCallback, useMemo, useRef, useState, type ChangeEvent, type SyntheticEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import type { GridRenderCellParams, GridRowParams } from '@mui/x-data-grid-pro'
import Alert from '@mui/material/Alert'
import ClickAwayListener from '@mui/material/ClickAwayListener'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import MenuItem from '@mui/material/MenuItem'
import MenuList from '@mui/material/MenuList'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import Paper from '@mui/material/Paper'
import Popper from '@mui/material/Popper'
import Snackbar from '@mui/material/Snackbar'
import TextField from '@mui/material/TextField'
import { alpha, useTheme, type Theme } from '@mui/material/styles'
import {
  Avatar,
  Box,
  Button,
  Chip,
  DataGrid,
  EnhancedTextField,
  Icon,
  IconButton,
  Menu,
  Stack,
  Tab,
  Tabs,
  Typography,
  getInitials,
  stringToColor,
  type GridColDef,
  type ToolbarFilterConfig,
} from '@exotel-npm-dev/signal-design-system'
import { avatarFillFromHue } from '../../utils/avatarSurface'
import type { UserManagementDirectoryRow } from '../../data/userManagementUsers'
import type { FilterRecords } from '../../types/filterRecords'

export type UserSearchColumnKey =
  | 'all'
  | 'displayName'
  | 'id'
  | 'assignedRoleName'
  | 'channel'
  | 'capacity'
  | 'campaigns'
  | 'groups'

const UM_USER_SEARCH_OPTIONS: { value: UserSearchColumnKey; label: string }[] = [
  { value: 'all', label: 'All columns' },
  { value: 'displayName', label: 'User Name' },
  { value: 'id', label: 'User ID' },
  { value: 'assignedRoleName', label: 'Role' },
  { value: 'channel', label: 'Channel' },
  { value: 'capacity', label: 'Capacity' },
  { value: 'campaigns', label: 'Campaigns' },
  { value: 'groups', label: 'Groups' },
]

const USER_FILTERS_INITIAL: FilterRecords = {
  uu_role: 'all',
  uu_channel: 'all',
  uu_group: 'all',
  uu_status: 'all',
}

function matchesColumnSearch(
  row: UserManagementDirectoryRow,
  raw: string,
  col: UserSearchColumnKey,
): boolean {
  const q = raw.trim().toLowerCase()
  if (!q) return true
  const capacityStr =
    row.capacity != null && !Number.isNaN(row.capacity) ? String(row.capacity) : ''
  const groupsBlob = row.groups.join(' ').toLowerCase()
  if (col === 'all') {
    const blob = [
      row.displayName,
      row.id,
      row.email ?? '',
      row.assignedRoleName ?? '',
      row.channel ?? '',
      capacityStr,
      row.capacity != null ? `${capacityStr}%` : '',
      row.campaigns ?? '',
      groupsBlob,
    ]
      .join(' ')
      .toLowerCase()
    return blob.includes(q)
  }
  if (col === 'displayName') return row.displayName.toLowerCase().includes(q)
  if (col === 'id') return row.id.toLowerCase().includes(q)
  if (col === 'assignedRoleName') return (row.assignedRoleName ?? '').toLowerCase().includes(q)
  if (col === 'channel') return (row.channel ?? '').toLowerCase().includes(q)
  if (col === 'capacity') {
    return (
      capacityStr.includes(q.replace(/%/g, '')) ||
      `${capacityStr}%`.toLowerCase().includes(q)
    )
  }
  if (col === 'campaigns') return (row.campaigns ?? '').toLowerCase().includes(q)
  if (col === 'groups') return groupsBlob.includes(q)
  return true
}

function applyUserDirectoryFilters(
  rows: UserManagementDirectoryRow[],
  search: string,
  searchColumn: UserSearchColumnKey,
  filters: FilterRecords,
): UserManagementDirectoryRow[] {
  let next = rows.filter((r) => matchesColumnSearch(r, search, searchColumn))

  const role = filters.uu_role
  if (role && role !== 'all') {
    if (role === '__unassigned__') {
      next = next.filter((r) => !r.assignedRoleName)
    } else {
      next = next.filter((r) => r.assignedRoleName === role)
    }
  }

  const ch = filters.uu_channel
  if (ch && ch !== 'all') {
    next = next.filter((r) => (r.channel ?? '') === ch)
  }

  const grp = filters.uu_group
  if (grp && grp !== 'all') {
    next = next.filter((r) => r.groups.some((g) => g === grp))
  }

  const st = filters.uu_status
  if (st && st !== 'all') {
    if (st === 'active') next = next // all rows active in prototype
    if (st === 'inactive') next = next.filter(() => false)
  }

  return next
}

function buildUserToolbarFilters(rows: UserManagementDirectoryRow[]): ToolbarFilterConfig[] {
  const roles = [
    ...new Set(rows.map((r) => r.assignedRoleName).filter(Boolean) as string[]),
  ].sort()
  const channels = [...new Set(rows.map((r) => r.channel).filter(Boolean) as string[])].sort()
  const groups = [...new Set(rows.flatMap((r) => r.groups ?? []))].sort()

  return [
    {
      id: 'uu_role',
      type: 'select',
      label: 'Role',
      iconName: 'user',
      options: [
        { value: 'all', label: 'All' },
        { value: '__unassigned__', label: 'Unassigned' },
        ...roles.map((r) => ({ value: r, label: r })),
      ],
      initialValue: 'all',
    },
    {
      id: 'uu_channel',
      type: 'select',
      label: 'Channel',
      iconName: 'phone',
      options: [{ value: 'all', label: 'All' }, ...channels.map((c) => ({ value: c, label: c }))],
      initialValue: 'all',
    },
    {
      id: 'uu_group',
      type: 'select',
      label: 'Groups',
      iconName: 'users-three',
      options: [{ value: 'all', label: 'All' }, ...groups.map((g) => ({ value: g, label: g }))],
      initialValue: 'all',
    },
    {
      id: 'uu_status',
      type: 'select',
      label: 'Status',
      iconName: 'check-circle',
      options: [
        { value: 'all', label: 'All' },
        { value: 'active', label: 'Active' },
        { value: 'inactive', label: 'Inactive' },
      ],
      initialValue: 'all',
    },
  ]
}

const dataGridSx = {
  border: 'none',
  '& .MuiDataGrid-root': {
    bgcolor: 'background.paper',
  },
  '& .MuiDataGrid-main': {
    bgcolor: 'background.paper',
  },
  '& .MuiDataGrid-cell': {
    display: 'flex',
    alignItems: 'center',
    overflow: 'hidden',
    minWidth: 0,
  },
  '& .MuiDataGrid-columnHeaders .MuiDataGrid-columnHeader': {
    alignItems: 'center',
  },
  '& .MuiDataGrid-columnHeaderTitleContainer': {
    alignItems: 'center',
  },
} as const

export type UserManagementUsersPanelProps = {
  rows: UserManagementDirectoryRow[]
  loadError: string | null
  onRetryLoad: () => void | Promise<void>
}

export function UserManagementUsersPanel({
  rows,
  loadError,
  onRetryLoad,
}: UserManagementUsersPanelProps) {
  const theme = useTheme()
  const navigate = useNavigate()
  const splitCreateRef = useRef<HTMLDivElement | null>(null)
  const [umSubTab, setUmSubTab] = useState(0)
  const [searchColumn, setSearchColumn] = useState<UserSearchColumnKey>('displayName')
  const [search, setSearch] = useState('')
  const [filterRecords, setFilterRecords] = useState<FilterRecords>(() => ({
    ...USER_FILTERS_INITIAL,
  }))
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 })
  const [menuAnchorEl, setMenuAnchorEl] = useState<HTMLElement | null>(null)
  const [menuRowId, setMenuRowId] = useState<string | null>(null)
  const [inviteOpen, setInviteOpen] = useState(false)
  const [createMenuOpen, setCreateMenuOpen] = useState(false)
  const [snack, setSnack] = useState<string | null>(null)

  const toolbarFilters = useMemo(() => buildUserToolbarFilters(rows), [rows])

  const filteredRows = useMemo(
    () => applyUserDirectoryFilters(rows, search, searchColumn, filterRecords),
    [rows, search, searchColumn, filterRecords],
  )

  const handleUmTabs = useCallback((_: SyntheticEvent, v: number) => {
    setUmSubTab(v)
    setPaginationModel((p) => ({ ...p, page: 0 }))
  }, [])

  const handleToolbarFiltersChange = useCallback((filters: FilterRecords) => {
    setFilterRecords(filters)
    setPaginationModel((p) => ({ ...p, page: 0 }))
  }, [])

  const handleMenuOpen = useCallback((event: React.MouseEvent<HTMLElement>, rowId: string) => {
    event.stopPropagation()
    setMenuAnchorEl(event.currentTarget)
    setMenuRowId(rowId)
  }, [])

  const handleMenuClose = useCallback(() => {
    setMenuAnchorEl(null)
    setMenuRowId(null)
  }, [])

  const menuRow = useMemo(
    () => (menuRowId ? rows.find((r) => r.id === menuRowId) : undefined),
    [menuRowId, rows],
  )

  const handleMenuAction = useCallback(
    async (action: 'view_role' | 'copy_email') => {
      const row = menuRow
      handleMenuClose()
      if (!row) return
      if (action === 'view_role') {
        if (row.assignedRoleId) {
          navigate(`/closed-interaction/user-management/roles/${row.assignedRoleId}`)
        } else {
          setSnack('This user is not assigned to a role yet.')
        }
        return
      }
      const em = row.email?.trim()
      if (!em) {
        setSnack('No email on file for this user.')
        return
      }
      try {
        await navigator.clipboard.writeText(em)
        setSnack('Email copied')
      } catch {
        setSnack('Could not copy email')
      }
    },
    [menuRow, handleMenuClose, navigate],
  )

  const handleUserRowClick = useCallback(
    (params: GridRowParams<UserManagementDirectoryRow>, event: React.MouseEvent) => {
      const el = event.target as HTMLElement
      if (el.closest('.MuiCheckbox-root, [class*="checkbox"]')) return
      if (el.closest('button')) return
      navigate(`/closed-interaction/user-management/users/${encodeURIComponent(params.row.id)}`)
    },
    [navigate],
  )

  const columns: GridColDef<UserManagementDirectoryRow>[] = useMemo(
    () => [
      {
        field: 'displayName',
        headerName: 'User Name',
        flex: 1,
        minWidth: 180,
        renderCell: (params: GridRenderCellParams<UserManagementDirectoryRow>) => {
          const name = String(params.value ?? '')
          const raw = stringToColor(name)
          return (
            <Stack
              direction="row"
              alignItems="center"
              spacing={1}
              sx={{ minWidth: 0, width: '100%', overflow: 'hidden' }}
            >
              <Avatar
                sx={(t: Theme) => ({
                  width: 28,
                  height: 28,
                  flexShrink: 0,
                  fontSize: t.typography.pxToRem(12),
                  fontWeight: t.typography.fontWeightMedium,
                  bgcolor: avatarFillFromHue(raw, t),
                  color: t.palette.common.white,
                })}
              >
                {getInitials(name)}
              </Avatar>
              <Typography
                variant="body2"
                noWrap
                sx={{
                  minWidth: 0,
                  flex: 1,
                  color: 'primary.main',
                  fontWeight: (t: Theme) => t.typography.fontWeightMedium,
                  cursor: 'pointer',
                  lineHeight: 1.43,
                  '&:hover': { textDecoration: 'underline' },
                }}
              >
                {name}
              </Typography>
            </Stack>
          )
        },
      },
      {
        field: 'id',
        headerName: 'User ID',
        width: 128,
        renderCell: (params: GridRenderCellParams<UserManagementDirectoryRow>) => (
          <Typography
            variant="body2"
            noWrap
            sx={{ width: '100%', lineHeight: 1.43, fontFamily: 'ui-monospace, monospace', fontSize: 12 }}
          >
            {String(params.value ?? '')}
          </Typography>
        ),
      },
      {
        field: 'assignedRoleName',
        headerName: 'Role',
        flex: 0.85,
        minWidth: 140,
        renderCell: (params: GridRenderCellParams<UserManagementDirectoryRow>) => {
          const v = params.value ? String(params.value) : ''
          if (!v) {
            return (
              <Chip size="small" label="—" variant="tonal" color="default" sx={{ opacity: 0.8 }} />
            )
          }
          return (
            <Chip size="small" label={v} variant="tonal" color="info" sx={{ maxWidth: '100%' }} />
          )
        },
      },
      {
        field: 'channel',
        headerName: 'Channel',
        width: 110,
        renderCell: (params: GridRenderCellParams<UserManagementDirectoryRow>) => (
          <Typography variant="body2" noWrap sx={{ width: '100%', lineHeight: 1.43 }}>
            {params.value ? String(params.value) : '—'}
          </Typography>
        ),
      },
      {
        field: 'capacity',
        headerName: 'Capacity',
        width: 104,
        type: 'number',
        align: 'left',
        headerAlign: 'left',
        valueGetter: (_v, row) => row.capacity,
        renderCell: (params: GridRenderCellParams<UserManagementDirectoryRow>) => (
          <Typography variant="body2" noWrap sx={{ width: '100%', lineHeight: 1.43 }}>
            {params.row.capacity != null && !Number.isNaN(params.row.capacity)
              ? `${params.row.capacity}%`
              : '—'}
          </Typography>
        ),
      },
      {
        field: 'campaigns',
        headerName: 'Campaigns',
        flex: 1,
        minWidth: 160,
        renderCell: (params: GridRenderCellParams<UserManagementDirectoryRow>) => (
          <Typography variant="body2" noWrap sx={{ width: '100%', lineHeight: 1.43 }} title={String(params.value ?? '')}>
            {params.value ? String(params.value) : '—'}
          </Typography>
        ),
      },
      {
        field: 'groups',
        headerName: 'Groups',
        flex: 1.1,
        minWidth: 200,
        sortable: false,
        renderCell: (params: GridRenderCellParams<UserManagementDirectoryRow>) => {
          const g = params.row.groups ?? []
          if (g.length === 0) {
            return (
              <Typography variant="body2" color="text.secondary">
                —
              </Typography>
            )
          }
          return (
            <Stack direction="row" flexWrap="wrap" gap={0.75} sx={{ py: 0.5 }}>
              {g.slice(0, 4).map((label) => (
                <Chip key={label} size="small" label={label} variant="tonal" color="default" />
              ))}
              {g.length > 4 ? (
                <Chip size="small" label={`+${g.length - 4}`} variant="tonal" color="default" />
              ) : null}
            </Stack>
          )
        },
      },
      {
        field: 'actions',
        headerName: ' ',
        width: 56,
        sortable: false,
        filterable: false,
        disableColumnMenu: true,
        renderCell: (params: GridRenderCellParams<UserManagementDirectoryRow>) => (
          <IconButton
            size="small"
            aria-label="Row actions"
            variant="outlined"
            onClick={(e: React.MouseEvent<HTMLElement>) => handleMenuOpen(e, params.row.id)}
          >
            <Icon name="dots-three-vertical" size="sm" />
          </IconButton>
        ),
      },
    ],
    [handleMenuOpen],
  )

  const splitLine = alpha(theme.palette.primary.contrastText, 0.28)

  return (
    <Box
      sx={{
        flex: '1 1 0%',
        width: '100%',
        minWidth: 0,
        minHeight: 0,
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'background.paper',
      }}
    >
      <Box
        sx={{
          flexShrink: 0,
          borderBottom: 1,
          borderColor: 'divider',
          bgcolor: 'background.paper',
        }}
      >
        <Tabs
          value={umSubTab}
          onChange={handleUmTabs}
          aria-label="Users directory"
          sx={{
            px: 2,
            minHeight: 40,
            '& .MuiTab-root': {
              minHeight: 40,
              textTransform: 'none',
              fontWeight: 500,
              fontSize: (t: Theme) => t.typography.pxToRem(14),
            },
            '& .Mui-selected': { color: 'primary.main' },
          }}
        >
          <Tab label="Users" />
          <Tab label="Upload History" />
        </Tabs>
      </Box>

      {umSubTab === 1 ? (
        <Box
          sx={{
            flex: 1,
            minHeight: 0,
            px: 3,
            py: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            gap: 1,
          }}
        >
          <Typography variant="title2" component="h2" sx={{ fontWeight: 600 }}>
            Upload History
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 520 }}>
            Bulk user imports and CSV uploads will be listed here with status and timestamps. This playground does not
            persist upload jobs yet.
          </Typography>
        </Box>
      ) : (
        <Box
          sx={{
            flex: 1,
            minHeight: 0,
            width: '100%',
            minWidth: 0,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
        <Box
          sx={{
            flexShrink: 0,
            bgcolor: 'surface.elevation1',
            px: 2,
            py: 1.5,
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 2,
          }}
        >
          <Typography variant="title2" component="h2" sx={{ fontWeight: 600, lineHeight: '24px' }}>
            Users
          </Typography>

          <Stack direction="row" alignItems="center" flexWrap="wrap" gap={1.5} justifyContent="flex-end">
            {/* Search */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'stretch',
                flex: '1 1 280px',
                maxWidth: 480,
                minWidth: { xs: 200, sm: 260 },
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 1,
                overflow: 'hidden',
                bgcolor: 'background.paper',
              }}
            >
              <TextField
                id="um-search-column"
                select
                size="medium"
                value={searchColumn}
                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                  setSearchColumn(e.target.value as UserSearchColumnKey)
                  setPaginationModel((p) => ({ ...p, page: 0 }))
                }}
                variant="outlined"
                sx={{
                  flex: '0 0 auto',
                  width: 118,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 0,
                    bgcolor: alpha(theme.palette.primary.main, 0.16),
                    minHeight: 40,
                    '& fieldset': { border: 'none' },
                    '&:hover fieldset': { border: 'none' },
                    '&.Mui-focused fieldset': { border: 'none' },
                  },
                  '& .MuiSelect-select': {
                    py: 1, pr: 3, pl: 1, typography: 'body2',
                    display: 'flex', alignItems: 'center',
                  },
                }}
              >
                {UM_USER_SEARCH_OPTIONS.map((o) => (
                  <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>
                ))}
              </TextField>
              <EnhancedTextField
                key={searchColumn}
                id="um-search-text"
                showLabel={false}
                placeholder="Search"
                size="medium"
                fullWidth
                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                  setSearch(e.target.value)
                  setPaginationModel((p) => ({ ...p, page: 0 }))
                }}
                sx={{
                  flex: '1 1 auto', minWidth: 0,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 0, minHeight: 40,
                    '& fieldset': { border: 'none' },
                    '&:hover fieldset': { border: 'none' },
                    '&.Mui-focused fieldset': { border: 'none' },
                  },
                }}
                slotProps={{ input: { startAdornment: <Icon name="magnifying-glass" size="sm" /> } }}
              />
            </Box>

            {/* Export — outlined */}
            <Button
              variant="outlined"
              color="neutral"
              size="medium"
              startIcon={<Icon name="export" size="sm" />}
              onClick={() => setSnack('Export is not wired in this prototype.')}
            >
              Export
            </Button>

            {/* Invite User — split button */}
            <Box
              ref={splitCreateRef}
              sx={(t: Theme) => {
                const r = t.spacing(1)
                return {
                  display: 'inline-flex', alignItems: 'stretch', flexShrink: 0,
                  borderRadius: r, overflow: 'hidden', boxShadow: t.shadows[2],
                  '& .MuiButton-root': { margin: 0, borderRadius: 0 },
                  '& .split-main': {
                    textTransform: 'none', fontWeight: t.typography.fontWeightMedium,
                    fontSize: t.typography.pxToRem(14),
                    px: t.spacing(2), py: `${10}px`, minHeight: 40,
                    borderRight: `1px solid ${splitLine}`,
                  },
                  '& .split-menu': { minWidth: 44, px: `${10}px`, py: `${10}px`, minHeight: 40 },
                }
              }}
            >
              <Button
                variant="contained" color="primary" size="medium" disableElevation
                className="split-main"
                sx={{ borderTopLeftRadius: (t: Theme) => t.spacing(1), borderBottomLeftRadius: (t: Theme) => t.spacing(1) }}
                onClick={() => setInviteOpen(true)}
              >
                Invite User
              </Button>
              <Button
                variant="contained" color="primary" size="medium" disableElevation
                className="split-menu"
                aria-label="Invite user options" aria-haspopup="true"
                aria-expanded={createMenuOpen ? 'true' : undefined}
                sx={{ borderTopRightRadius: (t: Theme) => t.spacing(1), borderBottomRightRadius: (t: Theme) => t.spacing(1) }}
                onClick={() => setCreateMenuOpen((o) => !o)}
              >
                <Icon name="caret-down" size="sm" sx={{ display: 'block', color: 'inherit' }} aria-hidden />
              </Button>
            </Box>

            {/* Create User — primary */}
            <Button
              variant="contained" color="primary" size="medium"
              startIcon={<Icon name="user-plus" size="sm" />}
              onClick={() => setSnack('Create user is not wired in this prototype.')}
            >
              Create User
            </Button>
          </Stack>
        </Box>

        <Popper
          open={createMenuOpen}
          anchorEl={splitCreateRef.current}
          placement="bottom-end"
          sx={{ zIndex: (t: Theme) => t.zIndex.modal }}
        >
          <ClickAwayListener onClickAway={() => setCreateMenuOpen(false)}>
            <Paper elevation={8} sx={{ mt: 0.5, minWidth: 220 }}>
              <MenuList dense autoFocusItem={createMenuOpen}>
                <MenuItem
                  onClick={() => {
                    setCreateMenuOpen(false)
                    setInviteOpen(true)
                  }}
                >
                  Invite Single
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    setCreateMenuOpen(false)
                    setSnack('Bulk Invite is not wired in this prototype.')
                  }}
                >
                  Bulk Invite
                </MenuItem>
              </MenuList>
            </Paper>
          </ClickAwayListener>
        </Popper>

        <Box sx={{ px: 2, pt: 0, pb: 1.5, bgcolor: 'surface.elevation1' }}>
          <Alert severity="info" sx={{ typography: 'body2' }}>
            Directory and role assignments stay in sync in this prototype. Open a role to add or move users — each
            person maps to at most one role.
          </Alert>
        </Box>

        {loadError ? (
          <Box sx={{ px: 2, pb: 1 }}>
            <Alert
              severity="error"
              action={
                <Button color="inherit" size="small" onClick={() => void onRetryLoad()}>
                  Retry
                </Button>
              }
            >
              {loadError}
            </Alert>
          </Box>
        ) : null}

        <Box
          sx={{
            flex: 1,
            minHeight: 0,
            width: '100%',
            minWidth: 0,
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
          }}
        >
          <DataGrid<UserManagementDirectoryRow>
            listView={false}
            sortingMode="client"
            checkboxSelection
            disableRowSelectionOnClick
            onRowClick={handleUserRowClick}
            rows={filteredRows}
            columns={columns}
            pagination
            paginationModel={paginationModel}
            onPaginationModelChange={setPaginationModel}
            pageSizeOptions={[10, 25]}
            density="standard"
            customToolbarFilters={toolbarFilters}
            onToolbarFiltersChange={handleToolbarFiltersChange}
            showAppliedFilters
            maxVisibleAppliedFilters={4}
            initialState={{
              pinnedColumns: { right: ['actions'] },
              sorting: {
                sortModel: [{ field: 'displayName', sort: 'asc' }],
              },
            }}
            onRefresh={() => setPaginationModel((p) => ({ ...p, page: 0 }))}
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
        </Box>
      </Box>
      )}

      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{ paper: { sx: { minWidth: 200 } } }}
      >
        <MenuItem onClick={() => void handleMenuAction('view_role')}>
          <ListItemIcon>
            <Icon name="user" size="sm" />
          </ListItemIcon>
          <ListItemText primary="View role" />
        </MenuItem>
        <MenuItem onClick={() => void handleMenuAction('copy_email')}>
          <ListItemIcon>
            <Icon name="copy-simple" size="sm" />
          </ListItemIcon>
          <ListItemText primary="Copy email" />
        </MenuItem>
      </Menu>

      <Dialog open={inviteOpen} onClose={() => setInviteOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Create User</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            User provisioning is not wired in this playground. Use <strong>Roles and Privileges</strong>, open a
            role, and assign people from the directory.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button variant="outlined" color="neutral" onClick={() => setInviteOpen(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={Boolean(snack)}
        autoHideDuration={4000}
        onClose={() => setSnack(null)}
        message={snack}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </Box>
  )
}
