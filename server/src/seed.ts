/**
 * Hydrates SQLite from exported JSON.
 * Every privilege set gets the full Monitor (ps4-detail) privilege catalog; IDs are scoped per set.
 * Grants: Monitor (ps-4) keeps template flags; Admin Console gets all ON; others get Monitor ∩ keyword relevance.
 */
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import type Database from 'better-sqlite3'

import { closeDb, getDb } from './db.js'

const __dirname = dirname(fileURLToPath(import.meta.url))

type Scope = 'default' | 'custom'

interface RoleSeed {
  id: string
  roleName: string
  description: string
  scopeType: Scope
  assignedUserCount: number
  createdBy: string
  createdAtLabel: string
}

interface PsSeed {
  id: string
  privilegeSetName: string
  description: string
  scopeType: Scope
  assignedRoleCount: number
  createdBy: string
  createdAtLabel: string
  usedByRoleNames: string[]
}

export interface PermSeed {
  id: string
  label: string
  granted: boolean
  isKey?: boolean
}

export interface SgSeed {
  id: string
  title: string
  description: string
  grantedCount: number
  totalCount: number
  permissions: PermSeed[]
}

export interface CatSeed {
  id: string
  title: string
  description: string
  sidebarCountLabel: number
  grantedCount: number
  totalCount: number
  subgroups: SgSeed[]
}

function cloneCategories(categories: CatSeed[]): CatSeed[] {
  return JSON.parse(JSON.stringify(categories)) as CatSeed[]
}

/** Countable grants match API `mapDetail` / `recalcTallies`: plan-gated rows excluded from tally. */
function countableGranted(p: PermSeed): boolean {
  return p.granted && !p.isKey
}

function countableGrantedTotal(categories: CatSeed[]): number {
  let n = 0
  for (const cat of categories) {
    for (const sg of cat.subgroups) {
      for (const p of sg.permissions) {
        if (countableGranted(p)) n++
      }
    }
  }
  return n
}

export function recountPrivilegeTreeTotals(categories: CatSeed[]): void {
  for (const cat of categories) {
    let catG = 0
    let catT = 0
    for (const sg of cat.subgroups) {
      let sgG = 0
      const sgT = sg.permissions.length
      for (const p of sg.permissions) {
        if (countableGranted(p)) sgG++
      }
      sg.grantedCount = sgG
      sg.totalCount = sgT
      catG += sgG
      catT += sgT
    }
    cat.grantedCount = catG
    cat.totalCount = catT
    cat.sidebarCountLabel = catT
  }
}

/** Prefix category / subgroup / permission PKs so each privilege set owns a disjoint tree. ps-4 keeps canonical ids from ps4-detail. */
function remapPrivilegeTreeIds(categories: CatSeed[], psId: string): void {
  for (const cat of categories) {
    cat.id = `${psId}_${cat.id}`
    for (const sg of cat.subgroups) {
      sg.id = `${psId}_${sg.id}`
      for (const p of sg.permissions) {
        p.id = `${psId}_${p.id}`
      }
    }
  }
}

function grantAllPermissions(categories: CatSeed[]): void {
  for (const cat of categories) {
    for (const sg of cat.subgroups) {
      for (const p of sg.permissions) {
        p.granted = true
      }
    }
  }
}

function normalizePrivSetKey(name: string): string {
  return name.trim().toLowerCase().replace(/\s+/g, ' ')
}

function tokenWords(name: string): string[] {
  return normalizePrivSetKey(name)
    .split(/[^a-z0-9]+/i)
    .map((x) => x.trim().toLowerCase())
    .filter((x) => x.length > 2)
}

/** Extra match stems for seeded privilege set titles (beyond word tokens). */
const EXTRA_TERMS_BY_NORMALIZED_NAME: Record<string, string[]> = {
  aqm: ['quality', 'calibrat', 'score', 'qm', 'audit', 'dashboard', 'telemetry'],
  manage: ['supervisor', 'supervise', 'manage', 'config', 'setting', 'dashboard', 'rollup', 'threshold', 'workforce', 'schedule'],
  scoring: ['score', 'calibrat', 'qm', 'evaluation', 'feedback', 'coach'],
  'agent workbench': ['agent', 'workbench', 'workspace', 'disposition', 'session'],
  'lead management': ['lead', 'pipeline', 'prospect', 'cadence'],
  cqa: ['quality', 'assurance', 'audit', 'evaluation', 'compliance'],
  reports: ['report', 'dashboard', 'export', 'csv', 'kpi', 'snapshot', 'graph', 'scheduled', 'metric'],
  'admin console': [],
  'api scopes': ['api', 'scope', 'token', 'oauth', 'credential', 'openapi'],
  'integrations hub': ['integration', 'webhook'],
  queues: ['queue', 'waiting', 'abandon', 'routing'],
  'skills routing': ['skill', 'rout', 'overflow', 'policy'],
}

