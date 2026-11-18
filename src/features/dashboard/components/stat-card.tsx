import { ArrowDownRightIcon, ArrowUpRightIcon } from 'lucide-react'

import type { DashboardKpi } from '@/features/dashboard/dashboard-data'
import { cn } from '@/lib/utils'

export function StatCard({ kpi }: { kpi: DashboardKpi }) {
  const positive = kpi.trendDirection !== 'down'
  const TrendIcon = positive ? ArrowUpRightIcon : ArrowDownRightIcon

  return (
    <article className="flex min-h-[98px] flex-col justify-between gap-2 rounded-card bg-deep p-5 text-ink-deep shadow-card">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-medium tracking-[0.04em] uppercase">{kpi.label}</p>
        {kpi.badge && (
          <span className="rounded-pill bg-badge-on-deep px-2.5 py-1 text-[11px] font-medium whitespace-nowrap">
            {kpi.badge}
          </span>
        )}
      </div>

      <p className="tabular text-3xl leading-[1.1] font-bold">
        {kpi.value}
        {kpi.unit && <span className="ml-1 text-sm font-medium text-ink-deep-muted">{kpi.unit}</span>}
      </p>

      <div className="flex items-center justify-between gap-2 text-xs">
        <span className="text-ink-deep-muted">{kpi.description}</span>
        {kpi.trend && (
          <span
            className={cn(
              'inline-flex items-center gap-0.5 font-medium whitespace-nowrap',
              positive ? 'text-badge-high' : 'text-destructive',
            )}
          >
            <TrendIcon className="size-3.5" aria-hidden="true" />
            {kpi.trend}
          </span>
        )}
      </div>
    </article>
  )
}
