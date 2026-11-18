import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'

import { getHomePath } from '@/components/layout/navigation'
import { LoadingScreen } from '@/components/loading-screen'
import { useAuth } from '@/features/auth/use-auth'
import type { Role } from '@/lib/api/types'

interface RequireAuthProps {
  children: ReactNode
  roles?: Role[]
}

export function RequireAuth({ children, roles }: RequireAuthProps) {
  const { state } = useAuth()
  const location = useLocation()

  if (state.status === 'initializing') {
    return <LoadingScreen label="Vérification de votre session…" />
  }

  if (state.status === 'anonymous' || !state.user) {
    return (
      <Navigate
        to="/connexion"
        replace
        state={{ from: `${location.pathname}${location.search}` }}
      />
    )
  }

  // Une route interdite renvoie vers l’espace d’accueil du rôle.
  if (roles && !roles.includes(state.user.role)) {
    return <Navigate to={getHomePath(state.user.role)} replace />
  }

  return <>{children}</>
}
