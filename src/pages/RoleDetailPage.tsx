/**
 * Role detail — layout aligned with Figma 80:17623 (hero strip + Basic Details, Assigned Users, Privilege Sets).
 */
import {
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
  type MouseEvent as ReactMouseEvent,
} from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import MenuItem from '@mui/material/MenuItem'
import Slide from '@mui/material/Slide'
import type { SlideProps } from '@mui/material/Slide'
import Snackbar from '@mui/material/Snackbar'
import Alert from '@mui/material/Alert'
import { avatarFillFromHue } from '../utils/avatarSurface'
import type { Theme } from '@mui/material/styles'
import {
  Avatar,
  Box,
  Button,
  Chip,
  Divider,
  EnhancedTextField,
  Icon,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  Paper,
  Stack,
  stringToColor,
  Typography,
  getInitials,
} from '@exotel-npm-dev/signal-design-system'
import { ManageUsersDrawer } from '../components/roleDetail/ManageUsersDrawer'
import { DetailPageLoadingSkeleton } from '../components/rbac/DetailPageLoadingSkeleton'
import { ManagePrivilegeSetsDrawer } from '../components/roleDetail/ManagePrivilegeSetsDrawer'
import {
  ChipExpandSection,
  ViewModeDisabledWrap,
  SECTION_ROW_LAYOUT,
  SECTION_ASIDE_BOX,
  SECTION_CONTENT_STACK,
  SEARCH_ROW_TEXTFIELD_SX,
} from '../components/roleDetail/ChipExpandSection'
import {
  fetchRoleDetail,
  fetchPrivilegeSets,
  patchRole,
  patchRolePrivilegeSetIds,
  patchRoleUsers,
  type RoleDetailApiResponse,
} from '../api/rbacApi'
import { ROLE_DETAIL_COLLAPSED_CHIP_CAP } from '../data/roleDetailData'
import type { PrivilegeSetRow } from '../data/privilegeSets'
import type { UserManagementRoleRow } from '../data/userManagementRoles'

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

/** Figma 80:17847 chip: outlined surface, avatar + label (matches DS chip + outlined, not reliant on MUI Chip quirks). */
function AssignedUserChip({ name }: { name: string }) {
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

function RoleTypeChip({
  scopeType,
}: {
  scopeType: UserManagementRoleRow['scopeType']
}) {
  if (scopeType === 'default') {
    return <Chip size="small" label="Default" variant="tonal" color="default" />
  }
  return <Chip size="small" label="Custom" variant="tonal" color="info" />
}

function roleDetailSaveSnackbarSlide(props: SlideProps) {
  return <Slide {...props} direction="up" />
}

function ChipExpandPrivileges({
  privilegeSets,
  search,
  searchPlaceholder,
  editMode,
  expanded,
  onToggleExpand,
  onSearchChange,
  onManagePrivilege,
}: {
  privilegeSets: string[]
  search: string
  searchPlaceholder: string
  editMode: boolean
  expanded: boolean
  onToggleExpand: () => void
  onSearchChange: (v: string) => void
  onManagePrivilege: () => void
}) {
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return privilegeSets.map((label) => ({ label, keyStr: label }))
    return privilegeSets
      .filter((p) => p.toLowerCase().includes(q))
      .map((label) => ({ label, keyStr: label }))
  }, [privilegeSets, search])

  const truncated = filtered.length > ROLE_DETAIL_COLLAPSED_CHIP_CAP
  const displayItems =
    expanded || !truncated ? filtered : filtered.slice(0, ROLE_DETAIL_COLLAPSED_CHIP_CAP)
  const remainder = truncated && !expanded ? filtered.length - ROLE_DETAIL_COLLAPSED_CHIP_CAP : 0
  const showExpandControl = truncated

  return (
    <>
      <Box sx={SECTION_ROW_LAYOUT}>
        <Box sx={SECTION_ASIDE_BOX}>
          <Typography variant="title3" component="h2">
            Assign Privilege Set
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75 }}>
            Manage the permission groups that determine what this role can access and perform
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
                onClick={onManagePrivilege}
                sx={{
                  flexShrink: 0,
                  alignSelf: { xs: 'stretch', sm: 'center' },
                  minHeight: 40,
                  boxSizing: 'border-box',
                }}
              >
                Manage
              </Button>
            </ViewModeDisabledWrap>
          </Stack>

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center' }}>
            {displayItems.map(({ label, keyStr }) => (
              <Chip key={keyStr} size="small" label={label} variant="tonal" color="default" />
            ))}
            {remainder > 0 ? (
              <Chip size="small" variant="filled" label={`+${remainder}`} color="default" />
            ) : null}
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
                    {expanded ? 'Collapse all' : 'View all privileges'}
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
    </>
  )
}

