import { ArrowRightIcon, CompassIcon, SproutIcon, UsersIcon } from 'lucide-react'
import { Link } from 'react-router-dom'

import { LanguageSwitcher } from '@/components/layout/language-switcher'
import { useAuth } from '@/features/auth/use-auth'
import { APP_NAME } from '@/lib/env'
import { cn } from '@/lib/utils'

import { getHomePath } from './navigation'

const CURRENT_YEAR = new Date().getFullYear()

const DISCOVER_LINKS = [
  { to: '/', label: 'Accueil' },
  { to: '/structures', label: 'Annuaire des structures' },
  { to: '/#comment-ca-marche', label: 'Comment ça marche' },
  { to: '/#profils', label: 'Les deux profils' },
]

const JOIN_LINKS = [
  { to: '/inscription/entrepreneur', label: 'Profil entrepreneur' },
  { to: '/inscription/saei', label: 'Rejoindre le réseau SAEI' },
  { to: '/connexion', label: 'Se connecter' },
]

interface AppFooterProps {
  variant?: 'full' | 'compact'
}

export function AppFooter({ variant = 'full' }: AppFooterProps) {
  const { state } = useAuth()
  const user = state.user
  const joinLinks = JOIN_LINKS.filter((link) => !user || link.to !== '/inscription/saei')
  const accountLinks = user
    ? [
        {
          to: getHomePath(user.role),
          label: user.role === 'ENTREPRENEUR' ? 'Ma phase' : 'Mon espace',
        },
        { to: '/profil', label: 'Mon profil' },
      ]
    : [{ to: '/connexion', label: 'Se connecter' }]

  const isCompact = variant === 'compact'

  return (
    <footer
      className={cn(
        'border-t border-border bg-card',
        isCompact ? 'mt-8' : 'mt-auto',
      )}
    >
      <div className="content-container px-4 md:px-6">
        {!isCompact && (
          <div className="grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr] lg:py-14">
            <div className="max-w-sm">
              <Link to="/" className="flex items-center gap-2.5" aria-label={`${APP_NAME} — accueil`}>
                <span className="flex size-10 items-center justify-center rounded-pill bg-deep text-ink-deep">
                  <SproutIcon className="size-5" aria-hidden="true" />
                </span>
                <span className="text-base font-semibold text-ink-strong">{APP_NAME}</span>
              </Link>
              <p className="mt-4 text-sm text-ink-muted">
                La plateforme qui oriente les entrepreneurs agricoles et agroalimentaires
                vers les structures d’accompagnement adaptées à leur projet.
              </p>
              <p className="mt-4 inline-flex rounded-pill bg-live px-3 py-1.5 text-xs font-medium text-ink-strong">
                Bénin · Sénégal · Côte d’Ivoire
              </p>
            </div>

            <FooterColumn title="Découvrir" icon={CompassIcon} links={DISCOVER_LINKS} />

            <FooterColumn title="Rejoindre" icon={UsersIcon} links={joinLinks} />

            <div>
              <h2 className="flex items-center gap-2 text-sm font-semibold text-ink-strong">
                <ArrowRightIcon className="size-4 text-deep" aria-hidden="true" />
                Mon compte
              </h2>
              <ul className="mt-4 space-y-2.5">
                {accountLinks.map((link) => (
                  <li key={link.to}>
                    <Link to={link.to} className="text-sm text-ink-muted transition-colors hover:text-ink-strong">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
              <p className="mt-5 rounded-card bg-row p-3 text-xs leading-relaxed text-ink-muted">
                AgriBoussole est utilisable sur mobile et consultable hors ligne une fois
                l’application installée.
              </p>
            </div>
          </div>
        )}

        <div
          className={cn(
            'flex flex-col gap-2 border-t border-border text-xs text-ink-muted',
            isCompact ? 'px-0 pt-5 pb-28 md:flex-row md:items-center md:justify-between md:pb-6' : 'py-6 md:flex-row md:items-center md:justify-between',
          )}
        >
          <p>
            © {CURRENT_YEAR} {APP_NAME}. Tous droits réservés.
          </p>
          <p>Conçu pour l’écosystème agricole ouest-africain.</p>
          <p>Bénin · Sénégal · Côte d’Ivoire</p>
          <LanguageSwitcher className="-ml-2 self-start md:ml-auto" />
        </div>
      </div>
    </footer>
  )
}

interface FooterColumnProps {
  title: string
  icon: typeof CompassIcon
  links: Array<{ to: string; label: string }>
}

function FooterColumn({ title, icon: Icon, links }: FooterColumnProps) {
  return (
    <div>
      <h2 className="flex items-center gap-2 text-sm font-semibold text-ink-strong">
        <Icon className="size-4 text-deep" aria-hidden="true" />
        {title}
      </h2>
      <ul className="mt-4 space-y-2.5">
        {links.map((link) => (
          <li key={link.to}>
            <Link to={link.to} className="text-sm text-ink-muted transition-colors hover:text-ink-strong">
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
