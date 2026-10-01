import { type ReactNode } from 'react'
import { Card } from '@/components/ui/Card'

interface AuthCardProps {
  eyebrow: string
  title: string
  description: string
  children: ReactNode
  footer: ReactNode
}

export function AuthCard({ eyebrow, title, description, children, footer }: AuthCardProps) {
  return (
    <section className="mx-auto max-w-md px-4 py-16 sm:px-6 sm:py-20">
      <div className="text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-gold">{eyebrow}</p>
        <h1 className="mt-3 font-display text-4xl text-charcoal">{title}</h1>
        <p className="mt-3 text-charcoal-soft">{description}</p>
      </div>
      <Card className="mt-10 p-6 sm:p-8">{children}</Card>
      <p className="mt-6 text-center text-sm text-charcoal-soft">{footer}</p>
    </section>
  )
}
