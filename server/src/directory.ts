/**
 * Mock staff directory for GET /api/users — swap for real directory in production.
 */
export type DirectoryUser = {
  id: string
  displayName: string
  email: string
  branch?: string
  /** Comms/work channel (Harmony UM grid). */
  channel?: string
  /** Utilization-style capacity 0–100 (shown as percent in UI). */
  capacity?: number
  /** Assigned campaigns summary for admin roster. */
  campaigns?: string
  /** Organizational / routing groups for the Groups column. */
  groups?: string[]
}

const SEED: DirectoryUser[] = [
  {
    id: 'usr_mumbai_1',
    displayName: 'Asha Menon',
    email: 'asha.menon@example.com',
    branch: 'Mumbai',
    channel: 'Voice',
    capacity: 82,
    campaigns: 'HDFC Outbound Voice, Retail QA',
    groups: ['North Agents', 'Sales Pod A'],
  },
  {
    id: 'usr_mumbai_2',
    displayName: 'Rahul Kulkarni',
    email: 'rahul.k@example.com',
    branch: 'Mumbai',
    channel: 'WhatsApp',
    capacity: 64,
    campaigns: 'Monsoon Support, CSAT Follow-up',
    groups: ['WhatsApp L1', 'Mumbai'],
  },
  {
    id: 'usr_mumbai_3',
    displayName: 'Priya Shah',
    email: 'priya.shah@example.com',
    branch: 'Mumbai',
    channel: 'Voice',
    capacity: 91,
    campaigns: 'Retail IVR, Escalations',
    groups: ['IVR Team', 'North Agents'],
  },
  {
    id: 'usr_del_1',
    displayName: 'Divya Anand',
    email: 'divya.a@example.com',
    branch: 'Delhi',
    channel: 'SMS',
    capacity: 55,
    campaigns: 'Promo Blitz, NPS',
    groups: ['Delhi Hub', 'Campaign Ops'],
  },
  {
    id: 'usr_del_2',
    displayName: 'Kabir Malik',
    email: 'kabir.m@example.com',
    branch: 'Delhi',
    channel: 'Voice',
    capacity: 77,
    campaigns: 'Enterprise Care, AMEX Line',
    groups: ['Enterprise', 'Delhi Hub'],
  },
  {
    id: 'usr_super_1',
    displayName: 'Vikram Bose',
    email: 'vikram.bose@example.com',
    branch: 'HQ',
    channel: 'Email',
    capacity: 48,
    campaigns: 'Audit Trail, Reporting',
    groups: ['HQ Admin', 'Compliance'],
  },
  {
    id: 'usr_super_2',
    displayName: 'Neha Srinivasan',
    email: 'neha.s@example.com',
    branch: 'HQ',
    channel: 'Voice',
    capacity: 88,
    campaigns: 'HDFC Outbound Voice, Workforce',
    groups: ['Workforce', 'HQ Admin', 'Quality'],
  },
]

export function listDirectoryUsers(search?: string): DirectoryUser[] {
  const q = (search ?? '').trim().toLowerCase()
  if (!q) return [...SEED]
  return SEED.filter(
    (u) =>
      u.displayName.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.id.toLowerCase().includes(q) ||
      (u.branch?.toLowerCase().includes(q) ?? false) ||
      (u.channel?.toLowerCase().includes(q) ?? false) ||
      (u.campaigns?.toLowerCase().includes(q) ?? false) ||
      (u.groups?.some((g) => g.toLowerCase().includes(q)) ?? false),
  )
}
