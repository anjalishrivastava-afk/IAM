import { useMemo } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import type { NavigateFunction } from 'react-router-dom'
import { Box, Navigation, type NavSectionProps } from '@exotel-npm-dev/signal-design-system'
import { clearPlaygroundSession } from '../auth/playgroundSession'
import { ArchbeeDocsWidget } from '../components/ArchbeeDocsWidget'
import { AiChatAssistLayoutDock, AiChatAssistProvider } from '../context/AiChatAssistLayoutContext'
import { TopBar } from './TopBar'

function buildNavSections(navigate: NavigateFunction): NavSectionProps[] {
  const go = (path: string) => () => navigate(path)
  return [
    {
      items: [
        { id: 'home',             iconName: 'house',      label: 'Home',             path: '/',                 openNewPage: false, onClick: go('/') },
        {
          id: 'rbac', iconName: 'columns', label: 'RBAC', path: '/closed-interaction', openNewPage: false, onClick: go('/closed-interaction'),
          children: [
            { id: 'closed-interaction-user-management', iconName: 'users',      label: 'User Management', path: '/closed-interaction/user-management', openNewPage: false, onClick: go('/closed-interaction/user-management') },
            { id: 'rbac-ui-impact',                     iconName: 'chart-line', label: 'RBAC UI Impact',  path: '/rbac-ui-impact',                    openNewPage: false, onClick: go('/rbac-ui-impact') },
          ],
        },
        { id: 'example-settings', iconName: 'gear', label: 'Example - Settings', path: '/example-settings', openNewPage: false, onClick: go('/example-settings') },
      ],
    },
  ]
}

export function AppLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const navSections = useMemo(() => buildNavSections(navigate), [navigate])
  const isHome = location.pathname === '/'

  const handleLogout = () => {
    clearPlaygroundSession()
    navigate('/sign-in', { replace: true })
  }

  return (
    <AiChatAssistProvider>
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
        <TopBar onLogout={handleLogout} />
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, flex: 1, minHeight: 0, minWidth: 0, overflow: 'hidden' }}>
          {!isHome && <Navigation items={navSections} />}
          <Box sx={{ minWidth: 0, minHeight: 0, flex: { xs: 1, md: '1 1 auto' }, bgcolor: 'surface.elevation0', p: 1, overflow: 'auto', display: 'flex', flexDirection: 'column', order: { xs: 1, md: 1 } }}>
            <Outlet />
          </Box>
          <AiChatAssistLayoutDock />
        </Box>
        <ArchbeeDocsWidget />
      </Box>
    </AiChatAssistProvider>
  )
}
