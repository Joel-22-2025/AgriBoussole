import {
  BadgeCheckIcon,
  Building2Icon,
  CalendarDaysIcon,
  CompassIcon,
  MailIcon,
  MapPinIcon,
  PhoneIcon,
  SmartphoneIcon,
  SproutIcon,
  UserRoundIcon,
} from 'lucide-react'
import type { ReactNode } from 'react'
import { Link, Navigate } from 'react-router-dom'

import { Badge } from '@/components/ui/badge'
import { buttonVariants } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { useAuth } from '@/features/auth/use-auth'
import { PAYS_LABELS, ROLE_LABELS, STATUS_LABELS, TYPE_PROFIL_LABELS } from '@/lib/api/types'
import type { AccountStatus, EntrepreneurProfile, SaeiProfile } from '@/lib/api/types'

function isEntrepreneurProfile(
  profile: EntrepreneurProfile | SaeiProfile | null,
): profile is EntrepreneurProfile {
  return Boolean(profile && 'type_profil' in profile)
}

function isSaeiProfile(
  profile: EntrepreneurProfile | SaeiProfile | null,
): profile is SaeiProfile {
  return Boolean(profile && 'nom_structure_demandee' in profile)
}

function statusVariant(status: AccountStatus) {
  if (status === 'APPROVED') return 'secondary'
  if (status === 'REJECTED') return 'destructive'
  return 'outline'
}

function InfoRow({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 text-muted-foreground">{icon}</span>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="truncate text-sm font-medium">{value || '—'}</p>
      </div>
    </div>
  )
}

export function DashboardPage() {
  const { state } = useAuth()
  const user = state.user

  if (!user) return null

  if (user.role === 'ADMIN') {
    return <Navigate to="/admin" replace />
  }

  const profile = state.profile
  const displayName = [user.first_name, user.last_name].filter(Boolean).join(' ') || user.email
  const memberSince = new Date(user.date_joined).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
  })

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10">
      <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Mon espace</p>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Bonjour, {displayName}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {ROLE_LABELS[user.role]} · Membre depuis {memberSince}
          </p>
        </div>
        <Badge variant={statusVariant(user.status)} className="h-6 px-3 text-sm">
          <BadgeCheckIcon className="size-3.5" />
          {STATUS_LABELS[user.status]}
        </Badge>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserRoundIcon className="size-5 text-primary" />
              Mon profil
            </CardTitle>
            <CardDescription>Les informations associées à votre compte.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <InfoRow icon={<MailIcon className="size-4" />} label="Email" value={user.email} />
              <InfoRow
                icon={<PhoneIcon className="size-4" />}
                label="Téléphone"
                value={user.phone}
              />
              {isEntrepreneurProfile(profile) && (
                <>
                  <InfoRow
                    icon={<MapPinIcon className="size-4" />}
                    label="Localisation"
                    value={`${profile.ville}, ${PAYS_LABELS[profile.pays]}`}
                  />
                  <InfoRow
                    icon={<SproutIcon className="size-4" />}
                    label="Type de profil"
                    value={TYPE_PROFIL_LABELS[profile.type_profil]}
                  />
                  <InfoRow
                    icon={<CompassIcon className="size-4" />}
                    label="Filière"
                    value={profile.filiere}
                  />
                </>
              )}
              {isSaeiProfile(profile) && (
                <>
                  <InfoRow
                    icon={<Building2Icon className="size-4" />}
                    label="Structure"
                    value={profile.nom_structure_demandee}
                  />
                  <InfoRow
                    icon={<MapPinIcon className="size-4" />}
                    label="Localisation"
                    value={`${profile.ville}, ${PAYS_LABELS[profile.pays]}`}
                  />
                  <InfoRow
                    icon={<PhoneIcon className="size-4" />}
                    label="Téléphone structure"
                    value={profile.telephone_structure}
                  />
                </>
              )}
              {!profile && (
                <p className="text-sm text-muted-foreground sm:col-span-2">
                  Aucun profil détaillé n’est rattaché à ce compte.
                </p>
              )}
            </div>

            <Separator />

            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-muted-foreground">
                La modification du profil sera disponible dans une prochaine itération
                (endpoint <code className="text-xs">PATCH /api/auth/me/</code> déjà prêt).
              </p>
              <Badge variant="outline" className="gap-1">
                <CalendarDaysIcon className="size-3" />
                Compte {user.is_active ? 'actif' : 'inactif'}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Actions rapides</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              <Link to="/structures" className={buttonVariants({ variant: 'outline' })}>
                <CompassIcon className="size-4" />
                Explorer les structures
              </Link>
              {user.role === 'ENTREPRENEUR' && (
                <p className="px-1 text-xs text-muted-foreground">
                  Vous pouvez parcourir l’annuaire public des SAEI publiées.
                </p>
              )}
              {user.role === 'SAEI' && (
                <p className="px-1 text-xs text-muted-foreground">
                  La page « Ma structure » sera ajoutée à la prochaine itération.
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <SmartphoneIcon className="size-4 text-primary" />
                Installer l’application
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Sur mobile, ouvrez le menu du navigateur puis choisissez
                « Ajouter à l’écran d’accueil » pour utiliser AgriBoussole comme une
                application, y compris hors ligne.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
