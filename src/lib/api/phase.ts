import { api } from './client'
import type {
  PhaseEvaluationResponse,
  PhaseRecommendationsResponse,
  PhaseResult,
} from './types'

export interface PhaseAnswers {
  q1: string
  q2: string
  q3: string
  q4: string
  q5: string
  q6: string
  q7: string
}

export async function fetchPhaseResult(): Promise<PhaseResult> {
  const { data } = await api.get<PhaseResult>('/auth/entrepreneurs/phase/')
  return data
}

export async function submitPhaseAnswers(
  answers: PhaseAnswers,
): Promise<PhaseEvaluationResponse> {
  const { data } = await api.post<PhaseEvaluationResponse>('/auth/entrepreneurs/phase/', {
    answers,
  })
  return data
}

export async function fetchPhaseRecommendations(): Promise<PhaseRecommendationsResponse> {
  const { data } = await api.get<PhaseRecommendationsResponse>(
    '/auth/entrepreneurs/phase/recommandations/',
  )
  return data
}
