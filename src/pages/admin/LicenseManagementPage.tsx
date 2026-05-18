import { Fragment, useState, type MouseEvent as ReactMouseEvent, type SyntheticEvent } from 'react'
import { alpha } from '@mui/material/styles'
import type { Theme } from '@mui/material/styles'
import MenuItem from '@mui/material/MenuItem'
import InputAdornment from '@mui/material/InputAdornment'
import Snackbar from '@mui/material/Snackbar'
import MuiAlert from '@mui/material/Alert'
import {
  Alert,
  Box,
  Button,
  Card,
  Checkbox,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Drawer,
  EnhancedTextField,
  Icon,
  IconButton,
  Link,
  Stack,
  Tab,
  Tabs,
  Tooltip,
  Typography,
} from '@exotel-npm-dev/signal-design-system'

// ─── Static data ──────────────────────────────────────────────────────────────

const STATS = [
  { label: 'Active Products', value: '4',       icon: 'cube',    color: 'primary.main' },
  { label: 'Seats Used',      value: '294/390', icon: 'users',   color: 'primary.main' },
  { label: 'Expiring Soon',   value: '1',       icon: 'clock',   color: 'warning.main' },
  { label: 'Over Limit',      value: '1',       icon: 'warning', color: 'error.main'   },
]

type LicenseStatus = 'active' | 'over-limit' | 'expiring-soon' | 'trial'

const STATUS_LABEL: Record<LicenseStatus, string> = {
  'active':        'Active',
  'over-limit':    'Over Limit',
  'expiring-soon': 'Expiring Soon',
  'trial':         'Trial',
}
type ChipColor = 'success' | 'error' | 'warning' | 'primary'
const STATUS_COLOR: Record<LicenseStatus, ChipColor> = {
  'active':        'success',
  'over-limit':    'error',
  'expiring-soon': 'warning',
  'trial':         'primary',
}
const STATUS_ICON: Record<LicenseStatus, string> = {
  'active':        'check-circle',
  'over-limit':    'warning',
  'expiring-soon': 'clock',
  'trial':         'circles-three',
}

const PRODUCT_ICON: Record<string, string> = {
  voicebot: 'microphone',
  chatbot:  'chat-circle',
  exolite:  'phone',
  cqa:      'chart-bar',
  ecc:      'users',
}

interface ProductLicense {
  id: string
  name: string
  expiry: string
  status: LicenseStatus
  seats: { used: number; total: number }
  usage: { label: string; used: number; total: number }
  features: Array<{ name: string; enabled: boolean }>
  cta?: 'renew' | 'upgrade'
  fullWidth?: boolean
}

const PRODUCTS: ProductLicense[] = [
  {
    id: 'voicebot',
    name: 'Voicebot',
    expiry: '31/12/2025 (387 days)',
    status: 'active',
    seats: { used: 32, total: 50 },
    usage: { label: 'calls', used: 8420, total: 10000 },
    features: [
      { name: 'Call recording', enabled: true },
      { name: 'Analytics', enabled: true },
      { name: 'API access', enabled: true },
      { name: 'Custom voices', enabled: false },
    ],
  },
  {
    id: 'chatbot',
    name: 'Chatbot',
    expiry: '30/11/2025 (357 days)',
    status: 'over-limit',
    seats: { used: 32, total: 30 },
    usage: { label: 'conversations', used: 5250, total: 5000 },
    features: [
      { name: 'Multi-channel', enabled: true },
      { name: 'NLP', enabled: true },
      { name: 'Custom integrations', enabled: true },
      { name: 'White-label', enabled: false },
    ],
  },
  {
    id: 'exolite',
    name: 'Contact Center',
    expiry: '15/04/2025 (16 days)',
    status: 'expiring-soon',
    seats: { used: 75, total: 100 },
    usage: { label: 'minutes', used: 12500, total: 20000 },
    features: [
      { name: 'Call routing', enabled: true },
      { name: 'IVR', enabled: true },
      { name: 'Call recording', enabled: true },
      { name: 'Advanced analytics', enabled: true },
    ],
    cta: 'renew',
  },
  {
    id: 'cqa',
    name: 'CQA',
    expiry: '30/04/2025 (31 days)',
    status: 'trial',
    seats: { used: 5, total: 10 },
    usage: { label: 'reviews', used: 342, total: 1000 },
    features: [
      { name: 'Quality scoring', enabled: true },
      { name: 'Team dashboards', enabled: true },
      { name: 'Custom criteria', enabled: false },
      { name: 'Export reports', enabled: false },
    ],
    cta: 'upgrade',
  },
  {
    id: 'ecc',
    name: 'ECC',
    expiry: '31/10/2025 (325 days)',
    status: 'active',
    seats: { used: 150, total: 200 },
    usage: { label: 'contacts', used: 35000, total: 50000 },
    features: [
      { name: 'Omnichannel support', enabled: true },
      { name: 'Advanced routing', enabled: true },
      { name: 'Real-time analytics', enabled: true },
      { name: 'Custom integrations', enabled: true },
    ],
    fullWidth: true,
  },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtN(n: number) {
  return n.toLocaleString('en-IN')
}

function getBarColor(used: number, total: number): string {
  const pct = (used / total) * 100
  if (pct >= 90) return 'error.main'
  if (pct >= 70) return 'warning.main'
  return 'primary.main'
}

function extractDaysRemaining(expiry: string): number {
  const match = expiry.match(/\((\d+) days?\)/)
  return match ? parseInt(match[1], 10) : Infinity
}

// ─── Shared card sx ───────────────────────────────────────────────────────────

const CARD_SX = {
  borderRadius: 2,
  border: '1px solid',
  borderColor: 'divider',
  bgcolor: 'background.paper',
  overflow: 'hidden',
} as const

// ─── Usage progress bar ───────────────────────────────────────────────────────

function UsageBar({ used, total }: { used: number; total: number }) {
  const pct = Math.min((used / total) * 100, 100)
  return (
    <Box sx={{ height: 5, borderRadius: 3, bgcolor: 'action.hover', overflow: 'hidden' }}>
      <Box
        sx={{
          height: '100%',
          width: `${pct}%`,
          borderRadius: 3,
          bgcolor: getBarColor(used, total),
          transition: 'width 0.4s ease',
        }}
      />
    </Box>
  )
}

// ─── Product license card ─────────────────────────────────────────────────────

function ProductCard({
  product,
  onManageRoles,
  onViewUsage,
  onPrimaryCta,
}: {
  product: ProductLicense
  onManageRoles: (product: ProductLicense) => void
  onViewUsage: (product: ProductLicense) => void
  onPrimaryCta: (product: ProductLicense) => void
}) {
  const enabledFeatures = product.features.filter((f) => f.enabled)
  const totalFeatures = product.features.length

  return (
    <Card
      elevation={0}
      sx={{
        ...CARD_SX,
        transition: 'box-shadow 0.15s',
        '&:hover': { boxShadow: 2 },
      }}
    >
      <Box sx={{ p: 1.75 }}>
        {/* Header */}
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.25 }}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Box
              sx={(theme: Theme) => ({
                width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                bgcolor: alpha(theme.palette.primary.main, 0.10),
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'primary.main',
              })}
            >
              <Icon name={PRODUCT_ICON[product.id] ?? 'cube'} size="sm" />
            </Box>
            <Box sx={{ minWidth: 0 }}>
              <Typography sx={{ fontWeight: 600, fontSize: 14, color: 'text.primary', lineHeight: 1.3 }}>
                {product.name}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: 11 }}>
                Expires {product.expiry}
              </Typography>
            </Box>
          </Stack>
          <Chip
            size="small"
            label={STATUS_LABEL[product.status]}
            color={STATUS_COLOR[product.status]}
            variant="tonal"
            sx={{ fontWeight: 600, fontSize: 10, height: 20 }}
          />
        </Stack>

        {/* Seats */}
        <Stack spacing={0.5} sx={{ mb: 1.25 }}>
          <Stack direction="row" justifyContent="space-between">
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>Seats</Typography>
            <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.primary' }}>
              {product.seats.used} / {product.seats.total}
            </Typography>
          </Stack>
          <UsageBar used={product.seats.used} total={product.seats.total} />
        </Stack>

        {/* Usage */}
        <Stack spacing={0.5} sx={{ mb: 1.25 }}>
          <Stack direction="row" justifyContent="space-between">
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
              {product.usage.label}
            </Typography>
            <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.primary' }}>
              {fmtN(product.usage.used)} / {fmtN(product.usage.total)}
            </Typography>
          </Stack>
          <UsageBar used={product.usage.used} total={product.usage.total} />
        </Stack>

        {/* Features (compact summary) */}
        <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mb: 1.5 }}>
          <Box sx={{ color: 'text.secondary', display: 'flex' }}>
            <Icon name="check" size="sm" />
          </Box>
          <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.4 }}>
            {enabledFeatures.length} of {totalFeatures} features enabled
          </Typography>
        </Stack>

        {/* Action buttons */}
        <Stack direction="row" spacing={0.75}>
          <Button
            variant="outlined"
            color="neutral"
            size="small"
            onClick={() => onManageRoles(product)}
            sx={{ flex: 1, textTransform: 'none', fontWeight: 500, fontSize: 12, py: 0.5 }}
          >
            Manage Roles
          </Button>
          <Button
            variant="outlined"
            color="neutral"
            size="small"
            onClick={() => onViewUsage(product)}
            sx={{ flex: 1, textTransform: 'none', fontWeight: 500, fontSize: 12, py: 0.5 }}
          >
            Usage
          </Button>
          {product.status === 'expiring-soon' && (
            <Button
              variant="contained"
              color="primary"
              size="small"
              onClick={() => onPrimaryCta(product)}
              sx={{ flex: 1, textTransform: 'none', fontWeight: 600, fontSize: 12, py: 0.5 }}
            >
              Renew
            </Button>
          )}
          {product.status === 'over-limit' && (
            <Button
              variant="contained"
              color="primary"
              size="small"
              onClick={() => onPrimaryCta(product)}
              sx={{ flex: 1, textTransform: 'none', fontWeight: 600, fontSize: 12, py: 0.5 }}
            >
              Upgrade
            </Button>
          )}
          {product.status === 'trial' && (
            <Button
              variant="contained"
              color="primary"
              size="small"
              onClick={() => onPrimaryCta(product)}
              sx={{ flex: 1, textTransform: 'none', fontWeight: 600, fontSize: 12, py: 0.5 }}
            >
              Upgrade
            </Button>
          )}
        </Stack>
      </Box>
    </Card>
  )
}

