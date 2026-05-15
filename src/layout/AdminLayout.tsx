import { useState, type ChangeEvent } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { alpha } from '@mui/material/styles'
import type { Theme } from '@mui/material/styles'
import { Box, EnhancedTextField, Icon, IconButton, Stack, Typography } from '@exotel-npm-dev/signal-design-system'
import { clearPlaygroundSession } from '../auth/playgroundSession'
import { AiChatAssistLayoutDock, AiChatAssistProvider } from '../context/AiChatAssistLayoutContext'
import { TopBar } from './TopBar'

// ─── Admin nav structure ──────────────────────────────────────────────────────

type NavItem = { id: string; icon: string; label: string; path: string; state?: object }
type NavSection = { id: string; icon: string; label: string; children: NavItem[] }
type AdminNavEntry = NavItem | NavSection

const ADMIN_NAV: AdminNavEntry[] = [
  {
    id: 'user-management', icon: 'users', label: 'User Management',
    children: [
      { id: 'users',            icon: 'user',        label: 'Users',                path: '/admin/users',           state: { adminSection: 'users'  } },
      { id: 'groups',           icon: 'users-three', label: 'Groups',               path: '/admin/groups' },
      { id: 'roles-privileges', icon: 'shield-check', label: 'Roles and Privileges', path: '/admin/user-management', state: { adminSection: 'roles'  } },
    ],
  },
  { id: 'license-management', icon: 'identification-badge', label: 'License Management',    path: '/admin/license-management' },
  { id: 'resource-registry',  icon: 'cube',                  label: 'Resource Registry',     path: '/admin/resource-registry'  },
  { id: 'org-settings',       icon: 'buildings',             label: 'Organisation Settings', path: '/admin/org-settings'       },
  { id: 'api-keys',           icon: 'key',                   label: 'API Keys',              path: '/admin/api-keys'           },
  { id: 'sso-configuration',  icon: 'lock-key',              label: 'SSO Configuration',     path: '/admin/sso-configuration'  },
]

// ─── Admin sidebar ────────────────────────────────────────────────────────────

function isSection(entry: AdminNavEntry): entry is NavSection {
  return 'children' in entry
}

