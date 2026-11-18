import { IndicatorFeed } from '@/features/engagement/indicator-feed'
import { PageHeader } from '@/features/dashboard/components/page-header'

export function SaeiIndicatorsPage() {
  return (
    <div className="content-container">
      <PageHeader
        eyebrow="Espace SAEI"
        title="Indicateurs de performance"
        description="Publiez vos résultats sous forme de texte, d’image ou de vidéo et suivez les réactions des entrepreneurs."
      />
      <div className="mt-5">
        <IndicatorFeed showCreate />
      </div>
    </div>
  )
}
