import {
  ArrowLeftIcon,
  Building2Icon,
  ExternalLinkIcon,
  MailIcon,
  MapPinIcon,
  MessageSquareTextIcon,
  PhoneIcon,
  SendIcon,
  SproutIcon,
} from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Link, useParams } from 'react-router-dom'
import { toast } from 'sonner'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button, buttonVariants } from '@/components/ui/button'
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
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import { useAuth } from '@/features/auth/use-auth'
import { getApiError } from '@/lib/api/errors'
import { contactSaei } from '@/lib/api/engagement'
import { fetchStructure } from '@/lib/api/structures'
import { PAYS_LABELS } from '@/lib/api/types'
import type { Structure } from '@/lib/api/types'
import { useAsync } from '@/lib/use-async'
import { cn, mediaUrl } from '@/lib/utils'

const typologyFlags: Array<[keyof Structure, string]> = [
  ['est_incubateur', 'Incubateur'],
  ['est_accelerateur', 'Accélérateur'],
  ['est_recherche_innovation', 'Recherche & innovation'],
  ['est_appui_technique', 'Appui technique'],
  ['est_structure_financement', 'Financement'],
  ['est_plateforme_reseau', 'Plateforme réseau'],
]

/** Normalise un numéro béninois pour WhatsApp (229 + 9 chiffres). */
function whatsappUrl(phone: string, message: string): string | null {
  const raw = phone.replace(/\D/g, '')
  if (!raw) return null
  const digits = raw.startsWith('00')
    ? raw.slice(2)
    : raw.length === 10 && raw.startsWith('0')
      ? `229${raw.slice(1)}`
      : raw
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`
}

function Detail({ label, value }: { label: string; value?: string | number | null }) {
  if (!value) return null
  return (
    <div className="min-w-0">
      <p className="text-xs text-ink-muted">{label}</p>
      <p className="text-sm font-medium text-ink-strong">{value}</p>
    </div>
  )
}

export function StructureDetailPage() {
  const { id } = useParams<{ id: string }>()
  const structureId = Number(id)
  const { state } = useAuth()
  const { data, loading, error } = useAsync(
    () => fetchStructure(structureId),
    [structureId],
  )
  const [showContact, setShowContact] = useState(false)
  const [programme, setProgramme] = useState('')
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)

  if (!Number.isInteger(structureId) || structureId <= 0) {
    return (
      <div className="content-container py-12 text-center text-ink-muted">
        Identifiant de structure invalide.
      </div>
    )
  }

  if (loading && !data) {
    return (
      <div className="content-container space-y-4">
        <Skeleton className="h-40 w-full rounded-card" />
        <Skeleton className="h-64 w-full rounded-card" />
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="content-container py-12">
        <Alert variant="destructive">
          <AlertTitle>Structure introuvable</AlertTitle>
          <AlertDescription>{error ?? 'Cette structure n’est pas disponible.'}</AlertDescription>
        </Alert>
        <Link to="/structures" className={cn(buttonVariants({ variant: 'outline' }), 'mt-4')}>
          Retour à l’annuaire
        </Link>
      </div>
    )
  }

  const typologies = typologyFlags
    .filter(([key]) => Boolean(data[key]))
    .map(([, label]) => label)
  const location = [data.ville_siege, data.region_departement, PAYS_LABELS[data.pays]]
    .filter(Boolean)
    .join(', ')
  const whatsapp = whatsappUrl(
    data.telephone_structure ?? '',
    `Bonjour ${data.nom}, je souhaite obtenir des informations sur vos programmes d’accompagnement.`,
  )

  async function handleContact(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSending(true)
    try {
      await contactSaei({ structure_id: structureId, programme, message })
      toast.success('Votre demande d’insertion a été envoyée à la structure.')
      setShowContact(false)
      setProgramme('')
      setMessage('')
    } catch (cause) {
      toast.error(getApiError(cause).message)
    } finally {
      setSending(false)
    }
  }

  return (
    <Dialog open={showContact} onOpenChange={setShowContact}>
    <div className="content-container">
      <Link to="/structures" className="inline-flex items-center gap-1 text-sm text-ink-muted hover:text-deep">
        <ArrowLeftIcon className="size-4" />
        Retour à l’annuaire
      </Link>

      <Card className="mt-4 overflow-hidden">
        <div className="h-2 bg-gradient-to-r from-sidebar-top to-deep" />
        <CardContent className="flex flex-col gap-5 p-5 sm:flex-row sm:items-start sm:p-6">
          <div className="flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-card bg-row">
            {mediaUrl(data.logo) ? (
              <img src={mediaUrl(data.logo) ?? ''} alt={`Logo de ${data.nom}`} className="size-full object-contain" />
            ) : (
              <Building2Icon className="size-9 text-ink-muted" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <h1 className="text-2xl font-semibold text-ink-strong">{data.nom}</h1>
                <p className="mt-1 flex items-center gap-1.5 text-sm text-ink-muted">
                  <MapPinIcon className="size-4 shrink-0" />
                  {location}
                </p>
              </div>
              {data.acronyme && <Badge variant="secondary">{data.acronyme}</Badge>}
            </div>

            {typologies.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {typologies.map((typology) => (
                  <Badge key={typology} variant="outline" className="text-[11px]">
                    {typology}
                  </Badge>
                ))}
              </div>
            )}

            {data.service && <p className="mt-4 text-sm leading-relaxed text-ink-body">{data.service}</p>}

            <div className="mt-5 flex flex-wrap gap-2">
              {whatsapp && (
                <a href={whatsapp} target="_blank" rel="noreferrer" className={buttonVariants({ size: 'sm' })}>
                  <PhoneIcon className="size-4" />
                  Contacter sur WhatsApp
                </a>
              )}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  if (!state.user) {
                    toast.info('Connectez-vous pour contacter cette structure.')
                    return
                  }
                  if (state.user.role !== 'ENTREPRENEUR') {
                    toast.info('Seuls les entrepreneurs peuvent envoyer une demande d’insertion.')
                    return
                  }
                  setShowContact(true)
                }}
              >
                <MessageSquareTextIcon className="size-4" />
                Contacter via la plateforme
              </Button>
              {data.site_web && (
                <a href={data.site_web} target="_blank" rel="noreferrer" className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }))}>
                  <ExternalLinkIcon className="size-4" />
                  Site web
                </a>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Présentation</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <Detail label="Statut juridique" value={data.statut_juridique} />
            <Detail label="Spécialisation" value={data.specialisation} />
            <Detail label="Public cible" value={data.public_cible} />
            <Detail label="Stade accompagné" value={data.stade} />
            <Detail label="Besoin couvert" value={data.besoin_couvert} />
            <Detail label="Zone d’intervention" value={data.zone_intervention} />
            <Detail label="Typologie" value={data.typologie} />
            <Detail label="Source" value={data.source === 'enquetee' ? 'Enquête terrain' : 'Revue documentaire'} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Contact de la structure</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {data.email_structure && (
              <a href={`mailto:${data.email_structure}`} className="flex items-center gap-2 text-sm text-ink-body hover:text-deep">
                <MailIcon className="size-4 text-brand-hover" />
                {data.email_structure}
              </a>
            )}
            {data.telephone_structure && (
              <p className="flex items-center gap-2 text-sm text-ink-body">
                <PhoneIcon className="size-4 text-brand-hover" />
                {data.telephone_structure}
              </p>
            )}
            {data.site_web && (
              <a href={data.site_web} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm text-ink-body hover:text-deep">
                <ExternalLinkIcon className="size-4 text-brand-hover" />
                {data.site_web}
              </a>
            )}
            <div className="mt-2 flex items-start gap-2 rounded-field bg-row p-3 text-xs text-ink-muted">
              <SproutIcon className="mt-0.5 size-4 shrink-0 text-deep" />
              Les coordonnées personnelles des contacts ne sont pas publiées sur AgriBoussole.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>

      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Demande d’insertion</DialogTitle>
          <DialogDescription>
            Votre demande sera transmise à {data.nom}. Un email de confirmation vous sera
            envoyé avec celui de la structure.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleContact} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label htmlFor="contact-programme" className="text-xs font-medium text-ink-muted">
              Programme ou filière visée *
            </label>
            <Input
              id="contact-programme"
              required
              value={programme}
              onChange={(event) => setProgramme(event.target.value)}
              placeholder="Ex. Incubation agricole, financement…"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="contact-message" className="text-xs font-medium text-ink-muted">
              Votre demande *
            </label>
            <Textarea
              id="contact-message"
              required
              rows={6}
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder="Indiquez votre projet, votre phase de développement, vos besoins et les raisons de votre candidature auprès de cette structure…"
            />
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline" disabled={sending}>Annuler</Button>
            </DialogClose>
            <Button type="submit" disabled={sending} className="gap-2">
              <SendIcon className="size-4" />
              {sending ? 'Envoi en cours…' : 'Envoyer la demande'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
