import { CalendarDays } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorState } from '@/components/ui/ErrorState'
import { Skeleton } from '@/components/ui/Skeleton'
import { useMyAppointments } from '@/features/appointments/useMyAppointments'
import { useAuth } from '@/features/auth/useAuth'
import { formatMoney } from '@/lib/money'
import { formatDateLong, formatTime, todayIso } from '@/lib/time'
import type { Appointment, AppointmentStatus } from '@/types/appointment'

const STATUS_LABELS: Record<AppointmentStatus, string> = {
  PENDING: 'Awaiting confirmation',
  CONFIRMED: 'Confirmed',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
  NO_SHOW: 'Missed',
}

export function DashboardPage() {
  const auth = useAuth()
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
                upcoming.map((appointment) => <AppointmentCard key={appointment.id} appointment={appointment} />)
              )}
            </div>

            {past.length > 0 && (
              <>
                <h2 className="mt-12 font-display text-2xl text-charcoal">Past &amp; cancelled</h2>
                <div className="mt-4 space-y-4">
                  {past.map((appointment) => (
                    <AppointmentCard key={appointment.id} appointment={appointment} muted />
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

function AppointmentCard({ appointment, muted = false }: { appointment: Appointment; muted?: boolean }) {
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
    </Card>
  )
}
