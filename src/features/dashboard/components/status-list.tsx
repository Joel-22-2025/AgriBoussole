import { cn } from '@/lib/utils'

export type StatusTone = 'success' | 'warning' | 'danger' | 'neutral'

export interface StatusListRow {
  name: string
  value: string | number
  tone?: StatusTone
  hint?: string
}

const toneClasses: Record<StatusTone, string> = {
  success: 'bg-badge-high',
  warning: 'bg-warning',
  danger: 'bg-destructive',
  neutral: 'bg-ink-muted',
}

export function StatusList({
  rows,
  label = 'Détail',
}: {
  rows: StatusListRow[]
  label?: string
}) {
  return (
    <ul aria-label={label} className="flex flex-col gap-2">
      {rows.map((row) => (
        <li
          key={row.name}
          className="flex items-center justify-between gap-3 rounded-field bg-row px-3.5 py-2.5 text-sm font-medium"
        >
          <span className="flex min-w-0 items-center gap-2">
            <span
              className={cn('size-2 shrink-0 rounded-full', toneClasses[row.tone ?? 'success'])}
              aria-hidden="true"
            />
            <span className="truncate text-ink-body">{row.name}</span>
            {row.hint && <span className="shrink-0 text-[11px] font-normal text-ink-muted">{row.hint}</span>}
          </span>
          <span className="tabular shrink-0 text-ink-strong">{row.value}</span>
        </li>
      ))}
    </ul>
  )
}
