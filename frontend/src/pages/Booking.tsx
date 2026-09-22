import { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { ConfirmationStep } from '@/features/booking/components/ConfirmationStep'
import { DateStep } from '@/features/booking/components/DateStep'
import { DetailsStep, type BookingDetails } from '@/features/booking/components/DetailsStep'
import { ReviewStep } from '@/features/booking/components/ReviewStep'
import { ServiceStep } from '@/features/booking/components/ServiceStep'
import { StepIndicator } from '@/features/booking/components/StepIndicator'
import { TimeStep } from '@/features/booking/components/TimeStep'
import { useCreateAppointment } from '@/features/booking/useCreateAppointment'
import { useService } from '@/features/services/useServices'
import { ApiRequestError } from '@/types/api'
import type { Appointment } from '@/types/appointment'
import type { Service } from '@/types/service'

type Step = 'service' | 'date' | 'time' | 'details' | 'review'

const STEP_INDEX: Record<Step, number> = { service: 0, date: 1, time: 2, details: 3, review: 4 }

export function BookingPage() {
  const location = useLocation()
  const preselectedServiceId = (location.state as { serviceId?: string } | null)?.serviceId ?? null

  const [step, setStep] = useState<Step>(preselectedServiceId ? 'date' : 'service')
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [date, setDate] = useState<string | null>(null)
  const [startTime, setStartTime] = useState<string | null>(null)
  const [details, setDetails] = useState<BookingDetails | null>(null)
  const [confirmedAppointment, setConfirmedAppointment] = useState<Appointment | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const { data: preselectedService } = useService(preselectedServiceId ?? undefined)
  useEffect(() => {
    if (preselectedService && !selectedService) {
      setSelectedService(preselectedService)
    }
    // Only react to the preselected service resolving; selectedService itself changes as the user picks.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preselectedService])

  const createAppointment = useCreateAppointment()
  const idempotencyKeyRef = useRef(crypto.randomUUID())

  async function handleConfirm() {
    if (!selectedService || !date || !startTime || !details) return
    setSubmitError(null)
    try {
      const appointment = await createAppointment.mutateAsync({
        payload: {
          serviceId: selectedService.id,
          date,
          startTime,
          customerNotes: details.notes,
          guestFirstName: details.firstName,
          guestLastName: details.lastName,
          guestEmail: details.email,
          guestPhone: details.phone,
        },
        idempotencyKey: idempotencyKeyRef.current,
      })
      setConfirmedAppointment(appointment)
    } catch (error) {
      setSubmitError(error instanceof ApiRequestError ? error.apiError.message : 'Something went wrong. Please try again.')
    }
  }

  if (confirmedAppointment) {
    return (
      <section className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
        <ConfirmationStep appointment={confirmedAppointment} />
      </section>
    )
  }

  return (
    <section className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
      <h1 className="sr-only">Book an Appointment</h1>
      <StepIndicator currentIndex={STEP_INDEX[step]} />

      <div className="mt-10">
        {step === 'service' && (
          <ServiceStep
            selectedServiceId={selectedService?.id ?? null}
            onSelect={setSelectedService}
            onContinue={() => setStep('date')}
          />
        )}

        {step === 'date' && selectedService && (
          <DateStep selectedDate={date} onSelect={setDate} onBack={() => setStep('service')} onContinue={() => setStep('time')} />
        )}

        {step === 'time' && selectedService && date && (
          <TimeStep
            serviceId={selectedService.id}
            date={date}
            selectedStartTime={startTime}
            onSelect={setStartTime}
            onBack={() => setStep('date')}
            onContinue={() => setStep('details')}
          />
        )}

        {step === 'details' && (
          <DetailsStep
            defaultValues={details ?? {}}
            onBack={() => setStep('time')}
            onContinue={(values) => {
              setDetails(values)
              setStep('review')
            }}
          />
        )}

        {step === 'review' && selectedService && date && startTime && details && (
          <ReviewStep
            service={selectedService}
            date={date}
            startTime={startTime}
            details={details}
            isSubmitting={createAppointment.isPending}
            submitError={submitError}
            onBack={() => setStep('details')}
            onConfirm={handleConfirm}
          />
        )}
      </div>
    </section>
  )
}
