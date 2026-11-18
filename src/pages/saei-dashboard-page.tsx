import {
  ArrowRightIcon,
  BarChart3Icon,
  BellIcon,
  BriefcaseBusinessIcon,
  ClipboardListIcon,
  StarIcon,
  UsersIcon,
} from 'lucide-react'
import { Link, Navigate } from 'react-router-dom'

import { Badge } from '@/components/ui/badge'
import { buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useAuth } from '@/features/auth/use-auth'
import { PageHeader } from '@/features/dashboard/components/page-header'
import { fetchSaeiDashboard } from '@/lib/api/engagement'
import { PAYS_LABELS } from '@/lib/api/types'
import type { ReactNode } from 'react'
import { useAsync } from '@/lib/use-async'
import { getDisplayName, mediaUrl } from '@/lib/utils'

function KpiCard({ icon, label, value, hint }: { icon: ReactNode; label: string; value: string | number; hint?: string }) {
  return (
    <Card>
      <CardContent className="flex items-start gap-3 p-4">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-card bg-live text-deep">
          {icon}
        </span>
        <div className="min-w-0">
          <p className="text-xs text-ink-muted">{label}</p>
          <p className="text-xl font-semibold text-ink-strong">{value}</p>
          {hint && <p className="text-[11px] text-ink-muted">{hint}</p>}
        </div>
      </CardContent>
    </Card>
  )
}

export function SaeiDashboardPage() {
  const { state } = useAuth()
  const { data, loading, error } = useAsync(fetchSaeiDashboard, [])
  const user = state.user

  if (user && user.role !== 'SAEI') return <Navigate to="/" replace />

  if (loading && !data) {
    return (
      <div className="content-container space-y-4">
        <Skeleton className="h-24 w-full rounded-card" />
        <div className="grid gap-3.5 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }, (_, index) => (
            <Skeleton key={index} className="h-28 rounded-card" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="content-container">
      <PageHeader
        eyebrow="Espace SAEI"
        title={`Bonjour, ${getDisplayName(user?.first_name, user?.last_name, user?.email)} !`}
        description="Vue d’ensemble de votre structure et de son écosystème entrepreneur."
        actions={
          <Badge variant="secondary" className="text-[11px]">
            {data?.structure.nom_structure || 'Structure rattachée'}
          </Badge>
        }
      />

      {error && <p className="mt-4 rounded-field bg-row px-4 py-3 text-sm text-ink-body">{error}</p>}

      <div className="mt-5 grid gap-3.5 sm:grid-cols-2 xl:grid-cols-3">
        <KpiCard
          icon={<UsersIcon className="size-5" />}
          label="Entrepreneurs"
          value={data?.entrepreneurs ?? 0}
          hint={`${data?.entrepreneurs_connectes ?? 0} connectés`}
        />
        <KpiCard
          icon={<BriefcaseBusinessIcon className="size-5" />}
          label="Offres publiées"
          value={data?.offres ?? 0}
        />
        <KpiCard
          icon={<ClipboardListIcon className="size-5" />}
          label="Candidatures reçues"
          value={data?.candidatures ?? 0}
        />
        <KpiCard
          icon={<BarChart3Icon className="size-5" />}
          label="Indicateurs publiés"
          value={data?.indicateurs ?? 0}
        />
        <KpiCard
          icon={<BellIcon className="size-5" />}
          label="Messages non lus"
          value={data?.messages_non_lus ?? 0}
        />
        <KpiCard
          icon={<StarIcon className="size-5" />}
          label="Note de l’équipe"
          value={data?.note_moyenne ? `${data.note_moyenne.toFixed(1)}/5` : '—'}
          hint="Évaluations des entrepreneurs"
        />
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Ma structure</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-card bg-row">
              {mediaUrl(data?.structure.logo) ? (
                <img
                  src={mediaUrl(data?.structure.logo) ?? ''}
                  alt={`Logo de ${data?.structure.nom_structure}`}
                  className="size-full object-contain"
                />
              ) : (
                <BriefcaseBusinessIcon className="size-7 text-ink-muted" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-ink-strong">
                {data?.structure.nom_structure_demandee || '—'}
              </p>
              <p className="text-sm text-ink-muted">
                {data?.structure.ville && data?.structure.pays
                  ? `${data.structure.ville}, ${PAYS_LABELS[data.structure.pays]}`
                  : 'Localisation non renseignée'}
              </p>
            </div>
            <Link to="/saei/profil" className={buttonVariants({ variant: 'outline', size: 'sm' })}>
              Compléter mon profil
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Actions rapides</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <Link to="/saei/offres" className={buttonVariants({ variant: 'outline', size: 'sm' })}>
              <BriefcaseBusinessIcon className="size-4" />
              Créer une offre
              <ArrowRightIcon className="ml-auto size-4" />
            </Link>
            <Link to="/saei/indicateurs" className={buttonVariants({ variant: 'outline', size: 'sm' })}>
              <BarChart3Icon className="size-4" />
              Publier un indicateur
              <ArrowRightIcon className="ml-auto size-4" />
            </Link>
            <Link to="/saei/messages" className={buttonVariants({ variant: 'outline', size: 'sm' })}>
              <BellIcon className="size-4" />
              Ouvrir la messagerie
              <ArrowRightIcon className="ml-auto size-4" />
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
