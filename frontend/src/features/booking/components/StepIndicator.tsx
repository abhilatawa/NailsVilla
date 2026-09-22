import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

const STEPS = ['Service', 'Date', 'Time', 'Details', 'Review'] as const

interface StepIndicatorProps {
  currentIndex: number
}

export function StepIndicator({ currentIndex }: StepIndicatorProps) {
  return (
    <ol className="mx-auto flex max-w-2xl items-center justify-center" aria-label="Booking progress">
      {STEPS.map((label, index) => {
        const state = index < currentIndex ? 'done' : index === currentIndex ? 'current' : 'upcoming'
        return (
          <li key={label} className="flex flex-1 items-center last:flex-initial">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-full border text-xs font-medium',
                  state === 'done' && 'border-charcoal bg-charcoal text-ivory',
                  state === 'current' && 'border-charcoal text-charcoal',
                  state === 'upcoming' && 'border-border text-charcoal-soft',
                )}
                aria-current={state === 'current' ? 'step' : undefined}
              >
                {state === 'done' ? <Check className="h-4 w-4" aria-hidden="true" /> : index + 1}
              </div>
              <span
                className={cn(
                  'hidden text-xs sm:block',
                  state === 'upcoming' ? 'text-charcoal-soft' : 'text-charcoal',
                )}
              >
                {label}
              </span>
            </div>
            {index < STEPS.length - 1 && (
              <div className={cn('mx-2 h-px flex-1', state === 'done' ? 'bg-charcoal' : 'bg-border')} />
            )}
          </li>
        )
      })}
    </ol>
  )
}
