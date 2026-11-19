import { BellIcon, LogOutIcon, MessageSquareIcon } from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { buttonVariants } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { LanguageSwitcher } from '@/components/layout/language-switcher'
import { Separator } from '@/components/ui/separator'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { UnreadBadge } from '@/features/engagement/unread-badge'
import { useAuth } from '@/features/auth/use-auth'
import { ROLE_LABELS } from '@/lib/api/types'
import { cn, getDisplayName, getInitials } from '@/lib/utils'

import { getHomePath, getNavigation } from './navigation'

export function DashboardNavbar({ unreadCount }: { unreadCount: number }) {
  const { state, logout } = useAuth()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const user = state.user
  const role = user?.role ?? null
  const current = getNavigation(role).find((item) =>
    item.end ? pathname === item.to : pathname.startsWith(item.to),
  )
  const displayName = getDisplayName(user?.first_name, user?.last_name, user?.email)
  const messagesPath = role === 'SAEI' ? '/saei/messages' : null
  const notificationsPath = role === 'SAEI' ? '/saei/notifications' : '/admin/parametres'

  async function handleLogout() {
    await logout()
    toast.success('Vous êtes déconnecté.')
    navigate('/')
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-3 border-b border-border bg-card/95 px-4 backdrop-blur md:px-6">
      <SidebarTrigger className="-ml-1" />

      <Separator orientation="vertical" className="mr-1 h-5" />

      <div className="flex min-w-0 flex-col leading-tight">
        <span className="truncate text-[11px] font-medium tracking-wide text-ink-muted uppercase">
          {ROLE_LABELS[role ?? 'SAEI']}
        </span>
        <span className="truncate text-sm font-semibold text-ink-strong">
          {current?.label ?? 'Tableau de bord'}
        </span>
      </div>

      <div className="ml-auto flex items-center gap-1.5">
        <LanguageSwitcher />
        {messagesPath && (
          <Link
            to={messagesPath}
            aria-label={`Messagerie, ${unreadCount} message(s) non lu(s)`}
            className={cn(buttonVariants({ variant: 'ghost', size: 'icon' }), 'relative')}
          >
            <MessageSquareIcon className="size-4" aria-hidden="true" />
            <UnreadBadge count={unreadCount} className="absolute -top-1 -right-1" />
          </Link>
        )}

        <Link
          to={notificationsPath}
          aria-label="Notifications"
          className={buttonVariants({ variant: 'ghost', size: 'icon' })}
        >
          <BellIcon className="size-4" aria-hidden="true" />
        </Link>

        <Separator orientation="vertical" className="mx-1 h-6" />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              aria-label="Menu du compte"
              className="flex h-9 items-center gap-2 rounded-field px-1.5 transition-colors hover:bg-row"
            >
              <Avatar className="size-8">
                <AvatarFallback className="bg-live text-[10px] font-bold text-deep">
                  {getInitials(user?.first_name, user?.last_name, user?.email)}
                </AvatarFallback>
              </Avatar>
              <span className="hidden max-w-32 truncate text-xs font-medium text-ink-body lg:block">
                {displayName}
              </span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" sideOffset={10} className="w-60">
            <DropdownMenuLabel>
              <span className="block truncate text-sm font-medium">{displayName}</span>
              <span className="block truncate text-xs font-normal">{user?.email}</span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link to={getHomePath(role)}>Mon espace</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" onClick={() => void handleLogout()}>
              <LogOutIcon />
              Déconnexion
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
