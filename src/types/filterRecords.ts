import type { DateRangeValue } from '@exotel-npm-dev/signal-design-system'

/** Mirrors design-system `FilterValue` / `FilterRecords` (not re-exported from the package root). */
export type FilterValue = string | DateRangeValue | string[] | undefined

export type FilterRecords = Record<string, FilterValue>
