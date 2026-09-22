import { CheckCircle2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { formatMoney } from '@/lib/money'
import { formatDateLong, formatTime } from '@/lib/time'
import type { Appointment } from '@/types/appointment'

export function ConfirmationStep({ appointment }: { appointment: Appointment }) {
  return (
    <div className="text-center">
      <CheckCircle2 className="mx-auto h-12 w-12 text-success" aria-hidden="true" />
      <h2 className="mt-4 font-display text-3xl text-charcoal">Appointment Confirmed</h2>
      <p className="mt-2 text-sm text-charcoal-soft">Booking reference: {appointment.id.slice(0, 8).toUpperCase()}</p>

      <dl className="mx-auto mt-8 max-w-sm divide-y divide-border rounded-md border border-border text-left">
        <Row label="Service" value={appointment.serviceName} />
        <Row label="Date" value={formatDateLong(appointment.date)} />
        <Row label="Time" value={formatTime(appointment.startTime)} />
        <Row label="Price" value={formatMoney(appointment.price, appointment.currency)} />
        <Row label="Status" value={appointment.status === 'CONFIRMED' ? 'Confirmed' : 'Pending confirmation'} />
      </dl>

      <p className="mx-auto mt-6 max-w-sm text-sm text-charcoal-soft">
        We look forward to seeing you. Please cancel at least {appointment.cancellationPolicyHours} hours in
        advance if your plans change.
      </p>

      <Button className="mt-8" asChild>
        <Link to="/">Return Home</Link>
      </Button>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 px-4 py-3 text-sm">
      <dt className="text-charcoal-soft">{label}</dt>
      <dd className="text-right font-medium text-charcoal">{value}</dd>
    </div>
  )
}
