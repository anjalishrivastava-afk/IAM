/**
 * Manage Privilege Sets Drawer — Permissions toggle UI.
 * Drawer shell matches ManageUsersDrawer exactly.
 * Body: search → accordions per group → per-permission Switch rows.
 */
import {
  useCallback,
  useEffect,
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
  Divider,
  Drawer,
  EnhancedTextField,
  Icon,
  IconButton,
  Stack,
  Switch,
  Tooltip,
  Typography,
} from '@exotel-npm-dev/signal-design-system'
import type { PrivilegeSetRow } from '../../data/privilegeSets'

const HEADER_BG = '#f1f1f1'
const DRAWER_WIDTH_PX = 726

// ─── Permission catalogue ─────────────────────────────────────────────────────

const PERMISSION_GROUPS = [
  {
    id: 'user_management',
    label: 'User Management',
    permissions: [
      { id: 'view_users',   name: 'View Users',   description: 'View user profiles and details'  },
      { id: 'manage_users', name: 'Manage Users', description: 'Create, edit, and delete users'  },
      { id: 'invite_users', name: 'Invite Users', description: 'Send user invitations'           },
    ],
  },
  {
    id: 'role_management',
    label: 'Role Management',
    permissions: [
      { id: 'view_roles',   name: 'View Roles',   description: 'View roles and permissions'      },
      { id: 'manage_roles', name: 'Manage Roles', description: 'Create and modify custom roles'  },
    ],
  },
  {
    id: 'product_management',
    label: 'Product Management',
    permissions: [
      { id: 'view_products',   name: 'View Products',   description: 'Access product information'    },
      { id: 'manage_products', name: 'Manage Products', description: 'Create and configure products' },
    ],
  },
  {
    id: 'security_settings',
    label: 'Security & Settings',
    permissions: [
      { id: 'org_settings',    name: 'Organization Settings', description: 'Modify organization settings' },
      { id: 'view_audit_logs', name: 'View Audit Logs',       description: 'Access security audit logs'   },
      { id: 'manage_api_keys', name: 'Manage API Keys',       description: 'Create and manage API keys'   },
    ],
  },
]

const ROLE_DEFAULT_PERMISSIONS: Record<string, string[]> = {
  Admin:   ['org_settings'],
  Manager: ['view_users', 'manage_users', 'invite_users', 'view_roles', 'manage_roles', 'view_products', 'manage_products', 'org_settings', 'view_audit_logs', 'manage_api_keys'],
  Member:  ['view_products'],
  Auditor: ['view_audit_logs'],
}

function defaultForRole(roleName: string | undefined): Set<string> {
  if (!roleName) return new Set()
  return new Set(ROLE_DEFAULT_PERMISSIONS[roleName] ?? [])
}

// ─── Props ────────────────────────────────────────────────────────────────────

export interface ManagePrivilegeSetsDrawerProps {
  open: boolean
  onClose: (event?: SyntheticEvent) => void
  assignedPrivilegeSetIds: string[]
  onSave?: (privilegeSetIds: string[]) => void | Promise<void>
  roleName?: string
  privilegeSets?: PrivilegeSetRow[]
}

function snackbarSlideUp(props: SlideProps) { return <Slide {...props} direction="up" /> }

// ─── Component ───────────────────────────────────────────────────────────────

