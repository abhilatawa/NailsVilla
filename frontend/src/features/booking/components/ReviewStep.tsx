import { Button } from '@/components/ui/Button'
import { useSettings } from '@/features/settings/useSettings'
import { formatMoney } from '@/lib/money'
import { formatDateLong, formatTime } from '@/lib/time'
import type { Service } from '@/types/service'
import type { BookingDetails } from './DetailsStep'

interface ReviewStepProps {
  service: Service
  date: string
  startTime: string
  details: BookingDetails
  isSubmitting: boolean
  submitError: string | null
  onBack: () => void
  onConfirm: () => void
}

export function ReviewStep({ service, date, startTime, details, isSubmitting, submitError, onBack, onConfirm }: ReviewStepProps) {
  const { data: settings } = useSettings()
  const price = service.price ?? service.startingPrice ?? service.minPrice ?? 0

  return (
    <div>
      <h2 className="font-display text-2xl text-charcoal">Review Your Booking</h2>

      <dl className="mt-6 divide-y divide-border rounded-md border border-border">
        <Row label="Service" value={service.name} />
        <Row label="Date" value={formatDateLong(date)} />
        <Row label="Time" value={formatTime(startTime)} />
        <Row label="Duration" value={`${service.durationMinutes} minutes`} />
        <Row label="Price" value={formatMoney(price, service.currency)} />
        <Row label="Location" value={settings ? `${settings.city}, ${settings.province}` : 'Halifax, Nova Scotia'} />
        <Row label="Name" value={`${details.firstName} ${details.lastName}`} />
        <Row label="Email" value={details.email} />
        <Row label="Phone" value={details.phone} />
        {details.notes && <Row label="Notes" value={details.notes} />}
      </dl>

      <p className="mt-4 text-sm text-charcoal-soft">
        Cancellation policy: please cancel at least {settings?.cancellationWindowHours ?? 24} hours before your
        appointment.
      </p>

      {submitError && (
        <p role="alert" className="mt-4 text-sm text-danger">
          {submitError}
        </p>
      )}

      <div className="mt-8 flex gap-3">
        <Button variant="secondary" onClick={onBack} disabled={isSubmitting}>
          Back
        </Button>
        <Button onClick={onConfirm} disabled={isSubmitting}>
          {isSubmitting ? 'Confirming…' : 'Confirm Booking'}
        </Button>
      </div>
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
