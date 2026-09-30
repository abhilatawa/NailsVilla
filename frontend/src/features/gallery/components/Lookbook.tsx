import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { Booklet, BookletContents } from '@/features/gallery/components/Booklet'
import { type LookbookDesign, lookbookDesigns, portfolio } from '@/features/gallery/portfolio'

/** Spread 0 is the cover (contents + title page); spread n shows lookbookDesigns[n - 1]. */
export function Lookbook() {
  return (
    <Booklet
      navLabel="Lookbook pages"
      spreadLabels={['cover', ...lookbookDesigns.map((design) => design.name)]}
      renderSpread={(spread, goTo) => {
        const design = lookbookDesigns[spread - 1]
        return design
          ? { left: <DesignText design={design} index={spread} />, right: <DesignPhoto design={design} />, rightBleed: true }
          : { left: <BookletContents entries={lookbookDesigns} onSelect={goTo} />, right: <Cover />, rightBleed: true }
      }}
    />
  )
}

function Cover() {
  const cover = portfolio.nudeMinimalArt
  return (
    <div className="relative flex-1">
      <img
        src={cover.url}
        alt={cover.altText}
        width={cover.width}
        height={cover.height}
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-charcoal/75 via-charcoal/10 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 p-8 text-center sm:p-10">
        <p className="text-xs uppercase tracking-[0.3em] text-blush">Nails Villa · Volume I</p>
        <p className="mt-3 font-display text-5xl text-ivory">The Lookbook</p>
        <div className="mx-auto mt-4 h-px w-16 bg-gold" />
        <p className="mt-4 font-display text-lg italic text-ivory/90">
          {lookbookDesigns.length} signature styles, and endless ways to make them yours.
        </p>
      </div>
    </div>
  )
}

function DesignText({ design, index }: { design: LookbookDesign; index: number }) {
  return (
    <>
      <p className="text-xs uppercase tracking-[0.3em] text-gold">No. {String(index).padStart(2, '0')}</p>
      <h3 className="mt-3 font-display text-4xl leading-tight text-charcoal">{design.name}</h3>
      <p className="mt-1 font-display text-lg italic text-rose">{design.tagline}</p>
      <div className="mt-4 h-px w-16 bg-gold" />
      <p className="mt-5 text-sm leading-relaxed text-charcoal-soft">{design.description}</p>

      <dl className="mt-6 divide-y divide-border border-y border-border text-sm">
        {design.details.map(({ label, value }) => (
          <div key={label} className="flex justify-between gap-4 py-2">
            <dt className="text-charcoal-soft">{label}</dt>
            <dd className="text-right text-charcoal">{value}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-auto flex items-end justify-between gap-4 pt-6">
        <Button size="sm" asChild>
          <Link to="/book">Book this look</Link>
        </Button>
        {design.accentPhoto && (
          <img
            src={design.accentPhoto.url}
            alt={design.accentPhoto.altText}
            width={design.accentPhoto.width}
            height={design.accentPhoto.height}
            loading="lazy"
            className="h-24 w-20 rotate-3 rounded-sm border-4 border-ivory object-cover shadow-soft sm:h-28 sm:w-24"
          />
        )}
      </div>
    </>
  )
}

function DesignPhoto({ design }: { design: LookbookDesign }) {
  return (
    <div className="relative flex-1">
      <img
        src={design.photo.url}
        alt={design.photo.altText}
        width={design.photo.width}
        height={design.photo.height}
        className="absolute inset-0 h-full w-full object-cover"
      />
    </div>
  )
}
