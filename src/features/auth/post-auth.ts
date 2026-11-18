import { getHomePath } from '@/components/layout/navigation'
import type { AuthProfile } from './auth-context'
import type { User } from '@/lib/api/types'

/**
 * Un entrepreneur sans phase fait obligatoirement le quiz après connexion.
 * Sinon, on respecte la page demandée avant l’authentification.
 */
export function resolvePostAuthPath(
  user: User,
  profile: AuthProfile,
  from?: string,
): string {
  if (user.role === 'ENTREPRENEUR' && !(profile && 'phase' in profile && profile.phase)) {
    return '/phase'
  }
  return from ?? getHomePath(user.role)
}
