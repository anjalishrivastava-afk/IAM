import { useState } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { alpha } from '@mui/material/styles'
import type { Theme } from '@mui/material/styles'
import { Box, Icon, Stack, Typography } from '@exotel-npm-dev/signal-design-system'
import { clearPlaygroundSession } from '../auth/playgroundSession'
import { AiChatAssistLayoutDock, AiChatAssistProvider } from '../context/AiChatAssistLayoutContext'
import { TopBar } from './TopBar'

// ─── Admin nav items ──────────────────────────────────────────────────────────

const ADMIN_NAV = [
  { id: 'user-management',           icon: 'users',          label: 'User Management',           path: '/admin/user-management' },
  { id: 'license-management',        icon: 'credit-card',    label: 'License Management',        path: '/admin/license-management' },
  { id: 'resource-registry',         icon: 'squares-four',   label: 'Resource Registry',         path: '/admin/resource-registry' },
  { id: 'org-settings',              icon: 'buildings',      label: 'Organization Settings',     path: '/admin/org-settings' },

  { id: 'exotel-product-mgmt',       icon: 'package',        label: 'Exotel Product Management', path: '/admin/exotel-product-mgmt' },
  { id: 'api-keys',                  icon: 'key',            label: 'API Keys',                  path: '/admin/api-keys' },
  { id: 'sso-configuration',         icon: 'lock',           label: 'SSO Configuration',         path: '/admin/sso-configuration' },
  { id: 'sessions',                  icon: 'clock',          label: 'Sessions',                  path: '/admin/sessions' },
  { id: 'audit-logs',                icon: 'list-bullets',   label: 'Audit Logs',                path: '/admin/audit-logs' },
  { id: 'account-hierarchy',         icon: 'tree-structure', label: 'Account Hierarchy',         path: '/admin/account-hierarchy' },
]

// ─── Admin sidebar ────────────────────────────────────────────────────────────

function AdminSidebar() {
  const navigate = useNavigate()
  const location = useLocation()
  const [activeTab, setActiveTab] = useState<'auth' | 'admin'>('admin')

  return (
    <Box
      sx={{
        width: 220, flexShrink: 0,
        display: 'flex', flexDirection: 'column',
        bgcolor: 'background.paper',
        borderRight: '1px solid', borderColor: 'divider',
        height: '100%', overflow: 'hidden',
      }}
    >
      {/* Brand header */}
      <Stack direction="row" alignItems="center" spacing={1.5} sx={{ px: 2, py: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
        <Box
          sx={{
            width: 36, height: 36, borderRadius: 1.5, flexShrink: 0,
            bgcolor: 'primary.main',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <Typography sx={{ color: '#fff', fontWeight: 700, fontSize: 16, lineHeight: 1 }}>E</Typography>
        </Box>
        <Box>
          <Typography sx={{ fontWeight: 700, fontSize: 14, lineHeight: 1.3, color: 'text.primary' }}>Exotel</Typography>
          <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>IAM System</Typography>
        </Box>
      </Stack>

      {/* Tabs */}
      <Stack direction="row" spacing={0.5} sx={{ px: 1.5, py: 1.25, borderBottom: '1px solid', borderColor: 'divider' }}>
        {(['auth', 'admin'] as const).map((tab) => (
          <Box
            key={tab}
            onClick={() => {
              setActiveTab(tab)
              if (tab === 'auth') navigate('/')
            }}
            sx={(theme: Theme) => ({
              flex: 1, py: 0.75, px: 1, textAlign: 'center',
              borderRadius: 1, cursor: 'pointer',
              bgcolor: activeTab === tab ? alpha(theme.palette.primary.main, 0.08) : 'transparent',
              border: activeTab === tab ? `1px solid ${theme.palette.primary.light}` : '1px solid transparent',
              '&:hover': { bgcolor: 'action.hover' },
            })}
          >
            <Typography
              sx={{
                fontSize: 12, fontWeight: activeTab === tab ? 600 : 400,
                color: activeTab === tab ? 'primary.main' : 'text.secondary',
                lineHeight: 1.4,
              }}
            >
              {tab === 'auth' ? 'Auth Screens' : 'Admin Portal'}
            </Typography>
          </Box>
        ))}
      </Stack>

      {/* Nav items */}
      <Box sx={{ flex: 1, overflowY: 'auto', py: 1 }}>
        <Typography
          sx={{ px: 2, py: 0.75, fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'text.disabled' }}
        >
          Admin Portal
        </Typography>

        {ADMIN_NAV.map(({ id, icon, label, path }) => {
          const active = location.pathname === path || (location.pathname === '/admin/user-management' && id === 'user-management')
          return (
            <Stack
              key={id}
              direction="row"
              alignItems="center"
              spacing={1.25}
              onClick={() => navigate(path)}
              sx={(theme: Theme) => ({
                px: 2, py: 1, mx: 0.75, cursor: 'pointer',
                borderRadius: 1.5,
                bgcolor: active ? alpha(theme.palette.primary.main, 0.08) : 'transparent',
                '&:hover': { bgcolor: active ? alpha(theme.palette.primary.main, 0.12) : 'action.hover' },
              })}
            >
              <Box sx={{ color: active ? 'primary.main' : 'text.secondary', display: 'flex', flexShrink: 0 }}>
                <Icon name={icon} size="sm" />
              </Box>
              <Typography
                sx={{
                  fontSize: 13, fontWeight: active ? 600 : 400,
                  color: active ? 'primary.main' : 'text.primary',
                  lineHeight: 1.4,
                }}
              >
                {label}
              </Typography>
            </Stack>
          )
        })}
      </Box>

      {/* Bottom card */}
      <Box
        sx={(theme: Theme) => ({
          m: 1.5, p: 2, borderRadius: 2,
          bgcolor: alpha(theme.palette.primary.main, 0.06),
          border: `1px solid ${theme.palette.primary.light}`,
        })}
      >
        <Typography sx={{ fontSize: 13, fontWeight: 700, color: 'text.primary', mb: 0.5 }}>
          White-Label IAM System
        </Typography>
        <Typography sx={{ fontSize: 12, color: 'text.secondary', lineHeight: 1.5 }}>
          Customize branding, colors, and settings in Organization Settings
        </Typography>
      </Box>
    </Box>
  )
}

// ─── Layout ───────────────────────────────────────────────────────────────────

export function AdminLayout() {
  const navigate = useNavigate()

  const handleLogout = () => {
    clearPlaygroundSession()
    navigate('/sign-in', { replace: true })
  }

  return (
    <AiChatAssistProvider>
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
        <TopBar onLogout={handleLogout} />
        <Box sx={{ display: 'flex', flex: 1, minHeight: 0, overflow: 'hidden' }}>
          <AdminSidebar />
          <Box sx={{ flex: 1, minWidth: 0, overflow: 'auto', bgcolor: 'surface.elevation0', p: 1, display: 'flex', flexDirection: 'column' }}>
            <Outlet />
          </Box>
          <AiChatAssistLayoutDock />
        </Box>
      </Box>
    </AiChatAssistProvider>
  )
}
