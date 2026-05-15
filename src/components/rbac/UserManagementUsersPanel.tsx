/**
 * User Management » Users — IAM Design (Figma node 2241-49729).
 * Columns: User Name | User ID | Role | Status | Tenants | Products | MFA | Last Active | Actions
 */
import { useCallback, useEffect, useMemo, useRef, useState, type ChangeEvent, type SyntheticEvent } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import type { GridRenderCellParams, GridRowParams } from '@mui/x-data-grid-pro'
import Alert from '@mui/material/Alert'
import ClickAwayListener from '@mui/material/ClickAwayListener'

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
  Autocomplete,
  DataGrid,
  Drawer,
  EnhancedTextField,
  Switch,
  Icon,
  IconButton,
  Link,
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
import type { UserManagementDirectoryRow, UserStatus } from '../../data/userManagementUsers'
import type { FilterRecords } from '../../types/filterRecords'

// ─── Mock augmentation (IAM fields not in backend yet) ───────────────────────

const MOCK_ROWS: Array<{
  status: UserStatus
  tenants: string[]
  products: string[]
  mfa: boolean
  lastActive: string
}> = [
  { status: 'Invited',  tenants: ['Acme Corp', 'Techsmart Inc', 'Global Services'], products: ['ECC', 'Exolite', 'CQA'],          mfa: true,  lastActive: '2 min ago'   },
  { status: 'Inactive', tenants: ['Acme Corp', 'Techsmart Inc'],                    products: ['ECC', 'Exolite'],                  mfa: false, lastActive: 'Never'        },
  { status: 'Active',   tenants: ['Acme Corp'],                                     products: ['CQA'],                             mfa: true,  lastActive: '1 day ago'   },
  { status: 'Active',   tenants: ['Techsmart Inc'],                                 products: ['ECC'],                             mfa: true,  lastActive: '1 hour ago'  },
  { status: 'Active',   tenants: ['Global Services'],                               products: ['Exolite'],                         mfa: true,  lastActive: '5 hour ago'  },
  { status: 'Inactive', tenants: ['Acme Corp', 'Digital Solutions'],                products: ['ECC', 'CQA', 'Chatbot'],           mfa: false, lastActive: '10 min ago'  },
  { status: 'Inactive', tenants: ['Acme Corp', 'Techsmart Inc', 'Global Services', 'Digital Solutions'], products: ['ECC', 'Exolite', 'CQA', 'Chatbot'], mfa: false, lastActive: 'Never' },
  { status: 'Active',   tenants: ['Techsmart Inc', 'Digital Solutions'],            products: ['ECC', 'Chatbot'],                  mfa: true,  lastActive: '12 min ago'  },
]

function augmentRow(row: UserManagementDirectoryRow, idx: number): UserManagementDirectoryRow {
  const m = MOCK_ROWS[idx % MOCK_ROWS.length]
  return { ...row, ...m }
}

// ─── Static demo users (shown when backend returns empty) ─────────────────────

const DEMO_USERS: UserManagementDirectoryRow[] = [
  { id: 'u1', displayName: 'Aditya Pratap Singh',   email: 'aditya.singh@exotel.com',        source: 'directory', branch: null, assignedRoleId: 'role-1', assignedRoleName: 'Admin',      channel: 'voice', capacity: 80, campaigns: null, groups: [] },
  { id: 'u2', displayName: 'Rudrakshula Prasanth',  email: 'rudrakshula.prasanth@exotel.com', source: 'directory', branch: null, assignedRoleId: 'role-1', assignedRoleName: 'Admin',      channel: 'voice', capacity: 60, campaigns: null, groups: [] },
  { id: 'u3', displayName: 'Rashika Jain',          email: 'rashika.jain@exotel.com',         source: 'directory', branch: null, assignedRoleId: 'role-2', assignedRoleName: 'Supervisor', channel: 'chat',  capacity: 70, campaigns: null, groups: [] },
  { id: 'u4', displayName: 'Anjali Srivastava',     email: 'anjali.srivastava@exotel.com',    source: 'directory', branch: null, assignedRoleId: 'role-3', assignedRoleName: 'Executive',  channel: 'voice', capacity: 90, campaigns: null, groups: [] },
  { id: 'u5', displayName: 'Aditya Pratap Singh',   email: 'aditya.singh@exotel.com',         source: 'directory', branch: null, assignedRoleId: 'role-3', assignedRoleName: 'Executive',  channel: 'voice', capacity: 55, campaigns: null, groups: [] },
  { id: 'u6', displayName: 'Rudrakshula Prasanth',  email: 'rudrakshula.prasanth@exotel.com', source: 'directory', branch: null, assignedRoleId: 'role-3', assignedRoleName: 'Executive',  channel: 'chat',  capacity: 40, campaigns: null, groups: [] },
  { id: 'u7', displayName: 'Rashika Jain',          email: 'rashika.jain@exotel.com',         source: 'directory', branch: null, assignedRoleId: 'role-3', assignedRoleName: 'Executive',  channel: 'voice', capacity: 30, campaigns: null, groups: [] },
  { id: 'u8', displayName: 'Anjali Srivastava',     email: 'anjali.srivastava@exotel.com',    source: 'directory', branch: null, assignedRoleId: 'role-3', assignedRoleName: 'Executive',  channel: 'chat',  capacity: 75, campaigns: null, groups: [] },
  { id: 'u9', displayName: 'Priya Nambiar',         email: 'priya.nambiar@exotel.com',        source: 'directory', branch: null, assignedRoleId: 'role-2', assignedRoleName: 'Supervisor', channel: 'voice', capacity: 65, campaigns: null, groups: [] },
  { id: 'u10', displayName: 'Rajesh Kumar',         email: 'rajesh.kumar@exotel.com',         source: 'directory', branch: null, assignedRoleId: 'role-3', assignedRoleName: 'Executive',  channel: 'chat',  capacity: 50, campaigns: null, groups: [] },
  { id: 'u11', displayName: 'Meera Pillai',         email: 'meera.pillai@exotel.com',         source: 'directory', branch: null, assignedRoleId: 'role-3', assignedRoleName: 'Executive',  channel: 'voice', capacity: 85, campaigns: null, groups: [] },
  { id: 'u12', displayName: 'Kiran Reddy',          email: 'kiran.reddy@exotel.com',          source: 'directory', branch: null, assignedRoleId: 'role-3', assignedRoleName: 'Executive',  channel: 'chat',  capacity: 45, campaigns: null, groups: [] },
  { id: 'u13', displayName: 'Sunita Sharma',        email: 'sunita.sharma@exotel.com',        source: 'directory', branch: null, assignedRoleId: 'role-2', assignedRoleName: 'Supervisor', channel: 'voice', capacity: 70, campaigns: null, groups: [] },
]

