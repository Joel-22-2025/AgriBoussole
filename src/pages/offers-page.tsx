import { BriefcaseBusinessIcon, CalendarDaysIcon, CheckCircle2Icon, SendIcon } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Navigate } from 'react-router-dom'
import { toast } from 'sonner'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { useAuth } from '@/features/auth/use-auth'
import { PageHeader } from '@/features/dashboard/components/page-header'
import { getApiError } from '@/lib/api/errors'
import { createCandidature, fetchCandidatures, fetchOffres } from '@/lib/api/engagement'
import type { Offre } from '@/lib/api/types'
import { useAsync } from '@/lib/use-async'
import { formatDate } from '@/lib/utils'

export function OffersPage() {
  const { state } = useAuth()
  const offres = useAsync(fetchOffres, [])
  const candidatures = useAsync(fetchCandidatures, [])
  const [selected, setSelected] = useState<Offre | null>(null)
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)

  if (state.user && state.user.role !== 'ENTREPRENEUR') return <Navigate to="/" replace />

  const appliedIds = new Set(candidatures.data?.results.map((item) => item.offre.id) ?? [])

  function closeDialog(open: boolean) {
    if (!open) {
      setSelected(null)
      setMessage('')
    }
  }

  async function handleApply(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!selected) return
    setSending(true)
    try {
      await createCandidature(selected.id, message)
      toast.success('Votre candidature a bien été envoyée.')
      closeDialog(false)
      await candidatures.reload()
      await offres.reload()
    } catch (cause) {
      toast.error(getApiError(cause).message)
    } finally {
      setSending(false)
    }
  }

  return (
    <Dialog open={Boolean(selected)} onOpenChange={closeDialog}>
      <div className="content-container">
        <PageHeader
          eyebrow="Entrepreneurs"
          title="Offres des SAEI"
          description="Découvrez les programmes d’accompagnement et postulez en quelques clics."
        />

        <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_320px]">
          <div className="flex flex-col gap-3">
            {offres.loading && !offres.data && <p className="text-sm text-ink-muted">Chargement des offres…</p>}
            {offres.error && <p className="rounded-field bg-row px-4 py-3 text-sm text-ink-body">{offres.error}</p>}
            {offres.data?.results.length === 0 && (
              <Card><CardContent className="py-10 text-center text-sm text-ink-muted">Aucune offre ouverte pour le moment.</CardContent></Card>
            )}
            {offres.data?.results.map((offre) => {
              const applied = appliedIds.has(offre.id)
              return (
                <Card key={offre.id}>
                  <CardContent className="flex flex-col gap-3 p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h2 className="font-semibold text-ink-strong">{offre.titre}</h2>
                        <p className="text-xs text-ink-muted">
                          {offre.saei.nom_structure ?? offre.saei.nom_structure_demandee}
                          {offre.programme && ` · ${offre.programme}`}
                        </p>
                      </div>
                      <Badge variant="secondary" className="text-[10px]">{offre.type_offre}</Badge>
                    </div>

                    <p className="text-sm text-ink-body">{offre.description}</p>

                    <div className="rounded-field bg-row p-3">
                      <p className="text-xs font-medium text-deep">Conditions d’éligibilité</p>
                      <p className="mt-1 whitespace-pre-line text-xs text-ink-body">
                        {offre.conditions_eligibilite}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <p className="flex items-center gap-1.5 text-xs text-ink-muted">
                        <CalendarDaysIcon className="size-4" />
                        {offre.date_limite ? `Limite : ${formatDate(offre.date_limite)}` : 'Sans date limite'}
                      </p>
                      {applied ? (
                        <Badge variant="secondary" className="gap-1 text-[11px]">
                          <CheckCircle2Icon className="size-3.5" />
                          Candidature envoyée
                        </Badge>
                      ) : (
                        <Button
                          type="button"
                          size="sm"
                          onClick={() => { setSelected(offre); setMessage('') }}
                          className="gap-2"
                        >
                          <BriefcaseBusinessIcon className="size-4" />
                          Postuler
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          <Card className="h-fit">
            <CardHeader>
              <CardTitle className="text-base">Mes candidatures</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              {candidatures.data?.results.length === 0 && (
                <p className="text-sm text-ink-muted">Vous n’avez pas encore postulé.</p>
              )}
              {candidatures.data?.results.map((candidature) => (
                <div key={candidature.id} className="rounded-field bg-row p-3">
                  <p className="truncate text-sm font-medium text-ink-strong">{candidature.offre.titre}</p>
                  <div className="mt-1 flex items-center justify-between gap-2">
                    <p className="text-[11px] text-ink-muted">{formatDate(candidature.created_at)}</p>
                    <Badge variant="secondary" className="text-[10px]">{candidature.statut}</Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Postuler à une offre</DialogTitle>
          <DialogDescription>
            {selected
              ? `Votre candidature sera transmise à ${selected.saei.nom_structure ?? selected.saei.nom_structure_demandee} pour l’offre « ${selected.titre} ».`
              : 'Décrivez votre projet en quelques lignes.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleApply} className="flex flex-col gap-3">
          <label htmlFor="candidature-message" className="text-xs font-medium text-ink-muted">
            Votre message à la structure *
          </label>
          <Textarea
            id="candidature-message"
            required
            rows={5}
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder="Présentez votre projet et expliquez pourquoi cette offre vous intéresse…"
          />
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline" disabled={sending}>Annuler</Button>
            </DialogClose>
            <Button type="submit" disabled={sending} className="gap-2">
              <SendIcon className="size-4" />
              {sending ? 'Envoi en cours…' : 'Envoyer ma candidature'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
