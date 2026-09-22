import { type TextareaHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        'min-h-32 w-full rounded-md border border-border bg-ivory px-3 py-2 text-sm text-charcoal placeholder:text-charcoal-soft/70',
        'focus-visible:border-rose focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose/30',
        'disabled:cursor-not-allowed disabled:opacity-50',
        'aria-[invalid=true]:border-danger',
        className,
      )}
      {...props}
    />
  ),
)
Textarea.displayName = 'Textarea'
