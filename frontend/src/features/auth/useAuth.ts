import { useSyncExternalStore } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/apiClient'
import { clearSession, getSnapshot, setSession, subscribe } from '@/lib/authStore'
import type { AccessTokenResponse, Role } from '@/types/auth'

export function useAuth() {
  return useSyncExternalStore(subscribe, getSnapshot)
}

/** Where someone lands after logging in when they weren't heading anywhere in particular. */
export function homeFor(role: Role) {
  return role === 'ADMIN' ? '/admin' : '/dashboard'
}

export interface LoginValues {
  email: string
  password: string
}

export interface RegisterValues {
  firstName: string
  lastName: string
  email: string
  password: string
  phone?: string
}

export function useLogin() {
  return useMutation({
    mutationFn: (values: LoginValues) => apiClient.post<AccessTokenResponse>('/auth/login', values),
    onSuccess: setSession,
  })
}

export function useRegister() {
  return useMutation({
    mutationFn: (values: RegisterValues) => apiClient.post<AccessTokenResponse>('/auth/register', values),
    onSuccess: setSession,
  })
}

/** Private data cached under these keys must not survive into the next person's session. */
const PRIVATE_QUERY_KEYS = [['admin'], ['my-appointments']]

export function useLogout() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => apiClient.post<void>('/auth/logout'),
    // Log out locally even if the server call fails — the user asked to leave.
    onSettled: () => {
      clearSession()
      PRIVATE_QUERY_KEYS.forEach((queryKey) => queryClient.removeQueries({ queryKey }))
    },
  })
}
