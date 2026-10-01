export type AppointmentStatus = 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW'

export interface TimeSlot {
  start: string
  end: string
  /** False when another booking (or blocked time) already holds this window. */
  available: boolean
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

/** A booking as the salon owner sees it (GET /admin/appointments). */
export interface AdminAppointment {
  id: string
  date: string
  startTime: string
  endTime: string
  serviceId: string
  serviceName: string
  durationMinutes: number
  price: number
  currency: string
  status: AppointmentStatus
  customerName: string
  customerEmail: string | null
  customerPhone: string | null
  guest: boolean
  customerNotes: string | null
  cancellationReason: string | null
  createdAt: string
}
