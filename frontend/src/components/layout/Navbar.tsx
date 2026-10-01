import { useState } from 'react'
import { Menu, X } from 'lucide-react'
import { NavLink, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { useAuth, useLogout } from '@/features/auth/useAuth'
import { cn } from '@/lib/utils'

const navLinks = [
  { to: '/services', label: 'Services' },
  { to: '/gallery', label: 'Gallery' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
]

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const auth = useAuth()
  const logout = useLogout()
  const navigate = useNavigate()

  const accountLink =
    auth.status === 'authenticated'
      ? auth.user.role === 'ADMIN'
        ? { to: '/admin', label: 'Admin' }
        : { to: '/dashboard', label: 'My Bookings' }
      : auth.status === 'anonymous'
        ? { to: '/login', label: 'Log In' }
        : null

  const handleLogout = () => {
    setIsMenuOpen(false)
    logout.mutate(undefined, { onSettled: () => navigate('/') })
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-ivory/95 backdrop-blur">
      <div className="mx-auto flex h-20 max-w-6xl items-center justify-between px-4 sm:px-6">
        <NavLink to="/" className="font-display text-2xl tracking-wide text-charcoal">
          Nails Villa
        </NavLink>

        <nav className="hidden items-center gap-8 md:flex" aria-label="Primary">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                cn(
                  'text-sm tracking-wide text-charcoal-soft transition-colors hover:text-charcoal',
                  isActive && 'text-charcoal',
                )
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-5 md:flex">
          {accountLink && (
            <NavLink to={accountLink.to} className="text-sm tracking-wide text-charcoal-soft transition-colors hover:text-charcoal">
              {accountLink.label}
            </NavLink>
          )}
          {auth.status === 'authenticated' && (
            <button
              type="button"
              onClick={handleLogout}
              className="text-sm tracking-wide text-charcoal-soft transition-colors hover:text-charcoal"
            >
              Log Out
            </button>
          )}
          <Button size="sm" asChild>
            <NavLink to="/book">Book an Appointment</NavLink>
          </Button>
        </div>

        <button
          type="button"
          className="inline-flex items-center justify-center rounded-md p-2 text-charcoal md:hidden"
          aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={isMenuOpen}
          aria-controls="mobile-menu"
          onClick={() => setIsMenuOpen((open) => !open)}
        >
          {isMenuOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
        </button>
      </div>

      {isMenuOpen && (
        <nav id="mobile-menu" aria-label="Primary" className="border-t border-border md:hidden">
          <ul className="flex flex-col gap-1 px-4 py-4">
            {navLinks.map((link) => (
              <li key={link.to}>
                <NavLink
                  to={link.to}
                  onClick={() => setIsMenuOpen(false)}
                  className="block rounded-md px-2 py-3 text-charcoal hover:bg-cream"
                >
                  {link.label}
                </NavLink>
              </li>
            ))}
            {accountLink && (
              <li>
                <NavLink
                  to={accountLink.to}
                  onClick={() => setIsMenuOpen(false)}
                  className="block rounded-md px-2 py-3 text-charcoal hover:bg-cream"
                >
                  {accountLink.label}
                </NavLink>
              </li>
            )}
            {auth.status === 'authenticated' && (
              <li>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="block w-full rounded-md px-2 py-3 text-left text-charcoal hover:bg-cream"
                >
                  Log Out
                </button>
              </li>
            )}
            <li className="pt-2">
              <Button className="w-full" asChild>
                <NavLink to="/book" onClick={() => setIsMenuOpen(false)}>
                  Book an Appointment
                </NavLink>
              </Button>
            </li>
          </ul>
        </nav>
      )}
    </header>
  )
}
