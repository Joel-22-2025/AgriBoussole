import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

import {
  DEFAULT_LOCALE,
  isLocale,
  TRANSLATIONS,
  type Locale,
} from './translations'

const STORAGE_KEY = 'agriboussole.locale'
const ATTRIBUTES = ['placeholder', 'title', 'aria-label', 'alt'] as const

interface I18nContextValue {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: (key: string, variables?: Record<string, string | number>) => string
}

const I18nContext = createContext<I18nContextValue | null>(null)

/** Rend les clés comparables malgré les apostrophes typographiques et les retours ligne. */
function normalize(value: string): string {
  return value
    .replace(/[\r\n\t]+/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/’/g, "'")
    .trim()
}

const normalizedDictionaries = Object.fromEntries(
  Object.entries(TRANSLATIONS).map(([locale, dictionary]) => [
    locale,
    Object.fromEntries(
      Object.entries(dictionary).map(([key, value]) => [normalize(key), value]),
    ),
  ]),
) as Record<Exclude<Locale, 'fr'>, Record<string, string>>

function lookup(raw: string, locale: Locale): string {
  if (locale === 'fr') return raw
  return normalizedDictionaries[locale][normalize(raw)] ?? raw
}

function interpolate(
  text: string,
  variables?: Record<string, string | number>,
): string {
  if (!variables) return text
  return text.replace(/\{\{(\w+)\}\}/g, (_match, name: string) =>
    String(variables[name] ?? ''),
  )
}

/** Contexte de langue, à placer une fois autour de l'application. */
export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      return isLocale(stored) ? stored : DEFAULT_LOCALE
    } catch {
      return DEFAULT_LOCALE
    }
  })

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next)
    try {
      localStorage.setItem(STORAGE_KEY, next)
    } catch {
      // Stockage indisponible : le choix reste valable pour la session.
    }
  }, [])

  const t = useCallback(
    (key: string, variables?: Record<string, string | number>) =>
      interpolate(lookup(key, locale), variables),
    [locale],
  )

  useEffect(() => {
    document.documentElement.lang = locale
  }, [locale])

  const value = useMemo<I18nContextValue>(
    () => ({ locale, setLocale, t }),
    [locale, setLocale, t],
  )

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n(): I18nContextValue {
  const context = useContext(I18nContext)
  if (!context) {
    throw new Error('useI18n doit être utilisé dans un I18nProvider.')
  }
  return context
}

const originalTexts = new WeakMap<Text, string>()
const trackedTexts = new Set<Text>()
const originalAttributes = new WeakMap<Element, Map<string, string>>()
const trackedElements = new Set<Element>()

function translateText(node: Text, locale: Locale): void {
  const current = node.nodeValue ?? ''
  if (!current.trim()) return

  let original = originalTexts.get(node)
  if (original === undefined) {
    original = current
    originalTexts.set(node, original)
    trackedTexts.add(node)
  } else if (current !== original && current !== lookup(original, locale)) {
    // React a remplacé le texte : on mémorise la nouvelle version française.
    original = current
    originalTexts.set(node, original)
  }

  const translated = lookup(original, locale)
  if (node.nodeValue !== translated) node.nodeValue = translated
}

function translateAttributes(element: Element, locale: Locale): void {
  for (const attribute of ATTRIBUTES) {
    const current = element.getAttribute(attribute)
    if (current === null) continue

    let stored = originalAttributes.get(element)
    if (!stored) {
      stored = new Map<string, string>()
      originalAttributes.set(element, stored)
    }

    let original = stored.get(attribute)
    if (original === undefined) {
      original = current
      stored.set(attribute, original)
      trackedElements.add(element)
    } else if (current !== original && current !== lookup(original, locale)) {
      original = current
      stored.set(attribute, original)
    }

    const translated = lookup(original, locale)
    if (element.getAttribute(attribute) !== translated) {
      element.setAttribute(attribute, translated)
    }
  }
}

function applyTranslations(locale: Locale): void {
  for (const node of trackedTexts) {
    if (!node.isConnected) {
      trackedTexts.delete(node)
      originalTexts.delete(node)
      continue
    }
    translateText(node, locale)
  }

  for (const element of trackedElements) {
    if (!element.isConnected) {
      trackedElements.delete(element)
      originalAttributes.delete(element)
      continue
    }
    translateAttributes(element, locale)
  }

  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT)
  let node: Node | null
  while ((node = walker.nextNode())) {
    const parent = (node as Text).parentElement
    if (!parent || parent.closest('script, style, [data-i18n-ignore]')) continue
    translateText(node as Text, locale)
  }

  document
    .querySelectorAll<HTMLElement>('[placeholder], [title], [aria-label], [alt]')
    .forEach((element) => translateAttributes(element, locale))
}

/**
 * Applique les traductions au DOM existant, y compris aux textes écrits
 * directement dans les composants. Les textes non traduits restent en français.
 */
export function GlobalTranslator() {
  const { locale } = useI18n()

  useEffect(() => {
    let timer: number | undefined

    const run = () => applyTranslations(locale)
    const queue = () => {
      if (timer !== undefined) return
      timer = window.setTimeout(() => {
        timer = undefined
        run()
      }, 0)
    }

    const observer = new MutationObserver(queue)
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
      attributeFilter: [...ATTRIBUTES],
    })

    run()

    return () => {
      observer.disconnect()
      if (timer !== undefined) window.clearTimeout(timer)
    }
  }, [locale])

  return null
}