// ─── Product chip colors ──────────────────────────────────────────────────────

type ChipColor = 'info' | 'primary' | 'success' | 'secondary' | 'default' | 'warning'

const PRODUCT_COLOR: Record<string, ChipColor> = {
  ECC:     'info',
  Exolite: 'primary',
  CQA:     'success',
  Chatbot: 'secondary',
}

// ─── Status chip colors ───────────────────────────────────────────────────────

const STATUS_COLOR: Record<UserStatus, ChipColor> = {
  Active:   'success',
  Inactive: 'default',
  Invited:  'warning',
}

// ─── Search columns ───────────────────────────────────────────────────────────

type SearchCol = 'displayName' | 'id' | 'assignedRoleName' | 'all'

const SEARCH_OPTIONS: { value: SearchCol; label: string }[] = [
  { value: 'displayName',      label: 'User Name' },
  { value: 'id',               label: 'User ID'   },
  { value: 'assignedRoleName', label: 'Role'      },
  { value: 'all',              label: 'All'        },
]

// ─── Filter helpers ───────────────────────────────────────────────────────────

const APP_PRODUCTS = ['ECC', 'Exolite', 'Voicebot', 'Chatbot', 'CQA', 'Engage']

const INVITE_ROLES = [
  { name: 'Admin',   description: 'Full administrative access' },
  { name: 'Manager', description: 'Manage team members and resources' },
  { name: 'Member',  description: 'Standard user access' },
  { name: 'Auditor', description: 'Read-only access for compliance' },
]

const TENANT_OPTIONS = ['Acme Corp', 'Techsmart Inc', 'Global Services', 'Digital Solutions']

const DRAWER_WIDTH = 480  // form drawers; backdrop/shadow/header match ManageUsersDrawer exactly

/** Shared slotProps — matches ManageUsersDrawer exactly */
const DRAWER_SLOT_PROPS = {
  backdrop: {
    sx: (theme: Theme) => ({
      backdropFilter: 'blur(1.50px)',
      WebkitBackdropFilter: 'blur(1.50px)',
      backgroundColor: theme.palette.mode === 'light' ? 'rgba(15, 23, 42, 0.18)' : 'rgba(0, 0, 0, 0.48)',
    }),
  },
  paper: {
    sx: {
      width: { xs: '100%', sm: `${DRAWER_WIDTH}px` },
      maxWidth: '100vw',
      boxSizing: 'border-box',
      boxShadow: '0px 6px 10px rgba(0, 0, 0, 0.14), 0px 1px 18px rgba(0, 0, 0, 0.12)',
    },
  },
} as const

/** Shared header — matches ManageUsersDrawer's headerContent exactly */
function DrawerHeader({ label, title, onClose }: { label: string; title: string; onClose: () => void }) {
  return (
    <Box
      sx={{
        display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
        px: 2, py: '13px',
        bgcolor: '#f1f1f1',
        borderBottom: 1, borderColor: 'divider',
      }}
    >
      <Stack spacing={0.25} sx={{ minWidth: 0, flex: 1 }}>
        <Typography
          variant="body3" color="text.secondary" component="p"
          sx={{ letterSpacing: 0.28, textTransform: 'uppercase', fontWeight: 600 }}
        >
          {label}
        </Typography>
        <Typography variant="title3" component="h2" sx={{ fontWeight: 700, lineHeight: 1.25 }}>
          {title}
        </Typography>
      </Stack>
      <IconButton size="small" variant="outlined" aria-label="Close" onClick={onClose}>
        <Icon name="x" size="sm" />
      </IconButton>
    </Box>
  )
}

const USER_FILTERS_INITIAL: FilterRecords = {
  uu_role: 'all', uu_product: 'all', uu_tenant: 'all', uu_status: 'all',
}

function buildToolbarFilters(rows: UserManagementDirectoryRow[]): ToolbarFilterConfig[] {
  const roles = [...new Set(rows.map((r) => r.assignedRoleName).filter(Boolean) as string[])].sort()

  // Collect all unique tenants from augmented mock data
  const allTenants = [...new Set(
    MOCK_ROWS.flatMap((m) => m.tenants)
  )].sort()

  return [
    {
      id: 'uu_role', type: 'select', label: 'Role',
      options: [{ value: 'all', label: 'All' }, ...roles.map((r) => ({ value: r, label: r }))],
      initialValue: 'all',
    },
    {
      id: 'uu_product', type: 'select', label: 'App Products',
      options: [{ value: 'all', label: 'All Products' }, ...APP_PRODUCTS.map((p) => ({ value: p, label: p }))],
      initialValue: 'all',
    },

    {
      id: 'uu_tenant', type: 'select', label: 'All Tenants',
      options: [{ value: 'all', label: 'All Tenants' }, ...allTenants.map((t) => ({ value: t, label: t }))],
      initialValue: 'all',
    },
    {
      id: 'uu_status', type: 'select', label: 'All Status',
      options: [
        { value: 'all',      label: 'All Status' },
        { value: 'Active',   label: 'Active'      },
        { value: 'Inactive', label: 'Inactive'    },
        { value: 'Invited',  label: 'Invited'     },
      ],
      initialValue: 'all',
    },
  ]
}

