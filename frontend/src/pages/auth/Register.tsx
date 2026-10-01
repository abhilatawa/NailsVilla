import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { Button } from '@/components/ui/Button'
import { FieldError } from '@/components/ui/FieldError'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { AuthCard } from '@/features/auth/components/AuthCard'
import { homeFor, useAuth, useRegister } from '@/features/auth/useAuth'
import { ApiRequestError } from '@/types/api'

const registerSchema = z
  .object({
    firstName: z.string().min(1, 'Required').max(100),
    lastName: z.string().min(1, 'Required').max(100),
    email: z.string().min(1, 'Please enter your email').email('Enter a valid email address'),
    phone: z.string().max(30).optional(),
    password: z.string().min(8, 'Use at least 8 characters').max(100),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

type RegisterFormValues = z.infer<typeof registerSchema>

export function RegisterPage() {
  const auth = useAuth()
  const registerAccount = useRegister()
  const navigate = useNavigate()
  const from = (useLocation().state as { from?: string } | null)?.from

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({ resolver: zodResolver(registerSchema) })

  if (auth.status === 'authenticated' && !registerAccount.isSuccess) {
    return <Navigate to={homeFor(auth.user.role)} replace />
  }

  const onSubmit = handleSubmit(async ({ firstName, lastName, email, password, phone }) => {
    try {
      const { user } = await registerAccount.mutateAsync({
        firstName,
        lastName,
        email,
        password,
        phone: phone || undefined,
      })
      navigate(from ?? homeFor(user.role), { replace: true })
    } catch {
      // Shown below from registerAccount.error.
    }
  })

  const errorMessage =
    registerAccount.error instanceof ApiRequestError
      ? registerAccount.error.apiError.message
      : registerAccount.error
        ? 'Something went wrong. Please try again.'
        : null

  return (
    <AuthCard
      eyebrow="Join Nails Villa"
      title="Create Account"
      description="Keep track of your appointments and book in fewer steps."
      footer={
        <>
          Already have an account?{' '}
          <Link to="/login" state={{ from }} className="font-medium text-charcoal underline-offset-4 hover:underline">
            Log in
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} noValidate className="space-y-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <Label htmlFor="register-first-name">First name</Label>
            <Input
              id="register-first-name"
              autoComplete="given-name"
              aria-invalid={Boolean(errors.firstName)}
              {...register('firstName')}
            />
            <FieldError message={errors.firstName?.message} />
          </div>
          <div>
            <Label htmlFor="register-last-name">Last name</Label>
            <Input
              id="register-last-name"
              autoComplete="family-name"
              aria-invalid={Boolean(errors.lastName)}
              {...register('lastName')}
            />
            <FieldError message={errors.lastName?.message} />
          </div>
        </div>
        <div>
          <Label htmlFor="register-email">Email</Label>
          <Input
            id="register-email"
            type="email"
            autoComplete="email"
            aria-invalid={Boolean(errors.email)}
            {...register('email')}
          />
          <FieldError message={errors.email?.message} />
        </div>
        <div>
          <Label htmlFor="register-phone">Phone (optional)</Label>
          <Input id="register-phone" type="tel" autoComplete="tel" {...register('phone')} />
        </div>
        <div>
          <Label htmlFor="register-password">Password</Label>
          <Input
            id="register-password"
            type="password"
            autoComplete="new-password"
            aria-invalid={Boolean(errors.password)}
            {...register('password')}
          />
          <FieldError message={errors.password?.message} />
        </div>
        <div>
          <Label htmlFor="register-confirm-password">Confirm password</Label>
          <Input
            id="register-confirm-password"
            type="password"
            autoComplete="new-password"
            aria-invalid={Boolean(errors.confirmPassword)}
            {...register('confirmPassword')}
          />
          <FieldError message={errors.confirmPassword?.message} />
        </div>

        {errorMessage && (
          <p role="alert" className="rounded-md border border-danger/30 bg-danger/5 px-3 py-2 text-sm text-danger">
            {errorMessage}
          </p>
        )}

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? 'Creating account…' : 'Create Account'}
        </Button>
      </form>
    </AuthCard>
  )
}
