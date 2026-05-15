import { alpha } from '@mui/material/styles'
import type { Theme } from '@mui/material/styles'
import { Box, Button, Card, Chip, Icon, Link, Stack, Typography } from '@exotel-npm-dev/signal-design-system'

// ─── Static data ──────────────────────────────────────────────────────────────

const STATS = [
  { label: 'Active Products', value: '4',       icon: 'cube',    color: 'primary.main' },
  { label: 'Seats Used',      value: '294/390', icon: 'users',   color: 'success.main' },
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
type ChipColor = 'success' | 'error' | 'warning' | 'secondary'
const STATUS_COLOR: Record<LicenseStatus, ChipColor> = {
  'active':        'success',
  'over-limit':    'error',
  'expiring-soon': 'warning',
  'trial':         'secondary',
}
const STATUS_ICON: Record<LicenseStatus, string> = {
  'active':        'check-circle',
  'over-limit':    'warning',
  'expiring-soon': 'clock',
  'trial':         'circles-three',
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
    name: 'Exolite',
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

// ─── Shared card sx ───────────────────────────────────────────────────────────

const CARD_SX = {
  borderRadius: 2,
  border: '1px solid',
  borderColor: 'divider',
  bgcolor: 'background.paper',
  overflow: 'hidden',
} as const

// ─── Usage progress bar ───────────────────────────────────────────────────────

function UsageBar({ used, total, isOver }: { used: number; total: number; isOver?: boolean }) {
  const pct = Math.min((used / total) * 100, 100)
  return (
    <Box sx={{ height: 5, borderRadius: 3, bgcolor: 'action.hover', overflow: 'hidden' }}>
      <Box
        sx={{
          height: '100%',
          width: `${pct}%`,
          borderRadius: 3,
          bgcolor: isOver ? 'error.main' : pct >= 75 ? 'warning.main' : 'primary.main',
          transition: 'width 0.4s ease',
        }}
      />
    </Box>
  )
}

// ─── Product license card ─────────────────────────────────────────────────────

function ProductCard({ product }: { product: ProductLicense }) {
  const isOver = product.status === 'over-limit'
  const seatsPct = (product.seats.used / product.seats.total) * 100
  const usagePct = (product.usage.used / product.usage.total) * 100

  return (
    <Card elevation={0} sx={CARD_SX}>
      <Box sx={{ p: 2.5 }}>
        {/* Header */}
        <Stack direction="row" alignItems="flex-start" justifyContent="space-between" sx={{ mb: 0.25 }}>
          <Typography sx={{ fontWeight: 700, fontSize: 16, color: 'text.primary' }}>{product.name}</Typography>
          <Chip
            size="small"
            label={STATUS_LABEL[product.status]}
            color={STATUS_COLOR[product.status]}
            variant="tonal"
            icon={
              <Box sx={{ display: 'flex', ml: '6px !important' }}>
                <Icon name={STATUS_ICON[product.status]} size="sm" />
              </Box>
            }
            sx={{ fontWeight: 600, fontSize: 11, height: 22, '& .MuiChip-icon': { mr: 0 } }}
          />
        </Stack>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
          Expires: {product.expiry}
        </Typography>

        {/* Seats */}
        <Stack spacing={0.5} sx={{ mb: 1.75 }}>
          <Stack direction="row" justifyContent="space-between">
            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>Seats</Typography>
            <Typography variant="body2" sx={{ fontWeight: 600, color: isOver ? 'error.main' : 'text.primary' }}>
              {product.seats.used} / {product.seats.total} used
            </Typography>
          </Stack>
          <UsageBar used={product.seats.used} total={product.seats.total} isOver={seatsPct > 100} />
        </Stack>

        {/* Usage */}
        <Stack spacing={0.5} sx={{ mb: 2 }}>
          <Stack direction="row" justifyContent="space-between">
            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
              Usage ({product.usage.label})
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 600, color: isOver ? 'error.main' : 'text.primary' }}>
              {fmtN(product.usage.used)} / {fmtN(product.usage.total)} this mo
            </Typography>
          </Stack>
          <UsageBar used={product.usage.used} total={product.usage.total} isOver={usagePct > 100} />
        </Stack>

        {/* Features */}
        <Box sx={{ mb: 2.5 }}>
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500, mb: 1, display: 'block' }}>
            Features
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0.75 }}>
            {product.features.map(({ name, enabled }) => (
              <Stack key={name} direction="row" alignItems="center" spacing={0.75}>
                <Box sx={{ color: enabled ? 'success.main' : 'action.disabled', display: 'flex', flexShrink: 0 }}>
                  <Icon name={enabled ? 'check-circle' : 'circle'} size="sm" />
                </Box>
                <Typography variant="caption" sx={{ color: enabled ? 'text.primary' : 'text.disabled', lineHeight: 1.4 }}>
                  {name}
                </Typography>
              </Stack>
            ))}
          </Box>
        </Box>

        {/* Action buttons */}
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" color="neutral" size="small" sx={{ flex: 1, textTransform: 'none', fontWeight: 500 }}>
            Manage Roles
          </Button>
          <Button variant="outlined" color="neutral" size="small" sx={{ flex: 1, textTransform: 'none', fontWeight: 500 }}>
            View Usage
          </Button>
          {product.cta === 'renew' && (
            <Button variant="contained" color="primary" size="small" sx={{ flex: 1, textTransform: 'none', fontWeight: 600 }}>
              Renew
            </Button>
          )}
          {product.cta === 'upgrade' && (
            <Button variant="contained" color="primary" size="small" sx={{ flex: 1, textTransform: 'none', fontWeight: 600 }}>
              Upgrade
            </Button>
          )}
        </Stack>
      </Box>
    </Card>
  )
}

