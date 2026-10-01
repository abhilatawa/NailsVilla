import { cn } from '@/lib/utils'

interface TimeSlotOption {
  value: string
  label: string
  /** Already booked — shown greyed out and can't be selected. */
  disabled?: boolean
}

interface TimeSlotGridProps {
  slots: TimeSlotOption[]
  selected: string | null
  onSelect: (value: string) => void
}

export function TimeSlotGrid({ slots, selected, onSelect }: TimeSlotGridProps) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3" role="group" aria-label="Available times">
      {slots.map((slot) => (
        <button
          key={slot.value}
          type="button"
          onClick={() => onSelect(slot.value)}
          disabled={slot.disabled}
          aria-pressed={selected === slot.value}
          aria-label={slot.disabled ? `${slot.label}, already booked` : undefined}
          className={cn(
            'rounded-md border px-3 py-2.5 text-sm transition-colors',
            slot.disabled
              ? 'cursor-not-allowed border-border bg-cream text-charcoal-soft/50 line-through'
              : selected === slot.value
                ? 'border-charcoal bg-charcoal text-ivory'
                : 'border-border text-charcoal hover:bg-cream',
          )}
        >
          {slot.label}
          {slot.disabled && <span className="sr-only"> (booked)</span>}
        </button>
      ))}
    </div>
  )
}
