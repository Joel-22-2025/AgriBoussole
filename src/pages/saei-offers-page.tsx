import { PlusIcon } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Navigate } from 'react-router-dom'
import { toast } from 'sonner'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useAuth } from '@/features/auth/use-auth'
import { PageHeader } from '@/features/dashboard/components/page-header'
import { getApiError } from '@/lib/api/errors'
import { createOffre, fetchCandidatures, fetchOffres, updateCandidatureStatut } from '@/lib/api/engagement'
import type { Candidature } from '@/lib/api/types'
import { useAsync } from '@/lib/use-async'
import { formatDate } from '@/lib/utils'

const emptyForm = {
  titre: '',
  programme: '',
  description: '',
  conditions_eligibilite: '',
  type_offre: 'Incubation',
  date_limite: '',
}

export function SaeiOffersPage() {
  const { state } = useAuth()
  const [form, setForm] = useState(emptyForm)
  const [createOpen, setCreateOpen] = useState(false)
  const [saving, setSaving] = useState(false)

  const offres = useAsync(fetchOffres, [])
  const candidatures = useAsync(fetchCandidatures, [])

  if (state.user && state.user.role !== 'SAEI') return <Navigate to="/" replace />

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSaving(true)
    try {
      await createOffre({
        ...form,
        date_limite: form.date_limite || null,
        statut: 'PUBLIEE',
      })
      toast.success('Offre publiée avec succès.')
      setForm(emptyForm)
      setCreateOpen(false)
      await offres.reload()
    } catch (cause) {
      toast.error(getApiError(cause).message)
    } finally {
      setSaving(false)
    }
  }

  async function handleStatut(candidature: Candidature, statut: string) {
    try {
      await updateCandidatureStatut(candidature.id, statut)
      toast.success('Statut de la candidature mis à jour.')
      await candidatures.reload()
    } catch (cause) {
      toast.error(getApiError(cause).message)
    }
  }

  return (
    <div className="content-container">
      <PageHeader
        eyebrow="Espace SAEI"
        title="Mes offres"
        description="Publiez des opportunités et suivez les candidatures reçues."
        actions={
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <PlusIcon className="size-4" />
                Nouvelle offre
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
              <DialogHeader>
                <DialogTitle>Créer une offre</DialogTitle>
                <DialogDescription>
                  Décrivez l’opportunité et ses conditions d’éligibilité. L’offre sera
                  visible par tous les entrepreneurs dès sa publication.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="offre-titre">Titre de l’offre</Label>
                  <Input
                    id="offre-titre"
                    required
                    value={form.titre}
                    onChange={(event) => setForm({ ...form, titre: event.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="offre-programme">Programme / filière</Label>
                  <Input
                    id="offre-programme"
                    value={form.programme}
                    onChange={(event) => setForm({ ...form, programme: event.target.value })}
                    placeholder="Ex. Incubation agri"
                  />
                </div>
                <div>
                  <Label htmlFor="offre-type">Type d’offre</Label>
                  <Input
                    id="offre-type"
                    value={form.type_offre}
                    onChange={(event) => setForm({ ...form, type_offre: event.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="offre-date">Date limite</Label>
                  <Input
                    id="offre-date"
                    type="date"
                    value={form.date_limite}
                    onChange={(event) => setForm({ ...form, date_limite: event.target.value })}
                  />
                </div>
                <div className="sm:col-span-2">
                  <Label htmlFor="offre-description">Description</Label>
                  <Textarea
                    id="offre-description"
                    required
                    rows={3}
                    value={form.description}
                    onChange={(event) => setForm({ ...form, description: event.target.value })}
                  />
                </div>
                <div className="sm:col-span-2">
                  <Label htmlFor="offre-conditions">Conditions d’éligibilité</Label>
                  <Textarea
                    id="offre-conditions"
                    required
                    rows={3}
                    value={form.conditions_eligibilite}
                    onChange={(event) => setForm({ ...form, conditions_eligibilite: event.target.value })}
                    placeholder="Ex. Avoir un projet agricole au Bénin, être entreprise déclarée…"
                  />
                </div>
                <DialogFooter className="sm:col-span-2">
                  <DialogClose asChild>
                    <Button type="button" variant="outline" disabled={saving}>Annuler</Button>
                  </DialogClose>
                  <Button type="submit" disabled={saving}>
                    {saving ? 'Publication…' : 'Publier l’offre'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <section className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold text-ink-strong">Offres publiées</h2>
          {offres.data?.results.map((offre) => (
            <Card key={offre.id}>
              <CardContent className="flex flex-col gap-2 p-4">
                <div className="flex items-start justify-between gap-3">
                  <p className="font-medium text-ink-strong">{offre.titre}</p>
                  <Badge variant="secondary" className="text-[11px]">{offre.statut}</Badge>
                </div>
                <p className="text-sm text-ink-muted">{offre.description}</p>
                <p className="text-xs text-ink-muted">
                  {offre.candidatures_count} candidature(s)
                  {offre.date_limite && ` · limite : ${formatDate(offre.date_limite)}`}
                </p>
              </CardContent>
            </Card>
          ))}
          {offres.data?.results.length === 0 && (
            <p className="text-sm text-ink-muted">Aucune offre publiée pour le moment.</p>
          )}
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold text-ink-strong">Candidatures reçues</h2>
          {candidatures.data?.results.map((candidature) => (
            <Card key={candidature.id}>
              <CardContent className="flex flex-col gap-2 p-4">
                <p className="font-medium text-ink-strong">{candidature.entrepreneur.nom}</p>
                <p className="text-xs text-ink-muted">{candidature.offre.titre}</p>
                <p className="text-sm text-ink-body">{candidature.message || 'Aucun message.'}</p>
                <div className="flex flex-wrap gap-2">
                  {(['EN_COURS', 'ACCEPTEE', 'REFUSEE'] as const).map((statut) => (
                    <Button
                      key={statut}
                      type="button"
                      size="sm"
                      variant={candidature.statut === statut ? 'default' : 'outline'}
                      onClick={() => void handleStatut(candidature, statut)}
                    >
                      {statut === 'ACCEPTEE' ? 'Accepter' : statut === 'REFUSEE' ? 'Refuser' : 'En cours'}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
          {candidatures.data?.results.length === 0 && (
            <p className="text-sm text-ink-muted">Aucune candidature reçue.</p>
          )}
        </section>
      </div>
    </div>
  )
}
