"use client"

import { useState, useRef, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

interface Message {
  id: string
  role: 'user' | 'ai'
  content: string
  data?: any
  timestamp: Date
}

// Mock responses for demonstration
const mockResponses: Record<string, { message: string; data?: any }> = {
  'show me restaurant trends in paris': {
    message: "Here are the restaurant trends in Paris for the last 12 months:",
    data: {
      zone: 'Paris',
      sector: 'Restauration (NAF 56)',
      period: '2023-10-01 to 2024-10-01',
      summary: {
        totalCompanies: 2458,
        newCompanies: 213,
        closedCompanies: 45,
        netGrowth: 168,
        growthRate: 12.5,
        potentialScore: 87,
        grade: 'A',
      },
      trends: [
        { month: '2024-09', new: 25, closed: 3, net: 22 },
        { month: '2024-08', new: 22, closed: 4, net: 18 },
        { month: '2024-07', new: 20, closed: 5, net: 15 },
        { month: '2024-06', new: 18, closed: 2, net: 16 },
        { month: '2024-05', new: 23, closed: 4, net: 19 },
        { month: '2024-04', new: 19, closed: 3, net: 16 },
      ],
      topSubsectors: [
        { naf: '5610A', name: 'Licensed Restaurants', new: 85, growth: 15.2 },
        { naf: '5610B', name: 'Fast Food', new: 62, growth: 18.5 },
        { naf: '5630Z', name: 'Bars', new: 41, growth: 8.3 },
      ],
    },
  },
  'what is the potential for software companies in lyon': {
    message: "The potential for software companies (NAF 62) in Lyon is exceptional:",
    data: {
      zone: 'Lyon',
      sector: 'Programmation, conseil (NAF 62)',
      potential: 94,
      grade: 'A',
      breakdown: {
        creationRate: 14.2,
        growthRate: 18.7,
        marketSize: 89,
        competition: 91,
      },
      recommendation: "Strong buy - This is one of the fastest growing sectors in Lyon with high demand and moderate competition.",
      opportunities: [
        "High concentration of tech startups",
        "Strong venture capital presence",
        "Government incentives for digital transformation",
        "Growing remote work adoption",
      ],
    },
  },
  'how many new companies were created in the retail sector last quarter': {
    message: "In Q3 2024, there were 1,234 new retail companies (NAF 47) created across France:",
    data: {
      period: '2024-Q3',
      sector: 'Commerce de détail (NAF 47)',
      total: 1234,
      byRegion: [
        { region: 'Île-de-France', count: 342, share: 27.7 },
        { region: 'Auvergne-Rhône-Alpes', count: 189, share: 15.3 },
        { region: 'Nouvelle-Aquitaine', count: 123, share: 9.9 },
        { region: 'Occitanie', count: 112, share: 9.1 },
        { region: 'Hauts-de-France', count: 98, share: 7.9 },
      ],
      growthVsPreviousQuarter: 5.2,
      growthVsSameQuarterLastYear: 8.7,
    },
  },
  'help': {
    message: "I can help you with:",
    data: {
      capabilities: [
        "Market trend analysis by zone and sector",
        "Company creation and closure statistics",
        "Potential scoring for business opportunities",
        "Geographic distribution of companies",
        "Sector performance comparisons",
        "Historical data analysis",
      ],
      examples: [
        '"Show me restaurant trends in Paris"',
        '"What is the potential for software companies in Lyon?"',
        '"How many new companies were created in retail last quarter?"',
        '"Compare growth rates between Paris and Lyon for NAF 62"',
        '"Find new companies created in my zone this month"',
      ],
    },
  },
}

const gradeColors: Record<string, string> = {
  A: 'bg-success-700',
  B: 'bg-success-500',
  C: 'bg-gray-500',
  D: 'bg-warning-500',
  E: 'bg-warning-700',
}

function AskPageInner() {
  const searchParams = useSearchParams()
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'ai',
      content: "Hi! I'm your B2BMax AI Assistant. I can help you analyze market trends, company data, and business potential. Try asking me about a specific sector or zone.",
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const hasAutoSubmitted = useRef(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    // Simulate AI response
    setTimeout(() => {
      const lowerInput = input.trim().toLowerCase()
      let response = mockResponses[lowerInput] || mockResponses.help

      // If exact match not found, try partial match
      if (!mockResponses[lowerInput]) {
        for (const key of Object.keys(mockResponses)) {
          if (lowerInput.includes(key.split(' ')[0]) || key.includes(lowerInput.split(' ')[0])) {
            response = mockResponses[key]
            break
          }
        }
      }

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        content: response.message,
        data: response.data,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, aiMessage])
      setIsLoading(false)
    }, 1000)
  }

  // Auto-submit query from URL search params (e.g. /ask?q=restaurant+trends+in+paris)
  useEffect(() => {
    const q = searchParams.get('q')
    if (q && !hasAutoSubmitted.current) {
      hasAutoSubmitted.current = true
      setInput(q)
      // Trigger submit after state update
      setTimeout(() => {
        const userMessage: Message = {
          id: Date.now().toString(),
          role: 'user',
          content: q,
          timestamp: new Date(),
        }
        setMessages((prev) => [...prev, userMessage])
        setInput('')
        setIsLoading(true)

        setTimeout(() => {
          const lowerInput = q.toLowerCase()
          let response = mockResponses[lowerInput] || mockResponses.help

          if (!mockResponses[lowerInput]) {
            for (const key of Object.keys(mockResponses)) {
              if (lowerInput.includes(key.split(' ')[0]) || key.includes(lowerInput.split(' ')[0])) {
                response = mockResponses[key]
                break
              }
            }
          }

          const aiMessage: Message = {
            id: (Date.now() + 1).toString(),
            role: 'ai',
            content: response.message,
            data: response.data,
            timestamp: new Date(),
          }

          setMessages((prev) => [...prev, aiMessage])
          setIsLoading(false)
        }, 1000)
      }, 0)
    }
  }, [searchParams])

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Format time
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  // Render data cards
  const renderDataCard = (data: any) => {
    if (!data) return null

    // Handle summary data
    if (data.summary) {
      return (
        <div className="bg-white rounded-xl shadow-card p-6 mt-4">
          <h4 className="font-semibold text-gray-900 mb-4">
            {data.zone} - {data.sector}
          </h4>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-sm text-gray-500">Total Companies</div>
              <div className="text-xl font-bold text-gray-900">{data.summary.totalCompanies.toLocaleString()}</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-sm text-gray-500">New Companies</div>
              <div className="text-xl font-bold text-success-700">+{data.summary.newCompanies}</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-sm text-gray-500">Closed Companies</div>
              <div className="text-xl font-bold text-warning-700">{data.summary.closedCompanies}</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-sm text-gray-500">Net Growth</div>
              <div className="text-xl font-bold text-success-700">+{data.summary.netGrowth}</div>
            </div>
          </div>

          <div className="flex items-center gap-4 mb-4">
            <div className="text-4xl font-bold text-brand-primary">{data.summary.potentialScore}</div>
            <span className={`badge ${gradeColors[data.summary.grade as string]} text-white`}>
              Grade {data.summary.grade}
            </span>
            <span className="text-gray-500">{data.summary.growthRate}% growth</span>
          </div>

          {data.trends && (
            <div className="mt-6">
              <h5 className="font-medium text-gray-900 mb-3">Recent Trends</h5>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-gray-500">
                    <tr>
                      <th className="text-left py-2 pr-4">Month</th>
                      <th className="text-right py-2 pr-4">New</th>
                      <th className="text-right py-2 pr-4">Closed</th>
                      <th className="text-right py-2 pr-4">Net</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.trends.map((trend: any, index: number) => (
                      <tr key={index} className="border-t border-gray-100">
                        <td className="py-2 pr-4 font-medium text-gray-900">{trend.month}</td>
                        <td className="py-2 pr-4 text-success-700">+{trend.new}</td>
                        <td className="py-2 pr-4 text-warning-700">{trend.closed}</td>
                        <td className="py-2 pr-4 font-medium">{trend.net >= 0 ? '+' : ''}{trend.net}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {data.topSubsectors && (
            <div className="mt-6">
              <h5 className="font-medium text-gray-900 mb-3">Top Subsectors</h5>
              <div className="space-y-2">
                {data.topSubsectors.map((subsector: any, index: number) => (
                  <div key={index} className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                    <div>
                      <div className="font-medium text-gray-900">{subsector.name}</div>
                      <div className="text-sm text-gray-500">NAF: {subsector.naf}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-success-700">+{subsector.new}</div>
                      <div className="text-sm text-gray-500">{subsector.growth}% growth</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )
    }

    // Handle potential data
    if (data.potential) {
      return (
        <div className="bg-white rounded-xl shadow-card p-6 mt-4">
          <h4 className="font-semibold text-gray-900 mb-4">
            Market Potential Analysis
          </h4>

          <div className="flex items-center gap-6 mb-6">
            <div className="text-center">
              <div className="text-5xl font-bold text-brand-primary">{data.potential}</div>
              <span className={`badge ${gradeColors[data.grade as string]} text-white mt-2`}>
                Grade {data.grade}
              </span>
              <div className="text-sm text-gray-500 mt-1">{data.recommendation}</div>
            </div>

            <div className="flex-1">
              <div className="space-y-3">
                {Object.entries(data.breakdown).map(([key, value]: [string, any]) => (
                  <div key={key} className="flex items-center justify-between">
                    <span className="text-gray-600">{key}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-2 bg-gray-200 rounded-full">
                        <div 
                          className="h-2 bg-brand-primary rounded-full"
                          style={{ width: `${value}%` }}
                        ></div>
                      </div>
                      <span className="font-medium text-gray-900">{value}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {data.opportunities && (
            <div className="mt-6">
              <h5 className="font-medium text-gray-900 mb-3">Key Opportunities</h5>
              <ul className="space-y-2">
                {data.opportunities.map((opportunity: string, index: number) => (
                  <li key={index} className="flex items-center gap-2 text-gray-600">
                    <svg className="w-4 h-4 text-success-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    {opportunity}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )
    }

    // Handle statistical data
    if (data.total) {
      return (
        <div className="bg-white rounded-xl shadow-card p-6 mt-4">
          <h4 className="font-semibold text-gray-900 mb-4">
            {data.sector} - {data.period}
          </h4>

          <div className="text-4xl font-bold text-brand-primary mb-2">{data.total.toLocaleString()}</div>
          <div className="text-gray-500 mb-6">new companies created</div>

          {data.byRegion && (
            <div className="mt-6">
              <h5 className="font-medium text-gray-900 mb-3">By Region</h5>
              <div className="space-y-2">
                {data.byRegion.map((region: any, index: number) => (
                  <div key={index} className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900">{region.region}</div>
                      <div className="text-sm text-gray-500">{region.count} companies ({region.share}%)</div>
                    </div>
                    <div className="w-32 h-2 bg-gray-200 rounded-full">
                      <div 
                        className="h-2 bg-brand-primary rounded-full"
                        style={{ width: `${region.share}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-6 grid grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-sm text-gray-500">vs Previous Quarter</div>
              <div className={`text-xl font-bold ${data.growthVsPreviousQuarter >= 0 ? 'text-success-700' : 'text-warning-700'}`}>
                {data.growthVsPreviousQuarter >= 0 ? '+' : ''}{data.growthVsPreviousQuarter}%
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-sm text-gray-500">vs Same Quarter Last Year</div>
              <div className={`text-xl font-bold ${data.growthVsSameQuarterLastYear >= 0 ? 'text-success-700' : 'text-warning-700'}`}>
                {data.growthVsSameQuarterLastYear >= 0 ? '+' : ''}{data.growthVsSameQuarterLastYear}%
              </div>
            </div>
          </div>
        </div>
      )
    }

    // Handle capabilities data
    if (data.capabilities) {
      return (
        <div className="bg-white rounded-xl shadow-card p-6 mt-4">
          <h4 className="font-semibold text-gray-900 mb-4">I can help you with:</h4>
          <ul className="space-y-2 mb-6">
            {data.capabilities.map((capability: string, index: number) => (
              <li key={index} className="flex items-center gap-2">
                <svg className="w-4 h-4 text-brand-primary flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                {capability}
              </li>
            ))}
          </ul>
          
          <h4 className="font-semibold text-gray-900 mb-3">Try these examples:</h4>
          <div className="space-y-2">
            {data.examples.map((example: string, index: number) => (
              <button
                key={index}
                onClick={() => setInput(example)}
                className="w-full text-left bg-gray-50 hover:bg-gray-100 rounded-lg p-3 text-gray-700 transition-colors"
              >
                {example}
              </button>
            ))}
          </div>
        </div>
      )
    }

    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <Link href="/" className="hover:text-brand-primary transition-colors">
            Home
          </Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">Ask AI</span>
        </nav>

        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
            Ask Specific Questions
          </h1>
          <p className="text-gray-600 max-w-2xl">
            Ask me anything about French companies, market trends, and business opportunities. 
            I'll provide data-driven answers with visualizations.
          </p>
        </div>

        {/* Chat Container */}
        <div className="bg-white rounded-2xl shadow-card overflow-hidden">
          {/* Chat Messages */}
          <div className="h-[600px] overflow-auto p-6 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                    message.role === 'user'
                      ? 'bg-brand-primary text-white'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  <div className="whitespace-pre-wrap">{message.content}</div>
                  {message.data && renderDataCard(message.data)}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-2xl px-4 py-3">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"></div>
                    <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input */}
          <div className="p-6 border-t border-gray-200 bg-gray-50">
            <form onSubmit={handleSubmit} className="flex gap-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about market trends..."
                className="flex-1 input"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="btn btn-primary disabled:opacity-50"
              >
                {isLoading ? (
                  <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path 
                      className="opacity-75" 
                      fill="currentColor" 
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                ) : (
                  'Send'
                )}
              </button>
            </form>
            <p className="text-xs text-gray-400 mt-2 text-center">
              Powered by Mistral AI with data from INSEE
            </p>
          </div>
        </div>

        {/* Suggestions */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Try these:</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => setInput('show me restaurant trends in paris')}
              className="w-full text-left bg-white rounded-xl shadow-card p-4 hover:shadow-lg transition-shadow text-gray-700"
            >
              "Show me restaurant trends in Paris"
            </button>
            <button
              onClick={() => setInput('what is the potential for software companies in lyon')}
              className="w-full text-left bg-white rounded-xl shadow-card p-4 hover:shadow-lg transition-shadow text-gray-700"
            >
              "What is the potential for software companies in Lyon?"
            </button>
            <button
              onClick={() => setInput('how many new companies were created in the retail sector last quarter')}
              className="w-full text-left bg-white rounded-xl shadow-card p-4 hover:shadow-lg transition-shadow text-gray-700"
            >
              "How many new companies in retail last quarter?"
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default function AskPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center h-[600px]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-primary"></div>
          </div>
        </main>
        <Footer />
      </div>
    }>
      <AskPageInner />
    </Suspense>
  )
}
