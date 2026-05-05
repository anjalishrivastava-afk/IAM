/**
 * Mock staff directory for GET /api/users — swap for real directory in production.
 */
export type DirectoryUser = {
  id: string
  displayName: string
  email: string
  branch?: string
}

const SEED: DirectoryUser[] = [
  { id: 'usr_mumbai_1', displayName: 'Asha Menon', email: 'asha.menon@example.com', branch: 'Mumbai' },
  { id: 'usr_mumbai_2', displayName: 'Rahul Kulkarni', email: 'rahul.k@example.com', branch: 'Mumbai' },
  { id: 'usr_mumbai_3', displayName: 'Priya Shah', email: 'priya.shah@example.com', branch: 'Mumbai' },
  { id: 'usr_del_1', displayName: 'Divya Anand', email: 'divya.a@example.com', branch: 'Delhi' },
  { id: 'usr_del_2', displayName: 'Kabir Malik', email: 'kabir.m@example.com', branch: 'Delhi' },
  { id: 'usr_super_1', displayName: 'Vikram Bose', email: 'vikram.bose@example.com', branch: 'HQ' },
  { id: 'usr_super_2', displayName: 'Neha Srinivasan', email: 'neha.s@example.com', branch: 'HQ' },
]

export function listDirectoryUsers(search?: string): DirectoryUser[] {
  const q = (search ?? '').trim().toLowerCase()
  if (!q) return [...SEED]
  return SEED.filter(
    (u) =>
      u.displayName.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.id.toLowerCase().includes(q) ||
      (u.branch?.toLowerCase().includes(q) ?? false),
  )
}
