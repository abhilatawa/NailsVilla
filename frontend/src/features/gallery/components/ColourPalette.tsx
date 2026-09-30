import { Booklet, BookletContents } from '@/features/gallery/components/Booklet'
import { type ColourFamily, type Shade, colourFamilies } from '@/features/gallery/colourPalette'
import { cn } from '@/lib/utils'

const shadeCount = colourFamilies.reduce((total, family) => total + family.shades.length, 0)

/** A mid-tone from each family, used for the cover fan and contents markers. */
function signatureShade(family: ColourFamily): Shade {
  return family.shades[Math.floor(family.shades.length / 2)] ?? family.shades[0]!
}

/** Spread 0 is the cover (contents + title page); spread n shows colourFamilies[n - 1]. */
export function ColourPalette() {
  return (
    <Booklet
      size="mini"
      navLabel="Colour palette pages"
      spreadLabels={['cover', ...colourFamilies.map((family) => family.name)]}
      renderSpread={(spread, goTo) => {
        const family = colourFamilies[spread - 1]
        return family
          ? { left: <FamilyText family={family} index={spread} />, right: <FamilySwatches family={family} /> }
          : {
              left: (
                <BookletContents
                  onSelect={goTo}
                  entries={colourFamilies.map((f) => ({
                    name: f.name,
                    marker: (
                      <span
                        className="h-3 w-3 shrink-0 self-center rounded-full border border-charcoal/10"
                        style={{ backgroundColor: signatureShade(f).hex }}
                        aria-hidden="true"
                      />
                    ),
                  }))}
                />
              ),
              right: <Cover />,
            }
      }}
    />
  )
}

function Cover() {
  const fan = colourFamilies.map(signatureShade)
  return (
    <div className="flex flex-1 flex-col items-center justify-center text-center">
      {/* A fan of polish swatches, like a salon colour ring. */}
      <div className="relative h-36 w-64" aria-hidden="true">
        {fan.map((shade, i) => {
          const angle = -60 + (120 / (fan.length - 1)) * i
          return (
            <span
              key={shade.name}
              className="absolute bottom-0 left-1/2 h-32 w-6 origin-bottom rounded-t-full border border-charcoal/10 shadow-soft"
              style={{ backgroundColor: shade.hex, transform: `translateX(-50%) rotate(${angle}deg)` }}
            />
          )
        })}
        <span className="absolute bottom-0 left-1/2 h-5 w-5 -translate-x-1/2 translate-y-1/2 rounded-full border-2 border-gold bg-ivory" />
      </div>
      <p className="mt-10 text-xs uppercase tracking-[0.3em] text-gold">Nails Villa</p>
      <p className="mt-2 font-display text-4xl text-charcoal sm:text-5xl">Colour Palette</p>
      <div className="mx-auto mt-4 h-px w-16 bg-gold" />
      <p className="mt-4 font-display text-lg italic text-charcoal-soft">
        {colourFamilies.length} colour families · {shadeCount} shades
      </p>
    </div>
  )
}

function FamilyText({ family, index }: { family: ColourFamily; index: number }) {
  return (
    <>
      <p className="text-xs uppercase tracking-[0.3em] text-gold">No. {String(index).padStart(2, '0')}</p>
      <h3 className="mt-3 font-display text-4xl leading-tight text-charcoal">{family.name}</h3>
      <p className="mt-1 font-display text-lg italic text-rose">{family.tagline}</p>
      <div className="mt-4 h-px w-16 bg-gold" />
      <p className="mt-5 text-sm leading-relaxed text-charcoal-soft">{family.description}</p>

      {/* The whole family as one light-to-deep strip. */}
      <div className="mt-6 flex h-3 overflow-hidden rounded-full border border-charcoal/10" aria-hidden="true">
        {family.shades.map((shade) => (
          <span key={shade.name} className="flex-1" style={{ backgroundColor: shade.hex }} />
        ))}
      </div>
      <p className="mt-3 text-xs uppercase tracking-widest text-charcoal-soft">
        {family.shades.length} shades · light to deep
      </p>
    </>
  )
}

function FamilySwatches({ family }: { family: ColourFamily }) {
  return (
    <ul className="grid flex-1 grid-cols-3 content-center gap-x-4 gap-y-6" aria-label={`${family.name} shades`}>
      {family.shades.map((shade) => (
        <li key={shade.name} className="flex flex-col items-center text-center">
          <NailSwatch shade={shade} metallic={family.finish === 'metallic'} />
          <span className="mt-2 font-display text-base leading-tight text-charcoal">{shade.name}</span>
        </li>
      ))}
    </ul>
  )
}

/** A polish swatch shaped like an almond nail, with a gloss highlight. */
function NailSwatch({ shade, metallic }: { shade: Shade; metallic: boolean }) {
  return (
    <span
      className="relative block h-[4.5rem] w-12 overflow-hidden border border-charcoal/10 shadow-soft [border-radius:50%_50%_42%_42%/62%_62%_38%_38%]"
      style={{ backgroundColor: shade.hex }}
      aria-hidden="true"
    >
      {metallic && (
        <span className="absolute inset-0 bg-gradient-to-br from-ivory/70 via-transparent to-charcoal/25" />
      )}
      <span
        className={cn(
          'absolute left-[22%] top-[12%] h-[45%] w-[16%] rounded-full bg-gradient-to-b from-ivory/80 to-transparent',
          metallic && 'from-ivory',
        )}
      />
    </span>
  )
}
