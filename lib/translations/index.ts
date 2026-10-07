import { en, TranslationKeys } from './en'
import { fr } from './fr'

export type Locale = 'en' | 'fr'
export type { TranslationKeys }

export const translations: Record<Locale, TranslationKeys> = {
  en,
  fr,
}
