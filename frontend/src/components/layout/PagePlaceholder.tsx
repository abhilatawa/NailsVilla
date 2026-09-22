interface PagePlaceholderProps {
  title: string
  description: string
}

/** Temporary shell for a route whose full content ships in a later phase. */
export function PagePlaceholder({ title, description }: PagePlaceholderProps) {
  return (
    <section className="mx-auto max-w-3xl px-4 py-24 text-center sm:px-6">
      <h1 className="font-display text-4xl text-charcoal">{title}</h1>
      <p className="mt-4 text-charcoal-soft">{description}</p>
    </section>
  )
}
