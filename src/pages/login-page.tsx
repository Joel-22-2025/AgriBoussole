import { zodResolver } from '@hookform/resolvers/zod'
import { AlertCircleIcon, ClockIcon, LogInIcon } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { z } from 'zod'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { resolvePostAuthPath } from '@/features/auth/post-auth'
import { useAuth } from '@/features/auth/use-auth'

const loginSchema = z.object({
  email: z.string().min(1, 'L’adresse email est obligatoire.').email('Adresse email invalide.'),
  password: z.string().min(1, 'Le mot de passe est obligatoire.'),
})

type LoginValues = z.infer<typeof loginSchema>

interface LocationState {
  from?: string
}

export function LoginPage() {
  const { state, login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [serverError, setServerError] = useState<string | null>(null)
  const [pendingAccount, setPendingAccount] = useState(false)

  const from = (location.state as LocationState | null)?.from

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  if (state.status === 'authenticated' && state.user) {
    return <Navigate to={resolvePostAuthPath(state.user, state.profile, from)} replace />
  }

  async function onSubmit(values: LoginValues) {
    setServerError(null)
    setPendingAccount(false)

    const result = await login(values.email, values.password)
    if (result.ok) {
      toast.success('Connexion réussie.')
      navigate(resolvePostAuthPath(result.user, result.profile, from), { replace: true })
      return
    }

    setServerError(result.error)
    setPendingAccount(result.status === 'PENDING')

    for (const [field, messages] of Object.entries(result.fieldErrors)) {
      if (field === 'email' || field === 'password') {
        setError(field, { type: 'server', message: messages.join(' ') })
      }
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-md flex-col justify-center px-4 py-16">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Connexion</CardTitle>
          <CardDescription>
            Accédez à votre espace AgriBoussole.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <FieldGroup>
              {serverError && (
                <Alert variant="destructive">
                  {pendingAccount ? <ClockIcon /> : <AlertCircleIcon />}
                  <AlertTitle>
                    {pendingAccount ? 'Compte en attente de validation' : 'Connexion impossible'}
                  </AlertTitle>
                  <AlertDescription>{serverError}</AlertDescription>
                </Alert>
              )}

              <Field data-invalid={Boolean(errors.email)}>
                <FieldLabel htmlFor="email">Adresse email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="vous@exemple.com"
                  aria-invalid={Boolean(errors.email)}
                  {...register('email')}
                />
                <FieldError errors={[errors.email]} />
              </Field>

              <Field data-invalid={Boolean(errors.password)}>
                <FieldLabel htmlFor="password">Mot de passe</FieldLabel>
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  aria-invalid={Boolean(errors.password)}
                  {...register('password')}
                />
                <FieldError errors={[errors.password]} />
              </Field>

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                <LogInIcon className="size-4" />
                {isSubmitting ? 'Connexion…' : 'Se connecter'}
              </Button>
            </FieldGroup>
          </form>

          <div className="mt-6 flex flex-col gap-1 border-t pt-4 text-sm text-muted-foreground">
            <p>
              Pas encore de compte ?{' '}
              <Link to="/inscription/entrepreneur" className="font-medium text-foreground underline-offset-4 hover:underline">
                Créer un profil entrepreneur
              </Link>
            </p>
            <p>
              Vous représentez une SAEI ?{' '}
              <Link to="/inscription/saei" className="font-medium text-foreground underline-offset-4 hover:underline">
                Demander une accréditation
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
