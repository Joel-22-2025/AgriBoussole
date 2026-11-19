import { useEffect, useState } from 'react'

import { useAuth } from '@/features/auth/use-auth'
import { fetchConversations, fetchNotifications } from '@/lib/api/engagement'

/**
 * Nombre total de messages et notifications non lus de l'utilisateur connecté.
 * Rafraîchi périodiquement pour refléter l'activité sans maintenir de WebSocket.
 */
export function useUnreadCount(): number {
  const { state } = useAuth()
  const [count, setCount] = useState(0)
  const userId = state.user?.id
  const role = state.user?.role

  useEffect(() => {
    if (!userId) return

    let active = true
    async function load() {
      try {
        const [conversations, notifications] = await Promise.all([
          fetchConversations(),
          fetchNotifications(true),
        ])
        if (!active) return
        const unreadMessages = conversations.results.reduce(
          (total, conversation) => total + conversation.unread_count,
          0,
        )
        setCount(unreadMessages + (notifications.count ?? 0))
      } catch {
        // Une erreur réseau ne doit jamais bloquer la navigation.
        if (active) setCount(0)
      }
    }

    void load()
    const timer = window.setInterval(() => void load(), 30_000)
    return () => {
      active = false
      window.clearInterval(timer)
    }
  }, [userId, role])

  return userId ? count : 0
}
