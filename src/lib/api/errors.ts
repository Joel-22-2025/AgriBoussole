import axios from 'axios'

import type { AccountStatus, ApiErrorBody } from './types'

export interface NormalizedApiError {
  message: string
  status?: AccountStatus
  fieldErrors: Record<string, string[]>
}

export function getApiError(error: unknown): NormalizedApiError {
  if (axios.isAxiosError<ApiErrorBody>(error)) {
    const body = error.response?.data
    if (body && typeof body === 'object' && 'message' in body) {
      return {
        message: body.message,
        status: body.status,
        fieldErrors: normalizeFieldErrors(body.errors),
      }
    }
    if (error.code === 'ECONNABORTED' || error.code === 'ERR_NETWORK') {
      return {
        message:
          'Impossible de joindre le serveur. Vérifiez votre connexion et que le backend est démarré.',
        fieldErrors: {},
      }
    }
    return {
      message: error.message || 'Une erreur inattendue est survenue.',
      fieldErrors: {},
    }
  }
  if (error instanceof Error) {
    return { message: error.message, fieldErrors: {} }
  }
  return { message: 'Une erreur inattendue est survenue.', fieldErrors: {} }
}

function normalizeFieldErrors(
  errors: ApiErrorBody['errors'],
): Record<string, string[]> {
  if (!errors) return {}
  return Object.fromEntries(
    Object.entries(errors).map(([field, value]) => [
      field,
      Array.isArray(value) ? value : [value],
    ]),
  )
}
