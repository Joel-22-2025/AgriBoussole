import { AlertCircleIcon, SearchIcon } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

import { AdminSelect } from '@/features/admin/admin-select'
import { PageHeader } from '@/features/dashboard/components/page-header'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
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
import type { AdminUser } from '@/lib/api/admin'
import { fetchAdminUsers, setUserActive } from '@/lib/api/admin'
import { getApiError } from '@/lib/api/errors'
import {
  PAYS_LABELS,
  ROLE_LABELS,
  STATUS_LABELS,
  type AccountStatus,
  type Paginated,
  type Pays,
  type Role,
} from '@/lib/api/types'
import { cn, getDisplayName } from '@/lib/utils'

const ROLE_OPTIONS = Object.entries(ROLE_LABELS).map(([value, label]) => ({ value, label }))
const STATUS_OPTIONS = Object.entries(STATUS_LABELS).map(([value, label]) => ({ value, label }))
const PAYS_OPTIONS = Object.entries(PAYS_LABELS).map(([value, label]) => ({ value, label }))

interface Filters {
  role: string
  status: string
  pays: string
  search: string
}

export function AdminUsersPage() {
  const [filters, setFilters] = useState<Filters>({ role: '', status: '', pays: '', search: '' })
  const [data, setData] = useState<Paginated<AdminUser> | null>(null)
  const [page, setPage] = useState(1)
  const [reloadKey, setReloadKey] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [busyId, setBusyId] = useState<number | null>(null)

  useEffect(() => {
    let active = true
    // oxlint-disable-next-line react/set-state-in-effect -- synchronise l'état avec la requête réseau
    setLoading(true)
    setError(null)

    fetchAdminUsers({
      role: (filters.role || undefined) as Role | undefined,
      status: (filters.status || undefined) as AccountStatus | undefined,
      pays: (filters.pays || undefined) as Pays | undefined,
      search: filters.search || undefined,
      page,
    })
      .then((result) => {
        if (active) setData(result)
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
  }, [filters, page, reloadKey])

  function updateFilter<K extends keyof Filters>(key: K, value: Filters[K]) {
    setFilters((current) => ({ ...current, [key]: value }))
    setPage(1)
  }

  async function handleToggle(user: AdminUser) {
    setBusyId(user.id)
    try {
      const result = await setUserActive(user.id, !user.is_active)
      toast.success(result.message)
      setReloadKey((key) => key + 1)
    } catch (cause) {
      toast.error(getApiError(cause).message)
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="content-container">
      <PageHeader
        eyebrow="Administration"
        title="Utilisateurs"
        description="Comptes entrepreneurs, SAEI et administrateurs de la plateforme."
        actions={
          <Button variant="outline" size="sm" onClick={() => setReloadKey((key) => key + 1)}>
            Rafraîchir
          </Button>
        }
      />

      <section className="mb-5 rounded-card bg-card p-5 shadow-filter ring-1 ring-border">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <AdminSelect
            label="Rôle"
            value={filters.role}
            onChange={(value) => updateFilter('role', value)}
            options={[{ value: '', label: 'Tous les rôles' }, ...ROLE_OPTIONS]}
          />
          <AdminSelect
            label="Statut"
            value={filters.status}
            onChange={(value) => updateFilter('status', value)}
            options={[{ value: '', label: 'Tous les statuts' }, ...STATUS_OPTIONS]}
          />
          <AdminSelect
            label="Pays"
            value={filters.pays}
            onChange={(value) => updateFilter('pays', value)}
            options={[{ value: '', label: 'Tous les pays' }, ...PAYS_OPTIONS]}
          />
          <div className="flex flex-col gap-1">
            <label htmlFor="recherche-utilisateur" className="text-xs font-medium text-ink-muted">
              Recherche
            </label>
            <div className="relative">
              <SearchIcon
                className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-ink-muted"
                aria-hidden="true"
              />
              <Input
                id="recherche-utilisateur"
                type="search"
                value={filters.search}
                onChange={(event) => updateFilter('search', event.target.value)}
                placeholder="Nom ou email"
                className="pl-9"
              />
            </div>
          </div>
        </div>
      </section>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircleIcon />
          <AlertTitle>Impossible de charger les utilisateurs</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <section className="rounded-card bg-card p-6 shadow-card ring-1 ring-border">
        {loading && !data && (
          <div className="flex flex-col gap-2" aria-hidden="true">
            {Array.from({ length: 6 }, (_, index) => (
              <Skeleton key={index} className="h-10 w-full rounded-field bg-row" />
            ))}
          </div>
        )}

        {!loading && data?.results.length === 0 && (
          <p className="py-10 text-center text-sm text-ink-muted">Aucun utilisateur trouvé.</p>
        )}

        {data && data.results.length > 0 && (
          <>
            <div className="overflow-hidden rounded-field border border-border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-row hover:bg-row">
                    <TableHead className="pl-3 text-[11px] tracking-[0.04em] text-ink-muted uppercase">Utilisateur</TableHead>
                    <TableHead className="text-[11px] tracking-[0.04em] text-ink-muted uppercase">Rôle</TableHead>
                    <TableHead className="hidden text-[11px] tracking-[0.04em] text-ink-muted uppercase md:table-cell">Statut</TableHead>
                    <TableHead className="hidden text-[11px] tracking-[0.04em] text-ink-muted uppercase lg:table-cell">Pays</TableHead>
                    <TableHead className="text-right text-[11px] tracking-[0.04em] text-ink-muted uppercase">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.results.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="max-w-[240px] py-2.5 pl-3 whitespace-normal">
                        <p className="truncate font-medium text-ink-strong">
                          {getDisplayName(user.first_name, user.last_name, user.email)}
                        </p>
                        <p className="truncate text-xs text-ink-muted">{user.email}</p>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="text-[11px]">
                          {ROLE_LABELS[user.role]}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <Badge
                          variant="outline"
                          className={cn(
                            'text-[11px]',
                            user.status === 'APPROVED'
                              ? 'bg-live text-brand-hover'
                              : user.status === 'PENDING'
                                ? 'bg-warning/15 text-ink-strong'
                                : 'bg-destructive/10 text-destructive',
                          )}
                        >
                          {STATUS_LABELS[user.status]}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        {user.pays ? PAYS_LABELS[user.pays] : '—'}
                      </TableCell>
                      <TableCell className="pr-3 text-right">
                        <Button
                          size="sm"
                          variant={user.is_active ? 'destructive' : 'default'}
                          disabled={busyId === user.id}
                          onClick={() => void handleToggle(user)}
                        >
                          {user.is_active ? 'Désactiver' : 'Activer'}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="mt-3 flex items-center justify-between gap-3">
              <p className="text-xs text-ink-muted">
                {data.count} utilisateur{data.count > 1 ? 's' : ''} · page {page}
              </p>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={!data.previous || loading}
                  onClick={() => setPage((current) => Math.max(1, current - 1))}
                >
                  Précédent
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={!data.next || loading}
                  onClick={() => setPage((current) => current + 1)}
                >
                  Suivant
                </Button>
              </div>
            </div>
          </>
        )}
      </section>
    </div>
  )
}
