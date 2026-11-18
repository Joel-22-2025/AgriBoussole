import { createContext } from 'react'

import type {
  EntrepreneurProfile,
  EntrepreneurRegisterPayload,
  Role,
  SaeiProfile,
  User,
} from '@/lib/api/types'

export type AuthStatus = 'initializing' | 'authenticated' | 'anonymous'
export type AuthProfile = EntrepreneurProfile | SaeiProfile | null

export type AuthResult =
  | { ok: true; user: User; profile: AuthProfile }
  | {
      ok: false
      error: string
      status?: string | null
      fieldErrors: Record<string, string[]>
    }

export interface AuthState {
  status: AuthStatus
  user: User | null
  profile: AuthProfile
  error: string | null
  errorStatus: string | null
}

export interface AuthContextValue {
  state: AuthState
  login: (email: string, password: string) => Promise<AuthResult>
  registerEntrepreneur: (payload: EntrepreneurRegisterPayload) => Promise<AuthResult>
  updateProfile: (payload: FormData) => Promise<void>
  logout: () => Promise<void>
  refreshProfile: () => Promise<void>
  clearError: () => void
  hasRole: (...roles: Role[]) => boolean
}

export const AuthContext = createContext<AuthContextValue | null>(null)
