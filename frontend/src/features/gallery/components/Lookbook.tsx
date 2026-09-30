import { type ReactNode, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'
import { type LookbookDesign, lookbookDesigns, portfolio } from '@/features/gallery/portfolio'

type Direction = 'forward' | 'back'

/** Spread 0 is the cover (contents + title page); spread n shows lookbookDesigns[n - 1]. */
const SPREAD_COUNT = lookbookDesigns.length + 1

export function Lookbook() {
  const [spread, setSpread] = useState(0)
  const [direction, setDirection] = useState<Direction>('forward')
  const touchStartX = useRef<number | null>(null)

  const goTo = (next: number) => {
    if (next < 0 || next >= SPREAD_COUNT || next === spread) return
    setDirection(next > spread ? 'forward' : 'back')
    setSpread(next)
  }

  const design = lookbookDesigns[spread - 1] ?? null

  return (
    <div
      onKeyDown={(event) => {
        if (event.key === 'ArrowRight') goTo(spread + 1)
        if (event.key === 'ArrowLeft') goTo(spread - 1)
      }}
      onTouchStart={(event) => (touchStartX.current = event.touches[0]?.clientX ?? null)}
      onTouchEnd={(event) => {
        const endX = event.changedTouches[0]?.clientX
        if (touchStartX.current === null || endX === undefined) return
        const deltaX = endX - touchStartX.current
        touchStartX.current = null
        if (Math.abs(deltaX) > 50) goTo(spread + (deltaX < 0 ? 1 : -1))
      }}
    >
      {/* The book */}
      <div className="relative mx-auto max-w-5xl rounded-lg border border-border bg-cream p-2 shadow-soft sm:p-3">
        <div
          key={spread}
          className="grid overflow-hidden rounded-md border border-border bg-ivory md:grid-cols-2 [perspective:2400px]"
        >
          <Page side="left" number={spread * 2} turning={direction === 'forward'}>
            {design ? <DesignText design={design} index={spread} /> : <Contents onSelect={goTo} />}
          </Page>
          <Page side="right" number={spread * 2 + 1} turning={direction === 'back'} bleed>
            {design ? <DesignPhoto design={design} /> : <Cover />}
          </Page>
        </div>
        {/* Spine */}
        <div
          className="pointer-events-none absolute inset-y-3 left-1/2 hidden w-px -translate-x-1/2 bg-border md:block"
          aria-hidden="true"
        />
      </div>

      {/* Controls */}
      <div className="mx-auto mt-6 flex max-w-5xl items-center justify-between gap-4">
        <Button variant="ghost" size="sm" onClick={() => goTo(spread - 1)} disabled={spread === 0}>
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          Previous
        </Button>
        <div className="flex flex-wrap items-center justify-center gap-2" role="group" aria-label="Lookbook pages">
          {Array.from({ length: SPREAD_COUNT }).map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => goTo(i)}
              aria-label={i === 0 ? 'Go to cover' : `Go to ${lookbookDesigns[i - 1]?.name}`}
              aria-current={i === spread ? 'page' : undefined}
              className={cn(
                'h-2 rounded-full transition-all',
                i === spread ? 'w-6 bg-rose' : 'w-2 bg-border hover:bg-gold',
              )}
            />
          ))}
        </div>
        <Button variant="ghost" size="sm" onClick={() => goTo(spread + 1)} disabled={spread === SPREAD_COUNT - 1}>
          Next
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </Button>
      </div>
    </div>
  )
}

interface PageProps {
  side: 'left' | 'right'
  number: number
  /** Whether this page is the one swinging into place on this turn. */
  turning: boolean
  /** Photo pages run to the edge; text pages get paper margins. */
  bleed?: boolean
  children: ReactNode
}

function Page({ side, number, turning, bleed = false, children }: PageProps) {
  return (
    <div
      className={cn(
        'relative flex min-h-[26rem] flex-col md:min-h-[36rem]',
        // On phones the book is a single column, so lead with the picture.
        side === 'right' && 'order-first md:order-none',
        !bleed && 'px-6 pb-12 pt-8 sm:px-10 sm:pt-10',
        // Soft shading toward the spine, like a real bound page.
        side === 'left'
          ? 'md:bg-gradient-to-l md:from-charcoal/[0.06] md:via-transparent md:via-[12%]'
          : 'md:bg-gradient-to-r md:from-charcoal/[0.06] md:via-transparent md:via-[12%]',
        turning ? 'animate-page-fade' : '',
        turning && side === 'left' && 'md:animate-page-turn-left',
        turning && side === 'right' && 'md:animate-page-turn-right',
      )}
    >
      {children}
      <span
        className={cn(
          'absolute bottom-4 font-display text-sm italic',
          bleed ? 'rounded-sm bg-ivory/80 px-2 text-charcoal' : 'text-charcoal-soft',
          side === 'left' ? 'left-6 sm:left-10' : 'right-6 sm:right-10',
        )}
        aria-hidden="true"
      >
        {number === 0 ? 'ii' : number === 1 ? 'i' : number}
      </span>
    </div>
  )
}

function Contents({ onSelect }: { onSelect: (spread: number) => void }) {
  return (
    <>
      <p className="text-xs uppercase tracking-[0.3em] text-gold">Inside this book</p>
      <h3 className="mt-3 font-display text-3xl text-charcoal">Contents</h3>
      <div className="mt-4 h-px w-16 bg-gold" />
      <ol className="mt-6 space-y-2.5">
        {lookbookDesigns.map((design, i) => (
          <li key={design.name}>
            <button
              type="button"
              onClick={() => onSelect(i + 1)}
              className="group flex w-full items-baseline gap-3 text-left"
            >
              <span className="font-display text-sm italic text-gold">{String(i + 1).padStart(2, '0')}</span>
              <span className="font-display text-lg text-charcoal group-hover:text-rose">{design.name}</span>
              <span className="mb-1 flex-1 border-b border-dotted border-border" aria-hidden="true" />
              <span className="font-display text-sm italic text-charcoal-soft">{(i + 1) * 2}</span>
            </button>
          </li>
        ))}
      </ol>
    </>
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
