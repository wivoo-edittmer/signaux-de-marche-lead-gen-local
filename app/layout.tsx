import type { Metadata } from 'next'
import '../styles/globals.css'
import { RetroModeProvider } from '@/lib/retro-mode'
import { I18nProvider } from '@/lib/i18n'

// Utilisation de polices système pour éviter le téléchargement Google Fonts au build
// En production Vercel, vous pouvez réactiver next/font/google
const inter = { variable: '--font-inter' }
const pressStart2P = { variable: '--font-pixel' }

export const metadata: Metadata = {
  title: 'Market Intelligence Platform',
  description: 'Discover market trends and business opportunities with AI-powered analysis of company creation and closure data across France.',
  keywords: ['market analysis', 'business intelligence', 'company data', 'B2B', 'France', 'INSEE', 'market trends'],
  authors: [{ name: 'Mistral AI' }],
  openGraph: {
    title: 'Market Intelligence Platform',
    description: 'Discover market trends and business opportunities with AI-powered analysis.',
    images: [{ url: '/logo/logo-mark.svg', width: 1200, height: 630 }],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${pressStart2P.variable} font-sans antialiased`}>
        <I18nProvider>
          <RetroModeProvider>
            {children}
          </RetroModeProvider>
        </I18nProvider>
      </body>
    </html>
  )
}
