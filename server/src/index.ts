/**
 * Express API — RBAC playground backend (SQLite).
 */
import './load-env.js'

import express from 'express'
import cors from 'cors'
import { randomUUID } from 'node:crypto'

import { getDb } from './db.js'
import { formatCreatedAtLabel, nowIso } from './format.js'
import { buildMinimalCategoriesForNewPs, insertPrivilegeTree, runSeed, seedIfEmpty, wipeDatabase } from './seed.js'
import { registerCopilotRoutes } from './copilot/copilotRoutes.js'
import { normalizeSearch } from './textSearch.js'
import { searchAssignableUsers } from './userSearch.js'
import { removeUsersFromOtherRoles } from './roleAssignments.js'
import {
  deletePrivilegeSetById,
  deleteRoleById,
  duplicatePrivilegeSet,
  duplicateRole,
} from './duplicateAndDelete.js'

const PORT = Number(process.env.PORT ?? 3333)

const app = express()
app.use(cors({ origin: true }))
app.use(express.json({ limit: '2mb' }))

seedIfEmpty()

registerCopilotRoutes(app)

function buildAssignedRoleByUserNorm(
  db: ReturnType<typeof getDb>,
): Map<string, { roleId: string; roleName: string }> {
  const rows = db
    .prepare(
      `SELECT rau.user_name AS user_name, r.id AS role_id, r.role_name AS role_name
       FROM role_assigned_user rau
       INNER JOIN role r ON r.id = rau.role_id`,
    )
    .all() as { user_name: string; role_id: string; role_name: string }[]
  const m = new Map<string, { roleId: string; roleName: string }>()
  for (const row of rows) {
    const k = normalizeSearch(row.user_name)
    if (!k || m.has(k)) continue
    m.set(k, { roleId: row.role_id, roleName: row.role_name })
  }
  return m
}

/** Mock directory + RBAC-assignee identities (mentions / picker + copilot parity) */
app.get('/api/users', (req, res) => {
  const q = typeof req.query.q === 'string' ? req.query.q : ''
  const db = getDb()
  const { users } = searchAssignableUsers(db, q)
  const roleByNorm = buildAssignedRoleByUserNorm(db)
  res.json(
    users.map((u) => {
      const nk = normalizeSearch(u.displayName)
      const assigned = nk ? roleByNorm.get(nk) : undefined
      return {
        id: u.id,
        displayName: u.displayName,
        email: u.email || null,
        branch: u.branch ?? null,
        source: u.source,
        assignedRoleId: assigned?.roleId ?? null,
        assignedRoleName: assigned?.roleName ?? null,
        channel: u.channel ?? null,
        capacity: typeof u.capacity === 'number' ? u.capacity : null,
        campaigns: u.campaigns ?? null,
        groups: Array.isArray(u.groups) ? u.groups : [],
      }
    }),
  )
})

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'rbac-prototype-api' })
})

/** —— Roles —— */

app.get('/api/roles', (_req, res) => {
  const db = getDb()
  const rows = db
    .prepare(
      `
    SELECT id, role_name, description, scope_type, assigned_user_count, created_by, created_at, updated_at
    FROM role ORDER BY role_name COLLATE NOCASE
  `,
    )
    .all() as {
    id: string
    role_name: string
    description: string
    scope_type: string
    assigned_user_count: number
    created_by: string
    created_at: string
    updated_at: string
  }[]

  res.json(
    rows.map((r) => ({
      id: r.id,
      roleName: r.role_name,
      description: r.description,
      scopeType: r.scope_type,
      assignedUserCount: r.assigned_user_count,
      createdBy: r.created_by,
      createdAtLabel: formatCreatedAtLabel(r.created_at),
    })),
  )
})

