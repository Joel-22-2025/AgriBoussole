import { ArrowRightIcon, Building2Icon, MapPinIcon } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { PendingRequests } from '@/features/admin/pending-requests'
import { FilterBar } from '@/features/dashboard/components/filter-bar'
import { DEFAULT_FILTERS, type DashboardFilters } from '@/features/dashboard/filters'
import { DonutCard } from '@/features/dashboard/components/donut-card'
import { LineCard } from '@/features/dashboard/components/line-card'
import { LivePill, PageHeader } from '@/features/dashboard/components/page-header'
import { StatCard } from '@/features/dashboard/components/stat-card'
import {
  dashboardMockData,
  formatDashboardDate,
} from '@/features/dashboard/dashboard-data'
import { useAuth } from '@/features/auth/use-auth'
import { PAYS_LABELS } from '@/lib/api/types'
import { getDisplayName } from '@/lib/utils'

const TYPOLOGIE_NOMS: Record<string, string> = {
  incubateur: 'Incubateur',
  accelerateur: 'Accélérateur',
  recherche_innovation: 'Recherche & innovation',
  appui_technique: 'Appui technique',
  financement: 'Financement',
  plateforme_reseau: 'Plateforme & réseau',
}

const FILTER_LABELS: Record<keyof DashboardFilters, string> = {
  pays: 'Pays',
  typologie: 'Type de structure',
  source: 'Source',
  periode: 'Période',
}

function BarList({ rows }: { rows: Array<{ label: string; value: number }> }) {
  return (
    <ul className="flex flex-col gap-3">
      {rows.map((row) => (
        <li key={row.label}>
          <div className="mb-1 flex items-center justify-between gap-3 text-sm">
            <span className="text-ink-body">{row.label}</span>
            <span className="tabular font-medium text-ink-strong">{row.value} %</span>
          </div>
          <div className="h-2 overflow-hidden rounded-pill bg-row">
            <div
              className="h-full rounded-pill bg-deep"
              style={{ width: `${Math.min(100, Math.max(0, row.value))}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  )
}

function DashboardCard({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) {
  return (
    <section className="rounded-card bg-card p-6 shadow-card ring-1 ring-border">
      <h2 className="mb-4 text-lg leading-[1.3] font-semibold text-ink-strong">{title}</h2>
      {children}
    </section>
  )
}

export function AdminDashboardPage() {
  const { state } = useAuth()
  const user = state.user
  const [filters, setFilters] = useState<DashboardFilters>(DEFAULT_FILTERS)
  const [applied, setApplied] = useState<DashboardFilters>(DEFAULT_FILTERS)

  if (!user) return null

  const data = dashboardMockData
  const payFilter = applied.pays
  const typoFilter = applied.typologie

  const donutData = typoFilter
    ? data.structuresParTypologie.filter(
        (segment) => segment.name === TYPOLOGIE_NOMS[typoFilter],
      )
    : payFilter
      ? data.structuresParPays.filter((segment) => segment.name === PAYS_LABELS[payFilter as keyof typeof PAYS_LABELS])
      : data.structuresParPays
  const statusRows = payFilter
    ? data.statutPays.filter((row) => row.name === PAYS_LABELS[payFilter as keyof typeof PAYS_LABELS])
    : data.statutPays

  const appliedLabels = (Object.keys(applied) as Array<keyof DashboardFilters>)
    .filter((key) => applied[key] && !(key === 'periode' && applied[key] === DEFAULT_FILTERS.periode))
    .map((key) => `${FILTER_LABELS[key]} : ${applied[key]}`)

  return (
    <div className="content-container">
      <PageHeader
        eyebrow="Espace d’administration"
        title={`Bonjour, ${getDisplayName(user.first_name, user.last_name, user.email)} !`}
        description="Voici l'état de l'écosystème d'accompagnement"
        actions={
          <>
            <Badge variant="outline" className="text-[11px]">
              Démonstration
            </Badge>
            <LivePill date={formatDashboardDate(data.updatedAt)} />
          </>
        }
      />

      <FilterBar filters={filters} onChange={setFilters} onApply={() => setApplied(filters)} />

      {appliedLabels.length > 0 && (
        <p className="mt-2 text-xs text-ink-muted">Filtres appliqués — {appliedLabels.join(' · ')}</p>
      )}

      <div className="mt-5 grid gap-3.5 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          kpi={{
            ...data.kpis.structures,
            value: donutData.reduce((sum, segment) => sum + segment.value, 0),
          }}
        />
        <StatCard kpi={data.kpis.demandes} />
        <StatCard kpi={data.kpis.entrepreneurs} />
        <StatCard kpi={data.kpis.completude} />
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <DonutCard
          title="Répartition des structures"
          description={
            typoFilter
              ? 'Structures pour la typologie sélectionnée.'
              : 'Structures par pays ou par typologie selon le filtre appliqué.'
          }
          data={donutData}
          unit="structures"
          statusTitle="Statut des pays"
          statusRows={statusRows.map((row) => ({
            name: row.name,
            value: row.value,
            tone: row.upToDate ? 'success' : 'warning',
            hint: row.upToDate ? undefined : 'à actualiser',
          }))}
        />
        <LineCard
          title="Activité de la plateforme"
          description="Recommandations générées par jour et objectif quotidien."
          activity={data.activite}
          analysisTitle="Analyse"
        />
      </div>

      <div className="mt-5">
        <PendingRequests compact />
      </div>

      <div className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        <DashboardCard title="Besoins non couverts">
          <BarList rows={data.besoins} />
        </DashboardCard>

        <DashboardCard title="Couverture géographique">
          <ul className="flex flex-col gap-2">
            {data.couverture.map((row) => {
              const low = row.structures < 5
              return (
                <li
                  key={row.ville}
                  className="flex items-center justify-between gap-3 rounded-field bg-row px-3.5 py-2.5 text-sm"
                >
                  <span className="flex min-w-0 items-center gap-2">
                    <MapPinIcon className="size-4 shrink-0 text-ink-muted" aria-hidden="true" />
                    <span className="truncate font-medium text-ink-body">{row.ville}</span>
                    {low && <span className="text-[11px] text-warning">zone peu couverte</span>}
                  </span>
                  <span className="tabular font-medium text-ink-strong">{row.structures}</span>
                </li>
              )
            })}
          </ul>
        </DashboardCard>

        <DashboardCard title="Stades couverts">
          <BarList rows={data.stades} />
        </DashboardCard>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
          <DashboardCard title="Administrateurs">
            <p className="mb-4 text-[13px] text-ink-muted">
              Créez, désactivez ou supprimez les comptes ADMIN depuis l’espace dédié.
            </p>
            <Button asChild>
              <Link to="/admin/administrateurs">
                <Building2Icon className="size-4" aria-hidden="true" />
                Gérer les administrateurs
                <ArrowRightIcon className="size-4" aria-hidden="true" />
              </Link>
            </Button>
          </DashboardCard>

          <DashboardCard title="Journal d’activité">
            <ul className="flex flex-col gap-2">
              {data.journal.map((entry) => (
                <li key={`${entry.date}-${entry.action}`} className="rounded-field bg-row px-3.5 py-2.5">
                  <p className="text-sm font-medium text-ink-strong">{entry.action}</p>
                  <p className="mt-0.5 text-xs text-ink-muted">
                    {entry.auteur} · {entry.date}
                  </p>
                </li>
              ))}
            </ul>
          </DashboardCard>
      </div>
    </div>
  )
}
