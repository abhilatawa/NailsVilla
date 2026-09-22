import { Link, useParams } from 'react-router-dom'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { ErrorState } from '@/components/ui/ErrorState'
import { Skeleton } from '@/components/ui/Skeleton'
import { useService } from '@/features/services/useServices'
import { formatServicePrice } from '@/lib/money'

export function ServiceDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { data: service, isLoading, isError, refetch } = useService(id)

  if (isLoading) {
    return (
      <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="mt-4 h-24" />
      </section>
    )
  }

  if (isError || !service) {
    return (
      <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <ErrorState title="Service not found" description="This service may no longer be available." onRetry={() => refetch()} />
      </section>
    )
  }

  return (
    <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      {service.categoryName && <Badge>{service.categoryName}</Badge>}
      <h1 className="mt-3 font-display text-4xl text-charcoal">{service.name}</h1>
      {service.description && <p className="mt-4 text-charcoal-soft">{service.description}</p>}

      <dl className="mt-8 grid grid-cols-2 gap-6 border-y border-border py-6 sm:grid-cols-3">
        <div>
          <dt className="text-xs uppercase tracking-wide text-charcoal-soft">Price</dt>
          <dd className="mt-1 font-medium text-rose">{formatServicePrice(service)}</dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-charcoal-soft">Duration</dt>
          <dd className="mt-1 font-medium text-charcoal">{service.durationMinutes} minutes</dd>
        </div>
      </dl>

      <Button className="mt-8" size="lg" asChild>
        <Link to="/book" state={{ serviceId: service.id }}>
          Book This Service
        </Link>
      </Button>
    </section>
  )
}