function matchTermsForPrivilegeSetName(privilegeSetName: string): Set<string> {
  const norm = normalizePrivSetKey(privilegeSetName)
  const terms = new Set<string>()
  for (const w of tokenWords(privilegeSetName)) {
    terms.add(w)
  }
  const extras = EXTRA_TERMS_BY_NORMALIZED_NAME[norm]
  if (extras) for (const e of extras) terms.add(e)
  return terms
}

function haystack(cat: CatSeed, sg: SgSeed, p: PermSeed): string {
  return `${cat.title} ${cat.description} ${sg.title} ${sg.description} ${p.label}`.toLowerCase()
}

function applyMonitorBaselineFilteredByTerms(target: CatSeed[], monitorBaseline: CatSeed[], terms: Set<string>): void {
  for (let ci = 0; ci < target.length; ci++) {
    const c = target[ci]
    const m = monitorBaseline[ci]
    if (!m || m.subgroups.length !== c.subgroups.length) continue
    for (let sj = 0; sj < c.subgroups.length; sj++) {
      const sg = c.subgroups[sj]
      const msg = m.subgroups[sj]
      if (!msg || msg.permissions.length !== sg.permissions.length) continue
      for (let pi = 0; pi < sg.permissions.length; pi++) {
        const p = sg.permissions[pi]
        const mp = msg.permissions[pi]
        p.isKey = mp.isKey
        const hay = haystack(c, sg, p)
        const keywordHit =
          terms.size === 0 ? false : [...terms].some((t: string) => (t.length > 0 ? hay.includes(t) : false))
        p.granted = Boolean(mp.granted && keywordHit)
      }
    }
  }
}

/** When baseline ∩ keywords yields almost nothing (e.g. Integrations/API area is off in Monitor), still grant every keyword-matched row for this product slice. */
function widenGrantsWhereKeywordMatched(target: CatSeed[], terms: Set<string>): void {
  if (terms.size === 0) return
  for (const c of target) {
    for (const sg of c.subgroups) {
      for (const p of sg.permissions) {
        const hay = haystack(c, sg, p)
        const keywordHit = [...terms].some((t: string) => (t.length > 0 ? hay.includes(t) : false))
        if (keywordHit) p.granted = true
      }
    }
  }
}

const SPARSE_MIN_COUNTABLE_GRANTS = 12
function ensureViewFallbackFromMonitor(target: CatSeed[], monitorBaseline: CatSeed[]): void {
  if (countableGrantedTotal(target) > 0) return
  for (let ci = 0; ci < target.length; ci++) {
    const c = target[ci]
    const m = monitorBaseline[ci]
    if (!m || m.subgroups.length !== c.subgroups.length) continue
    for (let sj = 0; sj < c.subgroups.length; sj++) {
      const sg = c.subgroups[sj]
      const msg = m.subgroups[sj]
      if (!msg || msg.permissions.length !== sg.permissions.length) continue
      for (let pi = 0; pi < sg.permissions.length; pi++) {
        const p = sg.permissions[pi]
        const mp = msg.permissions[pi]
        p.isKey = mp.isKey
        const isBareView = /^view$/i.test(p.label.trim())
        p.granted = Boolean(mp.granted && isBareView)
      }
    }
  }
}

function buildPrivilegeTreeFromMonitorTemplate(
  psId: string,
  privilegeSetName: string,
  /** Uncloned Monitor template (`ps4-detail.categories`). */
  monitorTemplate: CatSeed[],
): CatSeed[] {
  const monitorBaseline = cloneCategories(monitorTemplate)
  const working = cloneCategories(monitorTemplate)

  if (psId !== MONITOR_PRIVILEGE_SET_ID) {
    remapPrivilegeTreeIds(working, psId)
  }

  const norm = normalizePrivSetKey(privilegeSetName)

  if (norm === 'admin console') {
    grantAllPermissions(working)
  } else if (psId === MONITOR_PRIVILEGE_SET_ID) {
    /** Template grants already copied */
  } else {
    const terms = matchTermsForPrivilegeSetName(privilegeSetName)
    applyMonitorBaselineFilteredByTerms(working, monitorBaseline, terms)
    ensureViewFallbackFromMonitor(working, monitorBaseline)
    if (countableGrantedTotal(working) < SPARSE_MIN_COUNTABLE_GRANTS) {
      widenGrantsWhereKeywordMatched(working, terms)
    }
  }

  recountPrivilegeTreeTotals(working)
  return working
}

