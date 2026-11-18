import {
  AlertCircleIcon,
  ExternalLinkIcon,
  MailIcon,
  MapPinIcon,
  RefreshCwIcon,
  SearchIcon,
  SparklesIcon,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button, buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { getApiError } from '@/lib/api/errors'
import { fetchPhaseRecommendations } from '@/lib/api/phase'
import {
  PAYS_LABELS,
  type EntrepreneurProfile,
  type PhaseRecommendationsResponse,
  type PhaseResult,
  type StructureRecommendation,
} from '@/lib/api/types'

function RecommendationCard({ structure }: { structure: StructureRecommendation }) {
  const location = [structure.ville_siege, structure.region_departement]
    .filter(Boolean)
    .join(', ')

  return (
    <Card className="flex flex-col" aria-label={`Structure recommandée : ${structure.nom}`}>
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <CardTitle className="text-base leading-snug">{structure.nom}</CardTitle>
            <CardDescription className="mt-1 flex items-center gap-1">
              <MapPinIcon className="size-3.5 shrink-0" />
              {location || PAYS_LABELS[structure.pays]} · {PAYS_LABELS[structure.pays]}
            </CardDescription>
          </div>
          {structure.acronyme && (
            <Badge variant="outline" className="shrink-0">
              {structure.acronyme}
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col gap-4">
        {structure.match_reasons.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {structure.match_reasons.map((reason) => (
              <Badge key={reason} variant="secondary" className="gap-1 font-normal">
                <SparklesIcon className="size-3" />
                {reason}
              </Badge>
            ))}
          </div>
        )}

        {structure.service && (
          <p className="text-sm text-muted-foreground">{structure.service}</p>
        )}

        <dl className="grid grid-cols-2 gap-2 text-xs">
          {structure.public_cible && (
            <div>
              <dt className="text-muted-foreground">Public cible</dt>
              <dd className="font-medium">{structure.public_cible}</dd>
            </div>
          )}
          {structure.stade && (
            <div>
              <dt className="text-muted-foreground">Stade</dt>
              <dd className="font-medium">{structure.stade}</dd>
            </div>
          )}
          {structure.zone_intervention && (
            <div>
              <dt className="text-muted-foreground">Zone</dt>
              <dd className="font-medium">{structure.zone_intervention}</dd>
            </div>
          )}
          {structure.typologie && (
            <div>
              <dt className="text-muted-foreground">Typologie</dt>
              <dd className="font-medium capitalize">{structure.typologie}</dd>
            </div>
          )}
        </dl>

        <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-2 border-t pt-3 text-sm">
          {structure.site_web && (
            <a
              href={structure.site_web}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 font-medium text-primary underline-offset-4 hover:underline"
            >
              <ExternalLinkIcon className="size-3.5" />
              Site web
            </a>
          )}
          {structure.email_structure && (
            <a
              href={`mailto:${structure.email_structure}`}
              className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground"
            >
              <MailIcon className="size-3.5" />
              Email
            </a>
          )}
          <Link
            to={`/structures?search=${encodeURIComponent(structure.nom)}`}
            className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground"
          >
            <SearchIcon className="size-3.5" />
            Fiche annuaire
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}

function RecommendationSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <div className="flex gap-2">
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-5 w-24" />
        </div>
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-16 w-full" />
      </CardContent>
    </Card>
  )
}

export function StructureRecommendations({
  profile,
  result,
}: {
  profile: EntrepreneurProfile
  result: PhaseResult
}) {
  const [recommendations, setRecommendations] =
    useState<PhaseRecommendationsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    let active = true
    // oxlint-disable react/set-state-in-effect -- synchronisation du chargement des recommandations
    setLoading(true)
    setError(null)
    setRecommendations(null)
    // oxlint-enable react/set-state-in-effect

    fetchPhaseRecommendations()
      .then((payload) => {
        if (active) setRecommendations(payload)
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
  }, [reloadKey])

  const pays = recommendations?.pays ?? profile.pays
  const stade = recommendations?.stade ?? result.stade
  const annuaireParams = new URLSearchParams({ pays })
  if (profile.ville) annuaireParams.set('ville', profile.ville)
  if (stade) annuaireParams.set('stade', stade)
  const annuaireHref = `/structures?${annuaireParams.toString()}`

  return (
    <section className="space-y-4" aria-labelledby="recommandations-title">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h3 id="recommandations-title" className="text-lg font-semibold">
            Structures recommandées pour vous
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Proposition automatique en {PAYS_LABELS[pays]}
            {profile.ville ? ` · ${profile.ville}` : ''}
            {stade ? ` · stade « ${stade} »` : ''}, classée par pertinence.
          </p>
        </div>
        {recommendations && (
          <Badge variant="secondary" className="w-fit shrink-0">
            {recommendations.count} structure{recommendations.count > 1 ? 's' : ''}
          </Badge>
        )}
      </div>

      {recommendations?.fallback_all_pays && (
        <Alert>
          <AlertDescription>
            Aucune structure publiée n’est enregistrée dans votre pays pour le moment. Nous
            vous proposons donc l’ensemble des structures disponibles.
          </AlertDescription>
        </Alert>
      )}

      {loading && (
        <div className="grid gap-4 md:grid-cols-2" aria-busy="true" aria-label="Chargement des recommandations">
          <RecommendationSkeleton />
          <RecommendationSkeleton />
        </div>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertCircleIcon className="size-4" />
          <AlertTitle>Recommandations indisponibles</AlertTitle>
          <AlertDescription className="flex flex-col items-start gap-3">
            <span>{error}</span>
            <Button variant="outline" size="sm" onClick={() => setReloadKey((key) => key + 1)}>
              <RefreshCwIcon className="size-4" />
              Réessayer
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {!loading && !error && recommendations?.count === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center gap-2 py-10 text-center">
            <SearchIcon className="size-6 text-muted-foreground" />
            <p className="font-medium">Aucune structure disponible</p>
            <p className="max-w-md text-sm text-muted-foreground">
              L’annuaire ne contient pas encore de structure publiée. Consultez-le
              régulièrement : de nouvelles structures sont ajoutées.
            </p>
          </CardContent>
        </Card>
      )}

      {!loading && !error && recommendations && recommendations.count > 0 && (
        <div className="grid gap-4 md:grid-cols-2">
          {recommendations.results.map((structure) => (
            <RecommendationCard key={structure.id} structure={structure} />
          ))}
        </div>
      )}

      <Link
        to={annuaireHref}
        className={buttonVariants({ variant: 'outline', size: 'sm' })}
      >
        <SearchIcon className="size-4" />
        Affiner dans l’annuaire
      </Link>
    </section>
  )
}
