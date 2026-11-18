import {
  ArrowRightIcon,
  Building2Icon,
  CompassIcon,
  SearchIcon,
  ShieldCheckIcon,
  SmartphoneIcon,
  SproutIcon,
  UserRoundIcon,
} from 'lucide-react'
import { Link } from 'react-router-dom'

import { getHomePath } from '@/components/layout/navigation'
import { Badge } from '@/components/ui/badge'
import { buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/features/auth/use-auth'
import { cn } from '@/lib/utils'

const steps = [
  {
    icon: UserRoundIcon,
    title: '1. Créez votre profil',
    description:
      'Renseignez votre pays, votre ville, votre type de profil et votre filière en quelques minutes.',
  },
  {
    icon: SearchIcon,
    title: '2. Explorez le réseau SAEI',
    description:
      'Consultez les structures d’accompagnement publiées au Bénin, au Sénégal et en Côte d’Ivoire.',
  },
  {
    icon: CompassIcon,
    title: '3. Trouvez le bon accompagnement',
    description:
      'Identifiez la structure adaptée à votre stade de développement et à vos besoins.',
  },
]

export function HomePage() {
  const { state } = useAuth()
  const isAuthenticated = state.status === 'authenticated'

  return (
    <div className="mx-auto w-full max-w-6xl px-4">
      <section className="flex flex-col items-center gap-6 py-16 text-center sm:py-24">
        <Badge variant="secondary" className="gap-1.5">
          <SproutIcon className="size-3.5" />
          Bénin · Sénégal · Côte d’Ivoire
        </Badge>
        <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
          Trouvez la structure qui fera grandir votre projet agri-agro.
        </h1>
        <p className="max-w-2xl text-balance text-muted-foreground sm:text-lg">
          AgriBoussole met en relation les entrepreneurs agricoles et agroalimentaires
          avec les structures d’accompagnement (SAEI) les plus pertinentes.
        </p>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Link
            to={
              isAuthenticated && state.user
                ? getHomePath(state.user.role)
                : '/inscription/entrepreneur'
            }
            className={cn(buttonVariants({ size: 'lg' }), 'gap-2')}
          >
            {isAuthenticated
              ? state.user?.role === 'ENTREPRENEUR'
                ? 'Identifier ma phase'
                : 'Accéder à mon espace'
              : 'Créer mon profil entrepreneur'}
            <ArrowRightIcon className="size-4" />
          </Link>
          <Link
            to="/structures"
            className={cn(buttonVariants({ variant: 'outline', size: 'lg' }), 'gap-2')}
          >
            <SearchIcon className="size-4" />
            Explorer les structures
          </Link>
        </div>
        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <SmartphoneIcon className="size-3.5" />
          Application installable sur mobile et consultable hors ligne.
        </p>
      </section>

      <section id="comment-ca-marche" className="grid scroll-mt-24 gap-4 pb-16 sm:grid-cols-3" aria-label="Comment ça marche">
        {steps.map((step) => (
          <Card key={step.title}>
            <CardHeader>
              <step.icon className="mb-1 size-6 text-primary" aria-hidden="true" />
              <CardTitle className="text-base">{step.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{step.description}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      <section id="profils" className="grid scroll-mt-24 gap-4 pb-20 md:grid-cols-2" aria-label="Profils">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <SproutIcon className="size-5 text-primary" />
              Vous êtes entrepreneur
            </CardTitle>
            <CardDescription>
              Créez votre profil pour être orienté vers les accompagnements adaptés.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link
              to="/inscription/entrepreneur"
              className={cn(buttonVariants({ variant: 'outline' }), 'gap-2')}
            >
              Créer un compte entrepreneur
              <ArrowRightIcon className="size-4" />
            </Link>
          </CardContent>
        </Card>

        {!isAuthenticated && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2Icon className="size-5 text-primary" />
              Vous êtes une SAEI
            </CardTitle>
            <CardDescription>
              Demandez votre accréditation pour rejoindre l’annuaire des structures.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Link
              to="/inscription/saei"
              className={cn(buttonVariants({ variant: 'outline' }), 'gap-2')}
            >
              Déposer une demande
              <ArrowRightIcon className="size-4" />
            </Link>
            <Link to="/connexion" className={cn(buttonVariants({ variant: 'ghost' }))}>
              J’ai déjà un compte
            </Link>
          </CardContent>
        </Card>
        )}
      </section>

      <section className="pb-20">
        <div className="flex flex-col items-start gap-3 rounded-xl border bg-muted/30 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <ShieldCheckIcon className="mt-0.5 size-5 text-primary" aria-hidden="true" />
            <div>
              <p className="font-medium">Administrateurs et SAEI accréditées</p>
              <p className="text-sm text-muted-foreground">
                Connectez-vous pour gérer les demandes, les structures et les utilisateurs.
              </p>
            </div>
          </div>
          <Link to="/connexion" className={buttonVariants({ variant: 'outline' })}>
            Se connecter
          </Link>
        </div>
      </section>
    </div>
  )
}
