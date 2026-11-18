import { ChevronDownIcon, FunnelIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import type { DashboardFilters } from '@/features/dashboard/filters'
import { PAYS_LABELS } from '@/lib/api/types'

const TYPOLOGIES = [
  { value: 'incubateur', label: 'Incubateur' },
  { value: 'accelerateur', label: 'Accélérateur' },
  { value: 'recherche_innovation', label: 'Recherche et innovation' },
  { value: 'appui_technique', label: 'Appui technique' },
  { value: 'financement', label: 'Financement' },
  { value: 'plateforme_reseau', label: 'Plateforme et réseau' },
]

const SOURCES = [
  { value: 'enquetee', label: 'Enquêtées' },
  { value: 'revue_documentaire', label: 'Revue documentaire' },
]

const PERIODES = [
  { value: '7j', label: '7 jours' },
  { value: '30j', label: '30 jours' },
  { value: '12m', label: '12 mois' },
  { value: 'tout', label: 'Tout' },
]

function FilterField({
  label,
  value,
  onChange,
  options,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  options: Array<{ value: string; label: string }>
}) {
  const id = `filtre-${label.toLowerCase().replaceAll(' ', '-')}`

  return (
    <div className="flex min-w-0 flex-col gap-1">
      <label htmlFor={id} className="text-xs font-medium text-ink-muted">
        {label}
      </label>
      <div className="relative">
        <select
          id={id}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="h-10 w-full appearance-none rounded-field border border-border bg-field px-3 pr-9 text-sm text-ink-body transition-colors focus-visible:border-brand focus-visible:ring-3 focus-visible:ring-brand/30 focus-visible:outline-none"
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDownIcon
          className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-ink-muted"
          aria-hidden="true"
        />
      </div>
    </div>
  )
}

export function FilterBar({
  filters,
  onChange,
  onApply,
}: {
  filters: DashboardFilters
  onChange: (filters: DashboardFilters) => void
  onApply: () => void
}) {
  const paysOptions = [
    { value: '', label: 'Tous les pays' },
    ...Object.entries(PAYS_LABELS).map(([value, label]) => ({ value, label })),
  ]

  return (
    <section
      aria-label="Filtres du tableau de bord"
      className="rounded-card bg-card p-5 shadow-filter ring-1 ring-border"
    >
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-[repeat(4,minmax(0,1fr))_auto] lg:items-end">
        <FilterField
          label="Pays"
          value={filters.pays}
          onChange={(pays) => onChange({ ...filters, pays })}
          options={paysOptions}
        />
        <FilterField
          label="Type de structure"
          value={filters.typologie}
          onChange={(typologie) => onChange({ ...filters, typologie })}
          options={[{ value: '', label: 'Toutes les typologies' }, ...TYPOLOGIES]}
        />
        <FilterField
          label="Source"
          value={filters.source}
          onChange={(source) => onChange({ ...filters, source })}
          options={[{ value: '', label: 'Toutes les sources' }, ...SOURCES]}
        />
        <FilterField
          label="Période"
          value={filters.periode}
          onChange={(periode) => onChange({ ...filters, periode })}
          options={PERIODES}
        />
        <Button type="button" size="lg" onClick={onApply} className="h-10 lg:mb-0">
          <FunnelIcon className="size-4" aria-hidden="true" />
          Appliquer
        </Button>
      </div>
    </section>
  )
}
