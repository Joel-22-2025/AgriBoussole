import { useEffect, useState, type CSSProperties } from 'react'
import { Outlet, ScrollRestoration } from 'react-router-dom'

import { AppFooter } from './app-footer'
import { AppSidebar } from './app-sidebar'

const STORAGE_KEY = 'agriboussole.sidebar.collapsed'

export function AppShell() {
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) === 'true'
    } catch {
      return false
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, String(collapsed))
    } catch {
      // Stockage indisponible : le repli reste valable pour la session en cours.
    }
  }, [collapsed])

  return (
    <div className="min-h-svh bg-page">
      <AppSidebar collapsed={collapsed} onToggle={() => setCollapsed((value) => !value)} />
      <div
        className="flex min-h-svh flex-col md:pl-[var(--sidebar-offset)]"
        style={{ '--sidebar-offset': collapsed ? '112px' : '276px' } as CSSProperties}
      >
        <main className="flex-1 px-4 pt-5 pb-24 md:px-6 md:pt-7 md:pb-7">
          <Outlet />
        </main>
        <AppFooter variant="compact" />
      </div>
      <ScrollRestoration />
    </div>
  )
}
