import { useState } from 'react'

import { AdminSelect } from '@/features/admin/admin-select'
import { PendingRequests } from '@/features/admin/pending-requests'
import { PageHeader } from '@/features/dashboard/components/page-header'
import { STATUS_LABELS, type AccountStatus } from '@/lib/api/types'

const STATUSES = Object.entries(STATUS_LABELS).map(([value, label]) => ({ value, label }))

export function SaeiRequestsPage() {
  const [status, setStatus] = useState<AccountStatus | ''>('PENDING')

  return (
    <div className="content-container">
      <PageHeader
        eyebrow="Administration"
        title="Demandes SAEI"
        description="Examinez, approuvez ou refusez les demandes d’accréditation."
      />

      <section className="mb-5 rounded-card bg-card p-5 shadow-filter ring-1 ring-border">
        <div className="max-w-xs">
          <AdminSelect
            label="Statut"
            value={status}
            onChange={(value) => setStatus(value as AccountStatus | '')}
            options={[{ value: '', label: 'Toutes les demandes' }, ...STATUSES]}
          />
        </div>
      </section>

      <PendingRequests
        key={status || 'all'}
        status={status}
        title={status ? `Demandes ${STATUS_LABELS[status].toLowerCase()}` : 'Toutes les demandes'}
        description="Validation des comptes SAEI et publication des structures associées."
      />
    </div>
  )
}
