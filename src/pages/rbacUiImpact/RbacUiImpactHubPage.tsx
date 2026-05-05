import { Link as RouterLink } from 'react-router-dom'
import {
  Box,
  Breadcrumbs,
  Card,
  Link,
  Stack,
  Typography,
} from '@exotel-npm-dev/signal-design-system'
import type { Theme } from '@mui/material/styles'
import { RBAC_IMPACT_BASE } from './constants'

type PatternMeta = {
  id: string
  num: string
  tag: string
  title: string
  description: string
  to: string
  preview: React.ReactNode
}

function Card01Preview() {
  return (
    <Box
      sx={{
        position: 'relative',
        height: 112,
        borderRadius: 1,
        overflow: 'hidden',
        bgcolor: (t: Theme) => t.palette.grey[100],
        border: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Box sx={{ p: 1, opacity: 0.45 }}>
        <Box sx={{ height: 4, width: '40%', bgcolor: 'grey.400', borderRadius: 1, mb: 0.75 }} />
        <Box sx={{ height: 3, width: '55%', bgcolor: 'grey.300', borderRadius: 1, mb: 1 }} />
        {[1, 2, 3].map((i) => (
          <Box key={i} sx={{ height: 8, bgcolor: 'grey.200', borderRadius: 0.5, mb: 0.5 }} />
        ))}
      </Box>
      <Box
        sx={{
          position: 'absolute',
          top: 4,
          right: 4,
          bottom: 4,
          width: '48%',
          bgcolor: 'background.paper',
          borderRadius: 1,
          border: '1px solid',
          borderColor: 'divider',
          boxShadow: 2,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Box sx={{ p: 1, flex: 1 }}>
          <Box sx={{ height: 3, width: '70%', bgcolor: 'grey.300', borderRadius: 1, mb: 0.75 }} />
          <Box sx={{ height: 22, bgcolor: 'grey.100', borderRadius: 1, mb: 0.5 }} />
        </Box>
        <Box
          sx={{
            p: 1,
            borderTop: '1px solid',
            borderColor: 'divider',
            display: 'flex',
            gap: 0.5,
            justifyContent: 'flex-end',
            bgcolor: 'grey.50',
          }}
        >
          <Box sx={{ width: 44, height: 18, borderRadius: 1, bgcolor: 'primary.light', opacity: 0.25 }} />
          <Box sx={{ width: 36, height: 18, borderRadius: 1, border: '2px dashed', borderColor: 'primary.main' }} />
        </Box>
      </Box>
    </Box>
  )
}

function Card02Preview() {
  return (
    <Box
      sx={{
        height: 112,
        borderRadius: 1,
        bgcolor: (t: Theme) => t.palette.grey[100],
        border: '1px solid',
        borderColor: 'divider',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <Box sx={{ p: 1 }}>
        <Box sx={{ height: 4, width: '36%', bgcolor: 'grey.400', borderRadius: 1 }} />
        <Box sx={{ height: 64, mt: 1, bgcolor: 'background.paper', borderRadius: 1, border: '1px solid', borderColor: 'divider', p: 1 }}>
          <Box sx={{ height: 10, bgcolor: 'grey.200', borderRadius: 1, mb: 0.5 }} />
          <Box sx={{ height: 10, bgcolor: 'grey.200', borderRadius: 1, width: '80%' }} />
        </Box>
      </Box>
      <Box
        sx={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: 28,
          bgcolor: 'background.paper',
          borderTop: '3px solid',
          borderColor: 'primary.main',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 9,
          color: 'text.secondary',
        }}
      >
        sticky footer
      </Box>
    </Box>
  )
}

function Card03Preview() {
  return (
    <Box
      sx={{
        height: 112,
        borderRadius: 1,
        bgcolor: (t: Theme) => t.palette.grey[100],
        border: '1px solid',
        borderColor: 'divider',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5, p: 0.75 }}>
        <Box sx={{ width: 10, height: 10, borderRadius: '50%', border: '2px dashed', borderColor: 'warning.main' }} />
        <Box sx={{ width: 28, height: 14, borderRadius: 1, bgcolor: 'grey.300', border: '1px dashed warning.main' }} />
        <Box sx={{ width: 28, height: 14, borderRadius: 1, bgcolor: 'grey.300', border: '1px dashed warning.main' }} />
        <Box sx={{ width: 48, height: 14, borderRadius: 1, bgcolor: 'primary.main', opacity: 0.45 }} />
      </Box>
      <Stack spacing={0.5} sx={{ px: 1, pb: 1 }}>
        <Stack
          direction="row"
          alignItems="flex-start"
          justifyContent="space-between"
          sx={{
            bgcolor: 'background.paper',
            borderRadius: 1,
            border: '1px solid',
            borderColor: 'divider',
            px: 0.75,
            py: 0.6,
          }}
        >
          <Box sx={{ flex: 1, height: 10, bgcolor: 'grey.200', borderRadius: 0.5, maxWidth: '55%' }} />
          <Box
            sx={{
              width: 22,
              height: 14,
              borderRadius: 1,
              bgcolor: 'grey.100',
              border: '1px dashed',
              borderColor: 'text.disabled',
            }}
          />
        </Stack>
        <Stack
          direction="row"
          alignItems="flex-start"
          justifyContent="space-between"
          sx={{
            bgcolor: 'background.paper',
            borderRadius: 1,
            border: '1px solid',
            borderColor: 'divider',
            px: 0.75,
            py: 0.6,
          }}
        >
          <Box sx={{ flex: 1, height: 10, bgcolor: 'grey.200', borderRadius: 0.5, maxWidth: '55%' }} />
          <Box
            sx={{
              width: 22,
              height: 14,
              borderRadius: 1,
              bgcolor: 'grey.100',
              border: '1px dashed',
              borderColor: 'text.disabled',
            }}
          />
        </Stack>
      </Stack>
      <Box
        sx={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: 24,
          bgcolor: 'background.paper',
          borderTop: '2px solid',
          borderColor: 'warning.main',
        }}
      />
    </Box>
  )
}

function Card04Preview() {
  return (
    <Box
      sx={{
        height: 112,
        borderRadius: 1,
        bgcolor: (t: Theme) => t.palette.grey[100],
        border: '1px solid',
        borderColor: 'divider',
        p: 1,
      }}
    >
      <Stack direction="row" alignItems="center" justifyContent="center" spacing={0.25} sx={{ mb: 1 }}>
        {[1, 2, 3, 4].map((n) => (
          <Stack key={n} direction="row" alignItems="center" spacing={0.25}>
            <Box
              sx={{
                width: 22,
                height: 22,
                borderRadius: '50%',
                bgcolor: n === 2 ? 'primary.main' : n === 1 ? 'primary.dark' : 'grey.300',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: n <= 2 ? 'white' : 'text.secondary',
                fontSize: 10,
                fontWeight: 700,
                boxShadow: n === 2 ? '0 0 0 3px rgba(57,73,171,0.35)' : 'none',
              }}
            >
              {n === 1 ? '✓' : n}
            </Box>
            {n < 4 ? <Box sx={{ width: 12, height: 2, bgcolor: 'grey.400' }} /> : null}
          </Stack>
        ))}
      </Stack>
      <Box sx={{ mx: 'auto', width: '88%', height: 24, bgcolor: 'background.paper', borderRadius: 1, border: '1px solid', borderColor: 'divider' }} />
      <Stack direction="row" justifyContent="space-between" sx={{ mt: 0.75, px: 0.5 }}>
        <Box sx={{ width: 40, height: 14, borderRadius: 1, bgcolor: 'grey.400' }} />
        <Box sx={{ width: 36, height: 14, borderRadius: 1, bgcolor: 'primary.main', opacity: 0.35 }} />
      </Stack>
    </Box>
  )
}

const PATTERNS: PatternMeta[] = [
  {
    id: 'drawer',
    num: '01',
    tag: 'Drawer',
    title: 'Edit Contact',
    description: 'Contacts grid with toolbar filters; open a row to view or edit in a sticky drawer footer.',
    to: `${RBAC_IMPACT_BASE}/pattern/drawer`,
    preview: <Card01Preview />,
  },
  {
    id: 'full-page',
    num: '02',
    tag: 'Full page',
    title: 'Role detail (Admin)',
    description: 'Same full-page role workspace as User Management — edit mode, sticky bar, Manage Users & Privilege Set drawers.',
    to: `${RBAC_IMPACT_BASE}/pattern/full-page`,
    preview: <Card02Preview />,
  },
  {
    id: 'multi-action',
    num: '03',
    tag: 'Campaign',
    title: 'Campaign details',
    description:
      'Campaign shell — Publish stays global; Basic Settings and Channel Configuration each have their own Edit and sticky save footer (RBAC-scoped sections). Roles and Privilege Sets grids unchanged.',
    to: `${RBAC_IMPACT_BASE}/pattern/multi-action`,
    preview: <Card03Preview />,
  },
  {
    id: 'stepper',
    num: '04',
    tag: 'Stepper',
    title: 'Create new role',
    description: 'Progressive footer with Next, Previous, and a final commit verb.',
    to: `${RBAC_IMPACT_BASE}/pattern/stepper`,
    preview: <Card04Preview />,
  },
]

function PatternCard({ meta }: { meta: PatternMeta }) {
  return (
    <Card
      component={RouterLink}
      to={meta.to}
      sx={{
        height: '100%',
        display: 'block',
        textDecoration: 'none',
        color: 'inherit',
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        overflow: 'hidden',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: (t: Theme) => t.shadows[8],
          borderColor: 'primary.light',
        },
        '&:hover .pattern-card-cta': { opacity: 1 },
      }}
    >
      <Box sx={{ p: 2.5, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
          <Typography
            component="span"
            sx={{
              fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
              fontSize: 12,
              fontWeight: 600,
              color: 'text.secondary',
              letterSpacing: '0.08em',
            }}
          >
            {meta.num}
          </Typography>
          <Typography
            variant="caption"
            sx={{
              px: 1,
              py: 0.25,
              borderRadius: 10,
              bgcolor: (t: Theme) => t.palette.grey[100],
              color: 'text.secondary',
              fontWeight: 600,
            }}
          >
            {meta.tag}
          </Typography>
        </Stack>
        {meta.preview}
        <Box>
          <Typography variant="title3" sx={{ fontWeight: 700, mb: 0.5 }}>
            {meta.title}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.5 }}>
            {meta.description}
          </Typography>
        </Box>
        <Typography className="pattern-card-cta" variant="body3" sx={{ color: 'primary.main', fontWeight: 600, opacity: 0, transition: 'opacity 0.15s' }}>
          Open demo →
        </Typography>
      </Box>
    </Card>
  )
}

export function RbacUiImpactHubPage() {
  return (
    <Box
      sx={{
        maxWidth: 1200,
        mx: 'auto',
        py: { xs: 3, md: 5 },
        px: { xs: 2, sm: 3 },
      }}
    >
      <Breadcrumbs sx={{ mb: 3, color: 'text.secondary' }}>
        <Link component={RouterLink} to="/closed-interaction" underline="hover" variant="body2" color="text.secondary">
          RBAC
        </Link>
        <Typography variant="body2" color="text.primary">
          RBAC UI Impact
        </Typography>
      </Breadcrumbs>

      <Typography
        variant="caption"
        sx={{
          textTransform: 'uppercase',
          letterSpacing: '0.14em',
          fontWeight: 700,
          color: 'text.secondary',
          display: 'block',
          mb: 1.5,
        }}
      >
        Form action placement patterns for admin workflows
      </Typography>

      <Typography
        component="h1"
        sx={{
          fontSize: { xs: '2rem', md: '2.75rem' },
          fontWeight: 700,
          letterSpacing: '-0.02em',
          lineHeight: 1.15,
          mb: 2,
        }}
      >
        RBAC UI Impact
      </Typography>

      <Typography
        variant="body1"
        color="text.secondary"
        sx={{ maxWidth: 720, lineHeight: 1.7, mb: 5, fontSize: '1.05rem' }}
      >
        This hub showcases four repeatable patterns for where Edit, Save, Cancel, and related actions belong in admin and
        RBAC flows. Each card opens an interactive prototype you can explore before applying the same structure in live
        product work.
      </Typography>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, 1fr)',
            lg: 'repeat(4, 1fr)',
          },
          gap: 2.5,
        }}
      >
        {PATTERNS.map((p) => (
          <PatternCard key={p.id} meta={p} />
        ))}
      </Box>

      <Box
        sx={{
          mt: 6,
          py: 3,
          px: { xs: 2, md: 4 },
          borderLeft: '4px solid',
          borderColor: 'primary.main',
          bgcolor: (t: Theme) => t.palette.grey[50],
          borderRadius: 1,
        }}
      >
        <Typography
          variant="body1"
          sx={{
            fontStyle: 'italic',
            color: 'text.primary',
            maxWidth: 800,
            lineHeight: 1.75,
            fontSize: '1.1rem',
          }}
        >
          “Commit actions at the bottom of the container. Entity actions at the top. Navigation where movement naturally
          happens.”
        </Typography>
      </Box>
    </Box>
  )
}
