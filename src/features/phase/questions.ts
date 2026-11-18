export interface PhaseQuestionOption {
  value: 'A' | 'B' | 'C' | 'D'
  label: string
}

export interface PhaseQuestion {
  id: 'q1' | 'q2' | 'q3' | 'q4' | 'q5' | 'q6' | 'q7'
  title: string
  options: PhaseQuestionOption[]
}

/** Les 7 questions du quiz. Le barème est appliqué par le backend. */
export const PHASE_QUESTIONS: PhaseQuestion[] = [
  {
    id: 'q1',
    title: 'Votre idée est-elle formalisée ?',
    options: [
      { value: 'A', label: 'Simple intuition, rien d’écrit' },
      { value: 'B', label: 'Quelques notes, mais pas de document structuré' },
      { value: 'C', label: 'Document écrit (note de concept, canvas)' },
      { value: 'D', label: 'Business plan complet et validé' },
    ],
  },
  {
    id: 'q2',
    title: 'Avez-vous déjà testé votre offre auprès de clients réels ?',
    options: [
      { value: 'A', label: 'Jamais testé' },
      { value: 'B', label: 'Quelques entretiens informels' },
      { value: 'C', label: 'Test / prototype testé avec des clients pilotes' },
      { value: 'D', label: 'Ventes réelles récurrentes' },
    ],
  },
  {
    id: 'q3',
    title: 'Votre structure est-elle officiellement enregistrée ?',
    options: [
      { value: 'A', label: 'Aucune structure' },
      { value: 'B', label: 'Démarches en cours' },
      {
        value: 'C',
        label: 'Structure enregistrée (RCCM/IFU) récemment (< 2 ans)',
      },
      { value: 'D', label: 'Structure enregistrée et opérationnelle (> 2 ans)' },
    ],
  },
  {
    id: 'q4',
    title: 'Avez-vous des clients payants réguliers ?',
    options: [
      { value: 'A', label: 'Aucun client payant' },
      { value: 'B', label: '1 à 5 clients occasionnels' },
      { value: 'C', label: 'Portefeuille de clients réguliers' },
      { value: 'D', label: 'Revenus stables et prévisibles' },
    ],
  },
  {
    id: 'q5',
    title: 'Votre équipe est-elle constituée ?',
    options: [
      { value: 'A', label: 'Seul(e), pas d’équipe' },
      { value: 'B', label: 'Associé(s) identifié(s) mais rôle non formalisé' },
      { value: 'C', label: 'Équipe complète avec rôles définis' },
      { value: 'D', label: 'Équipe salariée / renforcée et opérationnelle' },
    ],
  },
  {
    id: 'q6',
    title: 'Avez-vous déjà levé des financements ou mobilisé des ressources ?',
    options: [
      { value: 'A', label: 'Aucun financement' },
      { value: 'B', label: 'Financement informel (famille, épargne)' },
      { value: 'C', label: 'Subvention / prêt / fonds propres structuré' },
      { value: 'D', label: 'Levée de fonds ou financement bancaire significatif' },
    ],
  },
  {
    id: 'q7',
    title: 'Quelle est votre dynamique de croissance actuelle ?',
    options: [
      { value: 'A', label: 'Pas encore de croissance mesurable' },
      { value: 'B', label: 'Premiers signes de traction (croissance irrégulière)' },
      { value: 'C', label: 'Croissance régulière et mesurée' },
      {
        value: 'D',
        label: 'Croissance forte et recherche de nouveaux marchés / réplication',
      },
    ],
  },
]

export const PHASE_QUESTION_IDS = PHASE_QUESTIONS.map((question) => question.id)
