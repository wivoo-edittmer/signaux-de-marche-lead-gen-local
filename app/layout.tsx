import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
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
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  )
}
