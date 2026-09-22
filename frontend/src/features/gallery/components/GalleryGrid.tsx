import { useState } from 'react'
import { Dialog } from '@/components/ui/Dialog'
import type { GalleryImage } from '@/types/gallery'

interface GalleryGridProps {
  images: GalleryImage[]
}

export function GalleryGrid({ images }: GalleryGridProps) {
  const [openImage, setOpenImage] = useState<GalleryImage | null>(null)

  return (
    <>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {images.map((image) => (
          <button
            key={image.id}
            type="button"
            onClick={() => setOpenImage(image)}
            className="group aspect-square overflow-hidden rounded-md border border-border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose"
          >
            <img
              src={image.url}
              alt={image.altText}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </button>
        ))}
      </div>

      <Dialog
        open={openImage !== null}
        onOpenChange={(open) => !open && setOpenImage(null)}
        title={openImage?.altText ?? 'Nail art'}
        className="w-[min(90vw,800px)] p-2"
      >
        {openImage && (
          <img src={openImage.url} alt={openImage.altText} className="w-full rounded-md object-contain" />
        )}
      </Dialog>
    </>
  )
}
