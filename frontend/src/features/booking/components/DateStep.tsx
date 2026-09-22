import { Button } from '@/components/ui/Button'
import { DatePicker } from '@/components/ui/DatePicker'
import { useBusinessHours } from '@/features/settings/useBusinessHours'

interface DateStepProps {
  selectedDate: string | null
  onSelect: (isoDate: string) => void
  onBack: () => void
  onContinue: () => void
}

export function DateStep({ selectedDate, onSelect, onBack, onContinue }: DateStepProps) {
  const { data: businessHours } = useBusinessHours()

  const closedWeekdays = new Set(
    (businessHours ?? []).filter((day) => day.closed).map((day) => day.dayOfWeek % 7), // API: 1=Mon..7=Sun -> JS: 0=Sun..6=Sat
  )

  const tomorrow = new Date()
  tomorrow.setHours(0, 0, 0, 0)
  tomorrow.setDate(tomorrow.getDate() + 1)

  return (
    <div>
      <h2 className="font-display text-2xl text-charcoal">Choose a Date</h2>
      <div className="mt-6 flex justify-center">
        <DatePicker
          selected={selectedDate}
          onSelect={onSelect}
          minDate={tomorrow}
          isDateDisabled={(date) => closedWeekdays.has(date.getDay())}
        />
      </div>

      <div className="mt-8 flex gap-3">
        <Button variant="secondary" onClick={onBack}>
          Back
        </Button>
        <Button disabled={!selectedDate} onClick={onContinue}>
          Continue
        </Button>
      </div>
    </div>
  )
}
