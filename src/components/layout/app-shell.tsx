import { useEffect, useState } from 'react'
import { Outlet, ScrollRestoration } from 'react-router-dom'

import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { useUnreadCount } from '@/features/engagement/use-unread-count'

import { AppFooter } from './app-footer'
import { BoussoleFab } from './boussole-fab'
import { DashboardNavbar } from './dashboard-navbar'
import { DashboardSidebar } from './dashboard-sidebar'

const STORAGE_KEY = 'agriboussole.sidebar.collapsed'

export function AppShell() {
  const [open, setOpen] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) !== 'true'
    } catch {
      return true
    }
  })
  const unreadCount = useUnreadCount()

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, String(!open))
    } catch {
      // Stockage indisponible : le repli reste valable pour la session en cours.
    }
  }, [open])

  return (
    <SidebarProvider open={open} onOpenChange={setOpen} className="bg-page">
      <DashboardSidebar unreadCount={unreadCount} />
      <SidebarInset className="min-h-svh bg-page">
        <DashboardNavbar unreadCount={unreadCount} />
        <div className="flex-1 pb-10">
          <Outlet />
        </div>
        <AppFooter variant="compact" />
      </SidebarInset>
      <BoussoleFab />
      <ScrollRestoration />
    </SidebarProvider>
  )
}
