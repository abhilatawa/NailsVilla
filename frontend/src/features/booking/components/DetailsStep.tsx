import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Button } from '@/components/ui/Button'
import { FieldError } from '@/components/ui/FieldError'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Textarea } from '@/components/ui/Textarea'

const detailsSchema = z.object({
  firstName: z.string().min(1, 'Required').max(100),
  lastName: z.string().min(1, 'Required').max(100),
  email: z.string().min(1, 'Required').email('Enter a valid email address'),
  phone: z.string().min(1, 'Required').max(30),
  notes: z.string().max(1000).optional(),
})

export type BookingDetails = z.infer<typeof detailsSchema>

interface DetailsStepProps {
  defaultValues: Partial<BookingDetails>
  onBack: () => void
  onContinue: (details: BookingDetails) => void
}

export function DetailsStep({ defaultValues, onBack, onContinue }: DetailsStepProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<BookingDetails>({ resolver: zodResolver(detailsSchema), defaultValues })

  return (
    <div>
      <h2 className="font-display text-2xl text-charcoal">Your Details</h2>

      <form onSubmit={handleSubmit(onContinue)} noValidate className="mt-6 space-y-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <Label htmlFor="booking-first-name">First name</Label>
            <Input id="booking-first-name" aria-invalid={Boolean(errors.firstName)} {...register('firstName')} />
            <FieldError message={errors.firstName?.message} />
          </div>
          <div>
            <Label htmlFor="booking-last-name">Last name</Label>
            <Input id="booking-last-name" aria-invalid={Boolean(errors.lastName)} {...register('lastName')} />
            <FieldError message={errors.lastName?.message} />
          </div>
        </div>
        <div>
          <Label htmlFor="booking-email">Email</Label>
          <Input id="booking-email" type="email" aria-invalid={Boolean(errors.email)} {...register('email')} />
          <FieldError message={errors.email?.message} />
        </div>
        <div>
          <Label htmlFor="booking-phone">Phone</Label>
          <Input id="booking-phone" type="tel" aria-invalid={Boolean(errors.phone)} {...register('phone')} />
          <FieldError message={errors.phone?.message} />
        </div>
        <div>
          <Label htmlFor="booking-notes">Notes (optional)</Label>
          <Textarea
            id="booking-notes"
            placeholder="Anything you'd like us to know before your appointment?"
            {...register('notes')}
          />
        </div>

        <div className="flex gap-3">
          <Button type="button" variant="secondary" onClick={onBack}>
            Back
          </Button>
          <Button type="submit">Continue</Button>
        </div>
      </form>
    </div>
  )
}
