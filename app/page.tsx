'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default function HomePage() {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) return null

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Header />

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-brand-gradient opacity-10"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiM0RkQ1MEEiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-50"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
          <div className="text-center">
            {/* Logo */}
            <div className="mb-8">
              <img 
                src="/logo/logo-b2bmax-charte-mistral.svg" 
                alt="B2BMax Logo" 
                className="mx-auto h-16 w-auto"
              />
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 tracking-tight">
              Unlock Market 
              <span className="text-brand-primary">Insights</span>
            </h1>
            
            <p className="mt-6 text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
              AI-powered analysis of company creation and closure data to identify 
              emerging markets and business opportunities across France.
            </p>
            
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/explore" 
                className="btn btn-primary text-lg px-8 py-3.5"
              >
                Explore Market Data
              </Link>
              <Link 
                href="/ask" 
                className="btn btn-outline text-lg px-8 py-3.5"
              >
                Ask Specific Question
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Why Section */}
      <section className="py-20 sm:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
              Why B2BMax?
            </h2>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
              The problem is clear: market signals exist but are invisible.
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
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Lightning Fast</h3>
              <p className="text-gray-600">
                Get market insights in seconds, not weeks. Automated data aggregation 
                replaces manual research.
              </p>
            </div>

            {/* Card 2 */}
            <div className="card card-hover">
              <div className="w-12 h-12 bg-success-100 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-success-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Actionable Data</h3>
              <p className="text-gray-600">
                Every signal is a potential opportunity. Identify new businesses 
                to contact immediately after creation.
              </p>
            </div>

            {/* Card 3 */}
            <div className="card card-hover">
              <div className="w-12 h-12 bg-warning-100 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-warning-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Smarter Decisions</h3>
              <p className="text-gray-600">
                Data-driven market analysis helps banks, software vendors, and 
                investors make better business decisions.
              </p>
            </div>

            {/* Card 4 */}
            <div className="card card-hover">
              <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Multi-Dimensional</h3>
              <p className="text-gray-600">
                Analyze by zone (IRIS to Region) and sector (NAF 2-5 digit). 
                Drill down from macro trends to specific opportunities.
              </p>
            </div>

            {/* Card 5 */}
            <div className="card card-hover">
              <div className="w-12 h-12 bg-brand-primary bg-opacity-10 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-brand-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Innovative</h3>
              <p className="text-gray-600">
                Built on modern AI and MCP technology. First to market with 
                real-time French business intelligence.
              </p>
            </div>

            {/* Card 6 */}
            <div className="card card-hover">
              <div className="w-12 h-12 bg-success-100 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-success-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Positive ROI</h3>
              <p className="text-gray-600">
                More leads, better conversion, higher revenue. The data pays for itself.
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
              What is B2BMax?
            </h2>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
              A platform that transforms raw data into actionable business intelligence.
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Column - Text */}
            <div className="space-y-8">
              <div className="space-y-4">
                <h3 className="text-2xl font-bold text-gray-900">Data Aggregation</h3>
                <p className="text-gray-600">
                  We automatically collect and process company creation and closure 
                  announcements from INSEE and other official sources. No more manual 
                  data entry or reading announcements one by one.
                </p>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-2xl font-bold text-gray-900">Market Signal Detection</h3>
                <p className="text-gray-600">
                  Our algorithms identify trends by sector and geographic zone. 
                  Green zones are growing, orange zones need attention. The signal 
                  becomes immediately visible.
                </p>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-2xl font-bold text-gray-900">Potential Scoring</h3>
                <p className="text-gray-600">
                  Every zone and sector combination gets a Potential Score (0-100) 
                  based on creation rate, growth rate, market size, and competition. 
                  Grade A means exceptional opportunity.
                </p>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-2xl font-bold text-gray-900">Actionable Insights</h3>
                <p className="text-gray-600">
                  From macro trends to individual company details. Click on any 
                  zone to drill down. Export data for further analysis. Set alerts 
                  for new opportunities.
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
                    <h4 className="font-semibold text-gray-900">Market Potential Engine</h4>
                    <p className="text-sm text-gray-500">AI-powered analysis</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Creation Rate</span>
                    <span className="font-semibold text-success-700">+12.5%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-success-500 h-2 rounded-full" style={{ width: '75%' }}></div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Growth Rate</span>
                    <span className="font-semibold text-success-700">+8.3%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-success-500 h-2 rounded-full" style={{ width: '65%' }}></div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Market Size</span>
                    <span className="font-semibold text-gray-800">487 companies</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-brand-primary h-2 rounded-full" style={{ width: '45%' }}></div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Competition</span>
                    <span className="font-semibold text-gray-800">Low</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-success-500 h-2 rounded-full" style={{ width: '85%' }}></div>
                  </div>
                </div>
                
                <div className="mt-6 pt-6 border-t border-gray-100">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-brand-primary">87</div>
                    <div className="badge badge-success mt-2">Grade A</div>
                    <div className="text-sm text-gray-500 mt-1">Exceptional Potential</div>
                  </div>
                </div>
              </div>
              
              {/* Use Case Card */}
              <div className="bg-gradient-to-br from-brand-primary to-orange-600 rounded-2xl p-6 text-white">
                <h4 className="text-xl font-bold mb-3">Use Cases</h4>
                <ul className="space-y-2 text-white/90">
                  <li className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Banks monitoring sector health
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Software vendors finding new leads
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Investors identifying opportunities
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Local governments tracking economy
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
              Ready to Transform Your Market Intelligence?
            </h2>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              Stop guessing. Start knowing. Join the companies that are already 
              using B2BMax to gain a competitive edge.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/explore" 
                className="btn btn-primary text-lg px-8 py-3.5"
              >
                Start Exploring
              </Link>
              <Link 
                href="/ask" 
                className="btn btn-outline text-lg px-8 py-3.5"
              >
                Ask AI Assistant
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
