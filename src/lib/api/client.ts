import axios, { type InternalAxiosRequestConfig } from 'axios'

import { AUTH_LOGOUT_EVENT, clearTokens, getAccessToken, getRefreshToken, setTokens } from '@/lib/auth-token'
import { API_BASE_URL } from '@/lib/env'

import type { TokenPair } from './types'

type RetryableRequestConfig = InternalAxiosRequestConfig & { _retry?: boolean }

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 20_000,
})

let refreshPromise: Promise<string | null> | null = null

export async function refreshAccessToken(): Promise<string | null> {
  const refresh = getRefreshToken()
  if (!refresh) return null

  try {
    const { data } = await axios.post<TokenPair>(
      `${API_BASE_URL}/auth/token/refresh/`,
      { refresh },
      { headers: { 'Content-Type': 'application/json' }, timeout: 15_000 },
    )
    setTokens({ access: data.access, refresh: data.refresh ?? refresh })
    return data.access
  } catch {
    clearTokens()
    return null
  }
}

api.interceptors.request.use((config) => {
  const accessToken = getAccessToken()
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`
  }
  // Axios doit positionner lui-même le boundary multipart pour les fichiers.
  if (typeof FormData !== 'undefined' && config.data instanceof FormData) {
    delete config.headers['Content-Type']
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  async (error: unknown) => {
    if (!axios.isAxiosError(error)) {
      return Promise.reject(error)
    }

    const original = error.config as RetryableRequestConfig | undefined
    const status = error.response?.status
    const url = original?.url ?? ''
    const isAuthEndpoint =
      url.includes('/auth/login/') ||
      url.includes('/auth/token/refresh/') ||
      url.includes('/auth/register/')

    if (
      status === 401 &&
      original &&
      !original._retry &&
      !isAuthEndpoint &&
      getRefreshToken()
    ) {
      original._retry = true
      refreshPromise ??= refreshAccessToken().finally(() => {
        refreshPromise = null
      })
      const accessToken = await refreshPromise

      if (accessToken) {
        original.headers.Authorization = `Bearer ${accessToken}`
        return api(original)
      }

      window.dispatchEvent(new Event(AUTH_LOGOUT_EVENT))
    }

    return Promise.reject(error)
  },
)
