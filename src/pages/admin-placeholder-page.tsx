import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

import { PageHeader } from '@/features/dashboard/components/page-header'

export function AdminPlaceholderPage({
  eyebrow = 'Administration',
  title,
  description,
  icon: Icon,
  note,
  children,
}: {
  eyebrow?: string
  title: string
  description: string
  icon: LucideIcon
  note: string
  children?: ReactNode
}) {
  return (
    <div className="content-container">
      <PageHeader eyebrow={eyebrow} title={title} description={description} />

      <section className="rounded-card bg-card p-8 text-center shadow-card ring-1 ring-border">
        <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-live text-brand-hover">
          <Icon className="size-6" aria-hidden="true" />
        </div>
        <h2 className="text-lg font-semibold text-ink-strong">Fonctionnalité en préparation</h2>
        <p className="mx-auto mt-1 max-w-xl text-sm text-ink-muted">{note}</p>
        {children && <div className="mt-5 flex flex-wrap justify-center gap-2">{children}</div>}
      </section>
    </div>
  )
}
