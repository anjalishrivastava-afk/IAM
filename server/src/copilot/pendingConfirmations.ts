type Resolve = (confirmed: boolean) => void

const pending = new Map<string, Resolve>()

export function confirmKey(conversationId: string, toolCallId: string): string {
  return `${conversationId}::${toolCallId}`
}

export function waitForConfirmation(conversationId: string, toolCallId: string): Promise<boolean> {
  const key = confirmKey(conversationId, toolCallId)
  return new Promise<boolean>((resolve) => {
    pending.set(key, resolve)
  })
}

export function resolveConfirmation(conversationId: string, toolCallId: string, confirmed: boolean): boolean {
  const key = confirmKey(conversationId, toolCallId)
  const r = pending.get(key)
  if (!r) return false
  pending.delete(key)
  r(confirmed)
  return true
}