export type RoleDetailPageProps = {
  /** When set (e.g. RBAC UI Impact pattern), load this role instead of URL `:roleId`. */
  roleIdOverride?: string
  /** Back navigation target; defaults to User Management. */
  backToPath?: string
}

export function RoleDetailPage({
  roleIdOverride,
  backToPath,
}: RoleDetailPageProps = {}) {
  const { roleId: roleIdParam } = useParams<{ roleId: string }>()
  const roleId = roleIdOverride ?? roleIdParam
  const navigate = useNavigate()

  const [loading, setLoading] = useState(true)
  const [pageError, setPageError] = useState<string | null>(null)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [detail, setDetail] = useState<RoleDetailApiResponse | null>(null)

  useEffect(() => {
    if (!roleId) return
    let cancelled = false
    ;(async () => {
      setLoading(true)
      setPageError(null)
      try {
        const d = await fetchRoleDetail(roleId)
        if (!cancelled) setDetail(d)
      } catch (e) {
        if (cancelled) return
        const msg = e instanceof Error ? e.message : String(e)
        if (/role not found/i.test(msg)) {
          navigate(backToPath ?? '/closed-interaction/user-management', { replace: true })
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
  }, [roleId, navigate, backToPath])

  const row = detail?.row
  const extra = detail
    ? { assignedUsers: detail.assignedUsers, privilegeSets: detail.privilegeSets }
    : null

  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null)
  const [editMode, setEditMode] = useState(false)

  const [draftName, setDraftName] = useState('')
  const [draftDescription, setDraftDescription] = useState('')
  useEffect(() => {
    if (!row) return
    setDraftName(row.roleName)
    setDraftDescription(row.description)
  }, [row])

  const [usersSearch, setUsersSearch] = useState('')
  const [privSearch, setPrivSearch] = useState('')
  const [usersExpanded, setUsersExpanded] = useState(false)
  const [privExpanded, setPrivExpanded] = useState(false)

  const [manageUsersDrawer, setManageUsersDrawer] = useState(false)
  const [managePrivilegeDrawer, setManagePrivilegeDrawer] = useState(false)
  const [allPrivilegeSets, setAllPrivilegeSets] = useState<PrivilegeSetRow[]>([])
  const [roleSavedSnackbarOpen, setRoleSavedSnackbarOpen] = useState(false)

  useEffect(() => {
    fetchPrivilegeSets()
      .then(setAllPrivilegeSets)
      .catch(() => {})
  }, [])

  useEffect(() => {
    setEditMode(false)
    setUsersExpanded(false)
    setPrivExpanded(false)
    setUsersSearch('')
    setPrivSearch('')
    setManageUsersDrawer(false)
    setManagePrivilegeDrawer(false)
    setSaveError(null)
  }, [roleId])

  const handleBack = () => navigate(backToPath ?? '/closed-interaction/user-management')

  const exitEditRevertDrafts = () => {
    if (!row) return
    setDraftName(row.roleName)
    setDraftDescription(row.description)
  }

  const handleCancelEdit = () => {
    setEditMode(false)
    exitEditRevertDrafts()
  }

  const handleSaveEdit = async () => {
    if (!roleId || !row) return
    try {
      await patchRole(roleId, { roleName: draftName, description: draftDescription })
      setDetail((prev) =>
        prev
          ? {
              ...prev,
              row: {
                ...prev.row,
                roleName: draftName,
                description: draftDescription,
              },
            }
          : null,
      )
      setEditMode(false)
      setRoleSavedSnackbarOpen(true)
      setSaveError(null)
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : 'Save failed')
    }
  }

  const handleDuplicate = () => {
    console.log('duplicate role', roleId)
    setMenuAnchorEl(null)
  }

  const openMenu = (e: ReactMouseEvent<HTMLElement>) => setMenuAnchorEl(e.currentTarget)
  const closeMenu = () => setMenuAnchorEl(null)

  const effectiveAssignedUsers = detail?.assignedUsers ?? []
  const filteredUsers = useMemo(() => {
    const q = usersSearch.trim().toLowerCase()
    const list = effectiveAssignedUsers
    if (!q) return list.map((label) => ({ label, keyStr: label }))
    return list
      .filter((u) => u.toLowerCase().includes(q))
      .map((label) => ({ label, keyStr: label }))
  }, [effectiveAssignedUsers, usersSearch])

  const handlePrivilegeSetsSave = async (ids: string[]) => {
    if (!roleId) throw new Error('Missing role')
    await patchRolePrivilegeSetIds(roleId, ids)
    const fresh = await fetchRoleDetail(roleId)
    setDetail(fresh)
    setSaveError(null)
  }

  if (!roleId) {
    return <Navigate to={backToPath ?? '/closed-interaction/user-management'} replace />
  }

  if (loading) {
    return <DetailPageLoadingSkeleton />
  }

  if (pageError || !row || !extra || !detail) {
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
          <Typography color="error">{pageError ?? 'Could not load this role.'}</Typography>
          <Typography variant="body2" color="text.secondary">
            Start the API in another terminal: <code>cd server && npm run dev</code>
          </Typography>
        </Stack>
      </Box>
    )
  }

  const handleManageUsersSave = async (names: string[]) => {
    try {
      await patchRoleUsers(row.id, names)
      const fresh = await fetchRoleDetail(roleId!)
      setDetail(fresh)
      setSaveError(null)
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Could not update users'
      setSaveError(msg)
      throw e instanceof Error ? e : new Error(msg)
    }
  }

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
        {/* Hero strip */}
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
                  {editMode ? draftName : row.roleName}
                </Typography>
                <RoleTypeChip scopeType={row.scopeType} />
              </Stack>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                {editMode ? draftDescription : row.description}
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
                onClick={() => setEditMode(true)}
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
            <Menu anchorEl={menuAnchorEl} open={Boolean(menuAnchorEl)} onClose={closeMenu}>
              <MenuItem onClick={handleDuplicate}>
                <ListItemIcon>
                  <Icon name="copy-simple" size="sm" />
                </ListItemIcon>
                <ListItemText primary="Duplicate" />
              </MenuItem>
            </Menu>
          </Stack>
        </Stack>

        <Box sx={{ px: 2, pb: 2, flex: 1, minHeight: 0, overflow: 'auto' }}>
          {saveError ? (
            <Alert
              severity="error"
              onClose={() => setSaveError(null)}
              sx={{ mb: 2 }}
            >
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
                Set the role&apos;s name and provide a brief description
              </Typography>
            </Box>
            <Stack spacing={2} sx={SECTION_CONTENT_STACK}>
              <ViewModeDisabledWrap
                viewOnly={!editMode}
                wrapperSx={{ display: 'block', width: '100%' }}
              >
                <EnhancedTextField
                  label="Role Name"
                  value={editMode ? draftName : row.roleName}
                  disabled={!editMode}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setDraftName(e.target.value)}
                  fullWidth
                  size="medium"
                />
              </ViewModeDisabledWrap>
              <ViewModeDisabledWrap
                viewOnly={!editMode}
                wrapperSx={{ display: 'block', width: '100%' }}
              >
                <EnhancedTextField
                  label="Role Description"
                  value={editMode ? draftDescription : row.description}
                  disabled={!editMode}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setDraftDescription(e.target.value)
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
            title="Assigned Users"
            description="View, assign, and manage the users associated with this role"
            searchPlaceholder="Search by User name"
            search={usersSearch}
            onSearchChange={setUsersSearch}
            manageLabel="Manage"
            onManage={() => {
              if (editMode) setManageUsersDrawer(true)
            }}
            filteredItems={filteredUsers}
            collapsedCap={ROLE_DETAIL_COLLAPSED_CHIP_CAP}
            expanded={usersExpanded}
            onToggleExpand={() => setUsersExpanded((v) => !v)}
            renderChip={(item) => <AssignedUserChip name={item.label} />}
            collapseExpandLabelCollapsed="View all users"
            editMode={editMode}
          />

          <ChipExpandPrivileges
            privilegeSets={extra.privilegeSets}
            search={privSearch}
            searchPlaceholder="Search by privilege set name"
            editMode={editMode}
            expanded={privExpanded}
            onToggleExpand={() => setPrivExpanded((v) => !v)}
            onSearchChange={setPrivSearch}
            onManagePrivilege={() => {
              if (editMode) setManagePrivilegeDrawer(true)
            }}
          />
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

      <ManageUsersDrawer
        open={manageUsersDrawer}
        onClose={() => setManageUsersDrawer(false)}
        roleDisplayName={row.roleName}
        roleNameUppercase={row.roleName.toUpperCase()}
        assignedNames={effectiveAssignedUsers}
        onSave={handleManageUsersSave}
      />

      <ManagePrivilegeSetsDrawer
        open={managePrivilegeDrawer}
        onClose={() => setManagePrivilegeDrawer(false)}
        privilegeSets={allPrivilegeSets}
        assignedPrivilegeSetIds={detail.privilegeSetIds}
        onSave={async (ids) => {
          try {
            await handlePrivilegeSetsSave(ids)
          } catch (e) {
            const msg = e instanceof Error ? e.message : 'Could not save privilege sets'
            setSaveError(msg)
            throw e instanceof Error ? e : new Error(msg)
          }
        }}
      />

      <Snackbar
        open={roleSavedSnackbarOpen}
        autoHideDuration={5500}
        TransitionComponent={roleDetailSaveSnackbarSlide}
        onClose={() => setRoleSavedSnackbarOpen(false)}
        message="Role updated"
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      />
    </Box>
  )
}
