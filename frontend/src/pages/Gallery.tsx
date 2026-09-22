import { Images } from 'lucide-react'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorState } from '@/components/ui/ErrorState'
import { Skeleton } from '@/components/ui/Skeleton'
import { GalleryGrid } from '@/features/gallery/components/GalleryGrid'
import { useGallery } from '@/features/gallery/useGallery'

export function GalleryPage() {
  const { data: images, isLoading, isError, refetch } = useGallery()

  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <div className="text-center">
        <h1 className="font-display text-4xl text-charcoal">Nail Art Gallery</h1>
        <p className="mx-auto mt-3 max-w-xl text-charcoal-soft">
          A look at custom nail art, one design at a time.
        </p>
      </div>

      <div className="mt-10">
        {isLoading ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="aspect-square" />
            ))}
          </div>
        ) : isError ? (
          <ErrorState onRetry={() => refetch()} />
        ) : !images || images.length === 0 ? (
          <EmptyState
            icon={Images}
            title="Our gallery is being curated"
            description="Real photos of our nail art are on the way — check back soon."
          />
        ) : (
          <GalleryGrid images={images} />
        )}
      </div>
    </section>
  )
}