// ─── Roles data + Manage Roles drawer ────────────────────────────────────────

interface RoleRow {
  id: string
  name: string
  description: string
  users: number
  type: 'system' | 'custom'
}

const ROLES: RoleRow[] = [
  { id: 'owner',         name: 'Owner',         description: 'Full system access and control',   users: 2,  type: 'system' },
  { id: 'admin',         name: 'Admin',         description: 'Manage users, roles, and settings', users: 5,  type: 'system' },
  { id: 'manager',       name: 'Manager',       description: 'Manage team members and resources', users: 12, type: 'custom' },
  { id: 'member',        name: 'Member',        description: 'Basic access to assigned resources', users: 45, type: 'system' },
  { id: 'support-agent', name: 'Support Agent', description: 'Customer support access',           users: 18, type: 'custom' },
]

/** Pre-selected roles per product (demo). Falls back to ['owner', 'admin']. */
const DEFAULT_SELECTED_ROLES: Record<string, string[]> = {
  voicebot: ['owner', 'admin'],
  chatbot:  ['owner', 'admin', 'manager'],
  exolite:  ['owner', 'admin'],
  cqa:      ['owner'],
  ecc:      ['owner', 'admin', 'manager', 'support-agent'],
}

const DRAWER_WIDTH_PX = 726
const DRAWER_HEADER_BG = '#f1f1f1'

function ManageRolesDrawer({
  product,
  open,
  onClose,
}: {
  product: ProductLicense | null
  open: boolean
  onClose: () => void
}) {
  const initial = product ? DEFAULT_SELECTED_ROLES[product.id] ?? ['owner', 'admin'] : []
  const [committed, setCommitted] = useState<Set<string>>(() => new Set(initial))
  const [draft, setDraft] = useState<Set<string>>(() => new Set(initial))

  const handleToggle = (roleId: string) => {
    setDraft((prev) => {
      const next = new Set(prev)
      if (next.has(roleId)) next.delete(roleId)
      else next.add(roleId)
      return next
    })
  }

  const allSelected = draft.size === ROLES.length
  const someSelected = draft.size > 0 && !allSelected
  const handleSelectAll = () => {
    setDraft(allSelected ? new Set() : new Set(ROLES.map((r) => r.id)))
  }

  const selectedRoles = ROLES.filter((r) => draft.has(r.id))
  const totalUsers = selectedRoles.reduce((sum, r) => sum + r.users, 0)

  let changeCount = 0
  draft.forEach((id) => { if (!committed.has(id)) changeCount += 1 })
  committed.forEach((id) => { if (!draft.has(id)) changeCount += 1 })

  const handleSave = () => {
    setCommitted(new Set(draft))
    onClose()
  }

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={(_e?: SyntheticEvent) => onClose()}
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
              py: '13px',
              bgcolor: DRAWER_HEADER_BG,
              borderBottom: 1,
              borderColor: 'divider',
            }}
          >
            <Stack spacing={0.25} sx={{ minWidth: 0, flex: 1 }}>
              <Typography variant="title3" component="h2" sx={{ fontWeight: 700, lineHeight: 1.25 }}>
                Manage Roles
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                noWrap
                title={product?.name ?? ''}
              >
                Select roles that should have access to {product?.name ?? 'this product'} license
              </Typography>
            </Stack>
            <IconButton
              size="small"
              variant="outlined"
              aria-label="Close"
              onClick={(e: ReactMouseEvent) => { e.stopPropagation(); onClose() }}
            >
              <Icon name="x" size="sm" />
            </IconButton>
          </Box>
        </Stack>
      }
      footerActions={
        <Fragment>
          <Typography
            variant="body3"
            color="text.secondary"
            sx={{ cursor: 'default', maxWidth: 200, whiteSpace: 'nowrap' }}
            noWrap
          >
            {changeCount === 0
              ? 'No changes'
              : `${changeCount} change${changeCount === 1 ? '' : 's'} made`}
          </Typography>
          <Button
            variant="outlined"
            color="neutral"
            size="medium"
            onClick={(e: ReactMouseEvent) => { e.stopPropagation(); onClose() }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="primary"
            size="medium"
            disabled={changeCount === 0}
            onClick={handleSave}
          >
            Save
          </Button>
        </Fragment>
      }
    >
      <Stack spacing={2}>
        {/* Summary banner */}
        <Box
          sx={(theme: Theme) => ({
            px: 2, py: 1.5,
            borderRadius: 1.5,
            bgcolor: alpha(theme.palette.primary.main, 0.06),
            border: `1px solid ${alpha(theme.palette.primary.main, 0.20)}`,
          })}
        >
          <Typography variant="body2" sx={{ color: 'primary.main' }}>
            <Box component="span" sx={{ fontWeight: 700 }}>{draft.size}</Box>
            {' '}role{draft.size !== 1 ? 's' : ''} selected with{' '}
            <Box component="span" sx={{ fontWeight: 700 }}>{totalUsers}</Box>
            {' '}user{totalUsers !== 1 ? 's' : ''} total
          </Typography>
        </Box>

        {/* Roles table */}
        <Box sx={{ border: 1, borderColor: 'divider', borderRadius: 1, overflow: 'hidden', bgcolor: 'background.paper' }}>
          {/* Header row */}
          <Stack
            direction="row"
            alignItems="center"
            sx={{
              px: 2, py: 1.25,
              bgcolor: (theme: Theme) =>
                theme.palette.mode === 'light' ? 'rgba(0, 0, 0, 0.02)' : 'action.hover',
              borderBottom: 1,
              borderColor: 'divider',
            }}
          >
            <Box sx={{ width: 32, flexShrink: 0 }}>
              <Checkbox
                size="small"
                checked={allSelected}
                indeterminate={someSelected}
                onChange={handleSelectAll}
                sx={{ p: 0 }}
              />
            </Box>
            <Typography variant="body2" sx={{ flex: 2, fontWeight: 700, lineHeight: 1.43 }}>
              Role
            </Typography>
            <Typography variant="body2" sx={{ flex: 3, fontWeight: 700, lineHeight: 1.43 }}>
              Description
            </Typography>
            <Typography variant="body2" sx={{ flex: 1, fontWeight: 700, lineHeight: 1.43 }}>
              Users
            </Typography>
            <Typography variant="body2" sx={{ flex: 1, fontWeight: 700, lineHeight: 1.43 }}>
              Type
            </Typography>
          </Stack>

          {/* Role rows */}
          {ROLES.map((role, idx) => {
            const isSelected = draft.has(role.id)
            return (
              <Stack
                key={role.id}
                direction="row"
                alignItems="center"
                onClick={() => handleToggle(role.id)}
                sx={{
                  px: 2, py: 1.5,
                  cursor: 'pointer',
                  borderBottom: idx === ROLES.length - 1 ? 0 : 1,
                  borderColor: 'divider',
                  bgcolor: isSelected ? (theme: Theme) => alpha(theme.palette.primary.main, 0.04) : 'transparent',
                  transition: 'background-color 0.15s',
                  '&:hover': {
                    bgcolor: isSelected
                      ? (theme: Theme) => alpha(theme.palette.primary.main, 0.08)
                      : 'action.hover',
                  },
                }}
              >
                <Box sx={{ width: 32, flexShrink: 0 }}>
                  <Checkbox
                    size="small"
                    checked={isSelected}
                    onChange={() => handleToggle(role.id)}
                    onClick={(e: ReactMouseEvent) => e.stopPropagation()}
                    sx={{ p: 0 }}
                  />
                </Box>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ flex: 2, minWidth: 0 }}>
                  <Box sx={{ color: 'text.secondary', display: 'flex', flexShrink: 0 }}>
                    <Icon name="shield" size="sm" />
                  </Box>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }} noWrap>
                    {role.name}
                  </Typography>
                </Stack>
                <Typography variant="body2" color="text.secondary" sx={{ flex: 3, lineHeight: 1.5, pr: 1 }}>
                  {role.description}
                </Typography>
                <Stack direction="row" alignItems="center" spacing={0.75} sx={{ flex: 1 }}>
                  <Box sx={{ color: 'text.disabled', display: 'flex' }}>
                    <Icon name="users" size="sm" />
                  </Box>
                  <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.primary' }}>
                    {role.users}
                  </Typography>
                </Stack>
                <Box sx={{ flex: 1 }}>
                  <Chip
                    size="small"
                    label={role.type === 'system' ? 'Default' : 'Custom'}
                    color={role.type === 'system' ? 'default' : 'info'}
                    variant="tonal"
                    sx={{ maxWidth: '100%' }}
                  />
                </Box>
              </Stack>
            )
          })}
        </Box>
      </Stack>
    </Drawer>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const TAB_FILTERS = [
  { value: 'all',            label: 'All' },
  { value: 'active',         label: 'Active' },
  { value: 'expiring-soon',  label: 'Expiring soon' },
  { value: 'over-limit',     label: 'Over limit' },
  { value: 'trial',          label: 'Trial' },
] as const