const MONITOR_PRIVILEGE_SET_ID = 'ps-4'

let cachedMonitorCategories: CatSeed[] | null = null

function masterCategoriesFromDisk(): CatSeed[] {
  if (!cachedMonitorCategories) {
    const ps4Detail = JSON.parse(
      readFileSync(join(__dirname, '..', 'ps4-detail.json'), 'utf8'),
    ) as { categories: CatSeed[] }
    cachedMonitorCategories = cloneCategories(ps4Detail.categories)
  }
  return cloneCategories(cachedMonitorCategories)
}

/** Canonical Monitor privilege tree shape (cloned). Used by Copilot to resolve category/subgroup paths before ids are prefixed per privilege set. */
export function getMonitorCatalogTemplate(): CatSeed[] {
  return masterCategoriesFromDisk()
}

/**
 * Full catalog for a newly created privilege set (API POST).
 */
export function categoriesForNewPrivilegeSet(psId: string, privilegeSetName: string): CatSeed[] {
  return buildPrivilegeTreeFromMonitorTemplate(psId, privilegeSetName, masterCategoriesFromDisk())
}

function isoNow(index: number): string {
  const d = new Date(2026, 3, 11 + (index % 3), 12, 19 + (index % 40))
  return d.toISOString()
}

/** @deprecated use categoriesForNewPrivilegeSet */
export function buildMinimalCategoriesForNewPs(psId: string, privilegeSetName?: string): CatSeed[] {
  return categoriesForNewPrivilegeSet(psId, privilegeSetName ?? '')
}

export function wipeDatabase(db: Database.Database): void {
  db.exec(`
    DELETE FROM permission_grant;
    DELETE FROM privilege_permission;
    DELETE FROM privilege_subgroup;
    DELETE FROM privilege_category;
    DELETE FROM role_privilege_set;
    DELETE FROM role_assigned_user;
    DELETE FROM role;
    DELETE FROM privilege_set;
  `)
}

export function insertPrivilegeTree(db: Database.Database, privilegeSetId: string, categories: CatSeed[]): void {
  const insCat = db.prepare(`
    INSERT INTO privilege_category (id, privilege_set_id, title, description, sidebar_count_label, granted_count, total_count, sort_order)
    VALUES (@id, @privilege_set_id, @title, @description, @sidebar_count_label, @granted_count, @total_count, @sort_order)
  `)
  const insSg = db.prepare(`
    INSERT INTO privilege_subgroup (id, category_id, title, description, granted_count, total_count, sort_order)
    VALUES (@id, @category_id, @title, @description, @granted_count, @total_count, @sort_order)
  `)
  const insPerm = db.prepare(`
    INSERT INTO privilege_permission (id, subgroup_id, label, default_granted, is_plan_gated, sort_order)
    VALUES (@id, @subgroup_id, @label, @default_granted, @is_plan_gated, @sort_order)
  `)
  const insGrant = db.prepare(`
    INSERT INTO permission_grant (privilege_set_id, permission_id, granted)
    VALUES (@privilege_set_id, @permission_id, @granted)
  `)

  const tx = db.transaction(() => {
    for (let ci = 0; ci < categories.length; ci++) {
      const cat = categories[ci]
      insCat.run({
        id: cat.id,
        privilege_set_id: privilegeSetId,
        title: cat.title,
        description: cat.description,
        sidebar_count_label: cat.sidebarCountLabel,
        granted_count: cat.grantedCount,
        total_count: cat.totalCount,
        sort_order: ci,
      })
      for (let si = 0; si < cat.subgroups.length; si++) {
        const sg = cat.subgroups[si]
        insSg.run({
          id: sg.id,
          category_id: cat.id,
          title: sg.title,
          description: sg.description,
          granted_count: sg.grantedCount,
          total_count: sg.totalCount,
          sort_order: si,
        })
        for (let pi = 0; pi < sg.permissions.length; pi++) {
          const p = sg.permissions[pi]
          insPerm.run({
            id: p.id,
            subgroup_id: sg.id,
            label: p.label,
            default_granted: p.granted ? 1 : 0,
            is_plan_gated: p.isKey ? 1 : 0,
            sort_order: pi,
          })
          insGrant.run({
            privilege_set_id: privilegeSetId,
            permission_id: p.id,
            granted: p.granted ? 1 : 0,
          })
        }
      }
    }
  })

  tx()
}

