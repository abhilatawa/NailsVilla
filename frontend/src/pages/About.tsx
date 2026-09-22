import { useSettings } from '@/features/settings/useSettings'

export function AboutPage() {
  const { data: settings } = useSettings()
  const location = settings ? `${settings.city}, ${settings.province}` : 'Halifax, Nova Scotia'

  return (
    <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <h1 className="font-display text-4xl text-charcoal">About Nails Villa</h1>

      <div className="mt-8 space-y-8 text-charcoal-soft">
        <div>
          <h2 className="font-display text-2xl text-charcoal">Our Story</h2>
          <p className="mt-3">
            Nails Villa is a personal nail-art business based in {location}. It's a small, independent studio —
            every appointment is one-on-one, with the time and attention that a personal business can give.
            More of our story will be shared here soon.
          </p>
        </div>

        <div>
          <h2 className="font-display text-2xl text-charcoal">Our Philosophy</h2>
          <p className="mt-3">
            Nail art should feel personal. We take the time to understand what you're picturing, whether that's
            a subtle, minimal look or something bold and detailed, and build it around your nails and your
            schedule rather than a fixed menu of designs.
          </p>
        </div>

        <div>
          <h2 className="font-display text-2xl text-charcoal">Our Approach</h2>
          <p className="mt-3">
            Every service — gel, acrylic, extensions, or custom art — starts with a conversation about what you
            want and finishes with a set you're excited to show off. We work at an unhurried pace so the details
            are right.
          </p>
        </div>

        <div>
          <h2 className="font-display text-2xl text-charcoal">Care &amp; Hygiene</h2>
          <p className="mt-3">
            Clean tools and a clean workspace are non-negotiable for every appointment. Full details on our
            sanitation practices will be published here shortly.
          </p>
        </div>
      </div>
    </section>
  )
}
