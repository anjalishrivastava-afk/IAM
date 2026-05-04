const SESSION_KEY = 'exotel-playground-authenticated'

/** Design sign-in: email and password both specified as Exotel (case per field below). */
export function validatePlaygroundCredentials(email: string, password: string): boolean {
  const e = email.trim().toLowerCase()
  const okEmail = e === 'exotel'
  const okPassword = password === 'Exotel'
  return okEmail && okPassword
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
