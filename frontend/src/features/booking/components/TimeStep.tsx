import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorState } from '@/components/ui/ErrorState'
import { Skeleton } from '@/components/ui/Skeleton'
import { TimeSlotGrid } from '@/components/ui/TimeSlotGrid'
import { useAvailability } from '@/features/booking/useAvailability'
import { formatDateLong, formatTime } from '@/lib/time'

interface TimeStepProps {
  serviceId: string
  date: string
  selectedStartTime: string | null
  onSelect: (startTime: string) => void
  onBack: () => void
  onContinue: () => void
}

export function TimeStep({ serviceId, date, selectedStartTime, onSelect, onBack, onContinue }: TimeStepProps) {
  const { data, isLoading, isError, refetch } = useAvailability(serviceId, date)
  // A selected time can be taken by someone else while this page is open.
  const selectionIsAvailable =
    selectedStartTime !== null && Boolean(data?.slots.some((slot) => slot.start === selectedStartTime && slot.available))

  return (
    <div>
      <h2 className="font-display text-2xl text-charcoal">Choose a Time</h2>
      <p className="mt-1 text-sm text-charcoal-soft">{formatDateLong(date)}</p>

      <div className="mt-6">
        {isLoading ? (
          <div className="grid grid-cols-3 gap-2">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-11" />
            ))}
          </div>
        ) : isError ? (
          <ErrorState onRetry={() => refetch()} />
        ) : !data || data.slots.length === 0 ? (
          <EmptyState title="No times available" description="Please choose a different date." />
        ) : (
          <>
            {data.slots.every((slot) => !slot.available) ? (
              <p className="mb-4 text-sm text-charcoal-soft">
                This day is fully booked. Please choose a different date.
              </p>
            ) : (
              data.slots.some((slot) => !slot.available) && (
                <p className="mb-4 text-sm text-charcoal-soft">Greyed-out times are already booked.</p>
              )
            )}
            <TimeSlotGrid
              slots={data.slots.map((slot) => ({
                value: slot.start,
                label: formatTime(slot.start),
                disabled: !slot.available,
              }))}
              selected={selectedStartTime}
              onSelect={onSelect}
            />
          </>
        )}
      </div>

      <div className="mt-8 flex gap-3">
        <Button variant="secondary" onClick={onBack}>
          Back
        </Button>
        <Button disabled={!selectionIsAvailable} onClick={onContinue}>
          Continue
        </Button>
      </div>
    </div>
  )
}