export function ManagePrivilegeSetsDrawer({
  open, onClose, onSave, roleName,
}: ManagePrivilegeSetsDrawerProps) {
  const [enabledPerms, setEnabledPerms] = useState<Set<string>>(() => defaultForRole(roleName))
  const [committedPerms, setCommittedPerms] = useState<Set<string>>(() => defaultForRole(roleName))
  const [savePending, setSavePending] = useState(false)
  const [snackbarOpen, setSnackbarOpen] = useState(false)
  const [snackbarMessage, setSnackbarMessage] = useState('')
  const [search, setSearch] = useState('')
  // Track which accordion groups are expanded
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(
    () => new Set(PERMISSION_GROUPS.map((g) => g.id))
  )

  useEffect(() => {
    if (!open) return
    const defaults = defaultForRole(roleName)
    setEnabledPerms(new Set(defaults))
    setCommittedPerms(new Set(defaults))
    setSearch('')
    setExpandedGroups(new Set(PERMISSION_GROUPS.map((g) => g.id)))
  }, [open, roleName])

  const totalChanges = (() => {
    let n = 0
    for (const id of enabledPerms) if (!committedPerms.has(id)) n++
    for (const id of committedPerms) if (!enabledPerms.has(id)) n++
    return n
  })()

  const dismissPlain = useCallback((e?: SyntheticEvent | ReactMouseEvent) => {
    onClose(e as SyntheticEvent | undefined)
  }, [onClose])

  const togglePermission = (id: string) => {
    setEnabledPerms((prev) => {
      const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next
    })
  }

  const toggleGroup = (groupId: string, enable: boolean) => {
    const group = PERMISSION_GROUPS.find((g) => g.id === groupId)
    if (!group) return
    setEnabledPerms((prev) => {
      const next = new Set(prev)
      group.permissions.forEach((p) => enable ? next.add(p.id) : next.delete(p.id))
      return next
    })
  }

  const handleSave = useCallback(async () => {
    if (savePending) return
    setSavePending(true)
    try {
      await Promise.resolve(onSave?.([...enabledPerms]))
      setCommittedPerms(new Set(enabledPerms))
      dismissPlain()
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Could not save permissions'
      setSnackbarMessage(msg); setSnackbarOpen(true)
    } finally {
      setSavePending(false) }
  }, [enabledPerms, onSave, savePending, dismissPlain])

  const roleNameUpper = (roleName ?? '').toUpperCase()
  const q = search.trim().toLowerCase()

  // Filter groups/permissions by search
  const visibleGroups = PERMISSION_GROUPS.map((group) => ({
    ...group,
    permissions: q
      ? group.permissions.filter(
          (p) => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)
        )
      : group.permissions,
  })).filter((g) => g.permissions.length > 0)

  return (
    <>
      <Drawer
        anchor="right"
        open={open}
        onClose={(e?: SyntheticEvent) => dismissPlain(e)}
        slotProps={{
          backdrop: {
            sx: (theme: Theme) => ({
              backdropFilter: 'blur(1.50px)', WebkitBackdropFilter: 'blur(1.50px)',
              backgroundColor: theme.palette.mode === 'light' ? 'rgba(15, 23, 42, 0.18)' : 'rgba(0, 0, 0, 0.48)',
            }),
          },
          paper: {
            sx: {
              width: { xs: '100%', sm: `${DRAWER_WIDTH_PX}px` },
              maxWidth: '100vw', boxSizing: 'border-box',
              boxShadow: '0px 6px 10px rgba(0, 0, 0, 0.14), 0px 1px 18px rgba(0, 0, 0, 0.12)',
            },
          },
        }}
        headerContent={
          /* ── Drawer header (matches ManageUsersDrawer exactly) ── */
          <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', px: 2, py: '13px', bgcolor: HEADER_BG, borderBottom: 1, borderColor: 'divider' }}>
            <Stack spacing={0.25} sx={{ minWidth: 0, flex: 1 }}>
              <Typography variant="body3" color="text.secondary" component="p" sx={{ letterSpacing: 0.28, textTransform: 'uppercase', fontWeight: 600 }}>
                {roleNameUpper || 'ROLE'}
              </Typography>
              <Typography variant="title3" component="h2" sx={{ fontWeight: 700, lineHeight: 1.25 }}>
                Permissions
              </Typography>
            </Stack>
            <IconButton size="small" variant="outlined" aria-label="Close" onClick={(e: ReactMouseEvent) => dismissPlain(e)}>
              <Icon name="x" size="sm" />
            </IconButton>
          </Box>
        }
      >
        {/*
         * Outer wrapper negates the Drawer body's built-in padding (spacing 3,2 = 24px 16px)
         * so we can split the area into a scrollable content zone + a truly fixed footer.
         * height = calc(100% + 48px) restores full body height after the negative vertical margins.
         */}
        <Box
          sx={{
            mt: -3, mr: -2, mb: -3, ml: -2,
            height: 'calc(100% + 48px)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          {/* ── Scrollable content ───────────────────────────────────── */}
          <Box sx={{ flex: 1, overflowY: 'auto' }}>

            {/* Role summary */}
            <Box sx={{ px: 2, pt: 2, pb: 1.5 }}>
              <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
                <Typography sx={{ fontWeight: 700, fontSize: 15 }}>{roleName ?? '—'}</Typography>
                <Typography
                  variant="caption"
                  sx={{ px: 1, py: 0.25, borderRadius: 10, bgcolor: 'action.hover', color: 'text.secondary', fontWeight: 600 }}
                >
                  {roleName ? (ROLE_DEFAULT_PERMISSIONS[roleName] !== undefined ? 'system' : 'custom') : ''}
                </Typography>
              </Stack>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 0.75 }}>
                {roleName === 'Admin'   ? 'Manage users, roles, and organization settings' :
                 roleName === 'Manager' ? 'Manage team members and product resources' :
                 roleName === 'Member'  ? 'Basic access to assigned products' :
                 roleName === 'Auditor' ? 'Read-only access to audit logs and reports' : ''}
              </Typography>
              <Stack direction="row" alignItems="center" spacing={0.75}>
                <Box sx={{ color: 'text.disabled', display: 'flex' }}><Icon name="users" size="sm" /></Box>
                <Typography variant="caption" color="text.secondary">
                  {roleName === 'Admin' ? 5 : roleName === 'Manager' ? 12 : roleName === 'Member' ? 45 : 3} users with this role
                </Typography>
              </Stack>
            </Box>

            {/* Search bar */}
            <Box sx={{ px: 2, pt: 0.5, pb: 1.5, bgcolor: 'surface.elevation1' }}>
              <EnhancedTextField
                showLabel={false}
                placeholder="Search permissions"
                value={search}
                size="medium"
                fullWidth
                onChange={(e: ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
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

            {/* Permission accordions */}
            <Stack spacing={1.5} sx={{ px: 2, pt: 2, pb: 2 }}>
              {visibleGroups.map((group) => {
            const isExpanded = expandedGroups.has(group.id) || !!q
            const allEnabled = group.permissions.every((p) => enabledPerms.has(p.id))

            return (
              <Accordion
                key={group.id}
                disableGutters
                elevation={0}
                expanded={isExpanded}
                onChange={() => {
                  if (q) return // keep all open while searching
                  setExpandedGroups((prev) => {
                    const next = new Set(prev)
                    isExpanded ? next.delete(group.id) : next.add(group.id)
                    return next
                  })
                }}
                TransitionProps={{ unmountOnExit: true }}
                sx={{
                  bgcolor: 'background.paper',
                  border: '1px solid', borderColor: 'divider',
                  borderRadius: '8px !important',
                  '&:before': { display: 'none' },
                  overflow: 'hidden',
                }}
              >
                <AccordionSummary
                  expandIcon={<Icon name="caret-down" size="sm" />}
                  sx={{
                    minHeight: 48, px: 2,
                    bgcolor: 'background.paper',
                    '&.Mui-expanded': { minHeight: 48 },
                    alignItems: 'center',
                    '& .MuiAccordionSummary-content': { alignItems: 'center', gap: 1, overflow: 'hidden', mr: 1, flex: 1, margin: 0, '&.Mui-expanded': { margin: 0 } },
                    '& .MuiAccordionSummary-expandIconWrapper': { display: 'flex', alignItems: 'center', justifyContent: 'center', alignSelf: 'stretch' },
                  }}
                >
                  <Typography sx={{ fontWeight: 600, fontSize: 13, flex: 1 }}>
                    {group.label}
                  </Typography>

                  {/* Group-level select/deselect button — only visible when expanded */}
                  {isExpanded && (
                    <Button
                      variant="outlined"
                      color="neutral"
                      size="small"
                      onClick={(e: ReactMouseEvent) => { e.stopPropagation(); toggleGroup(group.id, !allEnabled) }}
                      sx={{ mr: 1, textTransform: 'none', fontWeight: 500, fontSize: 12, flexShrink: 0 }}
                    >
                      {allEnabled ? 'Deselect All' : 'Select All'}
                    </Button>
                  )}
                </AccordionSummary>

                <AccordionDetails sx={{ px: 0, pt: 0, pb: 0 }}>
                  <Divider />
                  <Stack spacing={0}>
                    {group.permissions.map((perm, pi) => (
                      <Box key={perm.id}>
                        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ px: 2, py: 1.5 }}>
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography sx={{ fontWeight: 600, fontSize: 14, lineHeight: 1.4 }}>{perm.name}</Typography>
                            <Typography variant="caption" color="text.secondary">{perm.description}</Typography>
                          </Box>
                          <Switch
                            checked={enabledPerms.has(perm.id)}
                            onChange={() => togglePermission(perm.id)}
                            size="small"
                            inputProps={{ 'aria-label': perm.name }}
                          />
                        </Stack>
                        {pi < group.permissions.length - 1 && <Divider />}
                      </Box>
                    ))}
                  </Stack>
                </AccordionDetails>
              </Accordion>
            )
          })}

              {visibleGroups.length === 0 && (
                <Box sx={{ py: 4, textAlign: 'center' }}>
                  <Typography variant="body2" color="text.disabled">No permissions match "{search}"</Typography>
                </Box>
              )}
            </Stack>
          </Box>{/* end scrollable content */}

          {/* ── Fixed footer — flex sibling, never scrolls ───────────── */}
          <Box
            sx={{
              flexShrink: 0,
              borderTop: 1, borderColor: 'divider',
              bgcolor: 'background.paper',
              px: 2, py: 1,
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              minHeight: 64,
            }}
          >
          {/* Left — Discard Changes, only when pending */}
          <Box>
            {totalChanges > 0 && (
              <Button variant="outlined" color="error" size="medium" disabled={savePending}
                onClick={() => setEnabledPerms(new Set(committedPerms))}>
                Discard Changes
              </Button>
            )}
          </Box>

          {/* Right — change count + Cancel + Save */}
          <Stack direction="row" alignItems="center" spacing={1}>
            <Tooltip
              title={totalChanges === 0 ? 'No unsaved changes' : `${totalChanges} change${totalChanges === 1 ? '' : 's'} made`}
              placement="top"
            >
              <Typography variant="body3" color="text.secondary"
                sx={{ cursor: 'default', maxWidth: 200, whiteSpace: 'nowrap' }} noWrap>
                {totalChanges === 0 ? 'No changes' : `${totalChanges} change${totalChanges === 1 ? '' : 's'} made`}
              </Typography>
            </Tooltip>
            <Button variant="outlined" color="neutral" size="medium" disabled={savePending}
              onClick={(e: ReactMouseEvent) => dismissPlain(e)}>
              Cancel
            </Button>
            <Button variant="contained" color="primary" size="medium" disabled={savePending}
              onClick={handleSave}>
              Save
            </Button>
          </Stack>
          </Box>{/* end footer */}
        </Box>{/* end outer wrapper */}
      </Drawer>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={() => setSnackbarOpen(false)}
        message={snackbarMessage}
        TransitionComponent={snackbarSlideUp}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </>
  )
}
