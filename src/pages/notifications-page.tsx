import { BellIcon, CheckCheckIcon } from 'lucide-react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { PageHeader } from '@/features/dashboard/components/page-header'
import { getApiError } from '@/lib/api/errors'
import { fetchNotifications, markNotificationsRead } from '@/lib/api/engagement'
import { useAsync } from '@/lib/use-async'
import { formatDate } from '@/lib/utils'

const TYPE_LABELS: Record<string, string> = {
  CHAT: 'Message',
  NOTIFICATION: 'Notification',
  DEMANDE_INSERTION: 'Demande d’insertion',
}

function Notifications({ saei = false }: { saei?: boolean }) {
  const { data, loading, error, reload } = useAsync(fetchNotifications, [])
  const messagesPath = saei ? '/saei/messages' : '/messages'

  async function handleReadAll() {
    try {
      const result = await markNotificationsRead()
      toast.success(`${result.updated} notification(s) marquée(s) comme lue(s).`)
      await reload()
    } catch (cause) {
      toast.error(getApiError(cause).message)
    }
  }

  return (
    <div className="content-container">
      <PageHeader
        eyebrow={saei ? 'Espace SAEI' : 'Entrepreneurs'}
        title="Notifications"
        description="Messages et demandes reçus sur la plateforme."
        actions={
          <Button type="button" variant="outline" size="sm" onClick={() => void handleReadAll()} className="gap-2">
            <CheckCheckIcon className="size-4" />
            Tout marquer comme lu
          </Button>
        }
      />

      <div className="mt-5 flex max-w-3xl flex-col gap-3">
        {error && <p className="rounded-field bg-row px-4 py-3 text-sm text-ink-body">{error}</p>}
        {loading && !data && <p className="text-sm text-ink-muted">Chargement…</p>}
        {data?.results.length === 0 && (
          <Card>
            <CardContent className="py-10 text-center text-sm text-ink-muted">
              Aucune notification pour le moment.
            </CardContent>
          </Card>
        )}
        {data?.results.map((message) => (
          <Card key={message.id} className={message.is_read ? '' : 'ring-1 ring-brand'}>
            <CardContent className="flex flex-col gap-2 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-medium text-ink-strong">{message.sender_name}</p>
                <Badge variant="secondary" className="text-[10px]">
                  {TYPE_LABELS[message.type_message] ?? message.type_message}
                </Badge>
              </div>
              <p className="whitespace-pre-line text-sm text-ink-body">{message.content}</p>
              <div className="flex items-center justify-between gap-3">
                <p className="text-[11px] text-ink-muted">{formatDate(message.created_at)}</p>
                <Link to={`${messagesPath}?conversation=${message.conversation}`} className="inline-flex items-center gap-1 text-xs font-medium text-deep hover:underline">
                  <BellIcon className="size-3.5" />
                  Ouvrir la conversation
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

export function SaeiNotificationsPage() {
  return <Notifications saei />
}

export function EntrepreneurNotificationsPage() {
  return <Notifications />
}
