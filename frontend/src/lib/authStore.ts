import type { AccessTokenResponse, AuthUser } from '@/types/auth'

/*
 * The logged-in session. The access token lives only in memory (never localStorage);
 * the long-lived refresh token is an httpOnly cookie the browser sends to /api/v1/auth,
 * so a page reload restores the session by calling /auth/refresh.
 */

export type AuthState =
  | { status: 'loading'; user: null }
  | { status: 'authenticated'; user: AuthUser }
  | { status: 'anonymous'; user: null }

type Listener = () => void

let state: AuthState = { status: 'loading', user: null }
let accessToken: string | null = null
let refreshInFlight: Promise<boolean> | null = null
let restoreStarted = false
const listeners = new Set<Listener>()

function emit() {
  listeners.forEach((listener) => listener())
}

export function setSession(response: AccessTokenResponse) {
  accessToken = response.accessToken
  state = { status: 'authenticated', user: response.user }
  emit()
}

export function clearSession() {
  accessToken = null
  state = { status: 'anonymous', user: null }
  emit()
}

export function getAccessToken() {
  return accessToken
}

/**
 * Exchanges the refresh cookie for a new access token. Concurrent callers share one
 * request — the backend rotates refresh tokens, so two parallel refreshes would race.
 */
export function refreshSession(): Promise<boolean> {
  refreshInFlight ??= fetch('/api/v1/auth/refresh', { method: 'POST', credentials: 'include' })
    .then(async (response) => {
      if (!response.ok) throw new Error('refresh failed')
      setSession((await response.json()) as AccessTokenResponse)
      return true
    })
    .catch(() => {
      clearSession()
      return false
    })
    .finally(() => {
      refreshInFlight = null
    })
  return refreshInFlight
}

/** Restores the session from the refresh cookie once per page load. */
export function restoreSession() {
  if (restoreStarted) return
  restoreStarted = true
  void refreshSession()
}

export function subscribe(listener: Listener) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function getSnapshot() {
  return state
}
