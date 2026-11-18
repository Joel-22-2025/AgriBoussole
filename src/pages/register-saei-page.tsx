import axios from 'axios'
import {
  ArrowLeftIcon,
  Building2Icon,
  CheckCircle2Icon,
  ClipboardListIcon,
} from 'lucide-react'
import { useEffect, useState, type FormEvent, type ReactNode } from 'react'
import { Link } from 'react-router-dom'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button, buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { registerSaeiRequest } from '@/lib/api/auth'
import { getApiError } from '@/lib/api/errors'
import { fetchPublicsCibles, fetchVilles } from '@/lib/api/structures'
import { PAYS_LABELS } from '@/lib/api/types'
import type { Pays, SaeiRegisterPayload, Ville } from '@/lib/api/types'
import { cn } from '@/lib/utils'

interface FormState {
  email: string
  password: string
  first_name: string
  last_name: string
  phone: string
  nom_structure: string
  pays: Pays | ''
  ville: string
  region_departement: string
  zone_intervention: string
  acronyme: string
  statut_juridique: string
  est_incubateur: boolean
  est_accelerateur: boolean
  est_recherche_innovation: boolean
  est_appui_technique: boolean
  est_structure_financement: boolean
  est_plateforme_reseau: boolean
  service: string
  stade: string
  contact_nom: string
  contact_fonction: string
  contact_email: string
  contact_telephone: string
  email_structure: string
  telephone_structure: string
  site_web: string
  justificatif: File | null
  logo: File | null
  message: string
}

const initialForm: FormState = {
  email: '',
  password: '',
  first_name: '',
  last_name: '',
  phone: '',
  nom_structure: '',
  pays: '',
  ville: '',
  region_departement: '',
  zone_intervention: '',
  acronyme: '',
  statut_juridique: '',
  est_incubateur: false,
  est_accelerateur: false,
  est_recherche_innovation: false,
  est_appui_technique: false,
  est_structure_financement: false,
  est_plateforme_reseau: false,
  service: '',
  stade: '',
  contact_nom: '',
  contact_fonction: '',
  contact_email: '',
  contact_telephone: '',
  email_structure: '',
  telephone_structure: '',
  site_web: '',
  justificatif: null,
  logo: null,
  message: '',
}

const TYPOLOGIES: Array<{ key: keyof FormState; label: string }> = [
  { key: 'est_incubateur', label: 'Incubateur' },
  { key: 'est_accelerateur', label: 'Accélérateur' },
  { key: 'est_recherche_innovation', label: 'Recherche & innovation' },
  { key: 'est_appui_technique', label: 'Appui technique' },
  { key: 'est_structure_financement', label: 'Financement' },
  { key: 'est_plateforme_reseau', label: 'Plateforme réseau' },
]

const requiredInformation = [
  'Identité de la structure : nom, acronyme, pays, département, ville et statut juridique.',
  'Typologie : incubateur, accélérateur, recherche & innovation, appui technique, financement ou plateforme réseau.',
  'Services proposés, publics cibles et stade de développement accompagné.',
  'Coordonnées du contact et de la structure, justificatif et logo (facultatifs).',
]

const selectClass =
  'h-10 w-full rounded-field border border-border bg-field px-3 text-sm text-ink-body focus-visible:border-brand focus-visible:ring-3 focus-visible:ring-brand/30 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60'
const fileClass =
  'w-full text-xs text-ink-muted file:mr-3 file:rounded-pill file:border-0 file:bg-row file:px-3 file:py-2 file:text-xs file:font-medium file:text-deep file:cursor-pointer'

function Field({
  id,
  label,
  children,
  hint,
  className,
}: {
  id: string
  label: string
  children: ReactNode
  hint?: string
  className?: string
}) {
  return (
    <div className={cn('flex min-w-0 flex-col gap-1', className)}>
      <label htmlFor={id} className="text-xs font-medium text-ink-muted">
        {label}
      </label>
      {children}
      {hint && <p className="text-[11px] text-ink-muted">{hint}</p>}
    </div>
  )
}

function Section({
  title,
  description,
  children,
}: {
  title: string
  description?: string
  children: ReactNode
}) {
  return (
    <section className="border-t border-border pt-4 first:border-0 first:pt-0">
      <h3 className="text-sm font-semibold text-ink-strong">{title}</h3>
      {description && <p className="mt-1 text-xs text-ink-muted">{description}</p>}
      <div className="mt-4 grid gap-4 sm:grid-cols-2">{children}</div>
    </section>
  )
}

