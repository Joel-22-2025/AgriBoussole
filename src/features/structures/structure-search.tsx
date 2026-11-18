import {
  AlertCircleIcon,
  ArrowUpRightIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CompassIcon,
  MapPinIcon,
  RefreshCwIcon,
  SearchIcon,
} from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { getApiError } from '@/lib/api/errors'
import { fetchStructures, fetchVilles } from '@/lib/api/structures'
import { PAYS_LABELS } from '@/lib/api/types'
import type { Paginated, Structure, Ville } from '@/lib/api/types'

const ALL = 'all'

const TYPOLOGIES = [
  { value: 'Incubateur', label: 'Incubateur' },
  { value: 'Accélérateur', label: 'Accélérateur' },
  { value: 'Recherche innovation', label: 'Recherche & innovation' },
  { value: 'Appui technique', label: 'Appui technique' },
  { value: 'Financement', label: 'Financement' },
  { value: 'Plateforme réseau', label: 'Plateforme réseau' },
]

const CIBLES = [
  { value: 'Jeunes', label: 'Jeunes' },
  { value: 'Femmes', label: 'Femmes' },
  { value: 'Entrepreneurs', label: 'Entrepreneurs' },
  { value: 'Startups', label: 'Startups' },
  { value: 'PME', label: 'PME' },
  { value: 'Coopératives', label: 'Coopératives' },
  { value: 'Organisations paysannes', label: 'Organisations paysannes' },
  { value: 'Étudiants', label: 'Étudiants' },
]

const STADES = [
  { value: 'Idéation', label: 'Idéation' },
  { value: 'Incubation', label: 'Incubation' },
  { value: 'Accélération', label: 'Accélération' },
  { value: 'Développement', label: 'Développement' },
  { value: 'Croissance', label: 'Croissance' },
  { value: 'Passage à l’échelle', label: 'Passage à l’échelle' },
]

const typologyFlags: Array<[keyof Structure, string]> = [
  ['est_incubateur', 'Incubateur'],
  ['est_accelerateur', 'Accélérateur'],
  ['est_recherche_innovation', 'Recherche & innovation'],
  ['est_appui_technique', 'Appui technique'],
  ['est_structure_financement', 'Financement'],
  ['est_plateforme_reseau', 'Plateforme réseau'],
]

interface SelectFieldProps {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  options: Array<{ value: string; label: string }>
  allLabel: string
}

