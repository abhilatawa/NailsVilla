import { useState } from 'react'
import { Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorState } from '@/components/ui/ErrorState'
import { Skeleton } from '@/components/ui/Skeleton'
import { ServiceCard } from '@/features/services/components/ServiceCard'
import { useServiceCategories, useServices } from '@/features/services/useServices'
import { cn } from '@/lib/utils'

export function ServicesPage() {
  const [categoryId, setCategoryId] = useState<string | undefined>(undefined)
  const { data: categories } = useServiceCategories()
  const { data: services, isLoading, isError, refetch } = useServices(categoryId)

  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <div className="text-center">
        <h1 className="font-display text-4xl text-charcoal">Services</h1>
        <p className="mx-auto mt-3 max-w-xl text-charcoal-soft">
          All types of nail art and nail services. Nail art starting from $60.
        </p>
      </div>

      {categories && categories.length > 0 && (
        <div className="mt-10 flex flex-wrap justify-center gap-2" role="group" aria-label="Filter by category">
          <button
            type="button"
            onClick={() => setCategoryId(undefined)}
            className={cn(
              'rounded-md border px-4 py-2 text-sm',
              categoryId === undefined
                ? 'border-charcoal bg-charcoal text-ivory'
                : 'border-border text-charcoal-soft hover:bg-cream',
            )}
          >
            All
          </button>
          {categories.map((category) => (
            <button
              key={category.id}
              type="button"
              onClick={() => setCategoryId(category.id)}
              className={cn(
                'rounded-md border px-4 py-2 text-sm',
                categoryId === category.id
                  ? 'border-charcoal bg-charcoal text-ivory'
                  : 'border-border text-charcoal-soft hover:bg-cream',
              )}
            >
              {category.name}
            </button>
          ))}
        </div>
      )}

      <div className="mt-10">
        {isLoading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-56" />
            ))}
          </div>
        ) : isError ? (
          <ErrorState onRetry={() => refetch()} />
        ) : !services || services.length === 0 ? (
          <EmptyState
            icon={Sparkles}
            title="No services in this category yet"
            description="Check back soon, or explore another category."
          />
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
        )}
      </div>

      <div className="mt-16 text-center">
        <Button size="lg" asChild>
          <Link to="/book">Book an Appointment</Link>
        </Button>
      </div>
    </section>
  )
}
