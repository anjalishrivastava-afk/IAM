/**
 * RBAC User Management — Figma 1:20761 (shell + Roles grid) and 1:20975 (Privilege Sets grid).
 */
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type MouseEvent,
  type SyntheticEvent,
} from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import type { GridRenderCellParams, GridRowParams } from '@mui/x-data-grid-pro'
import ClickAwayListener from '@mui/material/ClickAwayListener'
import MenuItem from '@mui/material/MenuItem'
import MenuList from '@mui/material/MenuList'
import Popper from '@mui/material/Popper'
import Slide from '@mui/material/Slide'
import Snackbar from '@mui/material/Snackbar'
import { alpha, useTheme } from '@mui/material/styles'
import type { Theme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'
import { avatarFillFromHue } from '../utils/avatarSurface'
import {
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  DataGrid,
  Divider,
  EnhancedTextField,
  getInitials,
  Icon,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  Paper,
  Stack,
  stringToColor,
  Tab,
  Tabs,
  Typography,
  type GridColDef,
  type ToolbarFilterConfig,
} from '@exotel-npm-dev/signal-design-system'
import {
  fetchPrivilegeSets,
  fetchRoles,
  fetchDirectoryUsers,
  createPrivilegeSet,
  createRole,
  deletePrivilegeSet,
  deleteRole,
  duplicatePrivilegeSet,
  duplicateRole,
} from '../api/rbacApi'
import { RBAC_LISTS_REFRESH_EVENT } from '../constants/rbacEvents'
import type { UserManagementDirectoryRow } from '../data/userManagementUsers'
import { USER_MANAGEMENT_ROLE_ROWS } from '../data/userManagementRoles'
import type { UserManagementRoleRow } from '../data/userManagementRoles'
import type { PrivilegeSetRow } from '../data/privilegeSets'
import type { FilterRecords } from '../types/filterRecords'
import { useAiChatAssistLayout } from '../context/AiChatAssistLayoutContext'
import { RbacDataGridPageHeader } from '../components/rbac/RbacDataGridPageHeader'
import { UserManagementUsersPanel } from '../components/rbac/UserManagementUsersPanel'
import { SIGNAL_NAV_WIDTH_EXPANDED_PX } from './rbacUiImpact/constants'
import { DirtyPulseLabel, DiscardChangesDialog } from './rbacUiImpact/shared'
import {
  CampaignBasicSettingsPanel,
  INITIAL_CAMPAIGN_BASIC_FORM,
  type CampaignBasicFormState,
} from './campaign/CampaignBasicSettingsPanel'
import {
  CampaignChannelConfigurationPanel,
  INITIAL_CAMPAIGN_CHANNEL_FORM,
  serializeCampaignChannelForm,
  type CampaignChannelFormState,
  type ChannelTabKey,
} from './campaign/CampaignChannelConfigurationPanel'

function serializeCampaignBasicForm(form: CampaignBasicFormState): string {
  return JSON.stringify(form)
}

export type UserManagementPageVariant = 'rbac' | 'campaign'

export type UserManagementPageProps = {
  /** `'campaign'` = HDFC Outbound Voice campaign shell (Campaign details pattern). */
  variant?: UserManagementPageVariant
  /** Hide the secondary left nav rail (used by Admin Portal where the admin sidebar handles navigation). */
  hideSecondaryNav?: boolean
}

/** Sub-navigation within User Management (Figma secondary rail). */
const UM_NAV = [
  { key: 'users' as const, title: 'Users', caption: 'Add and manage users' },
  { key: 'groups' as const, title: 'Groups', caption: 'Group users for access' },
  { key: 'roles' as const, title: 'Roles and Privileges', caption: 'Control access levels' },
]

type CampaignNavKey =
  | 'basic-settings'
  | 'channel-config'
  | 'caller-id-pool'
  | 'workforce'
  | 'queue'
  | 'intents-entities'
  | 'map-intents'
  | 'advanced-options'

/** Secondary areas that have their own Edit (RBAC UI — not a single global Edit). */
type CampaignEditableSection = 'basic-settings' | 'channel-config'

const CAMPAIGN_NAV: ReadonlyArray<{ key: CampaignNavKey; title: string; caption: string }> = [
  { key: 'basic-settings', title: 'Basic Settings', caption: 'Basic Campaign Info & Setup' },
  { key: 'channel-config', title: 'Channel Configuration', caption: 'Configure Channel Settings' },
  { key: 'caller-id-pool', title: 'Caller ID Pool', caption: 'Set Up Caller ID Pools' },
  {
    key: 'workforce',
    title: 'Workforce & Availability',
    caption: 'Setup Users, Holidays, Office Hours, Default Working',
  },
  { key: 'queue', title: 'Queue', caption: 'Create and Manage Queues' },
  { key: 'intents-entities', title: 'Intents and Entities', caption: '' },
  {
    key: 'map-intents',
    title: 'Map Intent and Entities to Campaign',
    caption: 'Wire intents to this campaign',
  },
  {
    key: 'advanced-options',
    title: 'Advance Options',
    caption: 'Configure dial profile, node flows, routing, assets etc',
  },
]

const SECONDARY_NAV_WIDTH_RBAC_PX = 209
const SECONDARY_NAV_WIDTH_CAMPAIGN_PX = 280

/** Default vs Custom tonal chips — matches Signal DS + Figma “Type” badges. */
function TypeChip({ scopeType }: { scopeType: UserManagementRoleRow['scopeType'] }) {
  if (scopeType === 'system' || scopeType === 'default') {
    return <Chip size="small" label="System" variant="tonal" color="default" />
  }
  return <Chip size="small" label="Custom" variant="tonal" color="info" />
}

function buildFilters(rows: UserManagementRoleRow[]): ToolbarFilterConfig[] {
  const roles = [...new Set(rows.map((r) => r.roleName))].sort()
  const creators = [...new Set(rows.map((r) => r.createdBy))].sort()
  const creationLabels = [...new Set(rows.map((r) => r.createdAtLabel))].sort()

  return [
    {
      id: 'um_role',
      type: 'select',
      label: 'Role',

      options: [{ value: 'all', label: 'All' }, ...roles.map((r) => ({ value: r, label: r }))],
      initialValue: 'all',
    },
    {
      id: 'um_assigned',
      type: 'select',
      label: 'Assigned to',

      options: [
        { value: 'all', label: 'All' },
        { value: 'lte10', label: '1–10 users' },
        { value: '11to50', label: '11–50 users' },
        { value: 'gt50', label: '51+ users' },
      ],
      initialValue: 'all',
    },
    {
      id: 'um_creator',
      type: 'select',
      label: 'Created By',

      options: [{ value: 'all', label: 'All' }, ...creators.map((c) => ({ value: c, label: c }))],
      initialValue: 'all',
    },
    {
      id: 'um_created_at',
      type: 'select',
      label: 'Creation Date',

      options: [{ value: 'all', label: 'All' }, ...creationLabels.map((l) => ({ value: l, label: l }))],
      initialValue: 'all',
    },
  ]
}

const INITIAL_FILTERS: FilterRecords = {
  um_role: 'all',
  um_assigned: 'all',
  um_creator: 'all',
  um_created_at: 'all',
}

const NEW_ROLE_MODAL_NAME_PLACEHOLDER = 'e.g. Queue Supervisor'
const NEW_ROLE_MODAL_DESC_PLACEHOLDER =
  'e.g. Manage queues, assignments, and real-time dashboards for your team.'
const NEW_PS_MODAL_NAME_PLACEHOLDER = 'e.g. Outbound Voice — Agent'
const NEW_PS_MODAL_DESC_PLACEHOLDER =
  'e.g. Place outbound calls, use campaign scripts, and log disposition codes.'

const PRIV_INITIAL_FILTERS: FilterRecords = {
  ps_role: 'all',
  ps_assigned: 'all',
  ps_creator: 'all',
  ps_created_at: 'all',
}

function applyPrivilegeFilters(
  rows: PrivilegeSetRow[],
  search: string,
  filters: FilterRecords,
): PrivilegeSetRow[] {
  let next = rows

  const q = search.trim().toLowerCase()
  if (q) {
    next = next.filter(
      (r) =>
        r.privilegeSetName.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q) ||
        r.createdBy.toLowerCase().includes(q),
    )
  }

  const role = filters.ps_role
  if (role && role !== 'all') {
    next = next.filter((r) => r.usedByRoleNames.includes(String(role)))
  }

  const bucket = filters.ps_assigned
  if (bucket && bucket !== 'all') {
    next = next.filter((r) => {
      const n = r.assignedRoleCount
      if (bucket === 'lte10') return n <= 10
      if (bucket === '11to50') return n >= 11 && n <= 50
      if (bucket === 'gt50') return n > 50
      return true
    })
  }

  const creator = filters.ps_creator
  if (creator && creator !== 'all') {
    next = next.filter((r) => r.createdBy === creator)
  }

  const created = filters.ps_created_at
  if (created && created !== 'all') {
    next = next.filter((r) => r.createdAtLabel === created)
  }

  return next
}

