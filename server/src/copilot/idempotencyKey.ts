import { createHash } from 'node:crypto'

/** Deterministic cache key per conversation + tool + args (additive tools only). */
export function additiveToolCacheKey(
  conversationId: string,
  toolName: string,
  args: Record<string, unknown>,
): string {
  const h = createHash('sha256')
  h.update(conversationId)
  h.update('\0')
  h.update(toolName)
  h.update('\0')
  h.update(JSON.stringify(args))
  return `idem:${h.digest('hex')}`
}
