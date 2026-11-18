export type Role = 'ADMIN' | 'SAEI' | 'ENTREPRENEUR'
export type AccountStatus = 'PENDING' | 'APPROVED' | 'REJECTED'
export type Pays = 'BJ' | 'SN' | 'CI'
export type TypeProfil =
  | 'individuel'
  | 'startup'
  | 'cooperative'
  | 'organisation_paysanne'
  | 'pme'
  | 'etudiant'

export type PhaseKey =
  | 'IDEATION'
  | 'CREATION'
  | 'INCUBATION'
  | 'ACCELERATION'
  | 'DEVELOPPEMENT'
  | 'CROISSANCE'
  | 'PASSAGE_ECHELLE'

export const PHASE_LABELS: Record<PhaseKey, string> = {
  IDEATION: 'Idéation',
  CREATION: 'Création',
  INCUBATION: 'Incubation',
  ACCELERATION: 'Accélération',
  DEVELOPPEMENT: 'Développement / Croissance',
  CROISSANCE: 'Croissance',
  PASSAGE_ECHELLE: 'Passage à l’échelle',
}

export const PAYS_LABELS: Record<Pays, string> = {
  BJ: 'Bénin',
  SN: 'Sénégal',
  CI: "Côte d'Ivoire",
}

export const TYPE_PROFIL_LABELS: Record<TypeProfil, string> = {
  individuel: 'Individuel',
  startup: 'Startup',
  cooperative: 'Coopérative',
  organisation_paysanne: 'Organisation paysanne',
  pme: 'PME',
  etudiant: 'Étudiant',
}

export const ROLE_LABELS: Record<Role, string> = {
  ADMIN: 'Administrateur',
  SAEI: 'SAEI',
  ENTREPRENEUR: 'Entrepreneur',
}

export const STATUS_LABELS: Record<AccountStatus, string> = {
  PENDING: 'En attente',
  APPROVED: 'Approuvé',
  REJECTED: 'Rejeté',
}

export interface User {
  id: number
  email: string
  first_name: string
  last_name: string
  phone: string
  role: Role
  status: AccountStatus
  is_active: boolean
  is_staff: boolean
  date_joined: string
}

export interface EntrepreneurProfile {
  pays: Pays
  ville: string
  type_profil: TypeProfil
  est_femme: boolean
  est_jeune: boolean
  filiere: string
  photo_profil: string | null
  phase: PhaseKey | null
  score_phase: number | null
  phase_answers: Record<string, string>
  phase_completed_at: string | null
}

export interface PhaseResult {
  phase: PhaseKey | null
  label: string | null
  score: number | null
  max_score: number
  range: string | null
  orientation: string | null
  stade: string | null
  answers: Record<string, string>
  completed_at: string | null
}

export interface PhaseEvaluationResponse extends PhaseResult {
  profile: EntrepreneurProfile
}

export interface StructureRecommendation extends Structure {
  match_score: number
  match_reasons: string[]
}

export interface PhaseRecommendationsResponse {
  pays: Pays
  ville: string
  phase: PhaseKey | null
  stade: string | null
  fallback_all_pays: boolean
  count: number
  results: StructureRecommendation[]
}

export interface SaeiProfile {
  structure: number | null
  nom_structure_demandee: string
  nom_structure: string | null
  logo: string | null
  email_structure: string | null
  site_web: string | null
  pays: Pays
  ville: string
  telephone_structure: string
  justificatif: string | null
  message: string
}

export interface MeResponse {
  user: User
  profile: EntrepreneurProfile | SaeiProfile | null
}

export interface TokenPair {
  access: string
  refresh?: string
}

export interface LoginPayload {
  email: string
  password: string
}

export interface EntrepreneurRegisterPayload {
  email: string
  password: string
  first_name?: string
  last_name?: string
  phone?: string
  pays: Pays
  ville: string
  type_profil: TypeProfil
  est_femme?: boolean
  est_jeune?: boolean
  filiere?: string
}

export interface EntrepreneurRegisterResponse {
  message: string
  access: string
  refresh: string
  user: User
}

export interface MessageResponse {
  message: string
}