const SORT_OPTIONS = [
  { value: 'expiry', label: 'Expiry date' },
  { value: 'usage',  label: 'Usage %' },
  { value: 'name',   label: 'Name' },
] as const
const SORT_LABEL: Record<string, string> = Object.fromEntries(
  SORT_OPTIONS.map((o) => [o.value, o.label]),
)

export function LicenseManagementPage() {
  const [activeTab, setActiveTab] = useState<string>('all')
  const [sortBy, setSortBy] = useState('expiry')
  const [alertDismissed, setAlertDismissed] = useState(false)
  const [usageProduct, setUsageProduct] = useState<ProductLicense | null>(null)
  const [rolesProduct, setRolesProduct] = useState<ProductLicense | null>(null)
  const [ctaProduct, setCtaProduct] = useState<ProductLicense | null>(null)
  const [buyOpen, setBuyOpen] = useState(false)
  const [snackbarMessage, setSnackbarMessage] = useState<string | null>(null)

  const handleManageRoles = (product: ProductLicense) => {
    setRolesProduct(product)
  }

  const handleViewUsage = (product: ProductLicense) => {
    setUsageProduct(product)
  }

  const handleViewFullReport = (product: ProductLicense) => {
    setUsageProduct(null)
    setSnackbarMessage(
      `Generating full usage report for ${product.name}. A download link will be emailed to you when ready.`
    )
  }

  const handlePrimaryCta = (product: ProductLicense) => {
    setCtaProduct(product)
  }

  const handleCtaConfirm = (product: ProductLicense, option: CtaOption, mode: CtaMode) => {
    setCtaProduct(null)
    const verb =
      mode === 'renew' ? 'Renewal' : mode === 'upgrade-seats' ? 'Seat add-on' : 'Plan upgrade'
    setSnackbarMessage(
      `${verb} for ${product.name} — ${option.label} (₹${fmtN(option.price)}) sent to billing.`
    )
  }

  const handleBuyConfirm = (product: ProductLicense, seats: number, price: number) => {
    setBuyOpen(false)
    setSnackbarMessage(
      `Purchase order created — ${seats} seats for ${product.name} (₹${fmtN(price)}) sent to billing.`
    )
  }

  const handleExportReport = () => {
    setSnackbarMessage(
      'Generating license report. A download link will be emailed to you when ready.'
    )
  }

  const handleReviewAll = () => {
    if (overLimitCount > 0 && expiringCount === 0) setActiveTab('over-limit')
    else if (expiringCount > 0 && overLimitCount === 0) setActiveTab('expiring-soon')
    else setActiveTab('all')
  }

  const expiringCount = PRODUCTS.filter((p) => p.status === 'expiring-soon').length
  const overLimitCount = PRODUCTS.filter((p) => p.status === 'over-limit').length
  const attentionCount = expiringCount + overLimitCount
  const alertSeverity: 'warning' | 'error' = overLimitCount > 0 ? 'error' : 'warning'

  const tabCounts: Record<string, number> = {
    'all':           PRODUCTS.length,
    'active':        PRODUCTS.filter((p) => p.status === 'active').length,
    'expiring-soon': expiringCount,
    'over-limit':    overLimitCount,
    'trial':         PRODUCTS.filter((p) => p.status === 'trial').length,
  }

  const issues: string[] = []
  if (expiringCount > 0) issues.push(`${expiringCount} expiring soon`)
  if (overLimitCount > 0) issues.push(`${overLimitCount} over limit`)

  const filteredProducts = PRODUCTS
    .filter((p) => activeTab === 'all' || p.status === activeTab)
    .sort((a, b) => {
      switch (sortBy) {
        case 'name': return a.name.localeCompare(b.name)
        case 'usage': return (b.usage.used / b.usage.total) - (a.usage.used / a.usage.total)
        case 'expiry': return extractDaysRemaining(a.expiry) - extractDaysRemaining(b.expiry)
        default: return 0
      }
    })

  const handleStatClick = (label: string) => {
    if (label === 'Expiring Soon') setActiveTab('expiring-soon')
    else if (label === 'Over Limit') setActiveTab('over-limit')
  }

  return (
    <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Full-bleed alert flush with the top navigation (escapes AdminLayout p:1) */}
      {!alertDismissed && attentionCount > 0 && (
        <Alert
          severity={alertSeverity}
          onClose={() => setAlertDismissed(true)}
          sx={{ borderRadius: 0, py: 0.75, mt: -1, mx: -1, mb: 1 }}
        >
          {attentionCount} product{attentionCount !== 1 ? 's' : ''} need attention — {issues.join(', ')}.{' '}
            <Link
              component="button"
              type="button"
              underline="always"
              sx={{ fontSize: 'inherit', fontWeight: 600, color: 'inherit', verticalAlign: 'baseline' }}
              onClick={handleReviewAll}
            >
              Review all
            </Link>
        </Alert>
      )}

      {/* Page content */}
      <Box sx={{ px: { xs: 2, sm: 3 }, pt: 2, pb: 2 }}>
        {/* Page header */}
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
          <Box>
            <Typography sx={{ fontWeight: 700, fontSize: 20, letterSpacing: '-0.02em', color: 'text.primary', lineHeight: 1.2 }}>
              Licenses &amp; Usage
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Monitor product licenses and usage across your organization
            </Typography>
          </Box>
          <Stack direction="row" spacing={1.5}>
            <Button
              variant="outlined"
              color="neutral"
              size="medium"
              startIcon={<Icon name="download-simple" size="sm" />}
              onClick={handleExportReport}
            >
              Export Report
            </Button>
            <Button
              variant="contained"
              color="primary"
              size="medium"
              startIcon={<Icon name="plus" size="sm" />}
              onClick={() => setBuyOpen(true)}
            >
              Buy Licenses
            </Button>
          </Stack>
        </Stack>

        {/* Stat cards (compact) */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 1.5, mb: 2 }}>
          {STATS.map(({ label, value, icon, color }) => {
            const isClickable =
              (label === 'Expiring Soon' && value !== '0') ||
              (label === 'Over Limit' && value !== '0')
            return (
              <Card
                key={label}
                elevation={0}
                sx={{
                  ...CARD_SX,
                  px: 2, py: 1.5,
                  ...(isClickable && {
                    cursor: 'pointer',
                    transition: 'box-shadow 0.15s',
                    '&:hover': { boxShadow: 2 },
                  }),
                }}
                onClick={() => isClickable && handleStatClick(label)}
              >
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', lineHeight: 1.3 }}>{label}</Typography>
                    <Typography sx={{ fontWeight: 700, fontSize: 22, lineHeight: 1.2, color: 'text.primary' }}>{value}</Typography>
                  </Box>
                  <Box
                    sx={(theme: Theme) => ({
                      width: 36, height: 36, borderRadius: '50%',
                      bgcolor: alpha(
                        color === 'primary.main'  ? theme.palette.primary.main
                        : color === 'warning.main' ? theme.palette.warning.main
                        : theme.palette.error.main,
                        0.10
                      ),
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color,
                    })}
                  >
                    <Icon name={icon} size="sm" />
                  </Box>
                </Stack>
              </Card>
            )
          })}
        </Box>

        {/* Tabs (with counts) + sort + search */}
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          alignItems={{ xs: 'stretch', md: 'flex-end' }}
          justifyContent="space-between"
          spacing={1}
          sx={{ mb: 1.5, borderBottom: 1, borderColor: 'divider' }}
        >
          <Tabs
            value={activeTab}
            onChange={(_: unknown, v: string) => setActiveTab(v)}
            variant="scrollable"
            scrollButtons={false}
            sx={{
              minHeight: 38,
              '& .MuiTab-root': {
                minHeight: 38,
                py: 0.5,
                px: 1.5,
                textTransform: 'none',
                fontSize: 13,
                fontWeight: 500,
              },
            }}
          >
            {TAB_FILTERS.map(({ value, label }) => {
              const count = tabCounts[value] ?? 0
              const isActive = activeTab === value
              return (
                <Tab
                  key={value}
                  value={value}
                  label={
                    <Stack component="span" direction="row" alignItems="center" spacing={0.875}>
                      <Box component="span">{label}</Box>
                      <Box
                        component="span"
                        sx={(theme: Theme) => ({
                          px: 0.625,
                          minWidth: 18,
                          borderRadius: 1,
                          fontSize: 10,
                          fontWeight: 600,
                          lineHeight: 1.6,
                          textAlign: 'center',
                          bgcolor: isActive
                            ? alpha(theme.palette.primary.main, 0.12)
                            : alpha(theme.palette.text.primary, 0.06),
                          color: isActive ? 'primary.main' : 'text.secondary',
                        })}
                      >
                        {count}
                      </Box>
                    </Stack>
                  }
                />
              )
            })}
          </Tabs>

          <Stack direction="row" spacing={1} alignItems="center" sx={{ pb: 1 }}>
            <EnhancedTextField
              size="small"
              showLabel={false}
              select
              value={sortBy}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSortBy(e.target.value)}
              slotProps={{
                select: {
                  displayEmpty: true,
                  renderValue: (val: unknown) => `Sort: ${SORT_LABEL[val as string] ?? ''}`,
                  MenuProps: {
                    anchorOrigin: { vertical: 'bottom', horizontal: 'left' },
                    transformOrigin: { vertical: 'top', horizontal: 'left' },
                    PaperProps: { sx: { maxHeight: 320, borderRadius: 2, mt: 0.5 } },
                  },
                },
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <Icon name="sort-ascending" size="sm" />
                    </InputAdornment>
                  ),
                  sx: {
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'var(--mui-palette-Chip-defaultBorder)',
                    },
                    '& .MuiInputAdornment-root': { marginRight: 'unset' },
                  },
                },
              }}
              sx={{ minWidth: 170 }}
            >
              {SORT_OPTIONS.map((o) => (
                <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>
              ))}
            </EnhancedTextField>
          </Stack>
        </Stack>

        {/* Responsive product grid — full width, fits viewport */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' },
            gap: 1.5,
          }}
        >
          {filteredProducts.map((p) => (
            <ProductCard
              key={p.id}
              product={p}
              onManageRoles={handleManageRoles}
              onViewUsage={handleViewUsage}
              onPrimaryCta={handlePrimaryCta}
            />
          ))}
        </Box>
      </Box>

      {/* Manage Roles drawer */}
      <ManageRolesDrawer
        key={rolesProduct?.id ?? 'closed'}
        product={rolesProduct}
        open={rolesProduct !== null}
        onClose={() => setRolesProduct(null)}
      />

      {/* Usage details dialog */}
      <UsageDetailsDialog
        product={usageProduct}
        open={usageProduct !== null}
        onClose={() => setUsageProduct(null)}
        onManageRoles={(p) => {
          setUsageProduct(null)
          setRolesProduct(p)
        }}
        onViewFullReport={handleViewFullReport}
      />

      {/* Renew / Upgrade dialog */}
      <RenewUpgradeDialog
        key={ctaProduct?.id ?? 'cta-closed'}
        product={ctaProduct}
        open={ctaProduct !== null}
        onClose={() => setCtaProduct(null)}
        onConfirm={handleCtaConfirm}
      />

      {/* Buy licenses dialog */}
      <BuyLicensesDialog
        key={buyOpen ? 'buy-open' : 'buy-closed'}
        open={buyOpen}
        products={PRODUCTS}
        onClose={() => setBuyOpen(false)}
        onConfirm={handleBuyConfirm}
      />

      {/* Snackbar feedback */}
      <Snackbar
        open={snackbarMessage !== null}
        autoHideDuration={5000}
        onClose={() => setSnackbarMessage(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <MuiAlert
          variant="filled"
          severity="success"
          icon={<Icon name="check-circle" size="sm" />}
          onClose={() => setSnackbarMessage(null)}
          sx={{ alignItems: 'center' }}
        >
          {snackbarMessage}
        </MuiAlert>
      </Snackbar>
    </Box>
  )
}

