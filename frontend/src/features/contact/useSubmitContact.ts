import { useMutation } from '@tanstack/react-query'
import { apiClient } from '@/lib/apiClient'

export interface ContactPayload {
  name: string
  email: string
  message: string
}

export function useSubmitContact() {
  return useMutation({
    mutationFn: (payload: ContactPayload) => apiClient.post<void>('/contact', payload),
  })
}
