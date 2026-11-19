import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import { App } from '@/App'
import { PwaUpdatePrompt } from '@/components/pwa-update-prompt'
import { Toaster } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { AuthProvider } from '@/features/auth/auth-provider'
import { GlobalTranslator, I18nProvider } from '@/i18n/i18n'
import '@/index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <I18nProvider>
      <AuthProvider>
        <TooltipProvider delayDuration={300}>
          <GlobalTranslator />
          <App />
          <PwaUpdatePrompt />
          <Toaster position="top-center" richColors closeButton />
        </TooltipProvider>
      </AuthProvider>
    </I18nProvider>
  </StrictMode>,
)
