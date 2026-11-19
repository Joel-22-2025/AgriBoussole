import { BotIcon, RotateCcwIcon, SendIcon, SparklesIcon, UserIcon } from 'lucide-react'
import { useEffect, useRef, useState, type FormEvent } from 'react'
import { toast } from 'sonner'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/features/auth/use-auth'
import { PageHeader } from '@/features/dashboard/components/page-header'
import { useI18n } from '@/i18n/i18n'
import { api } from '@/lib/api/client'
import { getApiError } from '@/lib/api/errors'

type ChatEntry = {
  id: string
  role: 'user' | 'assistant'
  content: string
}

const STORAGE_KEY = 'agriboussole.boussole.history'

type Audience = 'entrepreneur' | 'saei'

interface AssistantPageProps {
  audience?: Audience
}

const WELCOME_TEXTS: Record<Audience, string> = {
  entrepreneur:
    'Bonjour ! Je suis Boussole, votre intelligence artificielle. Je peux vous aider à structurer votre idée, imaginer des activités, préparer un plan d’action ou faire des prévisions. Je connais aussi les structures d’accompagnement d’AgriBoussole. Que souhaitez-vous explorer ?',
  saei:
    'Bonjour ! Je suis Boussole, votre intelligence artificielle dédiée aux structures d’accompagnement. Je peux vous aider à concevoir une formation, préparer un module pédagogique, renforcer votre offre, suivre vos entrepreneurs ou communiquer sur vos activités. Que souhaitez-vous construire ?',
}

const SUGGESTIONS: Record<Audience, string[]> = {
  entrepreneur: [
    'Comment structurer mon projet de maraîchage ?',
    'Donne-moi 3 idées d’activités agricoles au Bénin.',
    'Comment estimer les ventes de ma première récolte ?',
  ],
  saei: [
    'Aide-moi à élaborer une formation sur la maraîchage durable.',
    'Comment structurer un module sur la gestion financière ?',
    'Propose-moi un plan de suivi pour les entrepreneurs accompagnés.',
  ],
}

function makeId(): string {
  return (
    globalThis.crypto?.randomUUID?.() ??
    `${Date.now()}-${Math.random().toString(36).slice(2)}`
  )
}

function welcomeEntry(audience: Audience): ChatEntry {
  return { id: makeId(), role: 'assistant', content: WELCOME_TEXTS[audience] }
}

function loadHistory(storageKey: string, audience: Audience): ChatEntry[] {
  try {
    const raw = localStorage.getItem(storageKey)
    if (!raw) return [welcomeEntry(audience)]
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return [welcomeEntry(audience)]
    const valid = parsed.filter(
      (item): item is ChatEntry =>
        typeof item === 'object' &&
        item !== null &&
        typeof (item as ChatEntry).id === 'string' &&
        ((item as ChatEntry).role === 'user' || (item as ChatEntry).role === 'assistant') &&
        typeof (item as ChatEntry).content === 'string',
    )
    return valid.length > 0 ? valid : [welcomeEntry(audience)]
  } catch {
    return [welcomeEntry(audience)]
  }
}

async function askAssistant(question: string, locale: string): Promise<string> {
  const { data } = await api.post<{ answer: string }>('/ai/ask/', { question, locale })
  return data.answer
}

