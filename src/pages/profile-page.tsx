import { CameraIcon, SaveIcon, UserRoundIcon } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useAuth } from '@/features/auth/use-auth'
import { PageHeader } from '@/features/dashboard/components/page-header'
import { getApiError } from '@/lib/api/errors'
import {
  PAYS_LABELS,
  PHASE_LABELS,
  ROLE_LABELS,
  STATUS_LABELS,
  TYPE_PROFIL_LABELS,
} from '@/lib/api/types'
import type { EntrepreneurProfile, Pays, SaeiProfile, TypeProfil } from '@/lib/api/types'
import { getDisplayName, mediaUrl } from '@/lib/utils'

const selectClass =
  'h-10 w-full rounded-field border border-border bg-field px-3 text-sm text-ink-body focus-visible:border-brand focus-visible:ring-3 focus-visible:ring-brand/30 focus-visible:outline-none'
const fileClass =
  'w-full text-xs text-ink-muted file:mr-3 file:rounded-pill file:border-0 file:bg-row file:px-3 file:py-2 file:text-xs file:font-medium file:text-deep file:cursor-pointer'

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <p className="text-xs text-ink-muted">{label}</p>
      <p className="truncate font-medium text-ink-strong">{value || '—'}</p>
    </div>
  )
}

function Field({ id, label, children }: { id: string; label: string; children: React.ReactNode }) {
  return (
    <div className="flex min-w-0 flex-col gap-1">
      <label htmlFor={id} className="text-xs font-medium text-ink-muted">
        {label}
      </label>
      {children}
    </div>
  )
}

