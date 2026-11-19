import {
  ArrowRightIcon,
  BarChart3Icon,
  BriefcaseBusinessIcon,
  ClipboardListIcon,
  MessageSquareIcon,
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
import {
  SaeiActivityChart,
  SaeiEngagementChart,
  SaeiKpiCard,
  type SaeiMetric,
} from '@/features/dashboard/components/saei-charts'
import { fetchSaeiDashboard } from '@/lib/api/engagement'
import { PAYS_LABELS } from '@/lib/api/types'
import { useAsync } from '@/lib/use-async'
import { getDisplayName, mediaUrl } from '@/lib/utils'

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
            <Skeleton key={index} className="h-32 rounded-card" />
          ))}
        </div>
        <div className="grid gap-4 lg:grid-cols-5">
          <Skeleton className="h-80 rounded-card lg:col-span-3" />
          <Skeleton className="h-80 rounded-card lg:col-span-2" />
        </div>
      </div>
    )
  }

  const entrepreneurs = data?.entrepreneurs ?? 0
  const connectes = data?.entrepreneurs_connectes ?? 0
  const offres = data?.offres ?? 0
  const candidatures = data?.candidatures ?? 0
  const indicateurs = data?.indicateurs ?? 0
  const messages = data?.messages_non_lus ?? 0
  const note = data?.note_moyenne ?? null
  const max = Math.max(entrepreneurs, offres, candidatures, indicateurs, messages, 1)

  const metrics: SaeiMetric[] = [
    {
      label: 'Entrepreneurs',
      value: entrepreneurs,
      numeric: entrepreneurs,
      max,
      hint: `${connectes} connectés`,
      icon: <UsersIcon className="size-5" />,
      accent: 'var(--chart-1)',
    },
    {
      label: 'Offres publiées',
      value: offres,
      numeric: offres,
      max,
      icon: <BriefcaseBusinessIcon className="size-5" />,
      accent: 'var(--chart-2)',
    },
    {
      label: 'Candidatures reçues',
      value: candidatures,
      numeric: candidatures,
      max,
      icon: <ClipboardListIcon className="size-5" />,
      accent: 'var(--chart-3)',
    },
    {
      label: 'Indicateurs publiés',
      value: indicateurs,
      numeric: indicateurs,
      max,
      icon: <BarChart3Icon className="size-5" />,
      accent: 'var(--chart-4)',
    },
    {
      label: 'Messages non lus',
      value: messages,
      numeric: messages,
      max,
      icon: <MessageSquareIcon className="size-5" />,
      accent: 'var(--chart-5)',
    },
    {
      label: 'Note de l’équipe',
      value: note ? `${note.toFixed(1)}/5` : '—',
      numeric: note ?? 0,
      max: 5,
      hint: 'Évaluations des entrepreneurs',
      icon: <StarIcon className="size-5" />,
      accent: 'var(--chart-6)',
    },
  ]

  const activityData = [
    { name: 'Entrepr.', value: entrepreneurs, color: 'var(--chart-1)' },
    { name: 'Offres', value: offres, color: 'var(--chart-2)' },
    { name: 'Candid.', value: candidatures, color: 'var(--chart-3)' },
    { name: 'Indic.', value: indicateurs, color: 'var(--chart-4)' },
    { name: 'Messages', value: messages, color: 'var(--chart-5)' },
  ]

  const engagementData = [
    { name: 'Candidatures', value: candidatures, color: 'var(--chart-3)' },
    { name: 'Offres', value: offres, color: 'var(--chart-2)' },
    { name: 'Indicateurs', value: indicateurs, color: 'var(--chart-4)' },
    { name: 'Messages non lus', value: messages, color: 'var(--chart-5)' },
  ].filter((segment) => segment.value > 0)

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
        {metrics.map((metric) => (
          <SaeiKpiCard key={metric.label} metric={metric} />
        ))}
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <SaeiActivityChart
            title="Activité de la structure"
            description="Volumes réels suivis par votre structure d’accompagnement."
            data={activityData}
          />
        </div>
        <div className="lg:col-span-2">
          <SaeiEngagementChart
            title="Répartition de l’engagement"
            description="Candidatures, offres, indicateurs et messages en attente."
            data={engagementData}
          />
        </div>
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
              <MessageSquareIcon className="size-4" />
              Ouvrir la messagerie
              <ArrowRightIcon className="ml-auto size-4" />
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