app.post('/api/roles', (req, res) => {
  const { roleName, description, scopeType, createdBy } = req.body ?? {}
  if (typeof roleName !== 'string' || !roleName.trim()) {
    return res.status(400).json({ error: 'roleName is required' })
  }
  const desc = typeof description === 'string' ? description : ''
  const scope = scopeType === 'custom' || scopeType === 'default' ? scopeType : 'custom'
  const by = typeof createdBy === 'string' && createdBy.trim() ? createdBy.trim() : 'Local admin'
  const id = `role-${randomUUID().slice(0, 10)}`
  const t = nowIso()
  const db = getDb()
  db.prepare(
    `
    INSERT INTO role (id, role_name, description, scope_type, assigned_user_count, created_by, created_at, updated_at)
    VALUES (?, ?, ?, ?, 0, ?, ?, ?)
  `,
  ).run(id, roleName.trim(), desc, scope, by, t, t)

  const row = db
    .prepare(
      `SELECT id, role_name, description, scope_type, assigned_user_count, created_by, created_at FROM role WHERE id = ?`,
    )
    .get(id) as {
    id: string
    role_name: string
    description: string
    scope_type: string
    assigned_user_count: number
    created_by: string
    created_at: string
  }

  res.status(201).json({
    id: row.id,
    roleName: row.role_name,
    description: row.description,
    scopeType: row.scope_type,
    assignedUserCount: row.assigned_user_count,
    createdBy: row.created_by,
    createdAtLabel: formatCreatedAtLabel(row.created_at),
  })
})

app.get('/api/roles/:id/detail', (req, res) => {
  const db = getDb()
  const row = db
    .prepare(`SELECT * FROM role WHERE id = ?`)
    .get(req.params.id) as
    | {
        id: string
        role_name: string
        description: string
        scope_type: string
        assigned_user_count: number
        created_by: string
        created_at: string
      }
    | undefined
  if (!row) return res.status(404).json({ error: 'Role not found' })

  const assignedUsers = (
    db
      .prepare(`SELECT user_name FROM role_assigned_user WHERE role_id = ? ORDER BY sort_order ASC`)
      .all(req.params.id) as { user_name: string }[]
  ).map((x) => x.user_name)

  const privRows = db
    .prepare(
      `
      SELECT ps.id as id, ps.privilege_set_name as name
      FROM role_privilege_set rps
      JOIN privilege_set ps ON ps.id = rps.privilege_set_id
      WHERE rps.role_id = ?
      ORDER BY ps.privilege_set_name COLLATE NOCASE
    `,
    )
    .all(req.params.id) as { id: string; name: string }[]

  res.json({
    row: {
      id: row.id,
      roleName: row.role_name,
      description: row.description,
      scopeType: row.scope_type,
      assignedUserCount: assignedUsers.length,
      createdBy: row.created_by,
      createdAtLabel: formatCreatedAtLabel(row.created_at),
    },
    assignedUsers,
    privilegeSets: privRows.map((r) => r.name),
    privilegeSetIds: privRows.map((r) => r.id),
  })
})

app.patch('/api/roles/:id', (req, res) => {
  const db = getDb()
  const existing = db.prepare(`SELECT id FROM role WHERE id = ?`).get(req.params.id)
  if (!existing) return res.status(404).json({ error: 'Role not found' })

  const { roleName, description } = req.body ?? {}
  const updates: string[] = []
  const vals: (string | number)[] = []
  if (typeof roleName === 'string' && roleName.trim()) {
    updates.push('role_name = ?')
    vals.push(roleName.trim())
  }
  if (typeof description === 'string') {
    updates.push('description = ?')
    vals.push(description)
  }
  updates.push('updated_at = ?')
  vals.push(nowIso())
  if (updates.length === 1) return res.status(400).json({ error: 'No updates' })

  vals.push(req.params.id)
  db.prepare(`UPDATE role SET ${updates.join(', ')} WHERE id = ?`).run(...vals)
  res.json({ ok: true })
})

app.patch('/api/roles/:id/users', (req, res) => {
  const db = getDb()
  const existing = db.prepare(`SELECT id FROM role WHERE id = ?`).get(req.params.id)
  if (!existing) return res.status(404).json({ error: 'Role not found' })

  const { userNames } = req.body ?? {}
  if (!Array.isArray(userNames) || !userNames.every((u: unknown) => typeof u === 'string')) {
    return res.status(400).json({ error: 'userNames must be string[]' })
  }

  const rid = req.params.id
  const names = userNames as string[]
  const t = nowIso()
  const tx = db.transaction(() => {
    removeUsersFromOtherRoles(db, rid, names, t)
    db.prepare(`DELETE FROM role_assigned_user WHERE role_id = ?`).run(rid)
    let order = 0
    const ins = db.prepare(`
      INSERT INTO role_assigned_user (id, role_id, user_name, sort_order)
      VALUES (?, ?, ?, ?)
    `)
    for (const userName of names) {
      ins.run(`rau-${rid}-${order}`, rid, userName, order++)
    }
    db.prepare(`UPDATE role SET assigned_user_count = ?, updated_at = ? WHERE id = ?`).run(
      names.length,
      t,
      rid,
    )
  })
  tx()

  res.json({ ok: true })
})

