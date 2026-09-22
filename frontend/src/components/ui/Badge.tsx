import { type HTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

export const Badge = forwardRef<HTMLSpanElement, HTMLAttributes<HTMLSpanElement>>(
  ({ className, ...props }, ref) => (
    <span
      ref={ref}
      className={cn(
        'inline-flex items-center rounded-sm border border-border bg-cream px-2.5 py-1 text-xs font-medium tracking-wide text-charcoal-soft',
        className,
      )}
      {...props}
    />
  ),
)
Badge.displayName = 'Badge'
