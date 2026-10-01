import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { Button } from '@/components/ui/Button'
import { FieldError } from '@/components/ui/FieldError'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { AuthCard } from '@/features/auth/components/AuthCard'
import { homeFor, useAuth, useLogin } from '@/features/auth/useAuth'
import { ApiRequestError } from '@/types/api'

const loginSchema = z.object({
  email: z.string().min(1, 'Please enter your email').email('Enter a valid email address'),
  password: z.string().min(1, 'Please enter your password'),
})

type LoginFormValues = z.infer<typeof loginSchema>

export function LoginPage() {
  const auth = useAuth()
  const login = useLogin()
  const navigate = useNavigate()
  const from = (useLocation().state as { from?: string } | null)?.from

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) })

  if (auth.status === 'authenticated' && !login.isSuccess) {
    return <Navigate to={homeFor(auth.user.role)} replace />
  }

  const onSubmit = handleSubmit(async (values) => {
    try {
      const { user } = await login.mutateAsync(values)
      navigate(from ?? homeFor(user.role), { replace: true })
    } catch {
      // Shown below from login.error.
    }
  })

  const errorMessage =
    login.error instanceof ApiRequestError
      ? login.error.apiError.message
      : login.error
        ? 'Something went wrong. Please try again.'
        : null

  return (
    <AuthCard
      eyebrow="Welcome back"
      title="Log In"
      description="See your upcoming appointments and book faster."
      footer={
        <>
          New to Nails Villa?{' '}
          <Link to="/register" state={{ from }} className="font-medium text-charcoal underline-offset-4 hover:underline">
            Create an account
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} noValidate className="space-y-5">
        <div>
          <Label htmlFor="login-email">Email</Label>
          <Input
            id="login-email"
            type="email"
            autoComplete="email"
            aria-invalid={Boolean(errors.email)}
            {...register('email')}
          />
          <FieldError message={errors.email?.message} />
        </div>
        <div>
          <Label htmlFor="login-password">Password</Label>
          <Input
            id="login-password"
            type="password"
            autoComplete="current-password"
            aria-invalid={Boolean(errors.password)}
            {...register('password')}
          />
          <FieldError message={errors.password?.message} />
        </div>

        {errorMessage && (
          <p role="alert" className="rounded-md border border-danger/30 bg-danger/5 px-3 py-2 text-sm text-danger">
            {errorMessage}
          </p>
        )}

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? 'Logging in…' : 'Log In'}
        </Button>
      </form>
    </AuthCard>
  )
}
