import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/apiClient'
import type { AvailabilityResponse } from '@/types/appointment'

export function useAvailability(serviceId: string | undefined, date: string | undefined) {
  return useQuery({
    queryKey: ['availability', serviceId, date],
    queryFn: () => apiClient.get<AvailabilityResponse>(`/availability?date=${date}&serviceId=${serviceId}`),
    enabled: Boolean(serviceId && date),
    // Someone else may book while this page is open — keep the greyed-out slots current.
    refetchInterval: 60 * 1000,
    refetchOnWindowFocus: true,
  })
}
