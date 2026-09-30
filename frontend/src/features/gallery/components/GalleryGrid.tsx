import { useEffect, useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Dialog } from '@/components/ui/Dialog'
import { cn } from '@/lib/utils'
import type { GalleryImage } from '@/types/gallery'

type GridImage = GalleryImage & { width?: number; height?: number }

interface GalleryGridProps {
  images: GridImage[]
}

const ALL = 'All'

export function GalleryGrid({ images }: GalleryGridProps) {
  const [category, setCategory] = useState(ALL)
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const categories = useMemo(
    () => [ALL, ...new Set(images.map((image) => image.category).filter((c): c is string => !!c))],
    [images],
  )
  const visible = category === ALL ? images : images.filter((image) => image.category === category)
  const openImage = openIndex !== null ? visible[openIndex] : null

  const step = (delta: number) =>
    setOpenIndex((index) => (index === null ? null : (index + delta + visible.length) % visible.length))

  useEffect(() => {
    if (openIndex === null) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowRight') step(1)
      if (event.key === 'ArrowLeft') step(-1)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  })

  return (
    <>
      {categories.length > 2 && (
        <div className="flex flex-wrap justify-center gap-2" role="group" aria-label="Filter by style">
          {categories.map((name) => (
            <button
              key={name}
              type="button"
              aria-pressed={category === name}
              onClick={() => setCategory(name)}
              className={cn(
                'rounded-md border px-4 py-2 text-sm',
                category === name
                  ? 'border-charcoal bg-charcoal text-ivory'
                  : 'border-border text-charcoal-soft hover:bg-cream',
              )}
            >
              {name}
            </button>
          ))}
        </div>
      )}

      <div className="mt-10 columns-2 gap-3 sm:columns-3 sm:gap-4 lg:columns-4">
        {visible.map((image, index) => (
          <button
            key={image.id}
            type="button"
            onClick={() => setOpenIndex(index)}
            className="group relative mb-3 block w-full break-inside-avoid overflow-hidden rounded-md border border-border bg-cream sm:mb-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose"
          >
            <img
              src={image.url}
              alt={image.altText}
              width={image.width}
              height={image.height}
              loading="lazy"
              className="h-auto w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-charcoal/70 to-transparent px-3 pb-3 pt-10 text-left opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100">
              <span className="block font-display text-lg leading-tight text-ivory">{image.altText}</span>
              {image.category && (
                <span className="mt-0.5 block text-xs uppercase tracking-widest text-blush">{image.category}</span>
              )}
            </span>
          </button>
        ))}
      </div>

      <Dialog
        open={openImage !== null}
        onOpenChange={(open) => !open && setOpenIndex(null)}
        title={openImage?.altText ?? 'Nail art'}
        className="w-[min(92vw,720px)] p-4 sm:p-6"
      >
        {openImage && openIndex !== null && (
          <div>
            <div className="relative">
              <img
                src={openImage.url}
                alt={openImage.altText}
                className="max-h-[70vh] w-full rounded-md bg-cream object-contain"
              />
              {visible.length > 1 && (
                <>
                  <LightboxArrow direction="previous" onClick={() => step(-1)} />
                  <LightboxArrow direction="next" onClick={() => step(1)} />
                </>
              )}
            </div>
            <div className="mt-3 flex items-center justify-between text-sm text-charcoal-soft">
              <span className="uppercase tracking-widest text-xs">{openImage.category}</span>
              <span className="font-display italic">
                {openIndex + 1} / {visible.length}
              </span>
            </div>
          </div>
        )}
      </Dialog>
    </>
  )
}

function LightboxArrow({ direction, onClick }: { direction: 'previous' | 'next'; onClick: () => void }) {
  const Icon = direction === 'previous' ? ChevronLeft : ChevronRight
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={direction === 'previous' ? 'Previous photo' : 'Next photo'}
      className={cn(
        'absolute top-1/2 -translate-y-1/2 rounded-full bg-ivory/90 p-2 text-charcoal shadow-soft hover:bg-ivory',
        direction === 'previous' ? 'left-2' : 'right-2',
      )}
    >
      <Icon className="h-5 w-5" aria-hidden="true" />
    </button>
  )
}
