import {
  Fragment,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type MouseEvent as ReactMouseEvent,
  type SyntheticEvent,
} from 'react'
import Snackbar from '@mui/material/Snackbar'
import Slide from '@mui/material/Slide'
import type { SlideProps } from '@mui/material/Slide'
import type {
  GridColDef,
  GridRenderCellParams,
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
  type ToolbarFilterConfig,
  Stack,
  Tab,
  Tabs,
  Tooltip,
  Typography,
  getInitials,
  stringToColor,
} from '@exotel-npm-dev/signal-design-system'
import { USER_MANAGEMENT_ROLE_NAMES } from '../../data/userManagementRoles'
import type { FilterRecords } from '../../types/filterRecords'
import { avatarFillFromHue } from '../../utils/avatarSurface'
import emptyAssignedHero from '../../assets/manage-users-drawer-empty-assigned.svg'
import { BulkDrawerSelectionToolbar } from './BulkDrawerSelectionToolbar'
import { RbacListEmptyPlaceholder, rbacQuotedSearch } from './RbacListEmptyPlaceholder'

/** Used so the Assigned tab empty hero can vertically center inside the Drawer body without editing Signal DS Drawer internals (header/footer + body padding). */
const DRAWER_EMPTY_HERO_VERTICAL_OFFSET_THEME_UNITS = 26

/** Demo pool — “not assigned” when not overlapping with assigned names. */
const NOT_ASSIGNED_SAMPLE = [
  'Rahul Anand',
  'Meera Dutta',
  'Chris Paul',
  'Fatima Zahra',
  'Vikrant Joshi',
  'Sydney Blake',
  'Omar Siddiqui',
  'Kelly Ng',
  'Diego Martins',
  'Hannah Lee',
  'Ibrahim Khan',
  'Claire Dubois',
  'Tom Hardy',
  'Nina Rao',
  'Samuel Greene',
  'Yuki Tanaka',
  'Lucas Ferreira',
  'Emma Wilson',
  'Marcus Bell',
  'Priya Desai',
  'Noah Carter',
  'Zoe Mitchell',
  'Ethan Park',
  'Sofia Ricci',
  'James Porter',
]

function rowKey(kind: 'assigned' | 'not', name: string, i: number) {
  return `${kind}:${i}:${name}`
}

/** Deterministic pseudo ID like Figma (001 / 1442 style). */
function displayUserId(name: string, indexInList: number) {
  let h = 5381
  for (let i = 0; i < name.length; i++) {
    h = (Math.imul(33, h) + name.charCodeAt(i)) | 0
  }
  const n = Math.abs(h + indexInList * 997) % 9990
  const id = 50 + n + indexInList * 3
  const s = String(id)
  return s.length <= 3 ? s.padStart(3, '0') : s.slice(-4).padStart(4, '0')
}

interface RowUser {
  key: string
  name: string
  displayId: string
}

interface NotAssignedRow extends RowUser {
  roleLabel: string
}

type GridRowData = (RowUser & { id: string }) | (NotAssignedRow & { id: string })

function emptySelection(): GridRowSelectionModel {
  return { type: 'include', ids: new Set() }
}

function selectionSize(model: GridRowSelectionModel): number {
  return model.type === 'include' ? model.ids.size : 0
}

function buildNotAssignedCatalog(assignedSetLower: Set<string>): NotAssignedRow[] {
  const base = NOT_ASSIGNED_SAMPLE.filter((n) => !assignedSetLower.has(n.toLowerCase().trim()))
  const extra: string[] = []
  let k = 0
  while (base.length + extra.length < 23) {
    extra.push(
      `${NOT_ASSIGNED_SAMPLE[k % NOT_ASSIGNED_SAMPLE.length]} (${extra.length + base.length + 1})`,
    )
    k++
  }
  const names = [...base, ...extra].slice(0, 23)
  return names.map((name, i) => ({
    key: rowKey('not', name, i),
    name,
    displayId: displayUserId(name, i),
    roleLabel: USER_MANAGEMENT_ROLE_NAMES[i % USER_MANAGEMENT_ROLE_NAMES.length],
  }))
}

