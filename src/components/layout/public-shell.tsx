import { Outlet, ScrollRestoration } from 'react-router-dom'

import { AppFooter } from './app-footer'
import { BoussoleFab } from './boussole-fab'
import { PublicHeader } from './public-header'

export function PublicShell() {
  return (
    <div className="flex min-h-svh flex-col bg-page">
      <PublicHeader />
      <main className="flex-1">
        <Outlet />
      </main>
      <AppFooter />
      <BoussoleFab />
      <ScrollRestoration />
    </div>
  )
}