export function AssistantPage({ audience = 'entrepreneur' }: AssistantPageProps) {
  const { state } = useAuth()
  const { locale } = useI18n()
  const storageKey = `${STORAGE_KEY}.${audience}.${state.user?.id ?? 'anon'}`
  const [question, setQuestion] = useState('')
  const [loading, setLoading] = useState(false)
  const [entries, setEntries] = useState<ChatEntry[]>(() => loadHistory(storageKey, audience))
  const bottomRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(entries))
    } catch {
      // Stockage indisponible ou plein : la conversation reste en mémoire.
    }
  }, [entries, storageKey])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [entries, loading])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const cleaned = question.trim()
    if (!cleaned || loading) return

    const userId = makeId()
    const pendingId = makeId()
    setEntries((current) => [
      ...current,
      { id: userId, role: 'user', content: cleaned },
      { id: pendingId, role: 'assistant', content: 'Boussole réfléchit…' },
    ])
    setQuestion('')
    setLoading(true)

    try {
      const answer = await askAssistant(cleaned, locale)
      setEntries((current) =>
        current.map((entry) => (entry.id === pendingId ? { ...entry, content: answer } : entry)),
      )
    } catch (cause: unknown) {
      setEntries((current) => current.filter((entry) => entry.id !== pendingId))
      setQuestion(cleaned)
      toast.error(getApiError(cause).message)
    } finally {
      setLoading(false)
    }
  }

  function clearHistory() {
    setEntries([welcomeEntry(audience)])
    setQuestion('')
    toast.success('Historique de la conversation effacé.')
  }

  return (
    <div className="content-container">
      <PageHeader
        eyebrow="Votre intelligence artificielle"
        title="Boussole"
        description={
          audience === 'saei'
            ? "Concevez vos formations, modules pédagogiques et dispositifs d'accompagnement avec Boussole, votre assistante spécialisée pour les SAEI."
            : "Posez vos questions sur l'entrepreneuriat agricole : structuration d'idée, pistes d'activité, prévisions ou orientation vers les structures d'accompagnement."
        }
        actions={
          <Badge className="gap-1 bg-live text-brand-hover">
            <SparklesIcon className="size-3.5" />
            Propulsé par Groq
          </Badge>
        }
      />

      <div className="mx-auto w-full max-w-4xl">
        <Card className="flex h-[min(86svh,900px)] min-h-[520px] flex-col overflow-hidden">
          <CardHeader className="flex flex-row items-start justify-between gap-3 border-b border-line px-4 py-4 sm:px-6">
            <div className="min-w-0">
              <CardTitle className="flex items-center gap-2 text-lg">
                <BotIcon className="size-5 text-brand-hover" />
                Conversation avec Boussole
              </CardTitle>
              <CardDescription>
                Votre historique est conservé sur cet appareil. Réponses générées automatiquement.
              </CardDescription>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={clearHistory}
              disabled={loading}
              className="shrink-0 gap-1.5 text-ink-muted"
            >
              <RotateCcwIcon className="size-3.5" />
              Effacer
            </Button>
          </CardHeader>

          <CardContent className="flex min-h-0 flex-1 flex-col gap-4 p-4 sm:p-6">
            <div
              role="log"
              aria-live="polite"
              aria-label="Conversation avec Boussole"
              className="min-h-0 flex-1 space-y-4 overflow-y-auto pr-1"
            >
              {entries.map((entry) => {
                const isUser = entry.role === 'user'
                return (
                  <div
                    key={entry.id}
                    className={`flex gap-2 ${isUser ? 'justify-end' : 'justify-start'}`}
                  >
                    {!isUser && (
                      <span className="mt-1 flex size-8 shrink-0 items-center justify-center rounded-pill bg-row text-brand-hover">
                        <BotIcon className="size-4" aria-hidden="true" />
                      </span>
                    )}
                    <div
                      className={`max-w-[88%] rounded-card px-4 py-3 text-sm sm:max-w-[80%] ${
                        isUser
                          ? 'bg-deep text-ink-deep'
                          : 'border border-line bg-field text-ink-body'
                      }`}
                    >
                      <p className="mb-1 flex items-center gap-1.5 text-xs font-semibold opacity-80">
                        {isUser ? <UserIcon className="size-3.5" /> : <SparklesIcon className="size-3.5" />}
                        {isUser ? 'Vous' : 'Boussole'}
                      </p>
                      <p className="whitespace-pre-wrap break-words leading-relaxed">{entry.content}</p>
                    </div>
                    {isUser && (
                      <span className="mt-1 flex size-8 shrink-0 items-center justify-center rounded-pill bg-deep text-ink-deep">
                        <UserIcon className="size-4" aria-hidden="true" />
                      </span>
                    )}
                  </div>
                )
              })}
              <div ref={bottomRef} aria-hidden="true" />
            </div>

            <div className="flex flex-wrap gap-2">
              {SUGGESTIONS[audience].map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => setQuestion(suggestion)}
                  disabled={loading}
                  className="rounded-pill border border-line bg-canvas px-3 py-1.5 text-left text-xs text-ink-muted transition-colors hover:border-brand hover:text-brand-hover disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {suggestion}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-2 sm:flex-row">
              <label htmlFor="ai-question" className="sr-only">
                Votre question
              </label>
              <Input
                id="ai-question"
                value={question}
                onChange={(event) => setQuestion(event.target.value)}
                placeholder="Posez votre question à Boussole…"
                maxLength={2000}
                autoComplete="off"
                disabled={loading}
              />
              <Button type="submit" disabled={loading || !question.trim()} className="gap-2 sm:w-auto">
                <SendIcon className="size-4" aria-hidden="true" />
                {loading ? 'Envoi…' : 'Envoyer'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