app.patch('/api/roles/:id/privilege-sets', (req, res) => {
  const db = getDb()
  const existing = db.prepare(`SELECT id FROM role WHERE id = ?`).get(req.params.id)
  if (!existing) return res.status(404).json({ error: 'Role not found' })

  const { privilegeSetIds, privilegeSetNames } = req.body ?? {}

  let resolvedIds: string[] = []

  if (
    Array.isArray(privilegeSetIds) &&
    privilegeSetIds.length >= 0 &&
    privilegeSetIds.every((x: unknown) => typeof x === 'string')
  ) {
    resolvedIds = [...privilegeSetIds] as string[]
  } else if (
    Array.isArray(privilegeSetNames) &&
    privilegeSetNames.every((x: unknown) => typeof x === 'string')
  ) {
    const lookup = db.prepare(`SELECT id FROM privilege_set WHERE privilege_set_name = ?`)
    for (const name of privilegeSetNames as string[]) {
      const hit = lookup.get(name.trim()) as { id: string } | undefined
      if (hit) resolvedIds.push(hit.id)
    }
  } else {
    return res.status(400).json({ error: 'privilegeSetIds or privilegeSetNames must be string[]' })
  }

  const rid = req.params.id
  const tx = db.transaction(() => {
    db.prepare(`DELETE FROM role_privilege_set WHERE role_id = ?`).run(rid)
    const ins = db.prepare(`INSERT INTO role_privilege_set (role_id, privilege_set_id) VALUES (?, ?)`)
    for (const psId of resolvedIds) {
      const ps = db.prepare(`SELECT id FROM privilege_set WHERE id = ?`).get(psId)
      if (!ps) continue
      ins.run(rid, psId)
    }
    db.prepare(`UPDATE role SET updated_at = ? WHERE id = ?`).run(nowIso(), rid)

    /** refresh privilege_set.assigned_role_count */
    const allPs = db.prepare(`SELECT id FROM privilege_set`).all() as { id: string }[]
    const cntStmt = db.prepare(`
      SELECT COUNT(*) as c FROM role_privilege_set WHERE privilege_set_id = ?
    `)
    const updPs = db.prepare(`UPDATE privilege_set SET assigned_role_count = ?, updated_at = ? WHERE id = ?`)
    for (const { id } of allPs) {
      const c = cntStmt.get(id) as { c: number }
      updPs.run(c.c, nowIso(), id)
    }
  })
  tx()

  res.json({ ok: true })
})

app.delete('/api/roles/:id', (req, res) => {
  const ok = deleteRoleById(getDb(), req.params.id)
  if (!ok) return res.status(404).json({ error: 'Role not found' })
  res.status(204).end()
})

app.post('/api/roles/:id/duplicate', (req, res) => {
  const row = duplicateRole(getDb(), req.params.id)
  if (!row) return res.status(404).json({ error: 'Role not found' })
  res.status(201).json(row)
})

/** —— Privilege Sets —— */

app.get('/api/privilege-sets', (_req, res) => {
  const db = getDb()
  const rows = db
    .prepare(
      `
    SELECT id, privilege_set_name, description, scope_type, assigned_role_count, created_by, created_at
    FROM privilege_set ORDER BY privilege_set_name COLLATE NOCASE
  `,
    )
    .all() as {
    id: string
    privilege_set_name: string
    description: string
    scope_type: string
    assigned_role_count: number
    created_by: string
    created_at: string
  }[]

  const namesStmt = db.prepare(`
    SELECT r.role_name FROM role_privilege_set rps
    JOIN role r ON r.id = rps.role_id
    WHERE rps.privilege_set_id = ?
    ORDER BY r.role_name COLLATE NOCASE
  `)

  res.json(
    rows.map((r) => ({
      id: r.id,
      privilegeSetName: r.privilege_set_name,
      description: r.description,
      scopeType: r.scope_type,
      assignedRoleCount: r.assigned_role_count,
      createdBy: r.created_by,
      createdAtLabel: formatCreatedAtLabel(r.created_at),
      usedByRoleNames: (namesStmt.all(r.id) as { role_name: string }[]).map((x) => x.role_name),
    })),
  )
})

