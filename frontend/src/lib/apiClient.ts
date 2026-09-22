import { ApiRequestError, type ApiError } from '@/types/api'

const API_BASE_URL = '/api/v1'

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers,
    },
    credentials: 'include',
  })

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as ApiError | null
    if (body) {
      throw new ApiRequestError(body)
    }
    throw new Error(`Request to ${path} failed with status ${response.status}`)
  }

  // Any success response can legitimately have no body (204, or 202/200 from an
  // endpoint like /contact that acknowledges without returning data) — read as text
  // first so an empty body never hits response.json()'s "Unexpected end of input".
  const text = await response.text()
  if (text.length === 0) {
    return undefined as T
  }
  return JSON.parse(text) as T
}

export const apiClient = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown, init?: RequestInit) =>
    request<T>(path, { ...init, method: 'POST', body: body ? JSON.stringify(body) : undefined }),
  patch: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'PATCH', body: body ? JSON.stringify(body) : undefined }),
}
