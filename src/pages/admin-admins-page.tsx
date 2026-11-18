import { AlertCircleIcon, PlusIcon, Trash2Icon } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

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
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
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
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { PageHeader } from '@/features/dashboard/components/page-header'
import type { AdminUser } from '@/lib/api/admin'
import { createAdmin, deleteAdmin, fetchAdminUsers } from '@/lib/api/admin'
import { getApiError } from '@/lib/api/errors'
import { getDisplayName } from '@/lib/utils'

interface NewAdmin {
  email: string
  password: string
  first_name: string
  last_name: string
}

const EMPTY_ADMIN: NewAdmin = { email: '', password: '', first_name: '', last_name: '' }

export function AdminAdminsPage() {
  const [admins, setAdmins] = useState<AdminUser[] | null>(null)
  const [reloadKey, setReloadKey] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [createOpen, setCreateOpen] = useState(false)
  const [newAdmin, setNewAdmin] = useState<NewAdmin>(EMPTY_ADMIN)
  const [deleting, setDeleting] = useState<AdminUser | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    let active = true
    // oxlint-disable-next-line react/set-state-in-effect -- synchronise l'état avec la requête réseau
    setLoading(true)
    setError(null)

    fetchAdminUsers({ role: 'ADMIN' })
      .then((result) => {
        if (active) setAdmins(result.results)
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
  }, [reloadKey])

  function updateField(key: keyof NewAdmin, value: string) {
    setNewAdmin((current) => ({ ...current, [key]: value }))
  }

  async function handleCreate() {
    if (!newAdmin.email || newAdmin.password.length < 8) {
      toast.error('Renseignez un email et un mot de passe d’au moins 8 caractères.')
      return
    }
    setSubmitting(true)
    try {
      await createAdmin({
        email: newAdmin.email,
        password: newAdmin.password,
        first_name: newAdmin.first_name,
        last_name: newAdmin.last_name,
      })
      toast.success('Administrateur créé.')
      setCreateOpen(false)
      setNewAdmin(EMPTY_ADMIN)
      setReloadKey((key) => key + 1)
    } catch (cause) {
      toast.error(getApiError(cause).message)
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete() {
    if (!deleting) return
    setSubmitting(true)
    try {
      await deleteAdmin(deleting.id)
      toast.success('Administrateur supprimé.')
      setDeleting(null)
      setReloadKey((key) => key + 1)
    } catch (cause) {
      toast.error(getApiError(cause).message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="content-container">
      <PageHeader
        eyebrow="Super administration"
        title="Administrateurs"
        description="Créez et supprimez les comptes ADMIN de la plateforme."
        actions={
          <Button onClick={() => setCreateOpen(true)}>
            <PlusIcon className="size-4" aria-hidden="true" />
            Nouvel administrateur
          </Button>
        }
      />

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircleIcon />
          <AlertTitle>Impossible de charger les administrateurs</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <section className="rounded-card bg-card p-6 shadow-card ring-1 ring-border">
        {loading && !admins && (
          <div className="flex flex-col gap-2" aria-hidden="true">
            {Array.from({ length: 4 }, (_, index) => (
              <Skeleton key={index} className="h-10 w-full rounded-field bg-row" />
            ))}
          </div>
        )}

        {!loading && admins?.length === 0 && (
          <p className="py-10 text-center text-sm text-ink-muted">Aucun administrateur créé.</p>
        )}

        {admins && admins.length > 0 && (
          <div className="overflow-hidden rounded-field border border-border">
            <Table>
              <TableHeader>
                <TableRow className="bg-row hover:bg-row">
                  <TableHead className="pl-3 text-[11px] tracking-[0.04em] text-ink-muted uppercase">Administrateur</TableHead>
                  <TableHead className="hidden text-[11px] tracking-[0.04em] text-ink-muted uppercase sm:table-cell">Email</TableHead>
                  <TableHead className="text-[11px] tracking-[0.04em] text-ink-muted uppercase">État</TableHead>
                  <TableHead className="text-right text-[11px] tracking-[0.04em] text-ink-muted uppercase">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {admins.map((admin) => (
                  <TableRow key={admin.id}>
                    <TableCell className="py-2.5 pl-3 font-medium text-ink-strong">
                      {getDisplayName(admin.first_name, admin.last_name, admin.email)}
                    </TableCell>
                    <TableCell className="hidden text-ink-body sm:table-cell">{admin.email}</TableCell>
                    <TableCell>
                      <Badge
                        className={
                          admin.is_active
                            ? 'bg-live text-brand-hover'
                            : 'bg-destructive/10 text-destructive'
                        }
                      >
                        {admin.is_active ? 'Actif' : 'Inactif'}
                      </Badge>
                    </TableCell>
                    <TableCell className="pr-3 text-right">
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => setDeleting(admin)}
                        aria-label={`Supprimer ${admin.email}`}
                      >
                        <Trash2Icon className="size-3.5" aria-hidden="true" />
                        <span className="hidden sm:inline">Supprimer</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </section>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nouvel administrateur</DialogTitle>
            <DialogDescription>
              Le compte créé aura le rôle ADMIN et pourra gérer les demandes et les structures.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="admin-prenom" className="text-xs font-medium text-ink-muted">Prénom</label>
              <Input id="admin-prenom" value={newAdmin.first_name} onChange={(event) => updateField('first_name', event.target.value)} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="admin-nom" className="text-xs font-medium text-ink-muted">Nom</label>
              <Input id="admin-nom" value={newAdmin.last_name} onChange={(event) => updateField('last_name', event.target.value)} />
            </div>
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <label htmlFor="admin-email" className="text-xs font-medium text-ink-muted">Email</label>
              <Input id="admin-email" type="email" value={newAdmin.email} onChange={(event) => updateField('email', event.target.value)} />
            </div>
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <label htmlFor="admin-password" className="text-xs font-medium text-ink-muted">Mot de passe</label>
              <Input id="admin-password" type="password" value={newAdmin.password} onChange={(event) => updateField('password', event.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)} disabled={submitting}>Annuler</Button>
            <Button onClick={() => void handleCreate()} disabled={submitting}>
              {submitting ? 'Création…' : 'Créer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={Boolean(deleting)} onOpenChange={(open) => !open && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer cet administrateur ?</AlertDialogTitle>
            <AlertDialogDescription>
              Le compte {deleting?.email} sera définitivement supprimé.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={submitting}>Annuler</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={submitting}
              onClick={(event) => {
                event.preventDefault()
                void handleDelete()
              }}
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
