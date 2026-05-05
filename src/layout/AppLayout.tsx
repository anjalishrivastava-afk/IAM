import { useMemo } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import type { NavigateFunction } from 'react-router-dom'
import {
  Box,
  AppBar as ExoAppBar,
  Icon,
  Navigation,
  useLoadDataByTheme,
  useThemeMode,
  type NavSectionProps,
} from '@exotel-npm-dev/signal-design-system'
import { clearPlaygroundSession } from '../auth/playgroundSession'
import { ArchbeeDocsWidget } from '../components/ArchbeeDocsWidget'
import { AiChatAssistLayoutDock, AiChatAssistProvider } from '../context/AiChatAssistLayoutContext'
// import { BRAND_LOGO } from '../constants/app'
import brandLogoLight from '../assets/exotel-playground-logo-light.svg'
import brandLogoDark from '../assets/exotel-playground-logo-dark.svg'

function buildNavSections(navigate: NavigateFunction): NavSectionProps[] {
  const go = (path: string) => () => navigate(path)

  return [
    {
      items: [
        {
          id: 'home',
          iconName: 'house',
          label: 'Home',
          path: '/',
          openNewPage: false,
          onClick: go('/'),
        },
        {
          id: 'example-table',
          iconName: 'columns',
          label: 'Example - Table Page',
          path: '/example-table',
          openNewPage: false,
          onClick: go('/example-table'),
        },
        {
          id: 'rbac',
          iconName: 'columns',
          label: 'RBAC',
          path: '/closed-interaction',
          openNewPage: false,
          onClick: go('/closed-interaction'),
          children: [
            {
              id: 'closed-interaction-user-management',
              iconName: 'users',
              label: 'User Management',
              path: '/closed-interaction/user-management',
              openNewPage: false,
              onClick: go('/closed-interaction/user-management'),
            },
            {
              id: 'rbac-ui-impact',
              iconName: 'chart-line',
              label: 'RBAC UI Impact',
              path: '/rbac-ui-impact',
              openNewPage: false,
              onClick: go('/rbac-ui-impact'),
            },
          ],
        },
        {
          id: 'date-time',
          iconName: 'calendar-blank',
          label: 'Example - Date & Time',
          path: '/date-time',
          openNewPage: false,
          onClick: go('/date-time'),
        },
        {
          id: 'example-settings',
          iconName: 'gear',
          label: 'Example - Settings',
          path: '/example-settings',
          openNewPage: false,
          onClick: go('/example-settings'),
        },
        {
          id: 'example-node',
          iconName: 'layout',
          label: 'Example - Node Flow',
          path: '/example-node',
          openNewPage: false,
          onClick: go('/example-node'),
        },
        {
          id: 'example-4',
          iconName: 'chart-bar',
          label: 'Example 4',
          openNewPage: false,
          children: [
            {
              id: 'example-4-child-1',
              iconName: 'circle',
              label: 'Child 1',
              path: '/example-4/child-1',
              openNewPage: false,
              onClick: go('/example-4/child-1'),
            },
            {
              id: 'example-4-child-2',
              iconName: 'circle',
              label: 'Child 2',
              path: '/example-4/child-2',
              openNewPage: false,
              onClick: go('/example-4/child-2'),
            },
          ],
        },
      ],
    },
    {
      label: 'APPS',
      items: [
        {
          id: 'app-1',
          iconName: 'squares-four',
          label: 'App 1',
          path: '/app-1',
          openNewPage: true,
          onClick: go('/app-1'),
        },
        {
          id: 'app-2',
          iconName: 'squares-four',
          label: 'App 2',
          path: '/app-2',
          openNewPage: true,
          onClick: go('/app-2'),
        },
      ],
    },
  ]
}

export function AppLayout() {
  const navigate = useNavigate()
  const { mode, setMode } = useThemeMode()
  const brandLogo = useLoadDataByTheme(brandLogoDark, brandLogoLight);

  const navSections = useMemo(() => buildNavSections(navigate), [navigate])

  return (
    <AiChatAssistProvider>
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
        <ExoAppBar
        appLauncherProps={{
          type: 'default',
          iconName: 'squares-four',
          products: [
            {
              id: 'design-playground',
              name: 'Design Playground',
              section: 'Products',
              icon: <Icon name="squares-four" size="sm" />,
              onProductClick: () => {},
            },
            {
              id: 'contact-center',
              name: 'Contact Center',
              section: 'Products',
              icon: <Icon name="headset" size="sm" />,
              onProductClick: () => {},
            },
            {
              id: 'campaigns',
              name: 'Campaigns',
              section: 'Products',
              icon: <Icon name="chart-bar" size="sm" />,
              onProductClick: () => {},
            },
          ],
        }}
        brandLogo={<img src={brandLogo} alt="Exotel Playground Logo" style={{ width: 'unset', height: 'unset' }} />}
        brandLogoStyle={{ width: 'unset', height: 'unset' }}
        avatarMenuProps={{
          avatarName: 'OP User',
          menuGroups: [
            {
              id: 'primary',
              items: [
                { id: 'item1', label: 'Menu Item 1', onClick: () => console.log('item1') },
                { id: 'item2', label: 'Menu Item 2', onClick: () => console.log('item2') },
                { id: 'item3', label: 'Menu Item 3', onClick: () => console.log('item3') },
              ],
            },
            {
              id: 'secondary',
              items: [
                { id: 'error-logs', label: 'Send Error Logs', onClick: () => console.log('error-logs') },
                { id: 'shortcuts', label: 'Keyboard Shortcuts', onClick: () => console.log('shortcuts') },
              ],
            }
          ],
          footerInfo: [{ label: 'Version', value: '1.0.0' }],
          selectedTheme: mode || 'system',
          onThemeChange: setMode,
          onLogout: () => {
            clearPlaygroundSession()
            navigate('/sign-in', { replace: true })
          },
        }}
        onNotificationClick={() => {}}
        />
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            flex: 1,
            minHeight: 0,
            minWidth: 0,
            overflow: 'hidden',
          }}
        >
          <Navigation items={navSections} />
          <Box
            sx={{
              minWidth: 0,
              minHeight: 0,
              flex: { xs: 1, md: '1 1 auto' },
              bgcolor: 'surface.elevation0',
              p: 1,
              overflow: 'auto',
              display: 'flex',
              flexDirection: 'column',
              order: { xs: 1, md: 1 },
            }}
          >
            <Outlet />
          </Box>
          <AiChatAssistLayoutDock />
        </Box>
      <ArchbeeDocsWidget />
    </Box>
    </AiChatAssistProvider>
  )
}
