import type Database from 'better-sqlite3'

export type RemovedFromOtherRole = {
  roleId: string
  roleName: string
  removedUserNames: string[]
}

function userKey(displayName: string): string {
  return displayName.trim().toLowerCase()
}

/**
 * Prototype invariant: each person appears under at most one role.
 * Removes the given users (matched case-insensitively on stored `user_name`) from every role
 * except `keeperRoleId`. Updates each affected role's `assigned_user_count` and `updated_at`.
 */
export function removeUsersFromOtherRoles(
  db: Database.Database,
  keeperRoleId: string,
  userDisplayNames: string[],
  updatedAtIso: string,
): RemovedFromOtherRole[] {
  const keys = new Set(userDisplayNames.map(userKey))
  if (keys.size === 0) return []

  const altered: RemovedFromOtherRole[] = []

  const otherRoles = db
    .prepare(`SELECT id, role_name FROM role WHERE id != ?`)
    .all(keeperRoleId) as { id: string; role_name: string }[]

  const selectStmt = db.prepare(
    `SELECT user_name FROM role_assigned_user WHERE role_id = ? ORDER BY sort_order`,
  )
  const delStmt = db.prepare(`DELETE FROM role_assigned_user WHERE role_id = ?`)
  const insStmt = db.prepare(
    `INSERT INTO role_assigned_user (id, role_id, user_name, sort_order) VALUES (?, ?, ?, ?)`,
  )
  const updStmt = db.prepare(`UPDATE role SET assigned_user_count = ?, updated_at = ? WHERE id = ?`)

  for (const { id: rid, role_name } of otherRoles) {
    const current = (selectStmt.all(rid) as { user_name: string }[]).map((r) => r.user_name)
    const removedUserNames = current.filter((u) => keys.has(userKey(u)))
    if (!removedUserNames.length) continue
    const next = current.filter((u) => !keys.has(userKey(u)))

    delStmt.run(rid)
    let order = 0
    for (const userName of next) {
      insStmt.run(`rau-${rid}-${order}`, rid, userName, order++)
    }
    updStmt.run(next.length, updatedAtIso, rid)
    altered.push({ roleId: rid, roleName: role_name, removedUserNames })
  }

  return altered
}
