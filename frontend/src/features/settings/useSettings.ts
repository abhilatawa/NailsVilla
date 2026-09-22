import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/apiClient'
import type { PublicSettings } from '@/types/settings'

export function useSettings() {
  return useQuery({
    queryKey: ['settings', 'public'],
    queryFn: () => apiClient.get<PublicSettings>('/settings/public'),
    staleTime: 5 * 60 * 1000,
  })
}
