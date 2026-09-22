import { useSyncExternalStore } from 'react'
import { CheckCircle2, X, XCircle } from 'lucide-react'
import { dismiss, getSnapshot, subscribe } from '@/lib/toastStore'
import { cn } from '@/lib/utils'

export function Toaster() {
  const toasts = useSyncExternalStore(subscribe, getSnapshot)

  if (toasts.length === 0) return null

  return (
    <div
      className="fixed bottom-4 left-1/2 z-[100] flex w-[min(92vw,420px)] -translate-x-1/2 flex-col gap-2 sm:bottom-6 sm:left-auto sm:right-6 sm:translate-x-0"
      role="region"
      aria-label="Notifications"
    >
      {toasts.map((toastItem) => (
        <div
          key={toastItem.id}
          role="status"
          className={cn(
            'flex items-start gap-2 rounded-md border px-4 py-3 text-sm shadow-soft',
            toastItem.variant === 'success'
              ? 'border-success/30 bg-ivory text-charcoal'
              : 'border-danger/30 bg-ivory text-charcoal',
          )}
        >
          {toastItem.variant === 'success' ? (
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" aria-hidden="true" />
          ) : (
            <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-danger" aria-hidden="true" />
          )}
          <p className="flex-1">{toastItem.message}</p>
          <button
            type="button"
            onClick={() => dismiss(toastItem.id)}
            aria-label="Dismiss"
            className="text-charcoal-soft hover:text-charcoal"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      ))}
    </div>
  )
}
