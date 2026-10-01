import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/apiClient'
import type { Appointment } from '@/types/appointment'

export function useCancelAppointment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      apiClient.post<Appointment>(`/appointments/${id}/cancel`, { reason: reason || undefined }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['my-appointments'] })
      // The freed-up slot should immediately show as bookable again.
      void queryClient.invalidateQueries({ queryKey: ['availability'] })
    },
  })
}
