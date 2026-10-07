"use client"

import Link from 'next/link'
import { useI18n } from '@/lib/i18n'

export default function Footer() {
  const { t } = useI18n()

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <img
              src="/logo/logo-mark.svg"
              alt="Logo"
              className="h-8 w-auto"
            />
            <p className="text-gray-400 text-sm">
              {t('footer_tagline')}
            </p>
          </div>

          {/* Product */}
          <div className="space-y-4">
            <h4 className="font-semibold text-white">{t('footer_product')}</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/explore" className="hover:text-white transition-colors">
                  {t('footer_explore_data')}
                </Link>
              </li>
              <li>
                <Link href="/ask" className="hover:text-white transition-colors">
                  {t('footer_ask_ai')}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center text-sm text-gray-400">
          <p>© {new Date().getFullYear()}. {t('footer_rights')}</p>
          <p className="mt-2 md:mt-0">
            {t('footer_powered')} <span className="text-brand-primary">Mistral AI</span> {t('footer_powered').includes('by') ? 'and' : 'et'} <span className="text-success-500">data.gouv.fr</span>
          </p>
        </div>
      </div>
    </footer>
  )
}
