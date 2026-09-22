import { Button } from '@/components/ui/Button'
import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <section className="mx-auto max-w-xl px-4 py-24 text-center sm:px-6">
      <h1 className="font-display text-4xl text-charcoal">Page not found</h1>
      <p className="mt-4 text-charcoal-soft">
        The page you're looking for doesn't exist or may have moved.
      </p>
      <Button className="mt-8" asChild>
        <Link to="/">Return home</Link>
      </Button>
    </section>
  )
}
