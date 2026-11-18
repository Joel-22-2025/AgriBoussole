import {
  ArrowRightIcon,
  ChevronDownIcon,
  LayoutDashboardIcon,
  LogInIcon,
  LogOutIcon,
  MenuIcon,
  SproutIcon,
  UserRoundIcon,
} from 'lucide-react'
import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

import { Button, buttonVariants } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { useAuth } from '@/features/auth/use-auth'
import { ROLE_LABELS } from '@/lib/api/types'
import { APP_NAME } from '@/lib/env'
import { cn, getDisplayName, getInitials } from '@/lib/utils'

import { getHomePath } from './navigation'

interface HeaderLink {
  to: string
  label: string
  end?: boolean
}

const PUBLIC_LINKS: HeaderLink[] = [
  { to: '/', label: 'Accueil', end: true },
  { to: '/structures', label: 'Annuaire des structures' },
  { to: '/inscription/saei', label: 'Devenir une SAEI' },
]

const ENTREPRENEUR_LINKS: HeaderLink[] = [
  { to: '/offres', label: 'Offres' },
  { to: '/indicateurs', label: 'Indicateurs' },
  { to: '/messages', label: 'Messages' },
]

function isActive(pathname: string, to: string, end?: boolean) {
  return end ? pathname === to : pathname.startsWith(to)
}

function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <Link
      to="/"
      aria-label={`${APP_NAME} — accueil`}
      className="flex shrink-0 items-center gap-2.5 rounded-pill focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
    >
      <span className="flex size-10 items-center justify-center rounded-pill bg-deep text-ink-deep">
        <SproutIcon className="size-5" aria-hidden="true" />
      </span>
      {!compact && (
        <span className="flex flex-col leading-tight">
          <span className="text-sm font-semibold text-ink-strong">{APP_NAME}</span>
          <span className="text-[11px] text-ink-muted">Orientation agricole</span>
        </span>
      )}
    </Link>
  )
}

