import { ChevronDownIcon, LogOutIcon, SproutIcon } from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from '@/components/ui/sidebar'
import { useAuth } from '@/features/auth/use-auth'
import { ROLE_LABELS, type Role } from '@/lib/api/types'
import { APP_NAME } from '@/lib/env'
import { getDisplayName, getInitials } from '@/lib/utils'

import { getHomePath, getNavigation, type NavItem } from './navigation'

interface NavGroup {
  label: string
  items: NavItem[]
}

function buildGroups(role: Role | null, items: NavItem[]): NavGroup[] {
  const pick = (labels: string[]) =>
    labels
      .map((label) => items.find((item) => item.label === label))
      .filter((item): item is NavItem => Boolean(item))

  if (role === 'ADMIN') {
    return [
      { label: 'Pilotage', items: pick(['Tableau de bord', 'Statistiques']) },
      {
        label: 'Gestion',
        items: pick(['Demandes SAEI', 'Utilisateurs', 'Administrateurs', 'Import / export Excel']),
      },
      { label: 'Système', items: pick(['Paramètres et journal']) },
    ]
  }

  return [
    {
      label: 'Pilotage',
      items: pick(['Mon espace', 'Entrepreneurs', 'Mes offres', 'Indicateurs']),
    },
    {
      label: 'Équipe & échanges',
      items: pick(['Mon équipe', 'Notifications', 'Messagerie']),
    },
    { label: 'Outils', items: pick(['Boussole IA']) },
    { label: 'Compte', items: pick(['Mon profil']) },
  ]
}

export function DashboardSidebar({ unreadCount }: { unreadCount: number }) {
  const { state, logout } = useAuth()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const user = state.user
  const role = user?.role ?? null
  const items = getNavigation(role)
  const groups = buildGroups(role, items)
  const displayName = getDisplayName(user?.first_name, user?.last_name, user?.email)

  function isActive(item: NavItem) {
    return item.end ? pathname === item.to : pathname.startsWith(item.to)
  }

  async function handleLogout() {
    await logout()
    toast.success('Vous êtes déconnecté.')
    navigate('/')
  }

  return (
    <Sidebar variant="floating" collapsible="icon">
      <SidebarHeader className="px-1 pt-1">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  tooltip={`${APP_NAME} — ${ROLE_LABELS[role ?? 'SAEI']}`}
                  className="h-14 gap-3 rounded-field px-2.5 data-[state=open]:bg-sidebar-accent"
                >
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-field bg-icon-active text-[var(--green-on-icon-active)]">
                    <SproutIcon className="size-5" aria-hidden="true" />
                  </span>
                  <span className="group-data-[collapsible=icon]:hidden flex min-w-0 flex-col items-start leading-tight">
                    <span className="truncate text-sm font-semibold">{APP_NAME}</span>
                    <span className="truncate text-[11px] text-ink-deep-muted">
                      {ROLE_LABELS[role ?? 'SAEI']}
                    </span>
                  </span>
                  <ChevronDownIcon
                    className="ml-auto size-4 group-data-[collapsible=icon]:hidden"
                    aria-hidden="true"
                  />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" side="right" sideOffset={12} className="w-60">
                <DropdownMenuLabel>
                  <span className="block truncate text-sm font-medium">{displayName}</span>
                  <span className="block truncate text-xs font-normal">{user?.email}</span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to={getHomePath(role)}>Mon espace</Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className="gap-2 px-1 pt-4">
        {groups.map(
          (group) =>
            group.items.length > 0 && (
              <SidebarGroup key={group.label}>
                <SidebarGroupLabel className="px-2.5 text-[10px] font-semibold tracking-[0.14em] text-ink-deep-muted/70 uppercase group-data-[collapsible=icon]:hidden">
                  {group.label}
                </SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {group.items.map((item) => (
                      <SidebarMenuItem key={item.to}>
                        <SidebarMenuButton
                          asChild
                          isActive={isActive(item)}
                          tooltip={item.label}
                          className="h-10 gap-3 rounded-field px-2.5"
                        >
                          <Link to={item.to} aria-current={isActive(item) ? 'page' : undefined}>
                            <item.icon className="size-[18px]" aria-hidden="true" />
                            <span>{item.label}</span>
                          </Link>
                        </SidebarMenuButton>
                        {item.to.includes('/messages') && unreadCount > 0 && (
                          <SidebarMenuBadge className="rounded-pill bg-icon-active px-1.5 text-[10px] font-semibold text-[var(--green-on-icon-active)]">
                            {unreadCount > 99 ? '99+' : unreadCount}
                          </SidebarMenuBadge>
                        )}
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            ),
        )}
      </SidebarContent>

      <SidebarFooter className="px-1 pb-1">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  tooltip="Mon compte"
                  className="h-12 gap-3 rounded-field px-2 data-[state=open]:bg-sidebar-accent"
                >
                  <Avatar className="size-8 shrink-0">
                    <AvatarFallback className="bg-badge-high text-[10px] font-bold text-[var(--green-on-icon-active)]">
                      {getInitials(user?.first_name, user?.last_name, user?.email)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="group-data-[collapsible=icon]:hidden flex min-w-0 flex-col items-start leading-tight">
                    <span className="w-full truncate text-xs font-medium">{displayName}</span>
                    <span className="w-full truncate text-[10px] text-ink-deep-muted">
                      {ROLE_LABELS[role ?? 'SAEI']}
                    </span>
                  </span>
                  <ChevronDownIcon
                    className="ml-auto size-4 group-data-[collapsible=icon]:hidden"
                    aria-hidden="true"
                  />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" side="right" sideOffset={12} className="w-60">
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
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}