function AdminSidebar({ selectedItem, onSelect }: { selectedItem: string; onSelect: (id: string) => void }) {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<'auth' | 'admin'>('admin')
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['user-management']))
  const [search, setSearch] = useState('')

  const filteredNav = ADMIN_NAV.map((entry) => {
    if (!search) return entry
    if (isSection(entry)) {
      const children = entry.children.filter((c) => c.label.toLowerCase().includes(search.toLowerCase()))
      return children.length ? { ...entry, children } : null
    }
    return (entry as NavItem).label.toLowerCase().includes(search.toLowerCase()) ? entry : null
  }).filter(Boolean) as AdminNavEntry[]

  return (
    <Box sx={{ width: 230, flexShrink: 0, display: 'flex', flexDirection: 'column', bgcolor: 'background.paper', borderRight: '1px solid', borderColor: 'divider', height: '100%', overflow: 'hidden' }}>

      {/* Search bar */}
      <Box sx={{ px: 1.5, pt: 1.5, pb: 1 }}>
        <EnhancedTextField
          showLabel={false}
          placeholder="Search"
          size="small"
          fullWidth
          value={search}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
          slotProps={{
            input: {
              startAdornment: <Box sx={{ color: 'text.disabled', display: 'flex', mr: 0.5 }}><Icon name="magnifying-glass" size="sm" /></Box>,
              endAdornment: search ? (
                <IconButton size="small" onClick={() => setSearch('')} aria-label="Clear search">
                  <Icon name="x" size="sm" />
                </IconButton>
              ) : (
                <Box sx={{ color: 'text.disabled', display: 'flex' }}><Icon name="sliders-horizontal" size="sm" /></Box>
              ),
            },
          }}
        />
      </Box>

      {/* Auth Screens / Admin Portal tabs */}
      <Stack direction="row" spacing={0.5} sx={{ px: 1.5, pb: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
        {(['auth', 'admin'] as const).map((tab) => (
          <Box
            key={tab}
            onClick={() => { setActiveTab(tab); if (tab === 'auth') navigate('/') }}
            sx={(theme: Theme) => ({
              flex: 1, py: 0.6, px: 1, textAlign: 'center',
              borderRadius: 1, cursor: 'pointer',
              bgcolor: activeTab === tab ? alpha(theme.palette.primary.main, 0.08) : 'transparent',
              border: activeTab === tab ? `1px solid ${theme.palette.primary.light}` : '1px solid transparent',
              '&:hover': { bgcolor: 'action.hover' },
            })}
          >
            <Typography sx={{ fontSize: 12, fontWeight: activeTab === tab ? 600 : 400, color: activeTab === tab ? 'primary.main' : 'text.secondary', lineHeight: 1.4 }}>
              {tab === 'auth' ? 'Auth Screens' : 'Admin Portal'}
            </Typography>
          </Box>
        ))}
      </Stack>

      {/* Nav items */}
      <Box sx={{ flex: 1, overflowY: 'auto', py: 1 }}>
        {filteredNav.map((entry) => {
          if (isSection(entry)) {
            const expanded = expandedSections.has(entry.id)
            return (
              <Box key={entry.id}>
                <Stack direction="row" alignItems="center" justifyContent="space-between"
                  onClick={() => setExpandedSections((prev) => { const next = new Set(prev); expanded ? next.delete(entry.id) : next.add(entry.id); return next })}
                  sx={{ px: 2, py: 0.875, mx: 0.75, cursor: 'pointer', borderRadius: 1.5, '&:hover': { bgcolor: 'action.hover' } }}
                >
                  <Stack direction="row" alignItems="center" spacing={1.25}>
                    <Box sx={{ color: 'text.secondary', display: 'flex', flexShrink: 0 }}><Icon name={entry.icon} size="sm" /></Box>
                    <Typography sx={{ fontSize: 13, fontWeight: 500, color: 'text.primary', lineHeight: 1.4 }}>{entry.label}</Typography>
                  </Stack>
                  <Box sx={{ color: 'text.disabled', display: 'flex' }}><Icon name={expanded ? 'caret-up' : 'caret-down'} size="sm" /></Box>
                </Stack>

                {expanded && entry.children.map((child) => {
                  const active = selectedItem === child.id
                  return (
                    <Stack key={child.id} direction="row" alignItems="center" spacing={1.25}
                      onClick={() => { onSelect(child.id); navigate(child.path, child.state ? { state: child.state } : undefined) }}
                      sx={(theme: Theme) => ({
                        pl: 4.5, pr: 2, py: 0.875, mx: 0.75, cursor: 'pointer', borderRadius: 1.5,
                        bgcolor: active ? alpha(theme.palette.primary.main, 0.08) : 'transparent',
                        '&:hover': { bgcolor: active ? alpha(theme.palette.primary.main, 0.12) : 'action.hover' },
                      })}
                    >
                      <Typography sx={{ fontSize: 13, fontWeight: active ? 600 : 400, color: active ? 'primary.main' : 'text.primary', lineHeight: 1.4 }}>
                        {child.label}
                      </Typography>
                    </Stack>
                  )
                })}
              </Box>
            )
          }

          const item = entry as NavItem
          const active = selectedItem === item.id
          return (
            <Stack key={item.id} direction="row" alignItems="center" spacing={1.25}
              onClick={() => { onSelect(item.id); navigate(item.path) }}
              sx={(theme: Theme) => ({
                px: 2, py: 0.875, mx: 0.75, cursor: 'pointer', borderRadius: 1.5,
                bgcolor: active ? alpha(theme.palette.primary.main, 0.08) : 'transparent',
                '&:hover': { bgcolor: active ? alpha(theme.palette.primary.main, 0.12) : 'action.hover' },
              })}
            >
              <Box sx={{ color: active ? 'primary.main' : 'text.secondary', display: 'flex', flexShrink: 0 }}><Icon name={item.icon} size="sm" /></Box>
              <Typography sx={{ fontSize: 13, fontWeight: active ? 600 : 400, color: active ? 'primary.main' : 'text.primary', lineHeight: 1.4 }}>{item.label}</Typography>
            </Stack>
          )
        })}
      </Box>

      {/* Bottom links */}
      <Box sx={{ flexShrink: 0, borderTop: '1px solid', borderColor: 'divider', py: 0.5 }}>
        {[{ icon: 'sliders', label: 'Customise Sidebar' }, { icon: 'question', label: 'Help and Support' }].map(({ icon, label }) => (
          <Stack key={label} direction="row" alignItems="center" spacing={1.25}
            sx={{ px: 2, py: 1.25, cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}>
            <Box sx={{ color: 'text.secondary', display: 'flex', flexShrink: 0 }}><Icon name={icon} size="sm" /></Box>
            <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>{label}</Typography>
          </Stack>
        ))}
      </Box>
    </Box>
  )
}

// ─── Layout ───────────────────────────────────────────────────────────────────

export function AdminLayout() {
  const navigate = useNavigate()
  const location = useLocation()

  // Derive default selected item from current path
  const defaultSelected = location.pathname === '/admin/user-management' ? 'roles-privileges' : 'users'
  const [selectedItem, setSelectedItem] = useState(defaultSelected)

  const handleLogout = () => {
    clearPlaygroundSession()
    navigate('/sign-in', { replace: true })
  }

  return (
    <AiChatAssistProvider>
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
        <TopBar onLogout={handleLogout} />
        <Box sx={{ display: 'flex', flex: 1, minHeight: 0, overflow: 'hidden' }}>
          <AdminSidebar selectedItem={selectedItem} onSelect={setSelectedItem} />
          <Box sx={{ flex: 1, minWidth: 0, overflow: 'auto', bgcolor: 'surface.elevation0', p: 1, display: 'flex', flexDirection: 'column' }}>
            <Outlet />
          </Box>
          <AiChatAssistLayoutDock />
        </Box>
      </Box>
    </AiChatAssistProvider>
  )
}
