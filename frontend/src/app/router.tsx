import { type ReactNode, Suspense } from 'react'
import { createBrowserRouter } from 'react-router-dom'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { PublicLayout } from '@/components/layout/PublicLayout'
import {
  AboutPage,
  AdminDashboardPage,
  BookingPage,
  ContactPage,
  DashboardPage,
  GalleryPage,
  HomePage,
  LoginPage,
  NotFoundPage,
  RegisterPage,
  ServiceDetailPage,
  ServicesPage,
} from '@/app/lazyPages'

function withSuspense(element: ReactNode) {
  return <Suspense fallback={<div className="min-h-[50vh]" />}>{element}</Suspense>
}

export const router = createBrowserRouter([
  {
    element: <PublicLayout />,
    children: [
      { path: '/', element: withSuspense(<HomePage />) },
      { path: '/services', element: withSuspense(<ServicesPage />) },
      { path: '/services/:id', element: withSuspense(<ServiceDetailPage />) },
      { path: '/gallery', element: withSuspense(<GalleryPage />) },
      { path: '/about', element: withSuspense(<AboutPage />) },
      { path: '/contact', element: withSuspense(<ContactPage />) },
      { path: '/book', element: withSuspense(<BookingPage />) },
      { path: '/login', element: withSuspense(<LoginPage />) },
      { path: '/register', element: withSuspense(<RegisterPage />) },
      { path: '/dashboard', element: withSuspense(<DashboardPage />) },
      { path: '*', element: withSuspense(<NotFoundPage />) },
    ],
  },
  {
    path: '/admin',
    element: <AdminLayout />,
    children: [{ index: true, element: withSuspense(<AdminDashboardPage />) }],
  },
])
