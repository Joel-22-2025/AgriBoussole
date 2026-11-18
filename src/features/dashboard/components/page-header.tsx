import type { ReactNode } from 'react'

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string
  title: string
  description?: string
  actions?: ReactNode
}) {
  return (
    <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0">
        {eyebrow && <p className="text-sm text-ink-muted">{eyebrow}</p>}
        <h1 className="text-2xl leading-[1.25] font-semibold tracking-tight text-ink-strong">
          {title}
        </h1>
        {description && <p className="mt-1 max-w-2xl text-sm text-ink-muted">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
    </div>
  )
}

export function LivePill({ date }: { date: string }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-pill bg-live px-3 py-1.5 text-xs font-medium text-brand-hover">
      <span className="size-1.5 rounded-full bg-brand" aria-hidden="true" />
      Données à jour · {date}
    </span>
  )
}
