import { Link } from 'react-router-dom'
import { useSettings } from '@/features/settings/useSettings'

export function Footer() {
  const year = new Date().getFullYear()
  const { data: settings } = useSettings()

  return (
    <footer className="border-t border-border bg-cream">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-3">
        <div>
          <p className="font-display text-xl text-charcoal">
            {settings?.salonName ?? 'Nails Villa'}
          </p>
          <p className="mt-2 text-sm text-charcoal-soft">
            {settings ? `${settings.city}, ${settings.province}` : 'Halifax, Nova Scotia'}
          </p>
          <p className="text-sm text-charcoal-soft">8:00 AM – 7:00 PM</p>
        </div>

        <nav aria-label="Footer" className="flex flex-col gap-2 text-sm">
          <Link to="/services" className="text-charcoal-soft hover:text-charcoal">
            Services
          </Link>
          <Link to="/gallery" className="text-charcoal-soft hover:text-charcoal">
            Gallery
          </Link>
          <Link to="/about" className="text-charcoal-soft hover:text-charcoal">
            About
          </Link>
          <Link to="/contact" className="text-charcoal-soft hover:text-charcoal">
            Contact
          </Link>
        </nav>

        <div className="text-sm text-charcoal-soft">
          <p>Address, phone, and social links coming soon.</p>
        </div>
      </div>

      <div className="border-t border-border px-4 py-4 text-center text-xs text-charcoal-soft sm:px-6">
        © {year} Nails Villa. All rights reserved.
      </div>
    </footer>
  )
}
