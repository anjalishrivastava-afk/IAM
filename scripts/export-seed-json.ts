/**
 * Dump static playground tables to server/prisma/seed-data/*.json for Prisma seed.
 * Run from playground root: npx tsx scripts/export-seed-json.ts
 */
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { PRIVILEGE_SET_ROWS } from '../src/data/privilegeSets'
import { USER_MANAGEMENT_ROLE_ROWS } from '../src/data/userManagementRoles'
import {
  buildDefaultExtra,
  getRoleDetailExtra,
} from '../src/data/roleDetailData'

const __dirname = dirname(fileURLToPath(import.meta.url))
const outDir = join(__dirname, '../server/prisma/seed-data')
mkdirSync(outDir, { recursive: true })

writeFileSync(join(outDir, 'roles.json'), JSON.stringify(USER_MANAGEMENT_ROLE_ROWS, null, 2), 'utf8')
writeFileSync(
  join(outDir, 'privilege_sets.json'),
  JSON.stringify(PRIVILEGE_SET_ROWS, null, 2),
  'utf8',
)

/** roleId → assigned user names (preserve order). */
const roleAssignedUsers: Record<string, string[]> = {}
for (const row of USER_MANAGEMENT_ROLE_ROWS) {
  roleAssignedUsers[row.id] =
    getRoleDetailExtra(row.id)?.assignedUsers ?? buildDefaultExtra(row.id).assignedUsers
}

writeFileSync(join(outDir, 'role_users.json'), JSON.stringify(roleAssignedUsers, null, 2), 'utf8')
console.log('Wrote roles.json, privilege_sets.json, role_users.json')
