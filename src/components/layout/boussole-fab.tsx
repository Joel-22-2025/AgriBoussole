import { CompassIcon, SparklesIcon } from 'lucide-react'
import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'

import { buttonVariants } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useAuth } from '@/features/auth/use-auth'
import { useI18n } from '@/i18n/i18n'

/** Bouton flottant d'accès à Boussole, avec invitation à se connecter pour les visiteurs. */
export function BoussoleFab() {
  const { state } = useAuth()
  const { pathname } = useLocation()
  const { t } = useI18n()
  const [open, setOpen] = useState(false)

  const role = state.user?.role
  const isAuthenticated = Boolean(state.user)
  const to = role === 'SAEI' ? '/saei/assistant' : '/assistant'

  if (isAuthenticated && role !== 'ENTREPRENEUR' && role !== 'SAEI') return null
  if (isAuthenticated && pathname === to) return null

  const label = t('Je suis votre boussole IA')
  const sharedClass =
    'fixed right-4 bottom-4 z-50 inline-flex items-center gap-2 rounded-pill bg-deep px-4 py-3 text-sm font-medium text-ink-deep shadow-card transition-transform hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand sm:right-6 sm:bottom-6'

  const content = (
    <>
      <CompassIcon className="size-5" aria-hidden="true" />
      {label}
    </>
  )

  return (
    <>
      {isAuthenticated ? (
        <Link
          to={to}
          aria-label={t('Boussole, votre assistant intelligent')}
          className={sharedClass}
        >
          {content}
        </Link>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label={t('Boussole, votre assistant intelligent')}
          className={sharedClass}
        >
          {content}
        </button>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="rounded-card sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg">
              <SparklesIcon className="size-5 text-brand-hover" aria-hidden="true" />
              {t('Boussole IA')}
            </DialogTitle>
            <DialogDescription>
              {t('Connectez-vous ou créez un compte pour utiliser Boussole IA.')}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col gap-2 sm:flex-row">
            <DialogClose asChild>
              <Link
                to="/connexion"
                className={buttonVariants({ variant: 'outline' })}
                data-i18n-ignore
              >
                {t('Se connecter')}
              </Link>
            </DialogClose>
            <DialogClose asChild>
              <Link to="/inscription/entrepreneur" className={buttonVariants()} data-i18n-ignore>
                {t('Créer mon compte')}
              </Link>
            </DialogClose>
          </DialogFooter>
          <p className="text-center text-xs text-ink-muted">
            <Link to="/inscription/saei" className="underline-offset-4 hover:underline" data-i18n-ignore>
              {t('Devenir une SAEI')}
            </Link>
          </p>
        </DialogContent>
      </Dialog>
    </>
  )
}
