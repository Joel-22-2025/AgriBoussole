import { api } from './client'
import type { Paginated, Structure, Ville } from './types'

export interface StructureFilters {
  search?: string
  pays?: string
  ville?: string
  typologie?: string
  cible?: string
  stade?: string
  page?: number
}

export interface VilleFilters {
  pays?: string
  region?: string
}

export async function fetchStructures(
  params: StructureFilters = {},
): Promise<Paginated<Structure>> {
  const { data } = await api.get<Paginated<Structure>>('/structures/', {
    params: {
      search: params.search || undefined,
      pays: params.pays || undefined,
      ville: params.ville || undefined,
      typologie: params.typologie || undefined,
      cible: params.cible || undefined,
      stade: params.stade || undefined,
      page: params.page || undefined,
    },
  })
  return data
}

export async function fetchStructure(id: number): Promise<Structure> {
  const { data } = await api.get<Structure>(`/structures/${id}/`)
  return data
}

/** Villes de référence, filtrées par pays puis par région/département. */
export async function fetchVilles(filters: VilleFilters = {}): Promise<Ville[]> {
  const { data } = await api.get<Paginated<Ville> | Ville[]>('/villes/', {
    params: {
      pays: filters.pays || undefined,
      region: filters.region || undefined,
    },
  })
  return Array.isArray(data) ? data : data.results
}

/** Publics cibles distincts relevés dans la base des structures. */
export async function fetchPublicsCibles(): Promise<string[]> {
  const { data } = await api.get<string[]>('/publics-cibles/')
  return data
}
