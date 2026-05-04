/**
 * Privilege Sets tab — RBAC bundles (User Management › Roles › Privilege Sets).
 * Mirrors Figma 1:20975 columns and counts (13 demo rows).
 */
import type { RoleScopeType } from './userManagementRoles'

export interface PrivilegeSetRow {
  id: string
  privilegeSetName: string
  description: string
  scopeType: RoleScopeType
  /** How many roles include this privilege set (toolbar “Assigned to” buckets). */
  assignedRoleCount: number
  createdBy: string
  createdAtLabel: string
  /** Roles that reference this set — powers the “Role” filter. */
  usedByRoleNames: string[]
}

export const PRIVILEGE_SET_ROWS: PrivilegeSetRow[] = [
  {
    id: 'ps-1',
    privilegeSetName: 'AQM',
    description: '',
    scopeType: 'default',
    assignedRoleCount: 2,
    createdBy: 'Aditya Pratap Singh',
    createdAtLabel: 'Apr 11, 12:19',
    usedByRoleNames: ['Admin', 'HDFC Audit & Compliance Viewer'],
  },
  {
    id: 'ps-2',
    privilegeSetName: 'Manage',
    description: 'Core management surfaces for supervisors and admins',
    scopeType: 'default',
    assignedRoleCount: 3,
    createdBy: 'Rudrakshula Prasad',
    createdAtLabel: 'Apr 11, 12:19',
    usedByRoleNames: ['Supervisor', 'HDFC Floor Manager'],
  },
  {
    id: 'ps-3',
    privilegeSetName: 'Scoring',
    description: 'Quality scoring, calibration queues and QM exports',
    scopeType: 'custom',
    assignedRoleCount: 4,
    createdBy: 'Rashika Jain',
    createdAtLabel: 'Apr 10, 09:42',
    usedByRoleNames: ['Analyst', 'Executive'],
  },
  {
    id: 'ps-4',
    privilegeSetName: 'Monitor',
    description: 'Recording, reports and dashboards',
    scopeType: 'default',
    assignedRoleCount: 3,
    createdBy: 'Aditya Pratap Singh',
    createdAtLabel: 'Apr 11, 12:19',
    usedByRoleNames: ['Supervisor', 'Analyst', 'Executive'],
  },
  {
    id: 'ps-5',
    privilegeSetName: 'Agent Workbench',
    description: '',
    scopeType: 'default',
    assignedRoleCount: 2,
    createdBy: 'Anjali Srivastava',
    createdAtLabel: 'Apr 9, 16:03',
    usedByRoleNames: ['Professional Agent', 'HDFC Floor Manager'],
  },
  {
    id: 'ps-6',
    privilegeSetName: 'Lead Management',
    description: '',
    scopeType: 'custom',
    assignedRoleCount: 3,
    createdBy: 'Rudrakshula Prasad',
    createdAtLabel: 'Apr 8, 11:20',
    usedByRoleNames: ['HDFC Branch Banking Lead', 'HDFC Retail Loan Underwriter'],
  },
  {
    id: 'ps-7',
    privilegeSetName: 'CQA',
    description: 'Contact quality assurance workspaces',
    scopeType: 'default',
    assignedRoleCount: 6,
    createdBy: 'Aditya Pratap Singh',
    createdAtLabel: 'Apr 7, 14:51',
    usedByRoleNames: ['Executive', 'Supervisor', 'HDFC Digital Journey Specialist'],
  },
  {
    id: 'ps-8',
    privilegeSetName: 'Reports',
    description: 'Reporting and scheduled exports across channels',
    scopeType: 'default',
    assignedRoleCount: 7,
    createdBy: 'Rashika Jain',
    createdAtLabel: 'Apr 6, 10:08',
    usedByRoleNames: ['Executive', 'Analyst'],
  },
  {
    id: 'ps-9',
    privilegeSetName: 'Admin Console',
    description: '',
    scopeType: 'custom',
    assignedRoleCount: 2,
    createdBy: 'Anjali Srivastava',
    createdAtLabel: 'Apr 5, 08:47',
    usedByRoleNames: ['Admin'],
  },
  {
    id: 'ps-10',
    privilegeSetName: 'API scopes',
    description: '',
    scopeType: 'custom',
    assignedRoleCount: 8,
    createdBy: 'Rudrakshula Prasad',
    createdAtLabel: 'Apr 4, 17:55',
    usedByRoleNames: ['HDFC Digital Journey Specialist', 'HDFC Omni-Channel Desk Lead'],
  },
  {
    id: 'ps-11',
    privilegeSetName: 'Integrations hub',
    description: 'Third-party integrations and webhooks',
    scopeType: 'default',
    assignedRoleCount: 4,
    createdBy: 'Aditya Pratap Singh',
    createdAtLabel: 'Apr 3, 09:31',
    usedByRoleNames: ['Admin', 'Executive'],
  },
  {
    id: 'ps-12',
    privilegeSetName: 'Queues',
    description: 'Queue orchestration across voice and messaging',
    scopeType: 'default',
    assignedRoleCount: 9,
    createdBy: 'Rashika Jain',
    createdAtLabel: 'Apr 2, 13:14',
    usedByRoleNames: ['HDFC Floor Manager', 'HDFC Branch Banking Lead', 'HDFC Omni-Channel Desk Lead'],
  },
  {
    id: 'ps-13',
    privilegeSetName: 'Skills routing',
    description: 'Skills routing and overflow policies',
    scopeType: 'custom',
    assignedRoleCount: 11,
    createdBy: 'Anjali Srivastava',
    createdAtLabel: 'Apr 1, 07:58',
    usedByRoleNames: [
      'HDFC Digital Journey Specialist',
      'HDFC Retail Loan Underwriter',
      'HDFC Audit & Compliance Viewer',
    ],
  },
]
