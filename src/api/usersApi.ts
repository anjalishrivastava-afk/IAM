import type { GridSortModel } from '@mui/x-data-grid-pro'
import type { TableUserRow } from '../data/tableUser'
import type { FilterRecords } from '../types/filterRecords'

const dataUrl = (path: string) => {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '')
  return `${base}${path.startsWith('/') ? path : `/${path}`}`
}

type UsersJsonFile = {
  rows: TableUserRow[]
}

/**
 * Loads the full users dataset from a single static file (one GET, like /api/users).
 * Call this on every API request — no in-memory cache.
 */
export async function fetchUsersDataset(): Promise<TableUserRow[]> {
  const res = await fetch(dataUrl('/data/users.json'), {
    headers: { Accept: 'application/json' },
  })
  if (!res.ok) {
    throw new Error(`Failed to load users: ${res.status} ${res.statusText}`)
  }
  const body = (await res.json()) as UsersJsonFile
  if (!Array.isArray(body.rows)) {
    throw new Error('Invalid users payload: expected { rows: [] }')
  }
  return body.rows
}

function selectFilterValue(value: FilterRecords[string]): string | undefined {
  if (typeof value === 'string') return value
  return undefined
}

function applyToolbarFilters(rows: TableUserRow[], filters: FilterRecords): TableUserRow[] {
  const role = selectFilterValue(filters.role)
  const team = selectFilterValue(filters.team)

  return rows.filter((r) => {
    if (role && role !== 'all' && r.role !== role) return false
    if (team && team !== 'all' && r.team !== team) return false
    return true
  })
}

const SORTABLE_FIELDS = new Set(['userName', 'email', 'status', 'role', 'team'])

function compareRows(a: TableUserRow, b: TableUserRow, sortModel: GridSortModel): number {
  const primary = sortModel[0]
  if (!primary?.sort) {
    return a.id - b.id
  }
  const { field, sort } = primary
  const dir = sort === 'desc' ? -1 : 1

  if (!SORTABLE_FIELDS.has(field)) {
    return a.id - b.id
  }

  const va = a[field as keyof TableUserRow]
  const vb = b[field as keyof TableUserRow]
  const sa = String(va ?? '')
  const sb = String(vb ?? '')
  if (sa < sb) return -1 * dir
  if (sa > sb) return 1 * dir
  return a.id - b.id
}

function applySort(rows: TableUserRow[], sortModel: GridSortModel): TableUserRow[] {
  if (sortModel.length > 0 && sortModel[0]?.sort) {
    return [...rows].sort((a, b) => compareRows(a, b, sortModel))
  }
  return [...rows].sort((a, b) => a.id - b.id)
}

export type UsersQueryParams = {
  page: number
  pageSize: number
  sortModel: GridSortModel
  filters: FilterRecords
}

export type UsersQueryResult = {
  rows: TableUserRow[]
  rowCount: number
}

/**
 * Simulates a paged API: fetch full dataset, apply filters + sort, then return one page (chunk).
 * Same flow a backend would use with query params: page, pageSize, sort, filters.
 */
export async function fetchUsersQuery(params: UsersQueryParams): Promise<UsersQueryResult> {
  const { page, pageSize, sortModel, filters } = params

  const all = await fetchUsersDataset()
  const filtered = applyToolbarFilters(all, filters)
  const sorted = applySort(filtered, sortModel)

  const total = sorted.length
  const start = page * pageSize
  if (start >= total) {
    return { rows: [], rowCount: total }
  }
  const rows = sorted.slice(start, start + pageSize)
  return { rows, rowCount: total }
}
