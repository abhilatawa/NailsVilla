import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Button } from '@/components/ui/Button'
import { FieldError } from '@/components/ui/FieldError'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Textarea } from '@/components/ui/Textarea'
import { useSubmitContact } from '@/features/contact/useSubmitContact'
import { dayName, summarizeHours, useBusinessHours } from '@/features/settings/useBusinessHours'
import { useSettings } from '@/features/settings/useSettings'
import { toast } from '@/lib/toastStore'

const contactSchema = z.object({
  name: z.string().min(1, 'Please enter your name').max(150),
  email: z.string().min(1, 'Please enter your email').email('Enter a valid email address'),
  message: z.string().min(1, 'Please enter a message').max(2000),
})

type ContactFormValues = z.infer<typeof contactSchema>

export function ContactPage() {
  const { data: settings } = useSettings()
  const { data: businessHours } = useBusinessHours()
  const submitContact = useSubmitContact()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormValues>({ resolver: zodResolver(contactSchema) })

  const onSubmit = handleSubmit(async (values) => {
    try {
      await submitContact.mutateAsync(values)
      toast.success("Thanks — we'll get back to you soon.")
      reset()
    } catch {
      toast.error('Something went wrong sending your message. Please try again.')
    }
  })

  return (
    <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
      <div className="text-center">
        <h1 className="font-display text-4xl text-charcoal">Contact</h1>
        <p className="mx-auto mt-3 max-w-xl text-charcoal-soft">
          Questions about a service, or want to talk through a design before booking? Send a message below.
        </p>
      </div>

      <div className="mt-12 grid gap-12 lg:grid-cols-2">
        <div>
          <h2 className="font-display text-xl text-charcoal">Nails Villa</h2>
          <p className="mt-2 text-charcoal-soft">
            {settings?.city ?? 'Halifax'}, {settings?.province ?? 'Nova Scotia'}
          </p>
          <p className="mt-1 text-sm text-charcoal-soft">
            {settings?.addressLine ?? 'Exact address available upon booking confirmation.'}
          </p>

          <div className="mt-6 space-y-1 text-sm text-charcoal-soft">
            {businessHours ? (
              summarizeHours(businessHours).map((line) => <p key={line}>{line}</p>)
            ) : (
              <p>
                {dayName(1)} – {dayName(7)}: 8:00 AM – 7:00 PM
              </p>
            )}
          </div>

          <dl className="mt-6 space-y-1 text-sm text-charcoal-soft">
            <div className="flex gap-2">
              <dt className="font-medium text-charcoal">Phone:</dt>
              <dd>{settings?.phone ?? 'Coming soon'}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="font-medium text-charcoal">Email:</dt>
              <dd>{settings?.email ?? 'Coming soon'}</dd>
            </div>
          </dl>
        </div>

        <form onSubmit={onSubmit} noValidate className="space-y-5">
          <div>
            <Label htmlFor="contact-name">Name</Label>
            <Input id="contact-name" aria-invalid={Boolean(errors.name)} {...register('name')} />
            <FieldError message={errors.name?.message} />
          </div>
          <div>
            <Label htmlFor="contact-email">Email</Label>
            <Input id="contact-email" type="email" aria-invalid={Boolean(errors.email)} {...register('email')} />
            <FieldError message={errors.email?.message} />
          </div>
          <div>
            <Label htmlFor="contact-message">Message</Label>
            <Textarea id="contact-message" aria-invalid={Boolean(errors.message)} {...register('message')} />
            <FieldError message={errors.message?.message} />
          </div>
          <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
            {isSubmitting ? 'Sending…' : 'Send Message'}
          </Button>
        </form>
      </div>
    </section>
  )
}
