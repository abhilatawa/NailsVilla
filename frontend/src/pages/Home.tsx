import { Link } from 'react-router-dom'
import { Gem, Heart, Sparkles, Star } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import { Skeleton } from '@/components/ui/Skeleton'
import { ServiceCard } from '@/features/services/components/ServiceCard'
import { useServices } from '@/features/services/useServices'
import { useReviews } from '@/features/reviews/useReviews'
import { dayName, summarizeHours, useBusinessHours } from '@/features/settings/useBusinessHours'
import { useSettings } from '@/features/settings/useSettings'

const whyNailsVilla = [
  {
    icon: Heart,
    title: 'Personalized experience',
    description: 'Every visit is tailored to you — your style, your schedule, your comfort.',
  },
  {
    icon: Sparkles,
    title: 'Attention to detail',
    description: 'Careful, unhurried work on every set, from prep to the final finish.',
  },
  {
    icon: Gem,
    title: 'Creative nail designs',
    description: 'Custom nail art built around what you want, not a fixed menu.',
  },
  {
    icon: Star,
    title: 'Quality-focused service',
    description: 'A calm, comfortable space and a focus on doing the work right.',
  },
]

export function HomePage() {
  const { data: settings } = useSettings()
  const { data: featuredServices, isLoading: servicesLoading } = useServices()
  const { data: reviews, isLoading: reviewsLoading } = useReviews()
  const { data: businessHours } = useBusinessHours()

  const featured = (featuredServices ?? []).filter((service) => service.featured).slice(0, 3)

  return (
    <>
      {/* Hero */}
      <section className="mx-auto max-w-6xl px-4 py-20 text-center sm:px-6 sm:py-28">
        <h1 className="font-display text-5xl leading-tight text-charcoal sm:text-6xl">
          Beautiful nails. <span className="text-rose">Personal service.</span>
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-lg text-charcoal-soft">
          Custom nail art in {settings?.city ?? 'Halifax'}, {settings?.province ?? 'Nova Scotia'}. Nail art
          starting from $60.
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Button size="lg" asChild>
            <Link to="/book">Book an Appointment</Link>
          </Button>
          <Button size="lg" variant="secondary" asChild>
            <Link to="/gallery">Explore Nail Art</Link>
          </Button>
        </div>
      </section>

      {/* Featured Services */}
      <section className="border-t border-border bg-cream py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mb-10 text-center">
            <h2 className="font-display text-3xl text-charcoal">Featured Services</h2>
            <p className="mt-2 text-charcoal-soft">A few of the ways we can take care of your nails.</p>
          </div>

          {servicesLoading ? (
            <div className="grid gap-6 sm:grid-cols-3">
              {[0, 1, 2].map((i) => (
                <Skeleton key={i} className="h-48" />
              ))}
            </div>
          ) : featured.length === 0 ? (
            <EmptyState title="Services coming soon" description="Check back shortly for our full menu." />
          ) : (
            <div className="grid gap-6 sm:grid-cols-3">
              {featured.map((service) => (
                <ServiceCard key={service.id} service={service} />
              ))}
            </div>
          )}

          <div className="mt-10 text-center">
            <Button variant="ghost" asChild>
              <Link to="/services">View All Services</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Gallery preview */}
      <section className="py-20">
        <div className="mx-auto max-w-6xl px-4 text-center sm:px-6">
          <h2 className="font-display text-3xl text-charcoal">Nail Art Gallery</h2>
          <p className="mx-auto mt-2 max-w-xl text-charcoal-soft">
            Our portfolio is being photographed and will be published here soon.
          </p>
          <Button className="mt-8" variant="secondary" asChild>
            <Link to="/gallery">View Gallery</Link>
          </Button>
        </div>
      </section>

      {/* Why Nails Villa */}
      <section className="border-t border-border bg-cream py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mb-10 text-center">
            <h2 className="font-display text-3xl text-charcoal">Why Nails Villa</h2>
          </div>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {whyNailsVilla.map(({ icon: Icon, title, description }) => (
              <div key={title} className="text-center">
                <Icon className="mx-auto h-7 w-7 text-rose" aria-hidden="true" />
                <h3 className="mt-4 font-display text-lg text-charcoal">{title}</h3>
                <p className="mt-2 text-sm text-charcoal-soft">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About teaser */}
      <section className="py-20">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <h2 className="font-display text-3xl text-charcoal">About Nails Villa</h2>
          <p className="mt-4 text-charcoal-soft">
            Nails Villa is a personal nail-art business based in {settings?.city ?? 'Halifax'},{' '}
            {settings?.province ?? 'Nova Scotia'}. Every appointment is one-on-one, with the time and care to get
            your nails exactly how you want them.
          </p>
          <Button className="mt-6" variant="ghost" asChild>
            <Link to="/about">Read Our Story</Link>
          </Button>
        </div>
      </section>

      {/* Reviews */}
      <section className="border-t border-border bg-cream py-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <div className="mb-10 text-center">
            <h2 className="font-display text-3xl text-charcoal">What Clients Say</h2>
          </div>
          {reviewsLoading ? (
            <Skeleton className="h-32" />
          ) : !reviews || reviews.length === 0 ? (
            <EmptyState
              icon={Star}
              title="No reviews yet"
              description="Be one of the first to leave a review after your appointment."
            />
          ) : (
            <div className="grid gap-6 sm:grid-cols-2">
              {reviews.slice(0, 4).map((review) => (
                <Card key={review.id} className="p-6">
                  <div className="flex gap-0.5" aria-label={`${review.rating} out of 5 stars`}>
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={i < review.rating ? 'h-4 w-4 fill-rose text-rose' : 'h-4 w-4 text-border'}
                        aria-hidden="true"
                      />
                    ))}
                  </div>
                  {review.comment && <p className="mt-3 text-sm text-charcoal-soft">{review.comment}</p>}
                  <p className="mt-3 text-sm font-medium text-charcoal">{review.customerFirstName}</p>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Business info */}
      <section className="py-20">
        <div className="mx-auto max-w-2xl px-4 text-center sm:px-6">
          <h2 className="font-display text-3xl text-charcoal">Visit Us</h2>
          <p className="mt-3 text-charcoal-soft">
            {settings?.city ?? 'Halifax'}, {settings?.province ?? 'Nova Scotia'}
          </p>
          <div className="mt-4 space-y-1 text-sm text-charcoal-soft">
            {businessHours ? (
              summarizeHours(businessHours).map((line) => <p key={line}>{line}</p>)
            ) : (
              <p>{dayName(1)} – {dayName(7)}: 8:00 AM – 7:00 PM</p>
            )}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="border-t border-border bg-charcoal py-20 text-center">
        <div className="mx-auto max-w-2xl px-4 sm:px-6">
          <h2 className="font-display text-3xl text-ivory">Your next set starts here.</h2>
          <Button className="mt-8" size="lg" variant="secondary" asChild>
            <Link to="/book" className="border-ivory text-ivory hover:bg-ivory hover:text-charcoal">
              Book Your Appointment
            </Link>
          </Button>
        </div>
      </section>
    </>
  )
}
