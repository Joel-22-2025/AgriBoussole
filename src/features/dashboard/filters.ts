export interface DashboardFilters {
  pays: string
  typologie: string
  source: string
  periode: string
}

export const DEFAULT_FILTERS: DashboardFilters = {
  pays: '',
  typologie: '',
  source: '',
  periode: '30j',
}
