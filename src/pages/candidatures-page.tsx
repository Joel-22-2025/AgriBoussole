import { ClipboardListIcon } from 'lucide-react'
import { Navigate } from 'react-router-dom'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { useAuth } from '@/features/auth/use-auth'
import { PageHeader } from '@/features/dashboard/components/page-header'
import { fetchCandidatures } from '@/lib/api/engagement'
import type { Candidature } from '@/lib/api/types'
import { useAsync } from '@/lib/use-async'
import { formatDate } from '@/lib/utils'

const STATUT_LABELS: Record<Candidature['statut'], string> = {
  ENVOYEE: 'Envoyée',
  EN_COURS: 'En cours d’examen',
  ACCEPTEE: 'Acceptée',
  REFUSEE: 'Refusée',
}

export function CandidaturesPage() {
  const { state } = useAuth()
  const { data, loading, error } = useAsync(fetchCandidatures, [])

  if (state.user && state.user.role !== 'ENTREPRENEUR') return <Navigate to="/" replace />

  return (
    <div className="content-container">
      <PageHeader
        eyebrow="Entrepreneurs"
        title="Mes candidatures"
        description="Suivez l’avancement de vos demandes auprès des structures SAEI."
      />

      <div className="mt-5 flex max-w-3xl flex-col gap-3">
        {loading && !data && <p className="text-sm text-ink-muted">Chargement…</p>}
        {error && <p className="rounded-field bg-row px-4 py-3 text-sm text-ink-body">{error}</p>}
        {data?.results.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
              <ClipboardListIcon className="size-10 text-ink-muted" />
              <p className="text-sm text-ink-muted">Vous n’avez pas encore postulé à une offre.</p>
            </CardContent>
          </Card>
        )}
        {data?.results.map((candidature) => (
          <Card key={candidature.id}>
            <CardContent className="flex flex-col gap-3 p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-semibold text-ink-strong">{candidature.offre.titre}</p>
                  <p className="text-xs text-ink-muted">
                    {candidature.offre.saei.nom_structure ?? candidature.offre.saei.nom_structure_demandee}
                  </p>
                </div>
                <Badge variant="secondary" className="text-[11px]">
                  {STATUT_LABELS[candidature.statut]}
                </Badge>
              </div>
              {candidature.message && <p className="text-sm text-ink-body">{candidature.message}</p>}
              <p className="text-[11px] text-ink-muted">Envoyée le {formatDate(candidature.created_at)}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
