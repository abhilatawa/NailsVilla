import { useMutation } from '@tanstack/react-query'
import { apiClient } from '@/lib/apiClient'
import type { Appointment, CreateAppointmentPayload } from '@/types/appointment'

interface CreateAppointmentArgs {
  payload: CreateAppointmentPayload
  /**
   * Generated once per booking attempt by the caller (not inside this hook) so that a
   * retry — automatic or a re-click of "Confirm" — reuses the same key instead of
   * looking like a brand-new booking attempt to the backend.
   */
  idempotencyKey: string
}

export function useCreateAppointment() {
  return useMutation({
    mutationFn: ({ payload, idempotencyKey }: CreateAppointmentArgs) =>
      apiClient.post<Appointment>('/appointments', payload, {
        headers: { 'Idempotency-Key': idempotencyKey },
      }),
  })
}
