import { PlusIcon, Trash2Icon, UserRoundPlusIcon } from 'lucide-react'
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
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useAuth } from '@/features/auth/use-auth'
import { PageHeader } from '@/features/dashboard/components/page-header'
import { getApiError } from '@/lib/api/errors'
import {
  addMembreEquipe,
  createTache,
  fetchEquipe,
  fetchEvaluations,
  fetchTaches,
  fetchSaeiEntrepreneurs,
  removeMembreEquipe,
  updateTacheStatut,
} from '@/lib/api/engagement'
import type { MembreEquipe, Tache } from '@/lib/api/types'
import { useAsync } from '@/lib/use-async'
import { formatDate } from '@/lib/utils'

const selectClass =
  'h-10 w-full rounded-field border border-border bg-field px-3 text-sm text-ink-body focus-visible:border-brand focus-visible:ring-3 focus-visible:ring-brand/30 focus-visible:outline-none'

const STATUTS: Array<{ value: Tache['statut']; label: string }> = [
  { value: 'A_FAIRE', label: 'À faire' },
  { value: 'EN_COURS', label: 'En cours' },
  { value: 'TERMINEE', label: 'Terminée' },
]

export function SaeiTeamPage() {
  const { state } = useAuth()
  const equipe = useAsync(fetchEquipe, [])
  const taches = useAsync(fetchTaches, [])
  const evaluations = useAsync(fetchEvaluations, [])
  const entrepreneurs = useAsync(() => fetchSaeiEntrepreneurs({}), [])

  const [entrepreneurId, setEntrepreneurId] = useState('')
  const [role, setRole] = useState('')
  const [membreId, setMembreId] = useState('')
  const [titre, setTitre] = useState('')
  const [description, setDescription] = useState('')
  const [typeTache, setTypeTache] = useState<Tache['type_tache']>('TACHE')
  const [dateEcheance, setDateEcheance] = useState('')
  const [memberOpen, setMemberOpen] = useState(false)
  const [taskOpen, setTaskOpen] = useState(false)
  const [saving, setSaving] = useState(false)

  if (state.user && state.user.role !== 'SAEI') return <Navigate to="/" replace />

  async function handleAddMember(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!entrepreneurId) return
    setSaving(true)
    try {
      await addMembreEquipe(Number(entrepreneurId), role)
      toast.success('Membre ajouté à l’équipe.')
      setEntrepreneurId('')
      setRole('')
      setMemberOpen(false)
      await equipe.reload()
    } catch (cause) {
      toast.error(getApiError(cause).message)
    } finally {
      setSaving(false)
    }
  }

  async function handleRemoveMember(membre: MembreEquipe) {
    try {
      await removeMembreEquipe(membre.id)
      toast.success('Membre retiré de l’équipe.')
      await equipe.reload()
      await taches.reload()
    } catch (cause) {
      toast.error(getApiError(cause).message)
    }
  }

  async function handleCreateTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!membreId) {
      toast.error('Sélectionnez un membre de l’équipe.')
      return
    }
    setSaving(true)
    try {
      await createTache({
        membre: Number(membreId),
        titre,
        description,
        type_tache: typeTache,
        statut: 'A_FAIRE',
        date_echeance: dateEcheance || null,
      })
      toast.success('Tâche ou formation créée.')
      setTitre('')
      setDescription('')
      setDateEcheance('')
      setTaskOpen(false)
      await taches.reload()
      await equipe.reload()
    } catch (cause) {
      toast.error(getApiError(cause).message)
    } finally {
      setSaving(false)
    }
  }

  async function handleStatut(tache: Tache, statut: Tache['statut']) {
    try {
      await updateTacheStatut(tache.id, statut)
      await taches.reload()
    } catch (cause) {
      toast.error(getApiError(cause).message)
    }
  }

  return (
    <div className="content-container">
      <PageHeader
        eyebrow="Espace SAEI"
        title="Équipe et formations"
        description="Constituez votre équipe, répartissez les tâches et suivez les évaluations des entrepreneurs."
      />

      <div className="mt-5 flex flex-wrap gap-2">
        <Dialog open={memberOpen} onOpenChange={setMemberOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="gap-2">
              <UserRoundPlusIcon className="size-4" />
              Ajouter un membre
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Ajouter un membre à l’équipe</DialogTitle>
              <DialogDescription>
                L’entrepreneur ajouté pourra recevoir des tâches et être évalué.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddMember} className="flex flex-col gap-3">
              <select className={selectClass} value={entrepreneurId} onChange={(e) => setEntrepreneurId(e.target.value)}>
                <option value="">Sélectionner un entrepreneur</option>
                {entrepreneurs.data?.results.map((entrepreneur) => (
                  <option key={entrepreneur.id} value={entrepreneur.id}>
                    {entrepreneur.nom} — {entrepreneur.user.email}
                  </option>
                ))}
              </select>
              <Input value={role} onChange={(e) => setRole(e.target.value)} placeholder="Rôle (ex. Chargé de projet)" />
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="outline" disabled={saving}>Annuler</Button>
                </DialogClose>
                <Button type="submit" disabled={saving || !entrepreneurId} className="gap-2">
                  <PlusIcon className="size-4" />
                  Ajouter
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        <Dialog open={taskOpen} onOpenChange={setTaskOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="gap-2">
              <PlusIcon className="size-4" />
              Créer une tâche ou une formation
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
            <DialogHeader>
              <DialogTitle>Nouvelle tâche ou formation</DialogTitle>
              <DialogDescription>
                Affectez une action à un membre de votre équipe et fixez, si besoin, une échéance.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateTask} className="grid gap-3 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="text-xs font-medium text-ink-muted" htmlFor="tache-membre">Membre</label>
                <select id="tache-membre" className={selectClass} value={membreId} onChange={(e) => setMembreId(e.target.value)}>
                  <option value="">Sélectionner un membre</option>
                  {equipe.data?.results.map((membre) => (
                    <option key={membre.id} value={membre.id}>
                      {membre.entrepreneur.nom}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-ink-muted" htmlFor="tache-titre">Titre</label>
                <Input id="tache-titre" required value={titre} onChange={(e) => setTitre(e.target.value)} />
              </div>
              <div>
                <label className="text-xs font-medium text-ink-muted" htmlFor="tache-type">Type</label>
                <select id="tache-type" className={selectClass} value={typeTache} onChange={(e) => setTypeTache(e.target.value as Tache['type_tache'])}>
                  <option value="TACHE">Tâche</option>
                  <option value="FORMATION">Formation</option>
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs font-medium text-ink-muted" htmlFor="tache-echeance">Date d’échéance</label>
                <Input id="tache-echeance" type="date" value={dateEcheance} onChange={(e) => setDateEcheance(e.target.value)} />
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs font-medium text-ink-muted" htmlFor="tache-description">Description (facultatif)</label>
                <Textarea id="tache-description" rows={2} value={description} onChange={(e) => setDescription(e.target.value)} />
              </div>
              <DialogFooter className="sm:col-span-2">
                <DialogClose asChild>
                  <Button type="button" variant="outline" disabled={saving}>Annuler</Button>
                </DialogClose>
                <Button type="submit" disabled={saving}>Créer</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <section className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold text-ink-strong">Membres de l’équipe</h2>
          {equipe.data?.results.length === 0 && (
            <Card><CardContent className="py-8 text-center text-sm text-ink-muted">Aucun membre pour le moment.</CardContent></Card>
          )}
          {equipe.data?.results.map((membre) => (
            <Card key={membre.id}>
              <CardContent className="flex items-center gap-3 p-4">
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-ink-strong">{membre.entrepreneur.nom}</p>
                  <p className="text-xs text-ink-muted">
                    {membre.role || 'Membre'} · {membre.taches_count} tâche(s)
                  </p>
                </div>
                <Badge variant="secondary" className="text-[11px]">
                  {membre.note_moyenne !== null ? `${membre.note_moyenne}/5` : 'Non noté'}
                </Badge>
                <Button type="button" size="icon" variant="ghost" aria-label={`Retirer ${membre.entrepreneur.nom}`} onClick={() => void handleRemoveMember(membre)}>
                  <Trash2Icon className="size-4 text-ink-muted" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold text-ink-strong">Tâches et formations</h2>
          {taches.data?.results.length === 0 && (
            <Card><CardContent className="py-8 text-center text-sm text-ink-muted">Aucune tâche pour le moment.</CardContent></Card>
          )}
          {taches.data?.results.map((tache) => (
            <Card key={tache.id}>
              <CardContent className="flex flex-col gap-2 p-4">
                <div className="flex items-start justify-between gap-3">
                  <p className="font-medium text-ink-strong">{tache.titre}</p>
                  <Badge variant="outline" className="text-[10px]">{tache.type_tache}</Badge>
                </div>
                <p className="text-xs text-ink-muted">
                  {tache.membre_detail.entrepreneur.nom}
                  {tache.date_echeance && ` · échéance : ${formatDate(tache.date_echeance)}`}
                </p>
                {tache.description && <p className="text-sm text-ink-body">{tache.description}</p>}
                <div className="flex flex-wrap gap-1.5">
                  {STATUTS.map(({ value, label }) => (
                    <Button key={value} type="button" size="sm" variant={tache.statut === value ? 'default' : 'outline'} onClick={() => void handleStatut(tache, value)}>
                      {label}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </section>
      </div>

      <Card className="mt-5">
        <CardHeader>
          <CardTitle className="text-base">Évaluations reçues</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {evaluations.data?.results.length === 0 && (
            <p className="text-sm text-ink-muted">Aucune évaluation pour le moment.</p>
          )}
          {evaluations.data?.results.map((evaluation) => (
            <div key={evaluation.id} className="rounded-field bg-row p-3 text-sm">
              <div className="flex items-center justify-between gap-3">
                <p className="font-medium text-ink-strong">{evaluation.entrepreneur.nom}</p>
                <Badge variant="secondary">{evaluation.note}/5</Badge>
              </div>
              {evaluation.commentaire && <p className="mt-1 text-ink-body">{evaluation.commentaire}</p>}
              <p className="mt-1 text-[11px] text-ink-muted">{formatDate(evaluation.created_at)}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
