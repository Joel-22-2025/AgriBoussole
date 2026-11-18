import { HeartIcon, MessageCircleIcon, SendIcon, TrendingUpIcon } from 'lucide-react'
import { useState, type FormEvent } from 'react'
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
import {
  addCommentaire,
  createIndicateur,
  fetchCommentaires,
  fetchIndicateurs,
  toggleLike,
} from '@/lib/api/engagement'
import type { Commentaire, Indicateur } from '@/lib/api/types'
import { getApiError } from '@/lib/api/errors'
import { useAsync } from '@/lib/use-async'
import { formatDate, mediaUrl } from '@/lib/utils'

const fileClass =
  'w-full text-xs text-ink-muted file:mr-3 file:rounded-pill file:border-0 file:bg-row file:px-3 file:py-2 file:text-xs file:font-medium file:text-deep file:cursor-pointer'

interface IndicatorFeedProps {
  showCreate?: boolean
}

export function IndicatorFeed({ showCreate = false }: IndicatorFeedProps) {
  const { data, loading, error, reload } = useAsync(fetchIndicateurs, [])
  const [form, setForm] = useState({ titre: '', contenu: '', type_media: 'TEXTE' })
  const [media, setMedia] = useState<File | null>(null)
  const [createOpen, setCreateOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [openComments, setOpenComments] = useState<number | null>(null)
  const [comments, setComments] = useState<Record<number, Commentaire[]>>({})
  const [drafts, setDrafts] = useState<Record<number, string>>({})

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSaving(true)
    try {
      const payload = new FormData()
      payload.append('titre', form.titre)
      payload.append('contenu', form.contenu)
      payload.append('type_media', form.type_media)
      if (media) payload.append('media', media)
      await createIndicateur(payload)
      toast.success('Indicateur publié.')
      setForm({ titre: '', contenu: '', type_media: 'TEXTE' })
      setMedia(null)
      setCreateOpen(false)
      await reload()
    } catch (cause) {
      toast.error(getApiError(cause).message)
    } finally {
      setSaving(false)
    }
  }

  async function handleLike(indicateur: Indicateur) {
    try {
      await toggleLike(indicateur.id)
      await reload()
    } catch (cause) {
      toast.error(getApiError(cause).message)
    }
  }

  async function handleToggleComments(indicateur: Indicateur) {
    if (openComments === indicateur.id) {
      setOpenComments(null)
      return
    }
    setOpenComments(indicateur.id)
    try {
      const result = await fetchCommentaires(indicateur.id)
      setComments((current) => ({ ...current, [indicateur.id]: result.results }))
    } catch {
      toast.error('Impossible de charger les commentaires.')
    }
  }

  async function handleComment(event: FormEvent<HTMLFormElement>, indicateur: Indicateur) {
    event.preventDefault()
    const contenu = (drafts[indicateur.id] ?? '').trim()
    if (!contenu) return
    try {
      const created = await addCommentaire(indicateur.id, contenu)
      setComments((current) => ({
        ...current,
        [indicateur.id]: [...(current[indicateur.id] ?? []), created],
      }))
      setDrafts((current) => ({ ...current, [indicateur.id]: '' }))
      await reload()
    } catch (cause) {
      toast.error(getApiError(cause).message)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {showCreate && (
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button className="w-fit gap-2">
              <TrendingUpIcon className="size-4" />
              Publier un indicateur
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>Publier un indicateur</DialogTitle>
              <DialogDescription>
                Partagez un résultat sous forme de texte, d’image ou de vidéo avec les
                entrepreneurs de la plateforme.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreate} className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label htmlFor="indicateur-titre" className="text-xs font-medium text-ink-muted">
                  Titre *
                </label>
                <Input
                  id="indicateur-titre"
                  required
                  className="mt-1"
                  value={form.titre}
                  onChange={(event) => setForm({ ...form, titre: event.target.value })}
                  placeholder="Ex. Taux d’insertion des jeunes accompagnés"
                />
              </div>
              <div>
                <label htmlFor="indicateur-type" className="text-xs font-medium text-ink-muted">
                  Type de média
                </label>
                <select
                  id="indicateur-type"
                  className="mt-1 h-10 w-full rounded-field border border-border bg-field px-3 text-sm text-ink-body focus-visible:border-brand focus-visible:outline-none"
                  value={form.type_media}
                  onChange={(event) => setForm({ ...form, type_media: event.target.value })}
                >
                  <option value="TEXTE">Texte</option>
                  <option value="IMAGE">Image</option>
                  <option value="VIDEO">Vidéo</option>
                </select>
              </div>
              <div>
                <label htmlFor="indicateur-media" className="text-xs font-medium text-ink-muted">
                  Fichier (image ou vidéo)
                </label>
                <input
                  id="indicateur-media"
                  type="file"
                  accept={form.type_media === 'VIDEO' ? 'video/*' : 'image/*'}
                  className={`mt-1 ${fileClass}`}
                  onChange={(event) => setMedia(event.target.files?.[0] ?? null)}
                />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="indicateur-contenu" className="text-xs font-medium text-ink-muted">
                  Contenu *
                </label>
                <Textarea
                  id="indicateur-contenu"
                  required
                  rows={4}
                  className="mt-1"
                  value={form.contenu}
                  onChange={(event) => setForm({ ...form, contenu: event.target.value })}
                  placeholder="Présentez le résultat, la méthode et la période concernée…"
                />
              </div>
              <DialogFooter className="sm:col-span-2">
                <DialogClose asChild>
                  <Button type="button" variant="outline" disabled={saving}>Annuler</Button>
                </DialogClose>
                <Button type="submit" disabled={saving} className="gap-2">
                  <SendIcon className="size-4" />
                  {saving ? 'Publication…' : 'Publier'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {error && <p className="rounded-field bg-row px-4 py-3 text-sm text-ink-body">{error}</p>}
      {loading && !data && <p className="text-sm text-ink-muted">Chargement des indicateurs…</p>}
      {data?.results.length === 0 && (
        <Card>
          <CardContent className="py-10 text-center text-sm text-ink-muted">
            Aucun indicateur publié pour le moment.
          </CardContent>
        </Card>
      )}

      {data?.results.map((indicateur) => (
        <Card key={indicateur.id}>
          <CardHeader className="pb-3">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <CardTitle className="text-base">{indicateur.titre}</CardTitle>
              <Badge variant="secondary" className="text-[10px]">
                {indicateur.type_media}
              </Badge>
            </div>
            <p className="text-xs text-ink-muted">
              {indicateur.saei.nom_structure ?? indicateur.saei.nom_structure_demandee} ·{' '}
              {formatDate(indicateur.created_at)}
            </p>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <p className="whitespace-pre-line text-sm leading-relaxed text-ink-body">
              {indicateur.contenu}
            </p>
            {indicateur.type_media === 'IMAGE' && mediaUrl(indicateur.media) && (
              <img
                src={mediaUrl(indicateur.media) ?? ''}
                alt={indicateur.titre}
                className="max-h-80 w-full rounded-field object-cover"
              />
            )}
            {indicateur.type_media === 'VIDEO' && mediaUrl(indicateur.media) && (
              <video src={mediaUrl(indicateur.media) ?? ''} controls className="max-h-96 w-full rounded-field" />
            )}

            <div className="flex items-center gap-2 border-t border-border pt-3">
              <Button
                type="button"
                size="sm"
                variant={indicateur.liked_by_me ? 'default' : 'outline'}
                onClick={() => void handleLike(indicateur)}
                className="gap-1.5"
                aria-label={indicateur.liked_by_me ? 'Retirer le like' : 'Ajouter un like'}
              >
                <HeartIcon className="size-4" />
                {indicateur.likes_count}
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => void handleToggleComments(indicateur)}
                className="gap-1.5"
              >
                <MessageCircleIcon className="size-4" />
                {indicateur.commentaires.length}
              </Button>
            </div>

            {openComments === indicateur.id && (
              <div className="flex flex-col gap-3 rounded-field bg-row p-3">
                {(comments[indicateur.id] ?? indicateur.commentaires).map((commentaire) => (
                  <div key={commentaire.id} className="text-sm">
                    <p className="font-medium text-ink-strong">{commentaire.auteur}</p>
                    <p className="text-ink-body">{commentaire.contenu}</p>
                    <p className="text-[11px] text-ink-muted">{formatDate(commentaire.created_at)}</p>
                  </div>
                ))}
                {(comments[indicateur.id] ?? indicateur.commentaires).length === 0 && (
                  <p className="text-xs text-ink-muted">Soyez le premier à commenter.</p>
                )}
                <form onSubmit={(event) => handleComment(event, indicateur)} className="flex gap-2">
                  <Input
                    value={drafts[indicateur.id] ?? ''}
                    onChange={(event) =>
                      setDrafts((current) => ({ ...current, [indicateur.id]: event.target.value }))
                    }
                    placeholder="Ajouter un commentaire…"
                    aria-label="Votre commentaire"
                  />
                  <Button type="submit" size="icon" aria-label="Envoyer le commentaire">
                    <SendIcon className="size-4" />
                  </Button>
                </form>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