// ─── Alert banner ─────────────────────────────────────────────────────────────

function AlertBanner({
  severity,
  icon,
  title,
  body,
  linkLabel,
}: {
  severity: 'warning' | 'error'
  icon: string
  title: string
  body: string
  linkLabel: string
}) {
  return (
    <Box
      sx={(theme: Theme) => ({
        p: 2,
        borderRadius: 1.5,
        border: `1px solid ${severity === 'warning' ? alpha(theme.palette.warning.main, 0.40) : alpha(theme.palette.error.main, 0.30)}`,
        bgcolor: severity === 'warning' ? alpha(theme.palette.warning.main, 0.05) : alpha(theme.palette.error.main, 0.05),
      })}
    >
      <Stack direction="row" spacing={1.25} alignItems="flex-start">
        <Box sx={{ color: severity === 'warning' ? 'warning.main' : 'error.main', display: 'flex', flexShrink: 0, mt: 0.1 }}>
          <Icon name={icon} size="sm" />
        </Box>
        <Box>
          <Typography sx={{ fontWeight: 700, fontSize: 13, color: severity === 'warning' ? 'warning.dark' : 'error.dark', mb: 0.2 }}>
            {title}
          </Typography>
          <Typography sx={{ fontSize: 13, color: severity === 'warning' ? 'warning.dark' : 'error.dark', lineHeight: 1.5 }}>
            {body}{' '}
            <Link href="#" underline="always" sx={{ fontSize: 13, color: severity === 'warning' ? 'warning.dark' : 'error.dark', fontWeight: 600 }}>
              {linkLabel}
            </Link>
          </Typography>
        </Box>
      </Stack>
    </Box>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function LicenseManagementPage() {
  const gridProducts = PRODUCTS.filter((p) => !p.fullWidth)
  const fullWidthProducts = PRODUCTS.filter((p) => p.fullWidth)

  return (
    <Box sx={{ maxWidth: 1100, mx: 'auto', px: 3, py: 3 }}>
      {/* Page header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="title3" component="h1" sx={{ fontWeight: 700, mb: 0.5 }}>
          Licenses &amp; Usage
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Monitor product licenses and usage across your organization
        </Typography>
      </Box>

      {/* Stat cards — same pattern as AdminUserManagementPage */}
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 2, mb: 3 }}>
        {STATS.map(({ label, value, icon, color }) => (
          <Card key={label} elevation={0} sx={{ ...CARD_SX, p: 2.5 }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 0.75 }}>{label}</Typography>
                <Typography sx={{ fontWeight: 700, fontSize: 28, lineHeight: 1.1, color: 'text.primary' }}>{value}</Typography>
              </Box>
              <Box
                sx={(theme: Theme) => ({
                  width: 44, height: 44, borderRadius: '50%',
                  bgcolor: alpha(
                    color === 'primary.main'  ? theme.palette.primary.main
                    : color === 'success.main' ? theme.palette.success.main
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
        ))}
      </Box>

      {/* Alert banners */}
      <Stack spacing={1.5} sx={{ mb: 3 }}>
        <AlertBanner
          severity="warning"
          icon="clock"
          title="Licenses Expiring Soon"
          body="1 license expiring within 30 days."
          linkLabel="Renew now"
        />
        <AlertBanner
          severity="error"
          icon="warning"
          title="Usage Over Limit"
          body="1 product at 105% – overage charges may apply."
          linkLabel="Contact sales"
        />
      </Stack>

      {/* 2-column product grid */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2.5, mb: 2.5 }}>
        {gridProducts.map((p) => <ProductCard key={p.id} product={p} />)}
      </Box>

      {/* Full-width product(s) */}
      {fullWidthProducts.map((p) => <ProductCard key={p.id} product={p} />)}
    </Box>
  )
}
