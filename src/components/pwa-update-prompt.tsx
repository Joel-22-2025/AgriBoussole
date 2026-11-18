import { useEffect } from 'react'
import { toast } from 'sonner'
import { useRegisterSW } from 'virtual:pwa-register/react'

export function PwaUpdatePrompt() {
  const {
    needRefresh: [needRefresh],
    offlineReady: [offlineReady],
    updateServiceWorker,
  } = useRegisterSW()

  useEffect(() => {
    if (offlineReady) {
      toast.success('Application prête à fonctionner hors ligne.')
    }
  }, [offlineReady])

  useEffect(() => {
    if (!needRefresh) return

    toast('Nouvelle version disponible', {
      description: 'Rechargez pour utiliser la dernière version d’AgriBoussole.',
      duration: Number.POSITIVE_INFINITY,
      action: {
        label: 'Recharger',
        onClick: () => {
          void updateServiceWorker(true)
        },
      },
    })
  }, [needRefresh, updateServiceWorker])

  return null
}