// ─── Usage details dialog ─────────────────────────────────────────────────────

function deterministicSeries(seed: string, total: number, len: number): number[] {
  let h = 5381
  for (let i = 0; i < seed.length; i++) h = (Math.imul(33, h) + seed.charCodeAt(i)) | 0
  const avg = total / 30
  return Array.from({ length: len }, (_, i) => {
    h = (Math.imul(1103515245, h) + 12345) | 0
    const noise = ((h >>> 0) % 1000) / 1000
    return Math.max(0, Math.round(avg * (0.55 + noise * 0.9)))
  })
}

function UsageDetailsDialog({
  product,
  open,
  onClose,
  onManageRoles,
  onViewFullReport,
}: {
  product: ProductLicense | null
  open: boolean
  onClose: () => void
  onManageRoles: (product: ProductLicense) => void
  onViewFullReport: (product: ProductLicense) => void
}) {
  if (!product) return null

  const seatsPct = Math.round((product.seats.used / product.seats.total) * 100)
  const usagePct = Math.round((product.usage.used / product.usage.total) * 100)
  const seatsAvailable = Math.max(0, product.seats.total - product.seats.used)
  const usageRemaining = Math.max(0, product.usage.total - product.usage.used)
  const daysRemaining = extractDaysRemaining(product.expiry)
  const daysLabel = daysRemaining === Infinity ? '—' : `${fmtN(daysRemaining)}`
  const enabledFeatures = product.features.filter((f) => f.enabled).length

  const seatsColor = getBarColor(product.seats.used, product.seats.total)
  const usageColor = getBarColor(product.usage.used, product.usage.total)

  const trend = deterministicSeries(product.id, product.usage.used, 7)
  const trendMax = Math.max(...trend, 1)
  const trendDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    return d
  })

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={(_e?: SyntheticEvent) => onClose()}
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
              py: '13px',
              bgcolor: DRAWER_HEADER_BG,
              borderBottom: 1,
              borderColor: 'divider',
            }}
          >
            <Stack direction="row" alignItems="center" spacing={1.5} sx={{ minWidth: 0, flex: 1 }}>
              <Box
                sx={(theme: Theme) => ({
                  width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
                  bgcolor: alpha(theme.palette.primary.main, 0.10),
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'primary.main',
                })}
              >
                <Icon name={PRODUCT_ICON[product.id] ?? 'cube'} size="sm" />
              </Box>
              <Box sx={{ minWidth: 0 }}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Typography variant="title3" component="h2" sx={{ fontWeight: 700, lineHeight: 1.25 }}>
                    {product.name}
                  </Typography>
                  <Chip
                    size="small"
                    label={STATUS_LABEL[product.status]}
                    color={STATUS_COLOR[product.status]}
                    variant="tonal"
                    sx={{ fontWeight: 600, fontSize: 10, height: 20 }}
                  />
                </Stack>
                <Typography variant="body2" color="text.secondary" noWrap>
                  Usage details · Expires {product.expiry}
                </Typography>
              </Box>
            </Stack>
            <IconButton
              size="small"
              variant="outlined"
              aria-label="Close"
              onClick={(e: ReactMouseEvent) => { e.stopPropagation(); onClose() }}
            >
              <Icon name="x" size="sm" />
            </IconButton>
          </Box>
        </Stack>
      }
      footerActions={
        <Fragment>
          <Button
            variant="outlined"
            color="neutral"
            size="medium"
            startIcon={<Icon name="shield" size="sm" />}
            onClick={() => onManageRoles(product)}
            sx={{ textTransform: 'none' }}
          >
            Manage Roles
          </Button>
          <Button
            variant="contained"
            color="primary"
            size="medium"
            startIcon={<Icon name="chart-line" size="sm" />}
            onClick={() => onViewFullReport(product)}
            sx={{ textTransform: 'none' }}
          >
            View full report
          </Button>
        </Fragment>
      }
    >
      <Stack divider={<Divider flexItem />} spacing={2.5}>
          {/* Key stat row */}
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 3 }}>
            {[
              { label: 'Seats used',        value: `${product.seats.used} / ${product.seats.total}`,                          pct: `${seatsPct}%`, color: seatsColor },
              { label: product.usage.label, value: `${fmtN(product.usage.used)} / ${fmtN(product.usage.total)}`, pct: `${usagePct}%`, color: usageColor },
              { label: 'Days remaining',    value: daysLabel,                                                                  pct: 'days',         color: 'text.secondary' },
            ].map(({ label, value, pct, color }) => (
              <Box key={label}>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5, textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600 }}>
                  {label}
                </Typography>
                <Stack direction="row" alignItems="baseline" spacing={0.75}>
                  <Typography sx={{ fontWeight: 700, fontSize: 20, lineHeight: 1.2, color: 'text.primary' }}>
                    {value}
                  </Typography>
                  <Typography variant="caption" sx={{ fontWeight: 600, color }}>
                    {pct}
                  </Typography>
                </Stack>
              </Box>
            ))}
          </Box>

          {/* Seats utilization */}
          <Box>
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
              <Typography sx={{ fontWeight: 600, fontSize: 13, color: 'text.primary' }}>
                Seat utilization
              </Typography>
              <Typography variant="caption" sx={{ fontWeight: 600, color: seatsColor }}>
                {seatsPct}% used
              </Typography>
            </Stack>
            <UsageBar used={product.seats.used} total={product.seats.total} />
            <Stack direction="row" spacing={3} sx={{ mt: 1.5 }}>
              <Stack direction="row" alignItems="center" spacing={0.75}>
                <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: seatsColor }} />
                <Typography variant="caption" color="text.secondary">
                  <Box component="span" sx={{ fontWeight: 600, color: 'text.primary' }}>{product.seats.used}</Box>
                  {' '}used
                </Typography>
              </Stack>
              <Stack direction="row" alignItems="center" spacing={0.75}>
                <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'action.hover', border: 1, borderColor: 'divider' }} />
                <Typography variant="caption" color="text.secondary">
                  <Box component="span" sx={{ fontWeight: 600, color: 'text.primary' }}>{seatsAvailable}</Box>
                  {' '}available
                </Typography>
              </Stack>
            </Stack>
          </Box>

          {/* Monthly usage + trend */}
          <Box>
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
              <Typography sx={{ fontWeight: 600, fontSize: 13, color: 'text.primary' }}>
                Monthly {product.usage.label}
              </Typography>
              <Typography variant="caption" sx={{ fontWeight: 600, color: usageColor }}>
                {usagePct}% used · {fmtN(usageRemaining)} remaining
              </Typography>
            </Stack>
            <UsageBar used={product.usage.used} total={product.usage.total} />

            {/* 7-day trend */}
            <Box sx={{ mt: 2 }}>
              <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                  Last 7 days
                </Typography>
                <Typography variant="caption" color="text.disabled" sx={{ fontSize: 10 }}>
                  Peak {fmtN(trendMax)} · Avg {fmtN(Math.round(trend.reduce((a, b) => a + b, 0) / trend.length))}
                </Typography>
              </Stack>

              {/* Bars with baseline grid */}
              <Box
                sx={{
                  position: 'relative',
                  height: 72,
                  pb: 0.5,
                }}
              >
                {/* Faint mid-line */}
                <Box
                  sx={{
                    position: 'absolute',
                    left: 0, right: 0,
                    top: '50%',
                    borderTop: '1px dashed',
                    borderColor: 'divider',
                    opacity: 0.6,
                  }}
                />
                <Stack direction="row" spacing={1} alignItems="flex-end" sx={{ height: '100%', position: 'relative' }}>
                  {trend.map((v, i) => {
                    const heightPct = (v / trendMax) * 100
                    const daysAgo = trend.length - 1 - i
                    const dayLabel =
                      daysAgo === 0 ? 'Today' : daysAgo === 1 ? 'Yesterday' : `${daysAgo} days ago`
                    const isToday = daysAgo === 0
                    return (
                      <Tooltip
                        key={i}
                        title={`${dayLabel}: ${fmtN(v)} ${product.usage.label}`}
                        arrow
                        placement="top"
                      >
                        <Box
                          sx={(theme: Theme) => ({
                            flex: 1,
                            height: `${Math.max(heightPct, 6)}%`,
                            borderRadius: '4px 4px 0 0',
                            bgcolor: isToday
                              ? theme.palette.primary.main
                              : alpha(theme.palette.primary.main, 0.50),
                            cursor: 'pointer',
                            transition: 'background-color 0.15s, height 0.3s ease',
                            '&:hover': { bgcolor: 'primary.dark' },
                          })}
                        />
                      </Tooltip>
                    )
                  })}
                </Stack>
              </Box>

              {/* Day-name labels */}
              <Stack direction="row" spacing={1} sx={{ mt: 0.5 }}>
                {trendDays.map((d, i) => {
                  const daysAgo = trendDays.length - 1 - i
                  const isToday = daysAgo === 0
                  return (
                    <Typography
                      key={i}
                      variant="caption"
                      sx={{
                        flex: 1,
                        textAlign: 'center',
                        fontSize: 10,
                        fontWeight: isToday ? 700 : 500,
                        color: isToday ? 'primary.main' : 'text.disabled',
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                      }}
                    >
                      {isToday ? 'Today' : d.toLocaleDateString('en-US', { weekday: 'short' })}
                    </Typography>
                  )
                })}
              </Stack>
            </Box>
          </Box>

          {/* Features */}
          <Box>
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.25 }}>
              <Typography sx={{ fontWeight: 600, fontSize: 13, color: 'text.primary' }}>
                Features
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {enabledFeatures} of {product.features.length} enabled
              </Typography>
            </Stack>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
              {product.features.map(({ name, enabled }) => (
                <Stack key={name} direction="row" alignItems="center" spacing={0.875}>
                  <Box
                    sx={(theme: Theme) => ({
                      width: 18, height: 18, borderRadius: '50%', flexShrink: 0,
                      bgcolor: enabled
                        ? alpha(theme.palette.success.main, 0.12)
                        : theme.palette.action.hover,
                      color: enabled ? 'success.main' : 'action.disabled',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    })}
                  >
                    <Icon name={enabled ? 'check' : 'minus'} size="sm" />
                  </Box>
                  <Typography variant="body2" sx={{ color: enabled ? 'text.primary' : 'text.disabled' }}>
                    {name}
                  </Typography>
                </Stack>
              ))}
            </Box>
          </Box>
      </Stack>
    </Drawer>
  )
}