export function runSeed(db: Database.Database = getDb()): void {
  const rolesJson = JSON.parse(
    readFileSync(join(__dirname, '..', 'seed-data', 'roles.json'), 'utf8'),
  ) as RoleSeed[]
  const psJson = JSON.parse(
    readFileSync(join(__dirname, '..', 'seed-data', 'privilege_sets.json'), 'utf8'),
  ) as PsSeed[]
  const roleUsersJson = JSON.parse(
    readFileSync(join(__dirname, '..', 'seed-data', 'role_users.json'), 'utf8'),
  ) as Record<string, string[]>
  const ps4Detail = JSON.parse(
    readFileSync(join(__dirname, '..', 'ps4-detail.json'), 'utf8'),
  ) as {
    categories: CatSeed[]
    longDescription: string
    assignedRoleNames: string[]
  }

  wipeDatabase(db)

  const roleIdByName = new Map<string, string>()
  const insRole = db.prepare(`
    INSERT INTO role (id, role_name, description, scope_type, assigned_user_count, created_by, created_at, updated_at)
    VALUES (@id, @role_name, @description, @scope_type, @assigned_user_count, @created_by, @created_at, @updated_at)
  `)

  for (let i = 0; i < rolesJson.length; i++) {
    const r = rolesJson[i]
    const createdAt = isoNow(i)
    const updatedAt = createdAt
    insRole.run({
      id: r.id,
      role_name: r.roleName,
      description: r.description,
      scope_type: r.scopeType,
      assigned_user_count: r.assignedUserCount,
      created_by: r.createdBy,
      created_at: createdAt,
      updated_at: updatedAt,
    })
    roleIdByName.set(r.roleName, r.id)
  }

  const insPs = db.prepare(`
    INSERT INTO privilege_set (id, privilege_set_name, description, long_description, scope_type, assigned_role_count, created_by, created_at, updated_at)
    VALUES (@id, @privilege_set_name, @description, @long_description, @scope_type, @assigned_role_count, @created_by, @created_at, @updated_at)
  `)

  for (let i = 0; i < psJson.length; i++) {
    const ps = psJson[i]
    const createdAt = isoNow(i + 20)
    const longDesc =
      ps.id === 'ps-4'
        ? ps4Detail.longDescription
        : ps.description || 'Configure access for teams using this privilege set.'
    insPs.run({
      id: ps.id,
      privilege_set_name: ps.privilegeSetName,
      description: ps.description,
      long_description: longDesc,
      scope_type: ps.scopeType,
      assigned_role_count: ps.usedByRoleNames.length,
      created_by: ps.createdBy,
      created_at: createdAt,
      updated_at: createdAt,
    })
    const categories = buildPrivilegeTreeFromMonitorTemplate(ps.id, ps.privilegeSetName, ps4Detail.categories)
    insertPrivilegeTree(db, ps.id, categories)
  }

  const insUser = db.prepare(`
    INSERT INTO role_assigned_user (id, role_id, user_name, sort_order)
    VALUES (@id, @role_id, @user_name, @sort_order)
  `)
  const updRoleCount = db.prepare(`UPDATE role SET assigned_user_count = ? WHERE id = ?`)

  for (const r of rolesJson) {
    const users = roleUsersJson[r.id] ?? []
    let order = 0
    for (const userName of users) {
      insUser.run({
        id: `rau-${r.id}-${order}`,
        role_id: r.id,
        user_name: userName,
        sort_order: order++,
      })
    }
    updRoleCount.run(users.length, r.id)
  }

  const insRp = db.prepare(`
    INSERT INTO role_privilege_set (role_id, privilege_set_id)
    VALUES (?, ?)
  `)

  for (const ps of psJson) {
    for (const roleName of ps.usedByRoleNames) {
      const rid = roleIdByName.get(roleName)
      if (!rid) {
        console.warn(`Unknown role name "${roleName}" for PS ${ps.id}`)
        continue
      }
      insRp.run(rid, ps.id)
    }
    const cnt = db
      .prepare(`SELECT COUNT(*) as c FROM role_privilege_set WHERE privilege_set_id = ?`)
      .get(ps.id) as { c: number }
    db.prepare(`UPDATE privilege_set SET assigned_role_count = ? WHERE id = ?`).run(cnt.c, ps.id)
  }

  console.log('Seed complete')
}

export function seedIfEmpty(): void {
  const db = getDb()
  const row = db.prepare(`SELECT COUNT(*) as c FROM role`).get() as { c: number }
  if (row.c === 0) {
    console.log('Database empty — running seed…')
    runSeed(db)
  }
}
