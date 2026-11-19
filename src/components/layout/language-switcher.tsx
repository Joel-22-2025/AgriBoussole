import { CheckIcon, GlobeIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useI18n } from '@/i18n/i18n'
import { LOCALES } from '@/i18n/translations'
import { cn } from '@/lib/utils'

interface LanguageSwitcherProps {
  className?: string
}

/** Sélecteur Français / Wolof / Diola (Diala), disponible partout sur le site. */
export function LanguageSwitcher({ className }: LanguageSwitcherProps) {
  const { locale, setLocale, t } = useI18n()
  const current = LOCALES.find((option) => option.code === locale) ?? LOCALES[0]

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          aria-label={t('Choisir la langue')}
          className={cn('h-9 gap-1.5 px-2 text-ink-muted', className)}
        >
          <GlobeIcon className="size-4" aria-hidden="true" />
          <span className="text-xs font-semibold uppercase">{current.code}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuLabel>{t('Langue')}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {LOCALES.map((option) => (
          <DropdownMenuItem
            key={option.code}
            onClick={() => setLocale(option.code)}
            className="gap-2"
          >
            <span>{option.nativeLabel}</span>
            {option.code === locale && <CheckIcon className="ml-auto size-4" aria-hidden="true" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