function buildPrivilegeFilters(rows: PrivilegeSetRow[]): ToolbarFilterConfig[] {
  const roleNames = [...new Set(rows.flatMap((r) => r.usedByRoleNames))].sort()
  const creators = [...new Set(rows.map((r) => r.createdBy))].sort()
  const creationLabels = [...new Set(rows.map((r) => r.createdAtLabel))].sort()

  return [
    {
      id: 'ps_role',
      type: 'select',
      label: 'Role',

      options: [{ value: 'all', label: 'All' }, ...roleNames.map((r) => ({ value: r, label: r }))],
      initialValue: 'all',
    },
    {
      id: 'ps_assigned',
      type: 'select',
      label: 'Assigned to',

      options: [
        { value: 'all', label: 'All' },
        { value: 'lte10', label: '1–10 roles' },
        { value: '11to50', label: '11–50 roles' },
        { value: 'gt50', label: '51+ roles' },
      ],
      initialValue: 'all',
    },
    {
      id: 'ps_creator',
      type: 'select',
      label: 'Created By',

      options: [{ value: 'all', label: 'All' }, ...creators.map((c) => ({ value: c, label: c }))],
      initialValue: 'all',
    },
    {
      id: 'ps_created_at',
      type: 'select',
      label: 'Creation Date',

      options: [{ value: 'all', label: 'All' }, ...creationLabels.map((l) => ({ value: l, label: l }))],
      initialValue: 'all',
    },
  ]
}

function applyRoleFilters(
  rows: UserManagementRoleRow[],
  search: string,
  filters: FilterRecords,
): UserManagementRoleRow[] {
  let next = rows

  const q = search.trim().toLowerCase()
  if (q) {
    next = next.filter(
      (r) =>
        r.roleName.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q) ||
        r.createdBy.toLowerCase().includes(q),
    )
  }

  const role = filters.um_role
  if (role && role !== 'all') {
    next = next.filter((r) => r.roleName === role)
  }

  const bucket = filters.um_assigned
  if (bucket && bucket !== 'all') {
    next = next.filter((r) => {
      const n = r.assignedUserCount
      if (bucket === 'lte10') return n <= 10
      if (bucket === '11to50') return n >= 11 && n <= 50
      if (bucket === 'gt50') return n > 50
      return true
    })
  }

  const creator = filters.um_creator
  if (creator && creator !== 'all') {
    next = next.filter((r) => r.createdBy === creator)
  }

  const created = filters.um_created_at
  if (created && created !== 'all') {
    next = next.filter((r) => r.createdAtLabel === created)
  }

  return next
}

