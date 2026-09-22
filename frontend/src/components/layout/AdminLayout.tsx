import { Outlet } from 'react-router-dom'

/**
 * Deliberately plain: the admin panel is a functional back-office tool, not the
 * public-facing luxury brand experience (see Section 29 of the brief).
 */
export function AdminLayout() {
  return (
    <div className="min-h-dvh bg-white text-slate-900">
      <header className="border-b border-slate-200 px-6 py-4">
        <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Nails Villa Admin
        </p>
      </header>
      <main className="p-6">
        <Outlet />
      </main>
    </div>
  )
}
