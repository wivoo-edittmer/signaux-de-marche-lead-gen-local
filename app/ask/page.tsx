"use client"

import { useState, useRef, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { useI18n } from '@/lib/i18n'

interface Message {
  id: string
  role: 'user' | 'ai'
  content: string
  data?: any
  timestamp: Date
}

const gradeColors: Record<string, string> = {
  A: 'bg-success-700',
  B: 'bg-success-500',
  C: 'bg-gray-500',
  D: 'bg-warning-500',
  E: 'bg-warning-700',
}

async function askApi(question: string): Promise<{ message: string; data?: any }> {
  const response = await fetch('/api/ask', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question }),
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.error || `API error: ${response.status}`)
  }

  return response.json()
}

function AskPageInner() {
  const { t } = useI18n()
  const searchParams = useSearchParams()
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'ai',
      content: t('ask_ai_greeting'),
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const hasAutoSubmitted = useRef(false)

  const sendQuestion = async (questionText: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: questionText,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const response = await askApi(questionText)

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        content: response.message,
        data: response.data,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, aiMessage])
    } catch (error) {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        content: error instanceof Error
          ? `Sorry, something went wrong: ${error.message}. Please try again.`
          : 'Sorry, something went wrong. Please try again.',
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, aiMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return
    sendQuestion(input.trim())
  }

  // Auto-submit query from URL search params (e.g. /ask?q=restaurant+trends+in+paris)
  useEffect(() => {
    const q = searchParams.get('q')
    if (q && !hasAutoSubmitted.current) {
      hasAutoSubmitted.current = true
      setInput(q)
      sendQuestion(q)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

    // Handle summary data (trends)
    if (data.summary) {
      return (
        <div className="bg-white rounded-xl shadow-card p-6 mt-4">
          <h4 className="font-semibold text-gray-900 mb-4">
            {data.zone} - {data.sector}
          </h4>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-sm text-gray-500">Data Points</div>
              <div className="text-xl font-bold text-gray-900">{data.summary.totalSignals}</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-sm text-gray-500">New Companies</div>
              <div className="text-xl font-bold text-success-700">+{data.summary.totalNewCompanies}</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-sm text-gray-500">Closed Companies</div>
              <div className="text-xl font-bold text-warning-700">{data.summary.totalClosedCompanies}</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-sm text-gray-500">Avg Growth</div>
              <div className="text-xl font-bold text-success-700">+{data.summary.avgGrowthRate}%</div>
            </div>
          </div>

          <div className="flex items-center gap-4 mb-4">
            <div className="text-4xl font-bold text-brand-primary">{data.summary.avgPotential}</div>
            <span className={`badge ${gradeColors[data.summary.topGrade as string] || 'bg-gray-500'} text-white`}>
              Grade {data.summary.topGrade}
            </span>
            <span className="text-gray-500">Top score: {data.summary.topScore}</span>
          </div>

          {data.signals && data.signals.length > 0 && (
            <div className="mt-6">
              <h5 className="font-medium text-gray-900 mb-3">Market Signals</h5>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-gray-500">
                    <tr>
                      <th className="text-left py-2 pr-4">Period</th>
                      <th className="text-left py-2 pr-4">Zone</th>
                      <th className="text-right py-2 pr-4">Companies</th>
                      <th className="text-right py-2 pr-4">New</th>
                      <th className="text-right py-2 pr-4">Closed</th>
                      <th className="text-right py-2 pr-4">Growth</th>
                      <th className="text-right py-2 pr-4">Score</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.signals.map((signal: any, index: number) => (
                      <tr key={index} className="border-t border-gray-100">
                        <td className="py-2 pr-4 font-medium text-gray-900">{signal.period}</td>
                        <td className="py-2 pr-4 text-gray-600">{signal.zone}</td>
                        <td className="py-2 pr-4 text-right">{signal.totalCompanies?.toLocaleString()}</td>
                        <td className="py-2 pr-4 text-right text-success-700">+{signal.newCompanies}</td>
                        <td className="py-2 pr-4 text-right text-warning-700">{signal.closedCompanies}</td>
                        <td className="py-2 pr-4 text-right font-medium">
                          {signal.growthRate >= 0 ? '+' : ''}{signal.growthRate}%
                        </td>
                        <td className="py-2 pr-4 text-right">
                          <span className={`badge ${gradeColors[signal.grade as string] || 'bg-gray-500'} text-white text-xs`}>
                            {signal.grade}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )
    }

    // Handle potential data
    if (data.potential !== undefined) {
      return (
        <div className="bg-white rounded-xl shadow-card p-6 mt-4">
          <h4 className="font-semibold text-gray-900 mb-4">
            Market Potential Analysis: {data.zone} - {data.sector}
          </h4>

          <div className="flex items-center gap-6 mb-6">
            <div className="text-center">
              <div className="text-5xl font-bold text-brand-primary">{data.potential}</div>
              <span className={`badge ${gradeColors[data.grade as string] || 'bg-gray-500'} text-white mt-2`}>
                Grade {data.grade}
              </span>
              <div className="text-sm text-gray-500 mt-1 max-w-[200px]">{data.recommendation}</div>
            </div>

            {data.breakdown && (
              <div className="flex-1">
                <div className="space-y-3">
                  {Object.entries(data.breakdown).map(([key, value]: [string, any]) => (
                    <div key={key} className="flex items-center justify-between">
                      <span className="text-gray-600 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-2 bg-gray-200 rounded-full">
                          <div
                            className="h-2 bg-brand-primary rounded-full"
                            style={{ width: `${Math.min(value, 100)}%` }}
                          ></div>
                        </div>
                        <span className="font-medium text-gray-900">{value}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {data.topSignals && data.topSignals.length > 0 && (
            <div className="mt-6">
              <h5 className="font-medium text-gray-900 mb-3">Top Signals</h5>
              <div className="space-y-2">
                {data.topSignals.map((signal: any, index: number) => (
                  <div key={index} className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                    <div>
                      <div className="font-medium text-gray-900">{signal.zone}</div>
                      <div className="text-sm text-gray-500">{signal.period}</div>
                    </div>
                    <div className="text-right">
                      <span className={`badge ${gradeColors[signal.grade as string] || 'bg-gray-500'} text-white text-xs mr-2`}>
                        {signal.grade}
                      </span>
                      <span className="font-semibold text-brand-primary">{signal.score}</span>
                      <div className="text-sm text-gray-500">+{signal.newCompanies} new, {signal.growthRate}% growth</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )
    }

    // Handle statistical data
    if (data.total !== undefined) {
      return (
        <div className="bg-white rounded-xl shadow-card p-6 mt-4">
          <h4 className="font-semibold text-gray-900 mb-4">
            {data.sector} - {data.zone}
          </h4>

          <div className="text-4xl font-bold text-brand-primary mb-2">{data.total.toLocaleString()}</div>
          <div className="text-gray-500 mb-6">companies found</div>

          {data.recentCompanies && data.recentCompanies.length > 0 && (
            <div className="mt-6">
              <h5 className="font-medium text-gray-900 mb-3">Recently Created</h5>
              <div className="space-y-2">
                {data.recentCompanies.map((company: any, index: number) => (
                  <div key={index} className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                    <div>
                      <div className="font-medium text-gray-900">{company.name}</div>
                      <div className="text-sm text-gray-500">{company.commune || 'Unknown location'}</div>
                    </div>
                    <div className="text-right text-sm text-gray-500">
                      {company.date ? new Date(company.date).toLocaleDateString() : 'N/A'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )
    }

    // Handle signals list (general query)
    if (data.signals && Array.isArray(data.signals)) {
      return (
        <div className="bg-white rounded-xl shadow-card p-6 mt-4">
          <h4 className="font-semibold text-gray-900 mb-4">
            {data.zone} - {data.sector}
          </h4>
          <div className="space-y-2">
            {data.signals.map((signal: any, index: number) => (
              <div key={index} className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                <div>
                  <div className="font-medium text-gray-900">{signal.zone}</div>
                  <div className="text-sm text-gray-500">{signal.period} - {signal.sector}</div>
                </div>
                <div className="text-right">
                  <span className={`badge ${gradeColors[signal.grade as string] || 'bg-gray-500'} text-white text-xs mr-2`}>
                    {signal.grade}
                  </span>
                  <span className="font-semibold text-brand-primary">{signal.potentialScore}</span>
                  <div className="text-sm text-gray-500">
                    {signal.totalCompanies?.toLocaleString()} companies, +{signal.newCompanies} new
                  </div>
                </div>
              </div>
            ))}
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
                onClick={() => setInput(example.replace(/^"|"$/g, ''))}
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
            {t('ask_breadcrumb_home')}
          </Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">{t('ask_breadcrumb_current')}</span>
        </nav>

        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
            {t('ask_title')}
          </h1>
          <p className="text-gray-600 max-w-2xl">
            {t('ask_subtitle')}
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
                placeholder={t('ask_placeholder')}
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
                  t('ask_send')
                )}
              </button>
            </form>
            <p className="text-xs text-gray-400 mt-2 text-center">
              {t('ask_powered')}
            </p>
          </div>
        </div>

        {/* Suggestions */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('ask_suggestions_title')}</h3>
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
