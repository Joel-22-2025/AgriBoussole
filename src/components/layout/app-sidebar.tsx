import {
  LogOutIcon,
  PanelLeftCloseIcon,
  PanelLeftOpenIcon,
  SproutIcon,
} from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useAuth } from '@/features/auth/use-auth'
import { UnreadBadge } from '@/features/engagement/unread-badge'
import { useUnreadCount } from '@/features/engagement/use-unread-count'
import { ROLE_LABELS } from '@/lib/api/types'
import { APP_NAME } from '@/lib/env'
import { cn, getDisplayName, getInitials } from '@/lib/utils'

import { getHomePath, getNavigation, type NavItem } from './navigation'

interface AppSidebarProps {
  collapsed: boolean
  onToggle: () => void
}

function itemClassName(isActive: boolean, expanded: boolean) {
  return cn(
    'relative flex shrink-0 items-center rounded-full transition-colors duration-150',
    expanded ? 'h-11 w-full gap-3 px-3' : 'size-11 justify-center',
    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand',
    isActive
      ? 'bg-icon-active text-[var(--green-on-icon-active)]'
      : 'bg-white/12 text-ink-deep-muted hover:bg-white/20 hover:text-ink-deep',
  )
}

function useIsActive(item: NavItem): boolean {
  const { pathname } = useLocation()
  return item.end ? pathname === item.to : pathname.startsWith(item.to)
}

function DesktopItem({
  item,
  collapsed,
  unreadCount,
}: {
  item: NavItem
  collapsed: boolean
  unreadCount: number
}) {
  const isActive = useIsActive(item)

  const link = (
    <Link
      to={item.to}
      aria-label={item.label}
      aria-current={isActive ? 'page' : undefined}
      className={itemClassName(isActive, !collapsed)}
    >
      <item.icon className="size-5 shrink-0" aria-hidden="true" />
      {!collapsed && <span className="truncate text-sm font-medium">{item.label}</span>}
      {item.to.includes('/messages') && (
        <UnreadBadge
          count={unreadCount}
          className={collapsed ? 'absolute -top-1 -right-1' : 'ml-auto'}
        />
      )}
    </Link>
  )

  if (!collapsed) return link

  return (
    <Tooltip>
      <TooltipTrigger asChild>{link}</TooltipTrigger>
      <TooltipContent side="right" sideOffset={14}>
        {item.label}
      </TooltipContent>
    </Tooltip>
  )
}

function MobileItem({ item, unreadCount }: { item: NavItem; unreadCount: number }) {
  const isActive = useIsActive(item)

  return (
    <Link
      to={item.to}
      aria-label={item.label}
      aria-current={isActive ? 'page' : undefined}
      className={itemClassName(isActive, false)}
    >
      <item.icon className="size-5" aria-hidden="true" />
      {item.to.includes('/messages') && (
        <UnreadBadge count={unreadCount} className="absolute -top-1 -right-1" />
      )}
    </Link>
  )
}

export function AppSidebar({ collapsed, onToggle }: AppSidebarProps) {
  const { state, logout } = useAuth()
  const unreadCount = useUnreadCount()
  const navigate = useNavigate()
  const user = state.user
  const items = getNavigation(user?.role ?? null)
  const displayName = getDisplayName(user?.first_name, user?.last_name, user?.email)

  async function handleLogout() {
    await logout()
    toast.success('Vous êtes déconnecté.')
    navigate('/')
  }

  return (
    <>
      <aside
        aria-label="Navigation principale"
        className={cn(
          'sidebar-surface fixed top-[22px] bottom-[22px] left-[22px] z-40 hidden flex-col rounded-side py-4 md:flex',
          collapsed ? 'w-[68px] items-center' : 'w-[232px] items-stretch px-3',
        )}
      >
        <div className={cn('flex items-center', collapsed ? 'flex-col gap-3' : 'justify-between')}>
          <Link
            to={getHomePath(user?.role ?? null)}
            aria-label={`${APP_NAME} — mon espace`}
            className="flex size-11 shrink-0 items-center justify-center rounded-full bg-icon-active text-[var(--green-on-icon-active)]"
          >
            <SproutIcon className="size-6" aria-hidden="true" />
          </Link>
          <button
            type="button"
            onClick={onToggle}
            aria-label={collapsed ? 'Déplier le menu' : 'Replier le menu'}
            aria-expanded={!collapsed}
            className="flex size-9 items-center justify-center rounded-full bg-white/12 text-ink-deep-muted transition-colors hover:bg-white/20 hover:text-ink-deep"
          >
            {collapsed ? (
              <PanelLeftOpenIcon className="size-4" aria-hidden="true" />
            ) : (
              <PanelLeftCloseIcon className="size-4" aria-hidden="true" />
            )}
          </button>
        </div>

        <nav className="mt-7 flex w-full flex-1 flex-col items-center gap-2">
          {items.map((item) => (
            <DesktopItem
              key={`${item.to}-${item.label}`}
              item={item}
              collapsed={collapsed}
              unreadCount={unreadCount}
            />
          ))}
        </nav>

        <div className="mt-3 flex shrink-0 flex-col items-center gap-2">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  aria-label="Menu du compte"
                  className={cn(
                    'flex h-11 items-center rounded-full bg-icon-active text-sm font-semibold text-[var(--green-on-icon-active)] transition-colors hover:bg-badge-high',
                    collapsed ? 'w-11 justify-center' : 'w-full gap-3 px-3',
                  )}
                >
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-badge-high text-[10px] font-bold text-[var(--green-on-icon-active)]">
                    {getInitials(user.first_name, user.last_name, user.email)}
                  </span>
                  {!collapsed && <span className="truncate">{displayName}</span>}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                side="right"
                align="end"
                sideOffset={14}
                className="w-64"
              >
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
                  <Link to={getHomePath(user.role)}>Mon espace</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="destructive" onClick={() => void handleLogout()}>
                  <LogOutIcon />
                  Déconnexion
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  to="/connexion"
                  aria-label="Connexion"
                  className="flex size-11 items-center justify-center rounded-full bg-icon-active text-[var(--green-on-icon-active)] transition-colors hover:bg-badge-high"
                >
                  <LogOutIcon className="size-5 rotate-180" aria-hidden="true" />
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right" sideOffset={14}>
                Connexion
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      </aside>

      <nav
        aria-label="Navigation mobile"
        className="sidebar-surface fixed inset-x-3 bottom-3 z-40 flex flex-wrap items-center justify-center gap-2 rounded-side px-3 py-2.5 md:hidden"
      >
        {items.map((item) => (
          <MobileItem
            key={`${item.to}-${item.label}`}
            item={item}
            unreadCount={unreadCount}
          />
        ))}
        {user && (
          <button
            type="button"
            aria-label="Déconnexion"
            onClick={() => void handleLogout()}
            className={cn(itemClassName(false, false), 'ml-auto')}
          >
            <LogOutIcon className="size-5" aria-hidden="true" />
          </button>
        )}
      </nav>
    </>
  )
}