app.post('/api/privilege-sets', (req, res) => {
  const { privilegeSetName, description, scopeType, longDescription, createdBy } = req.body ?? {}
  if (typeof privilegeSetName !== 'string' || !privilegeSetName.trim()) {
    return res.status(400).json({ error: 'privilegeSetName is required' })
  }
  const scope = scopeType === 'custom' || scopeType === 'default' ? scopeType : 'custom'
  const desc = typeof description === 'string' ? description : ''
  const longDesc =
    typeof longDescription === 'string' && longDescription.trim()
      ? longDescription.trim()
      : desc || 'Configure access for teams using this privilege set.'
  const by = typeof createdBy === 'string' && createdBy.trim() ? createdBy.trim() : 'Local admin'

  const id = `ps-${randomUUID().slice(0, 10)}`
  const t = nowIso()
  const db = getDb()
  db.prepare(
    `
    INSERT INTO privilege_set (id, privilege_set_name, description, long_description, scope_type, assigned_role_count, created_by, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, 0, ?, ?, ?)
  `,
  ).run(id, privilegeSetName.trim(), desc, longDesc, scope, by, t, t)

  const categories = buildMinimalCategoriesForNewPs(id, privilegeSetName.trim())
  insertPrivilegeTree(db, id, categories)

  const row = db
    .prepare(
      `SELECT id, privilege_set_name, description, scope_type, assigned_role_count, created_by, created_at FROM privilege_set WHERE id = ?`,
    )
    .get(id) as {
    id: string
    privilege_set_name: string
    description: string
    scope_type: string
    assigned_role_count: number
    created_by: string
    created_at: string
  }

  res.status(201).json({
    id: row.id,
    privilegeSetName: row.privilege_set_name,
    description: row.description,
    scopeType: row.scope_type,
    assignedRoleCount: row.assigned_role_count,
    createdBy: row.created_by,
    createdAtLabel: formatCreatedAtLabel(row.created_at),
    usedByRoleNames: [] as string[],
  })
})

