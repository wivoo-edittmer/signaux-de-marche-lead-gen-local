"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { useI18n } from '@/lib/i18n'

export default function HomePage() {
  const [isMounted, setIsMounted] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const router = useRouter()
  const { t } = useI18n()

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const query = searchQuery.trim()
    if (query) {
      router.push(`/ask?q=${encodeURIComponent(query)}`)
    }
  }

  if (!isMounted) return null

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Header />

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-brand-gradient opacity-10"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiM0RkQ1MEEiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-50"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 tracking-tight">
              {t('hero_title')}{' '}
              <span className="text-brand-primary">{t('hero_title_highlight')}</span>
            </h1>
            
            <p className="mt-6 text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
              {t('hero_subtitle')}
            </p>
            
            {/* Search Bar */}
            <form onSubmit={handleSearch} className="mt-10 max-w-2xl mx-auto">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t('hero_search_placeholder')}
                  className="w-full pl-12 pr-32 py-4 text-lg rounded-2xl border-2 border-gray-200 focus:border-brand-primary focus:outline-none focus:ring-4 focus:ring-brand-primary/10 transition-all shadow-card"
                />
                <button
                  type="submit"
                  disabled={!searchQuery.trim()}
                  className="absolute right-2 top-1/2 -translate-y-1/2 btn btn-primary px-6 py-2.5 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {t('hero_search_button')}
                </button>
              </div>
              <p className="mt-3 text-sm text-gray-400">
                {t('hero_search_hint')}
              </p>
            </form>
            
            {/* Market Insights Box */}
            <div className="mt-10 max-w-3xl mx-auto">
              <div className="bg-white rounded-2xl shadow-card border border-gray-100 overflow-hidden text-left">
                {/* Header */}
                <div className="bg-gradient-to-r from-brand-primary to-orange-500 px-6 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
                    <span className="text-white font-semibold text-sm">{t('live_insights')}</span>
                  </div>
                  <span className="text-white/80 text-xs">{t('live_insights_subtitle')}</span>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-3 divide-x divide-gray-100">
                  <div className="p-5 text-center">
                    <div className="text-2xl sm:text-3xl font-bold text-gray-900">2.4M</div>
                    <div className="text-sm text-gray-500 mt-1">{t('stat_companies_tracked')}</div>
                  </div>
                  <div className="p-5 text-center">
                    <div className="text-2xl sm:text-3xl font-bold text-success-700">+12.5%</div>
                    <div className="text-sm text-gray-500 mt-1">{t('stat_yoy_growth')}</div>
                  </div>
                  <div className="p-5 text-center">
                    <div className="text-2xl sm:text-3xl font-bold text-brand-primary">87<span className="text-lg text-gray-400">/100</span></div>
                    <div className="text-sm text-gray-500 mt-1">{t('stat_avg_potential')}</div>
                  </div>
                </div>

                {/* Top Sectors */}
                <div className="px-6 py-4 border-t border-gray-100">
                  <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">{t('top_growing_sectors')}</div>
                  <div className="flex flex-wrap gap-2">
                    <span className="inline-flex items-center gap-1.5 bg-success-50 text-success-700 text-sm px-3 py-1.5 rounded-full">
                      <span className="w-1.5 h-1.5 rounded-full bg-success-500"></span>
                      Restauration +18.2%
                    </span>
                    <span className="inline-flex items-center gap-1.5 bg-success-50 text-success-700 text-sm px-3 py-1.5 rounded-full">
                      <span className="w-1.5 h-1.5 rounded-full bg-success-500"></span>
                      Tech / SaaS +15.7%
                    </span>
                    <span className="inline-flex items-center gap-1.5 bg-success-50 text-success-700 text-sm px-3 py-1.5 rounded-full">
                      <span className="w-1.5 h-1.5 rounded-full bg-success-500"></span>
                      E-commerce +11.3%
                    </span>
                    <span className="inline-flex items-center gap-1.5 bg-warning-50 text-warning-700 text-sm px-3 py-1.5 rounded-full">
                      <span className="w-1.5 h-1.5 rounded-full bg-warning-500"></span>
                      Retail +5.2%
                    </span>
                  </div>
                </div>

                {/* Hot Zones */}
                <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50">
                  <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">{t('hottest_zones')}</div>
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-700">Paris (75)</span>
                        <span className="text-sm font-bold text-brand-primary">94</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div className="bg-brand-primary h-1.5 rounded-full" style={{ width: '94%' }}></div>
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-700">Lyon (69)</span>
                        <span className="text-sm font-bold text-brand-primary">91</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div className="bg-brand-primary h-1.5 rounded-full" style={{ width: '91%' }}></div>
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-700">Bordeaux (33)</span>
                        <span className="text-sm font-bold text-brand-primary">88</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div className="bg-brand-primary h-1.5 rounded-full" style={{ width: '88%' }}></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* CTA */}
                <div className="px-6 py-4 border-t border-gray-100">
                  <Link
                    href="/explore"
                    className="btn btn-primary w-full text-center"
                  >
                    {t('explore_full_data')}
                    <svg className="w-4 h-4 ml-2 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Section */}
      <section className="py-20 sm:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
              {t('why_title')}
            </h2>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
              {t('why_subtitle')}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Card 1 */}
            <div className="card card-hover">
              <div className="w-12 h-12 bg-brand-primary bg-opacity-10 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-brand-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">{t('why_card1_title')}</h3>
              <p className="text-gray-600">
                {t('why_card1_desc')}
              </p>
            </div>

            {/* Card 2 */}
            <div className="card card-hover">
              <div className="w-12 h-12 bg-success-100 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-success-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">{t('why_card2_title')}</h3>
              <p className="text-gray-600">
                {t('why_card2_desc')}
              </p>
            </div>

            {/* Card 3 */}
            <div className="card card-hover">
              <div className="w-12 h-12 bg-warning-100 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-warning-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">{t('why_card3_title')}</h3>
              <p className="text-gray-600">
                {t('why_card3_desc')}
              </p>
            </div>

            {/* Card 4 */}
            <div className="card card-hover">
              <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">{t('why_card4_title')}</h3>
              <p className="text-gray-600">
                {t('why_card4_desc')}
              </p>
            </div>

            {/* Card 5 */}
            <div className="card card-hover">
              <div className="w-12 h-12 bg-brand-primary bg-opacity-10 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-brand-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">{t('why_card5_title')}</h3>
              <p className="text-gray-600">
                {t('why_card5_desc')}
              </p>
            </div>

            {/* Card 6 */}
            <div className="card card-hover">
              <div className="w-12 h-12 bg-success-100 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-success-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">{t('why_card6_title')}</h3>
              <p className="text-gray-600">
                {t('why_card6_desc')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* What Section */}
      <section className="py-20 sm:py-28 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
              {t('what_title')}
            </h2>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
              {t('what_subtitle')}
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Column - Text */}
            <div className="space-y-8">
              <div className="space-y-4">
                <h3 className="text-2xl font-bold text-gray-900">{t('what_feature1_title')}</h3>
                <p className="text-gray-600">
                  {t('what_feature1_desc')}
                </p>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-2xl font-bold text-gray-900">{t('what_feature2_title')}</h3>
                <p className="text-gray-600">
                  {t('what_feature2_desc')}
                </p>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-2xl font-bold text-gray-900">{t('what_feature3_title')}</h3>
                <p className="text-gray-600">
                  {t('what_feature3_desc')}
                </p>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-2xl font-bold text-gray-900">{t('what_feature4_title')}</h3>
                <p className="text-gray-600">
                  {t('what_feature4_desc')}
                </p>
              </div>
            </div>
            
            {/* Right Column - Visual */}
            <div className="space-y-6">
              {/* Mockup Card */}
              <div className="card bg-white border-2 border-brand-primary rounded-2xl p-6 shadow-xl">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-brand-primary rounded-xl flex items-center justify-center">
                    <span className="text-white font-bold text-lg">B</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{t('engine_title')}</h4>
                    <p className="text-sm text-gray-500">{t('engine_subtitle')}</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">{t('engine_creation_rate')}</span>
                    <span className="font-semibold text-success-700">+12.5%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-success-500 h-2 rounded-full" style={{ width: '75%' }}></div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">{t('engine_growth_rate')}</span>
                    <span className="font-semibold text-success-700">+8.3%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-success-500 h-2 rounded-full" style={{ width: '65%' }}></div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">{t('engine_market_size')}</span>
                    <span className="font-semibold text-gray-800">487 {t('engine_companies')}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-brand-primary h-2 rounded-full" style={{ width: '45%' }}></div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">{t('engine_competition')}</span>
                    <span className="font-semibold text-gray-800">Low</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-success-500 h-2 rounded-full" style={{ width: '85%' }}></div>
                  </div>
                </div>
                
                <div className="mt-6 pt-6 border-t border-gray-100">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-brand-primary">87</div>
                    <div className="badge badge-success mt-2">{t('engine_grade')} A</div>
                    <div className="text-sm text-gray-500 mt-1">{t('engine_exceptional')}</div>
                  </div>
                </div>
              </div>
              
              {/* Use Case Card */}
              <div className="bg-gradient-to-br from-brand-primary to-orange-600 rounded-2xl p-6 text-white">
                <h4 className="text-xl font-bold mb-3">{t('use_cases_title')}</h4>
                <ul className="space-y-2 text-white/90">
                  <li className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    {t('use_case1')}
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    {t('use_case2')}
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    {t('use_case3')}
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    {t('use_case4')}
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 sm:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gray-50 rounded-3xl p-8 sm:p-12 lg:p-16 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              {t('cta_title')}
            </h2>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              {t('cta_subtitle')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/explore" 
                className="btn btn-primary text-lg px-8 py-3.5"
              >
                {t('cta_explore')}
              </Link>
              <Link 
                href="/ask" 
                className="btn btn-outline text-lg px-8 py-3.5"
              >
                {t('cta_ask')}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  )
}
