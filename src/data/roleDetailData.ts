/** Extended role detail — users & privilege labels for RBAC Role detail screens. */

import { USER_MANAGEMENT_ROLE_ROWS } from './userManagementRoles'

export interface RoleDetailExtra {
  /** Full list of assigned user display names — chip order preserved. */
  assignedUsers: string[]
  /** Labels for privilege set chips attached to this role. */
  privilegeSets: string[]
}

const PRIV_POOL = [
  'Monitor',
  'CQA',
  'Reports',
  'Admin Console',
  'API scopes',
  'Integrations hub',
  'Queues',
  'Skills routing',
  'Messaging',
  'Compliance viewer',
  'Vault access',
  'Audit trail',
  'Quality calibration',
  'Outbound dialer',
  'Inbound queues',
  'Dashboards',
  'Alerts & SLA',
]

/** Per-role enrichment; unspecified ids fall back to `buildDefaultExtra`. */
const ROLE_DETAIL_EXTRA: Record<string, RoleDetailExtra> = {
  'role-1': {
    assignedUsers: [
      'Aditya Pratap Singh',
      'Riya Kapoor',
      'Kiran Mehta',
      'System Operations',
      'Nikhil Verma',
      'Sana Khan',
      'Arjun Nair',
      'Meera Iyer',
      'Venkat Subramaniam',
      'Zara Khanna',
      'Dev Malhotra',
      'Priya Srinivasan',
      'Rajesh Gupta',
      'Ananya Bose',
      'Imran Siddiqui',
      'Shruti Patel',
      'Karthik Rao',
      'Neha Chauhan',
    ],
    privilegeSets: [
      ...PRIV_POOL.slice(0, 11),
      'HDFC LOS bridge',
      'Branch roster',
      'RBI sandbox',
      'Outbound intents',
      'Regional SLAs',
    ],
  },
  'role-2': {
    assignedUsers: [
      'Priya Lal',
      'Amit Bose',
      'Sneha Rao',
      'Rudrakshula Prasad',
      'Rohit Chawla',
      'Divya Srinivas',
      'Manish Kapoor',
      'Tanya Verghese',
      'Govind Pawar',
      'Simran Sethi',
      'Arvind Mishra',
      'Pooja Nambiar',
      'Vikas Reddy',
      'Leena Dutta',
    ],
    privilegeSets: [
      'Supervisor toolkit',
      'Queue admin',
      'Reports',
      'Agent coaching',
      'SLA dashboards',
      'Escalations',
      'Real-time widgets',
      'Shift roster',
      'Forecasting lite',
      'Audit sampling',
      'Outbound preview',
      'Messaging templates',
      'Compliance queue',
      'Sandbox eval',
      'API tokens (read)',
      'HDFC uplift pack',
      'Regional routing',
      'Dialer intents',
      'Compliance vault',
      'Sandbox mirroring',
    ],
  },
}

function placeholderUsers(roleIdDigits: number, requested: number): string[] {
  const row = USER_MANAGEMENT_ROLE_ROWS.find((r) => r.id === `role-${roleIdDigits}`)
  const rn = row?.roleName ?? 'Assigned user'
  return Array.from({ length: requested }, (_, i) =>
    rn.length <= 42 ? `${rn} — User ${String(i + 1).padStart(2, '0')}` : `${rn.slice(0, 38)}… ${i + 1}`,
  )
}

function placeholderPrivileges(roleName: string): string[] {
  return [`${roleName} — Core`, `${roleName} — Extended`, 'Analytics read', 'Users read']
}

export function buildDefaultExtra(roleId: string): RoleDetailExtra {
  const row = USER_MANAGEMENT_ROLE_ROWS.find((r) => r.id === roleId)
  const digits = Number(roleId.replace(/\D/g, '')) || 1

  const countFromRole = Math.max(row?.assignedUserCount ?? 18, 20)
  const userCount = Math.min(Math.max(countFromRole + 6, 22), 40)

  const privilegeSets = [...placeholderPrivileges(row?.roleName ?? 'Role'), ...PRIV_POOL].slice(
    0,
    14 + (digits % 5),
  )

  return {
    assignedUsers: placeholderUsers(digits, userCount),
    privilegeSets,
  }
}

export function getRoleDetailExtra(roleId: string): RoleDetailExtra | null {
  const row = USER_MANAGEMENT_ROLE_ROWS.find((r) => r.id === roleId)
  if (!row) return null
  const extra = ROLE_DETAIL_EXTRA[roleId] ?? buildDefaultExtra(roleId)
  return extra
}

/** Max chips to show before collapsing (approx. two dense rows depending on viewport). */
export const ROLE_DETAIL_COLLAPSED_CHIP_CAP = 5
