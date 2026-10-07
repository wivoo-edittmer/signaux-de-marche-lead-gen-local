"use client"

import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { translations, Locale, TranslationKeys } from './translations'

interface I18nContextType {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: (key: keyof TranslationKeys) => string
}

const I18nContext = createContext<I18nContextType>({
  locale: 'en',
  setLocale: () => {},
  t: (key) => key as string,
})

const STORAGE_KEY = 'b2bmax-locale'

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('en')
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === 'fr' || stored === 'en') {
      setLocaleState(stored)
    } else {
      // Detect browser language
      const browserLang = navigator.language.toLowerCase()
      if (browserLang.startsWith('fr')) {
        setLocaleState('fr')
      }
    }
  }, [])

  useEffect(() => {
    if (!isMounted) return
    localStorage.setItem(STORAGE_KEY, locale)
    document.documentElement.lang = locale
  }, [locale, isMounted])

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale)
  }, [])

  const t = useCallback(
    (key: keyof TranslationKeys): string => {
      return translations[locale][key] ?? translations['en'][key] ?? key
    },
    [locale]
  )

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  )
}

export function useI18n() {
  return useContext(I18nContext)
}
