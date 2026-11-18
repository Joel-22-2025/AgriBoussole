import { Loader2Icon } from 'lucide-react'

export function LoadingScreen({ label = 'Chargement…' }: { label?: string }) {
  return (
    <div
      className="flex min-h-[50svh] flex-col items-center justify-center gap-3 text-muted-foreground"
      role="status"
      aria-live="polite"
    >
      <Loader2Icon className="size-6 animate-spin" aria-hidden="true" />
      <p className="text-sm">{label}</p>
    </div>
  )
}