export function ProfilePage() {
  const { state, updateProfile } = useAuth()
  const user = state.user
  const profile = state.profile
  const entrepreneur = profile && 'type_profil' in profile ? (profile as EntrepreneurProfile) : null
  const saei = profile && 'nom_structure_demandee' in profile ? (profile as SaeiProfile) : null

  const [form, setForm] = useState({
    first_name: user?.first_name ?? '',
    last_name: user?.last_name ?? '',
    phone: user?.phone ?? '',
    pays: entrepreneur?.pays ?? ('' as Pays | ''),
    ville: entrepreneur?.ville ?? saei?.ville ?? '',
    type_profil: entrepreneur?.type_profil ?? ('' as TypeProfil | ''),
    filiere: entrepreneur?.filiere ?? '',
    est_femme: entrepreneur?.est_femme ?? false,
    est_jeune: entrepreneur?.est_jeune ?? false,
    telephone_structure: saei?.telephone_structure ?? '',
    message: saei?.message ?? '',
  })
  const [photo, setPhoto] = useState<File | null>(null)
  const [logo, setLogo] = useState<File | null>(null)
  const [saving, setSaving] = useState(false)

  if (!user) return null

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((current) => ({ ...current, [key]: value }))
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSaving(true)
    try {
      const payload = new FormData()
      payload.append('first_name', form.first_name)
      payload.append('last_name', form.last_name)
      payload.append('phone', form.phone)

      if (entrepreneur) {
        payload.append('pays', form.pays)
        payload.append('ville', form.ville)
        payload.append('type_profil', form.type_profil)
        payload.append('filiere', form.filiere)
        payload.append('est_femme', String(form.est_femme))
        payload.append('est_jeune', String(form.est_jeune))
        if (photo) payload.append('photo_profil', photo)
      }

      if (saei) {
        payload.append('ville', form.ville)
        payload.append('telephone_structure', form.telephone_structure)
        payload.append('message', form.message)
        if (logo) payload.append('logo', logo)
      }

      await updateProfile(payload)
      setPhoto(null)
      setLogo(null)
      toast.success('Votre profil a été mis à jour.')
    } catch (cause) {
      toast.error(getApiError(cause).message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="content-container">
      <PageHeader
        eyebrow="Mon compte"
        title="Mon profil"
        description="Consultez et modifiez les informations associées à votre compte."
        actions={
          <Badge variant="secondary" className="text-[11px]">
            {ROLE_LABELS[user.role]}
          </Badge>
        }
      />

      <div className="mt-5 grid gap-4 lg:grid-cols-[320px_1fr]">
        <Card className="h-fit">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <UserRoundIcon className="size-4 text-brand-hover" />
              Identité
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-card bg-row">
                {mediaUrl(entrepreneur?.photo_profil) ? (
                  <img
                    src={mediaUrl(entrepreneur?.photo_profil) ?? ''}
                    alt="Photo de profil"
                    className="size-full object-cover"
                  />
                ) : mediaUrl(saei?.logo) ? (
                  <img
                    src={mediaUrl(saei?.logo) ?? ''}
                    alt="Logo de la structure"
                    className="size-full object-contain"
                  />
                ) : (
                  <CameraIcon className="size-6 text-ink-muted" />
                )}
              </div>
              <div className="min-w-0">
                <p className="truncate font-semibold text-ink-strong">
                  {getDisplayName(user.first_name, user.last_name, user.email)}
                </p>
                <p className="truncate text-xs text-ink-muted">{user.email}</p>
              </div>
            </div>
            <div className="grid gap-3">
              <Info label="Statut du compte" value={STATUS_LABELS[user.status]} />
              <Info
                label="Inscrit depuis"
                value={new Date(user.date_joined).toLocaleDateString('fr-FR', {
                  month: 'long',
                  year: 'numeric',
                })}
              />
              {entrepreneur && (
                <>
                  <Info label="Pays" value={PAYS_LABELS[entrepreneur.pays]} />
                  <Info label="Type de profil" value={TYPE_PROFIL_LABELS[entrepreneur.type_profil]} />
                  <Info
                    label="Phase"
                    value={
                      entrepreneur.phase
                        ? `${PHASE_LABELS[entrepreneur.phase]} (${entrepreneur.score_phase}/21)`
                        : 'Non identifiée'
                    }
                  />
                  {!entrepreneur.phase && (
                    <Link
                      to="/phase"
                      className="text-sm font-medium text-deep underline-offset-4 hover:underline"
                    >
                      Identifier ma phase
                    </Link>
                  )}
                </>
              )}
              {saei && (
                <>
                  <Info label="Structure" value={saei.nom_structure ?? saei.nom_structure_demandee} />
                  <Info label="Pays" value={PAYS_LABELS[saei.pays]} />
                  <Info label="Email structure" value={saei.email_structure ?? ''} />
                  <Info label="Site web" value={saei.site_web ?? ''} />
                </>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Informations modifiables</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
              <Field id="profile-first" label="Prénom">
                <Input id="profile-first" value={form.first_name} onChange={(e) => set('first_name', e.target.value)} />
              </Field>
              <Field id="profile-last" label="Nom">
                <Input id="profile-last" value={form.last_name} onChange={(e) => set('last_name', e.target.value)} />
              </Field>
              <Field id="profile-phone" label="Téléphone">
                <Input id="profile-phone" value={form.phone} onChange={(e) => set('phone', e.target.value)} />
              </Field>

              {entrepreneur && (
                <>
                  <Field id="profile-pays" label="Pays">
                    <select id="profile-pays" className={selectClass} value={form.pays} onChange={(e) => set('pays', e.target.value as Pays)}>
                      {Object.entries(PAYS_LABELS).map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </select>
                  </Field>
                  <Field id="profile-ville" label="Ville">
                    <Input id="profile-ville" value={form.ville} onChange={(e) => set('ville', e.target.value)} />
                  </Field>
                  <Field id="profile-type" label="Type de profil">
                    <select id="profile-type" className={selectClass} value={form.type_profil} onChange={(e) => set('type_profil', e.target.value as TypeProfil)}>
                      {Object.entries(TYPE_PROFIL_LABELS).map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </select>
                  </Field>
                  <Field id="profile-filiere" label="Filière">
                    <Input id="profile-filiere" value={form.filiere} onChange={(e) => set('filiere', e.target.value)} />
                  </Field>
                  <div className="flex flex-wrap gap-5 sm:col-span-2">
                    <label className="flex items-center gap-2 text-sm text-ink-body">
                      <input type="checkbox" checked={form.est_femme} onChange={(e) => set('est_femme', e.target.checked)} className="size-4 accent-[var(--green-deep)]" />
                      Femme
                    </label>
                    <label className="flex items-center gap-2 text-sm text-ink-body">
                      <input type="checkbox" checked={form.est_jeune} onChange={(e) => set('est_jeune', e.target.checked)} className="size-4 accent-[var(--green-deep)]" />
                      Jeune
                    </label>
                  </div>
                  <Field id="profile-photo" label="Photo de profil" >
                    <input id="profile-photo" type="file" accept="image/*" className={fileClass} onChange={(e) => setPhoto(e.target.files?.[0] ?? null)} />
                  </Field>
                </>
              )}

              {saei && (
                <>
                  <Field id="profile-ville" label="Ville">
                    <Input id="profile-ville" value={form.ville} onChange={(e) => set('ville', e.target.value)} />
                  </Field>
                  <Field id="profile-tel-structure" label="Téléphone de la structure">
                    <Input id="profile-tel-structure" value={form.telephone_structure} onChange={(e) => set('telephone_structure', e.target.value)} />
                  </Field>
                  <Field id="profile-logo" label="Logo de la structure">
                    <input id="profile-logo" type="file" accept="image/*" className={fileClass} onChange={(e) => setLogo(e.target.files?.[0] ?? null)} />
                  </Field>
                  <Field id="profile-message" label="Message d’accompagnement">
                    <Textarea id="profile-message" rows={4} value={form.message} onChange={(e) => set('message', e.target.value)} />
                  </Field>
                </>
              )}

              <div className="flex justify-end sm:col-span-2">
                <Button type="submit" disabled={saving} className="gap-2">
                  <SaveIcon className="size-4" />
                  {saving ? 'Enregistrement…' : 'Enregistrer les modifications'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
