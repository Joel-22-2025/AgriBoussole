import { useCallback, useEffect, useMemo, useReducer, useRef, type ReactNode } from 'react'

import {
  fetchMe,
  loginRequest,
  logoutRequest,
  registerEntrepreneurRequest,
  updateProfileRequest,
} from '@/lib/api/auth'
import { getApiError } from '@/lib/api/errors'
import { refreshAccessToken } from '@/lib/api/client'
import type { EntrepreneurRegisterPayload, Role, User } from '@/lib/api/types'
import {
  AUTH_LOGOUT_EVENT,
  clearTokens,
  getAccessToken,
  getRefreshToken,
  setTokens,
} from '@/lib/auth-token'

import { AuthContext, type AuthProfile, type AuthResult, type AuthState } from './auth-context'
import type { AuthContextValue } from './auth-context'

const initialState: AuthState = {
  status: 'initializing',
  user: null,
  profile: null,
  error: null,
  errorStatus: null,
}

type AuthAction =
  | { type: 'AUTHENTICATED'; user: User; profile: AuthProfile }
  | { type: 'ANONYMOUS' }
  | { type: 'ERROR'; message: string; status?: string | null }
  | { type: 'CLEAR_ERROR' }

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'AUTHENTICATED':
      return {
        status: 'authenticated',
        user: action.user,
        profile: action.profile,
        error: null,
        errorStatus: null,
      }
    case 'ANONYMOUS':
      return { ...initialState, status: 'anonymous' }
    case 'ERROR':
      return {
        ...state,
        status: state.user ? 'authenticated' : 'anonymous',
        error: action.message,
        errorStatus: action.status ?? null,
      }
    case 'CLEAR_ERROR':
      return { ...state, error: null, errorStatus: null }
  }
}

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [state, dispatch] = useReducer(authReducer, initialState)
  const bootstrapped = useRef(false)

  const loadProfile = useCallback(async () => {
    const me = await fetchMe()
    dispatch({ type: 'AUTHENTICATED', user: me.user, profile: me.profile })
    return me
  }, [])

  useEffect(() => {
    async function bootstrap() {
      if (bootstrapped.current) return
      bootstrapped.current = true

      if (!getRefreshToken()) {
        dispatch({ type: 'ANONYMOUS' })
        return
      }

      try {
        if (!getAccessToken()) {
          const accessToken = await refreshAccessToken()
          if (!accessToken) throw new Error('Session expirée.')
        }
        const me = await fetchMe()
        dispatch({ type: 'AUTHENTICATED', user: me.user, profile: me.profile })
      } catch {
        clearTokens()
        dispatch({ type: 'ANONYMOUS' })
      }
    }

    void bootstrap()
  }, [])

  useEffect(() => {
    function handleForcedLogout() {
      clearTokens()
      dispatch({ type: 'ANONYMOUS' })
    }
    window.addEventListener(AUTH_LOGOUT_EVENT, handleForcedLogout)
    return () => window.removeEventListener(AUTH_LOGOUT_EVENT, handleForcedLogout)
  }, [])

  const login = useCallback(async (email: string, password: string): Promise<AuthResult> => {
    dispatch({ type: 'CLEAR_ERROR' })
    try {
      const tokens = await loginRequest({ email, password })
      setTokens(tokens)
      const me = await loadProfile()
      return { ok: true, user: me.user, profile: me.profile }
    } catch (error) {
      clearTokens()
      const normalized = getApiError(error)
      dispatch({
        type: 'ERROR',
        message: normalized.message,
        status: normalized.status ?? null,
      })
      return {
        ok: false,
        error: normalized.message,
        status: normalized.status ?? null,
        fieldErrors: normalized.fieldErrors,
      }
    }
  }, [loadProfile])

  const registerEntrepreneur = useCallback(
    async (payload: EntrepreneurRegisterPayload): Promise<AuthResult> => {
      dispatch({ type: 'CLEAR_ERROR' })
      try {
        const result = await registerEntrepreneurRequest(payload)
        setTokens({ access: result.access, refresh: result.refresh })
        const me = await loadProfile()
        return { ok: true, user: me.user, profile: me.profile }
      } catch (error) {
        clearTokens()
        const normalized = getApiError(error)
        dispatch({
          type: 'ERROR',
          message: normalized.message,
          status: normalized.status ?? null,
        })
        return {
          ok: false,
          error: normalized.message,
          status: normalized.status ?? null,
          fieldErrors: normalized.fieldErrors,
        }
      }
    },
    [loadProfile],
  )

  const updateProfile = useCallback(async (payload: FormData) => {
    const me = await updateProfileRequest(payload)
    dispatch({ type: 'AUTHENTICATED', user: me.user, profile: me.profile })
  }, [])

  const logout = useCallback(async () => {
    const refresh = getRefreshToken()
    if (refresh) {
      try {
        await logoutRequest(refresh)
      } catch {
        // Le token est peut-être déjà expiré : on nettoie quand même la session locale.
      }
    }
    clearTokens()
    dispatch({ type: 'ANONYMOUS' })
  }, [])

  const refreshProfile = useCallback(async () => {
    try {
      await loadProfile()
    } catch (error) {
      const normalized = getApiError(error)
      dispatch({ type: 'ERROR', message: normalized.message })
    }
  }, [loadProfile])

  const clearError = useCallback(() => dispatch({ type: 'CLEAR_ERROR' }), [])

  const hasRole = useCallback(
    (...roles: Role[]) => Boolean(state.user && roles.includes(state.user.role)),
    [state.user],
  )

  const value = useMemo<AuthContextValue>(
    () => ({
      state,
      login,
      registerEntrepreneur,
      updateProfile,
      logout,
      refreshProfile,
      clearError,
      hasRole,
    }),
    [state, login, registerEntrepreneur, updateProfile, logout, refreshProfile, clearError, hasRole],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
