import { useCallback, useEffect, useMemo, useState, type MouseEvent } from 'react'
import type { GridRenderCellParams, GridRowId, GridSortModel } from '@mui/x-data-grid-pro'
import MenuItem from '@mui/material/MenuItem'
import { alpha, type Theme } from '@mui/material/styles'
import {
  Avatar,
  Box,
  Chip,
  DataGrid,
  Divider,
  getInitials,
  Icon,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  Paper,
  Stack,
  stringToColor,
  Typography,
  type GridColDef,
  type ToolbarFilterConfig,
} from '@exotel-npm-dev/signal-design-system'
import { fetchUsersQuery } from '../api/usersApi'
import type { TableUserRow, TableUserStatus } from '../data/tableUser'
import type { FilterRecords } from '../types/filterRecords'
import { avatarFillFromHue } from '../utils/avatarSurface'

/** Tonal chip fill aligned with Signal DS `MuiButton` `[data-variant="tonal"]` tokens (alpha on semantic main). */
function tonalChipSx(theme: Theme, semantic: 'success' | 'warning' | 'error') {
  const palette = theme.palette[semantic]
  const isDark = theme.palette.mode === 'dark'
  const bgAlpha = isDark ? 0.16 : 0.12
  const fs = theme.typography.pxToRem(13)
  return {
    backgroundColor: alpha(palette.main, bgAlpha),
    color: palette.main,
    boxShadow: 'none',
    fontSize: fs,
    fontWeight: theme.typography.fontWeightMedium,
    lineHeight: 1.25,
    '& .MuiChip-label': {
      fontSize: fs,
      lineHeight: 1.25,
    },
  }
}

function statusToSemantic(status: TableUserStatus): 'success' | 'warning' | 'error' {
  switch (status) {
    case 'Active':
      return 'success'
    case 'Suspended':
      return 'warning'
    case 'Scheduled for Deletion':
      return 'error'
    default: {
      const _x: never = status
      return _x
    }
  }
}

const roleOptions = [
  { value: 'all', label: 'All' },
  { value: 'Admin', label: 'Admin' },
  { value: 'Member', label: 'Member' },
]

const teamOptions = [
  { value: 'all', label: 'All' },
  { value: 'Design', label: 'Design' },
  { value: 'Engineer', label: 'Engineer' },
]

const filterChipOptions = [
  { value: 'all', label: 'All' },
  { value: 'option_a', label: 'Option A' },
  { value: 'option_b', label: 'Option B' },
]

/** Must match toolbar `initialValue`s and stay in sync with `buildToolbarFilters` */
const INITIAL_TOOLBAR_FILTERS: FilterRecords = {
  role: 'all',
  team: 'all',
  filterChip1: 'option_a',
  filterChip2: 'option_b',
}

function buildToolbarFilters(): ToolbarFilterConfig[] {
  return [
    {
      id: 'role',
      type: 'select',
      label: 'Role',
      iconName: 'user',
      options: roleOptions,
      initialValue: INITIAL_TOOLBAR_FILTERS.role,
    },
    {
      id: 'team',
      type: 'select',
      label: 'Team',
      iconName: 'users-three',
      options: teamOptions,
      initialValue: INITIAL_TOOLBAR_FILTERS.team,
    },
    {
      id: 'filterChip1',
      type: 'select',
      label: 'Filter Chip 1',
      options: filterChipOptions,
      initialValue: INITIAL_TOOLBAR_FILTERS.filterChip1,
    },
    {
      id: 'filterChip2',
      type: 'select',
      label: 'Filter Chip 2',
      options: filterChipOptions,
      initialValue: INITIAL_TOOLBAR_FILTERS.filterChip2,
    },
  ]
}

