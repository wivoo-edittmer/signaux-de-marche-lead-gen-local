"use client"

import { useState, useRef, useEffect, Suspense, useCallback } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { useI18n } from '@/lib/i18n'
import { sendChatMessage, transcribeAudio, type ChatMessageResponse, type QueryResult } from '@/lib/api'
import { sendMockChatMessage } from '@/lib/mockChat'

// Sans backend configuré, le chat répond avec des données factices
const USE_MOCK_CHAT = !process.env.NEXT_PUBLIC_API_URL

interface Message {
  id: string
  role: 'user' | 'ai'
  content: string
  data?: QueryResult | Record<string, unknown>
  timestamp: Date
}

const gradeColors: Record<string, string> = {
  A: 'bg-success-700',
  B: 'bg-success-500',
  C: 'bg-gray-500',
  D: 'bg-warning-500',
  E: 'bg-warning-700',
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
  const [sessionId, setSessionId] = useState<string | undefined>(undefined)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const hasAutoSubmitted = useRef(false)

  // ============================================================
  // Transcription audio
  // ============================================================
  const [isRecording, setIsRecording] = useState(false)
  const [isTranscribing, setIsTranscribing] = useState(false)
  const [transcriptionText, setTranscriptionText] = useState('')
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const streamRef = useRef<MediaStream | null>(null)

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream
      audioChunksRef.current = []

      // Préférer audio/webm, fallback sur le type par défaut du navigateur
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : MediaRecorder.isTypeSupported('audio/webm')
          ? 'audio/webm'
          : 'audio/mp4'

      const mediaRecorder = new MediaRecorder(stream, { mimeType })
      mediaRecorderRef.current = mediaRecorder

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = async () => {
        // Libérer le micro
        stream.getTracks().forEach((track) => track.stop())
        streamRef.current = null

        // Créer le blob audio
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType })
        const extension = mimeType.includes('webm') ? 'webm' : 'mp4'
        const fileName = `recording-${Date.now()}.${extension}`

        if (audioBlob.size === 0) return

        // Envoyer à l'API de transcription
        setIsTranscribing(true)
        setTranscriptionText('')
        try {
          const result = await transcribeAudio({
            file: audioBlob,
            fileName,
            language: 'fr',
          })
          setTranscriptionText(result.text)
          setInput(result.text)
        } catch (error) {
          console.error('Erreur transcription:', error)
          const errorMsg = error instanceof Error ? error.message : 'Erreur de transcription'
          setMessages((prev) => [
            ...prev,
            {
              id: `error-${Date.now()}`,
              role: 'ai',
              content: `Erreur de transcription audio : ${errorMsg}`,
              timestamp: new Date(),
            },
          ])
        } finally {
          setIsTranscribing(false)
        }
      }

      mediaRecorder.start()
      setIsRecording(true)
    } catch (error) {
      console.error('Erreur accès micro:', error)
      alert('Impossible d\'accéder au microphone. Vérifiez les permissions de votre navigateur.')
    }
  }, [])

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop()
    }
    setIsRecording(false)
  }, [])

  const toggleRecording = useCallback(() => {
    if (isRecording) {
      stopRecording()
    } else {
      startRecording()
    }
  }, [isRecording, startRecording, stopRecording])

  // Nettoyage à la destruction du composant
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop())
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop()
      }
    }
  }, [])

  // ============================================================
  // Envoi de message
  // ============================================================
  const sendQuestion = async (questionText: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: questionText,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setTranscriptionText('')
    setIsLoading(true)

    try {
      const response: ChatMessageResponse = USE_MOCK_CHAT
        ? await sendMockChatMessage(questionText, sessionId)
        : await sendChatMessage(questionText, sessionId)

      if (response.session_id) {
        setSessionId(response.session_id)
      }

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        content: response.message,
        data: response.query_result || undefined,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, aiMessage])
    } catch (error) {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        content: error instanceof Error
          ? `Désolé, une erreur est survenue : ${error.message}. Veuillez réessayer.`
          : 'Désolé, une erreur est survenue. Veuillez réessayer.',
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

  // Auto-submit query from URL search params
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

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  // ============================================================
  // Rendu des cartes de données (résultats de recherche)
  // ============================================================
  const renderDataCard = (data: QueryResult | Record<string, unknown> | undefined) => {
    if (!data) return null

    const result = data as QueryResult

    // Carte de synthèse avec statistiques
    if (result.total_companies !== undefined) {
      return (
        <div className="bg-white rounded-xl shadow-card p-6 mt-4">
          <h4 className="font-semibold text-gray-900 mb-4">
            {result.sector?.name || 'Tous secteurs'} — {result.zone?.name || 'France'}
          </h4>

          {/* Statistiques clés */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-sm text-gray-500">Entreprises</div>
              <div className="text-xl font-bold text-gray-900">{result.total_companies.toLocaleString()}</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-sm text-gray-500">Créations</div>
              <div className="text-xl font-bold text-success-700">+{result.creations}</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-sm text-gray-500">Radiations</div>
              <div className="text-xl font-bold text-warning-700">{result.radiations}</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-sm text-gray-500">Variation nette</div>
              <div className={`text-xl font-bold ${result.net_change >= 0 ? 'text-success-700' : 'text-warning-700'}`}>
                {result.net_change >= 0 ? '+' : ''}{result.net_change}
              </div>
            </div>
          </div>

          {/* Tendance */}
          <div className="flex items-center gap-2 mb-4">
            <span className={`badge ${result.trend === 'growth' ? 'badge-success' : result.trend === 'decline' ? 'bg-warning-100 text-warning-700' : 'bg-gray-100 text-gray-700'}`}>
              {result.trend === 'growth' ? 'En croissance' : result.trend === 'decline' ? 'En déclin' : 'Stable'}
            </span>
          </div>

          {/* Liste des entreprises */}
          {result.companies && result.companies.length > 0 && (
            <div className="mt-6">
              <h5 className="font-medium text-gray-900 mb-3">Entreprises ({result.companies.length})</h5>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-gray-500">
                    <tr>
                      <th className="text-left py-2 pr-4">Nom</th>
                      <th className="text-left py-2 pr-4">Commune</th>
                      <th className="text-left py-2 pr-4">Code NAF</th>
                      <th className="text-left py-2 pr-4">Catégorie</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.companies.slice(0, 20).map((company, index) => (
                      <tr key={index} className="border-t border-gray-100">
                        <td className="py-2 pr-4 font-medium text-gray-900">{company.name}</td>
                        <td className="py-2 pr-4 text-gray-600">{company.commune || '-'}</td>
                        <td className="py-2 pr-4 text-gray-600">{company.naf_code || '-'}</td>
                        <td className="py-2 pr-4">
                          {company.category && (
                            <span className="badge bg-gray-100 text-gray-700 text-xs">{company.category}</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Prochaines actions */}
          {result.next_actions && result.next_actions.length > 0 && (
            <div className="mt-6 pt-4 border-t border-gray-100">
              <h5 className="font-medium text-gray-900 mb-3">Actions suggérées</h5>
              <div className="flex flex-wrap gap-2">
                {result.next_actions.map((action, index) => (
                  <button
                    key={index}
                    className="inline-flex items-center gap-1.5 bg-brand-primary/10 text-brand-primary text-sm px-3 py-1.5 rounded-full hover:bg-brand-primary/20 transition-colors"
                  >
                    {action.icon && <span>{action.icon}</span>}
                    {action.title}
                  </button>
                ))}
              </div>
            </div>
          )}
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

          {/* Transcription indicator */}
          {(isRecording || isTranscribing) && (
            <div className="px-6 py-2 bg-brand-primary/5 border-t border-brand-primary/10 flex items-center gap-3">
              {isRecording && (
                <>
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                  <span className="text-sm text-gray-600">Enregistrement en cours... Cliquez sur le micro pour arrêter</span>
                </>
              )}
              {isTranscribing && (
                <>
                  <div className="w-4 h-4 border-2 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-sm text-gray-600">Transcription en cours...</span>
                </>
              )}
              {transcriptionText && !isTranscribing && (
                <span className="text-sm text-gray-600">Transcription : {transcriptionText}</span>
              )}
            </div>
          )}

          {/* Chat Input */}
          <div className="p-6 border-t border-gray-200 bg-gray-50">
            <form onSubmit={handleSubmit} className="flex gap-3 items-center">
              {/* Bouton Microphone */}
              <button
                type="button"
                onClick={toggleRecording}
                disabled={isLoading || isTranscribing}
                className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all disabled:opacity-50 ${
                  isRecording
                    ? 'bg-red-500 text-white animate-pulse'
                    : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                }`}
                title={isRecording ? 'Arrêter l\'enregistrement' : 'Enregistrer un message vocal'}
              >
                {isRecording ? (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <rect x="6" y="6" width="12" height="12" rx="2" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                )}
              </button>

              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={isRecording ? 'Enregistrement...' : t('ask_placeholder')}
                className="flex-1 input"
                disabled={isLoading || isRecording}
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim() || isRecording}
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
              {t('ask_powered')} — Transcription vocale par Mistral Voxtral
            </p>
          </div>
        </div>

        {/* Suggestions */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('ask_suggestions_title')}</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => setInput('Quelles sont les PME du numérique en Bretagne ?')}
              className="w-full text-left bg-white rounded-xl shadow-card p-4 hover:shadow-lg transition-shadow text-gray-700"
            >
              "Quelles sont les PME du numérique en Bretagne ?"
            </button>
            <button
              onClick={() => setInput('Combien d\'entreprises de restauration ont été créées à Lyon ce trimestre ?')}
              className="w-full text-left bg-white rounded-xl shadow-card p-4 hover:shadow-lg transition-shadow text-gray-700"
            >
              "Combien d'entreprises de restauration à Lyon ce trimestre ?"
            </button>
            <button
              onClick={() => setInput('Quelles sont les entreprises de commerce de détail en Île-de-France ?')}
              className="w-full text-left bg-white rounded-xl shadow-card p-4 hover:shadow-lg transition-shadow text-gray-700"
            >
              "Quelles sont les entreprises de commerce en Île-de-France ?"
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
