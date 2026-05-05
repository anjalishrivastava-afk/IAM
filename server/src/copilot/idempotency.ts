/**
 * In-process idempotency for tool executions (prototype). Keyed by client execution id.
 */
const cache = new Map<string, unknown>()

export function getCachedResult<T>(executionId: string): T | undefined {
  return cache.get(executionId) as T | undefined
}

export function setCachedResult(executionId: string, result: unknown): void {
  cache.set(executionId, result)
}

export function clearAllIdempotency(): void {
  cache.clear()
}
