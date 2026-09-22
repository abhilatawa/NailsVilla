import { cn } from '@/lib/utils'

interface TimeSlotOption {
  value: string
  label: string
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
          aria-pressed={selected === slot.value}
          className={cn(
            'rounded-md border px-3 py-2.5 text-sm transition-colors',
            selected === slot.value
              ? 'border-charcoal bg-charcoal text-ivory'
              : 'border-border text-charcoal hover:bg-cream',
          )}
        >
          {slot.label}
        </button>
      ))}
    </div>
  )
}
