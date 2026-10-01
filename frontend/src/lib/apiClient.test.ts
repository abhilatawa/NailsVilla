import { afterEach, describe, expect, it, vi } from 'vitest'
import { apiClient } from '@/lib/apiClient'
import { clearSession, getAccessToken, setSession } from '@/lib/authStore'

const user = { id: 'u1', firstName: 'Sam', lastName: 'Owner', email: 'sam@example.com', role: 'ADMIN' as const }

function json(status: number, body: unknown) {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } })
}

describe('apiClient session handling', () => {
  afterEach(() => {
    vi.restoreAllMocks()
    clearSession()
  })

  it('sends the access token, and on a 401 refreshes once and retries with the new token', async () => {
    setSession({ accessToken: 'expired', expiresInSeconds: 900, user })
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(json(401, { code: 'UNAUTHENTICATED', message: 'Please log in to continue.' }))
      .mockResolvedValueOnce(json(200, { accessToken: 'fresh', expiresInSeconds: 900, user }))
      .mockResolvedValueOnce(json(200, [{ id: 'a1' }]))

    const result = await apiClient.get<{ id: string }[]>('/admin/appointments')

    expect(result).toEqual([{ id: 'a1' }])
    expect(fetchMock.mock.calls[1]?.[0]).toBe('/api/v1/auth/refresh')
    const headers = (call: number) => (fetchMock.mock.calls[call]?.[1]?.headers ?? {}) as Record<string, string>
    expect(headers(0).Authorization).toBe('Bearer expired')
    expect(headers(2).Authorization).toBe('Bearer fresh')
    expect(getAccessToken()).toBe('fresh')
  })

  it('logs the user out when the refresh is rejected', async () => {
    setSession({ accessToken: 'expired', expiresInSeconds: 900, user })
    vi.spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(json(401, { code: 'UNAUTHENTICATED', message: 'Please log in to continue.' }))
      .mockResolvedValueOnce(json(401, { code: 'INVALID_REFRESH_TOKEN', message: 'Expired' }))

    await expect(apiClient.get('/appointments/my')).rejects.toThrow('Please log in to continue.')
    expect(getAccessToken()).toBeNull()
  })
})
