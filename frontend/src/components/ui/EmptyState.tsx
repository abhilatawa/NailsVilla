import type { LucideIcon } from 'lucide-react'

interface EmptyStateProps {
  icon?: LucideIcon
  title: string
  description?: string
}

export function EmptyState({ icon: Icon, title, description }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-md border border-dashed border-border px-6 py-16 text-center">
      {Icon && <Icon className="h-8 w-8 text-charcoal-soft" aria-hidden="true" />}
      <p className="font-display text-xl text-charcoal">{title}</p>
      {description && <p className="max-w-md text-sm text-charcoal-soft">{description}</p>}
    </div>
  )
}