export function ExampleTablePage() {
  const [rows, setRows] = useState<TableUserRow[]>([])
  const [rowCount, setRowCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 25 })
  const [sortModel, setSortModel] = useState<GridSortModel>([])
  const [filterRecords, setFilterRecords] = useState<FilterRecords>(() => ({ ...INITIAL_TOOLBAR_FILTERS }))
  const [menuAnchorEl, setMenuAnchorEl] = useState<HTMLElement | null>(null)
  const [menuRowId, setMenuRowId] = useState<string | number | null>(null)

  const handleMenuOpen = useCallback((event: React.MouseEvent<HTMLElement>, rowId: string | number) => {
    setMenuAnchorEl(event.currentTarget)
    setMenuRowId(rowId)
  }, [])

  const handleMenuClose = useCallback(() => {
    setMenuAnchorEl(null)
    setMenuRowId(null)
  }, [])

  const handleMenuAction = useCallback((action: string) => {
    console.log(`Action "${action}" on row: ${String(menuRowId)}`)
    handleMenuClose()
  }, [menuRowId, handleMenuClose])

  const loadPage = useCallback(
    async (page: number, pageSize: number, sort: GridSortModel, filters: FilterRecords) => {
      setLoading(true)
      setLoadError(null)
      try {
        const { rows: nextRows, rowCount: total } = await fetchUsersQuery({
          page,
          pageSize,
          sortModel: sort,
          filters,
        })
        setRows(nextRows)
        setRowCount(total)
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to load users'
        setLoadError(message)
        setRows([])
        setRowCount(0)
      } finally {
        setLoading(false)
      }
    }, [])

  useEffect(() => {
    void loadPage(paginationModel.page, paginationModel.pageSize, sortModel, filterRecords)
  }, [paginationModel.page, paginationModel.pageSize, sortModel, filterRecords, loadPage])

  const toolbarFilters = useMemo(() => buildToolbarFilters(), [])

  const renderUserNameCell = useCallback((params: GridRenderCellParams) => {
    const name = String(params.value ?? '')
    const raw = stringToColor(name)
    return (
      <Stack height='100%' alignItems="center" direction="row" spacing={1}>
        <Avatar
          sx={(theme: Theme) => ({
            width: 24,
            height: 24,
            fontSize: theme.typography.pxToRem(12),
            fontWeight: theme.typography.fontWeightMedium,
            bgcolor: avatarFillFromHue(raw, theme),
            color: theme.palette.common.white,
          })}
        >
          {getInitials(name)}
        </Avatar>
        <Typography variant="body2">
          {params.value}
        </Typography>
      </Stack>
    )
  }, [])

  const renderStatusCell = useCallback((params: GridRenderCellParams<TableUserRow, TableUserStatus>) => {
    const status = params.value
    if (!status) {
      return null
    }
    const semantic = statusToSemantic(status)
    return (
      <Stack height="100%" alignItems="center" direction="row">
        <Chip
          label={status}
          size="small"
          color={semantic}
          variant="filled"
          sx={(theme: Theme) => tonalChipSx(theme, semantic)}
        />
      </Stack>
    )
  }, [])

  const columns: GridColDef<TableUserRow>[] = useMemo(
    () => [
      {
        field: 'userName',
        headerName: 'User Name',
        flex: 1,
        minWidth: 200,
        sortable: true,
        renderCell: renderUserNameCell,
      },
      {
        field: 'email',
        headerName: 'Email',
        flex: 1.2,
        minWidth: 240,
        sortable: true,
      },
      {
        field: 'status',
        headerName: 'Status',
        flex: 0.9,
        minWidth: 200,
        sortable: true,
        renderCell: renderStatusCell,
      },
      {
        field: 'role',
        headerName: 'Role',
        width: 120,
        sortable: true,
      },
      {
        field: 'team',
        headerName: 'Team',
        width: 130,
        sortable: true,
      },
      {
        field: 'actions',
        headerName: 'Actions',
        width: 72,
        sortable: false,
        filterable: false,
        disableColumnMenu: true,
        renderCell: (params: GridRenderCellParams) => (
          <IconButton
            size="small"
            aria-label="More actions"
            variant='outlined'
            onClick={(e: MouseEvent<HTMLButtonElement>) => {
              e.stopPropagation()
              handleMenuOpen(e, params.id)
            }}
          >
            <Icon name="dots-three-vertical" size="sm" />
          </IconButton>
        ),
      },
    ],
    [handleMenuOpen, renderStatusCell, renderUserNameCell],
  )

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 1,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'surface.elevation1',
        overflow: 'hidden'
      }}
    >
      <Stack spacing={1.5} sx={{ flex: 1, height: '100%' }}>
        {loadError && (
          <Typography color="error" variant="body2">
            {loadError}
          </Typography>
        )}
        <Box sx={{ flex: 1, height: '100%', minHeight: 480 }}>
          <DataGrid
            tableHeader={{
              title: 'Example - Table Page',
              subtitle: 'Interactive table from Signal Design System',
              showSearch: true,
              searchType: "basic",
              actions: [
                { id: 'cta-action-outlined', variant: 'outlined', children: 'CTA Action', onClick: () => {} },
                { id: 'cta-action', variant: 'contained', children: 'CTA Action', startIconProps: { name: 'plus', size: 'sm' }, onClick: () => {} },
                { id: 'export-action', variant: 'outlined', children: 'Export', startIconProps: { name: 'export', size: 'sm' }, onClick: () => {} },
                { id: 'import-action', variant: 'outlined', children: 'Import', startIconProps: { name: 'download-simple', size: 'sm' }, onClick: () => {} },
                { id: 'settings-action', variant: 'outlined', children: 'Settings', startIconProps: { name: 'gear', size: 'sm' }, onClick: () => {} },
              ],
              maxVisibleActions: 2,
            }}
            rows={rows}
            columns={columns}
            loading={loading}
            checkboxSelection
            sortingMode="server"
            sortModel={sortModel}
            onSortModelChange={(model: GridSortModel) => {
              setSortModel(model)
              setPaginationModel((p) => ({ ...p, page: 0 }))
            }}
            paginationMode="server"
            rowCount={rowCount}
            disableRowSelectionOnClick
            pagination
            paginationModel={paginationModel}
            onPaginationModelChange={setPaginationModel}
            pageSizeOptions={[5, 10, 25]}
            customToolbarFilters={toolbarFilters}
            onToolbarFiltersChange={(filters: FilterRecords) => {
              setFilterRecords(filters)
              setPaginationModel((p) => ({ ...p, page: 0 }))
            }}
            showAppliedFilters
            maxVisibleAppliedFilters={4}
            onRefresh={() =>
              void loadPage(paginationModel.page, paginationModel.pageSize, sortModel, filterRecords)
            }
            bulkDeleteConfig={{
              onDelete: (selectedIds: GridRowId[]) => {
                alert(`Selected items: ${selectedIds.join(', ')}`)
              },
            }}
            initialState={{pinnedColumns: {right: ['actions']}}}
          />
          <Menu
            anchorEl={menuAnchorEl}
            open={Boolean(menuAnchorEl)}
            onClose={handleMenuClose}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            slotProps={{ paper: { sx: { minWidth: 180 } } }}
          >
            <MenuItem onClick={() => handleMenuAction('edit')}>
              <ListItemIcon><Icon name="pencil-simple-line" size="sm" /></ListItemIcon>
              <ListItemText>Edit</ListItemText>
            </MenuItem>
            <MenuItem onClick={() => handleMenuAction('download')}>
              <ListItemIcon><Icon name="download-simple" size="sm" /></ListItemIcon>
              <ListItemText>Download</ListItemText>
            </MenuItem>
            <MenuItem onClick={() => handleMenuAction('duplicate')}>
              <ListItemIcon><Icon name="copy-simple" size="sm" /></ListItemIcon>
              <ListItemText>Duplicate</ListItemText>
            </MenuItem>
            <MenuItem onClick={() => handleMenuAction('view-activity')}>
              <ListItemIcon><Icon name="clock-counter-clockwise" size="sm" /></ListItemIcon>
              <ListItemText>View Activity</ListItemText>
            </MenuItem>
            <Divider />
            <MenuItem onClick={() => handleMenuAction('delete')} sx={{ color: 'error.main' }}>
              <ListItemIcon sx={{ color: 'inherit' }}><Icon name="trash-simple" size="sm" /></ListItemIcon>
              <ListItemText color="error.main">Delete</ListItemText>
            </MenuItem>
          </Menu>
        </Box>
      </Stack>
    </Paper>
  )
}
