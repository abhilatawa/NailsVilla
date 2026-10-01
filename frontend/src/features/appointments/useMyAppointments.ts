import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/apiClient'
import type { Appointment } from '@/types/appointment'

export function useMyAppointments() {
  return useQuery({
    queryKey: ['my-appointments'],
    queryFn: () => apiClient.get<Appointment[]>('/appointments/my'),
  })
}
