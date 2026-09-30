import { type ReactNode, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'

type Direction = 'forward' | 'back'

export interface BookletSpread {
  left: ReactNode
  right: ReactNode
  /** Pages that run to the edge (photos, cover art) instead of sitting inside paper margins. */
  leftBleed?: boolean
  rightBleed?: boolean
}

interface BookletProps {
  /** Accessible name for each spread, used by the page dots — the first is the cover. */
  spreadLabels: string[]
  renderSpread: (spread: number, goTo: (spread: number) => void) => BookletSpread
  /** `mini` is a smaller, pocket-sized book. */
  size?: 'default' | 'mini'
  navLabel: string
}

/**
 * A two-page book with page turns, keyboard arrows and swipe. On phones the two pages
 * stack into one column, with the right-hand page (usually the picture) first.
 */
export function Booklet({ spreadLabels, renderSpread, size = 'default', navLabel }: BookletProps) {
  const [spread, setSpread] = useState(0)
  const [direction, setDirection] = useState<Direction>('forward')
  const touchStartX = useRef<number | null>(null)
  const spreadCount = spreadLabels.length

  const goTo = (next: number) => {
    if (next < 0 || next >= spreadCount || next === spread) return
    setDirection(next > spread ? 'forward' : 'back')
    setSpread(next)
  }

  const { left, right, leftBleed, rightBleed } = renderSpread(spread, goTo)
  const width = size === 'mini' ? 'max-w-3xl' : 'max-w-5xl'

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
      <div className={cn('relative mx-auto rounded-lg border border-border bg-cream p-2 shadow-soft sm:p-3', width)}>
        <div
          key={spread}
          className="grid overflow-hidden rounded-md border border-border bg-ivory md:grid-cols-2 [perspective:2400px]"
        >
          <Page side="left" size={size} number={spread * 2} turning={direction === 'forward'} bleed={leftBleed}>
            {left}
          </Page>
          <Page side="right" size={size} number={spread * 2 + 1} turning={direction === 'back'} bleed={rightBleed}>
            {right}
          </Page>
        </div>
        {/* Spine */}
        <div
          className="pointer-events-none absolute inset-y-3 left-1/2 hidden w-px -translate-x-1/2 bg-border md:block"
          aria-hidden="true"
        />
      </div>

      {/* Controls */}
      <div className={cn('mx-auto mt-6 flex items-center justify-between gap-4', width)}>
        <Button variant="ghost" size="sm" onClick={() => goTo(spread - 1)} disabled={spread === 0}>
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          Previous
        </Button>
        <div className="flex flex-wrap items-center justify-center gap-2" role="group" aria-label={navLabel}>
          {spreadLabels.map((label, i) => (
            <button
              key={label}
              type="button"
              onClick={() => goTo(i)}
              aria-label={`Go to ${label}`}
              aria-current={i === spread ? 'page' : undefined}
              className={cn(
                'h-2 rounded-full transition-all',
                i === spread ? 'w-6 bg-rose' : 'w-2 bg-border hover:bg-gold',
              )}
            />
          ))}
        </div>
        <Button variant="ghost" size="sm" onClick={() => goTo(spread + 1)} disabled={spread === spreadCount - 1}>
          Next
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </Button>
      </div>
    </div>
  )
}

interface PageProps {
  side: 'left' | 'right'
  size: 'default' | 'mini'
  number: number
  /** Whether this page is the one swinging into place on this turn. */
  turning: boolean
  bleed?: boolean
  children: ReactNode
}

function Page({ side, size, number, turning, bleed = false, children }: PageProps) {
  return (
    <div
      className={cn(
        'relative flex flex-col',
        size === 'mini' ? 'min-h-[22rem] md:min-h-[28rem]' : 'min-h-[26rem] md:min-h-[36rem]',
        // On phones the book is a single column, so lead with the picture.
        side === 'right' && 'order-first md:order-none',
        !bleed && (size === 'mini' ? 'px-6 pb-12 pt-7 sm:px-8' : 'px-6 pb-12 pt-8 sm:px-10 sm:pt-10'),
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
          side === 'left' ? 'left-6 sm:left-8' : 'right-6 sm:right-8',
        )}
        aria-hidden="true"
      >
        {number === 0 ? 'ii' : number === 1 ? 'i' : number}
      </span>
    </div>
  )
}

interface BookletContentsProps {
  entries: { name: string; marker?: ReactNode }[]
  onSelect: (spread: number) => void
}

/** A contents page whose entries open spreads 1..n; page numbers match the left-hand pages. */
export function BookletContents({ entries, onSelect }: BookletContentsProps) {
  return (
    <>
      <p className="text-xs uppercase tracking-[0.3em] text-gold">Inside this book</p>
      <h3 className="mt-3 font-display text-3xl text-charcoal">Contents</h3>
      <div className="mt-4 h-px w-16 bg-gold" />
      <ol className="mt-6 space-y-2">
        {entries.map(({ name, marker }, i) => (
          <li key={name}>
            <button
              type="button"
              onClick={() => onSelect(i + 1)}
              className="group flex w-full items-baseline gap-3 text-left"
            >
              {marker ?? (
                <span className="font-display text-sm italic text-gold">{String(i + 1).padStart(2, '0')}</span>
              )}
              <span className="font-display text-lg text-charcoal group-hover:text-rose">{name}</span>
              <span className="mb-1 flex-1 border-b border-dotted border-border" aria-hidden="true" />
              <span className="font-display text-sm italic text-charcoal-soft">{(i + 1) * 2}</span>
            </button>
          </li>
        ))}
      </ol>
    </>
  )
}
