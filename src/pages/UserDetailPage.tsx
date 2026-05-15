/**
 * User Management » User detail — view mode (Figma 2056:10049).
 * @see https://www.figma.com/design/nwOtFKxcMoTHpQlZ4xtPBa/Harmony-Admin?node-id=2056-10049
 */
import { useCallback, useEffect, useMemo, useState, type MouseEvent as ReactMouseEvent } from 'react'
import MenuItem from '@mui/material/MenuItem'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import Snackbar from '@mui/material/Snackbar'
import type { Theme } from '@mui/material/styles'
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
  Typography,
  getInitials,
  stringToColor,
} from '@exotel-npm-dev/signal-design-system'
import { avatarFillFromHue } from '../utils/avatarSurface'
import { fetchDirectoryUsers } from '../api/rbacApi'
import type { UserManagementDirectoryRow } from '../data/userManagementUsers'
import { DetailPageLoadingSkeleton } from '../components/rbac/DetailPageLoadingSkeleton'
import {
  SECTION_ASIDE_BOX,
  SECTION_CONTENT_STACK,
  SECTION_ROW_LAYOUT,
} from '../components/roleDetail/ChipExpandSection'

/** Wider settings column on this page only (role/privilege detail use 506px). */
const USER_DETAIL_CONTENT_STACK = {
  ...SECTION_CONTENT_STACK,
  maxWidth: { md: 640 },
} as const

/** Two-up fields: each row uses full 640px (gap 16px → half-width inputs). */
const USER_DETAIL_PAIR_FIELD_SX = {
  flex: { xs: '1 1 100%', md: '1 1 0' },
  minWidth: { xs: '100%', md: 160 },
  maxWidth: { xs: '100%', md: 'calc(50% - 8px)' },
} as const

const BACK_PATH = '/closed-interaction/user-management' // used only as fallback for invalid userId redirects

function userHandle(row: UserManagementDirectoryRow): string {
  const em = row.email?.trim()
  if (em && em.includes('@')) {
    return em.split('@')[0] ?? row.id
  }
  return row.id.replace(/^usr_/, '') || row.id
}

function parseCampaignLabels(raw: string | null): string[] {
  if (!raw?.trim()) return []
  return raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
}

function campaignChipInitials(label: string): string {
  const parts = label.split(/\s+/).filter(Boolean)
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase().slice(0, 2)
  }
  return label.slice(0, 2).toUpperCase() || '?'
}

function InfoLink({ children, onClick }: { children: string; onClick?: () => void }) {
  return (
    <Button
      type="button"
      variant="text"
      color="info"
      size="small"
      onClick={onClick}
      sx={{
        minWidth: 0,
        px: 0,
        py: 0,
        justifyContent: 'flex-start',
        textTransform: 'none',
        fontWeight: (t: Theme) => t.typography.fontWeightMedium,
        typography: 'body2',
        letterSpacing: '0.1px',
        '&:hover': { backgroundColor: 'transparent' },
      }}
    >
      {children}
    </Button>
  )
}

const SEARCH_ROW_SX = {
  flex: 1,
  minWidth: 0,
  '& .MuiOutlinedInput-root': {
    minHeight: 40,
    alignItems: 'center',
    boxSizing: 'border-box',
  },
} as const