function mapDetail(db: ReturnType<typeof getDb>, privilegeSetId: string) {
  const ps = db
    .prepare(`SELECT * FROM privilege_set WHERE id = ?`)
    .get(privilegeSetId) as
    | {
        id: string
        privilege_set_name: string
        description: string
        long_description: string
        scope_type: string
        assigned_role_count: number
        created_by: string
        created_at: string
      }
    | undefined
  if (!ps) return null

  const usedBy = (
    db
      .prepare(
        `
      SELECT r.role_name FROM role_privilege_set rps
      JOIN role r ON r.id = rps.role_id
      WHERE rps.privilege_set_id = ?
      ORDER BY r.role_name COLLATE NOCASE
    `,
      )
      .all(privilegeSetId) as { role_name: string }[]
  ).map((r) => r.role_name)

  const cats =
    db.prepare(
      `
    SELECT * FROM privilege_category WHERE privilege_set_id = ? ORDER BY sort_order ASC
  `,
    )
    .all(privilegeSetId) as {
    id: string
    title: string
    description: string
    sidebar_count_label: number
    granted_count: number
    total_count: number
  }[]

  const subStmt = db.prepare(`
    SELECT * FROM privilege_subgroup WHERE category_id = ? ORDER BY sort_order ASC
  `)

  const permStmt = db.prepare(`
    SELECT pp.id, pp.label, pp.default_granted, pp.is_plan_gated,
           COALESCE(pg.granted, pp.default_granted) as effective_granted
    FROM privilege_permission pp
    LEFT JOIN permission_grant pg ON pg.permission_id = pp.id AND pg.privilege_set_id = ?
    WHERE pp.subgroup_id = ?
    ORDER BY pp.sort_order ASC
  `)

  const categories = cats.map((c) => {
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
        const permissions = perms.map((p) => ({
          id: p.id,
          label: p.label,
          granted: Boolean(p.effective_granted),
          ...(p.is_plan_gated ? { isKey: true } : {}),
        }))
        const gc = perms.filter((p) => !p.is_plan_gated && p.effective_granted).length
        return {
          id: sg.id,
          title: sg.title,
          description: sg.description,
          grantedCount: gc,
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

  return {
    base: {
      id: ps.id,
      privilegeSetName: ps.privilege_set_name,
      description: ps.description,
      scopeType: ps.scope_type,
      assignedRoleCount: usedBy.length,
      createdBy: ps.created_by,
      createdAtLabel: formatCreatedAtLabel(ps.created_at),
      usedByRoleNames: usedBy,
    },
    longDescription: ps.long_description,
    assignedRoleNames: usedBy,
    categories,
  }
}

app.get('/api/privilege-sets/:id/detail', (req, res) => {
  const detail = mapDetail(getDb(), req.params.id)
  if (!detail) return res.status(404).json({ error: 'Privilege set not found' })
  res.json(detail)
})

app.patch('/api/privilege-sets/:id', (req, res) => {
  const db = getDb()
  const existing = db.prepare(`SELECT id FROM privilege_set WHERE id = ?`).get(req.params.id)
  if (!existing) return res.status(404).json({ error: 'Privilege set not found' })

  const { privilegeSetName, description, longDescription } = req.body ?? {}
  const updates: string[] = []
  const vals: (string | number)[] = []
  if (typeof privilegeSetName === 'string' && privilegeSetName.trim()) {
    updates.push('privilege_set_name = ?')
    vals.push(privilegeSetName.trim())
  }
  if (typeof description === 'string') {
    updates.push('description = ?')
    vals.push(description)
  }
  if (typeof longDescription === 'string') {
    updates.push('long_description = ?')
    vals.push(longDescription)
  }
  updates.push('updated_at = ?')
  vals.push(nowIso())
  vals.push(req.params.id)
  if (updates.length === 1) return res.status(400).json({ error: 'No updates' })

  db.prepare(`UPDATE privilege_set SET ${updates.join(', ')} WHERE id = ?`).run(...vals)
  res.json({ ok: true })
})

app.patch('/api/privilege-sets/:id/roles', (req, res) => {
  const db = getDb()
  const psId = req.params.id
  const existing = db.prepare(`SELECT id FROM privilege_set WHERE id = ?`).get(psId)
  if (!existing) return res.status(404).json({ error: 'Privilege set not found' })

  const { roleIds } = req.body ?? {}
  if (!Array.isArray(roleIds) || !roleIds.every((x: unknown) => typeof x === 'string')) {
    return res.status(400).json({ error: 'roleIds must be string[]' })
  }

  const tx = db.transaction(() => {
    db.prepare(`DELETE FROM role_privilege_set WHERE privilege_set_id = ?`).run(psId)
    const ins = db.prepare(`INSERT INTO role_privilege_set (role_id, privilege_set_id) VALUES (?, ?)`)
    const roleOk = db.prepare(`SELECT id FROM role WHERE id = ?`)
    for (const rid of roleIds as string[]) {
      if (!roleOk.get(rid)) continue
      ins.run(rid, psId)
    }
    db.prepare(`UPDATE privilege_set SET updated_at = ? WHERE id = ?`).run(nowIso(), psId)

    /** refresh privilege_set.assigned_role_count — same tally as PATCH /roles/:id/privilege-sets */
    const allPs = db.prepare(`SELECT id FROM privilege_set`).all() as { id: string }[]
    const cntStmt = db.prepare(`
      SELECT COUNT(*) as c FROM role_privilege_set WHERE privilege_set_id = ?
    `)
    const updPs = db.prepare(`UPDATE privilege_set SET assigned_role_count = ?, updated_at = ? WHERE id = ?`)
    for (const { id } of allPs) {
      const c = cntStmt.get(id) as { c: number }
      updPs.run(c.c, nowIso(), id)
    }
  })
  tx()

  res.json({ ok: true })
})

app.patch('/api/privilege-sets/:id/grants', (req, res) => {
  const db = getDb()
  const psId = req.params.id
  const existing = db.prepare(`SELECT id FROM privilege_set WHERE id = ?`).get(psId)
  if (!existing) return res.status(404).json({ error: 'Privilege set not found' })

  const { grants } = req.body ?? {}
  if (!grants || typeof grants !== 'object') {
    return res.status(400).json({ error: 'grants object required' })
  }

  const upd = db.prepare(`
    UPDATE permission_grant SET granted = ? WHERE privilege_set_id = ? AND permission_id = ?
  `)
  const tx = db.transaction(() => {
    for (const [permissionId, granted] of Object.entries(grants as Record<string, unknown>)) {
      if (typeof granted !== 'boolean') continue
      const hit = db
        .prepare(
          `SELECT 1 FROM permission_grant WHERE privilege_set_id = ? AND permission_id = ?`,
        )
        .get(psId, permissionId)
      if (!hit) continue
      upd.run(granted ? 1 : 0, psId, permissionId)
    }
    db.prepare(`UPDATE privilege_set SET updated_at = ? WHERE id = ?`).run(nowIso(), psId)

    /** Recalculate category / subgroup tallies (best-effort for UI) */
    recalcTallies(db, psId)
  })
  tx()

  res.json({ ok: true })
})

app.delete('/api/privilege-sets/:id', (req, res) => {
  const ok = deletePrivilegeSetById(getDb(), req.params.id)
  if (!ok) return res.status(404).json({ error: 'Privilege set not found' })
  res.status(204).end()
})

app.post('/api/privilege-sets/:id/duplicate', (req, res) => {
  const row = duplicatePrivilegeSet(getDb(), req.params.id)
  if (!row) return res.status(404).json({ error: 'Privilege set not found' })
  res.status(201).json(row)
})

function recalcTallies(db: ReturnType<typeof getDb>, privilegeSetId: string): void {
  const cats = db.prepare(`SELECT id FROM privilege_category WHERE privilege_set_id = ?`).all(privilegeSetId) as {
    id: string
  }[]
  for (const { id: catId } of cats) {
    const sgs = db.prepare(`SELECT id FROM privilege_subgroup WHERE category_id = ?`).all(catId) as { id: string }[]

    for (const { id: sgId } of sgs) {
      const perms = db
        .prepare(
          `
        SELECT COALESCE(pg.granted, pp.default_granted) as g, pp.is_plan_gated
        FROM privilege_permission pp
        LEFT JOIN permission_grant pg ON pg.permission_id = pp.id AND pg.privilege_set_id = ?
        WHERE pp.subgroup_id = ?
      `,
        )
        .all(privilegeSetId, sgId) as { g: number; is_plan_gated: number }[]

      let sgG = 0
      for (const p of perms) {
        if (p.is_plan_gated) continue
        if (p.g) sgG++
      }
      const sgTotal = perms.length

      db.prepare(`UPDATE privilege_subgroup SET granted_count = ?, total_count = ? WHERE id = ?`).run(
        sgG,
        sgTotal,
        sgId,
      )
    }

    const totalFromSub = db
      .prepare(
        `SELECT SUM(total_count) as t, SUM(granted_count) as g FROM privilege_subgroup WHERE category_id = ?`,
      )
      .get(catId) as { t: number | null; g: number | null }

    db.prepare(
      `UPDATE privilege_category SET granted_count = ?, total_count = ?, sidebar_count_label = ? WHERE id = ?`,
    ).run(totalFromSub.g ?? 0, totalFromSub.t ?? 0, totalFromSub.t ?? 0, catId)
  }
}

/** Dev-only: re-seed from JSON */
app.post('/api/dev/reset-db', (_req, res) => {
  if (process.env.ALLOW_DEV_RESET !== '1') {
    return res.status(403).json({ error: 'Set ALLOW_DEV_RESET=1 to enable' })
  }
  const db = getDb()
  wipeDatabase(db)
  runSeed(db)
  res.json({ ok: true })
})

app.listen(PORT, () => {
  console.log(`RBAC API listening on http://localhost:${PORT}`)
})
