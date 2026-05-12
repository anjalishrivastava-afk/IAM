/** Row for the User Management » Users directory grid (GET /api/users). */
export type UserManagementDirectoryRow = {
  id: string
  displayName: string
  email: string | null
  branch: string | null
  source: 'directory' | 'rbac_assignment'
  assignedRoleId: string | null
  assignedRoleName: string | null
  channel: string | null
  /** 0–100; shown as percent in Capacity column. */
  capacity: number | null
  campaigns: string | null
  /** Organizational groups (Groups column). */
  groups: string[]
}
