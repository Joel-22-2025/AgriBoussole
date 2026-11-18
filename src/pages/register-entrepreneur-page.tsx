import { zodResolver } from '@hookform/resolvers/zod'
import { AlertCircleIcon, UserPlusIcon } from 'lucide-react'
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { z } from 'zod'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { resolvePostAuthPath } from '@/features/auth/post-auth'
import { useAuth } from '@/features/auth/use-auth'
import { PAYS_LABELS, TYPE_PROFIL_LABELS } from '@/lib/api/types'
import type { Pays, TypeProfil } from '@/lib/api/types'

const registerSchema = z
  .object({
    first_name: z.string().max(150, '150 caractères maximum.'),
    last_name: z.string().max(150, '150 caractères maximum.'),
    email: z.string().min(1, 'L’adresse email est obligatoire.').email('Adresse email invalide.'),
    password: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères.'),
    confirm_password: z.string().min(1, 'Confirmez votre mot de passe.'),
    phone: z.string().max(30, '30 caractères maximum.'),
    pays: z.enum(['BJ', 'SN', 'CI'], 'Sélectionnez un pays.'),
    ville: z.string().min(1, 'La ville est obligatoire.').max(100),
    type_profil: z.enum(
      ['individuel', 'startup', 'cooperative', 'organisation_paysanne', 'pme', 'etudiant'],
      'Sélectionnez un type de profil.',
    ),
    filiere: z.string().max(100, '100 caractères maximum.'),
    est_femme: z.boolean(),
    est_jeune: z.boolean(),
  })
  .refine((data) => data.password === data.confirm_password, {
    path: ['confirm_password'],
    message: 'Les mots de passe ne correspondent pas.',
  })

type RegisterValues = z.infer<typeof registerSchema>

const registerFields = new Set<keyof RegisterValues>([
  'first_name',
  'last_name',
  'email',
  'password',
  'confirm_password',
  'phone',
  'pays',
  'ville',
  'type_profil',
  'filiere',
  'est_femme',
  'est_jeune',
])