function matchesSearch(row: UserManagementDirectoryRow, q: string, col: SearchCol): boolean {
  if (!q) return true
  const lower = q.toLowerCase()
  if (col === 'displayName') return row.displayName.toLowerCase().includes(lower)
  if (col === 'id') return row.id.toLowerCase().includes(lower)
  if (col === 'assignedRoleName') return (row.assignedRoleName ?? '').toLowerCase().includes(lower)
  return [row.displayName, row.id, row.assignedRoleName ?? '', row.email ?? ''].join(' ').toLowerCase().includes(lower)
}

function applyFilters(rows: UserManagementDirectoryRow[], search: string, col: SearchCol, filters: FilterRecords): UserManagementDirectoryRow[] {
  // We filter against augmented rows so product/tenant/status filters actually work
  const augmented = rows.map(augmentRow)
  let next = augmented.filter((r) => matchesSearch(r, search, col))

  const role = filters.uu_role
  if (role && role !== 'all') next = next.filter((r) => r.assignedRoleName === role)

  const product = typeof filters.uu_product === 'string' ? filters.uu_product : 'all'
  if (product !== 'all') next = next.filter((r) => r.products?.includes(product))

  const tenant = typeof filters.uu_tenant === 'string' ? filters.uu_tenant : 'all'
  if (tenant !== 'all') next = next.filter((r) => r.tenants?.includes(tenant))

  const status = filters.uu_status
  if (status && status !== 'all') next = next.filter((r) => r.status === status)

  return next
}

// ─── DataGrid sx ─────────────────────────────────────────────────────────────

const dataGridSx = {
  border: 'none',
  '& .MuiDataGrid-cell': { display: 'flex', alignItems: 'center', overflow: 'hidden', minWidth: 0 },
  '& .MuiDataGrid-columnHeaderTitleContainer': { alignItems: 'center' },
} as const

// ─── Panel props ──────────────────────────────────────────────────────────────

export type UserManagementUsersPanelProps = {
  rows: UserManagementDirectoryRow[]
  loadError: string | null
  onRetryLoad: () => void | Promise<void>
}

// ─── Component ───────────────────────────────────────────────────────────────

