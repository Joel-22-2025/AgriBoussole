import { api } from './client'
import type {
  EntrepreneurRegisterPayload,
  EntrepreneurRegisterResponse,
  LoginPayload,
  MeResponse,
  MessageResponse,
  SaeiRegisterPayload,
  TokenPair,
} from './types'

export async function loginRequest(payload: LoginPayload): Promise<TokenPair> {
  const { data } = await api.post<TokenPair>('/auth/login/', payload)
  return data
}

export async function fetchMe(): Promise<MeResponse> {
  const { data } = await api.get<MeResponse>('/auth/me/')
  return data
}

export async function logoutRequest(refresh: string): Promise<MessageResponse> {
  const { data } = await api.post<MessageResponse>('/auth/logout/', { refresh })
  return data
}

export async function registerEntrepreneurRequest(
  payload: EntrepreneurRegisterPayload,
): Promise<EntrepreneurRegisterResponse> {
  const { data } = await api.post<EntrepreneurRegisterResponse>(
    '/auth/register/entrepreneur/',
    payload,
  )
  return data
}

export async function registerSaeiRequest(payload: SaeiRegisterPayload): Promise<MessageResponse> {
  const form = new FormData()
  Object.entries(payload).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return
    if (typeof value === 'boolean') form.append(key, value ? 'true' : 'false')
    else if (value instanceof File) form.append(key, value)
    else form.append(key, String(value))
  })
  const { data } = await api.post<MessageResponse>('/auth/register/saei/', form)
  return data
}

export async function updateProfileRequest(payload: FormData): Promise<MeResponse> {
  const { data } = await api.patch<MeResponse>('/auth/me/', payload)
  return data
}
