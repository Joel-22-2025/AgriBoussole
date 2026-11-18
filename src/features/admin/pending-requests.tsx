import {
  AlertCircleIcon,
  CheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  InboxIcon,
  XIcon,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Textarea } from '@/components/ui/textarea'
import type { SaeiRequest } from '@/lib/api/admin'
import {
  approveSaeiRequest,
  fetchSaeiRequests,
  rejectSaeiRequest,
} from '@/lib/api/admin'
import { getApiError } from '@/lib/api/errors'
import { PAYS_LABELS, type AccountStatus } from '@/lib/api/types'
import { cn, getDisplayName } from '@/lib/utils'

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

function statusBadge(status: SaeiRequest['status']) {
  if (status === 'PENDING') return { label: 'En attente', className: 'bg-warning/15 text-ink-strong' }
  if (status === 'APPROVED') return { label: 'Approuvée', className: 'bg-live text-brand-hover' }
  return { label: 'Rejetée', className: 'bg-destructive/10 text-destructive' }
}

export function PendingRequests({
  compact = false,
  status = 'PENDING',
  title = 'Demandes SAEI en attente',
  description = 'Comptes à valider pour rejoindre l’annuaire des structures.',
}: {
  compact?: boolean
  status?: AccountStatus | ''
  title?: string
  description?: string
}) {
  const [requests, setRequests] = useState<SaeiRequest[] | null>(null)
  const [page, setPage] = useState(1)
  const [reloadKey, setReloadKey] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [approving, setApproving] = useState<SaeiRequest | null>(null)
  const [rejecting, setRejecting] = useState<SaeiRequest | null>(null)
  const [motif, setMotif] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    let active = true
    // oxlint-disable-next-line react/set-state-in-effect -- synchronise l'état avec la requête réseau
    setLoading(true)
    setError(null)

    fetchSaeiRequests({ status: status || undefined, page })
      .then((result) => {
        if (active) setRequests(result.results)
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
  }, [page, reloadKey, status])

  const visible = compact ? (requests ?? []).slice(0, 5) : (requests ?? [])

  async function handleApprove() {
    if (!approving) return
    setSubmitting(true)
    try {
      await approveSaeiRequest(approving.id)
      toast.success(`Demande de ${approving.nom_structure_demandee} approuvée.`)
      setApproving(null)
      setReloadKey((key) => key + 1)
    } catch (cause) {
      toast.error(getApiError(cause).message)
    } finally {
      setSubmitting(false)
    }
  }

  async function handleReject() {
    if (!rejecting) return
    if (motif.trim().length < 3) {
      toast.error('Indiquez un motif de rejet (3 caractères minimum).')
      return
    }
    setSubmitting(true)
    try {
      await rejectSaeiRequest(rejecting.id, motif.trim())
      toast.success(`Demande de ${rejecting.nom_structure_demandee} rejetée.`)
      setRejecting(null)
      setMotif('')
      setReloadKey((key) => key + 1)
    } catch (cause) {
      toast.error(getApiError(cause).message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section
      aria-labelledby="demandes-saei-titre"
      className="rounded-card bg-card p-6 shadow-card ring-1 ring-border"
    >
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 id="demandes-saei-titre" className="text-lg leading-[1.3] font-semibold text-ink-strong">
            {title}
          </h2>
          <p className="mt-0.5 text-[13px] text-ink-muted">{description}</p>
        </div>
        <Badge variant="secondary" className="text-[11px]">
          {requests?.length ?? 0} en attente
        </Badge>
      </header>

      {error && (
        <Alert variant="destructive" className="mt-4">
          <AlertCircleIcon />
          <AlertTitle>Impossible de charger les demandes</AlertTitle>
          <AlertDescription className="flex flex-col items-start gap-2">
            <span>{error}</span>
            <Button size="sm" variant="outline" onClick={() => setReloadKey((key) => key + 1)}>
              Réessayer
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {loading && !requests && (
        <div className="mt-4 flex flex-col gap-2" aria-hidden="true">
          {Array.from({ length: 4 }, (_, index) => (
            <Skeleton key={index} className="h-11 w-full rounded-field bg-row" />
          ))}
        </div>
      )}

      {!loading && !error && visible.length === 0 && (
        <div className="mt-4 flex flex-col items-center gap-2 rounded-field bg-row px-4 py-10 text-center">
          <InboxIcon className="size-8 text-ink-muted" aria-hidden="true" />
          <p className="font-medium text-ink-strong">Aucune demande en attente</p>
          <p className="text-sm text-ink-muted">Les nouvelles demandes SAEI apparaîtront ici.</p>
        </div>
      )}

      {visible.length > 0 && (
        <>
          <div className="mt-4 overflow-hidden rounded-field border border-border">
            <Table>
              <TableHeader>
                <TableRow className="bg-row hover:bg-row">
                  <TableHead className="pl-3 text-[11px] tracking-[0.04em] text-ink-muted uppercase">
                    Structure
                  </TableHead>
                  <TableHead className="hidden text-[11px] tracking-[0.04em] text-ink-muted uppercase sm:table-cell">
                    Localisation
                  </TableHead>
                  <TableHead className="hidden text-[11px] tracking-[0.04em] text-ink-muted uppercase md:table-cell">
                    Date
                  </TableHead>
                  <TableHead className="text-right text-[11px] tracking-[0.04em] text-ink-muted uppercase">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visible.map((request) => {
                  const badge = statusBadge(request.status)
                  return (
                    <TableRow key={request.id}>
                      <TableCell className="max-w-[260px] py-2.5 pl-3 whitespace-normal">
                        <p className="truncate font-medium text-ink-strong">
                          {request.nom_structure_demandee}
                        </p>
                        <p className="truncate text-xs text-ink-muted">
                          {getDisplayName(request.first_name, request.last_name, request.email)} ·{' '}
                          {request.email}
                        </p>
                        {!compact && (
                          <Badge className={cn('mt-1 h-5 text-[11px]', badge.className)}>
                            {badge.label}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="hidden whitespace-normal text-ink-body sm:table-cell">
                        {request.ville} · {PAYS_LABELS[request.pays]}
                      </TableCell>
                      <TableCell className="hidden tabular md:table-cell">
                        {formatDate(request.date_joined)}
                      </TableCell>
                      <TableCell className="pr-3 text-right">
                        {request.status !== 'PENDING' ? (
                          <span className="text-xs text-ink-muted">Traité</span>
                        ) : (
                        <div className="flex justify-end gap-1.5">
                          <Button
                            size="sm"
                            onClick={() => setApproving(request)}
                            aria-label={`Approuver ${request.nom_structure_demandee}`}
                          >
                            <CheckIcon className="size-3.5" aria-hidden="true" />
                            <span className="hidden sm:inline">Approuver</span>
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => setRejecting(request)}
                            aria-label={`Refuser ${request.nom_structure_demandee}`}
                          >
                            <XIcon className="size-3.5" aria-hidden="true" />
                            <span className="hidden sm:inline">Refuser</span>
                          </Button>
                        </div>
                        )}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>

          {!compact && (
            <div className="mt-3 flex items-center justify-between gap-3">
              <p className="text-xs text-ink-muted">Page {page}</p>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={page <= 1 || loading}
                  onClick={() => setPage((current) => Math.max(1, current - 1))}
                >
                  <ChevronLeftIcon className="size-3.5" aria-hidden="true" />
                  Précédent
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={loading || (requests?.length ?? 0) < 10}
                  onClick={() => setPage((current) => current + 1)}
                >
                  Suivant
                  <ChevronRightIcon className="size-3.5" aria-hidden="true" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      <AlertDialog open={Boolean(approving)} onOpenChange={(open) => !open && setApproving(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Approuver cette demande ?</AlertDialogTitle>
            <AlertDialogDescription>
              {approving?.nom_structure_demandee} pourra se connecter et sa structure sera
              publiée dans l’annuaire.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={submitting}>Annuler</AlertDialogCancel>
            <AlertDialogAction
              disabled={submitting}
              onClick={(event) => {
                event.preventDefault()
                void handleApprove()
              }}
            >
              {submitting ? 'Traitement…' : 'Approuver'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog
        open={Boolean(rejecting)}
        onOpenChange={(open) => {
          if (!open) {
            setRejecting(null)
            setMotif('')
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Refuser la demande</DialogTitle>
            <DialogDescription>
              Le motif sera envoyé par email à {rejecting?.email}.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="motif-rejet" className="text-xs font-medium text-ink-muted">
              Motif du refus
            </label>
            <Textarea
              id="motif-rejet"
              value={motif}
              onChange={(event) => setMotif(event.target.value)}
              placeholder="Ex. justificatif illisible, structure hors périmètre…"
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejecting(null)} disabled={submitting}>
              Annuler
            </Button>
            <Button variant="destructive" onClick={() => void handleReject()} disabled={submitting}>
              {submitting ? 'Traitement…' : 'Refuser la demande'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  )
}
