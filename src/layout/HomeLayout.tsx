import { Outlet, useNavigate } from 'react-router-dom'
import { Box } from '@exotel-npm-dev/signal-design-system'
import { clearPlaygroundSession } from '../auth/playgroundSession'
import { TopBar } from './TopBar'

export function HomeLayout() {
  const navigate = useNavigate()

  const handleLogout = () => {
    clearPlaygroundSession()
    navigate('/sign-in', { replace: true })
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: 'background.default' }}>
      <TopBar onLogout={handleLogout} />
      <Box sx={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
        <Outlet />
      </Box>
    </Box>
  )
}
