/** Account lifecycle status for the users table */
export type TableUserStatus = 'Active' | 'Suspended' | 'Scheduled for Deletion'

/** Row shape returned by the users table API */
export type TableUserRow = {
  id: number
  userName: string
  email: string
  status: TableUserStatus
  role: string
  team: string
}

/** Paginated chunk response (same shape a REST API might return) */
export type UsersPageResponse = {
  total: number
  page: number
  pageSize: number
  rows: TableUserRow[]
}