function SelectField({ id, label, value, onChange, options, allLabel }: SelectFieldProps) {
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
          <option value={ALL}>{allLabel}</option>
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

function StructureCard({ structure }: { structure: Structure }) {
  const typologies = typologyFlags
    .filter(([key]) => Boolean(structure[key]))
    .map(([, label]) => label)
  const location = [structure.ville_siege, structure.region_departement]
    .filter(Boolean)
    .join(', ')

  return (
    <Link
      to={`/structures/${structure.id}`}
      aria-label={`Voir la fiche de ${structure.nom}`}
      className="group flex flex-col gap-3 rounded-card bg-card p-4 shadow-card ring-1 ring-border transition-all hover:-translate-y-0.5 hover:shadow-card hover:ring-brand/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-sm font-semibold text-ink-strong group-hover:text-deep">
            {structure.nom}
          </h3>
          <p className="mt-1 flex items-center gap-1 truncate text-xs text-ink-muted">
            <MapPinIcon className="size-3.5 shrink-0" />
            {location || PAYS_LABELS[structure.pays]} · {PAYS_LABELS[structure.pays]}
          </p>
        </div>
        {structure.acronyme && (
          <Badge variant="outline" className="shrink-0 text-[10px]">
            {structure.acronyme}
          </Badge>
        )}
      </div>

      {structure.service && (
        <p className="line-clamp-2 text-xs leading-relaxed text-ink-body">{structure.service}</p>
      )}

      <div className="flex flex-wrap gap-1.5">
        {typologies.slice(0, 2).map((typology) => (
          <Badge key={typology} variant="secondary" className="text-[10px] font-normal">
            {typology}
          </Badge>
        ))}
        {typologies.length > 2 && (
          <Badge variant="secondary" className="text-[10px] font-normal">
            +{typologies.length - 2}
          </Badge>
        )}
      </div>

      <div className="mt-auto flex items-center justify-between gap-2 border-t border-border pt-2.5 text-[11px] text-ink-muted">
        <span className="truncate">
          {[structure.public_cible, structure.stade].filter(Boolean).join(' · ')}
        </span>
        <ArrowUpRightIcon className="size-4 shrink-0 text-deep transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
      </div>
    </Link>
  )
}

function StructureCardSkeleton() {
  return (
    <div className="flex flex-col gap-3 rounded-card bg-card p-4 shadow-card ring-1 ring-border">
      <Skeleton className="h-5 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
    </div>
  )
}

function normalizeVilles(payload: Paginated<Ville> | Ville[]): Ville[] {
  const villes = Array.isArray(payload) ? payload : payload.results
  return [...villes].sort((a, b) => a.nom.localeCompare(b.nom, 'fr'))
}

export function StructureSearch() {
  const [searchParams, setSearchParams] = useSearchParams()
  const searchParam = searchParams.get('search') ?? ''
  const pays = searchParams.get('pays') ?? ALL
  const ville = searchParams.get('ville') ?? ALL
  const typologie = searchParams.get('typologie') ?? ALL
  const cible = searchParams.get('cible') ?? ALL
  const stade = searchParams.get('stade') ?? ALL
  const pageParam = Number(searchParams.get('page'))

  const page = Number.isInteger(pageParam) && pageParam > 0 ? pageParam : 1

  const [searchInput, setSearchInput] = useState(searchParam)
  const appliedSearch = useRef(searchParam)
  const [villes, setVilles] = useState<Ville[]>([])
  const [data, setData] = useState<Paginated<Structure> | null>(null)
  const [reloadKey, setReloadKey] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const hasFilters = Boolean(
    searchInput || [pays, ville, typologie, cible, stade].some((value) => value !== ALL),
  )

  const updateParam = useCallback(
    (key: string, value: string, resetPage = true) => {
      setSearchParams(
        (current) => {
          const next = new URLSearchParams(current)
          if (!value || value === ALL) next.delete(key)
          else next.set(key, value)
          if (resetPage && key !== 'page') next.delete('page')
          if (key === 'page' && value === '1') next.delete('page')
          return next
        },
        { replace: true },
      )
    },
    [setSearchParams],
  )

  useEffect(() => {
    fetchVilles()
      .then((payload) => {
        // oxlint-disable-next-line react/set-state-in-effect -- chargement de la liste des villes
        setVilles(normalizeVilles(payload))
      })
      .catch(() => {
        // La liste des villes est facultative : la recherche texte reste utilisable.
      })
  }, [])

  useEffect(() => {
    if (searchParam === appliedSearch.current) return
    appliedSearch.current = searchParam
    // oxlint-disable-next-line react/set-state-in-effect -- synchronise l'input avec l'URL
    setSearchInput(searchParam)
  }, [searchParam])

  useEffect(() => {
    const value = searchInput.trim()
    if (value === appliedSearch.current) return

    const timer = window.setTimeout(() => {
      appliedSearch.current = value
      updateParam('search', value)
    }, 300)

    return () => window.clearTimeout(timer)
  }, [searchInput, updateParam])

  useEffect(() => {
    let active = true
    // oxlint-disable-next-line react/set-state-in-effect -- synchronise l'état avec la requête réseau
    setLoading(true)
    setError(null)

    fetchStructures({
      search: searchParam || undefined,
      pays: pays === ALL ? undefined : pays,
      ville: ville === ALL ? undefined : ville,
      typologie: typologie === ALL ? undefined : typologie,
      cible: cible === ALL ? undefined : cible,
      stade: stade === ALL ? undefined : stade,
      page,
    })
      .then((result) => {
        if (active) setData(result)
      })
      .catch((cause: unknown) => {
        if (active) setError(getApiError(cause).message)
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [searchParam, pays, ville, typologie, cible, stade, page, reloadKey])

  function resetFilters() {
    setSearchInput('')
    setSearchParams(new URLSearchParams(), { replace: true })
  }

  const hasPrevious = Boolean(data?.previous)
  const hasNext = Boolean(data?.next)

  return (
    <div className="space-y-6">
      <section
        aria-label="Rechercher une structure"
        className="rounded-card bg-card p-4 shadow-filter ring-1 ring-border sm:p-5"
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="min-w-0 flex-1">
            <label htmlFor="recherche-structures" className="text-xs font-medium text-ink-muted">
              Recherche par mots-clés
            </label>
            <div className="relative mt-1">
              <SearchIcon
                className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-ink-muted"
                aria-hidden="true"
              />
              <Input
                id="recherche-structures"
                type="search"
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder="Nom, ville, service, besoin…"
                className="pl-9"
                autoComplete="off"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setReloadKey((key) => key + 1)}
              disabled={loading}
              className="gap-2"
            >
              <RefreshCwIcon className={`size-4 ${loading ? 'animate-spin' : ''}`} />
              Rafraîchir
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={resetFilters}
              disabled={!hasFilters}
            >
              Réinitialiser
            </Button>
          </div>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <SelectField
            id="filtre-pays"
            label="Pays"
            value={pays}
            onChange={(value) => updateParam('pays', value)}
            allLabel="Tous les pays"
            options={Object.entries(PAYS_LABELS).map(([value, label]) => ({ value, label }))}
          />
          <SelectField
            id="filtre-ville"
            label="Ville"
            value={ville}
            onChange={(value) => updateParam('ville', value)}
            allLabel="Toutes les villes"
            options={villes.map((item) => ({ value: item.nom, label: item.nom }))}
          />
          <SelectField
            id="filtre-typologie"
            label="Typologie"
            value={typologie}
            onChange={(value) => updateParam('typologie', value)}
            allLabel="Toutes les typologies"
            options={TYPOLOGIES}
          />
          <SelectField
            id="filtre-cible"
            label="Public cible"
            value={cible}
            onChange={(value) => updateParam('cible', value)}
            allLabel="Tous les publics"
            options={CIBLES}
          />
          <SelectField
            id="filtre-stade"
            label="Stade"
            value={stade}
            onChange={(value) => updateParam('stade', value)}
            allLabel="Tous les stades"
            options={STADES}
          />
        </div>
      </section>

      <p aria-live="polite" className="text-sm text-ink-muted">
        {data
          ? `${data.count} structure${data.count > 1 ? 's' : ''} trouvée${data.count > 1 ? 's' : ''}`
          : 'Recherche en cours…'}
        {loading && data ? ' · Mise à jour…' : ''}
      </p>

      {error && (
        <Alert variant="destructive">
          <AlertCircleIcon />
          <AlertTitle>Impossible de charger les structures</AlertTitle>
          <AlertDescription className="flex flex-col items-start gap-2">
            <span>{error}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setReloadKey((key) => key + 1)}
            >
              Réessayer
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {loading && !data && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }, (_, index) => (
            <StructureCardSkeleton key={index} />
          ))}
        </div>
      )}

      {!loading && !error && data?.results.length === 0 && (
        <div className="flex flex-col items-center gap-3 rounded-card bg-card py-12 text-center shadow-card ring-1 ring-border">
          <CompassIcon className="size-10 text-ink-muted" />
          <div>
            <p className="font-medium text-ink-strong">
              {hasFilters
                ? 'Aucune structure ne correspond à ces critères'
                : 'Aucune structure publiée pour le moment'}
            </p>
            <p className="text-sm text-ink-muted">
              {hasFilters
                ? 'Élargissez la recherche ou réinitialisez les filtres.'
                : 'Les structures apparaîtront ici après validation par l’administration.'}
            </p>
          </div>
          {hasFilters && (
            <Button variant="outline" size="sm" onClick={resetFilters}>
              Réinitialiser les filtres
            </Button>
          )}
        </div>
      )}

      {data && data.results.length > 0 && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data.results.map((structure) => (
              <StructureCard key={structure.id} structure={structure} />
            ))}
          </div>

          <div className="flex items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">Page {page}</p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={!hasPrevious || loading}
                onClick={() => updateParam('page', String(Math.max(1, page - 1)), false)}
              >
                <ChevronLeftIcon className="size-4" />
                Précédent
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={!hasNext || loading}
                onClick={() => updateParam('page', String(page + 1), false)}
              >
                Suivant
                <ChevronRightIcon className="size-4" />
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
