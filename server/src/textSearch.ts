/**
 * Token / stopword helpers for copilot search (users, roles, privilege sets).
 */

const STOPWORDS = new Set([
  'a',
  'an',
  'the',
  'and',
  'or',
  'to',
  'for',
  'of',
  'in',
  'on',
  'at',
  'by',
  'with',
  'from',
  'user',
  'users',
  'role',
  'roles',
  'set',
  'sets',
  'privilege',
  'privileges',
  'permission',
  'permissions',
  'apply',
  'assign',
  'give',
  'add',
  'attach',
  'detach',
  'remove',
  'delete',
  'please',
  'this',
  'that',
])

export function normalizeSearch(q: string): string {
  return q.trim().toLowerCase().replace(/\s+/g, ' ')
}

/** Words that carry meaning for matching (noise like "privileges" stripped). */
export function meaningfulTokens(q: string): string[] {
  const parts = normalizeSearch(q)
    .split(/[^\p{L}\p{N}]+/u)
    .map((s) => s.toLowerCase())
    .filter((s) => s.length >= 2 && !STOPWORDS.has(s))
  return parts
}

export function searchTokens(query: string): string[] {
  const t = meaningfulTokens(query)
  if (t.length > 0) return t
  const stripped = normalizeSearch(query).replace(/[^\p{L}\p{N}\s]+/gu, ' ').trim()
  return stripped.length >= 2 ? [stripped] : []
}

/**
 * Loose match: substring, or shared prefix between token and words in haystack
 * (e.g. "monitoring" matches catalog name "monitor").
 */
export function tokenMatchesText(token: string, text: string): boolean {
  const t = token.toLowerCase()
  const hay = text.toLowerCase()
  if (!t) return true
  if (hay.includes(t)) return true
  const words = hay.split(/[^a-z0-9]+/).filter(Boolean)
  for (const w of words) {
    const minLen = Math.min(w.length, t.length)
    if (minLen < 3) continue
    if (w.startsWith(t) || t.startsWith(w)) return true
    if ((t.includes(w) || w.includes(t)) && minLen >= 4) return true
  }
  return false
}

export function substantiveTokensCoverAll(tokens: string[], ...fields: string[]): boolean {
  if (tokens.length === 0) return true
  const blob = normalizeSearch(fields.filter(Boolean).join(' '))
  return tokens.every((tok) => tokenMatchesText(tok, blob))
}

export function scoreFieldsAgainstQuery(primary: string, secondary: string[], query: string): number {
  const q = normalizeSearch(query)
  const blob = normalizeSearch([primary, ...secondary].filter(Boolean).join(' '))
  if (!q) return 1
  let score = 0
  if (primary.toLowerCase().includes(q) || q.includes(primary.toLowerCase())) score += 120
  if (blob.includes(q)) score += 100
  const tokens = searchTokens(query)
  if (tokens.length && substantiveTokensCoverAll(tokens, primary, ...secondary)) score += 80
  let partial = 0
  for (const tok of tokens) {
    if (tokenMatchesText(tok, blob)) partial += 1
  }
  if (tokens.length) score += (partial / tokens.length) * 50
  return score
}
