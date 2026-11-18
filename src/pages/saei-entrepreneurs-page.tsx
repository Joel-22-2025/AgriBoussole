import { BellIcon, SearchIcon, UserPlusIcon } from 'lucide-react'
import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { toast } from 'sonner'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useAuth } from '@/features/auth/use-auth'
import { PageHeader } from '@/features/dashboard/components/page-header'
import {
  addMembreEquipe,
  fetchSaeiEntrepreneurs,
  notifyEntrepreneur,
} from '@/lib/api/engagement'
import { PHASE_LABELS, PAYS_LABELS } from '@/lib/api/types'
import type { EntrepreneurBrief } from '@/lib/api/types'
import { useAsync } from '@/lib/use-async'
import { formatDate, mediaUrl } from '@/lib/utils'

export function SaeiEntrepreneursPage() {
  const { state } = useAuth()
  const [search, setSearch] = useState('')
  const [connectes, setConnectes] = useState(false)
  const [selected, setSelected] = useState<EntrepreneurBrief | null>(null)
  const [message, setMessage] = useState('')
  const [role, setRole] = useState('')
  const [sending, setSending] = useState(false)

  const { data, loading, error, reload } = useAsync(
    () => fetchSaeiEntrepreneurs({ search, connectes }),
    [search, connectes],
  )

  if (state.user && state.user.role !== 'SAEI') return <Navigate to="/" replace />

  async function handleNotify() {
    if (!selected || !message.trim()) return
    setSending(true)
    try {
      await notifyEntrepreneur(selected.id, message.trim())
      toast.success('Message envoyé à l’entrepreneur.')
      setMessage('')
      await reload()
    } catch {
      toast.error('Le message n’a pas pu être envoyé.')
    } finally {
      setSending(false)
    }
  }

  async function handleAddToTeam() {
    if (!selected) return
    setSending(true)
    try {
      await addMembreEquipe(selected.id, role.trim())
      toast.success('Entrepreneur ajouté à votre équipe.')
      setRole('')
      await reload()
    } catch {
      toast.error('Impossible d’ajouter cet entrepreneur à l’équipe.')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="content-container">
      <PageHeader
        eyebrow="Espace SAEI"
        title="Entrepreneurs de la plateforme"
        description="Suivez les profils, leur phase et envoyez-leur un message personnel."
      />

      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-ink-muted" />
          <Input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Nom, email ou ville…"
            className="pl-9"
          />
        </div>
        <label className="flex items-center gap-2 text-sm text-ink-body">
          <input
            type="checkbox"
            checked={connectes}
            onChange={(event) => setConnectes(event.target.checked)}
            className="size-4 accent-[var(--green-deep)]"
          />
          Connectés uniquement
        </label>
      </div>

      {error && <p className="mt-4 rounded-field bg-row px-4 py-3 text-sm">{error}</p>}

      <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_340px]">
        <div className="flex flex-col gap-3">
          {loading && !data && <p className="text-sm text-ink-muted">Chargement…</p>}
          {data?.results.length === 0 && (
            <Card>
              <CardContent className="py-10 text-center text-sm text-ink-muted">
                Aucun entrepreneur ne correspond à cette recherche.
              </CardContent>
            </Card>
          )}
          {data?.results.map((entrepreneur) => (
            <Card
              key={entrepreneur.id}
              className={`cursor-pointer transition-shadow hover:shadow-card ${
                selected?.id === entrepreneur.id ? 'ring-2 ring-brand' : ''
              }`}
            >
              <CardContent
                className="flex cursor-pointer items-center gap-3 p-4"
                onClick={() => {
                  setSelected(entrepreneur)
                  setMessage('')
                  setRole('')
                }}
              >
                <div className="flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-row">
                  {mediaUrl(entrepreneur.photo_profil) ? (
                    <img
                      src={mediaUrl(entrepreneur.photo_profil) ?? ''}
                      alt=""
                      className="size-full object-cover"
                    />
                  ) : (
                    <span className="text-sm font-semibold text-deep">
                      {entrepreneur.nom.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-ink-strong">{entrepreneur.nom}</p>
                  <p className="truncate text-xs text-ink-muted">{entrepreneur.user.email}</p>
                  <p className="text-xs text-ink-muted">
                    {entrepreneur.ville}, {PAYS_LABELS[entrepreneur.pays]}
                    {entrepreneur.user.last_login && ` · vu le ${formatDate(entrepreneur.user.last_login)}`}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <Badge variant="secondary" className="text-[11px]">
                    {entrepreneur.phase ? PHASE_LABELS[entrepreneur.phase] : 'Phase non définie'}
                  </Badge>
                  {entrepreneur.score_phase !== null && (
                    <span className="text-[11px] text-ink-muted">{entrepreneur.score_phase}/21</span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="h-fit lg:sticky lg:top-6">
          <CardHeader>
            <CardTitle className="text-base">
              {selected ? `Contacter ${selected.nom}` : 'Actions'}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {!selected ? (
              <p className="text-sm text-ink-muted">
                Sélectionnez un entrepreneur pour lui envoyer une notification ou l’ajouter à votre équipe.
              </p>
            ) : (
              <>
                <div>
                  <label htmlFor="message-entrepreneur" className="text-xs font-medium text-ink-muted">
                    Message personnel
                  </label>
                  <Textarea
                    id="message-entrepreneur"
                    value={message}
                    onChange={(event) => setMessage(event.target.value)}
                    rows={5}
                    placeholder="Bonjour…"
                    className="mt-1"
                  />
                  <Button
                    type="button"
                    className="mt-2 w-full gap-2"
                    onClick={() => void handleNotify()}
                    disabled={sending || !message.trim()}
                  >
                    <BellIcon className="size-4" />
                    Envoyer la notification
                  </Button>
                </div>
                <div className="border-t border-border pt-4">
                  <label htmlFor="role-equipe" className="text-xs font-medium text-ink-muted">
                    Rôle dans votre équipe (facultatif)
                  </label>
                  <Input
                    id="role-equipe"
                    value={role}
                    onChange={(event) => setRole(event.target.value)}
                    placeholder="Chargé de projet"
                    className="mt-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    className="mt-2 w-full gap-2"
                    onClick={() => void handleAddToTeam()}
                    disabled={sending}
                  >
                    <UserPlusIcon className="size-4" />
                    Ajouter à l’équipe
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
