const SESSION_KEY = 'exotel-playground-authenticated'

export const roleHomeMap: Record<string, string> = {
  admin:      '/home',
  agent:      '/agent',
  developer:  '/developer',
  supervisor: '/supervisor',
}

/** Read role from the onboarding blob that OnboardingContext already saves. */
function readRoleFromStorage(): string | null {
  try {
    const raw = localStorage.getItem('exotel-onboarding')
    if (!raw) return null
    return (JSON.parse(raw) as { role?: string }).role ?? null
  } catch {
    return null
  }
}

export function getHomeRoute(): string {
  const role = readRoleFromStorage()
  return roleHomeMap[role ?? ''] ?? '/'
}

export function validatePlaygroundCredentials(email: string, password: string): boolean {
  const e = email.trim().toLowerCase()
  return e === 'exotel' && password === 'Exotel'
}

export function isPlaygroundAuthenticated(): boolean {
  return sessionStorage.getItem(SESSION_KEY) === '1'
}

export function setPlaygroundAuthenticated(): void {
  sessionStorage.setItem(SESSION_KEY, '1')
}

export function clearPlaygroundSession(): void {
  sessionStorage.removeItem(SESSION_KEY)
}
