const ACCESS_TOKEN_KEY = 'agriboussole.access'
const REFRESH_TOKEN_KEY = 'agriboussole.refresh'

export const AUTH_LOGOUT_EVENT = 'agriboussole:logout'

function safeGet(key: string): string | null {
  try {
    return window.localStorage.getItem(key)
  } catch {
    return null
  }
}

function safeSet(key: string, value: string): void {
  try {
    window.localStorage.setItem(key, value)
  } catch {
    // Stockage indisponible (navigation privée, quota) : la session reste en mémoire.
  }
}

function safeRemove(key: string): void {
  try {
    window.localStorage.removeItem(key)
  } catch {
    // Rien à faire.
  }
}

export function getAccessToken(): string | null {
  return safeGet(ACCESS_TOKEN_KEY)
}

export function getRefreshToken(): string | null {
  return safeGet(REFRESH_TOKEN_KEY)
}

export function setTokens(tokens: { access: string; refresh?: string }): void {
  safeSet(ACCESS_TOKEN_KEY, tokens.access)
  if (tokens.refresh) {
    safeSet(REFRESH_TOKEN_KEY, tokens.refresh)
  }
}

export function clearTokens(): void {
  safeRemove(ACCESS_TOKEN_KEY)
  safeRemove(REFRESH_TOKEN_KEY)
}
