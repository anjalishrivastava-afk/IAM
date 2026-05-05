/**
 * Clone / delete helpers for roles and privilege sets (SQLite + privilege tree).
 */
import { randomUUID } from 'node:crypto'
import type Database from 'better-sqlite3'

import { insertPrivilegeTree } from './seed.js'
import { formatCreatedAtLabel, nowIso } from './format.js'

type PermSeedDup = { id: string; label: string; granted: boolean; isKey?: boolean }
type SgSeedDup = {
  id: string
  title: string
  description: string
  grantedCount: number
  totalCount: number
  permissions: PermSeedDup[]
}
type CatSeedDup = {
  id: string
  title: string
  description: string
  sidebarCountLabel: number
  grantedCount: number
  totalCount: number
  subgroups: SgSeedDup[]
}

function loadPrivilegeTreeAsCatSeed(db: Database.Database, privilegeSetId: string): CatSeedDup[] {
  const cats = db
    .prepare(
      `SELECT * FROM privilege_category WHERE privilege_set_id = ? ORDER BY sort_order ASC`,
    )
    .all(privilegeSetId) as {
    id: string
    title: string
    description: string
    sidebar_count_label: number
    granted_count: number
    total_count: number
  }[]

  const subStmt = db.prepare(
    `SELECT * FROM privilege_subgroup WHERE category_id = ? ORDER BY sort_order ASC`,
  )

  const permStmt = db.prepare(`
    SELECT pp.id, pp.label, pp.default_granted, pp.is_plan_gated,
           COALESCE(pg.granted, pp.default_granted) as effective_granted
    FROM privilege_permission pp
    LEFT JOIN permission_grant pg ON pg.permission_id = pp.id AND pg.privilege_set_id = ?
    WHERE pp.subgroup_id = ?
    ORDER BY pp.sort_order ASC
  `)

  return cats.map((c) => {
    const sgs = subStmt.all(c.id) as {
      id: string
      title: string
      description: string
      granted_count: number
      total_count: number
    }[]

    const subgroups = sgs.map((sg) => {
      const perms = permStmt.all(privilegeSetId, sg.id) as {
        id: string
        label: string
        effective_granted: number
        is_plan_gated: number
      }[]

      const permissions: PermSeedDup[] = perms.map((p) => ({
        id: p.id,
        label: p.label,
        granted: Boolean(p.effective_granted),
        ...(p.is_plan_gated ? { isKey: true } : {}),
      }))

      const sgG = perms.filter((p) => !p.is_plan_gated && p.effective_granted).length

      return {
        id: sg.id,
        title: sg.title,
        description: sg.description,
        grantedCount: sgG,
        totalCount: permissions.length,
        permissions,
      }
    })

    const catG = subgroups.reduce((acc, sg) => acc + sg.grantedCount, 0)
    const catT = subgroups.reduce((acc, sg) => acc + sg.totalCount, 0)

    return {
      id: c.id,
      title: c.title,
      description: c.description,
      sidebarCountLabel: catT,
      grantedCount: catG,
      totalCount: catT,
      subgroups,
    }
  })
}

function regenerateIdsForDuplicateTree(categories: CatSeedDup[], prefix: string): void {
  let ci = 0
  let si = 0
  let pi = 0
  for (const cat of categories) {
    cat.id = `${prefix}_dc${ci++}_${randomUUID().slice(0, 8)}`
    for (const sg of cat.subgroups) {
      sg.id = `${prefix}_ds${si++}_${randomUUID().slice(0, 8)}`
      for (const p of sg.permissions) {
        p.id = `${prefix}_dp${pi++}_${randomUUID().slice(0, 8)}`
      }
    }
  }
}

function uniqueRoleCopyName(db: Database.Database, sourceName: string): string {
  const exists = db.prepare(`SELECT 1 FROM role WHERE role_name = ?`)
  let candidate = `Copy of ${sourceName}`
  let n = 2
  while (exists.get(candidate)) {
    candidate = `Copy of ${sourceName} (${n})`
    n++
  }
  return candidate
}

function uniquePrivilegeSetCopyName(db: Database.Database, sourceName: string): string {
  const exists = db.prepare(`SELECT 1 FROM privilege_set WHERE privilege_set_name = ?`)
  let candidate = `Copy of ${sourceName}`
  let n = 2
  while (exists.get(candidate)) {
    candidate = `Copy of ${sourceName} (${n})`
    n++
  }
  return candidate
}

export function deleteRoleById(db: Database.Database, roleId: string): boolean {
  const hit = db.prepare(`SELECT id FROM role WHERE id = ?`).get(roleId)
  if (!hit) return false
  db.prepare(`DELETE FROM role WHERE id = ?`).run(roleId)
  return true
}

export function deletePrivilegeSetById(db: Database.Database, privilegeSetId: string): boolean {
  const hit = db.prepare(`SELECT id FROM privilege_set WHERE id = ?`).get(privilegeSetId)
  if (!hit) return false
  db.prepare(`DELETE FROM privilege_set WHERE id = ?`).run(privilegeSetId)
  return true
}