export interface Structure {
  id: number
  logo?: string | null
  nom: string
  pays: Pays
  ville_siege: string | null
  region_departement: string
  acronyme: string
  statut_juridique: string
  latitude: string | null
  longitude: string | null
  service: string
  public_cible: string
  stade: string
  besoin_couvert: string
  typologie: string
  specialisation: 'specialiste' | 'generaliste'
  zone_intervention: string
  site_web: string | null
  email_structure: string | null
  telephone_structure: string
  est_incubateur: boolean
  est_accelerateur: boolean
  est_recherche_innovation: boolean
  est_appui_technique: boolean
  est_structure_financement: boolean
  est_plateforme_reseau: boolean
  score_pertinence: number
  source: 'enquetee' | 'revue_documentaire'
  est_publiee: boolean
  date_maj: string | null
}

export interface Paginated<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

export interface Ville {
  id: number
  nom: string
  region: string
  latitude: string | null
  longitude: string | null
}

export interface ApiErrorBody {
  error: true
  message: string
  status?: AccountStatus
  errors?: Record<string, string[] | string>
}

export interface SaeiBrief {
  id: number
  nom_structure: string | null
  structure_id: number | null
  logo: string | null
  nom_structure_demandee: string
  pays: Pays
  ville: string
  telephone_structure: string
}

export interface EntrepreneurBrief {
  id: number
  user: {
    id: number
    email: string
    first_name: string
    last_name: string
    phone: string
    last_login: string | null
  }
  nom: string
  pays: Pays
  ville: string
  type_profil: TypeProfil
  filiere: string
  phase: PhaseKey | null
  score_phase: number | null
  photo_profil: string | null
}

export interface Offre {
  id: number
  saei: SaeiBrief
  titre: string
  programme: string
  description: string
  conditions_eligibilite: string
  type_offre: string
  date_limite: string | null
  statut: 'BROUILLON' | 'PUBLIEE' | 'CLOTUREE'
  created_at: string
  updated_at: string
  candidatures_count: number
}

export interface Candidature {
  id: number
  offre: Offre
  entrepreneur: EntrepreneurBrief
  message: string
  statut: 'ENVOYEE' | 'EN_COURS' | 'ACCEPTEE' | 'REFUSEE'
  created_at: string
}

export interface Commentaire {
  id: number
  auteur: string
  contenu: string
  created_at: string
}

export interface Indicateur {
  id: number
  saei: SaeiBrief
  titre: string
  contenu: string
  type_media: 'TEXTE' | 'IMAGE' | 'VIDEO'
  media: string | null
  created_at: string
  likes_count: number
  liked_by_me: boolean
  commentaires: Commentaire[]
}

export interface ChatMessage {
  id: number
  conversation: number
  sender: number
  sender_email: string
  sender_name: string
  content: string
  type_message: 'CHAT' | 'NOTIFICATION' | 'DEMANDE_INSERTION'
  is_read: boolean
  created_at: string
  is_mine: boolean
}

export interface Conversation {
  id: number
  entrepreneur: EntrepreneurBrief
  saei: SaeiBrief
  sujet: string
  created_at: string
  updated_at: string
  last_message: ChatMessage | null
  unread_count: number
}

export interface MembreEquipe {
  id: number
  entrepreneur: EntrepreneurBrief
  role: string
  created_at: string
  note_moyenne: number | null
  taches_count: number
}

export interface Tache {
  id: number
  membre: number
  membre_detail: { id: number; entrepreneur: EntrepreneurBrief }
  titre: string
  description: string
  type_tache: 'TACHE' | 'FORMATION'
  statut: 'A_FAIRE' | 'EN_COURS' | 'TERMINEE'
  date_echeance: string | null
  created_at: string
}

export interface EvaluationEquipe {
  id: number
  saei: SaeiBrief
  entrepreneur: EntrepreneurBrief
  note: number
  commentaire: string
  created_at: string
  updated_at: string
}

export interface SaeiDashboard {
  entrepreneurs: number
  entrepreneurs_connectes: number
  offres: number
  candidatures: number
  indicateurs: number
  messages_non_lus: number
  note_moyenne: number | null
  structure: SaeiBrief
}

export interface SaeiRegisterPayload {
  email: string
  password: string
  first_name?: string
  last_name?: string
  phone?: string
  nom_structure: string
  pays: Pays
  ville: string
  region_departement: string
  zone_intervention: string
  acronyme: string
  statut_juridique: string
  est_incubateur: boolean
  est_accelerateur: boolean
  est_recherche_innovation: boolean
  est_appui_technique: boolean
  est_structure_financement: boolean
  est_plateforme_reseau: boolean
  service: string
  public_cible: string
  stade: string
  contact_nom: string
  contact_fonction: string
  contact_email: string
  contact_telephone: string
  email_structure?: string
  telephone_structure: string
  site_web?: string
  justificatif?: File | null
  logo?: File | null
  message?: string
}
