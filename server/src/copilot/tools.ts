import { randomUUID } from 'node:crypto'
import { z } from 'zod'
import type { FunctionDeclaration } from '@google/generative-ai'
import { getDb } from '../db.js'
import { nowIso } from '../format.js'
import { buildMinimalCategoriesForNewPs, insertPrivilegeTree } from '../seed.js'
import { listDirectoryUsers } from '../directory.js'
import {
  scoreFieldsAgainstQuery,
  searchTokens,
  substantiveTokensCoverAll,
  tokenMatchesText,
} from '../textSearch.js'
import {
  assignmentCanonicalNameLookup,
  decodeRbacAssigneeId,
  searchAssignableUsers,
} from '../userSearch.js'
import { removeUsersFromOtherRoles } from '../roleAssignments.js'

/** Tool input schemas (Zod) — keep in sync with Gemini function declarations. */

export const schemas = {
  search_users: z.object({ query: z.string() }),
  search_privilege_sets: z.object({ query: z.string() }),
  list_permissions: z.object({}),
  list_roles: z.object({ query: z.string().optional() }),
  create_role: z.object({
    name: z.string(),
    description: z.string().optional(),
    type: z.enum(['custom', 'default']).optional(),
  }),
  assign_users_to_role: z.object({
    roleId: z.string(),
    userIds: z.array(z.string()),
  }),
  create_privilege_set: z.object({
    name: z.string(),
    permissions: z.array(z.string()).optional(),
  }),
  attach_privilege_set_to_role: z.object({
    roleId: z.string(),
    privilegeSetId: z.string(),
  }),
  detach_privilege_set_from_role: z.object({
    roleId: z.string(),
    privilegeSetId: z.string(),
  }),
  delete_role: z.object({ roleId: z.string() }),
  unassign_user_from_role: z.object({
    roleId: z.string(),
    userId: z.string(),
  }),
} as const

export type ToolName = keyof typeof schemas

export type ToolDefinition = {
  name: ToolName
  description: string
  isDestructive: boolean
  schema: z.ZodType<unknown>
  geminiDeclaration: FunctionDeclaration
  run: (input: unknown, ctx: ToolContext) => Promise<unknown>
}

export type ToolContext = {
  /** Idempotency — same id returns cached outcome from orchestrator layer */
  executionId?: string
}

function declaration(
  name: ToolName,
  description: string,
  properties: Record<string, unknown>,
  required: string[] = [],
): FunctionDeclaration {
  return {
    name,
    description,
    parameters: {
      type: 'object',
      properties,
      ...(required.length > 0 ? { required } : {}),
    },
  } as FunctionDeclaration
}

function resolveUserNames(userIds: string[]): { names: string[]; unknown: string[] } {
  const db = getDb()
  const directory = listDirectoryUsers()
  const assignmentByCi = assignmentCanonicalNameLookup(db)
  const byId = new Map(directory.map((u) => [u.id, u.displayName]))
  const byEmail = new Map(directory.map((u) => [u.email.toLowerCase(), u.displayName]))
  const normalize = (s: string) => s.trim().toLowerCase()

  const names: string[] = []
  const unknown: string[] = []
  for (const raw of userIds) {
    const trimmed = raw.trim()
    if (!trimmed) continue

    const fromAssignee = decodeRbacAssigneeId(trimmed)
    if (fromAssignee) {
      const canonical = assignmentByCi.get(normalize(fromAssignee))
      if (canonical) {
        names.push(canonical)
        continue
      }
      const dirHit = directory.find((u) => normalize(u.displayName) === normalize(fromAssignee))
      if (dirHit) {
        names.push(dirHit.displayName)
        continue
      }
      unknown.push(trimmed)
      continue
    }

    const fromId = byId.get(trimmed)
    if (fromId) {
      names.push(fromId)
      continue
    }
    const fromMail = byEmail.get(trimmed.toLowerCase())
    if (fromMail) {
      names.push(fromMail)
      continue
    }
    const hit = directory.find((u) => u.displayName.toLowerCase() === trimmed.toLowerCase())
    if (hit) {
      names.push(hit.displayName)
      continue
    }

    const onRole = assignmentByCi.get(normalize(trimmed))
    if (onRole) {
      names.push(onRole)
      continue
    }

    unknown.push(trimmed)
  }
  return { names: [...new Set(names)], unknown }
}

