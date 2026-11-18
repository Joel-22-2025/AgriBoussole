import { CheckCircle2Icon, RotateCcwIcon, SparklesIcon } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { LoadingScreen } from '@/components/loading-screen'
import { useAuth } from '@/features/auth/use-auth'
import { PHASE_QUESTIONS } from '@/features/phase/questions'
import { StructureRecommendations } from '@/features/phase/structure-recommendations'
import { getApiError } from '@/lib/api/errors'
import { fetchPhaseResult, submitPhaseAnswers, type PhaseAnswers } from '@/lib/api/phase'
import type { EntrepreneurProfile, PhaseResult } from '@/lib/api/types'

function PhaseQuiz({
  initialAnswers,
  error,
  submitting,
  onSubmit,
}: {
  initialAnswers: Partial<PhaseAnswers>
  error: string | null
  submitting: boolean
  onSubmit: (answers: PhaseAnswers) => void
}) {
  const [answers, setAnswers] = useState<Partial<PhaseAnswers>>(initialAnswers)
  const answered = PHASE_QUESTIONS.filter((question) => Boolean(answers[question.id])).length
  const complete = answered === PHASE_QUESTIONS.length

  function handleSubmit() {
    if (!complete) return
    onSubmit(answers as PhaseAnswers)
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Identifiez votre phase</CardTitle>
          <CardDescription>
            7 questions, environ 2 minutes. Vos réponses permettent de recommander
            les structures d’accompagnement les plus adaptées à votre projet.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between gap-3 text-sm">
            <span className="font-medium">{answered} / 7 réponses</span>
            <span className="text-muted-foreground">
              {complete ? 'Quiz terminé' : 'Répondez à toutes les questions'}
            </span>
          </div>
          <div
            className="mt-2 h-2 w-full overflow-hidden rounded-pill bg-live"
            role="progressbar"
            aria-label="Progression du quiz"
            aria-valuemin={0}
            aria-valuemax={7}
            aria-valuenow={answered}
          >
            <div
              className="h-full rounded-pill bg-brand transition-[width] duration-300"
              style={{ width: `${(answered / 7) * 100}%` }}
            />
          </div>
        </CardContent>
      </Card>

      {PHASE_QUESTIONS.map((question, index) => (
        <Card key={question.id}>
          <CardHeader>
            <CardTitle className="text-base">
              Q{index + 1} — {question.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={answers[question.id] ?? ''}
              onValueChange={(value) =>
                setAnswers((current) => ({ ...current, [question.id]: value }))
              }
              aria-label={question.title}
            >
              {question.options.map((option) => (
                <label
                  key={option.value}
                  htmlFor={`${question.id}-${option.value}`}
                  className="flex cursor-pointer items-start gap-3 rounded-field border border-border p-3 text-sm transition-colors hover:bg-row has-[:checked]:border-brand has-[:checked]:bg-live"
                >
                  <RadioGroupItem
                    id={`${question.id}-${option.value}`}
                    value={option.value}
                    className="mt-0.5"
                  />
                  <span>{option.label}</span>
                </label>
              ))}
            </RadioGroup>
          </CardContent>
        </Card>
      ))}

      {error && (
        <Alert variant="destructive">
          <AlertTitle>Impossible d’enregistrer le quiz</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex flex-col gap-3 rounded-card bg-card p-4 shadow-filter ring-1 ring-border sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-ink-muted">
          {complete
            ? 'Votre phase sera calculée automatiquement à partir de vos réponses.'
            : 'Sélectionnez une réponse pour chaque question pour continuer.'}
        </p>
        <Button size="lg" disabled={!complete || submitting} onClick={handleSubmit}>
          <CheckCircle2Icon className="size-4" />
          {submitting ? 'Analyse en cours…' : 'Voir ma phase'}
        </Button>
      </div>
    </div>
  )
}

function PhaseResultView({
  result,
  profile,
  onRetake,
}: {
  result: PhaseResult
  profile: EntrepreneurProfile
  onRetake: () => void
}) {
  return (
    <div className="space-y-6">
      <Card className="overflow-hidden">
        <div className="bg-deep px-6 py-8 text-ink-deep sm:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs tracking-wide uppercase text-ink-deep-muted">
                Votre phase actuelle
              </p>
              <h2 className="mt-2 text-3xl font-semibold">{result.label}</h2>
              <p className="mt-2 max-w-xl text-sm text-ink-deep-muted">
                {result.orientation}
              </p>
            </div>
            <Badge className="w-fit gap-1 bg-badge-on-deep text-ink-deep">
              <SparklesIcon className="size-3.5" />
              {result.range} points
            </Badge>
          </div>

          <div className="mt-6">
            <div className="flex items-end justify-between gap-3">
              <span className="text-sm text-ink-deep-muted">Score de maturité</span>
              <span className="text-2xl font-semibold">
                {result.score} / {result.max_score}
              </span>
            </div>
            <div className="mt-2 h-2 w-full overflow-hidden rounded-pill bg-badge-on-deep">
              <div
                className="h-full rounded-pill bg-live"
                style={{ width: `${((result.score ?? 0) / result.max_score) * 100}%` }}
              />
            </div>
          </div>
        </div>

        <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            Ce résultat est enregistré sur votre profil. Vous pouvez le refaire à tout
            moment si votre projet évolue.
          </p>
          <Button variant="outline" onClick={onRetake} className="gap-2">
            <RotateCcwIcon className="size-4" />
            Refaire le quiz
          </Button>
        </CardContent>
      </Card>

      <StructureRecommendations profile={profile} result={result} />
    </div>
  )
}

export function PhasePage() {
  const { state, refreshProfile } = useAuth()
  const profile =
    state.profile && 'phase' in state.profile
      ? (state.profile as EntrepreneurProfile)
      : null

  const [result, setResult] = useState<PhaseResult | null>(null)
  const [showQuiz, setShowQuiz] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    if (!profile?.phase || result || showQuiz) return

    fetchPhaseResult()
      .then((payload) => {
        // oxlint-disable-next-line react/set-state-in-effect -- restitution du résultat enregistré
        if (active) setResult(payload)
      })
      .catch((cause: unknown) => {
        if (active) setError(getApiError(cause).message)
      })

    return () => {
      active = false
    }
  }, [profile?.phase, result, showQuiz])

  if (!profile) {
    return <LoadingScreen label="Chargement de votre profil entrepreneur…" />
  }

  async function handleSubmit(answers: PhaseAnswers) {
    setSubmitting(true)
    setError(null)
    try {
      const payload = await submitPhaseAnswers(answers)
      setResult(payload)
      setShowQuiz(false)
      await refreshProfile()
      toast.success('Votre phase a été identifiée.')
    } catch (cause: unknown) {
      setError(getApiError(cause).message)
    } finally {
      setSubmitting(false)
    }
  }

  const displayQuiz = showQuiz || !profile.phase
  const loadingSavedResult = !displayQuiz && !result && !error

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-10">
      <div className="mb-8 flex flex-col gap-2">
        <p className="text-sm text-muted-foreground">Espace entrepreneur</p>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Identification de la phase de votre projet
        </h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Évaluons ensemble la maturité de votre projet pour vous orienter vers les
          bons accompagnements et les structures les plus proches de vous.
        </p>
      </div>

      {error && !displayQuiz && (
        <Alert variant="destructive" className="mb-4">
          <AlertTitle>Résultat indisponible</AlertTitle>
          <AlertDescription className="flex flex-col items-start gap-2">
            <span>{error}</span>
            <Button variant="outline" size="sm" onClick={() => setShowQuiz(true)}>
              Refaire le quiz
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {loadingSavedResult && <LoadingScreen label="Chargement de votre phase…" />}

      {displayQuiz && (
        <PhaseQuiz
          initialAnswers={profile.phase_answers as Partial<PhaseAnswers>}
          error={error}
          submitting={submitting}
          onSubmit={handleSubmit}
        />
      )}

      {!displayQuiz && result && (
        <PhaseResultView
          result={result}
          profile={profile}
          onRetake={() => {
            setError(null)
            setShowQuiz(true)
          }}
        />
      )}
    </div>
  )
}
