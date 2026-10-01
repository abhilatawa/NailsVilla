import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/apiClient'
import type { AdminAppointment, AppointmentStatus } from '@/types/appointment'

export interface AdminAppointmentFilters {
  from: string
  to: string
  status?: AppointmentStatus
}

export function useAdminAppointments({ from, to, status }: AdminAppointmentFilters) {
  const params = new URLSearchParams({ from, to })
  if (status) params.set('status', status)
  return useQuery({
    queryKey: ['admin', 'appointments', { from, to, status: status ?? null }],
    queryFn: () => apiClient.get<AdminAppointment[]>(`/admin/appointments?${params.toString()}`),
    // New bookings can arrive at any time; keep the list fresh while it's open.
    refetchInterval: 60 * 1000,
    refetchOnWindowFocus: true,
  })
}
