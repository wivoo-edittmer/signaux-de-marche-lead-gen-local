import type { Metadata } from 'next'
import { Inter, Press_Start_2P } from 'next/font/google'
import '../styles/globals.css'
import { RetroModeProvider } from '@/lib/retro-mode'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

const pressStart2P = Press_Start_2P({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-pixel',
})

export const metadata: Metadata = {
  title: 'B2BMax - Market Intelligence Platform',
  description: 'Discover market trends and business opportunities with AI-powered analysis of company creation and closure data across France.',
  keywords: ['market analysis', 'business intelligence', 'company data', 'B2B', 'France', 'INSEE', 'market trends'],
  authors: [{ name: 'B2BMax Team' }],
  openGraph: {
    title: 'B2BMax - Market Intelligence Platform',
    description: 'Discover market trends and business opportunities with AI-powered analysis.',
    images: [{ url: '/logo/logo-b2bmax-charte-mistral.png', width: 1200, height: 630 }],
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
        <RetroModeProvider>
          {children}
        </RetroModeProvider>
      </body>
    </html>
  )
}
