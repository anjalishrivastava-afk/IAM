/**
 * REST client for the local RBAC API (see /server). Uses same-origin `/api` with Vite proxy in dev.
 */

import type { UserManagementRoleRow } from '../data/userManagementRoles'
import type { PrivilegeSetRow } from '../data/privilegeSets'
import type { PrivilegeSetDetailModel } from '../data/privilegeSetDetailData'

const API = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, '') ?? ''

async function parseError(res: Response): Promise<string> {
  try {
    const j = (await res.json()) as { error?: string }
    return j.error ?? res.statusText
  } catch {
    return res.statusText
  }
}

async function jres<T>(path: string, init?: RequestInit): Promise<T> {
  const r = await fetch(`${API}${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...init?.headers },
  })
  if (!r.ok) throw new Error(await parseError(r))
  return r.json() as Promise<T>
}

export async function fetchRoles(): Promise<UserManagementRoleRow[]> {
  return jres('/api/roles')
}

export async function createRole(body: {
  roleName: string
  description?: string
  scopeType?: 'default' | 'custom'
  createdBy?: string
}): Promise<UserManagementRoleRow> {
  return jres('/api/roles', { method: 'POST', body: JSON.stringify(body) })
}

export async function fetchPrivilegeSets(): Promise<PrivilegeSetRow[]> {
  return jres('/api/privilege-sets')
}

export async function createPrivilegeSet(body: {
  privilegeSetName: string
  description?: string
  longDescription?: string
  scopeType?: 'default' | 'custom'
  createdBy?: string
}): Promise<PrivilegeSetRow> {
  return jres('/api/privilege-sets', { method: 'POST', body: JSON.stringify(body) })
}

export interface RoleDetailApiResponse {
  row: UserManagementRoleRow
  assignedUsers: string[]
  privilegeSets: string[]
  privilegeSetIds: string[]
}

export async function fetchRoleDetail(roleId: string): Promise<RoleDetailApiResponse> {
  return jres(`/api/roles/${encodeURIComponent(roleId)}/detail`)
}

export async function patchRole(
  roleId: string,
  body: { roleName?: string; description?: string },
): Promise<void> {
  await jres(`/api/roles/${encodeURIComponent(roleId)}`, { method: 'PATCH', body: JSON.stringify(body) })
}

export async function patchRoleUsers(roleId: string, userNames: string[]): Promise<void> {
  await jres(`/api/roles/${encodeURIComponent(roleId)}/users`, {
    method: 'PATCH',
    body: JSON.stringify({ userNames }),
  })
}

export async function patchRolePrivilegeSetsByName(
  roleId: string,
  privilegeSetNames: string[],
): Promise<void> {
  await jres(`/api/roles/${encodeURIComponent(roleId)}/privilege-sets`, {
    method: 'PATCH',
    body: JSON.stringify({ privilegeSetNames }),
  })
}

export async function patchRolePrivilegeSetIds(
  roleId: string,
  privilegeSetIds: string[],
): Promise<void> {
  await jres(`/api/roles/${encodeURIComponent(roleId)}/privilege-sets`, {
    method: 'PATCH',
    body: JSON.stringify({ privilegeSetIds }),
  })
}

export async function fetchPrivilegeSetDetail(
  privilegeSetId: string,
): Promise<PrivilegeSetDetailModel> {
  return jres(`/api/privilege-sets/${encodeURIComponent(privilegeSetId)}/detail`)
}

export async function patchPrivilegeSet(
  privilegeSetId: string,
  body: { privilegeSetName?: string; description?: string; longDescription?: string },
): Promise<void> {
  await jres(`/api/privilege-sets/${encodeURIComponent(privilegeSetId)}`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  })
}

export async function patchPrivilegeSetGrants(
  privilegeSetId: string,
  grants: Record<string, boolean>,
): Promise<void> {
  await jres(`/api/privilege-sets/${encodeURIComponent(privilegeSetId)}/grants`, {
    method: 'PATCH',
    body: JSON.stringify({ grants }),
  })
}

export async function patchPrivilegeSetRoles(
  privilegeSetId: string,
  roleIds: string[],
): Promise<void> {
  await jres(`/api/privilege-sets/${encodeURIComponent(privilegeSetId)}/roles`, {
    method: 'PATCH',
    body: JSON.stringify({ roleIds }),
  })
}