export function UserManagementUsersPanel({ rows, loadError, onRetryLoad }: UserManagementUsersPanelProps) {
  const theme = useTheme()
  const navigate = useNavigate()
  const location = useLocation()
  const isAdmin = location.pathname.startsWith('/admin')
  const splitRef = useRef<HTMLDivElement | null>(null)

  // ── sessionStorage persistence — restore table state after navigating back from detail ──
  const SS_KEY = isAdmin ? 'admin-users-table-state' : 'rbac-users-table-state'
  const stored = (() => { try { const s = sessionStorage.getItem(SS_KEY); return s ? JSON.parse(s) : null } catch { return null } })()

  const [umSubTab, setUmSubTab] = useState<number>(stored?.umSubTab ?? 0)
  const [searchCol, setSearchCol] = useState<SearchCol>(stored?.searchCol ?? 'displayName')
  const [search, setSearch] = useState<string>(stored?.search ?? '')
  const [filterRecords, setFilterRecords] = useState<FilterRecords>(stored?.filterRecords ?? { ...USER_FILTERS_INITIAL })
  const [paginationModel, setPaginationModel] = useState<{ page: number; pageSize: number }>(stored?.paginationModel ?? { page: 0, pageSize: 10 })

  // Persist state changes so back-navigation can restore them
  useEffect(() => {
    try {
      sessionStorage.setItem(SS_KEY, JSON.stringify({ umSubTab, searchCol, search, filterRecords, paginationModel }))
    } catch { /* ignore */ }
  }, [SS_KEY, umSubTab, searchCol, search, filterRecords, paginationModel])
  const [menuAnchorEl, setMenuAnchorEl] = useState<HTMLElement | null>(null)
  const [menuRowId, setMenuRowId] = useState<string | null>(null)
  const [inviteOpen, setInviteOpen] = useState(false)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [bulkInviteOpen, setBulkInviteOpen] = useState(false)
  const [splitOpen, setSplitOpen] = useState(false)
  const [snack, setSnack] = useState<string | null>(null)
  const [inviteForm, setInviteForm] = useState({
    fullName: '', email: '',
    tenants: [] as string[],
    role: 'Member',
    enforceMfa: false,
    sendInvitation: true,
  })

  const toolbarFilters = useMemo(() => buildToolbarFilters(rows), [rows])

  // Use demo data when backend returns empty (prototype fallback)
  const sourceRows = rows.length > 0 ? rows : DEMO_USERS

  // applyFilters already augments internally so the result has all IAM fields
  const augmentedRows = useMemo(
    () => applyFilters(sourceRows, search, searchCol, filterRecords),
    [sourceRows, search, searchCol, filterRecords],
  )

  const handleTabChange = useCallback((_: SyntheticEvent, v: number) => {
    setUmSubTab(v)
    setPaginationModel((p) => ({ ...p, page: 0 }))
  }, [])

  const handleFiltersChange = useCallback((f: FilterRecords) => {
    setFilterRecords(f)
    setPaginationModel((p) => ({ ...p, page: 0 }))
  }, [])

  const handleMenuOpen = useCallback((e: React.MouseEvent<HTMLElement>, rowId: string) => {
    e.stopPropagation()
    setMenuAnchorEl(e.currentTarget)
    setMenuRowId(rowId)
  }, [])

  const handleMenuClose = useCallback(() => { setMenuAnchorEl(null); setMenuRowId(null) }, [])

  const menuRow = useMemo(() => menuRowId ? rows.find((r) => r.id === menuRowId) : undefined, [menuRowId, rows])

  const handleMenuAction = useCallback(async (action: 'view_role' | 'copy_email') => {
    const row = menuRow
    handleMenuClose()
    if (!row) return
      if (action === 'view_role') {
        if (row.assignedRoleId) {
          const base = isAdmin ? '/admin/roles' : '/closed-interaction/user-management/roles'
          navigate(`${base}/${row.assignedRoleId}`)
        } else setSnack('This user has no assigned role.')
      return
    }
    const em = row.email?.trim()
    if (!em) { setSnack('No email on file.'); return }
    try { await navigator.clipboard.writeText(em); setSnack('Email copied') }
    catch { setSnack('Could not copy email') }
  }, [menuRow, handleMenuClose, navigate])

  const handleRowClick = useCallback((params: GridRowParams<UserManagementDirectoryRow>, event: React.MouseEvent) => {
    const el = event.target as HTMLElement
    if (el.closest('.MuiCheckbox-root, button')) return
    const base = isAdmin ? '/admin/users' : '/closed-interaction/user-management/users'
    navigate(`${base}/${encodeURIComponent(params.row.id)}`)
  }, [navigate, isAdmin])

  const splitLine = alpha(theme.palette.primary.contrastText, 0.28)

  // ─── Columns ───────────────────────────────────────────────────────────────

  const columns: GridColDef<UserManagementDirectoryRow>[] = useMemo(() => [
    {
      field: 'displayName', headerName: 'User Name', flex: 1, minWidth: 180,
      renderCell: (params: GridRenderCellParams<UserManagementDirectoryRow>) => {
        const name = String(params.value ?? '')
        const raw = stringToColor(name)
        return (
          <Stack direction="row" alignItems="center" spacing={1} sx={{ minWidth: 0, width: '100%', overflow: 'hidden' }}>
            <Avatar sx={(t: Theme) => ({ width: 28, height: 28, flexShrink: 0, fontSize: t.typography.pxToRem(12), fontWeight: t.typography.fontWeightMedium, bgcolor: avatarFillFromHue(raw, t), color: t.palette.common.white })}>
              {getInitials(name)}
            </Avatar>
            <Typography variant="body2" noWrap sx={{ minWidth: 0, flex: 1, color: 'primary.main', fontWeight: 500, cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}>
              {name}
            </Typography>
          </Stack>
        )
      },
    },
    {
      field: 'id', headerName: 'User ID', flex: 0.9, minWidth: 160,
      renderCell: (params: GridRenderCellParams<UserManagementDirectoryRow>) => (
        <Typography variant="body2" noWrap sx={{ width: '100%', color: 'text.secondary', fontSize: 12 }}>
          {String(params.value ?? '')}
        </Typography>
      ),
    },
    {
      field: 'assignedRoleName', headerName: 'Role', width: 110,
      renderCell: (params: GridRenderCellParams<UserManagementDirectoryRow>) => (
        <Typography variant="body2" noWrap sx={{ width: '100%' }}>
          {params.value ? String(params.value) : '—'}
        </Typography>
      ),
    },
    {
      field: 'status', headerName: 'Status', width: 100,
      renderCell: (params: GridRenderCellParams<UserManagementDirectoryRow>) => {
        const status = (params.value as UserStatus) ?? 'Active'
        return <Chip size="small" label={status} color={STATUS_COLOR[status] ?? 'default'} variant="tonal" sx={{ fontWeight: 500 }} />
      },
    },
    {
      field: 'tenants', headerName: 'Tenants', flex: 1, minWidth: 160, sortable: false,
      renderCell: (params: GridRenderCellParams<UserManagementDirectoryRow>) => {
        const tenants = (params.value as string[]) ?? []
        const visible = tenants.slice(0, 2)
        const overflow = tenants.length - 2
        return (
          <Stack direction="row" alignItems="center" spacing={0.5} sx={{ minWidth: 0, width: '100%', overflow: 'hidden' }}>
            <Typography variant="body2" noWrap sx={{ flex: 1, minWidth: 0 }}>
              {visible.join(', ')}
            </Typography>
            {overflow > 0 && <Chip size="small" label={`+${overflow}`} variant="tonal" color="default" sx={{ flexShrink: 0 }} />}
          </Stack>
        )
      },
    },
    {
      field: 'products', headerName: 'Products', flex: 1, minWidth: 160, sortable: false,
      renderCell: (params: GridRenderCellParams<UserManagementDirectoryRow>) => {
        const products = (params.value as string[]) ?? []
        const visible = products.slice(0, 2)
        const overflow = products.length - 2
        return (
          <Stack direction="row" alignItems="center" spacing={0.5} sx={{ flexWrap: 'nowrap', overflow: 'hidden' }}>
            {visible.map((p) => (
              <Chip key={p} size="small" label={p} color={PRODUCT_COLOR[p] ?? 'default'} variant="tonal" sx={{ flexShrink: 0 }} />
            ))}
            {overflow > 0 && <Chip size="small" label={`+${overflow}`} variant="tonal" color="default" sx={{ flexShrink: 0 }} />}
          </Stack>
        )
      },
    },
    {
      field: 'mfa', headerName: 'MFA', width: 110,
      renderCell: (params: GridRenderCellParams<UserManagementDirectoryRow>) => {
        const enabled = params.value as boolean ?? false
        return (
          <Stack direction="row" alignItems="center" spacing={0.75}>
            <Box sx={{ width: 8, height: 8, borderRadius: '50%', flexShrink: 0, bgcolor: enabled ? 'success.main' : 'text.disabled' }} />
            <Typography variant="body2" sx={{ color: enabled ? 'success.main' : 'text.disabled' }}>
              {enabled ? 'Enabled' : 'Disabled'}
            </Typography>
          </Stack>
        )
      },
    },
    {
      field: 'lastActive', headerName: 'Last Active', width: 140,
      renderCell: (params: GridRenderCellParams<UserManagementDirectoryRow>) => (
        <Stack direction="row" alignItems="center" spacing={0.5}>
          <Box sx={{ color: 'text.secondary', display: 'flex', flexShrink: 0 }}><Icon name="clock" size="sm" /></Box>
          <Typography variant="body2" color="text.secondary" noWrap>{String(params.value ?? '')}</Typography>
        </Stack>
      ),
    },
    {
      field: 'actions', headerName: ' ', width: 56, sortable: false, filterable: false, disableColumnMenu: true,
      renderCell: (params: GridRenderCellParams<UserManagementDirectoryRow>) => (
        <IconButton size="small" aria-label="Row actions" variant="outlined" onClick={(e: React.MouseEvent<HTMLElement>) => handleMenuOpen(e, params.row.id)}>
          <Icon name="dots-three-vertical" size="sm" />
        </IconButton>
      ),
    },
  ], [handleMenuOpen])

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <Box sx={{ flex: '1 1 0%', width: '100%', minWidth: 0, minHeight: 0, boxSizing: 'border-box', display: 'flex', flexDirection: 'column', bgcolor: 'background.paper' }}>

      {/* Tab bar */}
      <Box sx={{ flexShrink: 0, borderBottom: 1, borderColor: 'divider', bgcolor: 'background.paper' }}>
          <Tabs value={umSubTab} onChange={handleTabChange} sx={{ px: 2, minHeight: 48, '& .MuiTab-root': { minHeight: 48, textTransform: 'none', fontWeight: 500, fontSize: (theme: Theme) => theme.typography.pxToRem(14) } }}>
          <Tab label="Users" />
          <Tab label="Upload History" />
        </Tabs>
      </Box>

      {umSubTab === 1 ? (
        <Box sx={{ flex: 1, minHeight: 0, px: 3, py: 4 }}>
          <Typography variant="title2" sx={{ fontWeight: 600, mb: 1 }}>Upload History</Typography>
          <Typography variant="body2" color="text.secondary">Bulk imports will appear here.</Typography>
        </Box>
      ) : (
        <Box sx={{ flex: 1, minHeight: 0, width: '100%', minWidth: 0, display: 'flex', flexDirection: 'column' }}>

          {/* Header: title + actions */}
          <Box sx={{ flexShrink: 0, bgcolor: 'surface.elevation1', px: 2, py: 1.5, display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
            <Box display="flex" flexDirection="column" gap={0.5} sx={{ flex: '1 1 200px' }}>
              <Typography variant="title3">Users</Typography>
              <Typography variant="body2" color="text.secondary">Manage users, roles, and access across your organization</Typography>
            </Box>

            <Stack direction="row" alignItems="center" flexWrap="wrap" gap={1.5} justifyContent="flex-end">
              {/* Search: column select + text */}
              <Box sx={{ display: 'flex', alignItems: 'stretch', border: '1px solid', borderColor: 'divider', borderRadius: 1, overflow: 'hidden', bgcolor: 'background.paper', minWidth: 280 }}>
                <TextField
                  select size="medium" value={searchCol}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => { setSearchCol(e.target.value as SearchCol); setPaginationModel((p) => ({ ...p, page: 0 })) }}
                  variant="outlined"
                  sx={{
                    flex: '0 0 auto', width: 118,
                    '& .MuiOutlinedInput-root': { borderRadius: 0, bgcolor: alpha(theme.palette.primary.main, 0.16), minHeight: 40, '& fieldset': { border: 'none' } },
                    '& .MuiSelect-select': { py: 1, pr: 3, pl: 1, typography: 'body2', display: 'flex', alignItems: 'center' },
                  }}
                >
                  {SEARCH_OPTIONS.map((o) => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
                </TextField>
                <EnhancedTextField
                  key={searchCol} showLabel={false} placeholder="Search" size="medium" fullWidth
                  onChange={(e: ChangeEvent<HTMLInputElement>) => { setSearch(e.target.value); setPaginationModel((p) => ({ ...p, page: 0 })) }}
                  sx={{ flex: '1 1 auto', minWidth: 0, '& .MuiOutlinedInput-root': { borderRadius: 0, minHeight: 40, '& fieldset': { border: 'none' } } }}
                  slotProps={{ input: { startAdornment: <Icon name="magnifying-glass" size="sm" /> } }}
                />
              </Box>

              {/* Export */}
              <Button variant="outlined" color="neutral" size="medium" disableElevation
                startIcon={<Icon name="export" size="sm" />}
                onClick={() => setSnack('Export not wired in prototype.')}
                sx={(t: Theme) => ({ textTransform: 'none', fontWeight: t.typography.fontWeightMedium, fontSize: t.typography.pxToRem(14), px: t.spacing(2), py: `${10}px`, minHeight: 40, borderRadius: t.spacing(1) })}
              >
                Export
              </Button>

              {/* Invite User split button */}
              <Box ref={splitRef} sx={(t: Theme) => ({ display: 'inline-flex', alignItems: 'stretch', flexShrink: 0, borderRadius: t.spacing(1), overflow: 'hidden', boxShadow: t.shadows[2], '& .MuiButton-root': { margin: 0, borderRadius: 0 }, '& .sm': { textTransform: 'none', fontWeight: t.typography.fontWeightMedium, fontSize: t.typography.pxToRem(14), px: t.spacing(2), py: `${10}px`, minHeight: 40, borderRight: `1px solid ${splitLine}` }, '& .sd': { minWidth: 44, px: `${10}px`, py: `${10}px`, minHeight: 40 } })}>
                <Button variant="contained" color="primary" size="medium" disableElevation className="sm"
                  sx={{ borderTopLeftRadius: (t: Theme) => t.spacing(1), borderBottomLeftRadius: (t: Theme) => t.spacing(1) }}
                  onClick={() => setInviteOpen(true)}>
                  Invite User
                </Button>
                <Button variant="contained" color="primary" size="medium" disableElevation className="sd"
                  aria-label="Invite options" aria-haspopup="true" aria-expanded={splitOpen ? 'true' : undefined}
                  sx={{ borderTopRightRadius: (t: Theme) => t.spacing(1), borderBottomRightRadius: (t: Theme) => t.spacing(1) }}
                  onClick={() => setSplitOpen((o) => !o)}>
                  <Icon name="caret-down" size="sm" aria-hidden />
                </Button>
              </Box>

              {/* Create User — opens full inline page */}
              <Button variant="contained" color="primary" size="medium" disableElevation
                startIcon={<Icon name="user-plus" size="sm" />}
                onClick={() => navigate(isAdmin ? '/admin/users/create' : '/admin/users/create')}
                sx={(t: Theme) => ({ textTransform: 'none', fontWeight: t.typography.fontWeightMedium, fontSize: t.typography.pxToRem(14), px: t.spacing(2), py: `${10}px`, minHeight: 40, borderRadius: t.spacing(1), boxShadow: t.shadows[2] })}
              >
                Create User
              </Button>
            </Stack>
          </Box>

          {/* Invite split dropdown */}
          <Popper open={splitOpen} anchorEl={splitRef.current} placement="bottom-end" sx={{ zIndex: (t: Theme) => t.zIndex.modal }}>
            <ClickAwayListener onClickAway={() => setSplitOpen(false)}>
              <Paper elevation={8} sx={{ mt: 0.5, minWidth: 180 }}>
                <MenuList dense autoFocusItem={splitOpen}>
                  <MenuItem onClick={() => { setSplitOpen(false); setInviteOpen(true) }}>Invite Single</MenuItem>
                  <MenuItem onClick={() => { setSplitOpen(false); setBulkInviteOpen(true) }}>Bulk Invite</MenuItem>
                </MenuList>
              </Paper>
            </ClickAwayListener>
          </Popper>

          {/* DataGrid with filters */}
          {loadError ? (
            <Box sx={{ px: 2, py: 1 }}>
              <Alert severity="error" action={<Button color="inherit" size="small" onClick={() => void onRetryLoad()}>Retry</Button>}>{loadError}</Alert>
            </Box>
          ) : null}

          <Box sx={{ flex: 1, minHeight: 0, width: '100%', minWidth: 0, display: 'flex', flexDirection: 'column', '& > div': { width: '100%', minWidth: 0, flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' } }}>
            <DataGrid<UserManagementDirectoryRow>
              listView={false}
              sortingMode="client"
              checkboxSelection
              disableRowSelectionOnClick
              onRowClick={handleRowClick}
              rows={augmentedRows}
              columns={columns}
              pagination
              paginationModel={paginationModel}
              onPaginationModelChange={setPaginationModel}
              pageSizeOptions={[10, 25]}
              density="standard"
              customToolbarFilters={toolbarFilters}
              onToolbarFiltersChange={handleFiltersChange}
              showAppliedFilters
              maxVisibleAppliedFilters={5}
              initialState={{ pinnedColumns: { right: ['actions'] }, sorting: { sortModel: [{ field: 'displayName', sort: 'asc' }] } }}
              onRefresh={() => setPaginationModel((p) => ({ ...p, page: 0 }))}
              sx={{ ...dataGridSx, minWidth: 200, width: '100%', maxWidth: '100%', flex: 1, minHeight: 0 }}
            />
          </Box>
        </Box>
      )}

      {/* Row actions menu */}
      <Menu anchorEl={menuAnchorEl} open={Boolean(menuAnchorEl)} onClose={handleMenuClose} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} transformOrigin={{ vertical: 'top', horizontal: 'right' }} slotProps={{ paper: { sx: { minWidth: 180 } } }}>
        <MenuItem onClick={() => void handleMenuAction('view_role')}>
          <ListItemIcon><Icon name="user" size="sm" /></ListItemIcon>
          <ListItemText primary="View role" />
        </MenuItem>
        <MenuItem onClick={() => void handleMenuAction('copy_email')}>
          <ListItemIcon><Icon name="copy-simple" size="sm" /></ListItemIcon>
          <ListItemText primary="Copy email" />
        </MenuItem>
      </Menu>

      {/* ── Create New User drawer ───────────────────────────────────── */}
      <Drawer
        anchor="right"
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
        slotProps={DRAWER_SLOT_PROPS}
        headerContent={
          <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', px: 2, py: '13px', bgcolor: '#f1f1f1', borderBottom: 1, borderColor: 'divider' }}>
            <Box>
              <Typography variant="title3" component="h2" sx={{ fontWeight: 700, lineHeight: 1.25, mb: 0.25 }}>Create New User</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: 13 }}>
                Invite a new user to your organization with specific tenant and product access
              </Typography>
            </Box>
            <IconButton size="small" variant="outlined" aria-label="Close" onClick={() => setInviteOpen(false)} sx={{ ml: 1, flexShrink: 0 }}>
              <Icon name="x" size="sm" />
            </IconButton>
          </Box>
        }
        footerActions={
          <>
            <Button variant="outlined" color="neutral" size="medium" onClick={() => setInviteOpen(false)}>Cancel</Button>
            <Button variant="contained" color="primary" size="medium" onClick={() => { setInviteOpen(false); setSnack('User created (prototype)') }}>Create User</Button>
          </>
        }
      >
        <Stack spacing={0} sx={{ px: 2, py: 2 }}>
          {/* Basic Information */}
          <Typography sx={{ fontWeight: 600, fontSize: 14, mb: 1.5, color: 'text.primary' }}>Basic Information</Typography>
          <Stack spacing={2} sx={{ mb: 3 }}>
            <EnhancedTextField
              label={<>Full Name<Box component="span" sx={{ color: 'error.main', ml: 0.25 }}>*</Box></>}
              placeholder="John Doe"
              value={inviteForm.fullName}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setInviteForm((f) => ({ ...f, fullName: e.target.value }))}
              fullWidth size="large"
            />
            <EnhancedTextField
              label={<>Email Address<Box component="span" sx={{ color: 'error.main', ml: 0.25 }}>*</Box></>}
              placeholder="john.doe@company.com"
              type="email"
              value={inviteForm.email}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setInviteForm((f) => ({ ...f, email: e.target.value }))}
              fullWidth size="large"
            />
          </Stack>

          {/* Tenant Assignment */}
          <Typography sx={{ fontWeight: 600, fontSize: 14, mb: 1.5, color: 'text.primary' }}>Tenant Assignment</Typography>
          <Stack spacing={2} sx={{ mb: 3 }}>
            <Box>
              <Autocomplete
                multiple
                options={TENANT_OPTIONS}
                value={inviteForm.tenants}
                onChange={(_: SyntheticEvent, val: string[]) => setInviteForm((f) => ({ ...f, tenants: val }))}
                renderInput={(params: object) => (
                  <EnhancedTextField
                    {...params}
                    label={<>Assign Tenants<Box component="span" sx={{ color: 'error.main', ml: 0.25 }}>*</Box></>}
                    placeholder="Search and select tenants..."
                    size="large"
                    fullWidth
                  />
                )}
              />
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                Select one or more tenants this user will have access to
              </Typography>
            </Box>
            <Box>
              <EnhancedTextField
                label={<>Role<Box component="span" sx={{ color: 'error.main', ml: 0.25 }}>*</Box></>}
                select
                fullWidth size="large"
                value={inviteForm.role}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setInviteForm((f) => ({ ...f, role: e.target.value }))}
              >
                {INVITE_ROLES.map((r) => (
                  <MenuItem key={r.name} value={r.name}>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>{r.name}</Typography>
                      <Typography variant="caption" color="text.secondary">{r.description}</Typography>
                    </Box>
                  </MenuItem>
                ))}
              </EnhancedTextField>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                This role will apply across all assigned tenants
              </Typography>
            </Box>
          </Stack>

          {/* Security Settings */}
          <Typography sx={{ fontWeight: 600, fontSize: 14, mb: 1.5, color: 'text.primary' }}>Security Settings</Typography>
          <Stack spacing={0} sx={{ mb: 2.5 }} divider={<Box sx={{ borderBottom: 1, borderColor: 'divider' }} />}>
            <Stack direction="row" alignItems="flex-start" justifyContent="space-between" sx={{ py: 1.75 }}>
              <Box sx={{ flex: 1, minWidth: 0, mr: 2 }}>
                <Typography sx={{ fontWeight: 600, fontSize: 14, lineHeight: 1.4 }}>Enforce Multi-Factor Authentication (MFA)</Typography>
                <Typography variant="caption" color="text.secondary">Require this user to set up MFA before accessing the platform</Typography>
              </Box>
              <Switch
                checked={inviteForm.enforceMfa}
                onChange={() => setInviteForm((f) => ({ ...f, enforceMfa: !f.enforceMfa }))}
                size="small"
                inputProps={{ 'aria-label': 'Enforce MFA' }}
              />
            </Stack>
            <Stack direction="row" alignItems="flex-start" justifyContent="space-between" sx={{ py: 1.75 }}>
              <Box sx={{ flex: 1, minWidth: 0, mr: 2 }}>
                <Typography sx={{ fontWeight: 600, fontSize: 14, lineHeight: 1.4 }}>Send Invitation Email</Typography>
                <Typography variant="caption" color="text.secondary">Send an email invitation with setup instructions to the user</Typography>
              </Box>
              <Switch
                checked={inviteForm.sendInvitation}
                onChange={() => setInviteForm((f) => ({ ...f, sendInvitation: !f.sendInvitation }))}
                size="small"
                inputProps={{ 'aria-label': 'Send invitation email' }}
              />
            </Stack>
          </Stack>

          {/* Creation Summary */}
          <Box sx={(t: Theme) => ({ p: 2, borderRadius: 2, bgcolor: alpha(t.palette.primary.main, 0.05), border: `1px solid ${alpha(t.palette.primary.main, 0.20)}` })}>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.25 }}>
              <Box sx={{ color: 'primary.main', display: 'flex' }}><Icon name="check-circle" size="sm" /></Box>
              <Typography sx={{ fontWeight: 700, fontSize: 13, color: 'primary.main' }}>Creation Summary</Typography>
            </Stack>
            <Stack spacing={0.6}>
              {[
                <>User will have <Box component="span" sx={{ fontWeight: 700 }}>{inviteForm.role.toLowerCase()}</Box> access</>,
                <>Access to <Box component="span" sx={{ fontWeight: 700 }}>{inviteForm.tenants.length}</Box> tenant{inviteForm.tenants.length !== 1 ? 's' : ''}</>,
                <>MFA is <Box component="span" sx={{ fontWeight: 700 }}>{inviteForm.enforceMfa ? 'required' : 'optional'}</Box></>,
                <>Invitation email <Box component="span" sx={{ fontWeight: 700 }}>{inviteForm.sendInvitation ? 'will be sent' : 'will not be sent'}</Box></>,
              ].map((line, i) => (
                <Typography key={i} variant="body2" sx={{ color: 'primary.dark', fontSize: 13 }}>• {line}</Typography>
              ))}
            </Stack>
          </Box>
        </Stack>
      </Drawer>

      {/* ── Bulk Invite drawer ───────────────────────────────────────── */}
      <Drawer
        anchor="right"
        open={bulkInviteOpen}
        onClose={() => setBulkInviteOpen(false)}
        slotProps={DRAWER_SLOT_PROPS}
        headerContent={<DrawerHeader label="User Management" title="Bulk Invite Users" onClose={() => setBulkInviteOpen(false)} />}
        footerActions={
          <>
            <Button variant="outlined" color="neutral" size="medium" onClick={() => setBulkInviteOpen(false)}>Cancel</Button>
            <Button variant="contained" color="primary" size="medium" onClick={() => { setBulkInviteOpen(false); setSnack('Bulk invite submitted (prototype)') }}>Invite</Button>
          </>
        }
      >
        <Stack spacing={2.5} sx={{ px: 2, py: 2 }}>
          {/* Before you begin */}
          <Box sx={(t: Theme) => ({ p: 2, borderRadius: 2, bgcolor: alpha(t.palette.info.main, 0.06), border: `1px solid ${alpha(t.palette.info.main, 0.30)}` })}>
            <Stack direction="row" spacing={1.25} alignItems="flex-start">
              <Box sx={{ color: 'info.main', display: 'flex', flexShrink: 0, mt: 0.1 }}><Icon name="info" size="sm" /></Box>
              <Box>
                <Typography sx={{ fontWeight: 700, fontSize: 13, color: 'info.dark', mb: 0.4 }}>Before you begin:</Typography>
                <Typography sx={{ fontSize: 13, color: 'info.dark', lineHeight: 1.5 }}>
                  Download the template to ensure your file has the correct format. Maximum 10,000 users per upload.
                </Typography>
              </Box>
            </Stack>
          </Box>

          {/* Download template */}
          <Stack direction="row" alignItems="center" spacing={1.5} sx={{ p: 1.5, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
            <Box sx={{ width: 36, height: 36, borderRadius: 1, bgcolor: '#E8F5E9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Icon name="file-csv" size="sm" sx={{ color: '#2E7D32' }} />
            </Box>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 0.25 }}>
                Download CSV Template, Includes all required columns and sample data
              </Typography>
              <Link href="#" underline="hover" sx={{ fontSize: 13, fontWeight: 600, color: 'primary.main' }}>
                Download Template
              </Link>
            </Box>
          </Stack>

          {/* Drag & Drop upload area */}
          <Box
            component="label"
            sx={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              p: 3, border: '2px dashed', borderColor: 'divider', borderRadius: 2, cursor: 'pointer',
              bgcolor: 'action.hover', minHeight: 160,
              '&:hover': { borderColor: 'primary.light', bgcolor: (t: Theme) => alpha(t.palette.primary.main, 0.04) },
            }}
          >
            <input type="file" accept=".csv,.xlsx" hidden onChange={() => setSnack('File selected (prototype)')} />
            <Stack direction="row" spacing={1} sx={{ mb: 1.5 }}>
              <Box sx={{ width: 40, height: 48, bgcolor: '#E3F2FD', borderRadius: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography sx={{ fontSize: 10, fontWeight: 700, color: '#1565C0' }}>CSV</Typography>
              </Box>
              <Box sx={{ width: 8, height: 8, bgcolor: 'primary.main', borderRadius: '50%', alignSelf: 'flex-end', mb: 1 }} />
              <Box sx={{ width: 40, height: 48, bgcolor: '#E8F5E9', borderRadius: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography sx={{ fontSize: 10, fontWeight: 700, color: '#2E7D32' }}>XLSX</Typography>
              </Box>
            </Stack>
            <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
              Drag & Drop or{' '}
              <Box component="span" sx={{ color: 'primary.main', cursor: 'pointer' }}>Browse</Box>
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Upload a CSV or XLSX File to begin the bulk invite process
            </Typography>
            <Typography variant="caption" color="text.disabled" sx={{ mt: 1 }}>
              Supported Formats: CSV or XLSX · Maximum rows: 10,000 · Maximum: 10 MB
            </Typography>
          </Box>

          {/* How duplicates are handled */}
          <Box sx={(t: Theme) => ({ p: 2, borderRadius: 2, bgcolor: alpha(t.palette.primary.main, 0.04), border: `1px solid ${alpha(t.palette.primary.main, 0.15)}` })}>
            <Stack direction="row" spacing={1} alignItems="flex-start" sx={{ mb: 1 }}>
              <Box sx={{ color: 'primary.main', display: 'flex', flexShrink: 0, mt: 0.1 }}><Icon name="info" size="sm" /></Box>
              <Typography sx={{ fontWeight: 700, fontSize: 13, color: 'primary.main' }}>How Duplicates Are Handled</Typography>
            </Stack>
            <Stack component="ul" spacing={0.75} sx={{ m: 0, pl: 2 }}>
              {[
                ['Duplicate emails in your file:', 'Only the first occurrence will be processed (Error)'],
                ['Users already in the system:', 'Automatically skipped with a warning'],
                ['Safe to re-upload:', 'You can upload the same file multiple times - already invited users will be skipped automatically'],
                ['Retry flow:', 'Fix errors in the failure report and re-upload only those rows, or re-upload the entire file'],
              ].map(([bold, rest]) => (
                <Box key={bold} component="li" sx={{ fontSize: 13, lineHeight: 1.5, color: 'text.primary' }}>
                  <Box component="span" sx={{ fontWeight: 600, color: 'primary.main' }}>{bold}</Box>{' '}
                  <Box component="span" sx={{ color: 'text.secondary' }}>{rest}</Box>
                </Box>
              ))}
            </Stack>
          </Box>
        </Stack>
      </Drawer>

      <Snackbar open={Boolean(snack)} autoHideDuration={4000} onClose={() => setSnack(null)} message={snack} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }} />
    </Box>
  )
}