type ToolDefs = Record<ToolName, ToolDefinition>

const toolDefsInner: Omit<ToolDefs, never> = {
  search_users: {
    name: 'search_users',
    description: 'Search workspace users by name, email, branch, or id. Always call before assigning users.',
    isDestructive: false,
    schema: schemas.search_users,
    geminiDeclaration: declaration('search_users', 'Search directory users.', {
      query: {
        type: 'string',
        description:
          'Name, email fragment, branch, or id (fuzzy tokens). Use returned id verbatim; rbac-assignee:… ids refer to people visible on existing role assignments.',
      },
    }, ['query']),
    async run(raw) {
      const { query } = schemas.search_users.parse(raw)
      const db = getDb()
      const { users, tokensUsed, nearMatches } = searchAssignableUsers(db, query)
      return {
        users: users.map((u) => ({
          id: u.id,
          displayName: u.displayName,
          email: u.email || null,
          branch: u.branch ?? null,
          source: u.source,
        })),
        total: users.length,
        tokensInterpreted: tokensUsed.length ? tokensUsed : undefined,
        nearMatches:
          users.length === 0 && nearMatches.length
            ? nearMatches.map((u) => ({
                id: u.id,
                displayName: u.displayName,
                source: u.source,
                suggestion: `Did you mean "${u.displayName}"? Ask the user which one applies.`,
              }))
            : undefined,
        hints:
          users.length !== 1
            ? users.length === 0
              ? 'No confident match — show nearMatches if present, otherwise ask user to clarify spelling/email.'
              : 'Multiple matches — list top options briefly and ask which user they meant.'
            : undefined,
      }
    },
  },

  search_privilege_sets: {
    name: 'search_privilege_sets',
    description: 'Search privilege sets by name or description.',
    isDestructive: false,
    schema: schemas.search_privilege_sets,
    geminiDeclaration: declaration('search_privilege_sets', 'Search privilege sets.', {
      query: {
        type: 'string',
        description:
          'Natural phrase or name (“Monitoring privileges”, “Monitor”). Uses tolerant word matching.',
      },
    }, ['query']),
    async run(raw) {
      const { query } = schemas.search_privilege_sets.parse(raw)
      const db = getDb()
      const rows = db
        .prepare(
          `SELECT id, privilege_set_name, description FROM privilege_set ORDER BY privilege_set_name COLLATE NOCASE`,
        )
        .all() as { id: string; privilege_set_name: string; description: string }[]
      const q = query.trim()
      if (!q) {
        return {
          privilegeSets: rows.map((r) => ({
            id: r.id,
            name: r.privilege_set_name,
            description: r.description,
          })),
          total: rows.length,
        }
      }
      const tokens = searchTokens(q)
      let ranked = rows
        .map((r) => ({
          row: r,
          s: scoreFieldsAgainstQuery(r.privilege_set_name, [r.description], q),
        }))
        .filter(({ s }) => s > 0)
        .sort((a, b) => b.s - a.s)

      let picked = ranked.map(({ row }) => row)
      if (picked.length === 0) {
        picked = rows.filter((r) => {
          const blob = `${r.privilege_set_name} ${r.description}`
          return (
            (tokens.length > 0 && substantiveTokensCoverAll(tokens, blob)) ||
            tokens.every((t) => tokenMatchesText(t, blob))
          )
        })
      }

      let nearMisses: typeof rows = []
      if (picked.length === 0 && tokens.length) {
        nearMisses = [...rows]
          .map((r) => ({
            row: r,
            s: tokens.reduce(
              (acc, tok) =>
                acc + (tokenMatchesText(tok, `${r.privilege_set_name} ${r.description}`) ? 15 : 0),
              0,
            ),
          }))
          .sort((a, b) => b.s - a.s)
          .slice(0, 6)
          .filter((x) => x.s > 0)
          .map(({ row }) => row)
      }

      return {
        privilegeSets: picked.map((r) => ({
          id: r.id,
          name: r.privilege_set_name,
          description: r.description,
        })),
        total: picked.length,
        tokensInterpreted: tokens.length ? tokens : undefined,
        nearMatches:
          picked.length === 0 && nearMisses.length
            ? nearMisses.map((r) => ({
                id: r.id,
                name: r.privilege_set_name,
                suggestion: `Similar to query — confirm with user before attaching "${r.privilege_set_name}".`,
              }))
            : undefined,
        hints:
          picked.length !== 1
            ? picked.length === 0
              ? 'No strong privilege set hit — propose nearMatches or ask user to choose from list_roles + search again.'
              : 'Several privilege sets qualify — summarize top 3 and confirm which id to use.'
            : undefined,
      }
    },
  },

  list_permissions: {
    name: 'list_permissions',
    description: 'List permission labels available in the catalog (for planning).',
    isDestructive: false,
    schema: schemas.list_permissions,
    geminiDeclaration: declaration('list_permissions', 'List all permission labels.', {}, []),
    async run(raw) {
      schemas.list_permissions.parse(raw)
      const db = getDb()
      const rows = db
        .prepare(
          `SELECT id, label FROM privilege_permission ORDER BY label COLLATE NOCASE LIMIT 500`,
        )
        .all() as { id: string; label: string }[]
      return { permissions: rows, total: rows.length }
    },
  },

  list_roles: {
    name: 'list_roles',
    description: 'List existing roles; optional filter by name substring.',
    isDestructive: false,
    schema: schemas.list_roles,
    geminiDeclaration: declaration('list_roles', 'List roles.', {
      query: {
        type: 'string',
        description: 'Optional filter on role name',
      },
    }, []),
    async run(raw) {
      const { query } = schemas.list_roles.parse(raw)
      const q = (query ?? '').trim().toLowerCase()
      const db = getDb()
      const rows = db
        .prepare(
          `SELECT id, role_name, description, scope_type, assigned_user_count FROM role ORDER BY role_name COLLATE NOCASE`,
        )
        .all() as {
        id: string
        role_name: string
        description: string
        scope_type: string
        assigned_user_count: number
      }[]
      const filtered = !q
        ? rows
        : (() => {
            const substr = rows.filter((r) => r.role_name.toLowerCase().includes(q))
            if (substr.length) return substr
            const tokens = searchTokens(query ?? '')
            if (!tokens.length) return rows.filter((r) => r.role_name.toLowerCase().includes(q))
            return rows.filter((r) => substantiveTokensCoverAll(tokens, r.role_name))
          })()
      return {
        roles: filtered.map((r) => ({
          id: r.id,
          name: r.role_name,
          description: r.description,
          scopeType: r.scope_type,
          assignedUserCount: r.assigned_user_count,
        })),
        total: filtered.length,
        hints:
          q && filtered.length !== 1
            ? filtered.length === 0
              ? 'No role matched — widen search terms or ask the user which role acronym/name they mean.'
              : 'Multiple roles matched — briefly list candidates and verify id before assigning.'
            : undefined,
      }
    },
  },

  create_role: {
    name: 'create_role',
    description: 'Create a new role (additive).',
    isDestructive: false,
    schema: schemas.create_role,
    geminiDeclaration: declaration('create_role', 'Create a role.', {
      name: { type: 'string' },
      description: { type: 'string' },
      type: { type: 'string', description: 'custom or default' },
    }, ['name']),
    async run(raw) {
      const { name, description, type } = schemas.create_role.parse(raw)
      const scope = type === 'default' ? 'default' : 'custom'
      const id = `role-${randomUUID().slice(0, 10)}`
      const t = nowIso()
      const db = getDb()
      db.prepare(
        `INSERT INTO role (id, role_name, description, scope_type, assigned_user_count, created_by, created_at, updated_at)
         VALUES (?, ?, ?, ?, 0, ?, ?, ?)`,
      ).run(id, name.trim(), description?.trim() ?? '', scope, 'Copilot', t, t)
      return {
        roleId: id,
        roleName: name.trim(),
        handoffPath: `/closed-interaction/user-management/roles/${encodeURIComponent(id)}`,
      }
    },
  },

  assign_users_to_role: {
    name: 'assign_users_to_role',
    description:
      'Assign users to a role (adds them to this role\'s roster). Each user exists on at most one role: they are automatically removed from any other role first. Resolve users via search_users first.',
    isDestructive: false,
    schema: schemas.assign_users_to_role,
    geminiDeclaration: declaration('assign_users_to_role', 'Assign users to role.', {
      roleId: { type: 'string' },
      userIds: { type: 'array', items: { type: 'string' } },
    }, ['roleId', 'userIds']),
    async run(raw) {
      const { roleId, userIds } = schemas.assign_users_to_role.parse(raw)
      const db = getDb()
      const role = db.prepare(`SELECT id, role_name FROM role WHERE id = ?`).get(roleId) as
        | { id: string; role_name: string }
        | undefined
      if (!role) throw new Error('Role not found')
      const { names, unknown } = resolveUserNames(userIds)
      if (unknown.length) {
        throw new Error(`Unknown users (search directory first): ${unknown.join(', ')}`)
      }
      const current = (
        db.prepare(`SELECT user_name FROM role_assigned_user WHERE role_id = ? ORDER BY sort_order`).all(
          roleId,
        ) as { user_name: string }[]
      ).map((r) => r.user_name)
      const merged = [...new Set([...current, ...names])]
      const t = nowIso()
      let removedFromOtherRoles: ReturnType<typeof removeUsersFromOtherRoles> = []
      const tx = db.transaction(() => {
        removedFromOtherRoles = removeUsersFromOtherRoles(db, roleId, names, t)
        db.prepare(`DELETE FROM role_assigned_user WHERE role_id = ?`).run(roleId)
        const ins = db.prepare(
          `INSERT INTO role_assigned_user (id, role_id, user_name, sort_order) VALUES (?, ?, ?, ?)`,
        )
        let order = 0
        for (const userName of merged) {
          ins.run(`rau-${roleId}-${order}`, roleId, userName, order++)
        }
        db.prepare(`UPDATE role SET assigned_user_count = ?, updated_at = ? WHERE id = ?`).run(
          merged.length,
          t,
          roleId,
        )
      })
      tx()
      return {
        roleId,
        assignedUserCount: merged.length,
        added: names,
        removedFromOtherRoles,
        handoffPath: `/closed-interaction/user-management/roles/${encodeURIComponent(roleId)}`,
      }
    },
  },

  create_privilege_set: {
    name: 'create_privilege_set',
    description: 'Create a privilege set from the default template (permissions param is informational for now).',
    isDestructive: false,
    schema: schemas.create_privilege_set,
    geminiDeclaration: declaration('create_privilege_set', 'Create privilege set.', {
      name: { type: 'string' },
      permissions: { type: 'array', items: { type: 'string' } },
    }, ['name']),
    async run(raw) {
      const { name, permissions } = schemas.create_privilege_set.parse(raw)
      const id = `ps-${randomUUID().slice(0, 10)}`
      const t = nowIso()
      const desc = `Created by Copilot`
      const longDesc =
        permissions?.length
          ? `Requested permissions noted (${permissions.slice(0, 8).join(', ')}${permissions.length > 8 ? '…' : ''}) — apply in Privilege Set detail.`
          : 'Configure access for teams using this privilege set.'
      const db = getDb()
      db.prepare(
        `INSERT INTO privilege_set (id, privilege_set_name, description, long_description, scope_type, assigned_role_count, created_by, created_at, updated_at)
         VALUES (?, ?, ?, ?, 'custom', 0, ?, ?, ?)`,
      ).run(id, name.trim(), desc, longDesc, 'Copilot', t, t)
      const categories = buildMinimalCategoriesForNewPs(id, name.trim())
      insertPrivilegeTree(db, id, categories)
      return {
        privilegeSetId: id,
        privilegeSetName: name.trim(),
        handoffPath: `/closed-interaction/user-management/privilege-sets/${encodeURIComponent(id)}`,
      }
    },
  },

  attach_privilege_set_to_role: {
    name: 'attach_privilege_set_to_role',
    description: 'Attach a privilege set to a role (additive merge). Verify ids via search/list first.',
    isDestructive: false,
    schema: schemas.attach_privilege_set_to_role,
    geminiDeclaration: declaration('attach_privilege_set_to_role', 'Attach privilege set to role.', {
      roleId: { type: 'string' },
      privilegeSetId: { type: 'string' },
    }, ['roleId', 'privilegeSetId']),
    async run(raw) {
      const { roleId, privilegeSetId } = schemas.attach_privilege_set_to_role.parse(raw)
      const db = getDb()
      const role = db.prepare(`SELECT id FROM role WHERE id = ?`).get(roleId)
      if (!role) throw new Error('Role not found')
      const ps = db.prepare(`SELECT id FROM privilege_set WHERE id = ?`).get(privilegeSetId)
      if (!ps) throw new Error('Privilege set not found')
      const existing = (
        db.prepare(`SELECT privilege_set_id FROM role_privilege_set WHERE role_id = ?`).all(roleId) as {
          privilege_set_id: string
        }[]
      ).map((r) => r.privilege_set_id)
      const next = [...new Set([...existing, privilegeSetId])]
      const tx = db.transaction(() => {
        db.prepare(`DELETE FROM role_privilege_set WHERE role_id = ?`).run(roleId)
        const ins = db.prepare(`INSERT INTO role_privilege_set (role_id, privilege_set_id) VALUES (?, ?)`)
        for (const pid of next) {
          ins.run(roleId, pid)
        }
        db.prepare(`UPDATE role SET updated_at = ? WHERE id = ?`).run(nowIso(), roleId)
        const allPs = db.prepare(`SELECT id FROM privilege_set`).all() as { id: string }[]
        const cntStmt = db.prepare(`SELECT COUNT(*) as c FROM role_privilege_set WHERE privilege_set_id = ?`)
        const updPs = db.prepare(`UPDATE privilege_set SET assigned_role_count = ?, updated_at = ? WHERE id = ?`)
        for (const { id } of allPs) {
          const c = cntStmt.get(id) as { c: number }
          updPs.run(c.c, nowIso(), id)
        }
      })
      tx()
      return {
        roleId,
        privilegeSetIds: next,
        handoffPath: `/closed-interaction/user-management/roles/${encodeURIComponent(roleId)}`,
      }
    },
  },

  detach_privilege_set_from_role: {
    name: 'detach_privilege_set_from_role',
    description:
      'Remove a privilege set link from a role (does not delete the privilege set itself). Verify ids via search/list first.',
    isDestructive: false,
    schema: schemas.detach_privilege_set_from_role,
    geminiDeclaration: declaration(
      'detach_privilege_set_from_role',
      'Detach a privilege set from a role — removes the association only.',
      {
        roleId: { type: 'string', description: 'Role id from list_roles / search' },
        privilegeSetId: { type: 'string', description: 'Privilege set id from search_privilege_sets' },
      },
      ['roleId', 'privilegeSetId'],
    ),
    async run(raw) {
      const { roleId, privilegeSetId } = schemas.detach_privilege_set_from_role.parse(raw)
      const db = getDb()
      const role = db.prepare(`SELECT id FROM role WHERE id = ?`).get(roleId)
      if (!role) throw new Error('Role not found')
      const ps = db.prepare(`SELECT id, privilege_set_name FROM privilege_set WHERE id = ?`).get(
        privilegeSetId,
      ) as { id: string; privilege_set_name: string } | undefined
      if (!ps) throw new Error('Privilege set not found')
      const tx = db.transaction(() => {
        const res = db
          .prepare(`DELETE FROM role_privilege_set WHERE role_id = ? AND privilege_set_id = ?`)
          .run(roleId, privilegeSetId)
        if (res.changes === 0) {
          throw new Error(
            `Privilege set "${ps.privilege_set_name}" is not linked to this role — nothing to remove`,
          )
        }
        db.prepare(`UPDATE role SET updated_at = ? WHERE id = ?`).run(nowIso(), roleId)
        const allPs = db.prepare(`SELECT id FROM privilege_set`).all() as { id: string }[]
        const cntStmt = db.prepare(`SELECT COUNT(*) as c FROM role_privilege_set WHERE privilege_set_id = ?`)
        const updPs = db.prepare(`UPDATE privilege_set SET assigned_role_count = ?, updated_at = ? WHERE id = ?`)
        for (const { id } of allPs) {
          const c = cntStmt.get(id) as { c: number }
          updPs.run(c.c, nowIso(), id)
        }
      })
      tx()
      return {
        roleId,
        privilegeSetId,
        privilegeSetName: ps.privilege_set_name,
        removed: true,
        handoffPath: `/closed-interaction/user-management/roles/${encodeURIComponent(roleId)}`,
      }
    },
  },

  delete_role: {
    name: 'delete_role',
    description: 'Permanently delete a role and its assignments. Requires user confirmation in UI.',
    isDestructive: true,
    schema: schemas.delete_role,
    geminiDeclaration: declaration('delete_role', 'Delete a role.', {
      roleId: { type: 'string' },
    }, ['roleId']),
    async run(raw) {
      const { roleId } = schemas.delete_role.parse(raw)
      const db = getDb()
      const row = db.prepare(`SELECT id, role_name, assigned_user_count FROM role WHERE id = ?`).get(roleId) as
        | { id: string; role_name: string; assigned_user_count: number }
        | undefined
      if (!row) throw new Error('Role not found')
      db.prepare(`DELETE FROM role WHERE id = ?`).run(roleId)
      return { deletedRoleId: row.id, deletedRoleName: row.role_name }
    },
  },

  unassign_user_from_role: {
    name: 'unassign_user_from_role',
    description: 'Remove a user from a role. Requires user confirmation in UI.',
    isDestructive: true,
    schema: schemas.unassign_user_from_role,
    geminiDeclaration: declaration('unassign_user_from_role', 'Unassign user from role.', {
      roleId: { type: 'string' },
      userId: { type: 'string' },
    }, ['roleId', 'userId']),
    async run(raw) {
      const { roleId, userId } = schemas.unassign_user_from_role.parse(raw)
      const { names, unknown } = resolveUserNames([userId])
      if (unknown.length && !names.length) {
        throw new Error(`Could not resolve user: ${userId}`)
      }
      const targetName = names[0] ?? userId
      const db = getDb()
      const role = db.prepare(`SELECT id FROM role WHERE id = ?`).get(roleId)
      if (!role) throw new Error('Role not found')
      const current = (
        db.prepare(`SELECT user_name FROM role_assigned_user WHERE role_id = ? ORDER BY sort_order`).all(
          roleId,
        ) as { user_name: string }[]
      ).map((r) => r.user_name)
      const next = current.filter((n) => n.toLowerCase() !== targetName.toLowerCase())
      if (next.length === current.length) {
        throw new Error(`User "${targetName}" was not assigned to this role`)
      }
      const tx = db.transaction(() => {
        db.prepare(`DELETE FROM role_assigned_user WHERE role_id = ?`).run(roleId)
        const ins = db.prepare(
          `INSERT INTO role_assigned_user (id, role_id, user_name, sort_order) VALUES (?, ?, ?, ?)`,
        )
        let order = 0
        for (const userName of next) {
          ins.run(`rau-${roleId}-${order}`, roleId, userName, order++)
        }
        db.prepare(`UPDATE role SET assigned_user_count = ?, updated_at = ? WHERE id = ?`).run(
          next.length,
          nowIso(),
          roleId,
        )
      })
      tx()
      return { roleId, removedUserName: targetName, remainingCount: next.length }
    },
  },
}

