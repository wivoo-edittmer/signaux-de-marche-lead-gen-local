"use client"

import { useI18n } from '@/lib/i18n'

export default function LanguageToggle() {
  const { locale, setLocale, t } = useI18n()

  const toggle = () => {
    setLocale(locale === 'en' ? 'fr' : 'en')
  }

  return (
    <button
      onClick={toggle}
      className="lang-toggle-btn"
      title={locale === 'en' ? t('lang_toggle_title_en') : t('lang_toggle_title_fr')}
      aria-label={locale === 'en' ? t('lang_toggle_title_en') : t('lang_toggle_title_fr')}
    >
      <span className="lang-toggle-icon" aria-hidden="true">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <path d="M2 12h20" />
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        </svg>
      </span>
      <span className="lang-toggle-label">{t('lang_toggle_label')}</span>
    </button>
  )
}
