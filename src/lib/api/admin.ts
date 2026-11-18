import { api } from './client'
import type { AccountStatus, Paginated, Pays, Role } from './types'

export interface SaeiRequest {
  id: number
  user_id: number
  email: string
  first_name: string
  last_name: string
  nom_structure_demandee: string
  pays: Pays
  ville: string
  telephone_structure: string
  status: AccountStatus
  date_joined: string
  structure: {
    id: number
    nom: string
    pays: Pays
    est_publiee: boolean
  } | null
  justificatif: string | null
  message: string
}

export interface AdminUser {
  id: number
  email: string
  first_name: string
  last_name: string
  phone: string
  role: Role
  status: AccountStatus
  is_active: boolean
  pays: Pays | null
  date_joined: string
}

export interface SaeiRequestFilters {
  status?: AccountStatus
  pays?: Pays
  search?: string
  page?: number
}

export interface AdminUserFilters {
  role?: Role
  status?: AccountStatus
  pays?: Pays
  search?: string
  page?: number
}

export interface AdminCreatePayload {
  email: string
  password: string
  first_name?: string
  last_name?: string
}

export async function fetchSaeiRequests(
  params: SaeiRequestFilters = {},
): Promise<Paginated<SaeiRequest>> {
  const { data } = await api.get<Paginated<SaeiRequest>>('/admin/saei-requests/', {
    params: cleanParams(params),
  })
  return data
}

export async function approveSaeiRequest(
  id: number,
  structureId?: number,
): Promise<{ message: string; status: AccountStatus }> {
  const { data } = await api.post<{ message: string; status: AccountStatus }>(
    `/admin/saei-requests/${id}/approve/`,
    structureId ? { structure_id: structureId } : {},
  )
  return data
}

export async function rejectSaeiRequest(
  id: number,
  motif: string,
): Promise<{ message: string; status: AccountStatus }> {
  const { data } = await api.post<{ message: string; status: AccountStatus }>(
    `/admin/saei-requests/${id}/reject/`,
    { motif },
  )
  return data
}

export async function fetchAdminUsers(
  params: AdminUserFilters = {},
): Promise<Paginated<AdminUser>> {
  const { data } = await api.get<Paginated<AdminUser>>('/admin/users/', {
    params: cleanParams(params),
  })
  return data
}

export async function setUserActive(
  id: number,
  isActive: boolean,
): Promise<{ message: string; is_active: boolean }> {
  const { data } = await api.patch<{ message: string; is_active: boolean }>(
    `/admin/users/${id}/`,
    { is_active: isActive },
  )
  return data
}

export async function createAdmin(
  payload: AdminCreatePayload,
): Promise<{ message: string; user: AdminUser }> {
  const { data } = await api.post<{ message: string; user: AdminUser }>(
    '/admin/admins/',
    payload,
  )
  return data
}

export async function deleteAdmin(id: number): Promise<void> {
  await api.delete(`/admin/admins/${id}/`)
}

function cleanParams<T extends object>(params: T) {
  return Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== undefined && value !== ''),
  )
}
