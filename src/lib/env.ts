const rawBaseUrl = import.meta.env.VITE_API_URL?.trim() || 'http://127.0.0.1:8000'

const cleanedBaseUrl = rawBaseUrl.replace(/\/+$/, '')

// VITE_API_URL peut être renseigné avec ou sans le suffixe /api : on évite
// ainsi les appels /api/api/... qui se terminent en 404.
export const API_BASE_URL = cleanedBaseUrl.endsWith('/api')
  ? cleanedBaseUrl
  : `${cleanedBaseUrl}/api`
export const APP_NAME = import.meta.env.VITE_APP_NAME?.trim() || 'AgriBoussole'
