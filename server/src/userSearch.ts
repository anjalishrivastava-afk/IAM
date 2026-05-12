/**
 * Unified user lookup: mock directory plus people already on roles in SQLite.
 */

import Database from 'better-sqlite3'

import type { DirectoryUser } from './directory.js'
import { listDirectoryUsers } from './directory.js'
import {
  normalizeSearch,
  scoreFieldsAgainstQuery,
  searchTokens,
  substantiveTokensCoverAll,
  tokenMatchesText,
} from './textSearch.js'

export const RBAC_ASSIGNEE_ID_PREFIX = 'rbac-assignee:'

/** Encode assignment-only handles for tool output (survives URL / JSON cleanly). */
export function encodeRbacAssigneeId(displayName: string): string {
  return `${RBAC_ASSIGNEE_ID_PREFIX}${encodeURIComponent(displayName)}`
}

export function decodeRbacAssigneeId(id: string): string | null {
  if (!id.startsWith(RBAC_ASSIGNEE_ID_PREFIX)) return null
  try {
    return decodeURIComponent(id.slice(RBAC_ASSIGNEE_ID_PREFIX.length))
  } catch {
    return null
  }
}

export type AssignableUser = DirectoryUser & {
  /** directory = seed directory; rbac_assignment = appeared on a role assignment */
  source: 'directory' | 'rbac_assignment'
}

export function distinctRoleAssignmentDisplayNames(db: Database.Database): string[] {
  const rows = db
    .prepare(`SELECT DISTINCT user_name FROM role_assigned_user WHERE trim(user_name) != '' ORDER BY user_name COLLATE NOCASE`)
    .all() as { user_name: string }[]
  return rows.map((r) => r.user_name.trim())
}

function directoryAsAssignable(): AssignableUser[] {
  return listDirectoryUsers().map((u) => ({ ...u, source: 'directory' as const }))
}

function assignmentsAsAssignable(names: Set<string>): AssignableUser[] {
  const dir = listDirectoryUsers()
  const norm = (s: string) => normalizeSearch(s)
  const covered = new Set(dir.map((u) => norm(u.displayName)))
  const out: AssignableUser[] = []
  for (const raw of names) {
    const n = norm(raw)
    if (!n || covered.has(n)) continue
    out.push({
      id: encodeRbacAssigneeId(raw),
      displayName: raw,
      email: '',
      branch: undefined,
      channel: 'Voice',
      capacity: 70,
      campaigns: '—',
      groups: [],
      source: 'rbac_assignment',
    })
    covered.add(n)
  }
  return out
}

function unionAssignable(db: Database.Database): AssignableUser[] {
  const fromDb = distinctRoleAssignmentDisplayNames(db)
  const set = new Set(fromDb)
  return [...directoryAsAssignable(), ...assignmentsAsAssignable(set)]
}

/** Lowercased canonical display names that exist on roles (for resolving raw names). */
export function assignmentCanonicalNameLookup(db: Database.Database): Map<string, string> {
  const m = new Map<string, string>()
  for (const n of distinctRoleAssignmentDisplayNames(db)) {
    m.set(normalizeSearch(n), n)
  }
  return m
}

function scoreAssignableUser(user: AssignableUser, query: string): number {
  return scoreFieldsAgainstQuery(
    user.displayName,
    [
      user.email,
      user.branch ?? '',
      user.id,
      user.channel ?? '',
      user.campaigns ?? '',
      (user.groups ?? []).join(' '),
    ],
    query,
  )
}

export function searchAssignableUsers(db: Database.Database, query: string): {
  users: AssignableUser[]
  tokensUsed: string[]
  nearMatches: Pick<AssignableUser, 'id' | 'displayName' | 'email' | 'branch' | 'source'>[]
} {
  const all = unionAssignable(db)
  const q = query.trim()
  const tokens = searchTokens(q)
  if (!q) {
    return {
      users: all.sort((a, b) => a.displayName.localeCompare(b.displayName)),
      tokensUsed: [],
      nearMatches: [],
    }
  }

  const scored = all
    .map((u) => ({ u, s: scoreAssignableUser(u, q) }))
    .filter(({ s }) => s > 0)
    .sort((a, b) => b.s - a.s)

  let users = scored.map(({ u }) => u)

  if (users.length === 0) {
    const blobMatch = all.filter((u) => {
      const blob = [
        u.displayName,
        u.email,
        u.branch ?? '',
        u.channel ?? '',
        u.campaigns ?? '',
        ...(u.groups ?? []),
      ].join(' ')
      return substantiveTokensCoverAll(tokens, blob) || tokens.every((t) => tokenMatchesText(t, blob))
    })
    users = blobMatch.sort((a, b) => scoreAssignableUser(b, q) - scoreAssignableUser(a, q))
  }

  const nearMatches =
    users.length === 0
      ? all
          .map((u) => ({ u, s: scoreAssignableUser(u, q) + (tokens.some((t) => tokenMatchesText(t, u.displayName)) ? 5 : 0) }))
          .sort((a, b) => b.s - a.s)
          .slice(0, 8)
          .filter((x) => x.s > 0)
          .map((x) => x.u)
      : []

  return { users, tokensUsed: tokens, nearMatches }
}
