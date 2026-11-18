import dashboardMock from '@/mocks/dashboard.json'

export interface DashboardKpi {
  label: string
  value: number | string
  unit?: string
  badge?: string
  description: string
  trend?: string
  trendDirection?: 'up' | 'down'
}

export interface ChartSegment {
  name: string
  value: number
  color?: string
}

export interface DashboardActivity {
  indicateurs: Array<{ label: string; value: string }>
  series: Array<{ jour: string; recommandations: number; objectif: number }>
  analyse: Array<{ label: string; value: string }>
}

export interface StatusRow {
  name: string
  value: number
  upToDate: boolean
}

export interface DashboardData {
  updatedAt: string
  kpis: Record<'structures' | 'demandes' | 'entrepreneurs' | 'completude', DashboardKpi>
  superAdminKpis: Record<
    'administrateurs' | 'imports' | 'recommandations' | 'tauxValidation',
    DashboardKpi
  >
  structuresParPays: ChartSegment[]
  structuresParTypologie: ChartSegment[]
  statutPays: StatusRow[]
  activite: DashboardActivity
  besoins: Array<{ label: string; value: number }>
  couverture: Array<{ ville: string; structures: number }>
  stades: Array<{ label: string; value: number }>
  journal: Array<{ date: string; auteur: string; action: string }>
}

/**
 * Données de démonstration utilisées tant que `GET /api/admin/dashboard/`
 * n'existe pas côté backend (section 7.6 de la charte).
 */
export const dashboardMockData = dashboardMock as DashboardData

export function formatDashboardDate(value: string): string {
  return new Date(value).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}