function SaeiAccreditationForm() {
  const [form, setForm] = useState<FormState>(initialForm)
  const [villes, setVilles] = useState<Ville[]>([])
  const [publicsCibles, setPublicsCibles] = useState<string[]>([])
  const [selectedCibles, setSelectedCibles] = useState<string[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }))
  }

  // Chargement des publics cibles disponibles dans la base.
  useEffect(() => {
    let active = true
    fetchPublicsCibles()
      .then((items) => {
        if (active) setPublicsCibles(items)
      })
      .catch(() => {
        // La saisie manuelle reste possible si le référentiel est indisponible.
      })
    return () => {
      active = false
    }
  }, [])

  // Pays → départements → villes : les deux selects suivent le pays choisi.
  useEffect(() => {
    let active = true
    if (!form.pays) return
    fetchVilles({ pays: form.pays })
      .then((items) => {
        if (active) setVilles(items)
      })
      .catch(() => {
        if (active) setVilles([])
      })
    return () => {
      active = false
    }
  }, [form.pays])

  const villesUtiles = form.pays ? villes : []
  const departements = Array.from(
    new Set(villesUtiles.map((item) => item.region).filter((region) => Boolean(region.trim()))),
  ).sort((a, b) => a.localeCompare(b, 'fr'))
  const villesDuDepartement = form.region_departement
    ? villesUtiles.filter((item) => item.region === form.region_departement)
    : villesUtiles

  function toggleCible(label: string) {
    setSelectedCibles((current) =>
      current.includes(label)
        ? current.filter((item) => item !== label)
        : [...current, label],
    )
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)

    if (!form.pays) {
      setError('Sélectionnez le pays de votre structure.')
      return
    }
    if (!form.region_departement || !form.ville) {
      setError('Sélectionnez le département puis la ville de votre structure.')
      return
    }
    if (!TYPOLOGIES.some(({ key }) => form[key])) {
      setError('Sélectionnez au moins un type de structure.')
      return
    }
    if (selectedCibles.length === 0) {
      setError('Sélectionnez au moins un public cible.')
      return
    }

    setSubmitting(true)
    try {
      const payload: SaeiRegisterPayload = {
        email: form.email,
        password: form.password,
        first_name: form.first_name,
        last_name: form.last_name,
        phone: form.phone,
        nom_structure: form.nom_structure,
        pays: form.pays,
        ville: form.ville,
        region_departement: form.region_departement,
        zone_intervention: form.zone_intervention,
        acronyme: form.acronyme,
        statut_juridique: form.statut_juridique,
        est_incubateur: form.est_incubateur,
        est_accelerateur: form.est_accelerateur,
        est_recherche_innovation: form.est_recherche_innovation,
        est_appui_technique: form.est_appui_technique,
        est_structure_financement: form.est_structure_financement,
        est_plateforme_reseau: form.est_plateforme_reseau,
        service: form.service,
        public_cible: selectedCibles.join('; '),
        stade: form.stade,
        contact_nom: form.contact_nom,
        contact_fonction: form.contact_fonction,
        contact_email: form.contact_email,
        contact_telephone: form.contact_telephone,
        email_structure: form.email_structure,
        telephone_structure: form.telephone_structure,
        site_web: form.site_web,
        justificatif: form.justificatif,
        logo: form.logo,
        message: form.message,
      }
      await registerSaeiRequest(payload)
      setDone(true)
    } catch (cause) {
      if (axios.isAxiosError(cause) && cause.response?.status === 404) {
        setError(
          'Le service d’accréditation est introuvable (404). Vérifiez que le backend est démarré sur le port 8000 ou que VITE_API_URL est correct, puis réessayez.',
        )
      } else {
        const normalized = getApiError(cause)
        const fieldMessages = Object.values(normalized.fieldErrors).flat()
        setError(fieldMessages.length > 0 ? fieldMessages.join(' ') : normalized.message)
      }
    } finally {
      setSubmitting(false)
    }
  }

  if (done) {
    return (
      <div className="flex flex-col items-center gap-4 py-6 text-center">
        <span className="flex size-14 items-center justify-center rounded-pill bg-live text-deep">
          <CheckCircle2Icon className="size-7" />
        </span>
        <div>
          <h3 className="text-base font-semibold text-ink-strong">Demande enregistrée</h3>
          <p className="mx-auto mt-2 max-w-md text-sm text-ink-muted">
            Un administrateur va examiner votre dossier. Vous pourrez accéder à votre
            espace SAEI après validation.
          </p>
        </div>
        <DialogClose asChild>
          <Button variant="outline">Fermer</Button>
        </DialogClose>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {error && (
        <Alert variant="destructive">
          <AlertTitle>Vérification du formulaire</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Section title="Compte utilisateur" description="Identifiants de connexion à votre espace SAEI.">
        <Field id="saei-email" label="Email de connexion *">
          <Input id="saei-email" type="email" required value={form.email} onChange={(e) => set('email', e.target.value)} />
        </Field>
        <Field id="saei-password" label="Mot de passe *" hint="8 caractères minimum.">
          <Input id="saei-password" type="password" required minLength={8} value={form.password} onChange={(e) => set('password', e.target.value)} />
        </Field>
        <Field id="saei-first" label="Prénom">
          <Input id="saei-first" value={form.first_name} onChange={(e) => set('first_name', e.target.value)} />
        </Field>
        <Field id="saei-last" label="Nom">
          <Input id="saei-last" value={form.last_name} onChange={(e) => set('last_name', e.target.value)} />
        </Field>
        <Field id="saei-phone" label="Téléphone du compte">
          <Input id="saei-phone" value={form.phone} onChange={(e) => set('phone', e.target.value)} />
        </Field>
      </Section>

      <Section title="Identité de la structure">
        <Field id="saei-nom" label="Nom de la structure *">
          <Input id="saei-nom" required value={form.nom_structure} onChange={(e) => set('nom_structure', e.target.value)} />
        </Field>
        <Field id="saei-acronyme" label="Acronyme *">
          <Input id="saei-acronyme" required value={form.acronyme} onChange={(e) => set('acronyme', e.target.value)} />
        </Field>
        <Field id="saei-pays" label="Pays *">
          <select
            id="saei-pays"
            required
            className={selectClass}
            value={form.pays}
            onChange={(e) => {
              set('pays', e.target.value as Pays)
              set('region_departement', '')
              set('ville', '')
            }}
          >
            <option value="">Sélectionner un pays</option>
            {Object.entries(PAYS_LABELS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </Field>
        <Field id="saei-region" label="Département / région *">
          <select
            id="saei-region"
            required
            className={selectClass}
            value={form.region_departement}
            disabled={!form.pays}
            onChange={(e) => {
              set('region_departement', e.target.value)
              set('ville', '')
            }}
          >
            <option value="">{form.pays ? 'Sélectionner un département' : 'Choisissez d’abord un pays'}</option>
            {departements.map((region) => (
              <option key={region} value={region}>{region}</option>
            ))}
          </select>
        </Field>
        <Field id="saei-ville" label="Ville *">
          <select
            id="saei-ville"
            required
            className={selectClass}
            value={form.ville}
            disabled={!form.region_departement}
            onChange={(e) => set('ville', e.target.value)}
          >
            <option value="">
              {form.region_departement ? 'Sélectionner une ville' : 'Choisissez d’abord un département'}
            </option>
            {villesDuDepartement.map((ville) => (
              <option key={ville.id} value={ville.nom}>{ville.nom}</option>
            ))}
          </select>
        </Field>
        <Field id="saei-zone" label="Zone d’intervention *">
          <Input id="saei-zone" required value={form.zone_intervention} onChange={(e) => set('zone_intervention', e.target.value)} />
        </Field>
        <Field id="saei-statut" label="Statut juridique *">
          <Input id="saei-statut" required value={form.statut_juridique} onChange={(e) => set('statut_juridique', e.target.value)} />
        </Field>
        <Field id="saei-logo" label="Logo (facultatif)" hint="Modifiable ensuite depuis votre profil.">
          <input id="saei-logo" type="file" accept="image/*" className={fileClass} onChange={(e) => set('logo', e.target.files?.[0] ?? null)} />
        </Field>
      </Section>

      <Section title="Typologie *" description="Sélectionnez au moins une catégorie.">
        <div className="grid gap-2 sm:col-span-2 sm:grid-cols-2">
          {TYPOLOGIES.map(({ key, label }) => (
            <label key={key} className="flex items-center gap-2 rounded-field bg-row px-3 py-2 text-sm text-ink-body">
              <input
                type="checkbox"
                checked={Boolean(form[key])}
                onChange={(e) => set(key, e.target.checked)}
                className="size-4 accent-[var(--green-deep)]"
              />
              {label}
            </label>
          ))}
        </div>
      </Section>

      <Section title="Services et publics accompagnés">
        <Field id="saei-service" label="Services proposés *">
          <Input id="saei-service" required value={form.service} onChange={(e) => set('service', e.target.value)} />
        </Field>
        <Field id="saei-stade" label="Stade accompagné *">
          <Input id="saei-stade" required value={form.stade} onChange={(e) => set('stade', e.target.value)} />
        </Field>
        <div className="sm:col-span-2">
          <p className="text-xs font-medium text-ink-muted">Publics cibles *</p>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            {publicsCibles.length === 0 && (
              <p className="text-xs text-ink-muted">
                Chargement des publics cibles disponibles…
              </p>
            )}
            {publicsCibles.map((label) => (
              <label key={label} className="flex items-center gap-2 rounded-field bg-row px-3 py-2 text-sm text-ink-body">
                <input
                  type="checkbox"
                  checked={selectedCibles.includes(label)}
                  onChange={() => toggleCible(label)}
                  className="size-4 accent-[var(--green-deep)]"
                />
                {label}
              </label>
            ))}
          </div>
        </div>
      </Section>

      <Section title="Contact">
        <Field id="saei-contact-nom" label="Nom du contact *">
          <Input id="saei-contact-nom" required value={form.contact_nom} onChange={(e) => set('contact_nom', e.target.value)} />
        </Field>
        <Field id="saei-contact-fonction" label="Fonction *">
          <Input id="saei-contact-fonction" required value={form.contact_fonction} onChange={(e) => set('contact_fonction', e.target.value)} />
        </Field>
        <Field id="saei-contact-email" label="Email du contact *">
          <Input id="saei-contact-email" type="email" required value={form.contact_email} onChange={(e) => set('contact_email', e.target.value)} />
        </Field>
        <Field id="saei-contact-tel" label="Téléphone du contact *">
          <Input id="saei-contact-tel" required value={form.contact_telephone} onChange={(e) => set('contact_telephone', e.target.value)} />
        </Field>
        <Field id="saei-email-structure" label="Email de la structure (facultatif)">
          <Input id="saei-email-structure" type="email" value={form.email_structure} onChange={(e) => set('email_structure', e.target.value)} />
        </Field>
        <Field id="saei-tel-structure" label="Téléphone de la structure *">
          <Input id="saei-tel-structure" required value={form.telephone_structure} onChange={(e) => set('telephone_structure', e.target.value)} />
        </Field>
        <Field id="saei-site" label="Site web (facultatif)">
          <Input id="saei-site" type="url" placeholder="https://…" value={form.site_web} onChange={(e) => set('site_web', e.target.value)} />
        </Field>
      </Section>

      <Section title="Demande" description="Ces informations aident l’administrateur à instruire votre dossier.">
        <Field id="saei-justificatif" label="Justificatif (facultatif)">
          <input id="saei-justificatif" type="file" className={fileClass} onChange={(e) => set('justificatif', e.target.files?.[0] ?? null)} />
        </Field>
        <Field id="saei-message" label="Message à l’administration" className="sm:col-span-2">
          <Textarea
            id="saei-message"
            rows={4}
            placeholder="Présentez brièvement votre structure et vos objectifs sur la plateforme…"
            value={form.message}
            onChange={(e) => set('message', e.target.value)}
          />
        </Field>
      </Section>

      <div className="flex justify-end gap-2 border-t border-border pt-4">
        <DialogClose asChild>
          <Button type="button" variant="ghost">Annuler</Button>
        </DialogClose>
        <Button type="submit" disabled={submitting}>
          {submitting ? 'Envoi en cours…' : 'Envoyer la demande'}
        </Button>
      </div>
    </form>
  )
}

export function RegisterSaeiPage() {
  const [open, setOpen] = useState(false)

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-12 md:px-6">
      <div className="mb-6 flex flex-col gap-3">
        <Link to="/" className="inline-flex w-fit items-center gap-1 text-sm text-ink-muted hover:text-deep">
          <ArrowLeftIcon className="size-4" />
          Retour à l’accueil
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight text-ink-strong">
          Devenir une structure SAEI
        </h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Building2Icon className="size-5 text-brand-hover" />
            Rejoindre le réseau des structures accompagnantes
          </CardTitle>
          <CardDescription>
            Votre demande sera examinée par un administrateur avant publication dans l’annuaire.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          <p className="text-sm leading-relaxed text-ink-body">
            Vous accompagnez des entrepreneurs agricoles au Bénin, au Sénégal ou en Côte
            d’Ivoire ? Déposez votre demande : elle alimentera directement l’annuaire
            AgriBoussole après validation et vous donnera accès à votre espace SAEI.
          </p>

          <ul className="flex flex-col gap-2.5">
            {requiredInformation.map((item) => (
              <li key={item} className="flex gap-2 text-sm text-ink-body">
                <CheckCircle2Icon className="mt-0.5 size-4 shrink-0 text-deep" />
                <span>{item}</span>
              </li>
            ))}
          </ul>

          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="w-fit gap-2">
                <ClipboardListIcon className="size-4" />
                Demander une accréditation
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
              <DialogHeader>
                <DialogTitle>Formulaire d’accréditation SAEI</DialogTitle>
                <DialogDescription>
                  Les champs marqués d’un astérisque sont obligatoires. Les villes et les
                  publics cibles proviennent des données de la plateforme.
                </DialogDescription>
              </DialogHeader>
              <SaeiAccreditationForm />
            </DialogContent>
          </Dialog>

          <div className="flex flex-wrap gap-2 border-t border-border pt-4">
            <Link to="/connexion" className={cn(buttonVariants({ variant: 'outline' }))}>
              J’ai déjà un compte
            </Link>
            <Link to="/inscription/entrepreneur" className={cn(buttonVariants({ variant: 'ghost' }))}>
              Je suis entrepreneur
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