export function PublicHeader() {
  const { state, logout } = useAuth()
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)

  const user = state.user
  const displayName = getDisplayName(user?.first_name, user?.last_name, user?.email)
  const homePath = getHomePath(user?.role ?? null)
  const isAdmin = user?.role === 'ADMIN'
  const homeLabel =
    user?.role === 'ENTREPRENEUR' ? 'Ma phase' : isAdmin ? 'Administration' : 'Mon espace'
  // L’accréditation SAEI est une démarche publique : elle n’apparaît pas dans
  // l’espace d’un utilisateur déjà connecté (entrepreneur notamment).
  const headerLinks = [
    ...PUBLIC_LINKS.filter((link) => !user || link.to !== '/inscription/saei'),
    ...(user?.role === 'ENTREPRENEUR' ? ENTREPRENEUR_LINKS : []),
  ]

  async function handleLogout() {
    setMobileOpen(false)
    await logout()
    toast.success('Vous êtes déconnecté.')
    navigate('/')
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur-sm">
      <div className="content-container flex h-16 items-center gap-4 px-4 md:px-6">
        <Brand />

        <nav aria-label="Navigation principale" className="ml-6 hidden items-center gap-1 lg:flex">
          {headerLinks.map((link) => {
            const active = isActive(pathname, link.to, 'end' in link ? link.end : undefined)
            return (
              <Link
                key={link.to}
                to={link.to}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'rounded-pill px-3 py-2 text-sm transition-colors',
                  active
                    ? 'bg-live font-medium text-ink-strong'
                    : 'text-ink-muted hover:bg-row hover:text-ink-strong',
                )}
              >
                {link.label}
              </Link>
            )
          })}
        </nav>

        <div className="ml-auto hidden items-center gap-2 lg:flex">
          {user ? (
            <>
              <Link
                to={homePath}
                className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'gap-2')}
              >
                <LayoutDashboardIcon className="size-4" aria-hidden="true" />
                {homeLabel}
              </Link>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    aria-label="Menu du compte"
                    className="flex items-center gap-2 rounded-pill border border-border bg-card py-1.5 pr-2.5 pl-1.5 transition-colors hover:bg-row"
                  >
                    <span className="flex size-8 items-center justify-center rounded-full bg-icon-active text-xs font-semibold text-[var(--green-on-icon-active)]">
                      {getInitials(user.first_name, user.last_name, user.email)}
                    </span>
                    <span className="hidden max-w-32 truncate text-xs font-medium text-ink-strong xl:block">
                      {displayName}
                    </span>
                    <ChevronDownIcon className="size-4 text-ink-muted" aria-hidden="true" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64">
                  <DropdownMenuLabel>
                    <span className="block truncate text-sm font-medium text-ink-strong">
                      {displayName}
                    </span>
                    <span className="block truncate text-xs font-normal">
                      {ROLE_LABELS[user.role]} · {user.email}
                    </span>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to={homePath}>{homeLabel}</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/profil">
                      <UserRoundIcon />
                      Mon profil
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/structures">Annuaire des structures</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem variant="destructive" onClick={() => void handleLogout()}>
                    <LogOutIcon />
                    Déconnexion
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Link to="/connexion" className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }), 'gap-2')}>
                <LogInIcon className="size-4" aria-hidden="true" />
                Connexion
              </Link>
              <Link to="/inscription/entrepreneur" className={cn(buttonVariants({ size: 'sm' }), 'gap-2')}>
                Créer mon profil
                <ArrowRightIcon className="size-4" aria-hidden="true" />
              </Link>
            </>
          )}
        </div>

        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="ml-auto lg:hidden" aria-label="Ouvrir le menu">
              <MenuIcon aria-hidden="true" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[min(20rem,calc(100vw-2rem))] gap-0 p-0">
            <SheetHeader className="border-b border-border p-5">
              <SheetTitle className="flex items-center gap-2.5">
                <span className="flex size-9 items-center justify-center rounded-pill bg-deep text-ink-deep">
                  <SproutIcon className="size-5" aria-hidden="true" />
                </span>
                {APP_NAME}
              </SheetTitle>
              <SheetDescription>Navigation principale</SheetDescription>
            </SheetHeader>

            <div className="flex flex-1 flex-col gap-1 overflow-y-auto p-4">
              {headerLinks.map((link) => {
                const active = isActive(pathname, link.to, 'end' in link ? link.end : undefined)
                return (
                  <SheetClose asChild key={link.to}>
                    <Link
                      to={link.to}
                      aria-current={active ? 'page' : undefined}
                      className={cn(
                        'rounded-field px-3 py-2.5 text-sm transition-colors',
                        active
                          ? 'bg-live font-medium text-ink-strong'
                          : 'text-ink-body hover:bg-row',
                      )}
                    >
                      {link.label}
                    </Link>
                  </SheetClose>
                )
              })}

              <div className="my-3 border-t border-border" />

              {user ? (
                <>
                  <SheetClose asChild>
                    <Link to={homePath} className="rounded-field px-3 py-2.5 text-sm text-ink-body hover:bg-row">
                      {homeLabel}
                    </Link>
                  </SheetClose>
                  <SheetClose asChild>
                    <Link to="/profil" className="rounded-field px-3 py-2.5 text-sm text-ink-body hover:bg-row">
                      Mon profil
                    </Link>
                  </SheetClose>
                  <div className="rounded-card bg-row p-3">
                    <p className="truncate text-sm font-medium text-ink-strong">{displayName}</p>
                    <p className="truncate text-xs text-ink-muted">
                      {ROLE_LABELS[user.role]} · {user.email}
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <SheetClose asChild>
                    <Link to="/connexion" className="rounded-field px-3 py-2.5 text-sm text-ink-body hover:bg-row">
                      Connexion
                    </Link>
                  </SheetClose>
                  <SheetClose asChild>
                    <Link to="/inscription/entrepreneur" className="rounded-field px-3 py-2.5 text-sm text-ink-body hover:bg-row">
                      Créer un profil entrepreneur
                    </Link>
                  </SheetClose>
                </>
              )}
            </div>

            <SheetFooter className="border-t border-border p-4">
              {user ? (
                <Button variant="destructive" className="gap-2" onClick={() => void handleLogout()}>
                  <LogOutIcon aria-hidden="true" />
                  Déconnexion
                </Button>
              ) : (
                <SheetClose asChild>
                  <Link to="/inscription/entrepreneur" className={cn(buttonVariants(), 'gap-2')}>
                    Créer mon profil
                    <ArrowRightIcon className="size-4" aria-hidden="true" />
                  </Link>
                </SheetClose>
              )}
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  )
}