// ─── Renew / Upgrade dialog ───────────────────────────────────────────────────

type CtaMode = 'renew' | 'upgrade-seats' | 'upgrade-tier'

interface CtaOption {
  id: string
  label: string
  description: string
  price: number
  badge?: string
  highlight?: boolean
}

interface CtaConfig {
  mode: CtaMode
  icon: string
  iconColor: 'primary.main' | 'warning.main' | 'error.main'
  iconBg: 'primary.main' | 'warning.main' | 'error.main'
  modeLabel: string
  title: string
  subtitle: string
  optionsTitle: string
  optionsHelp?: string
  cta: string
  options: CtaOption[]
}

const SEAT_PRICE = 2400

function getCtaConfig(product: ProductLicense): CtaConfig {
  if (product.status === 'expiring-soon') {
    const seats = product.seats.total
    const yearly = seats * SEAT_PRICE
    return {
      mode: 'renew',
      icon: 'clock',
      iconColor: 'warning.main',
      iconBg: 'warning.main',
      modeLabel: 'Renew',
      title: `Renew ${product.name}`,
      subtitle: `Current license expires ${product.expiry}. Choose a renewal term to keep ${seats} seats active.`,
      optionsTitle: 'Choose renewal term',
      cta: 'Proceed to checkout',
      options: [
        {
          id: '1y',
          label: '1 year',
          description: `${seats} seats × ₹${fmtN(SEAT_PRICE)}/yr`,
          price: yearly,
        },
        {
          id: '2y',
          label: '2 years',
          description: `${seats} seats × ₹${fmtN(SEAT_PRICE)}/yr · save 10%`,
          price: Math.round(yearly * 2 * 0.9),
          badge: 'Save 10%',
        },
        {
          id: '3y',
          label: '3 years',
          description: `${seats} seats × ₹${fmtN(SEAT_PRICE)}/yr · save 20%`,
          price: Math.round(yearly * 3 * 0.8),
          badge: 'Best value',
          highlight: true,
        },
      ],
    }
  }

  if (product.status === 'over-limit') {
    const over = product.seats.used - product.seats.total
    const options: CtaOption[] = [10, 25, 50, 100].map((add) => ({
      id: `seats-${add}`,
      label: `+${add} seats`,
      description: `New total ${product.seats.total + add} · ₹${fmtN(SEAT_PRICE)}/seat/yr`,
      price: add * SEAT_PRICE,
      ...(add === 25 ? { badge: 'Recommended', highlight: true } : {}),
    }))
    return {
      mode: 'upgrade-seats',
      icon: 'warning',
      iconColor: 'error.main',
      iconBg: 'error.main',
      modeLabel: 'Upgrade',
      title: `Add seats to ${product.name}`,
      subtitle: `You're ${over} seat${over === 1 ? '' : 's'} over your current limit of ${product.seats.total}. Add capacity to unblock your team.`,
      optionsTitle: 'Add seat capacity',
      optionsHelp: `Charged pro-rata for the remainder of your current term.`,
      cta: 'Add seats',
      options,
    }
  }

  const tierBase = product.seats.total * SEAT_PRICE
  return {
    mode: 'upgrade-tier',
    icon: 'sparkle',
    iconColor: 'primary.main',
    iconBg: 'primary.main',
    modeLabel: 'Upgrade',
    title: `Upgrade ${product.name} from trial`,
    subtitle: `Convert your trial to a paid plan to unlock all features and remove usage caps.`,
    optionsTitle: 'Choose a plan',
    cta: 'Proceed to checkout',
    options: [
      {
        id: 'starter',
        label: 'Starter',
        description: 'Core features · email support',
        price: tierBase,
      },
      {
        id: 'pro',
        label: 'Pro',
        description: 'All features · priority support · API access',
        price: Math.round(tierBase * 1.6),
        badge: 'Most popular',
        highlight: true,
      },
      {
        id: 'enterprise',
        label: 'Enterprise',
        description: 'Custom SLA · SSO · dedicated CSM',
        price: Math.round(tierBase * 2.4),
      },
    ],
  }
}

