import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { isPlaygroundAuthenticated } from '../auth/playgroundSession'

export function RequireAuth() {
  const location = useLocation()
  if (!isPlaygroundAuthenticated()) {
    return <Navigate to="/sign-in" replace state={{ from: location.pathname }} />
  }
  return <Outlet />
}
