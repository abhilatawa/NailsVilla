import { Link, NavLink, Outlet } from 'react-router-dom'
import { useAuth, useLogout } from '@/features/auth/useAuth'
import { cn } from '@/lib/utils'

/**
 * Deliberately plain: the admin panel is a functional back-office tool, not the
 * public-facing luxury brand experience (see Section 29 of the brief).
 */
export function AdminLayout() {
  const auth = useAuth()
  const logout = useLogout()

  return (
    <div className="min-h-dvh bg-white text-slate-900">
      <header className="border-b border-slate-200 px-6 py-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">Nails Villa Admin</p>
            <nav aria-label="Admin" className="flex gap-4 text-sm">
              <NavLink
                to="/admin"
                end
                className={({ isActive }) =>
                  cn('text-slate-600 hover:text-slate-900', isActive && 'font-medium text-slate-900')
                }
              >
                Bookings
              </NavLink>
            </nav>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <Link to="/" className="text-slate-600 hover:text-slate-900">
              View site
            </Link>
            {auth.user && <span className="hidden text-slate-500 sm:inline">{auth.user.email}</span>}
            <button
              type="button"
              onClick={() => logout.mutate()}
              disabled={logout.isPending}
              className="rounded-md border border-slate-300 px-3 py-1.5 text-slate-700 hover:bg-slate-50"
            >
              Log out
            </button>
          </div>
        </div>
      </header>
      <main className="p-6">
        <Outlet />
      </main>
    </div>
  )
}