function RenewUpgradeDialog({
  product,
  open,
  onClose,
  onConfirm,
}: {
  product: ProductLicense | null
  open: boolean
  onClose: () => void
  onConfirm: (product: ProductLicense, option: CtaOption, mode: CtaMode) => void
}) {
  const config = product ? getCtaConfig(product) : null
  const defaultId = config?.options.find((o) => o.highlight)?.id ?? config?.options[0]?.id ?? null
  const [selectedId, setSelectedId] = useState<string | null>(defaultId)

  if (!product || !config) return null

  const selected = config.options.find((o) => o.id === selectedId) ?? null
  const tax = selected ? Math.round(selected.price * 0.18) : 0
  const total = selected ? selected.price + tax : 0

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{ sx: { borderRadius: 3, overflow: 'hidden' } }}
    >
      <DialogTitle sx={{ p: 0 }}>
        <Box sx={{ px: 3, pt: 2.5, pb: 2 }}>
          <Stack direction="row" alignItems="flex-start" justifyContent="space-between" spacing={1.5}>
            <Box sx={{ minWidth: 0 }}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Typography sx={{ fontWeight: 700, fontSize: 16, color: 'text.primary', lineHeight: 1.3 }}>
                  {config.title}
                </Typography>
                <Chip
                  size="small"
                  label={config.modeLabel}
                  color={config.mode === 'renew' ? 'warning' : config.mode === 'upgrade-seats' ? 'error' : 'primary'}
                  variant="tonal"
                  sx={{ fontWeight: 600, fontSize: 10, height: 20 }}
                />
              </Stack>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
                {config.subtitle}
              </Typography>
            </Box>
            <IconButton size="small" onClick={onClose} aria-label="Close">
              <Icon name="x" size="sm" />
            </IconButton>
          </Stack>
        </Box>
        <Divider />
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        <Box sx={{ px: 3, py: 2 }}>
          <Stack direction="row" alignItems="baseline" justifyContent="space-between" sx={{ mb: 1.25 }}>
            <Typography sx={{ fontWeight: 600, fontSize: 13, color: 'text.primary' }}>
              {config.optionsTitle}
            </Typography>
            {config.optionsHelp && (
              <Typography variant="caption" color="text.secondary">
                {config.optionsHelp}
              </Typography>
            )}
          </Stack>

          <Stack spacing={1}>
            {config.options.map((opt) => {
              const isSelected = selectedId === opt.id
              return (
                <Box
                  key={opt.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => setSelectedId(opt.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      setSelectedId(opt.id)
                    }
                  }}
                  sx={(theme: Theme) => ({
                    cursor: 'pointer',
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: isSelected ? 'primary.main' : 'divider',
                    bgcolor: isSelected ? alpha(theme.palette.primary.main, 0.04) : 'background.paper',
                    px: 1.75, py: 1.25,
                    transition: 'background-color 0.15s, border-color 0.15s',
                    '&:hover': { borderColor: isSelected ? 'primary.main' : 'text.secondary' },
                  })}
                >
                  <Stack direction="row" alignItems="center" spacing={1.5}>
                    <Box
                      sx={(theme: Theme) => ({
                        width: 18, height: 18, borderRadius: '50%', flexShrink: 0,
                        border: '2px solid',
                        borderColor: isSelected ? 'primary.main' : alpha(theme.palette.text.secondary, 0.4),
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      })}
                    >
                      {isSelected && (
                        <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'primary.main' }} />
                      )}
                    </Box>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Typography sx={{ fontWeight: 600, fontSize: 13, color: 'text.primary' }}>
                          {opt.label}
                        </Typography>
                        {opt.badge && (
                          <Chip
                            size="small"
                            label={opt.badge}
                            color="primary"
                            variant="tonal"
                            sx={{ fontWeight: 600, fontSize: 10, height: 18 }}
                          />
                        )}
                      </Stack>
                      <Typography variant="caption" color="text.secondary">
                        {opt.description}
                      </Typography>
                    </Box>
                    <Typography sx={{ fontWeight: 700, fontSize: 14, color: 'text.primary', whiteSpace: 'nowrap' }}>
                      ₹{fmtN(opt.price)}
                    </Typography>
                  </Stack>
                </Box>
              )
            })}
          </Stack>

          {selected && (
            <Box
              sx={(theme: Theme) => ({
                mt: 2,
                borderRadius: 2,
                bgcolor: alpha(theme.palette.text.primary, 0.03),
                p: 1.5,
              })}
            >
              <Stack spacing={0.5}>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="caption" color="text.secondary">Subtotal</Typography>
                  <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.primary' }}>
                    ₹{fmtN(selected.price)}
                  </Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="caption" color="text.secondary">GST (18%)</Typography>
                  <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.primary' }}>
                    ₹{fmtN(tax)}
                  </Typography>
                </Stack>
                <Divider sx={{ my: 0.5 }} />
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography sx={{ fontWeight: 600, fontSize: 13, color: 'text.primary' }}>
                    Total
                  </Typography>
                  <Typography sx={{ fontWeight: 700, fontSize: 15, color: 'text.primary' }}>
                    ₹{fmtN(total)}
                  </Typography>
                </Stack>
              </Stack>
            </Box>
          )}
        </Box>
      </DialogContent>

      <Divider />
      <DialogActions sx={{ px: 3, py: 1.5, gap: 1 }}>
        <Button variant="outlined" color="neutral" size="medium" onClick={onClose}>
          Cancel
        </Button>
        <Button
          variant="contained"
          color="primary"
          size="medium"
          disabled={!selected}
          onClick={() => selected && onConfirm(product, selected, config.mode)}
        >
          {config.cta}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

