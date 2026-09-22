import { lazy } from 'react'

export const HomePage = lazy(() => import('@/pages/Home').then((m) => ({ default: m.HomePage })))
export const ServicesPage = lazy(() => import('@/pages/Services').then((m) => ({ default: m.ServicesPage })))
export const ServiceDetailPage = lazy(() =>
  import('@/pages/ServiceDetail').then((m) => ({ default: m.ServiceDetailPage })),
)
export const GalleryPage = lazy(() => import('@/pages/Gallery').then((m) => ({ default: m.GalleryPage })))
export const AboutPage = lazy(() => import('@/pages/About').then((m) => ({ default: m.AboutPage })))
export const ContactPage = lazy(() => import('@/pages/Contact').then((m) => ({ default: m.ContactPage })))
export const BookingPage = lazy(() => import('@/pages/Booking').then((m) => ({ default: m.BookingPage })))
export const LoginPage = lazy(() => import('@/pages/auth/Login').then((m) => ({ default: m.LoginPage })))
export const RegisterPage = lazy(() => import('@/pages/auth/Register').then((m) => ({ default: m.RegisterPage })))
export const DashboardPage = lazy(() =>
  import('@/pages/dashboard/Dashboard').then((m) => ({ default: m.DashboardPage })),
)
export const NotFoundPage = lazy(() => import('@/pages/NotFound').then((m) => ({ default: m.NotFoundPage })))
export const AdminDashboardPage = lazy(() =>
  import('@/pages/admin/AdminDashboard').then((m) => ({ default: m.AdminDashboardPage })),
)
