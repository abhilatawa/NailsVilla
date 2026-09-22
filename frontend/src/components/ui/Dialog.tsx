import { type ReactNode } from 'react'
import * as RadixDialog from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  children: ReactNode
  className?: string
}

export function Dialog({ open, onOpenChange, title, children, className }: DialogProps) {
  return (
    <RadixDialog.Root open={open} onOpenChange={onOpenChange}>
      <RadixDialog.Portal>
        <RadixDialog.Overlay className="fixed inset-0 z-50 bg-charcoal/60" />
        <RadixDialog.Content
          className={cn(
            'fixed left-1/2 top-1/2 z-50 max-h-[90vh] w-[min(90vw,640px)] -translate-x-1/2 -translate-y-1/2',
            'overflow-auto rounded-md bg-ivory p-6 shadow-soft focus:outline-none',
            className,
          )}
        >
          <div className="mb-4 flex items-center justify-between gap-4">
            <RadixDialog.Title className="font-display text-xl text-charcoal">{title}</RadixDialog.Title>
            <RadixDialog.Close
              className="rounded-md p-1 text-charcoal-soft hover:bg-cream hover:text-charcoal"
              aria-label="Close"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </RadixDialog.Close>
          </div>
          {children}
        </RadixDialog.Content>
      </RadixDialog.Portal>
    </RadixDialog.Root>
  )
}
