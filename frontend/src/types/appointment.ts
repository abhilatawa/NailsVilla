export type AppointmentStatus = 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW'

export interface TimeSlot {
  start: string
  end: string
}

export interface AvailabilityResponse {
  date: string
  timezone: string
  slots: TimeSlot[]
}

export interface Appointment {
  id: string
  serviceId: string
  serviceName: string
  date: string
  startTime: string
  endTime: string
  durationMinutes: number
  price: number
  currency: string
  status: AppointmentStatus
  businessLocation: string
  cancellationPolicyHours: number
  customerNotes: string | null
}

export interface CreateAppointmentPayload {
  serviceId: string
  date: string
  startTime: string
  customerNotes?: string
  guestFirstName?: string
  guestLastName?: string
  guestEmail?: string
  guestPhone?: string
}
