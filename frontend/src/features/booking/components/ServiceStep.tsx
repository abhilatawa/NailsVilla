import { Button } from '@/components/ui/Button'
import { ErrorState } from '@/components/ui/ErrorState'
import { Skeleton } from '@/components/ui/Skeleton'
import { useServices } from '@/features/services/useServices'
import { formatServicePrice } from '@/lib/money'
import { cn } from '@/lib/utils'
import type { Service } from '@/types/service'

interface ServiceStepProps {
  selectedServiceId: string | null
  onSelect: (service: Service) => void
  onContinue: () => void
}

export function ServiceStep({ selectedServiceId, onSelect, onContinue }: ServiceStepProps) {
  const { data: services, isLoading, isError, refetch } = useServices()

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} className="h-20" />
        ))}
      </div>
    )
  }

  if (isError) {
    return <ErrorState onRetry={() => refetch()} />
  }

  return (
    <div>
      <h2 className="font-display text-2xl text-charcoal">Choose a Service</h2>
      <div className="mt-6 space-y-3" role="radiogroup" aria-label="Service">
        {(services ?? []).map((service) => (
          <button
            key={service.id}
            type="button"
            role="radio"
            aria-checked={selectedServiceId === service.id}
            onClick={() => onSelect(service)}
            className={cn(
              'flex w-full items-center justify-between gap-4 rounded-md border p-4 text-left transition-colors',
              selectedServiceId === service.id ? 'border-charcoal bg-cream' : 'border-border hover:bg-cream/60',
            )}
          >
            <div>
              <p className="font-medium text-charcoal">{service.name}</p>
              {service.shortDescription && <p className="mt-0.5 text-sm text-charcoal-soft">{service.shortDescription}</p>}
              <p className="mt-1 text-xs text-charcoal-soft">{service.durationMinutes} min</p>
            </div>
            <p className="whitespace-nowrap text-sm font-medium text-rose">{formatServicePrice(service)}</p>
          </button>
        ))}
      </div>

      <Button className="mt-8 w-full sm:w-auto" size="lg" disabled={!selectedServiceId} onClick={onContinue}>
        Continue
      </Button>
    </div>
  )
}
