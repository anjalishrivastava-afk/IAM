/** Row model for RBAC User Management — Roles (HDFC banking context for custom roles). */

export type RoleScopeType = 'system' | 'default' | 'custom'

export interface UserManagementRoleRow {
  id: string
  roleName: string
  description: string
  scopeType: RoleScopeType
  assignedUserCount: number
  createdBy: string
  createdAtLabel: string
}

export const USER_MANAGEMENT_ROLE_ROWS: UserManagementRoleRow[] = [
  {
    id: 'role-1',
    roleName: 'Admin',
    description: 'Manage users, roles, and organization settings',
    scopeType: 'system',
    assignedUserCount: 5,
    createdBy: 'Aditya Pratap Singh',
    createdAtLabel: 'Apr 11, 12:19',
  },
  {
    id: 'role-2',
    roleName: 'Manager',
    description: 'Manage team members and product resources',
    scopeType: 'custom',
    assignedUserCount: 12,
    createdBy: 'Rudrakshula Prasanth',
    createdAtLabel: 'Apr 11, 12:19',
  },
  {
    id: 'role-3',
    roleName: 'Member',
    description: 'Basic access to assigned products',
    scopeType: 'system',
    assignedUserCount: 45,
    createdBy: 'Rashika Jain',
    createdAtLabel: 'Apr 11, 12:19',
  },
  {
    id: 'role-4',
    roleName: 'Auditor',
    description: 'Read-only access to audit logs and reports',
    scopeType: 'custom',
    assignedUserCount: 3,
    createdBy: 'Anjali Srivastava',
    createdAtLabel: 'Apr 11, 12:19',
  },
]

/** Distinct role display names for RBAC filters and mock “current role” chips. */
export const USER_MANAGEMENT_ROLE_NAMES = USER_MANAGEMENT_ROLE_ROWS.map((r) => r.roleName)
