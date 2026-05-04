import { USER_MANAGEMENT_ROLE_ROWS } from '../../data/userManagementRoles'
import { RoleDetailPage } from '../RoleDetailPage'
import { RBAC_IMPACT_BASE } from './constants'

const ADMIN_ROLE_ROW = USER_MANAGEMENT_ROLE_ROWS.find((r) => r.roleName === 'Admin')
const ADMIN_ROLE_ID = ADMIN_ROLE_ROW?.id ?? 'role-1'

/**
 * Pattern 02 — Full page: same experience as Role detail (Admin), including Manage Users / Privilege Set drawers.
 */
export function PatternWorkspaceSettingsDemoPage() {
  return (
    <RoleDetailPage
      roleIdOverride={ADMIN_ROLE_ID}
      backToPath={RBAC_IMPACT_BASE}
    />
  )
}
