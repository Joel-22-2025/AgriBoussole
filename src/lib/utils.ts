export { cn } from 'cn'

import { API_BASE_URL } from '@/lib/env'

/** Construit l'URL publique d'un fichier média renvoyé par le backend. */
export function mediaUrl(path?: string | null): string | null {
  if (!path) return null
  if (/^https?:\/\//i.test(path) || path.startsWith('data:')) return path
  const origin = API_BASE_URL.replace(/\/api\/?$/, '')
  return `${origin}${path.startsWith('/') ? '' : '/'}${path}`
}

export function formatDate(value?: string | null): string {
  if (!value) return '—'
  return new Date(value).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export function getInitials(
  firstName?: string | null,
  lastName?: string | null,
  email?: string | null,
): string {
  const value = `${firstName?.[0] ?? ''}${lastName?.[0] ?? ''}`.trim()
  return (value || email?.[0] || '?').toUpperCase()
}

export function getDisplayName(
  firstName?: string | null,
  lastName?: string | null,
  email?: string | null,
): string {
  return [firstName, lastName].filter(Boolean).join(' ') || email || 'Utilisateur'
}