interface ManageUsersDrawerProps {
  open: boolean
  onClose: (event?: SyntheticEvent) => void
  /** Shown in header capsule — uppercase. */
  roleNameUppercase: string
  /** Proper-case role title for snackbars & removed-user role chip (e.g. "Admin"). */
  roleDisplayName: string
  assignedNames: string[]
  /** Persists assignments; may return a Promise — drawer awaits before closing. */
  onSave?: (assignedUserNames: string[]) => void | Promise<void>
}

const HEADER_BG = '#f1f1f1'

/** Figma drawer width (node 18:6117). */
const DRAWER_WIDTH_PX = 726

const ROW_TRANSITION_MS = 380

function snackbarSlideUp(props: SlideProps) {
  return <Slide {...props} direction="up" />
}

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
  /** Row exit when assigning/removing — slide + fade via getRowClassName. */
  '@keyframes drawerRowExitToAssigned': {
    from: { opacity: 1, transform: 'translateX(0) scale(1)' },
    to: { opacity: 0, transform: 'translateX(-42px)', filter: 'blur(1px)' },
  },
  '@keyframes drawerRowExitToUnassigned': {
    from: { opacity: 1, transform: 'translateX(0) scale(1)' },
    to: { opacity: 0, transform: 'translateX(42px)', filter: 'blur(1px)' },
  },
  '& .MuiDataGrid-row.manage-users-drawer-row-exit-to-assigned': {
    animation: 'drawerRowExitToAssigned 380ms cubic-bezier(0.4, 0, 0.2, 1) forwards',
    pointerEvents: 'none',
    willChange: 'transform, opacity, filter',
  },
  '& .MuiDataGrid-row.manage-users-drawer-row-exit-to-unassigned': {
    animation: 'drawerRowExitToUnassigned 380ms cubic-bezier(0.4, 0, 0.2, 1) forwards',
    pointerEvents: 'none',
    willChange: 'transform, opacity, filter',
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

export function ManageUsersDrawer({
  open,
  onClose,
  roleNameUppercase,
  roleDisplayName,
  assignedNames,
  onSave,
}: ManageUsersDrawerProps) {
  const [tab, setTab] = useState(0)
  const [search, setSearch] = useState('')
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 })
  const [selectionModel, setSelectionModel] = useState<GridRowSelectionModel>(() =>
    emptySelection(),
  )

  /** Working copy shown in Assigned Users (draft until Save). */
  const [draftAssigned, setDraftAssigned] = useState<string[]>([])
  /** Pool for Not assigned tab (initial pool + rows returned via Remove). */
  const [notAssignedCatalog, setNotAssignedCatalog] = useState<NotAssignedRow[]>([])
  const baselineAssignedRef = useRef<string[]>([])

  const [snackbarOpen, setSnackbarOpen] = useState(false)
  const [snackbarMessage, setSnackbarMessage] = useState('')

  /** Row ids undergoing exit animation (assign → left dissolve; remove → right dissolve). */
  const [rowExit, setRowExit] = useState<{
    ids: Set<string>
    kind: 'assign' | 'remove'
  } | null>(null)

  const [toolbarRoleFilter, setToolbarRoleFilter] = useState<FilterRecords>({
    mu_drawer_role: 'all',
  })

  const draftAssignedLower = useMemo(
    () => new Set(draftAssigned.map((n) => n.toLowerCase().trim())),
    [draftAssigned],
  )

  useEffect(() => {
    if (!open) return
    baselineAssignedRef.current = [...assignedNames]
    setDraftAssigned([...assignedNames])
    const lower = new Set(assignedNames.map((n) => n.toLowerCase().trim()))
    setNotAssignedCatalog(buildNotAssignedCatalog(lower))
    setToolbarRoleFilter({ mu_drawer_role: 'all' })
    setSearch('')
    setPaginationModel((p) => ({ ...p, page: 0 }))
    setTab(0)
    setSelectionModel(emptySelection())
    setRowExit(null)
  }, [open, assignedNames])

  const notAssignedToolbarFilters = useMemo((): ToolbarFilterConfig[] => {
    return [
      {
        id: 'mu_drawer_role',
        type: 'select',
        label: 'Role',
        iconName: 'user',
        options: [
          { value: 'all', label: 'All roles' },
          ...USER_MANAGEMENT_ROLE_NAMES.map((r) => ({ value: r, label: r })),
        ],
        initialValue: 'all',
      },
    ]
  }, [])

  const handleToolbarFiltersChange = useCallback((f: FilterRecords) => {
    setToolbarRoleFilter(f)
    setPaginationModel((p) => ({ ...p, page: 0 }))
  }, [])

  useEffect(() => {
    setPaginationModel((p) => ({ ...p, page: 0 }))
  }, [search, tab])

  useEffect(() => {
    setRowExit(null)
  }, [tab])

  const assignedModels: GridRowData[] = useMemo(
    () =>
      draftAssigned.map((name, i) => ({
        key: rowKey('assigned', name, i),
        id: rowKey('assigned', name, i),
        name,
        displayId: displayUserId(name, i),
      })),
    [draftAssigned],
  )

  const filteredAssigned = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return assignedModels
    return assignedModels.filter((r) => r.name.toLowerCase().includes(q))
  }, [assignedModels, search])

  const filteredNotAssigned = useMemo(() => {
    let list = notAssignedCatalog
    const q = search.trim().toLowerCase()
    if (q) list = list.filter((r) => r.name.toLowerCase().includes(q))
    const fr = toolbarRoleFilter.mu_drawer_role
    if (fr && fr !== 'all' && typeof fr === 'string') {
      list = list.filter((r) => r.roleLabel === fr)
    }
    return list
  }, [notAssignedCatalog, search, toolbarRoleFilter])

  const rows: GridRowData[] = useMemo(
    () =>
      tab === 0 ? filteredAssigned : filteredNotAssigned.map((r) => ({ ...r, id: r.key })),
    [tab, filteredAssigned, filteredNotAssigned],
  )

  const selectedOnNotAssigned = tab === 1 ? selectionSize(selectionModel) : 0
  const selectedOnAssigned = tab === 0 ? selectionSize(selectionModel) : 0

  const changeStats = useMemo(() => {
    const base = baselineAssignedRef.current
    const baselineNormalized = new Set(base.map((n) => n.toLowerCase().trim()))
    const addedNames = draftAssigned.filter((n) => !baselineNormalized.has(n.toLowerCase().trim()))
      .length
    const removedCount = base.filter((n) => !draftAssignedLower.has(n.toLowerCase().trim())).length
    const totalChanges = addedNames + removedCount
    const tooltipParts: string[] = []
    if (addedNames > 0) tooltipParts.push(`${addedNames} user${addedNames === 1 ? '' : 's'} assigned`)
    if (removedCount > 0)
      tooltipParts.push(`${removedCount} user${removedCount === 1 ? '' : 's'} removed`)
    return {
      totalChanges,
      addedNames,
      removedCount,
      tooltipDetail: tooltipParts.join('; '),
    }
  }, [draftAssigned, draftAssignedLower])

  const assignedCount = draftAssigned.length
  const notAssignedCount = useMemo(() => notAssignedCatalog.length, [notAssignedCatalog])

  const searchTrim = search.trim()
  const hasNotAssignedToolbarRoleFilter =
    Boolean(toolbarRoleFilter.mu_drawer_role) && toolbarRoleFilter.mu_drawer_role !== 'all'

  /** Illustration + CTA only when Assigned tab is empty and the user is not searching. */
  const showAssignedFullHero = tab === 0 && draftAssigned.length === 0 && !searchTrim

  const drawerListEmptyMessaging = useMemo((): { title: string; description: string } | null => {
    if (showAssignedFullHero || rows.length > 0) return null
    if (tab === 0) {
      if (draftAssigned.length === 0 && searchTrim) {
        return {
          title: 'No users assigned',
          description: `Nothing matches ${rbacQuotedSearch(search) || 'that search'}. Clear the search or open the Not assigned tab to add users.`,
        }
      }
      if (draftAssigned.length > 0 && filteredAssigned.length === 0) {
        const quoted = rbacQuotedSearch(search)
        if (searchTrim) {
          return {
            title: `No results for ${quoted || 'your search'}`,
            description: 'Try different keywords or clear the search.',
          }
        }
        return {
          title: 'No matching users',
          description: 'Clear the search to see all assigned users.',
        }
      }
      return null
    }
    if (notAssignedCatalog.length === 0) {
      return {
        title: 'No users to assign',
        description: 'There are no users in the unassigned pool for this session.',
      }
    }
    return {
      title: 'No matching users',
      description: hasNotAssignedToolbarRoleFilter
        ? 'Try adjusting your search or set the Role filter to All roles.'
        : `Nothing matches ${rbacQuotedSearch(search) || 'that search'}. Try different keywords or clear the search.`,
    }
  }, [
    showAssignedFullHero,
    rows.length,
    tab,
    draftAssigned.length,
    filteredAssigned.length,
    search,
    searchTrim,
    notAssignedCatalog.length,
    hasNotAssignedToolbarRoleFilter,
  ])

  /** Vertically anchor hero + textual empty states between tabs and footer. */
  const stretchManageUsersMainColumn = Boolean(showAssignedFullHero || drawerListEmptyMessaging)

  const notifyAssignBulk = useCallback((count: number) => {
    setSnackbarMessage(`${count} user${count === 1 ? '' : 's'} assigned to the role`)
    setSnackbarOpen(true)
  }, [])

  const notifyAssignOne = useCallback((displayName: string) => {
    setSnackbarMessage(`Assigned ${displayName} to this role`)
    setSnackbarOpen(true)
  }, [])

  const notifyRemoveOne = useCallback((displayName: string) => {
    setSnackbarMessage(`Removed ${displayName} from this role`)
    setSnackbarOpen(true)
  }, [])

  const applyAssignMutation = useCallback(
    (keySet: Set<string>, rowsMoved: NotAssignedRow[]) => {
      if (rowsMoved.length === 0) return
      setDraftAssigned((prev) => {
        const next = [...prev]
        const seen = new Set(next.map((n) => n.toLowerCase().trim()))
        for (const n of rowsMoved.map((r) => r.name)) {
          const l = n.toLowerCase().trim()
          if (!seen.has(l)) {
            seen.add(l)
            next.push(n)
          }
        }
        return next
      })
      setNotAssignedCatalog((prev) => prev.filter((r) => !keySet.has(r.key)))
      setSelectionModel(emptySelection())
      setPaginationModel((p) => ({ ...p, page: 0 }))
      rowsMoved.length === 1
        ? notifyAssignOne(rowsMoved[0].name)
        : notifyAssignBulk(rowsMoved.length)
    },
    [notifyAssignBulk, notifyAssignOne],
  )

  const beginAssignTransition = useCallback(
    (keySet: Set<string>) => {
      if (keySet.size === 0) return
      const rowsMoved = notAssignedCatalog.filter((r) => keySet.has(r.key))
      if (rowsMoved.length === 0) return
      const idSet = new Set([...keySet].map(String))
      setRowExit({ ids: idSet, kind: 'assign' })
      window.setTimeout(() => {
        applyAssignMutation(idSet, rowsMoved)
        setRowExit(null)
      }, ROW_TRANSITION_MS)
    },
    [notAssignedCatalog, applyAssignMutation],
  )

  const handleAssignKeys = useCallback(
    (keys: Iterable<string>) => {
      beginAssignTransition(new Set([...keys].map(String)))
    },
    [beginAssignTransition],
  )

  const handleBulkDiscardSelection = useCallback(() => {
    setSelectionModel(emptySelection())
  }, [])

  const beginBulkRemoveTransition = useCallback(
    (idSet: Set<string>, namesFromRows: string[]) => {
      if (namesFromRows.length === 0) return
      setRowExit({ ids: idSet, kind: 'remove' })
      window.setTimeout(() => {
        const bulkLower = new Set(namesFromRows.map((n) => n.toLowerCase().trim()))
        setDraftAssigned((prev) => prev.filter((n) => !bulkLower.has(n.toLowerCase().trim())))
        setNotAssignedCatalog((prev) => [
          ...prev,
          ...namesFromRows.map((name, idx) => ({
            key: `returned:${name}:${Date.now()}:${idx}`,
            name,
            displayId: displayUserId(name, prev.length + idx + 3),
            roleLabel: roleDisplayName,
          })),
        ])
        setSelectionModel(emptySelection())
        setPaginationModel((p) => ({ ...p, page: 0 }))
        setRowExit(null)
        const n = namesFromRows.length
        setSnackbarMessage(`${n} user${n === 1 ? '' : 's'} removed from the role`)
        setSnackbarOpen(true)
      }, ROW_TRANSITION_MS)
    },
    [roleDisplayName],
  )

  const confirmBulkRemoveFromRole = useCallback(() => {
    if (tab !== 0 || selectionModel.type !== 'include') return
    const ids = new Set([...selectionModel.ids].map(String))
    if (ids.size === 0) return
    const rowsHit = filteredAssigned.filter((r) => ids.has(r.id))
    beginBulkRemoveTransition(new Set(rowsHit.map((r) => r.id)), rowsHit.map((r) => r.name))
  }, [tab, selectionModel, filteredAssigned, beginBulkRemoveTransition])

  const confirmBulkAssignToRole = useCallback(() => {
    if (tab !== 1 || selectionModel.type !== 'include') return
    beginAssignTransition(new Set([...selectionModel.ids].map(String)))
  }, [tab, selectionModel, beginAssignTransition])

  const handleRemoveFromAssigned = useCallback(
    (name: string) => {
      const idx = draftAssigned.indexOf(name)
      if (idx < 0) return
      const rowId = rowKey('assigned', name, idx)
      setRowExit({ ids: new Set([rowId]), kind: 'remove' })
      window.setTimeout(() => {
        setDraftAssigned((prev) => prev.filter((n) => n !== name))
        setNotAssignedCatalog((prev) => [
          ...prev,
          {
            key: `returned:${name}:${Date.now()}`,
            name,
            displayId: displayUserId(name, prev.length + 3),
            roleLabel: roleDisplayName,
          },
        ])
        setPaginationModel((p) => ({ ...p, page: 0 }))
        setRowExit(null)
        notifyRemoveOne(name)
      }, ROW_TRANSITION_MS)
    },
    [draftAssigned, roleDisplayName, notifyRemoveOne],
  )

  const handleDrawerClose = useCallback(
    (e?: SyntheticEvent) => {
      onClose(e)
      setSelectionModel(emptySelection())
      setSearch('')
      setPaginationModel((p) => ({ ...p, page: 0 }))
      setTab(0)
      setSnackbarOpen(false)
    },
    [onClose],
  )

  const handleSave = useCallback(async () => {
    try {
      await Promise.resolve(onSave?.(draftAssigned))
      setSelectionModel(emptySelection())
      setSearch('')
      setPaginationModel((p) => ({ ...p, page: 0 }))
      setTab(0)
      onClose()
    } catch {
      /** Parent surfaces error; drawer stays open for retry. */
    }
  }, [draftAssigned, onSave, onClose])

  const handleTabChange = useCallback((_e: SyntheticEvent, v: number) => {
    setTab(v)
    setPaginationModel((p) => ({ ...p, page: 0 }))
    setSelectionModel(emptySelection())
  }, [])

  const switchToNotAssignedTab = useCallback(() => {
    handleTabChange({} as SyntheticEvent, 1)
  }, [handleTabChange])

  const columns: GridColDef<GridRowData>[] = useMemo(() => {
    const nameCol: GridColDef<GridRowData> = {
      field: 'name',
      headerName: 'User Name',
      flex: 1.2,
      minWidth: 200,
      sortable: true,
      renderHeader: headerWithTitleAndKebab('User Name', 'User name column options'),
      renderCell: (params: GridRenderCellParams<GridRowData>) => {
        const raw = stringToColor(params.row.name)
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
              {getInitials(params.row.name)}
            </Avatar>
            <Typography variant="body2" noWrap>
              {params.row.name}
            </Typography>
          </Stack>
        )
      },
    }

    const idCol: GridColDef<GridRowData> = {
      field: 'displayId',
      headerName: 'User ID',
      width: 120,
      sortable: true,
      align: 'right',
      headerAlign: 'right',
      renderHeader: headerWithTitleAndKebab('User ID', 'User ID column options'),
      renderCell: (params) => (
        <Typography variant="body2" color="text.secondary" sx={{ width: '100%', textAlign: 'right' }}>
          {params.value}
        </Typography>
      ),
    }

    const roleCol: GridColDef<GridRowData> = {
      field: 'roleLabel',
      headerName: 'Role',
      flex: 0.8,
      minWidth: 140,
      sortable: true,
      renderHeader: headerWithTitleAndKebab('Role', 'Role column options'),
      renderCell: (params: GridRenderCellParams<GridRowData>) => {
        const label = 'roleLabel' in params.row ? params.row.roleLabel : undefined
        if (!label) return null
        return (
          <Chip size="small" label={label} variant="tonal" color="default" sx={{ maxWidth: '100%' }} />
        )
      },
    }

    const actionsCol: GridColDef<GridRowData> = {
      field: '_actions',
      headerName: ' ',
      width: 112,
      sortable: false,
      align: 'right',
      headerAlign: 'right',
      disableColumnMenu: true,
      renderCell: (params: GridRenderCellParams<GridRowData>) => (
        <Button
          variant="outlined"
          color="primary"
          size="small"
          sx={{ textTransform: 'none', fontWeight: 500 }}
          onClick={(e: ReactMouseEvent) => {
            e.stopPropagation()
            if (tab === 0) {
              handleRemoveFromAssigned(params.row.name)
            } else {
              const row = params.row as NotAssignedRow & { id: string }
              handleAssignKeys([row.key])
            }
          }}
        >
          {tab === 0 ? 'Remove' : 'Assign'}
        </Button>
      ),
    }

    if (tab === 0) {
      return [nameCol, idCol, actionsCol]
    }
    return [nameCol, idCol, roleCol, actionsCol]
  }, [tab, handleRemoveFromAssigned, handleAssignKeys])

  return (
    <>
      <Drawer
        anchor="right"
        open={open}
        onClose={(e?: SyntheticEvent) => handleDrawerClose(e)}
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
              <Typography
                variant="body3"
                color="text.secondary"
                sx={{
                  letterSpacing: 0.28,
                  textTransform: 'uppercase',
                  fontWeight: 600,
                }}
                component="p"
              >
                Role: {roleNameUppercase}
              </Typography>
              <Typography variant="title3" component="h2" sx={{ fontWeight: 700, lineHeight: 1.25 }}>
                Users
              </Typography>
            </Stack>
            <IconButton
              size="small"
              variant="outlined"
              aria-label="Close"
              onClick={(e: ReactMouseEvent) => handleDrawerClose(e)}
            >
              <Icon name="x" size="sm" />
            </IconButton>
          </Box>
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
                sx={{ cursor: 'default', maxWidth: 180, whiteSpace: 'nowrap' }}
                noWrap
              >
                {changeStats.totalChanges === 0
                  ? 'No changes'
                  : `${changeStats.totalChanges} change${changeStats.totalChanges === 1 ? '' : 's'} made`}
              </Typography>
            </Tooltip>
            <Button variant="outlined" color="neutral" size="medium" onClick={(e: ReactMouseEvent) => handleDrawerClose(e)}>
              Cancel
            </Button>
            <Button variant="contained" color="primary" size="medium" onClick={handleSave}>
              Save
            </Button>
          </Fragment>
        }
      >
        <Stack
          spacing={2}
          sx={(theme: Theme) => ({
            display: 'flex',
            flexDirection: 'column',
            ...(stretchManageUsersMainColumn && {
              minHeight: `calc(100dvh - ${theme.spacing(DRAWER_EMPTY_HERO_VERTICAL_OFFSET_THEME_UNITS)})`,
              minWidth: 0,
            }),
          })}
        >
          <Box sx={{ mx: -2, mt: -1, flexShrink: 0 }}>
            <Tabs
              value={tab}
              onChange={handleTabChange}
              aria-label="User assignment tabs"
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
              <Tab label={`Assigned Users (${assignedCount})`} id="tab-assigned-users" />
              <Tab label={`Not assigned (${notAssignedCount})`} id="tab-not-assigned-users" />
            </Tabs>
          </Box>

          {!showAssignedFullHero && (
          <Box
            sx={{
              bgcolor: 'surface.elevation1',
              mx: -2,
              px: 2,
              py: (theme: Theme) => theme.spacing(1.5),
              flexShrink: 0,
            }}
          >
            <EnhancedTextField
              showLabel={false}
              placeholder="Search by User name"
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
          )}

          <BulkDrawerSelectionToolbar
            visible={
              (tab === 1 && selectedOnNotAssigned > 0) || (tab === 0 && selectedOnAssigned > 0)
            }
            kind={tab === 1 ? 'assign' : 'remove'}
            selectedCount={tab === 1 ? selectedOnNotAssigned : selectedOnAssigned}
            nounSingular="user"
            nounPlural="users"
            onConfirm={tab === 1 ? confirmBulkAssignToRole : confirmBulkRemoveFromRole}
            onDiscard={handleBulkDiscardSelection}
          />

          <Box
            sx={{
              mx: -2,
              flex: 1,
              minHeight: stretchManageUsersMainColumn ? 0 : 360,
              minWidth: 0,
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              ...(stretchManageUsersMainColumn
                ? {
                    justifyContent: 'center',
                    alignItems: 'center',
                  }
                : {
                    '& > div': {
                      width: '100%',
                      minWidth: 0,
                      flex: 1,
                      minHeight: 0,
                      display: 'flex',
                      flexDirection: 'column',
                    },
                    '& .MuiDataGrid-root': { border: 'none' },
                  }),
            }}
          >
            {showAssignedFullHero ? (
              <Stack
                alignItems="center"
                spacing={2}
                sx={{
                  width: '100%',
                  maxWidth: 420,
                  px: 3,
                  py: 5,
                  mx: 'auto',
                  boxSizing: 'border-box',
                  textAlign: 'center',
                }}
              >
                <Box
                  component="img"
                  src={emptyAssignedHero}
                  alt=""
                  sx={{ width: '100%', maxWidth: 358, height: 'auto', display: 'block' }}
                />
                <Typography variant="title3" component="p" sx={{ fontWeight: 700, lineHeight: 1.4 }}>
                  Assign your team members to this role
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.43 }}>
                  You haven&apos;t assigned anyone yet. Start by adding users to get things rolling.
                </Typography>
                <Button
                  variant="outlined"
                  color="neutral"
                  size="medium"
                  startIconProps={{ name: 'plus', size: 'sm' }}
                  sx={{ textTransform: 'none', fontWeight: 600, mt: 0.5 }}
                  onClick={switchToNotAssignedTab}
                >
                  Assign Users
                </Button>
              </Stack>
            ) : drawerListEmptyMessaging ? (
              <RbacListEmptyPlaceholder roomy {...drawerListEmptyMessaging} />
            ) : (
            <DataGrid
              key={`manage-users-grid-${tab}`}
              showToolbar
              listView={false}
              sortingMode="client"
              customToolbarFilters={
                tab === 1 && selectedOnNotAssigned === 0 ? notAssignedToolbarFilters : []
              }
              onToolbarFiltersChange={handleToolbarFiltersChange}
              showAppliedFilters={tab === 1 && selectedOnNotAssigned === 0}
              maxVisibleAppliedFilters={4}
              onRefresh={() => setPaginationModel((p) => ({ ...p, page: 0 }))}
              density="standard"
              rows={rows}
              columns={columns}
              pagination
              paginationMode="client"
              paginationModel={paginationModel}
              onPaginationModelChange={setPaginationModel}
              pageSizeOptions={[5, 10, 25]}
              checkboxSelection
              rowSelectionModel={selectionModel}
              onRowSelectionModelChange={setSelectionModel}
              getRowClassName={(params: { id: string | number }): string => {
                const id = String(params.id)
                if (!rowExit?.ids.has(id)) return ''
                return rowExit.kind === 'assign'
                  ? 'manage-users-drawer-row-exit-to-assigned'
                  : 'manage-users-drawer-row-exit-to-unassigned'
              }}
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
        autoHideDuration={5500}
        TransitionComponent={snackbarSlideUp}
        onClose={() => setSnackbarOpen(false)}
        message={snackbarMessage}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      />
    </>
  )
}
