import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import { App } from '@/App'
import { PwaUpdatePrompt } from '@/components/pwa-update-prompt'
import { Toaster } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { AuthProvider } from '@/features/auth/auth-provider'
import '@/index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <TooltipProvider delayDuration={300}>
        <App />
        <PwaUpdatePrompt />
        <Toaster position="top-center" richColors closeButton />
      </TooltipProvider>
    </AuthProvider>
  </StrictMode>,
)