export function UserDetailPage() {
  const { userId } = useParams<{ userId: string }>()
  const navigate = useNavigate()

  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [row, setRow] = useState<UserManagementDirectoryRow | null>(null)
  const [menuAnchorEl, setMenuAnchorEl] = useState<HTMLElement | null>(null)
  const [snack, setSnack] = useState<string | null>(null)

  useEffect(() => {
    if (!userId) return
    let cancelled = false
    ;(async () => {
      setLoading(true)
      setLoadError(null)
      try {
        const rows = await fetchDirectoryUsers()
        const found = rows.find((u) => u.id === userId) ?? null
        if (!cancelled) {
          setRow(found)
          if (!found) setLoadError('User not found')
        }
      } catch (e) {
        if (!cancelled) {
          setLoadError(e instanceof Error ? e.message : 'Failed to load user')
          setRow(null)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [userId])

  // navigate(-1) returns to exact previous route in history — works for both admin and RBAC contexts
  const handleBack = useCallback(() => navigate(-1), [navigate])

  const handleMenuOpen = (e: ReactMouseEvent<HTMLElement>) => {
    setMenuAnchorEl(e.currentTarget)
  }
  const handleMenuClose = () => setMenuAnchorEl(null)

  const campaignLabels = useMemo(() => parseCampaignLabels(row?.campaigns ?? null), [row?.campaigns])

  const channelKey = (row?.channel ?? '').toLowerCase()
  const callEnabled =
    channelKey.includes('voice') || channelKey.includes('call') || channelKey === 'phone'
  const chatEnabled =
    channelKey.includes('whatsapp') || channelKey.includes('chat') || channelKey.includes('sms')

  if (!userId) {
    return <Navigate to={BACK_PATH} replace />
  }

  if (loading) {
    return <DetailPageLoadingSkeleton />
  }

  if (loadError || !row) {
    return <Navigate to={BACK_PATH} replace />
  }

  const name = row.displayName
  const rawHue = stringToColor(name)
  const handle = userHandle(row)
  const email = row.email?.trim() ?? ''

  return (
    <Box
      sx={{
        flex: 1,
        minHeight: 0,
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: (t: Theme) =>
          t.palette.mode === 'light' ? (t.palette.grey[50] ?? '#f1f1f1') : 'background.default',
        boxSizing: 'border-box',
        p: 1,
      }}
    >
      <Paper
        elevation={1}
        sx={{
          flex: 1,
          minHeight: 0,
          display: 'flex',
          flexDirection: 'column',
          borderRadius: 1,
          overflow: 'hidden',
          bgcolor: 'background.paper',
        }}
      >
        <Box
          sx={{
            position: 'relative',
            pt: { xs: 4, sm: 5 },
            pb: 3,
            px: { xs: 2, sm: 3 },
            borderBottom: 1,
            borderColor: 'divider',
            bgcolor: 'background.paper',
          }}
        >
          <Stack
            direction="row"
            alignItems="flex-start"
            spacing={2}
            sx={{ position: 'relative', pr: { xs: 0, sm: 18 } }}
          >
            <IconButton
              variant="outlined"
              size="small"
              aria-label="Back to users"
              onClick={handleBack}
              sx={{ mt: 0.5, flexShrink: 0 }}
            >
              <Icon name="caret-left" size="sm" />
            </IconButton>

            <Avatar
              sx={(t: Theme) => ({
                width: 96,
                height: 96,
                flexShrink: 0,
                fontSize: t.typography.pxToRem(36),
                fontWeight: t.typography.fontWeightMedium,
                lineHeight: 1.1,
                letterSpacing: '-0.02em',
                color: 'text.primary',
                bgcolor: avatarFillFromHue(rawHue, t),
                border: '4px solid',
                borderColor: 'background.paper',
                boxShadow: (t.shadows as string[])[8] ?? t.shadows[4],
              })}
            >
              {getInitials(name)}
            </Avatar>

            <Stack spacing={1.5} sx={{ minWidth: 0, flex: 1 }}>
              <Typography variant="title2" component="h1" sx={{ fontWeight: 700, letterSpacing: '0.25px' }}>
                {name}
              </Typography>
              <Stack
                direction="row"
                rowGap={1}
                columnGap={4}
                flexWrap="wrap"
                alignItems="center"
                sx={{ typography: 'subtitle1', color: 'text.primary' }}
              >
                <Stack direction="row" alignItems="center" spacing={0.5} sx={{ minWidth: 0 }}>
                  <Icon name="at" size="md" />
                  <Typography variant="subtitle1" noWrap title={handle}>
                    {handle}
                  </Typography>
                </Stack>
                <Stack direction="row" alignItems="center" spacing={0.5} sx={{ minWidth: 0 }}>
                  <Icon name="envelope-simple" size="md" />
                  <Typography variant="subtitle1" noWrap title={email || '—'}>
                    {email || '—'}
                  </Typography>
                </Stack>
                <Stack direction="row" alignItems="center" spacing={0.5} sx={{ minWidth: 0 }}>
                  <Icon name="phone" size="md" />
                  <Typography variant="subtitle1" noWrap>
                    —
                  </Typography>
                </Stack>
              </Stack>
            </Stack>

            <Stack
              direction="row"
              alignItems="center"
              spacing={2}
              sx={{
                position: { xs: 'static', sm: 'absolute' },
                right: { sm: 16 },
                top: { sm: 16 },
                mt: { xs: 2, sm: 0 },
                alignSelf: { xs: 'flex-end', sm: 'auto' },
                width: { xs: '100%', sm: 'auto' },
                justifyContent: { xs: 'flex-end', sm: 'flex-start' },
              }}
            >
              <Button
                variant="outlined"
                color="inherit"
                size="medium"
                startIcon={<Icon name="note-pencil" size="sm" />}
                onClick={() => setSnack('Edit mode is not wired in this playground yet.')}
                sx={{ textTransform: 'none' }}
              >
                Edit
              </Button>
              <IconButton variant="outlined" size="small" aria-label="More actions" onClick={handleMenuOpen}>
                <Icon name="dots-three-vertical" size="sm" />
              </IconButton>
            </Stack>
          </Stack>
        </Box>

        <Box
          sx={{
            flex: 1,
            minHeight: 0,
            overflow: 'auto',
            p: 2,
            bgcolor: (t: Theme) =>
              t.palette.mode === 'light' ? (t.palette.grey[50] ?? '#f1f1f1') : 'background.default',
          }}
        >
          <Paper
            elevation={0}
            sx={{
              p: { xs: 2, sm: 2 },
              borderRadius: 1,
              bgcolor: 'background.paper',
              maxWidth: '100%',
            }}
          >
            <Stack divider={<Divider flexItem />} spacing={0}>
              <Box sx={SECTION_ROW_LAYOUT}>
                <Box sx={SECTION_ASIDE_BOX}>
                  <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                    Access Settings
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ maxWidth: SECTION_ASIDE_BOX.maxWidth }}>
                    Assign roles, access policies, and login permissions.
                  </Typography>
                  <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mt: 1.5 }}>
                    <Icon name="book-open" size="sm" sx={{ color: 'info.main' }} />
                    <InfoLink>Understanding Login Policy</InfoLink>
                  </Stack>
                </Box>
                <Stack sx={USER_DETAIL_CONTENT_STACK} direction="row" flexWrap="wrap" gap={2}>
                  <EnhancedTextField
                    showLabel
                    label="Role"
                    value={row.assignedRoleName?.trim() ? row.assignedRoleName : '—'}
                    disabled
                    fullWidth
                    sx={USER_DETAIL_PAIR_FIELD_SX}
                  />
                  <EnhancedTextField
                    showLabel
                    label="Login Policy"
                    value="Admin"
                    disabled
                    fullWidth
                    sx={USER_DETAIL_PAIR_FIELD_SX}
                  />
                </Stack>
              </Box>

              <Box sx={SECTION_ROW_LAYOUT}>
                <Box sx={SECTION_ASIDE_BOX}>
                  <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                    File Handling Permissions
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ maxWidth: SECTION_ASIDE_BOX.maxWidth }}>
                    Control file upload and sharing permissions across channels.
                  </Typography>
                  <Stack spacing={0.5} sx={{ mt: 1.5 }}>
                    <Stack direction="row" alignItems="center" spacing={0.5}>
                      <Icon name="book-open" size="sm" sx={{ color: 'info.main' }} />
                      <InfoLink>Chat Extensions</InfoLink>
                    </Stack>
                    <Stack direction="row" alignItems="center" spacing={0.5}>
                      <Icon name="book-open" size="sm" sx={{ color: 'info.main' }} />
                      <InfoLink>Ticket Extensions</InfoLink>
                    </Stack>
                  </Stack>
                </Box>
                <Stack sx={USER_DETAIL_CONTENT_STACK} direction="row" flexWrap="wrap" gap={2}>
                  <EnhancedTextField
                    showLabel
                    label="Allowed Chat Extension"
                    type="number"
                    value="4"
                    disabled
                    helperText="Should be between 1–10."
                    fullWidth
                    sx={USER_DETAIL_PAIR_FIELD_SX}
                  />
                  <EnhancedTextField
                    showLabel
                    label="Allowed Ticket Extension"
                    type="number"
                    value="5"
                    disabled
                    helperText="Should be between 1–100."
                    fullWidth
                    sx={USER_DETAIL_PAIR_FIELD_SX}
                  />
                </Stack>
              </Box>

              <Box sx={SECTION_ROW_LAYOUT}>
                <Box sx={SECTION_ASIDE_BOX}>
                  <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                    Assign to Campaign
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ maxWidth: SECTION_ASIDE_BOX.maxWidth }}>
                    Add the user to campaigns for operational access.
                  </Typography>
                </Box>
                <Stack sx={USER_DETAIL_CONTENT_STACK} spacing={2}>
                  <Stack direction="row" spacing={2} alignItems="stretch" sx={{ width: '100%' }}>
                    <EnhancedTextField
                      showLabel={false}
                      label="Search"
                      placeholder="Search"
                      disabled
                      fullWidth
                      sx={SEARCH_ROW_SX}
                    />
                    <Button variant="tonal" color="primary" size="medium" disabled sx={{ flexShrink: 0 }}>
                      Assign Campaign
                    </Button>
                  </Stack>
                  <Stack direction="row" flexWrap="wrap" gap={1}>
                    {campaignLabels.map((label) => (
                      <Chip
                        key={label}
                        size="medium"
                        variant="outlined"
                        color="default"
                        avatar={
                          <Avatar
                            variant="rounded"
                            sx={(t: Theme) => ({
                              width: 24,
                              height: 24,
                              fontSize: t.typography.pxToRem(11),
                              fontWeight: t.typography.fontWeightMedium,
                              bgcolor: avatarFillFromHue(stringToColor(label), t),
                              color: 'common.white',
                            })}
                          >
                            {campaignChipInitials(label)}
                          </Avatar>
                        }
                        label={label}
                        sx={{ maxWidth: '100%' }}
                      />
                    ))}
                  </Stack>
                </Stack>
              </Box>

              <Box sx={SECTION_ROW_LAYOUT}>
                <Box sx={SECTION_ASIDE_BOX}>
                  <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                    Channel Configuration
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ maxWidth: SECTION_ASIDE_BOX.maxWidth }}>
                    Configure communication channels and workload capacity.
                  </Typography>
                </Box>
                <Stack sx={USER_DETAIL_CONTENT_STACK} spacing={2}>
                  <Stack direction="row" flexWrap="wrap" gap={{ xs: 2, sm: 4 }} alignItems="center">
                    <FormControlLabel
                      control={<Checkbox checked={callEnabled} disabled size="medium" color="primary" />}
                      label={
                        <Stack direction="row" alignItems="center" spacing={0.5} component="span">
                          <Icon name="phone" size="sm" />
                          <Typography variant="body2" component="span">
                            Call
                          </Typography>
                        </Stack>
                      }
                      sx={{ m: 0, gap: 1 }}
                    />
                    <FormControlLabel
                      control={<Checkbox checked={chatEnabled} disabled size="medium" />}
                      label={
                        <Stack direction="row" alignItems="center" spacing={0.5} component="span">
                          <Icon name="chat-teardrop" size="sm" />
                          <Typography variant="body2" component="span">
                            Chat
                          </Typography>
                        </Stack>
                      }
                      sx={{ m: 0, gap: 1 }}
                    />
                  </Stack>
                  <EnhancedTextField
                    showLabel
                    label="User Capacity (Work Unit)"
                    type="number"
                    value={row.capacity != null && !Number.isNaN(row.capacity) ? String(row.capacity) : ''}
                    placeholder="Enter"
                    disabled
                    helperText="Minimum Capacity is 10."
                    fullWidth
                  />
                </Stack>
              </Box>

              <Box sx={SECTION_ROW_LAYOUT}>
                <Box sx={SECTION_ASIDE_BOX}>
                  <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                    System Masked Privileges
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ maxWidth: SECTION_ASIDE_BOX.maxWidth }}>
                    Configure additional system-level permissions for the user.
                  </Typography>
                </Box>
                <Stack sx={USER_DETAIL_CONTENT_STACK} spacing={2}>
                  <FormControlLabel
                    control={<Checkbox checked disabled size="medium" color="primary" />}
                    label={
                      <Typography variant="body2" component="span">
                        Set Auto Call Status
                      </Typography>
                    }
                    sx={{ alignItems: 'flex-start', m: 0 }}
                  />
                  <FormControlLabel
                    control={<Checkbox checked={false} disabled size="medium" />}
                    label={
                      <Typography variant="body2" component="span">
                        View audit trail detail
                      </Typography>
                    }
                    sx={{ alignItems: 'flex-start', m: 0 }}
                  />
                  <FormControlLabel
                    control={<Checkbox checked={false} disabled size="medium" />}
                    label={
                      <Typography variant="body2" component="span">
                        Transfer Call
                      </Typography>
                    }
                    sx={{ alignItems: 'flex-start', m: 0 }}
                  />
                </Stack>
              </Box>

              <Box sx={{ ...SECTION_ROW_LAYOUT, borderBottom: 'none', pb: 0 }}>
                <Box sx={SECTION_ASIDE_BOX}>
                  <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                    Assign Skill
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ maxWidth: SECTION_ASIDE_BOX.maxWidth }}>
                    Assign skills to improve routing and task allocation.
                  </Typography>
                </Box>
                <Stack sx={USER_DETAIL_CONTENT_STACK} spacing={2}>
                  <Stack direction="row" spacing={2} alignItems="stretch" sx={{ width: '100%' }}>
                    <EnhancedTextField
                      showLabel={false}
                      label="Search"
                      placeholder="Search"
                      disabled
                      fullWidth
                      sx={SEARCH_ROW_SX}
                    />
                    <Button variant="tonal" color="primary" size="medium" disabled sx={{ flexShrink: 0 }}>
                      Assign Skills
                    </Button>
                  </Stack>
                  <Stack
                    direction="row"
                    spacing={1.5}
                    alignItems="center"
                    justifyContent="center"
                    sx={{ py: 3, width: '100%' }}
                  >
                    <Icon name="package" size="lg" sx={{ color: 'text.disabled', opacity: 0.9 }} />
                    <Typography variant="body2" color="text.secondary">
                      Assign skills to the user
                    </Typography>
                  </Stack>
                </Stack>
              </Box>
            </Stack>
          </Paper>
        </Box>
      </Paper>

      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{ paper: { sx: { minWidth: 200 } } }}
      >
        <MenuItem
          onClick={() => {
            handleMenuClose()
            if (row.assignedRoleId) {
              navigate(`/closed-interaction/user-management/roles/${row.assignedRoleId}`)
            } else {
              setSnack('This user is not assigned to a role yet.')
            }
          }}
        >
          <ListItemIcon>
            <Icon name="user" size="sm" />
          </ListItemIcon>
          <ListItemText primary="View role" />
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleMenuClose()
            const em = row.email?.trim()
            if (!em) {
              setSnack('No email on file for this user.')
              return
            }
            void navigator.clipboard.writeText(em).then(
              () => setSnack('Email copied'),
              () => setSnack('Could not copy email'),
            )
          }}
        >
          <ListItemIcon>
            <Icon name="copy-simple" size="sm" />
          </ListItemIcon>
          <ListItemText primary="Copy email" />
        </MenuItem>
      </Menu>

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