// ─── Buy licenses dialog ──────────────────────────────────────────────────────

const SEAT_PACKS = [10, 25, 50, 100]
const BILLING_TERMS: Array<{ years: 1 | 2 | 3; label: string; discountPct: number; badge?: string }> = [
  { years: 1, label: '1 year',  discountPct: 0 },
  { years: 2, label: '2 years', discountPct: 10, badge: 'Save 10%' },
  { years: 3, label: '3 years', discountPct: 20, badge: 'Best value' },
]

function BuyLicensesDialog({
  open,
  products,
  onClose,
  onConfirm,
}: {
  open: boolean
  products: ProductLicense[]
  onClose: () => void
  onConfirm: (product: ProductLicense, seats: number, price: number) => void
}) {
  const [productId, setProductId] = useState<string>(products[0]?.id ?? '')
  const product = products.find((p) => p.id === productId) ?? products[0] ?? null

  const overage = product ? Math.max(0, product.seats.used - product.seats.total) : 0
  const [seatCount, setSeatCount] = useState<number>(overage > 0 ? overage + 25 : 25)
  const [years, setYears] = useState<1 | 2 | 3>(1)

  if (!product) return null

  const term = BILLING_TERMS.find((t) => t.years === years) ?? BILLING_TERMS[0]
  const grossSubtotal = seatCount * SEAT_PRICE * years
  const discountAmt = Math.round(grossSubtotal * (term.discountPct / 100))
  const subtotalAfterDiscount = grossSubtotal - discountAmt
  const tax = Math.round(subtotalAfterDiscount * 0.18)
  const total = subtotalAfterDiscount + tax

  const newSeatTotal = product.seats.total + seatCount
  const currentPct = Math.min(100, (product.seats.used / product.seats.total) * 100)
  const projectedPct = Math.min(100, (product.seats.used / Math.max(newSeatTotal, 1)) * 100)

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{ sx: { borderRadius: 3, overflow: 'hidden' } }}
    >
      <DialogTitle sx={{ p: 0 }}>
        <Box sx={{ px: 3, pt: 2.5, pb: 2 }}>
          <Stack direction="row" alignItems="flex-start" justifyContent="space-between" spacing={1.5}>
            <Box sx={{ minWidth: 0 }}>
              <Typography sx={{ fontWeight: 700, fontSize: 16, color: 'text.primary', lineHeight: 1.3 }}>
                Buy licenses
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
                Add seat capacity to any product. Pay annually at ₹{fmtN(SEAT_PRICE)} per seat — save up to 20% with multi-year terms.
              </Typography>
            </Box>
            <IconButton size="small" onClick={onClose} aria-label="Close">
              <Icon name="x" size="sm" />
            </IconButton>
          </Stack>
        </Box>
        <Divider />
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        <Box sx={{ px: 3, py: 2 }}>
          <Stack spacing={2}>
            {/* Product picker */}
            <Box>
              <Typography sx={{ fontWeight: 600, fontSize: 13, color: 'text.primary', mb: 1 }}>
                Product
              </Typography>
              <EnhancedTextField
                select
                size="small"
                fullWidth
                value={productId}
                onChange={(e) => setProductId(e.target.value)}
                SelectProps={{
                  renderValue: (value) => {
                    const p = products.find((x) => x.id === value)
                    if (!p) return null
                    return (
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Icon name={PRODUCT_ICON[p.id] ?? 'cube'} size="sm" />
                        <Typography sx={{ fontWeight: 600, fontSize: 13 }}>{p.name}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          · {p.seats.used}/{p.seats.total} seats
                        </Typography>
                      </Stack>
                    )
                  },
                }}
              >
                {products.map((p) => (
                  <MenuItem key={p.id} value={p.id}>
                    <Stack direction="row" alignItems="center" spacing={1} sx={{ width: '100%' }}>
                      <Icon name={PRODUCT_ICON[p.id] ?? 'cube'} size="sm" />
                      <Typography sx={{ fontWeight: 500, fontSize: 13, flex: 1 }}>{p.name}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {p.seats.used}/{p.seats.total} seats
                      </Typography>
                    </Stack>
                  </MenuItem>
                ))}
              </EnhancedTextField>
            </Box>

            {/* Product capacity preview */}
            <Box
              sx={(theme: Theme) => ({
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'divider',
                bgcolor: alpha(theme.palette.text.primary, 0.02),
                p: 1.5,
              })}
            >
              <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.25 }}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Chip
                    size="small"
                    label={STATUS_LABEL[product.status]}
                    color={STATUS_COLOR[product.status]}
                    variant="tonal"
                    sx={{ fontWeight: 600, fontSize: 10, height: 20 }}
                  />
                  <Typography variant="caption" color="text.secondary">
                    Expires {product.expiry}
                  </Typography>
                </Stack>
                {overage > 0 && (
                  <Typography variant="caption" sx={{ color: 'error.main', fontWeight: 600 }}>
                    {overage} seat{overage === 1 ? '' : 's'} over limit
                  </Typography>
                )}
              </Stack>

              {/* Current capacity */}
              <Stack spacing={0.5} sx={{ mb: 1 }}>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="caption" color="text.secondary">Current</Typography>
                  <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.primary' }}>
                    {product.seats.used} / {product.seats.total}
                  </Typography>
                </Stack>
                <Box sx={{ height: 6, borderRadius: 3, bgcolor: 'action.hover', overflow: 'hidden' }}>
                  <Box
                    sx={{
                      height: '100%',
                      width: `${currentPct}%`,
                      borderRadius: 3,
                      bgcolor: getBarColor(product.seats.used, product.seats.total),
                    }}
                  />
                </Box>
              </Stack>

              {/* Projected capacity */}
              <Stack spacing={0.5}>
                <Stack direction="row" justifyContent="space-between">
                  <Stack direction="row" alignItems="center" spacing={0.5}>
                    <Icon name="arrow-right" size="sm" />
                    <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 600 }}>
                      After purchase
                    </Typography>
                  </Stack>
                  <Typography variant="caption" sx={{ fontWeight: 600, color: 'primary.main' }}>
                    {product.seats.used} / {newSeatTotal}
                  </Typography>
                </Stack>
                <Box sx={{ height: 6, borderRadius: 3, bgcolor: 'action.hover', overflow: 'hidden' }}>
                  <Box
                    sx={{
                      height: '100%',
                      width: `${projectedPct}%`,
                      borderRadius: 3,
                      bgcolor: 'primary.main',
                      transition: 'width 0.3s ease',
                    }}
                  />
                </Box>
              </Stack>
            </Box>

            {/* Seat quantity */}
            <Box>
              <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
                <Typography sx={{ fontWeight: 600, fontSize: 13, color: 'text.primary' }}>
                  Number of seats to add
                </Typography>
                <Stack
                  direction="row"
                  alignItems="center"
                  spacing={0}
                  sx={{
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 1.5,
                    overflow: 'hidden',
                  }}
                >
                  <IconButton
                    size="small"
                    onClick={() => setSeatCount(Math.max(1, seatCount - 1))}
                    disabled={seatCount <= 1}
                    sx={{ borderRadius: 0, px: 0.75 }}
                    aria-label="Decrease seats"
                  >
                    <Icon name="minus" size="sm" />
                  </IconButton>
                  <Box
                    sx={{
                      minWidth: 48,
                      textAlign: 'center',
                      fontWeight: 700,
                      fontSize: 13,
                      color: 'text.primary',
                      borderLeft: '1px solid',
                      borderRight: '1px solid',
                      borderColor: 'divider',
                      py: 0.5,
                    }}
                  >
                    {seatCount}
                  </Box>
                  <IconButton
                    size="small"
                    onClick={() => setSeatCount(seatCount + 1)}
                    sx={{ borderRadius: 0, px: 0.75 }}
                    aria-label="Increase seats"
                  >
                    <Icon name="plus" size="sm" />
                  </IconButton>
                </Stack>
              </Stack>
              <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
                {SEAT_PACKS.map((n) => {
                  const isSelected = seatCount === n
                  return (
                    <Box
                      key={n}
                      role="button"
                      tabIndex={0}
                      onClick={() => setSeatCount(n)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault()
                          setSeatCount(n)
                        }
                      }}
                      sx={(theme: Theme) => ({
                        flex: '1 1 0',
                        minWidth: 64,
                        cursor: 'pointer',
                        textAlign: 'center',
                        borderRadius: 1.5,
                        border: '1px solid',
                        borderColor: isSelected ? 'primary.main' : 'divider',
                        bgcolor: isSelected ? alpha(theme.palette.primary.main, 0.06) : 'background.paper',
                        color: isSelected ? 'primary.main' : 'text.primary',
                        py: 0.625,
                        fontWeight: 600,
                        fontSize: 12,
                        transition: 'background-color 0.15s, border-color 0.15s',
                        '&:hover': { borderColor: isSelected ? 'primary.main' : 'text.secondary' },
                      })}
                    >
                      +{n}
                    </Box>
                  )
                })}
              </Stack>
            </Box>

            {/* Billing term */}
            <Box>
              <Typography sx={{ fontWeight: 600, fontSize: 13, color: 'text.primary', mb: 1 }}>
                Billing term
              </Typography>
              <Stack direction="row" spacing={1}>
                {BILLING_TERMS.map((t) => {
                  const isSelected = years === t.years
                  return (
                    <Box
                      key={t.years}
                      role="button"
                      tabIndex={0}
                      onClick={() => setYears(t.years)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault()
                          setYears(t.years)
                        }
                      }}
                      sx={(theme: Theme) => ({
                        flex: 1,
                        cursor: 'pointer',
                        borderRadius: 2,
                        border: '1px solid',
                        borderColor: isSelected ? 'primary.main' : 'divider',
                        bgcolor: isSelected ? alpha(theme.palette.primary.main, 0.06) : 'background.paper',
                        px: 1.25, py: 1,
                        transition: 'background-color 0.15s, border-color 0.15s',
                        '&:hover': { borderColor: isSelected ? 'primary.main' : 'text.secondary' },
                      })}
                    >
                      <Stack direction="row" alignItems="center" justifyContent="space-between">
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <Box
                            sx={(theme: Theme) => ({
                              width: 14, height: 14, borderRadius: '50%', flexShrink: 0,
                              border: '2px solid',
                              borderColor: isSelected ? 'primary.main' : alpha(theme.palette.text.secondary, 0.4),
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                            })}
                          >
                            {isSelected && (
                              <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: 'primary.main' }} />
                            )}
                          </Box>
                          <Typography sx={{ fontWeight: 600, fontSize: 12, color: 'text.primary' }}>
                            {t.label}
                          </Typography>
                        </Stack>
                        {t.badge && (
                          <Chip
                            size="small"
                            label={t.badge}
                            color="primary"
                            variant="tonal"
                            sx={{ fontWeight: 600, fontSize: 9, height: 16 }}
                          />
                        )}
                      </Stack>
                    </Box>
                  )
                })}
              </Stack>
            </Box>

            {/* Order summary */}
            <Box
              sx={(theme: Theme) => ({
                borderRadius: 2,
                bgcolor: alpha(theme.palette.primary.main, 0.04),
                border: '1px solid',
                borderColor: alpha(theme.palette.primary.main, 0.16),
                p: 1.75,
              })}
            >
              <Typography sx={{ fontWeight: 600, fontSize: 12, color: 'text.secondary', mb: 1, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Order summary
              </Typography>
              <Stack spacing={0.625}>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="caption" color="text.secondary">
                    {seatCount} seat{seatCount === 1 ? '' : 's'} × ₹{fmtN(SEAT_PRICE)}/yr × {years} yr{years === 1 ? '' : 's'}
                  </Typography>
                  <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.primary' }}>
                    ₹{fmtN(grossSubtotal)}
                  </Typography>
                </Stack>
                {term.discountPct > 0 && (
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="caption" sx={{ color: 'success.main', fontWeight: 600 }}>
                      Multi-year discount ({term.discountPct}%)
                    </Typography>
                    <Typography variant="caption" sx={{ fontWeight: 600, color: 'success.main' }}>
                      −₹{fmtN(discountAmt)}
                    </Typography>
                  </Stack>
                )}
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="caption" color="text.secondary">GST (18%)</Typography>
                  <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.primary' }}>
                    ₹{fmtN(tax)}
                  </Typography>
                </Stack>
                <Divider sx={{ my: 0.5 }} />
                <Stack direction="row" justifyContent="space-between" alignItems="baseline">
                  <Typography sx={{ fontWeight: 600, fontSize: 13, color: 'text.primary' }}>
                    Total due now
                  </Typography>
                  <Stack direction="row" alignItems="baseline" spacing={0.5}>
                    <Typography sx={{ fontWeight: 700, fontSize: 17, color: 'text.primary' }}>
                      ₹{fmtN(total)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      / {years} yr{years === 1 ? '' : 's'}
                    </Typography>
                  </Stack>
                </Stack>
              </Stack>
            </Box>
          </Stack>
        </Box>
      </DialogContent>

      <Divider />
      <DialogActions sx={{ px: 3, py: 1.5, gap: 1, justifyContent: 'space-between' }}>
        <Stack direction="row" alignItems="center" spacing={0.5}>
          <Icon name="shield-check" size="sm" />
          <Typography variant="caption" color="text.secondary">
            Secure checkout · Cancel anytime
          </Typography>
        </Stack>
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" color="neutral" size="medium" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="primary"
            size="medium"
            disabled={seatCount <= 0}
            onClick={() => onConfirm(product, seatCount, total)}
          >
            Proceed to checkout
          </Button>
        </Stack>
      </DialogActions>
    </Dialog>
  )
}
