import { IndicatorFeed } from '@/features/engagement/indicator-feed'
import { PageHeader } from '@/features/dashboard/components/page-header'

export function EntrepreneurIndicatorsPage() {
  return (
    <div className="content-container">
      <PageHeader
        eyebrow="Entrepreneurs"
        title="Indicateurs des SAEI"
        description="Découvrez les résultats des structures accompagnantes, réagissez et échangez avec la communauté."
      />
      <div className="mt-5">
        <IndicatorFeed />
      </div>
    </div>
  )
}
