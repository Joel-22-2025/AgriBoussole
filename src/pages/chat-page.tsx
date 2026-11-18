import { MessageSquareIcon, SendIcon, StarIcon } from 'lucide-react'
import { useEffect, useRef, useState, type FormEvent } from 'react'
import { useSearchParams } from 'react-router-dom'
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
import { PageHeader } from '@/features/dashboard/components/page-header'
import { getApiError } from '@/lib/api/errors'
import {
  createEvaluation,
  fetchConversations,
  fetchEvaluations,
  fetchMessages,
  sendMessage,
} from '@/lib/api/engagement'
import type { ChatMessage, Conversation } from '@/lib/api/types'
import { useAsync } from '@/lib/use-async'
import { formatDate } from '@/lib/utils'

function Chat({ saei = false }: { saei?: boolean }) {
  const [searchParams] = useSearchParams()
  const preselected = Number(searchParams.get('conversation'))
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedId, setSelectedId] = useState<number | null>(
    Number.isInteger(preselected) && preselected > 0 ? preselected : null,
  )
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const lastIdRef = useRef<number | undefined>(undefined)
  const loadMessagesRef = useRef<() => Promise<void>>(() => Promise.resolve())
  const bottomRef = useRef<HTMLDivElement | null>(null)

  const evaluations = useAsync(fetchEvaluations, [])
  const [note, setNote] = useState(0)
  const [commentaire, setCommentaire] = useState('')
  const [rating, setRating] = useState(false)
  const [ratingOpen, setRatingOpen] = useState(false)

  useEffect(() => {
    let active = true
    fetchConversations()
      .then((result) => {
        if (!active) return
        setConversations(result.results)
        setSelectedId((current) => current ?? result.results[0]?.id ?? null)
      })
      .catch((cause: unknown) => toast.error(getApiError(cause).message))
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    if (!selectedId) return
    const conversationId = selectedId
    let active = true
    lastIdRef.current = undefined

    async function load() {
      try {
        const result = await fetchMessages(conversationId, lastIdRef.current)
        if (!active || result.results.length === 0) return
        setMessages((current) => {
          const known = new Set(current.map((item) => item.id))
          return [...current, ...result.results.filter((item) => !known.has(item.id))]
        })
        lastIdRef.current = result.results[result.results.length - 1].id
      } catch {
        // Le polling silencieux évite d'inonder l'utilisateur de messages d'erreur.
      }
    }

    loadMessagesRef.current = load
    void load()
    const timer = window.setInterval(() => void load(), 5000)
    return () => {
      active = false
      window.clearInterval(timer)
    }
  }, [selectedId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length])

  const selected = conversations.find((conversation) => conversation.id === selectedId) ?? null

  async function handleSend(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!selectedId || !content.trim()) return
    setSending(true)
    try {
      await sendMessage(selectedId, content.trim())
      setContent('')
      await loadMessagesRef.current()
    } catch (cause) {
      toast.error(getApiError(cause).message)
    } finally {
      setSending(false)
    }
  }

  async function handleEvaluation(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!selected || note === 0) {
      toast.error('Sélectionnez une note de 1 à 5 étoiles.')
      return
    }
    setRating(true)
    try {
      await createEvaluation({ saei_id: selected.saei.id, note, commentaire })
      toast.success('Merci pour votre évaluation !')
      setNote(0)
      setCommentaire('')
      setRatingOpen(false)
      await evaluations.reload()
    } catch (cause) {
      toast.error(getApiError(cause).message)
    } finally {
      setRating(false)
    }
  }

  return (
    <Dialog open={ratingOpen} onOpenChange={setRatingOpen}>
    <div className="content-container">
      <PageHeader
        eyebrow={saei ? 'Espace SAEI' : 'Entrepreneurs'}
        title="Messagerie"
        description="Échangez directement avec les entrepreneurs et les structures accompagnantes."
      />

      <div className="mt-5 grid gap-4 lg:grid-cols-[300px_1fr]">
        <Card className="h-fit">
          <CardHeader>
            <CardTitle className="text-base">Conversations</CardTitle>
          </CardHeader>
          <CardContent className="flex max-h-[60vh] flex-col gap-2 overflow-y-auto p-2">
            {loading && <p className="p-2 text-sm text-ink-muted">Chargement…</p>}
            {!loading && conversations.length === 0 && (
              <p className="p-2 text-sm text-ink-muted">
                Aucune conversation. Écrivez à une structure depuis sa fiche pour en démarrer une.
              </p>
            )}
            {conversations.map((conversation) => {
              const title = saei
                ? conversation.entrepreneur.nom
                : (conversation.saei.nom_structure ?? conversation.saei.nom_structure_demandee)
              return (
                <button
                  key={conversation.id}
                  type="button"
                  onClick={() => {
                    setSelectedId(conversation.id)
                    setMessages([])
                  }}
                  className={`flex w-full flex-col gap-1 rounded-field p-3 text-left transition-colors hover:bg-row ${selectedId === conversation.id ? 'bg-live' : ''}`}
                >
                  <span className="flex items-center justify-between gap-2">
                    <span className="truncate text-sm font-medium text-ink-strong">{title}</span>
                    {conversation.unread_count > 0 && (
                      <Badge variant="secondary" className="text-[10px]">{conversation.unread_count}</Badge>
                    )}
                  </span>
                  <span className="truncate text-xs text-ink-muted">{conversation.sujet}</span>
                  {conversation.last_message && (
                    <span className="truncate text-[11px] text-ink-muted">
                      {conversation.last_message.content}
                    </span>
                  )}
                </button>
              )
            })}
          </CardContent>
        </Card>

        <div className="flex flex-col gap-4">
          <Card className="flex min-h-[420px] flex-col">
            <CardHeader className="border-b border-border py-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <MessageSquareIcon className="size-4 text-brand-hover" />
                {selected
                  ? saei
                    ? selected.entrepreneur.nom
                    : (selected.saei.nom_structure ?? selected.saei.nom_structure_demandee)
                  : 'Aucune conversation sélectionnée'}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col gap-3 pt-4">
              <div className="flex max-h-[46vh] flex-1 flex-col gap-3 overflow-y-auto pr-1">
                {messages.length === 0 && (
                  <p className="py-8 text-center text-sm text-ink-muted">
                    Aucun message dans cette conversation.
                  </p>
                )}
                {messages.map((message) => (
                  <div key={message.id} className={`flex ${message.is_mine ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] rounded-card px-3 py-2 text-sm ${message.is_mine ? 'bg-deep text-white' : 'bg-row text-ink-body'}`}>
                      <p className="whitespace-pre-line">{message.content}</p>
                      <p className={`mt-1 text-[10px] ${message.is_mine ? 'text-white/70' : 'text-ink-muted'}`}>
                        {message.sender_name} · {formatDate(message.created_at)}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={bottomRef} />
              </div>

              <form onSubmit={handleSend} className="flex items-end gap-2 border-t border-border pt-3">
                <Textarea
                  rows={2}
                  value={content}
                  onChange={(event) => setContent(event.target.value)}
                  placeholder="Écrivez votre message…"
                  aria-label="Votre message"
                  className="flex-1"
                />
                <Button type="submit" size="icon" disabled={sending || !content.trim()} aria-label="Envoyer le message">
                  <SendIcon className="size-4" />
                </Button>
              </form>
            </CardContent>
          </Card>

          {!saei && selected && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between gap-3 text-base">
                  Évaluer l’équipe SAEI
                  <DialogTrigger asChild>
                    <Button type="button" size="sm" variant="outline" className="gap-2">
                      <StarIcon className="size-4" />
                      Donner mon avis
                    </Button>
                  </DialogTrigger>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {evaluations.data?.results.length ? (
                  <div className="mt-4 flex flex-col gap-2 border-t border-border pt-3">
                    <p className="text-xs font-medium text-ink-muted">Mes évaluations</p>
                    {evaluations.data.results.map((evaluation) => (
                      <div key={evaluation.id} className="flex items-center justify-between gap-2 text-sm">
                        <span className="truncate text-ink-body">
                          {evaluation.saei.nom_structure ?? evaluation.saei.nom_structure_demandee}
                        </span>
                        <Badge variant="secondary" className="text-[10px]">{evaluation.note}/5</Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-ink-muted">
                    Vous n’avez pas encore évalué cette structure.
                  </p>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Évaluer l’équipe SAEI</DialogTitle>
          <DialogDescription>
            Votre avis aide les autres entrepreneurs à choisir leur structure
            d’accompagnement.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleEvaluation} className="flex flex-col gap-3">
          <div className="flex items-center gap-1" role="group" aria-label="Note sur 5 étoiles">
            {[1, 2, 3, 4, 5].map((value) => (
              <button key={value} type="button" onClick={() => setNote(value)} aria-label={`${value} étoile(s)`}>
                <StarIcon
                  className={`size-7 ${value <= note ? 'fill-[var(--green-accent)] text-brand-hover' : 'text-ink-muted'}`}
                />
              </button>
            ))}
            <span className="ml-2 text-xs text-ink-muted">{note > 0 ? `${note}/5` : 'Non noté'}</span>
          </div>
          <Input
            value={selected?.saei.nom_structure ?? selected?.saei.nom_structure_demandee ?? ''}
            readOnly
            aria-label="Structure évaluée"
            className="bg-row"
          />
          <label htmlFor="evaluation-commentaire" className="text-xs font-medium text-ink-muted">
            Commentaire (facultatif)
          </label>
          <Textarea
            id="evaluation-commentaire"
            rows={3}
            value={commentaire}
            onChange={(event) => setCommentaire(event.target.value)}
            placeholder="Partagez votre expérience avec cette équipe…"
          />
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline" disabled={rating}>Annuler</Button>
            </DialogClose>
            <Button type="submit" disabled={rating} className="gap-2">
              <StarIcon className="size-4" />
              {rating ? 'Envoi…' : 'Envoyer mon évaluation'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export function SaeiChatPage() {
  return <Chat saei />
}

export function EntrepreneurChatPage() {
  return <Chat />
}