export const toolRegistry = toolDefsInner as Record<ToolName, ToolDefinition>

export const geminiFunctionDeclarations: FunctionDeclaration[] = Object.values(toolRegistry).map(
  (t) => t.geminiDeclaration,
)

export async function executeToolNamed(
  name: string,
  args: unknown,
  ctx: ToolContext,
): Promise<{ ok: true; result: unknown } | { ok: false; error: string }> {
  const def = toolRegistry[name as ToolName]
  if (!def) return { ok: false, error: `Unknown tool: ${name}` }
  try {
    const parsed = def.schema.safeParse(JSON.parse(JSON.stringify(args)))
    if (!parsed.success) {
      return { ok: false, error: parsed.error.message }
    }
    const result = await def.run(parsed.data, ctx)
    return { ok: true, result }
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    return { ok: false, error: msg }
  }
}

export function buildDestructivePreview(
  name: ToolName,
  args: unknown,
): { title: string; impact: string; details: Record<string, unknown> } {
  const a = args as Record<string, unknown>
  if (name === 'delete_role') {
    const db = getDb()
    const row = db.prepare(`SELECT role_name, assigned_user_count FROM role WHERE id = ?`).get(a.roleId) as
      | { role_name: string; assigned_user_count: number }
      | undefined
    return {
      title: `Delete role: ${row?.role_name ?? a.roleId}`,
      impact:
        'This removes the role, all user assignments, and privilege set links. This cannot be undone.',
      details: { roleId: a.roleId, assignedUserCount: row?.assigned_user_count ?? 0 },
    }
  }
  if (name === 'unassign_user_from_role') {
    return {
      title: 'Remove user from role',
      impact: 'The user will lose access granted through this role until reassigned.',
      details: { roleId: a.roleId, userId: a.userId },
    }
  }
  return { title: String(name), impact: 'Destructive action', details: a }
}
