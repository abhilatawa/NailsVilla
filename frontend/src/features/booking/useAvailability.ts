import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/apiClient'
import type { AvailabilityResponse } from '@/types/appointment'

export function useAvailability(serviceId: string | undefined, date: string | undefined) {
  return useQuery({
    queryKey: ['availability', serviceId, date],
    queryFn: () => apiClient.get<AvailabilityResponse>(`/availability?date=${date}&serviceId=${serviceId}`),
    enabled: Boolean(serviceId && date),
  })
}
