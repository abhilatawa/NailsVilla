import { type ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { homeFor, useAuth } from '@/features/auth/useAuth'
import type { Role } from '@/types/auth'

interface RequireAuthProps {
  /** When set, only users with this role get through; everyone else is sent home. */
  role?: Role
  children: ReactNode
}

export function RequireAuth({ role, children }: RequireAuthProps) {
  const auth = useAuth()
  const location = useLocation()

  if (auth.status === 'loading') {
    return <div className="min-h-[50vh]" aria-busy="true" />
  }
  if (auth.status === 'anonymous') {
    return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />
  }
  if (role && auth.user.role !== role) {
    return <Navigate to={homeFor(auth.user.role)} replace />
  }
  return <>{children}</>
}
