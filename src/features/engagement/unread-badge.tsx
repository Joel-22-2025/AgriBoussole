import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface UnreadBadgeProps {
  count: number
  className?: string
}

/** Pastille de nombre de messages non lus, positionnée par le parent. */
export function UnreadBadge({ count, className }: UnreadBadgeProps) {
  if (count <= 0) return null
  return (
    <Badge
      variant="secondary"
      aria-hidden="true"
      className={cn('px-1.5 text-[10px] tabular', className)}
    >
      {count > 99 ? '99+' : count}
    </Badge>
  )
}
