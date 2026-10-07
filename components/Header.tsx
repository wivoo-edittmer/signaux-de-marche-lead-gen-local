"use client"

import Link from 'next/link'
import { useState } from 'react'

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <img 
              src="/logo/logo-b2bmax-charte-mistral.svg" 
              alt="B2BMax" 
              className="h-8 w-auto"
            />
            <span className="font-bold text-xl text-gray-900">B2BMax</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link 
              href="/" 
              className="text-gray-600 hover:text-brand-primary transition-colors font-medium"
            >
              Home
            </Link>
            <Link 
              href="/explore" 
              className="text-gray-600 hover:text-brand-primary transition-colors font-medium"
            >
              Explore
            </Link>
            <Link 
              href="/ask" 
              className="text-gray-600 hover:text-brand-primary transition-colors font-medium"
            >
              Ask AI
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 py-4">
            <nav className="flex flex-col gap-3">
              <Link 
                href="/" 
                onClick={() => setIsMenuOpen(false)}
                className="text-gray-600 hover:text-brand-primary px-4 py-2 rounded-lg transition-colors"
              >
                Home
              </Link>
              <Link 
                href="/explore" 
                onClick={() => setIsMenuOpen(false)}
                className="text-gray-600 hover:text-brand-primary px-4 py-2 rounded-lg transition-colors"
              >
                Explore
              </Link>
              <Link 
                href="/ask" 
                onClick={() => setIsMenuOpen(false)}
                className="text-gray-600 hover:text-brand-primary px-4 py-2 rounded-lg transition-colors"
              >
                Ask AI
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
