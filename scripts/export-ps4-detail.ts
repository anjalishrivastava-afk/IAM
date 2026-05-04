/**
 * Generates server/prisma/ps4-detail.json from the playground static model.
 * Run: npx tsx scripts/export-ps4-detail.ts
 */
import { writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { getPrivilegeSetDetail } from '../src/data/privilegeSetDetailData'

const __dirname = dirname(fileURLToPath(import.meta.url))

const detail = getPrivilegeSetDetail('ps-4')
if (!detail) {
  throw new Error('Privilege set ps-4 not found')
}

const target = join(__dirname, '../server/prisma/ps4-detail.json')
writeFileSync(target, JSON.stringify(detail, null, 2), 'utf8')
console.log('Wrote', target)
