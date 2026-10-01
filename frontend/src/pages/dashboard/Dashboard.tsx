import { useEffect, useState } from 'react'
import { CalendarDays } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Dialog } from '@/components/ui/Dialog'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorState } from '@/components/ui/ErrorState'
import { Label } from '@/components/ui/Label'
import { Skeleton } from '@/components/ui/Skeleton'
import { Textarea } from '@/components/ui/Textarea'
import { useCancelAppointment } from '@/features/appointments/useCancelAppointment'
import { useMyAppointments } from '@/features/appointments/useMyAppointments'
import { useAuth } from '@/features/auth/useAuth'
import { formatMoney } from '@/lib/money'
import { cancellationDeadline, formatDateLong, formatDateTimeShort, formatTime, todayIso } from '@/lib/time'
import { toast } from '@/lib/toastStore'
import { ApiRequestError } from '@/types/api'
import type { Appointment, AppointmentStatus } from '@/types/appointment'

const STATUS_LABELS: Record<AppointmentStatus, string> = {
  PENDING: 'Awaiting confirmation',
  CONFIRMED: 'Confirmed',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
  NO_SHOW: 'Missed',
}

/** The current time, re-read every minute so cancellation deadlines lapse while the page is open. */
function useNow() {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 60 * 1000)
    return () => clearInterval(id)
  }, [])
  return now
}

export function DashboardPage() {
  const auth = useAuth()
  const now = useNow()
  const { data: appointments, isLoading, isError, refetch } = useMyAppointments()

  const today = todayIso()
  const isUpcoming = (a: Appointment) => a.date >= today && (a.status === 'PENDING' || a.status === 'CONFIRMED')
  const upcoming = (appointments ?? []).filter(isUpcoming).reverse()
  const past = (appointments ?? []).filter((a) => !isUpcoming(a))

  return (
    <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <div className="text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-gold">My Account</p>
        <h1 className="mt-3 font-display text-4xl text-charcoal">
          {auth.user ? `Hello, ${auth.user.firstName}` : 'Your Appointments'}
        </h1>
        <p className="mt-3 text-charcoal-soft">Your upcoming and past visits to Nails Villa.</p>
      </div>

      <div className="mt-12">
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
          </div>
        ) : isError ? (
          <ErrorState onRetry={() => refetch()} />
        ) : (
          <>
            <h2 className="font-display text-2xl text-charcoal">Upcoming</h2>
            <div className="mt-4 space-y-4">
              {upcoming.length === 0 ? (
                <EmptyState
                  icon={CalendarDays}
                  title="No upcoming appointments"
                  description="When you book, your appointment will show up here."
                />
              ) : (
                upcoming.map((appointment) => (
                  <AppointmentCard key={appointment.id} appointment={appointment} now={now} cancellable />
                ))
              )}
            </div>

            {past.length > 0 && (
              <>
                <h2 className="mt-12 font-display text-2xl text-charcoal">Past &amp; cancelled</h2>
                <div className="mt-4 space-y-4">
                  {past.map((appointment) => (
                    <AppointmentCard key={appointment.id} appointment={appointment} now={now} muted />
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>

      <div className="mt-12 text-center">
        <Button size="lg" asChild>
          <Link to="/book">Book an Appointment</Link>
        </Button>
      </div>
    </section>
  )
}

function AppointmentCard({
  appointment,
  now,
  muted = false,
  cancellable = false,
}: {
  appointment: Appointment
  now: number
  muted?: boolean
  cancellable?: boolean
}) {
  const [confirming, setConfirming] = useState(false)
  const deadline = cancellationDeadline(appointment.date, appointment.startTime, appointment.cancellationPolicyHours)
  const canCancel = cancellable && now < deadline.getTime()

  return (
    <Card className={muted ? 'p-5 opacity-75' : 'p-5'}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-display text-xl text-charcoal">{appointment.serviceName}</p>
          <p className="mt-1 text-sm text-charcoal-soft">
            {formatDateLong(appointment.date)} · {formatTime(appointment.startTime)} – {formatTime(appointment.endTime)}
          </p>
          <p className="mt-1 text-sm text-charcoal-soft">
            {appointment.businessLocation} · {formatMoney(appointment.price, appointment.currency)}
          </p>
        </div>
        <Badge>{STATUS_LABELS[appointment.status]}</Badge>
      </div>

      {cancellable && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
          <p className="text-sm text-charcoal-soft">
            {canCancel
              ? `Free cancellation until ${formatDateTimeShort(deadline)}`
              : `Online cancellation closed ${appointment.cancellationPolicyHours} hours before your appointment. Please contact us to make changes.`}
          </p>
          {canCancel && (
            <Button variant="secondary" size="sm" onClick={() => setConfirming(true)}>
              Cancel booking
            </Button>
          )}
        </div>
      )}

      {canCancel && (
        <CancelDialog appointment={appointment} open={confirming} onOpenChange={setConfirming} />
      )}
    </Card>
  )
}

function CancelDialog({
  appointment,
  open,
  onOpenChange,
}: {
  appointment: Appointment
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [reason, setReason] = useState('')
  const cancelAppointment = useCancelAppointment()

  const handleCancel = async () => {
    try {
      await cancelAppointment.mutateAsync({ id: appointment.id, reason: reason.trim() })
      onOpenChange(false)
      toast.success('Your booking has been cancelled.')
    } catch (error) {
      toast.error(
        error instanceof ApiRequestError ? error.apiError.message : 'Something went wrong. Please try again.',
      )
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange} title="Cancel this booking?">
      <p className="text-sm text-charcoal-soft">
        {appointment.serviceName} on {formatDateLong(appointment.date)} at {formatTime(appointment.startTime)}. This
        can&rsquo;t be undone — you&rsquo;re welcome to book a new time afterwards.
      </p>
      <div className="mt-5">
        <Label htmlFor={`cancel-reason-${appointment.id}`}>Reason (optional)</Label>
        <Textarea
          id={`cancel-reason-${appointment.id}`}
          value={reason}
          maxLength={500}
          onChange={(event) => setReason(event.target.value)}
          placeholder="Let us know if there's anything we can do."
        />
      </div>
      <div className="mt-6 flex flex-wrap justify-end gap-3">
        <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={cancelAppointment.isPending}>
          Keep booking
        </Button>
        <Button onClick={handleCancel} disabled={cancelAppointment.isPending}>
          {cancelAppointment.isPending ? 'Cancelling…' : 'Cancel booking'}
        </Button>
      </div>
    </Dialog>
  )
}