function SecondaryNavItem({
  title,
  caption,
  selected,
  onClick,
}: {
  title: string
  caption: string
  selected: boolean
  onClick: () => void
}) {
  return (
    <Box
      component="button"
      type="button"
      onClick={onClick}
      sx={{
        width: '100%',
        textAlign: 'left',
        p: 1,
        mb: 0.5,
        borderRadius: 1,
        cursor: 'pointer',
        appearance: 'none',
        WebkitAppearance: 'none',
        MozAppearance: 'none',
        /** UA `button` font is system UI — inherit theme stack (Signal: Noto Sans). */
        fontFamily: (theme: Theme) => theme.typography.fontFamily,
        borderStyle: 'solid',
        borderWidth: selected ? '1px' : 0,
        borderColor: selected ? 'primary.main' : 'transparent',
        outline: 'none',
        ...(selected
          ? {
              bgcolor: (theme: Theme) => alpha(theme.palette.primary.main, 0.16),
            }
          : {
              bgcolor: 'transparent',
              '&:hover': {
                bgcolor: 'action.hover',
              },
            }),
        '&:focus-visible': {
          outline: '2px solid',
          outlineColor: 'primary.main',
          outlineOffset: 2,
        },
      }}
    >
      <Typography
        variant="label2"
        component="span"
        display="block"
        color="text.primary"
        sx={{ fontFamily: (theme: Theme) => theme.typography.fontFamily }}
      >
        {title}
      </Typography>
      <Typography
        variant="body3"
        color="text.secondary"
        sx={{
          mt: 0.25,
          display: 'block',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          fontFamily: (theme: Theme) => theme.typography.fontFamily,
        }}
      >
        {caption}
      </Typography>
    </Box>
  )
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

export function UserManagementPage({
  variant: variantProp = 'rbac',
  hideSecondaryNav = false,
}: UserManagementPageProps = {}) {
  const variant = variantProp
  const secondaryNavWidthPx =
    variant === 'campaign' ? SECONDARY_NAV_WIDTH_CAMPAIGN_PX : SECONDARY_NAV_WIDTH_RBAC_PX

  // Admin context uses /admin/* routes so detail pages stay within AdminLayout
  const baseNav = {
    role:          hideSecondaryNav ? '/admin/roles'          : '/closed-interaction/user-management/roles',
    privilegeSet:  hideSecondaryNav ? '/admin/privilege-sets' : '/closed-interaction/user-management/privilege-sets',
  }

  const navigate = useNavigate()
  const location = useLocation()
  const [section, setSection] = useState<string>(() => {
    if (variant === 'campaign') return 'basic-settings'
    const st = location.state as { adminSection?: string } | null | undefined
    // Explicit state wins
    if (st?.adminSection === 'users') return 'users'
    if (st?.adminSection === 'roles') return 'roles'
    // Fall back to pathname — /admin/users always opens Users grid
    if (location.pathname === '/admin/users') return 'users'
    return 'roles'
  })
  const [mainTab, setMainTab] = useState<'roles' | 'privileges'>('roles')
  const [search, setSearch] = useState('')
  const [filterRecords, setFilterRecords] = useState<FilterRecords>(() => ({ ...INITIAL_FILTERS }))
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 })
  const [menuAnchorEl, setMenuAnchorEl] = useState<HTMLElement | null>(null)
  const [menuRowId, setMenuRowId] = useState<string | null>(null)

  const [privSearch, setPrivSearch] = useState('')
  const [privFilterRecords, setPrivFilterRecords] = useState<FilterRecords>(() => ({
    ...PRIV_INITIAL_FILTERS,
  }))
  const [privPaginationModel, setPrivPaginationModel] = useState({ page: 0, pageSize: 10 })
  const [privMenuAnchorEl, setPrivMenuAnchorEl] = useState<HTMLElement | null>(null)
  const [privMenuRowId, setPrivMenuRowId] = useState<string | null>(null)

  const [roleRows, setRoleRows] = useState<UserManagementRoleRow[]>(USER_MANAGEMENT_ROLE_ROWS)
  const [privilegeRows, setPrivilegeRows] = useState<PrivilegeSetRow[]>([])
  const [listError, setListError] = useState<string | null>(null)
  const [userRows, setUserRows] = useState<UserManagementDirectoryRow[]>([])
  const [userLoadError, setUserLoadError] = useState<string | null>(null)

  const { openChat, closeChat } = useAiChatAssistLayout()

  const [newRoleOpen, setNewRoleOpen] = useState(false)
  const [newRoleName, setNewRoleName] = useState('')
  const [newRoleDesc, setNewRoleDesc] = useState('')

  const [newPsOpen, setNewPsOpen] = useState(false)
  const [newPsName, setNewPsName] = useState('')
  const [newPsDesc, setNewPsDesc] = useState('')

  const isCampaign = variant === 'campaign'
  const [campaignEditingSection, setCampaignEditingSection] =
    useState<CampaignEditableSection | null>(null)
  const [campaignBasicEditBaseline, setCampaignBasicEditBaseline] =
    useState<CampaignBasicFormState>(INITIAL_CAMPAIGN_BASIC_FORM)
  const [campaignChannelEditBaseline, setCampaignChannelEditBaseline] =
    useState<CampaignChannelFormState>(INITIAL_CAMPAIGN_CHANNEL_FORM)
  const [campaignNavDiscardOpen, setCampaignNavDiscardOpen] = useState(false)
  const [pendingCampaignNavKey, setPendingCampaignNavKey] = useState<CampaignNavKey | null>(null)
  const [campaignHeaderMenuAnchor, setCampaignHeaderMenuAnchor] = useState<null | HTMLElement>(null)
  const [saveFooterMenuOpen, setSaveFooterMenuOpen] = useState(false)
  const splitSaveFooterRef = useRef<HTMLDivElement | null>(null)
  const publishSpinnerTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const [campaignSnackbarOpen, setCampaignSnackbarOpen] = useState(false)
  const [campaignSnackbarMessage, setCampaignSnackbarMessage] = useState('')
  const [publishSpinnerActive, setPublishSpinnerActive] = useState(false)
  /** Demo campaign Basic Settings form — drives footer dirty count + Publish (serialized compare). */
  const [campaignBasicForm, setCampaignBasicForm] = useState<CampaignBasicFormState>(
    INITIAL_CAMPAIGN_BASIC_FORM,
  )
  const [campaignBasicSaved, setCampaignBasicSaved] = useState<CampaignBasicFormState>(
    INITIAL_CAMPAIGN_BASIC_FORM,
  )
  const [campaignBasicPublished, setCampaignBasicPublished] = useState<CampaignBasicFormState>(
    INITIAL_CAMPAIGN_BASIC_FORM,
  )
  const [campaignChannelForm, setCampaignChannelForm] = useState<CampaignChannelFormState>(
    INITIAL_CAMPAIGN_CHANNEL_FORM,
  )
  const [campaignChannelSaved, setCampaignChannelSaved] = useState<CampaignChannelFormState>(
    INITIAL_CAMPAIGN_CHANNEL_FORM,
  )
  const [campaignChannelPublished, setCampaignChannelPublished] = useState<CampaignChannelFormState>(
    INITIAL_CAMPAIGN_CHANNEL_FORM,
  )

  /** Call / WhatsApp / … tabs inside Channel Configuration (Figma strip). */
  const [campaignChannelUiTab, setCampaignChannelUiTab] = useState<ChannelTabKey>('call')

  const patchCampaignBasicForm = useCallback((patch: Partial<CampaignBasicFormState>) => {
    setCampaignBasicForm((f) => ({ ...f, ...patch }))
  }, [])

  const patchCampaignChannelForm = useCallback((patch: Partial<CampaignChannelFormState>) => {
    setCampaignChannelForm((f) => ({ ...f, ...patch }))
  }, [])

  const UM_LIST_PATH = '/closed-interaction/user-management'

  const reloadRbacsLists = useCallback(async () => {
    try {
      setListError(null)
      const [r, p] = await Promise.all([fetchRoles(), fetchPrivilegeSets()])
      // Only replace static fallback if backend returns real data
      if (r.length > 0) setRoleRows(r)
      setPrivilegeRows(p)
    } catch (e) {
      setListError(e instanceof Error ? e.message : 'Failed to load RBAC data')
    }
  }, [])

  const reloadUsers = useCallback(async () => {
    try {
      setUserLoadError(null)
      const u = await fetchDirectoryUsers()
      setUserRows(u)
    } catch (e) {
      setUserLoadError(e instanceof Error ? e.message : 'Failed to load users')
    }
  }, [])

  useEffect(() => {
    if (variant === 'campaign') {
      void reloadRbacsLists()
      return
    }
    if (location.pathname !== UM_LIST_PATH) return
    void reloadRbacsLists()
  }, [variant, location.pathname, reloadRbacsLists])

  useEffect(() => {
    const h = () => {
      void reloadRbacsLists()
      void reloadUsers()
    }
    window.addEventListener(RBAC_LISTS_REFRESH_EVENT, h)
    return () => window.removeEventListener(RBAC_LISTS_REFRESH_EVENT, h)
  }, [reloadRbacsLists, reloadUsers])

  useEffect(() => {
    if (variant !== 'rbac') return
    if (section !== 'users') return
    void reloadUsers()
  }, [variant, section, reloadUsers])

  useEffect(() => {
    return () => {
      if (publishSpinnerTimeoutRef.current != null) {
        window.clearTimeout(publishSpinnerTimeoutRef.current)
        publishSpinnerTimeoutRef.current = null
      }
    }
  }, [])

  const submitNewRole = useCallback(async () => {
    if (!newRoleName.trim()) return
    try {
      const row = await createRole({
        roleName: newRoleName.trim(),
        description: newRoleDesc,
        scopeType: 'custom',
      })
      setRoleRows((prev) => [...prev, row].sort((a, b) => a.roleName.localeCompare(b.roleName)))
      setNewRoleOpen(false)
      setNewRoleName('')
      setNewRoleDesc('')
      navigate(`${baseNav.role}/${row.id}`)
    } catch (e) {
      setListError(e instanceof Error ? e.message : 'Create role failed')
    }
  }, [newRoleDesc, newRoleName, navigate])

  const submitNewPrivilegeSet = useCallback(async () => {
    if (!newPsName.trim()) return
    try {
      const row = await createPrivilegeSet({
        privilegeSetName: newPsName.trim(),
        description: newPsDesc,
        scopeType: 'custom',
      })
      setPrivilegeRows((prev) =>
        [...prev, row].sort((a, b) => a.privilegeSetName.localeCompare(b.privilegeSetName)),
      )
      setNewPsOpen(false)
      setNewPsName('')
      setNewPsDesc('')
      navigate(`${baseNav.privilegeSet}/${row.id}`)
    } catch (e) {
      setListError(e instanceof Error ? e.message : 'Create privilege set failed')
    }
  }, [navigate, newPsDesc, newPsName])

  const toolbarFilters = useMemo(() => buildFilters(roleRows), [roleRows])
  const privToolbarFilters = useMemo(() => buildPrivilegeFilters(privilegeRows), [privilegeRows])

  const filteredRows = useMemo(
    () => applyRoleFilters(roleRows, search, filterRecords),
    [roleRows, search, filterRecords],
  )

  const filteredPrivilegeRows = useMemo(
    () => applyPrivilegeFilters(privilegeRows, privSearch, privFilterRecords),
    [privilegeRows, privSearch, privFilterRecords],
  )

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

  const handlePrivToolbarFiltersChange = useCallback((filters: FilterRecords) => {
    setPrivFilterRecords(filters)
    setPrivPaginationModel((p) => ({ ...p, page: 0 }))
  }, [])

  const handlePrivMenuOpen = useCallback((event: React.MouseEvent<HTMLElement>, rowId: string) => {
    event.stopPropagation()
    setPrivMenuAnchorEl(event.currentTarget)
    setPrivMenuRowId(rowId)
  }, [])

  const handlePrivMenuClose = useCallback(() => {
    setPrivMenuAnchorEl(null)
    setPrivMenuRowId(null)
  }, [])

  const columns: GridColDef<UserManagementRoleRow>[] = useMemo(
    () => [
      {
        field: 'roleName',
        headerName: 'Role',
        flex: 1,
        minWidth: 180,
        renderCell: (params: GridRenderCellParams<UserManagementRoleRow>) => (
          <Box sx={{ minWidth: 0, width: '100%', overflow: 'hidden' }}>
            <Typography
              variant="body2"
              component="span"
              noWrap
              sx={{
                display: 'block',
                fontFamily: (theme: Theme) => theme.typography.fontFamily,
                color: 'primary.main',
                fontWeight: (theme: Theme) => theme.typography.fontWeightMedium,
                cursor: 'pointer',
                lineHeight: 1.43,
                '&:hover': { textDecoration: 'underline' },
              }}
            >
              {params.value}
            </Typography>
          </Box>
        ),
      },
      {
        field: 'description',
        headerName: 'Description',
        flex: 1.4,
        minWidth: 220,
        renderCell: (params) => (
          <Box sx={{ minWidth: 0, width: '100%', overflow: 'hidden' }}>
            <Typography
              variant="body2"
              component="span"
              noWrap
              sx={{
                display: 'block',
                fontFamily: (theme: Theme) => theme.typography.fontFamily,
                lineHeight: 1.43,
              }}
            >
              {params.value}
            </Typography>
          </Box>
        ),
      },
      {
        field: 'scopeType',
        headerName: 'Type',
        width: 140,
        renderCell: (params: GridRenderCellParams<UserManagementRoleRow, UserManagementRoleRow['scopeType']>) => (
          <TypeChip scopeType={params.value!} />
        ),
      },
      {
        field: 'assignedUserCount',
        headerName: 'Assigned to',
        width: 150,
        align: 'left',
        headerAlign: 'left',
        renderCell: (params: GridRenderCellParams<UserManagementRoleRow>) => (
          <Box sx={{ minWidth: 0, width: '100%', overflow: 'hidden' }}>
            <Typography
              variant="body2"
              component="span"
              noWrap
              sx={{
                display: 'block',
                fontFamily: (theme: Theme) => theme.typography.fontFamily,
                lineHeight: 1.43,
              }}
            >
              {params.value} Users
            </Typography>
          </Box>
        ),
      },
      {
        field: 'createdBy',
        headerName: 'Created by',
        flex: 1,
        minWidth: 200,
        renderCell: (params: GridRenderCellParams<UserManagementRoleRow>) => {
          const name = String(params.value ?? '')
          const raw = stringToColor(name)
          return (
            <Stack
              alignItems="center"
              direction="row"
              spacing={1}
              sx={{ minWidth: 0, width: '100%', overflow: 'hidden' }}
            >
              <Avatar
                sx={(theme: Theme) => ({
                  width: 24,
                  height: 24,
                  flexShrink: 0,
                  fontSize: theme.typography.pxToRem(12),
                  fontWeight: theme.typography.fontWeightMedium,
                  bgcolor: avatarFillFromHue(raw, theme),
                  color: theme.palette.common.white,
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
                  lineHeight: 1.43,
                  fontFamily: (theme: Theme) => theme.typography.fontFamily,
                }}
              >
                {name}
              </Typography>
            </Stack>
          )
        },
      },
      {
        field: 'createdAtLabel',
        headerName: 'Creation Time',
        width: 180,
        renderCell: (params: GridRenderCellParams<UserManagementRoleRow>) => (
          <Stack
            alignItems="center"
            direction="row"
            spacing={0.5}
            sx={{ minWidth: 0, width: '100%', overflow: 'hidden' }}
          >
            <Icon name="calendar-blank" size="sm" sx={{ flexShrink: 0 }} aria-hidden />
            <Typography variant="body2" noWrap sx={{ minWidth: 0, flex: 1, lineHeight: 1.43 }}>
              {params.value}
            </Typography>
          </Stack>
        ),
      },
      {
        field: 'actions',
        headerName: ' ',
        width: 56,
        sortable: false,
        filterable: false,
        disableColumnMenu: true,
        renderCell: (params: GridRenderCellParams<UserManagementRoleRow>) => (
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

  const privilegeColumns: GridColDef<PrivilegeSetRow>[] = useMemo(
    () => [
      {
        field: 'privilegeSetName',
        headerName: 'Privilege Set',
        flex: 1,
        minWidth: 180,
        renderCell: (params: GridRenderCellParams<PrivilegeSetRow>) => (
          <Box sx={{ minWidth: 0, width: '100%', overflow: 'hidden' }}>
            <Typography
              variant="body2"
              component="span"
              noWrap
              sx={{
                display: 'block',
                fontFamily: (theme: Theme) => theme.typography.fontFamily,
                color: 'primary.main',
                fontWeight: (theme: Theme) => theme.typography.fontWeightMedium,
                cursor: 'pointer',
                lineHeight: 1.43,
                '&:hover': { textDecoration: 'underline' },
              }}
            >
              {params.value}
            </Typography>
          </Box>
        ),
      },
      {
        field: 'description',
        headerName: 'Description',
        flex: 1.4,
        minWidth: 220,
        renderCell: (params: GridRenderCellParams<PrivilegeSetRow>) => {
          const v = String(params.value ?? '').trim()
          return (
            <Box sx={{ minWidth: 0, width: '100%', overflow: 'hidden' }}>
              <Typography
                variant="body2"
                component="span"
                noWrap
                sx={{
                  display: 'block',
                  fontFamily: (theme: Theme) => theme.typography.fontFamily,
                  lineHeight: 1.43,
                  color: v ? 'text.primary' : 'text.secondary',
                }}
              >
                {v ? v : '--'}
              </Typography>
            </Box>
          )
        },
      },
      {
        field: 'scopeType',
        headerName: 'Type',
        width: 140,
        renderCell: (
          params: GridRenderCellParams<PrivilegeSetRow, PrivilegeSetRow['scopeType']>,
        ) => <TypeChip scopeType={params.value!} />,
      },
      {
        field: 'assignedRoleCount',
        headerName: 'Assigned Roles',
        width: 160,
        align: 'left',
        headerAlign: 'left',
        renderCell: (params: GridRenderCellParams<PrivilegeSetRow>) => {
          const n = Number(params.value ?? 0)
          return (
            <Box sx={{ minWidth: 0, width: '100%', overflow: 'hidden' }}>
              <Typography
                variant="body2"
                component="span"
                noWrap
                sx={{
                  display: 'block',
                  fontFamily: (theme: Theme) => theme.typography.fontFamily,
                  lineHeight: 1.43,
                }}
              >
                {String(n).padStart(2, '0')} Roles
              </Typography>
            </Box>
          )
        },
      },
      {
        field: 'createdBy',
        headerName: 'Created by',
        flex: 1,
        minWidth: 200,
        renderCell: (params: GridRenderCellParams<PrivilegeSetRow>) => {
          const name = String(params.value ?? '')
          const raw = stringToColor(name)
          return (
            <Stack
              alignItems="center"
              direction="row"
              spacing={1}
              sx={{ minWidth: 0, width: '100%', overflow: 'hidden' }}
            >
              <Avatar
                sx={(theme: Theme) => ({
                  width: 24,
                  height: 24,
                  flexShrink: 0,
                  fontSize: theme.typography.pxToRem(12),
                  fontWeight: theme.typography.fontWeightMedium,
                  bgcolor: avatarFillFromHue(raw, theme),
                  color: theme.palette.common.white,
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
                  lineHeight: 1.43,
                  fontFamily: (theme: Theme) => theme.typography.fontFamily,
                }}
              >
                {name}
              </Typography>
            </Stack>
          )
        },
      },
      {
        field: 'createdAtLabel',
        headerName: 'Creation Time',
        width: 180,
        renderCell: (params: GridRenderCellParams<PrivilegeSetRow>) => (
          <Stack
            alignItems="center"
            direction="row"
            spacing={0.5}
            sx={{ minWidth: 0, width: '100%', overflow: 'hidden' }}
          >
            <Icon name="calendar-blank" size="sm" sx={{ flexShrink: 0 }} aria-hidden />
            <Typography variant="body2" noWrap sx={{ minWidth: 0, flex: 1, lineHeight: 1.43 }}>
              {params.value}
            </Typography>
          </Stack>
        ),
      },
      {
        field: 'actions',
        headerName: ' ',
        width: 56,
        sortable: false,
        filterable: false,
        disableColumnMenu: true,
        renderCell: (params: GridRenderCellParams<PrivilegeSetRow>) => (
          <IconButton
            size="small"
            aria-label="Row actions"
            variant="outlined"
            onClick={(e: React.MouseEvent<HTMLElement>) => handlePrivMenuOpen(e, params.row.id)}
          >
            <Icon name="dots-three-vertical" size="sm" />
          </IconButton>
        ),
      },
    ],
    [handlePrivMenuOpen],
  )

  const handleRoleRowClick = useCallback(
    (params: GridRowParams<UserManagementRoleRow>, event: React.MouseEvent) => {
      const el = event.target as HTMLElement
      if (el.closest('.MuiCheckbox-root, [class*="checkbox"]')) return
      if (el.closest('button')) return
      navigate(`${baseNav.role}/${params.row.id}`)
    },
    [navigate],
  )

  const handleMenuAction = useCallback(
    async (action: 'view' | 'edit' | 'duplicate' | 'delete') => {
      const id = menuRowId
      handleMenuClose()
      if (!id) return
      if (action === 'view') {
        navigate(`${baseNav.role}/${id}`)
        return
      }
      if (action === 'edit') {
        navigate(`${baseNav.role}/${id}?mode=edit`)
        return
      }
      if (action === 'delete') {
        if (
          !window.confirm(
            'Permanently delete this role? User assignments and privilege set links will be removed.',
          )
        )
          return
        try {
          setListError(null)
          await deleteRole(id)
          await reloadRbacsLists()
          window.dispatchEvent(new CustomEvent(RBAC_LISTS_REFRESH_EVENT))
        } catch (e) {
          setListError(e instanceof Error ? e.message : 'Delete role failed')
        }
        return
      }
      try {
        setListError(null)
        const row = await duplicateRole(id)
        await reloadRbacsLists()
        window.dispatchEvent(new CustomEvent(RBAC_LISTS_REFRESH_EVENT))
        navigate(`${baseNav.role}/${row.id}`)
      } catch (e) {
        setListError(e instanceof Error ? e.message : 'Duplicate role failed')
      }
    },
    [menuRowId, handleMenuClose, navigate, reloadRbacsLists],
  )

  useEffect(() => {
    if (variant !== 'rbac') return
    const st = location.state as { umMainTab?: 'roles' | 'privileges' } | null | undefined
    if (st?.umMainTab === 'privileges' || st?.umMainTab === 'roles') {
      setMainTab(st.umMainTab)
      setSection('roles')
    }
  }, [location.state, location.key, variant])

  const handlePrivilegeRowClick = useCallback(
    (params: GridRowParams<PrivilegeSetRow>, event: React.MouseEvent) => {
      const el = event.target as HTMLElement
      if (el.closest('.MuiCheckbox-root, [class*="checkbox"]')) return
      if (el.closest('button')) return
      navigate(`${baseNav.privilegeSet}/${params.row.id}`)
    },
    [navigate],
  )

  const handlePrivMenuAction = useCallback(
    async (action: 'view' | 'edit' | 'duplicate' | 'delete') => {
      const id = privMenuRowId
      handlePrivMenuClose()
      if (!id) return
      if (action === 'view') {
        navigate(`${baseNav.privilegeSet}/${id}`)
        return
      }
      if (action === 'edit') {
        navigate(`${baseNav.privilegeSet}/${id}?mode=edit`)
        return
      }
      if (action === 'delete') {
        if (
          !window.confirm(
            'Permanently delete this privilege set? It will be removed from all roles.',
          )
        )
          return
        try {
          setListError(null)
          await deletePrivilegeSet(id)
          await reloadRbacsLists()
          window.dispatchEvent(new CustomEvent(RBAC_LISTS_REFRESH_EVENT))
        } catch (e) {
          setListError(e instanceof Error ? e.message : 'Delete privilege set failed')
        }
        return
      }
      try {
        setListError(null)
        const row = await duplicatePrivilegeSet(id)
        await reloadRbacsLists()
        window.dispatchEvent(new CustomEvent(RBAC_LISTS_REFRESH_EVENT))
        navigate(`${baseNav.privilegeSet}/${row.id}`)
      } catch (e) {
        setListError(e instanceof Error ? e.message : 'Duplicate privilege set failed')
      }
    },
    [privMenuRowId, handlePrivMenuClose, navigate, reloadRbacsLists],
  )

  const showRbacRolesGrid = !isCampaign && section === 'roles'
  const showCampaignBasicSettings = isCampaign && section === 'basic-settings'
  const showCampaignChannelConfig = isCampaign && section === 'channel-config'

  useEffect(() => {
    if (section !== 'roles') closeChat()
  }, [section, closeChat])

  const campaignFooterDirtyCount = useMemo(() => {
    if (!isCampaign || !campaignEditingSection) return 0
    if (campaignEditingSection === 'basic-settings') {
      return serializeCampaignBasicForm(campaignBasicForm) ===
        serializeCampaignBasicForm(campaignBasicEditBaseline)
        ? 0
        : 1
    }
    return serializeCampaignChannelForm(campaignChannelForm) ===
      serializeCampaignChannelForm(campaignChannelEditBaseline)
      ? 0
      : 1
  }, [
    isCampaign,
    campaignEditingSection,
    campaignBasicForm,
    campaignBasicEditBaseline,
    campaignChannelForm,
    campaignChannelEditBaseline,
  ])

  const campaignDirtyVsSaved = useMemo(
    () =>
      serializeCampaignBasicForm(campaignBasicForm) !== serializeCampaignBasicForm(campaignBasicSaved) ||
      serializeCampaignChannelForm(campaignChannelForm) !== serializeCampaignChannelForm(campaignChannelSaved),
    [campaignBasicForm, campaignBasicSaved, campaignChannelForm, campaignChannelSaved],
  )
  const campaignNeedsPublish = useMemo(
    () =>
      serializeCampaignBasicForm(campaignBasicSaved) !==
        serializeCampaignBasicForm(campaignBasicPublished) ||
      serializeCampaignChannelForm(campaignChannelSaved) !==
        serializeCampaignChannelForm(campaignChannelPublished),
    [campaignBasicSaved, campaignBasicPublished, campaignChannelSaved, campaignChannelPublished],
  )

  const publishButtonState = useMemo(() => {
    if (!isCampaign) {
      return { publishDisabled: false, publishLabel: 'Publish' as string }
    }
    const publishDisabled = campaignDirtyVsSaved || !campaignNeedsPublish
    const publishLabel = campaignDirtyVsSaved
      ? 'Save changes to Publish'
      : !campaignNeedsPublish
        ? 'No changes to publish'
        : 'Publish'
    return { publishDisabled, publishLabel }
  }, [isCampaign, campaignDirtyVsSaved, campaignNeedsPublish])

  const handleCampaignHeaderMenuOpen = useCallback((event: MouseEvent<HTMLElement>) => {
    setCampaignHeaderMenuAnchor(event.currentTarget)
  }, [])

  const handleCampaignHeaderMenuClose = useCallback(() => {
    setCampaignHeaderMenuAnchor(null)
  }, [])

  const handleCampaignHeaderAction = useCallback(
    (action: 'duplicate' | 'sandbox' | 'delete') => {
      console.log(`Campaign: ${action}`)
      handleCampaignHeaderMenuClose()
    },
    [handleCampaignHeaderMenuClose],
  )

  const revertCampaignEditInFlight = useCallback(() => {
    if (campaignEditingSection === 'basic-settings') {
      setCampaignBasicForm({ ...campaignBasicEditBaseline })
    } else if (campaignEditingSection === 'channel-config') {
      setCampaignChannelForm({ ...campaignChannelEditBaseline })
    }
  }, [campaignEditingSection, campaignBasicEditBaseline, campaignChannelEditBaseline])

  const handleCampaignBeginBasicEdit = useCallback(() => {
    setCampaignBasicEditBaseline({ ...campaignBasicForm })
    setCampaignEditingSection('basic-settings')
  }, [campaignBasicForm])

  const handleCampaignBeginChannelEdit = useCallback(() => {
    setCampaignChannelEditBaseline({ ...campaignChannelForm })
    setCampaignEditingSection('channel-config')
  }, [campaignChannelForm])

  const requestCampaignSection = useCallback(
    (next: CampaignNavKey) => {
      if (section === next) return
      const hasUnsaved =
        !!campaignEditingSection &&
        campaignFooterDirtyCount > 0
      if (isCampaign && hasUnsaved) {
        setPendingCampaignNavKey(next)
        setCampaignNavDiscardOpen(true)
        return
      }
      setSection(next)
    },
    [section, campaignEditingSection, campaignFooterDirtyCount, isCampaign],
  )

  const handleCampaignNavDiscardConfirm = useCallback(() => {
    if (pendingCampaignNavKey == null) return
    revertCampaignEditInFlight()
    setCampaignEditingSection(null)
    setSection(pendingCampaignNavKey)
    setPendingCampaignNavKey(null)
    setCampaignNavDiscardOpen(false)
  }, [pendingCampaignNavKey, revertCampaignEditInFlight])

  const handleCampaignCancelFooter = useCallback(() => {
    revertCampaignEditInFlight()
    setCampaignEditingSection(null)
    setSaveFooterMenuOpen(false)
  }, [revertCampaignEditInFlight])

  const handleCampaignPersistSaveOnly = useCallback(() => {
    if (!campaignEditingSection) return
    if (campaignEditingSection === 'basic-settings') {
      const basic = { ...campaignBasicForm }
      setCampaignBasicSaved(basic)
      setCampaignBasicEditBaseline(basic)
      setCampaignSnackbarMessage('Basic settings saved')
    } else {
      const channel = { ...campaignChannelForm }
      setCampaignChannelSaved(channel)
      setCampaignChannelEditBaseline(channel)
      setCampaignSnackbarMessage('Channel configuration saved')
    }
    setSaveFooterMenuOpen(false)
    setCampaignEditingSection(null)
    setCampaignSnackbarOpen(true)
  }, [campaignEditingSection, campaignBasicForm, campaignChannelForm])

  const handleCampaignPersistSaveAndPublish = useCallback(() => {
    if (!campaignEditingSection) return
    if (campaignEditingSection === 'basic-settings') {
      const basic = { ...campaignBasicForm }
      setCampaignBasicSaved(basic)
      setCampaignBasicPublished(basic)
      setCampaignBasicEditBaseline(basic)
      setCampaignSnackbarMessage('Basic settings saved and published')
    } else {
      const channel = { ...campaignChannelForm }
      setCampaignChannelSaved(channel)
      setCampaignChannelPublished(channel)
      setCampaignChannelEditBaseline(channel)
      setCampaignSnackbarMessage('Channel configuration saved and published')
    }
    setSaveFooterMenuOpen(false)
    setCampaignEditingSection(null)
    setCampaignSnackbarOpen(true)
  }, [campaignEditingSection, campaignBasicForm, campaignChannelForm])

  const handleCampaignPublishClick = useCallback(() => {
    if (!isCampaign) return
    if (publishSpinnerActive) return
    if (publishButtonState.publishDisabled) return

    if (publishSpinnerTimeoutRef.current != null) {
      window.clearTimeout(publishSpinnerTimeoutRef.current)
    }
    setPublishSpinnerActive(true)
    publishSpinnerTimeoutRef.current = window.setTimeout(() => {
      publishSpinnerTimeoutRef.current = null
      setCampaignBasicPublished({ ...campaignBasicSaved })
      setCampaignChannelPublished({ ...campaignChannelSaved })
      setPublishSpinnerActive(false)
      setCampaignSnackbarMessage('Campaign published')
      setCampaignSnackbarOpen(true)
    }, 2000)
  }, [
    isCampaign,
    publishSpinnerActive,
    publishButtonState.publishDisabled,
    campaignBasicSaved,
    campaignChannelSaved,
  ])

  const theme = useTheme()
  const mdUp = useMediaQuery(theme.breakpoints.up('md'))
  /** Matches actual primary `Navigation` aside width (62 collapsed / 250 expanded) — not a hard-coded 250. */
  const [primaryNavRailWidthPx, setPrimaryNavRailWidthPx] = useState(SIGNAL_NAV_WIDTH_EXPANDED_PX)

  useLayoutEffect(() => {
    if (!mdUp || typeof document === 'undefined') return

    let cancelled = false

    const getAsideEl = () =>
      document.querySelector<HTMLElement>('[aria-label="navigation-bar"]')?.closest('aside') ?? null

    const apply = () => {
      if (cancelled) return
      const node = getAsideEl()
      if (!node) return
      const w = Math.round(node.getBoundingClientRect().width)
      if (w > 0) setPrimaryNavRailWidthPx(w)
    }

    let ro: ResizeObserver | null = null
    let rafId = 0

    const teardown = () => {
      ro?.disconnect()
      ro = null
      if (rafId !== 0) {
        cancelAnimationFrame(rafId)
        rafId = 0
      }
    }

    const attach = (): boolean => {
      const node = getAsideEl()
      if (!node) return false
      ro?.disconnect()
      apply()
      ro = new ResizeObserver(apply)
      ro.observe(node)
      return true
    }

    if (!attach()) {
      rafId = requestAnimationFrame(() => {
        rafId = 0
        if (!cancelled) void attach()
      })
    }

    return () => {
      cancelled = true
      teardown()
    }
  }, [mdUp])

  const hasCampaignEditFooter = isCampaign && campaignEditingSection != null

  return (
    <Box
      sx={{
        height: '100%',
        width: '100%',
        minWidth: 0,
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Paper
        elevation={0}
        sx={{
          flex: 1,
          minHeight: 0,
          width: '100%',
          minWidth: 0,
          display: 'flex',
          flexDirection: 'column',
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'divider',
          overflow: 'hidden',
          bgcolor: 'background.paper',
          pb: hasCampaignEditFooter ? 10 : 0,
        }}
      >
        {/* Full-width heading strip — hidden in admin context (sidebar handles title) */}
        <Box
          sx={{
            flexShrink: 0,
            px: 1.5,
            py: 1.5,
            borderBottom: 1,
            borderColor: 'divider',
            display: hideSecondaryNav ? 'none' : undefined,
          }}
        >
          <Stack direction="row" alignItems="flex-start" justifyContent="space-between" spacing={2}>
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="title3" component="h1">
                {isCampaign ? 'HDFC Credit Card Sales' : 'User Management'}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                {isCampaign
                  ? campaignBasicForm.campaignType.trim() || 'Campaign type'
                  : 'Select communication channel and configure channel settings'}
              </Typography>
            </Box>
            {isCampaign ? (
              <Stack direction="row" alignItems="center" spacing={1} flexShrink={0}>
                <Button
                  variant="contained"
                  color="primary"
                  size="medium"
                  disabled={publishButtonState.publishDisabled || publishSpinnerActive}
                  aria-busy={publishSpinnerActive ? 'true' : undefined}
                  onClick={handleCampaignPublishClick}
                  startIcon={
                    publishSpinnerActive ? (
                      <CircularProgress size={18} color="inherit" aria-hidden />
                    ) : undefined
                  }
                >
                  {publishSpinnerActive ? 'Publishing…' : publishButtonState.publishLabel}
                </Button>
                <IconButton
                  size="small"
                  variant="outlined"
                  aria-label="Campaign actions"
                  aria-haspopup="true"
                  aria-expanded={campaignHeaderMenuAnchor ? 'true' : undefined}
                  onClick={handleCampaignHeaderMenuOpen}
                >
                  <Icon name="dots-three-vertical" size="sm" />
                </IconButton>
                <Menu
                  anchorEl={campaignHeaderMenuAnchor}
                  open={Boolean(campaignHeaderMenuAnchor)}
                  onClose={handleCampaignHeaderMenuClose}
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                  transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                  slotProps={{ paper: { sx: { minWidth: 200 } } }}
                >
                  <MenuItem onClick={() => handleCampaignHeaderAction('duplicate')}>
                    <ListItemText primary="Duplicate" />
                  </MenuItem>
                  <MenuItem onClick={() => handleCampaignHeaderAction('sandbox')}>
                    <ListItemText primary="Run in sandbox" />
                  </MenuItem>
                  <Divider />
                  <MenuItem
                    onClick={() => handleCampaignHeaderAction('delete')}
                    sx={{ color: 'error.main' }}
                  >
                    <ListItemText
                      primary="Delete"
                      slotProps={{ primary: { sx: { color: 'error.main' } } }}
                    />
                  </MenuItem>
                </Menu>
              </Stack>
            ) : null}
          </Stack>
        </Box>

        {listError ? (
          <Box
            sx={{
              px: 2,
              py: 1.5,
              borderBottom: 1,
              borderColor: 'divider',
              bgcolor: 'action.hover',
            }}
          >
            <Typography variant="body2" color="error">
              {listError}. Start API:{' '}
              <Typography component="span" variant="body2" sx={{ fontFamily: 'monospace' }}>
                cd server && npm run dev
              </Typography>
            </Typography>
          </Box>
        ) : null}

        {/* Sidebar + main — Figma 1:20769 */}
        {/* CSS Grid (not flex row): avoids min-width:auto collapsing the main pane beside a fixed rail at md+. */}
        <Box
          sx={{
            display: 'grid',
            flex: 1,
            minHeight: 0,
            minWidth: 0,
            width: '100%',
            gridTemplateColumns: hideSecondaryNav
              ? 'minmax(0, 1fr)'
              : { xs: 'minmax(0, 1fr)', md: `${secondaryNavWidthPx}px minmax(0, 1fr)` },
            gridTemplateRows: hideSecondaryNav
              ? 'minmax(0, 1fr)'
              : { xs: 'auto minmax(0, 1fr)', md: 'minmax(0, 1fr)' },
            alignItems: 'stretch',
          }}
        >
          {/* Secondary nav — hidden when admin sidebar handles navigation */}
          <Box
            sx={(theme: Theme) => ({
              display: hideSecondaryNav ? 'none' : undefined,
              gridColumn: { xs: '1', md: '1' },
              gridRow: { xs: '1', md: '1' },
              width: '100%',
              maxWidth: { md: secondaryNavWidthPx },
              boxSizing: 'border-box',
              borderLeft: 'none',
              bgcolor: 'background.paper',
              p: 1.5,
              overflow: 'auto',
              borderBottomWidth: { xs: 1, md: 0 },
              borderBottomStyle: { xs: 'solid', md: undefined },
              borderBottomColor: { xs: theme.palette.divider, md: undefined },
              [theme.breakpoints.up('md')]: {
                borderRightWidth: '1px',
                borderRightStyle: 'solid',
                borderRightColor: theme.palette.divider,
              },
            })}
          >
            <Stack
              component="nav"
              spacing={0}
              aria-label={isCampaign ? 'Campaign sections' : 'User management sections'}
            >
              {(isCampaign ? CAMPAIGN_NAV : UM_NAV).map((item) => (
                <SecondaryNavItem
                  key={item.key}
                  title={item.title}
                  caption={item.caption}
                  selected={section === item.key}
                  onClick={() =>
                    isCampaign ? requestCampaignSection(item.key as CampaignNavKey) : setSection(item.key)
                  }
                />
              ))}
            </Stack>
          </Box>

          {/* Main column — grid area 2 (md row) / row 2 (xs stack); minmax(0,1fr) track gives stable width */}
          <Box
            component="main"
            sx={{
              gridColumn: hideSecondaryNav ? '1' : { xs: '1', md: '2' },
              gridRow: hideSecondaryNav ? '1' : { xs: '2', md: '1' },
              minWidth: 0,
              minHeight: 0,
              /**
               * `overflow: hidden` on this flex/grid child was causing runaway ResizeObserver / layout churn
               * with Signal DataGrid in some setups (tab freezes, “never loads”). Prefer `auto` here; inner
               * grid container still uses flex + minHeight:0 so the viewport scroll stays usable.
               */
              overflow: 'auto',
              display: 'flex',
              flexDirection: 'column',
              bgcolor: 'background.paper',
            }}
          >
            {showCampaignBasicSettings ? (
              <CampaignBasicSettingsPanel
                viewOnly={campaignEditingSection !== 'basic-settings'}
                form={campaignBasicForm}
                onPatch={patchCampaignBasicForm}
                onNavigateSection={
                  isCampaign
                    ? (key) => requestCampaignSection(key as CampaignNavKey)
                    : setSection
                }
                onSectionEdit={isCampaign ? handleCampaignBeginBasicEdit : undefined}
              />
            ) : showCampaignChannelConfig ? (
              <CampaignChannelConfigurationPanel
                viewOnly={campaignEditingSection !== 'channel-config'}
                form={campaignChannelForm}
                onPatch={patchCampaignChannelForm}
                channelTab={campaignChannelUiTab}
                onChannelTabChange={setCampaignChannelUiTab}
                onSectionEdit={isCampaign ? handleCampaignBeginChannelEdit : undefined}
              />
            ) : !isCampaign && section === 'users' ? (
              <UserManagementUsersPanel
                rows={userRows}
                loadError={userLoadError}
                onRetryLoad={reloadUsers}
              />
            ) : !showRbacRolesGrid ? (
              <Box sx={{ p: 2, flex: 1, overflow: 'auto' }}>
                <Typography variant="title2" gutterBottom>
                  {!isCampaign
                    ? 'Groups'
                    : (CAMPAIGN_NAV.find((item) => item.key === section)?.title ?? 'Section')}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {!isCampaign
                    ? 'Shell matches Figma — connect Groups workflows here when ready.'
                    : (() => {
                        const cap = CAMPAIGN_NAV.find((item) => item.key === section)?.caption?.trim()
                        return [cap, 'Connect this workflow when ready.']
                          .filter(Boolean)
                          .join(' ')
                      })()}
                </Typography>
              </Box>
            ) : (
              <Box
                sx={{
                  flex: '1 1 0%',
                  minHeight: 0,
                  width: '100%',
                  minWidth: 0,
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                {/* Roles / Privilege Sets — sticky tab bar above grid */}
                  <Box
                    sx={{
                      flexShrink: 0,
                      borderBottom: 1,
                      borderColor: 'divider',
                      px: 2,
                      bgcolor: 'background.paper',
                    }}
                  >
                  <Tabs
                    value={mainTab}
                    onChange={(_: SyntheticEvent, v: string | number) =>
                      setMainTab(v as 'roles' | 'privileges')}
                    aria-label="Roles and privileges"
                    sx={{
                      minHeight: 48,
                      '& .MuiTab-root': {
                        minHeight: 48,
                        textTransform: 'none',
                        fontWeight: 500,
                        fontSize: (theme: Theme) => theme.typography.pxToRem(14),
                      },
                      '& .Mui-selected': {
                        color: 'primary.main',
                      },
                    }}
                  >
                    <Tab value="roles" label="Roles" />
                    <Tab value="privileges" label="Privilege Sets" />
                  </Tabs>
                  </Box>

                {mainTab === 'privileges' ? (
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
                        flex: 1,
                        minHeight: 0,
                        width: '100%',
                        minWidth: 0,
                        display: 'flex',
                        flexDirection: 'column',
                      }}
                    >
                      <RbacDataGridPageHeader
                        title="Privilege Sets"
                        subtitle={
                          'Privilege sets determine user permissions and access within the application.'
                        }
                        primaryAction={{
                          id: 'new-privilege-set',
                          variant: 'contained',
                          children: 'New Privilege Set',
                          startIconProps: { name: 'plus', size: 'sm' },
                          onClick: () => setNewPsOpen(true),
                        }}
                        onChatWithAi={openChat}
                        showSearch
                        onBasicSearch={(s: string) => {
                          setPrivSearch(s)
                          setPrivPaginationModel((p) => ({ ...p, page: 0 }))
                        }}
                      />
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
                        <DataGrid<PrivilegeSetRow>
                          listView={false}
                          sortingMode="client"
                          checkboxSelection
                          disableRowSelectionOnClick
                          onRowClick={handlePrivilegeRowClick}
                          rows={filteredPrivilegeRows}
                          columns={privilegeColumns}
                          pagination
                          paginationModel={privPaginationModel}
                          onPaginationModelChange={setPrivPaginationModel}
                          pageSizeOptions={[10, 25]}
                          density="standard"
                          customToolbarFilters={privToolbarFilters}
                          onToolbarFiltersChange={handlePrivToolbarFiltersChange}
                          showAppliedFilters
                          maxVisibleAppliedFilters={4}
                          initialState={{
                            pinnedColumns: { right: ['actions'] },
                            sorting: {
                              sortModel: [{ field: 'privilegeSetName', sort: 'asc' }],
                            },
                          }}
                          onRefresh={() => setPrivPaginationModel((p) => ({ ...p, page: 0 }))}
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
                  </Box>
                ) : (
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
                        flex: 1,
                        minHeight: 0,
                        width: '100%',
                        minWidth: 0,
                        display: 'flex',
                        flexDirection: 'column',
                      }}
                    >
                      <RbacDataGridPageHeader
                        title="Roles"
                        subtitle="Roles define what users can see and do."
                        primaryAction={{
                          id: 'new-role',
                          variant: 'contained',
                          children: 'New Role',
                          startIconProps: { name: 'plus', size: 'sm' },
                          onClick: () => setNewRoleOpen(true),
                        }}
                        onChatWithAi={openChat}
                        showSearch
                        onBasicSearch={(s: string) => {
                          setSearch(s)
                          setPaginationModel((p) => ({ ...p, page: 0 }))
                        }}
                      />
                      <Box
                        sx={{
                          flex: 1,
                          minHeight: 0,
                          width: '100%',
                          minWidth: 0,
                          display: 'flex',
                          flexDirection: 'column',
                          /**
                           * Signal DataGrid.tsx wraps GridPro in a Box(height:100%). That inner Box must
                           * stretch horizontally or MUI X resize reports width 0 and the viewport stays blank.
                           */
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
                        {/* Default listView uses viewport < sm; rail + padding often keeps main column < 600px */}
                        <DataGrid<UserManagementRoleRow>
                          listView={false}
                          sortingMode="client"
                          checkboxSelection
                          disableRowSelectionOnClick
                          onRowClick={handleRoleRowClick}
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
                              sortModel: [{ field: 'roleName', sort: 'asc' }],
                            },
                          }}
                          onRefresh={() => setPaginationModel((p) => ({ ...p, page: 0 }))}
                          sx={{
                            ...dataGridSx,
                            /** Defensive: virtualizer can shrink to ~0 wide if flex basis collapses; MUI warns + table is invisible */
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
                  </Box>
                )}
              </Box>
            )}
          </Box>
        </Box>

        <Menu
          anchorEl={menuAnchorEl}
          open={Boolean(menuAnchorEl)}
          onClose={handleMenuClose}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          slotProps={{ paper: { sx: { minWidth: 200 } } }}
        >
          <MenuItem onClick={() => void handleMenuAction('view')}>
            <ListItemIcon>
              <Icon name="list-bullets" size="sm" />
            </ListItemIcon>
            <ListItemText primary="View details" />
          </MenuItem>
          <MenuItem onClick={() => void handleMenuAction('edit')}>
            <ListItemIcon>
              <Icon name="pencil-simple-line" size="sm" />
            </ListItemIcon>
            <ListItemText primary="Edit" />
          </MenuItem>
          <MenuItem onClick={() => void handleMenuAction('duplicate')}>
            <ListItemIcon>
              <Icon name="copy-simple" size="sm" />
            </ListItemIcon>
            <ListItemText primary="Duplicate" />
          </MenuItem>
          <Divider />
          <MenuItem onClick={() => void handleMenuAction('delete')} sx={{ color: 'error.main' }}>
            <ListItemIcon sx={{ color: 'inherit' }}>
              <Icon name="trash-simple" size="sm" />
            </ListItemIcon>
            <ListItemText primary="Delete" slotProps={{ primary: { sx: { color: 'error.main' } } }} />
          </MenuItem>
        </Menu>

        <Menu
          anchorEl={privMenuAnchorEl}
          open={Boolean(privMenuAnchorEl)}
          onClose={handlePrivMenuClose}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          slotProps={{ paper: { sx: { minWidth: 200 } } }}
        >
          <MenuItem onClick={() => void handlePrivMenuAction('view')}>
            <ListItemIcon>
              <Icon name="list-bullets" size="sm" />
            </ListItemIcon>
            <ListItemText primary="View details" />
          </MenuItem>
          <MenuItem onClick={() => void handlePrivMenuAction('edit')}>
            <ListItemIcon>
              <Icon name="pencil-simple-line" size="sm" />
            </ListItemIcon>
            <ListItemText primary="Edit" />
          </MenuItem>
          <MenuItem onClick={() => void handlePrivMenuAction('duplicate')}>
            <ListItemIcon>
              <Icon name="copy-simple" size="sm" />
            </ListItemIcon>
            <ListItemText primary="Duplicate" />
          </MenuItem>
          <Divider />
          <MenuItem onClick={() => void handlePrivMenuAction('delete')} sx={{ color: 'error.main' }}>
            <ListItemIcon sx={{ color: 'inherit' }}>
              <Icon name="trash-simple" size="sm" />
            </ListItemIcon>
            <ListItemText primary="Delete" slotProps={{ primary: { sx: { color: 'error.main' } } }} />
          </MenuItem>
        </Menu>

        {(newRoleOpen || newPsOpen) && (
          <Box
            sx={{
              position: 'fixed',
              inset: 0,
              zIndex: (theme: Theme) => theme.zIndex.modal,
              bgcolor: 'rgba(0,0,0,0.45)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              p: 2,
            }}
            onClick={() => {
              setNewRoleOpen(false)
              setNewPsOpen(false)
            }}
          >
            <Paper
              elevation={8}
              sx={{ p: 3, maxWidth: 440, width: '100%', borderRadius: 2 }}
              onClick={(e: MouseEvent<HTMLElement>) => e.stopPropagation()}
            >
              {newRoleOpen ? (
                <Stack spacing={2}>
                  <Typography variant="title3">New role</Typography>
                  <EnhancedTextField
                    label="Role name"
                    placeholder={NEW_ROLE_MODAL_NAME_PLACEHOLDER}
                    value={newRoleName}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setNewRoleName(e.target.value)}
                    fullWidth
                    size="medium"
                    autoFocus
                  />
                  <EnhancedTextField
                    label="Description"
                    placeholder={NEW_ROLE_MODAL_DESC_PLACEHOLDER}
                    value={newRoleDesc}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setNewRoleDesc(e.target.value)}
                    fullWidth
                    multiline
                    minRows={2}
                    size="medium"
                  />
                  <Stack direction="row" spacing={1} justifyContent="flex-end">
                    <Button variant="outlined" color="neutral" onClick={() => setNewRoleOpen(false)}>
                      Cancel
                    </Button>
                    <Button variant="contained" color="primary" onClick={() => void submitNewRole()}>
                      Create
                    </Button>
                  </Stack>
                </Stack>
              ) : (
                <Stack spacing={2}>
                  <Typography variant="title3">New privilege set</Typography>
                  <EnhancedTextField
                    label="Privilege set name"
                    placeholder={NEW_PS_MODAL_NAME_PLACEHOLDER}
                    value={newPsName}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setNewPsName(e.target.value)}
                    fullWidth
                    size="medium"
                    autoFocus
                  />
                  <EnhancedTextField
                    label="Description"
                    placeholder={NEW_PS_MODAL_DESC_PLACEHOLDER}
                    value={newPsDesc}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setNewPsDesc(e.target.value)}
                    fullWidth
                    multiline
                    minRows={2}
                    size="medium"
                  />
                  <Stack direction="row" spacing={1} justifyContent="flex-end">
                    <Button variant="outlined" color="neutral" onClick={() => setNewPsOpen(false)}>
                      Cancel
                    </Button>
                    <Button variant="contained" color="primary" onClick={() => void submitNewPrivilegeSet()}>
                      Create
                    </Button>
                  </Stack>
                </Stack>
              )}
            </Paper>
          </Box>
        )}
      </Paper>

      <Slide in={hasCampaignEditFooter} direction="up" mountOnEnter unmountOnExit>
        <Box
          sx={(theme: Theme) => ({
            position: 'fixed',
            bottom: 0,
            right: 0,
            /** Edge-to-edge in the outlet column — `primaryNavRailWidthPx` tracks collapsed (62px) vs expanded (250px) rail. */
            left: mdUp ? `${primaryNavRailWidthPx}px` : 0,
            zIndex: theme.zIndex.drawer,
            /** Match Signal `Drawer` footer strip (`Drawer.tsx`: spacer + grouped actions, gap spacing(2)). */
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-start',
            flexShrink: 0,
            minHeight: 64,
            px: theme.spacing(2),
            py: theme.spacing(1),
            borderTop: '1px solid',
            borderColor: 'divider',
            bgcolor: 'background.paper',
            boxSizing: 'border-box',
          })}
        >
          <Box sx={{ flex: '1 1 auto', minWidth: 0 }} />
          <Stack direction="row" alignItems="center" spacing={2}>
            <DirtyPulseLabel count={campaignFooterDirtyCount} />
            <Stack direction="row" alignItems="center" spacing={1}>
              <Button
                variant="outlined"
                color="neutral"
                size="medium"
                onClick={handleCampaignCancelFooter}
                sx={{ height: 40, py: 0, boxSizing: 'border-box' }}
              >
                Cancel
              </Button>
              <Box
                ref={splitSaveFooterRef}
                sx={(theme: Theme) => {
                  /** Split primary: same corner join as Contacts; height defers to `size="medium"` (matches Cancel). */
                  const r = theme.spacing(1)
                  const splitLine = alpha(theme.palette.primary.contrastText, 0.28)
                  return {
                    flexShrink: 0,
                    position: 'relative',
                    display: 'inline-flex',
                    alignItems: 'stretch',
                    borderRadius: r,
                    overflow: 'hidden',
                    '& .MuiButton-root': {
                      margin: 0,
                      borderRadius: 0,
                    },
                    '& .split-main': {
                      borderRight: `1px solid ${splitLine}`,
                      px: theme.spacing(2),
                    },
                    '& .split-menu': {
                      minWidth: 40,
                      px: theme.spacing(1),
                    },
                  }
                }}
              >
                <Button
                  type="button"
                  variant="contained"
                  color="primary"
                  size="medium"
                  disableElevation
                  className="split-main"
                  disabled={campaignFooterDirtyCount === 0}
                  sx={{
                    height: 40,
                    py: 0,
                    boxSizing: 'border-box',
                    borderTopLeftRadius: (t: Theme) => `${t.spacing(1)}`,
                    borderBottomLeftRadius: (t: Theme) => `${t.spacing(1)}`,
                  }}
                  onClick={() => {
                    setSaveFooterMenuOpen(false)
                    void handleCampaignPersistSaveOnly()
                  }}
                >
                  Save
                </Button>
                <Button
                  type="button"
                  variant="contained"
                  color="primary"
                  size="medium"
                  disableElevation
                  className="split-menu"
                  aria-label="Save options"
                  aria-haspopup="true"
                  aria-expanded={saveFooterMenuOpen ? 'true' : undefined}
                  disabled={campaignFooterDirtyCount === 0}
                  sx={{
                    height: 40,
                    py: 0,
                    boxSizing: 'border-box',
                    borderTopRightRadius: (t: Theme) => `${t.spacing(1)}`,
                    borderBottomRightRadius: (t: Theme) => `${t.spacing(1)}`,
                  }}
                  onClick={() => setSaveFooterMenuOpen((o) => !o)}
                >
                  <Icon name="caret-down" size="sm" sx={{ display: 'block', color: 'inherit' }} aria-hidden />
                </Button>
              </Box>
              <Popper
                open={saveFooterMenuOpen}
                anchorEl={splitSaveFooterRef.current}
                placement="top-end"
                sx={{ zIndex: (t: Theme) => t.zIndex.modal }}
              >
                <ClickAwayListener onClickAway={() => setSaveFooterMenuOpen(false)}>
                  <Paper elevation={8} sx={{ mb: 0.5, minWidth: 200 }}>
                    <MenuList dense autoFocusItem={saveFooterMenuOpen}>
                      <MenuItem
                        onClick={() => {
                          setSaveFooterMenuOpen(false)
                          handleCampaignPersistSaveOnly()
                        }}
                      >
                        Save
                      </MenuItem>
                      <MenuItem
                        onClick={() => {
                          setSaveFooterMenuOpen(false)
                          handleCampaignPersistSaveAndPublish()
                        }}
                      >
                        Save and Publish
                      </MenuItem>
                    </MenuList>
                  </Paper>
                </ClickAwayListener>
              </Popper>
            </Stack>
          </Stack>
        </Box>
      </Slide>

      {isCampaign ? (
        <>
          <DiscardChangesDialog
            open={campaignNavDiscardOpen}
            onKeepEditing={() => {
              setCampaignNavDiscardOpen(false)
              setPendingCampaignNavKey(null)
            }}
            onDiscard={handleCampaignNavDiscardConfirm}
          />
          <Snackbar
          open={campaignSnackbarOpen}
          autoHideDuration={5000}
          onClose={(_e, reason) => {
            if (reason === 'clickaway') return
            setCampaignSnackbarOpen(false)
          }}
          message={campaignSnackbarMessage}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        />
        </>
      ) : null}
    </Box>
  )
}
