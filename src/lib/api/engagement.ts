import { api } from './client'
import type {
  Candidature,
  ChatMessage,
  Commentaire,
  Conversation,
  EntrepreneurBrief,
  EvaluationEquipe,
  Indicateur,
  MembreEquipe,
  Offre,
  Paginated,
  SaeiDashboard,
  Tache,
} from './types'

export async function fetchSaeiDashboard(): Promise<SaeiDashboard> {
  const { data } = await api.get<SaeiDashboard>('/engagement/saei/dashboard/')
  return data
}

export async function fetchSaeiEntrepreneurs(params: {
  connectes?: boolean
  search?: string
}): Promise<Paginated<EntrepreneurBrief>> {
  const { data } = await api.get<Paginated<EntrepreneurBrief>>(
    '/engagement/saei/entrepreneurs/',
    {
      params: {
        connectes: params.connectes ? 'true' : undefined,
        search: params.search || undefined,
      },
    },
  )
  return data
}

export async function notifyEntrepreneur(entrepreneurId: number, content: string) {
  const { data } = await api.post<ChatMessage>('/engagement/saei/notifier/', {
    entrepreneur_id: entrepreneurId,
    content,
  })
  return data
}

export async function fetchOffres(): Promise<Paginated<Offre>> {
  const { data } = await api.get<Paginated<Offre>>('/engagement/offres/')
  return data
}

export async function createOffre(payload: Record<string, unknown>): Promise<Offre> {
  const { data } = await api.post<Offre>('/engagement/offres/', payload)
  return data
}

export async function createCandidature(offreId: number, message: string): Promise<Candidature> {
  const { data } = await api.post<Candidature>('/engagement/candidatures/', {
    offre_id: offreId,
    message,
  })
  return data
}

export async function fetchCandidatures(): Promise<Paginated<Candidature>> {
  const { data } = await api.get<Paginated<Candidature>>('/engagement/candidatures/')
  return data
}

export async function updateCandidatureStatut(id: number, statut: string): Promise<Candidature> {
  const { data } = await api.patch<Candidature>(`/engagement/candidatures/${id}/statut/`, {
    statut,
  })
  return data
}

export async function fetchIndicateurs(): Promise<Paginated<Indicateur>> {
  const { data } = await api.get<Paginated<Indicateur>>('/engagement/indicateurs/')
  return data
}

export async function createIndicateur(payload: FormData | Record<string, unknown>): Promise<Indicateur> {
  const { data } = await api.post<Indicateur>('/engagement/indicateurs/', payload)
  return data
}

export async function toggleLike(indicateurId: number): Promise<{ liked: boolean; likes_count: number }> {
  const { data } = await api.post<{ liked: boolean; likes_count: number }>(
    `/engagement/indicateurs/${indicateurId}/like/`,
  )
  return data
}

export async function fetchCommentaires(indicateurId: number): Promise<Paginated<Commentaire>> {
  const { data } = await api.get<Paginated<Commentaire>>(
    `/engagement/indicateurs/${indicateurId}/commentaires/`,
  )
  return data
}

export async function addCommentaire(indicateurId: number, contenu: string): Promise<Commentaire> {
  const { data } = await api.post<Commentaire>(
    `/engagement/indicateurs/${indicateurId}/commentaires/`,
    { contenu },
  )
  return data
}

export async function fetchEquipe(): Promise<Paginated<MembreEquipe>> {
  const { data } = await api.get<Paginated<MembreEquipe>>('/engagement/equipe/')
  return data
}

export async function addMembreEquipe(entrepreneurId: number, role: string): Promise<MembreEquipe> {
  const { data } = await api.post<MembreEquipe>('/engagement/equipe/', {
    entrepreneur_id: entrepreneurId,
    role,
  })
  return data
}

export async function removeMembreEquipe(id: number): Promise<void> {
  await api.delete(`/engagement/equipe/${id}/`)
}

export async function fetchTaches(): Promise<Paginated<Tache>> {
  const { data } = await api.get<Paginated<Tache>>('/engagement/taches/')
  return data
}

export async function createTache(payload: Record<string, unknown>): Promise<Tache> {
  const { data } = await api.post<Tache>('/engagement/taches/', payload)
  return data
}

export async function updateTacheStatut(id: number, statut: string): Promise<Tache> {
  const { data } = await api.patch<Tache>(`/engagement/taches/${id}/statut/`, { statut })
  return data
}

export async function fetchEvaluations(): Promise<Paginated<EvaluationEquipe>> {
  const { data } = await api.get<Paginated<EvaluationEquipe>>('/engagement/evaluations/')
  return data
}

export async function createEvaluation(payload: {
  saei_id: number
  note: number
  commentaire?: string
}): Promise<EvaluationEquipe> {
  const { data } = await api.post<EvaluationEquipe>('/engagement/evaluations/', payload)
  return data
}

export async function fetchConversations(): Promise<Paginated<Conversation>> {
  const { data } = await api.get<Paginated<Conversation>>('/engagement/conversations/')
  return data
}

export async function fetchMessages(conversationId: number, after?: number): Promise<Paginated<ChatMessage>> {
  const { data } = await api.get<Paginated<ChatMessage>>(
    `/engagement/conversations/${conversationId}/messages/`,
    { params: { after: after || undefined } },
  )
  return data
}

export async function sendMessage(conversationId: number, content: string): Promise<ChatMessage> {
  const { data } = await api.post<ChatMessage>(
    `/engagement/conversations/${conversationId}/messages/`,
    { content },
  )
  return data
}

export async function fetchNotifications(unread = false): Promise<Paginated<ChatMessage>> {
  const { data } = await api.get<Paginated<ChatMessage>>('/engagement/notifications/', {
    params: { unread: unread ? 'true' : undefined },
  })
  return data
}

export async function markNotificationsRead(): Promise<{ updated: number }> {
  const { data } = await api.post<{ updated: number }>('/engagement/notifications/lire/')
  return data
}

export async function contactSaei(payload: {
  structure_id: number
  programme: string
  message: string
}): Promise<ChatMessage> {
  const { data } = await api.post<ChatMessage>('/engagement/contact-saei/', payload)
  return data
}
