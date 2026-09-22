import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DatePickerProps {
  selected: string | null
  onSelect: (isoDate: string) => void
  isDateDisabled?: (date: Date) => boolean
  minDate?: Date
}

const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function toIsoDate(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function DatePicker({ selected, onSelect, isDateDisabled, minDate }: DatePickerProps) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const floor = minDate ?? today

  const [visibleMonth, setVisibleMonth] = useState(() => new Date(floor.getFullYear(), floor.getMonth(), 1))

  const firstOfMonth = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), 1)
  const daysInMonth = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, 0).getDate()
  const leadingBlanks = firstOfMonth.getDay()

  const cells: (Date | null)[] = [
    ...Array.from({ length: leadingBlanks }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), i + 1)),
  ]

  const canGoPrevious =
    visibleMonth.getFullYear() > floor.getFullYear() ||
    (visibleMonth.getFullYear() === floor.getFullYear() && visibleMonth.getMonth() > floor.getMonth())

  return (
    <div className="w-full max-w-sm">
      <div className="mb-4 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setVisibleMonth(new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() - 1, 1))}
          disabled={!canGoPrevious}
          aria-label="Previous month"
          className="rounded-md p-1.5 text-charcoal hover:bg-cream disabled:pointer-events-none disabled:opacity-30"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
        </button>
        <p className="font-display text-lg text-charcoal">
          {visibleMonth.toLocaleDateString('en-CA', { month: 'long', year: 'numeric' })}
        </p>
        <button
          type="button"
          onClick={() => setVisibleMonth(new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, 1))}
          aria-label="Next month"
          className="rounded-md p-1.5 text-charcoal hover:bg-cream"
        >
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-xs text-charcoal-soft">
        {WEEKDAY_LABELS.map((label) => (
          <div key={label} className="py-1">
            {label}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {cells.map((date, i) => {
          if (!date) return <div key={`blank-${i}`} />
          const iso = toIsoDate(date)
          const disabled = date < floor || (isDateDisabled?.(date) ?? false)
          const isSelected = selected === iso
          return (
            <button
              key={iso}
              type="button"
              disabled={disabled}
              onClick={() => onSelect(iso)}
              aria-pressed={isSelected}
              className={cn(
                'aspect-square rounded-md text-sm transition-colors',
                disabled && 'cursor-not-allowed text-charcoal-soft/30',
                !disabled && !isSelected && 'text-charcoal hover:bg-cream',
                isSelected && 'bg-charcoal text-ivory',
              )}
            >
              {date.getDate()}
            </button>
          )
        })}
      </div>
    </div>
  )
}