export function RegisterEntrepreneurPage() {
  const { state, registerEntrepreneur } = useAuth()
  const navigate = useNavigate()
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    control,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      first_name: '',
      last_name: '',
      email: '',
      password: '',
      confirm_password: '',
      phone: '',
      pays: 'BJ',
      ville: '',
      type_profil: 'individuel',
      filiere: '',
      est_femme: false,
      est_jeune: false,
    },
  })

  if (state.status === 'authenticated' && state.user) {
    return <Navigate to={resolvePostAuthPath(state.user, state.profile)} replace />
  }

  async function onSubmit(values: RegisterValues) {
    setServerError(null)

    const result = await registerEntrepreneur({
      email: values.email,
      password: values.password,
      first_name: values.first_name,
      last_name: values.last_name,
      phone: values.phone,
      pays: values.pays,
      ville: values.ville,
      type_profil: values.type_profil,
      filiere: values.filiere,
      est_femme: values.est_femme,
      est_jeune: values.est_jeune,
    })

    if (result.ok) {
      toast.success('Votre compte entrepreneur a été créé.')
      navigate(resolvePostAuthPath(result.user, result.profile), { replace: true })
      return
    }

    setServerError(result.error)
    for (const [field, messages] of Object.entries(result.fieldErrors)) {
      if (registerFields.has(field as keyof RegisterValues)) {
        setError(field as keyof RegisterValues, {
          type: 'server',
          message: messages.join(' '),
        })
      }
    }
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-12">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Créer un compte entrepreneur</CardTitle>
          <CardDescription>
            Ces informations nous permettent de mieux vous orienter vers les structures
            d’accompagnement adaptées.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <FieldGroup>
              {serverError && (
                <Alert variant="destructive">
                  <AlertCircleIcon />
                  <AlertTitle>Inscription impossible</AlertTitle>
                  <AlertDescription>{serverError}</AlertDescription>
                </Alert>
              )}

              <FieldSet>
                <FieldLegend>Identité</FieldLegend>
                <FieldGroup className="sm:grid sm:grid-cols-2">
                  <Field data-invalid={Boolean(errors.first_name)}>
                    <FieldLabel htmlFor="first_name">Prénom</FieldLabel>
                    <Input
                      id="first_name"
                      autoComplete="given-name"
                      aria-invalid={Boolean(errors.first_name)}
                      {...register('first_name')}
                    />
                    <FieldError errors={[errors.first_name]} />
                  </Field>

                  <Field data-invalid={Boolean(errors.last_name)}>
                    <FieldLabel htmlFor="last_name">Nom</FieldLabel>
                    <Input
                      id="last_name"
                      autoComplete="family-name"
                      aria-invalid={Boolean(errors.last_name)}
                      {...register('last_name')}
                    />
                    <FieldError errors={[errors.last_name]} />
                  </Field>

                  <Field data-invalid={Boolean(errors.email)}>
                    <FieldLabel htmlFor="email">Adresse email</FieldLabel>
                    <Input
                      id="email"
                      type="email"
                      autoComplete="email"
                      aria-invalid={Boolean(errors.email)}
                      {...register('email')}
                    />
                    <FieldError errors={[errors.email]} />
                  </Field>

                  <Field data-invalid={Boolean(errors.phone)}>
                    <FieldLabel htmlFor="phone">Téléphone (facultatif)</FieldLabel>
                    <Input
                      id="phone"
                      type="tel"
                      autoComplete="tel"
                      placeholder="+229 …"
                      aria-invalid={Boolean(errors.phone)}
                      {...register('phone')}
                    />
                    <FieldError errors={[errors.phone]} />
                  </Field>
                </FieldGroup>
              </FieldSet>

              <FieldSet>
                <FieldLegend>Sécurité</FieldLegend>
                <FieldGroup className="sm:grid sm:grid-cols-2">
                  <Field data-invalid={Boolean(errors.password)}>
                    <FieldLabel htmlFor="password">Mot de passe</FieldLabel>
                    <Input
                      id="password"
                      type="password"
                      autoComplete="new-password"
                      aria-invalid={Boolean(errors.password)}
                      {...register('password')}
                    />
                    <FieldDescription>8 caractères minimum.</FieldDescription>
                    <FieldError errors={[errors.password]} />
                  </Field>

                  <Field data-invalid={Boolean(errors.confirm_password)}>
                    <FieldLabel htmlFor="confirm_password">Confirmer le mot de passe</FieldLabel>
                    <Input
                      id="confirm_password"
                      type="password"
                      autoComplete="new-password"
                      aria-invalid={Boolean(errors.confirm_password)}
                      {...register('confirm_password')}
                    />
                    <FieldError errors={[errors.confirm_password]} />
                  </Field>
                </FieldGroup>
              </FieldSet>

              <FieldSet>
                <FieldLegend>Profil</FieldLegend>
                <FieldGroup className="sm:grid sm:grid-cols-2">
                  <Field data-invalid={Boolean(errors.pays)}>
                    <FieldLabel htmlFor="pays">Pays</FieldLabel>
                    <Controller
                      control={control}
                      name="pays"
                      render={({ field }) => (
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger id="pays" aria-invalid={Boolean(errors.pays)}>
                            <SelectValue placeholder="Sélectionnez un pays" />
                          </SelectTrigger>
                          <SelectContent>
                            {(Object.entries(PAYS_LABELS) as [Pays, string][]).map(
                              ([value, label]) => (
                                <SelectItem key={value} value={value}>
                                  {label}
                                </SelectItem>
                              ),
                            )}
                          </SelectContent>
                        </Select>
                      )}
                    />
                    <FieldError errors={[errors.pays]} />
                  </Field>

                  <Field data-invalid={Boolean(errors.ville)}>
                    <FieldLabel htmlFor="ville">Ville</FieldLabel>
                    <Input
                      id="ville"
                      autoComplete="address-level2"
                      aria-invalid={Boolean(errors.ville)}
                      {...register('ville')}
                    />
                    <FieldError errors={[errors.ville]} />
                  </Field>

                  <Field data-invalid={Boolean(errors.type_profil)}>
                    <FieldLabel htmlFor="type_profil">Type de profil</FieldLabel>
                    <Controller
                      control={control}
                      name="type_profil"
                      render={({ field }) => (
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger id="type_profil" aria-invalid={Boolean(errors.type_profil)}>
                            <SelectValue placeholder="Sélectionnez un type de profil" />
                          </SelectTrigger>
                          <SelectContent>
                            {(Object.entries(TYPE_PROFIL_LABELS) as [TypeProfil, string][]).map(
                              ([value, label]) => (
                                <SelectItem key={value} value={value}>
                                  {label}
                                </SelectItem>
                              ),
                            )}
                          </SelectContent>
                        </Select>
                      )}
                    />
                    <FieldError errors={[errors.type_profil]} />
                  </Field>

                  <Field data-invalid={Boolean(errors.filiere)}>
                    <FieldLabel htmlFor="filiere">Filière (facultatif)</FieldLabel>
                    <Input
                      id="filiere"
                      placeholder="Ex. maraîchage, transformation, élevage…"
                      aria-invalid={Boolean(errors.filiere)}
                      {...register('filiere')}
                    />
                    <FieldError errors={[errors.filiere]} />
                  </Field>
                </FieldGroup>
              </FieldSet>

              <FieldSet>
                <FieldLegend variant="label">Précisions (facultatif)</FieldLegend>
                <FieldGroup className="gap-3">
                  <Field orientation="horizontal">
                    <Controller
                      control={control}
                      name="est_femme"
                      render={({ field }) => (
                        <Checkbox
                          id="est_femme"
                          checked={field.value}
                          onCheckedChange={(checked) => field.onChange(checked === true)}
                        />
                      )}
                    />
                    <FieldContent>
                      <FieldLabel htmlFor="est_femme">Je suis une femme</FieldLabel>
                      <FieldDescription>
                        Utilisé pour mesurer la représentativité dans le réseau.
                      </FieldDescription>
                    </FieldContent>
                  </Field>

                  <Field orientation="horizontal">
                    <Controller
                      control={control}
                      name="est_jeune"
                      render={({ field }) => (
                        <Checkbox
                          id="est_jeune"
                          checked={field.value}
                          onCheckedChange={(checked) => field.onChange(checked === true)}
                        />
                      )}
                    />
                    <FieldContent>
                      <FieldLabel htmlFor="est_jeune">Je suis un jeune entrepreneur</FieldLabel>
                      <FieldDescription>
                        Utilisé pour mesurer la représentativité dans le réseau.
                      </FieldDescription>
                    </FieldContent>
                  </Field>
                </FieldGroup>
              </FieldSet>

              <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
                <UserPlusIcon className="size-4" />
                {isSubmitting ? 'Création du compte…' : 'Créer mon compte'}
              </Button>
            </FieldGroup>
          </form>

          <p className="mt-6 border-t pt-4 text-sm text-muted-foreground">
            Déjà inscrit ?{' '}
            <Link to="/connexion" className="font-medium text-foreground underline-offset-4 hover:underline">
              Se connecter
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
