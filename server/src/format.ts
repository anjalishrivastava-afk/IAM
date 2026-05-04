export function formatCreatedAtLabel(iso: string): string {
  const d = new Date(iso)
  const month = d.toLocaleString('en-US', { month: 'short' })
  const day = d.getDate()
  const h = d.getHours()
  const m = d.getMinutes().toString().padStart(2, '0')
  return `${month} ${day}, ${h}:${m}`
}

export function nowIso(): string {
  return new Date().toISOString()
}
