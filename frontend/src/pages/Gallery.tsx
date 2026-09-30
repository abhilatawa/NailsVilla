import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { GalleryGrid } from '@/features/gallery/components/GalleryGrid'
import { ColourPalette } from '@/features/gallery/components/ColourPalette'
import { Lookbook } from '@/features/gallery/components/Lookbook'
import { portfolioPhotos } from '@/features/gallery/portfolio'
import { useGallery } from '@/features/gallery/useGallery'

export function GalleryPage() {
  // Photos published through the gallery API lead; the built-in portfolio follows. The
  // portfolio renders immediately so a slow or unavailable API never leaves the page empty.
  const { data: uploaded } = useGallery()
  const images = [...(uploaded ?? []), ...portfolioPhotos]

  return (
    <>
      {/* Header */}
      <section className="mx-auto max-w-6xl px-4 pb-10 pt-16 text-center sm:px-6">
        <p className="text-xs uppercase tracking-[0.3em] text-gold">Portfolio</p>
        <h1 className="mt-3 font-display text-4xl text-charcoal sm:text-5xl">Nail Art Gallery</h1>
        <p className="mx-auto mt-3 max-w-xl text-charcoal-soft">
          Real hands, real sets — from barely-there nudes to hand-painted statement nails. Tap any photo for a
          closer look.
        </p>
      </section>

      {/* Photo wall */}
      <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
        <GalleryGrid images={images} />
      </section>

      {/* Lookbook */}
      <section className="border-t border-border bg-cream py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mb-10 text-center">
            <p className="text-xs uppercase tracking-[0.3em] text-gold">Design Lookbook</p>
            <h2 className="mt-3 font-display text-3xl text-charcoal sm:text-4xl">Find your next set</h2>
            <p className="mx-auto mt-2 max-w-xl text-charcoal-soft">
              Leaf through our signature styles. Every design can be adjusted to your shape, length and colours.
            </p>
          </div>
          <Lookbook />
        </div>
      </section>

      {/* Colour palette */}
      <section className="border-t border-border py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mb-10 text-center">
            <p className="text-xs uppercase tracking-[0.3em] text-gold">Mini Booklet</p>
            <h2 className="mt-3 font-display text-3xl text-charcoal sm:text-4xl">Colour Palette</h2>
            <p className="mx-auto mt-2 max-w-xl text-charcoal-soft">
              Every colour family, light to deep. Pick a shade, mix a few, or use it as a starting point for your set.
            </p>
          </div>
          <ColourPalette />
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border bg-cream py-20 text-center">
        <div className="mx-auto max-w-2xl px-4 sm:px-6">
          <h2 className="font-display text-3xl text-charcoal">Saw something you love?</h2>
          <p className="mt-3 text-charcoal-soft">
            Bring a screenshot to your appointment, or tell us the look — we&rsquo;ll make it yours.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button size="lg" asChild>
              <Link to="/book">Book an Appointment</Link>
            </Button>
            <Button size="lg" variant="secondary" asChild>
              <Link to="/services">View Services</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  )
}
