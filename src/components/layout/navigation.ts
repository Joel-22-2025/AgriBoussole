import {
  BarChart3Icon,
  BellIcon,
  BriefcaseBusinessIcon,
  Building2Icon,
  ClipboardListIcon,
  CompassIcon,
  FileSpreadsheetIcon,
  HomeIcon,
  LayoutDashboardIcon,
  LogInIcon,
  MessageSquareIcon,
  SettingsIcon,
  ShieldCheckIcon,
  SparklesIcon,
  StarIcon,
  UserCheckIcon,
  UserRoundIcon,
  UsersIcon,
  type LucideIcon,
} from 'lucide-react'

import type { Role } from '@/lib/api/types'

export interface NavItem {
  to: string
  label: string
  icon: LucideIcon
  roles: Role[] | 'public'
  end?: boolean
}

const ADMIN_ROLES: Role[] = ['ADMIN']

/** Menu de la section 6 de la charte graphique. */
const ADMIN_MENU: NavItem[] = [
  { to: '/admin', label: 'Tableau de bord', icon: LayoutDashboardIcon, roles: ADMIN_ROLES, end: true },
  { to: '/admin/statistiques', label: 'Statistiques', icon: BarChart3Icon, roles: ADMIN_ROLES },
  { to: '/admin/demandes-saei', label: 'Demandes SAEI', icon: UserCheckIcon, roles: ADMIN_ROLES },
  { to: '/admin/utilisateurs', label: 'Utilisateurs', icon: UsersIcon, roles: ADMIN_ROLES },
  {
    to: '/admin/import-export',
    label: 'Import / export Excel',
    icon: FileSpreadsheetIcon,
    roles: ADMIN_ROLES,
  },
  {
    to: '/admin/administrateurs',
    label: 'Administrateurs',
    icon: ShieldCheckIcon,
    roles: ADMIN_ROLES,
  },
  {
    to: '/admin/parametres',
    label: 'Paramètres et journal',
    icon: SettingsIcon,
    roles: ADMIN_ROLES,
  },
]

const ENTREPRENEUR_MENU: NavItem[] = [
  { to: '/phase', label: 'Ma phase', icon: CompassIcon, roles: ['ENTREPRENEUR'], end: true },
  { to: '/offres', label: 'Offres des SAEI', icon: BriefcaseBusinessIcon, roles: ['ENTREPRENEUR'] },
  { to: '/indicateurs', label: 'Indicateurs', icon: BarChart3Icon, roles: ['ENTREPRENEUR'] },
  { to: '/candidatures', label: 'Mes candidatures', icon: ClipboardListIcon, roles: ['ENTREPRENEUR'] },
  { to: '/messages', label: 'Messagerie', icon: MessageSquareIcon, roles: ['ENTREPRENEUR'] },
  { to: '/structures', label: 'Annuaire des structures', icon: Building2Icon, roles: ['ENTREPRENEUR'] },
  { to: '/profil', label: 'Mon profil', icon: UserRoundIcon, roles: ['ENTREPRENEUR'] },
  { to: '/', label: 'Accueil', icon: HomeIcon, roles: ['ENTREPRENEUR'], end: true },
]

const SAEI_MENU: NavItem[] = [
  {
    to: '/tableau-de-bord',
    label: 'Mon espace',
    icon: LayoutDashboardIcon,
    roles: ['SAEI'],
    end: true,
  },
  { to: '/saei/entrepreneurs', label: 'Entrepreneurs', icon: UsersIcon, roles: ['SAEI'] },
  { to: '/saei/offres', label: 'Mes offres', icon: BriefcaseBusinessIcon, roles: ['SAEI'] },
  { to: '/saei/indicateurs', label: 'Indicateurs', icon: BarChart3Icon, roles: ['SAEI'] },
  { to: '/saei/equipe', label: 'Mon équipe', icon: StarIcon, roles: ['SAEI'] },
  { to: '/saei/notifications', label: 'Notifications', icon: BellIcon, roles: ['SAEI'] },
  { to: '/saei/messages', label: 'Messagerie', icon: MessageSquareIcon, roles: ['SAEI'] },
  { to: '/saei/profil', label: 'Mon profil', icon: UserRoundIcon, roles: ['SAEI'] },
  { to: '/saei/assistant', label: 'Boussole IA', icon: SparklesIcon, roles: ['SAEI'] },
]

const PUBLIC_MENU: NavItem[] = [
  { to: '/', label: 'Accueil', icon: HomeIcon, roles: 'public', end: true },
  { to: '/structures', label: 'Annuaire des structures', icon: CompassIcon, roles: 'public' },
  { to: '/connexion', label: 'Connexion', icon: LogInIcon, roles: 'public' },
]

export function getNavigation(role: Role | null): NavItem[] {
  if (!role) return PUBLIC_MENU
  if (role === 'ADMIN') return ADMIN_MENU
  if (role === 'SAEI') return SAEI_MENU
  return ENTREPRENEUR_MENU
}

export function getHomePath(role: Role | null): string {
  if (role === 'ADMIN') return '/admin'
  if (role === 'ENTREPRENEUR') return '/phase'
  if (role === 'SAEI') return '/tableau-de-bord'
  return '/'
}

export const ADMIN_DASHBOARD_ROLES: Role[] = ADMIN_ROLES