export type DuplicateRoleOptions = {
  /**
   * When false, the duplicate has an empty roster (assigned_user_count 0).
   * Privilege set links from the source are always copied whenever they refer to existing sets.
   * Default true — matches full-clone UX for Duplicate in the UI.
   */
  copyAssignedUsers?: boolean
}

export function duplicateRole(
  db: Database.Database,
  sourceRoleId: string,
  options?: DuplicateRoleOptions,
): {
  id: string
  roleName: string
  description: string
  scopeType: string
  assignedUserCount: number
  createdBy: string
  createdAtLabel: string
} | null {
  const row = db.prepare(`SELECT * FROM role WHERE id = ?`).get(sourceRoleId) as
    | {
        role_name: string
        description: string
        scope_type: string
        created_by: string
      }
    | undefined
  if (!row) return null

  const copyAssignedUsers = options?.copyAssignedUsers ?? true

  const newName = uniqueRoleCopyName(db, row.role_name)
  const newId = `role-${randomUUID().slice(0, 10)}`
  const t = nowIso()

  const users = copyAssignedUsers
    ? (
        db
          .prepare(
            `SELECT user_name FROM role_assigned_user WHERE role_id = ? ORDER BY sort_order ASC`,
          )
          .all(sourceRoleId) as { user_name: string }[]
      ).map((x) => x.user_name)
    : []

  const privIds = (
    db.prepare(`SELECT privilege_set_id FROM role_privilege_set WHERE role_id = ?`).all(sourceRoleId) as {
      privilege_set_id: string
    }[]
  ).map((x) => x.privilege_set_id)

  const tx = db.transaction(() => {
    db.prepare(
      `
      INSERT INTO role (id, role_name, description, scope_type, assigned_user_count, created_by, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `,
    ).run(
      newId,
      newName,
      row.description,
      row.scope_type,
      users.length,
      row.created_by,
      t,
      t,
    )

    const insUser = db.prepare(`
      INSERT INTO role_assigned_user (id, role_id, user_name, sort_order)
      VALUES (?, ?, ?, ?)
    `)
    users.forEach((user_name, order) => {
      insUser.run(`rau-${newId}-${order}`, newId, user_name, order)
    })

    const insRp = db.prepare(`
      INSERT INTO role_privilege_set (role_id, privilege_set_id) VALUES (?, ?)
    `)
    for (const psId of privIds) {
      const ok = db.prepare(`SELECT id FROM privilege_set WHERE id = ?`).get(psId)
      if (ok) insRp.run(newId, psId)
    }

    for (const psId of privIds) {
      const c = db
        .prepare(`SELECT COUNT(*) as c FROM role_privilege_set WHERE privilege_set_id = ?`)
        .get(psId) as { c: number }
      db.prepare(`UPDATE privilege_set SET assigned_role_count = ?, updated_at = ? WHERE id = ?`).run(
        c.c,
        t,
        psId,
      )
    }
  })
  tx()

  return {
    id: newId,
    roleName: newName,
    description: row.description,
    scopeType: row.scope_type,
    assignedUserCount: users.length,
    createdBy: row.created_by,
    createdAtLabel: formatCreatedAtLabel(t),
  }
}

export function duplicatePrivilegeSet(
  db: Database.Database,
  sourcePsId: string,
): {
  id: string
  privilegeSetName: string
  description: string
  scopeType: string
  assignedRoleCount: number
  createdBy: string
  createdAtLabel: string
  usedByRoleNames: string[]
} | null {
  const ps = db.prepare(`SELECT * FROM privilege_set WHERE id = ?`).get(sourcePsId) as
    | {
        privilege_set_name: string
        description: string
        long_description: string
        scope_type: string
        created_by: string
      }
    | undefined
  if (!ps) return null

  const tree = loadPrivilegeTreeAsCatSeed(db, sourcePsId)
  if (tree.length === 0) return null

  const cloned = JSON.parse(JSON.stringify(tree)) as CatSeedDup[]
  const newId = `ps-${randomUUID().slice(0, 10)}`
  regenerateIdsForDuplicateTree(cloned, newId)

  const newName = uniquePrivilegeSetCopyName(db, ps.privilege_set_name)
  const t = nowIso()

  const tx = db.transaction(() => {
    db.prepare(
      `
      INSERT INTO privilege_set (id, privilege_set_name, description, long_description, scope_type, assigned_role_count, created_by, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, 0, ?, ?, ?)
    `,
    ).run(
      newId,
      newName,
      ps.description,
      ps.long_description,
      ps.scope_type,
      ps.created_by,
      t,
      t,
    )
    insertPrivilegeTree(db, newId, cloned as Parameters<typeof insertPrivilegeTree>[2])
  })
  tx()

  return {
    id: newId,
    privilegeSetName: newName,
    description: ps.description,
    scopeType: ps.scope_type,
    assignedRoleCount: 0,
    createdBy: ps.created_by,
    createdAtLabel: formatCreatedAtLabel(t),
    usedByRoleNames: [],
  }
}
