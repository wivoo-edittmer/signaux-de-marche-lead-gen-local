import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/client'

interface ParsedQuery {
  intent: 'trends' | 'potential' | 'stats' | 'help' | 'general'
  zoneName?: string
  zoneCode?: string
  zoneType?: string
  sectorName?: string
  nafCode?: string
  nafLevel?: string
  period?: string
}

// Common French cities and their codes
const ZONE_MAP: Record<string, { code: string; type: string; name: string }> = {
  'paris': { code: '75', type: 'department', name: 'Paris' },
  'lyon': { code: '69123', type: 'commune', name: 'Lyon' },
  'marseille': { code: '13', type: 'department', name: 'Marseille' },
  'toulouse': { code: '31', type: 'department', name: 'Toulouse' },
  'nice': { code: '06', type: 'department', name: 'Nice' },
  'nantes': { code: '44', type: 'department', name: 'Nantes' },
  'strasbourg': { code: '67', type: 'department', name: 'Strasbourg' },
  'montpellier': { code: '34', type: 'department', name: 'Montpellier' },
  'bordeaux': { code: '33', type: 'department', name: 'Bordeaux' },
  'lille': { code: '59', type: 'department', name: 'Lille' },
  'rennes': { code: '35', type: 'department', name: 'Rennes' },
  'france': { code: 'FR', type: 'country', name: 'France' },
  'île-de-france': { code: '11', type: 'region', name: 'Île-de-France' },
  'ile-de-france': { code: '11', type: 'region', name: 'Île-de-France' },
  'auvergne-rhône-alpes': { code: '84', type: 'region', name: 'Auvergne-Rhône-Alpes' },
  'auvergne-rhone-alpes': { code: '84', type: 'region', name: 'Auvergne-Rhône-Alpes' },
}

// Common sectors and their NAF codes
const SECTOR_MAP: Record<string, { code: string; level: string; name: string }> = {
  'restaurant': { code: '56', level: 'naf2', name: 'Restauration' },
  'restaurants': { code: '56', level: 'naf2', name: 'Restauration' },
  'restauration': { code: '56', level: 'naf2', name: 'Restauration' },
  'food': { code: '56', level: 'naf2', name: 'Restauration' },
  'retail': { code: '47', level: 'naf2', name: 'Commerce de détail' },
  'commerce': { code: '47', level: 'naf2', name: 'Commerce de détail' },
  'software': { code: '62', level: 'naf2', name: 'Programmation, conseil' },
  'tech': { code: '62', level: 'naf2', name: 'Programmation, conseil' },
  'technologie': { code: '62', level: 'naf2', name: 'Programmation, conseil' },
  'programmation': { code: '62', level: 'naf2', name: 'Programmation, conseil' },
  'informatique': { code: '62', level: 'naf2', name: 'Programmation, conseil' },
  'construction': { code: '41', level: 'naf2', name: 'Construction' },
  'bâtiment': { code: '41', level: 'naf2', name: 'Construction' },
  'btp': { code: '41', level: 'naf2', name: 'Construction' },
  'transport': { code: '49', level: 'naf2', name: 'Transports' },
  'transports': { code: '49', level: 'naf2', name: 'Transports' },
  'santé': { code: '86', level: 'naf2', name: 'Santé' },
  'health': { code: '86', level: 'naf2', name: 'Santé' },
  'hôtellerie': { code: '55', level: 'naf2', name: 'Hébergement' },
  'hotel': { code: '55', level: 'naf2', name: 'Hébergement' },
  'immobilier': { code: '68', level: 'naf2', name: 'Immobilier' },
  'real estate': { code: '68', level: 'naf2', name: 'Immobilier' },
}

function parseQuestion(question: string): ParsedQuery {
  const lower = question.toLowerCase()
  const result: ParsedQuery = { intent: 'general' }

  // Detect intent
  if (lower.includes('trend') || lower.includes('tendance') || lower.includes('évolution') || lower.includes('show me')) {
    result.intent = 'trends'
  } else if (lower.includes('potential') || lower.includes('potentiel') || lower.includes('opportunit') || lower.includes('grade')) {
    result.intent = 'potential'
  } else if (lower.includes('how many') || lower.includes('combien') || lower.includes('count') || lower.includes('statistique') || lower.includes('stat')) {
    result.intent = 'stats'
  } else if (lower.includes('help') || lower.includes('aide') || lower.includes('what can you') || lower.includes('que peux-tu')) {
    result.intent = 'help'
  }

  // Extract zone
  for (const [key, zone] of Object.entries(ZONE_MAP)) {
    if (lower.includes(key)) {
      result.zoneName = zone.name
      result.zoneCode = zone.code
      result.zoneType = zone.type
      break
    }
  }

  // Extract sector
  for (const [key, sector] of Object.entries(SECTOR_MAP)) {
    if (lower.includes(key)) {
      result.sectorName = sector.name
      result.nafCode = sector.code
      result.nafLevel = sector.level
      break
    }
  }

  // Extract NAF code directly (e.g., "NAF 56", "naf 62")
  const nafMatch = lower.match(/naf\s*(\d{2,5})/)
  if (nafMatch) {
    result.nafCode = nafMatch[1]
    result.nafLevel = `naf${nafMatch[1].length}`
  }

  // Extract period
  if (lower.includes('last quarter') || lower.includes('dernier trimestre') || lower.includes('q3') || lower.includes('q4')) {
    result.period = 'quarter'
  } else if (lower.includes('last month') || lower.includes('dernier mois')) {
    result.period = 'month'
  } else if (lower.includes('last year') || lower.includes('dernière année') || lower.includes('12 month') || lower.includes('12 mois')) {
    result.period = 'year'
  }

  return result
}

async function queryMarketSignals(
  supabase: ReturnType<typeof createAdminClient>,
  parsed: ParsedQuery
) {
  let query = supabase
    .from('market_signals')
    .select('*')
    .order('potential_score', { ascending: false })
    .limit(20)

  // Filter by zone: prefer code match, fall back to name search
  if (parsed.zoneCode) {
    query = query.eq('zone_code', parsed.zoneCode)
  } else if (parsed.zoneName) {
    query = query.ilike('zone_name', `%${parsed.zoneName}%`)
  }

  // Filter by sector: prefer code match, fall back to name search
  if (parsed.nafCode) {
    query = query.eq('naf_code', parsed.nafCode)
  } else if (parsed.sectorName) {
    query = query.ilike('naf_name', `%${parsed.sectorName}%`)
  }

  const { data, error } = await query
  if (error) throw error

  // If no results with code match, try name-based search as fallback
  if ((!data || data.length === 0) && parsed.zoneName && parsed.zoneCode) {
    let fallbackQuery = supabase
      .from('market_signals')
      .select('*')
      .ilike('zone_name', `%${parsed.zoneName}%`)
      .order('potential_score', { ascending: false })
      .limit(20)

    if (parsed.nafCode) {
      fallbackQuery = fallbackQuery.eq('naf_code', parsed.nafCode)
    } else if (parsed.sectorName) {
      fallbackQuery = fallbackQuery.ilike('naf_name', `%${parsed.sectorName}%`)
    }

    const { data: fallbackData, error: fallbackError } = await fallbackQuery
    if (fallbackError) throw fallbackError
    return fallbackData
  }

  return data
}

async function queryZones(
  supabase: ReturnType<typeof createAdminClient>,
  search?: string
) {
  let query = supabase
    .from('zones')
    .select('*')
    .limit(50)

  if (search) {
    query = query.ilike('name', `%${search}%`)
  }

  const { data, error } = await query
  if (error) throw error
  return data
}

async function querySectors(
  supabase: ReturnType<typeof createAdminClient>,
  search?: string
) {
  let query = supabase
    .from('sectors')
    .select('*')
    .limit(50)

  if (search) {
    query = query.ilike('name', `%${search}%`)
  }

  const { data, error } = await query
  if (error) throw error
  return data
}

async function queryCompanyStats(
  supabase: ReturnType<typeof createAdminClient>,
  parsed: ParsedQuery
) {
  let query = supabase
    .from('companies')
    .select('id', { count: 'exact', head: true })

  if (parsed.zoneName) {
    if (parsed.zoneType === 'commune') {
      query = query.ilike('commune_name', `%${parsed.zoneName}%`)
    } else {
      query = query.eq('department_code', parsed.zoneCode)
    }
  }
  if (parsed.nafCode) {
    query = query.eq('naf_level2', parsed.nafCode)
  }

  const { count, error } = await query
  if (error) throw error
  return count
}

async function queryRecentCompanies(
  supabase: ReturnType<typeof createAdminClient>,
  parsed: ParsedQuery,
  limit = 10
) {
  let query = supabase
    .from('companies')
    .select('name, commune_name, creation_date, naf_name')
    .order('creation_date', { ascending: false })
    .limit(limit)

  if (parsed.zoneName) {
    if (parsed.zoneType === 'commune') {
      query = query.ilike('commune_name', `%${parsed.zoneName}%`)
    } else {
      query = query.eq('department_code', parsed.zoneCode)
    }
  }
  if (parsed.nafCode) {
    query = query.eq('naf_level2', parsed.nafCode)
  }

  const { data, error } = await query
  if (error) throw error
  return data
}

async function logUserQuery(
  supabase: ReturnType<typeof createAdminClient>,
  question: string,
  parsed: ParsedQuery,
  resultsCount: number
) {
  try {
    await supabase.from('user_queries').insert({
      query_text: question,
      zone_type: parsed.zoneType || null,
      zone_code: parsed.zoneCode || null,
      naf_level: parsed.nafLevel || null,
      naf_code: parsed.nafCode || null,
      results_count: resultsCount,
    })
  } catch {
    // Logging is non-critical
  }
}

function buildResponse(parsed: ParsedQuery, data: any): { message: string; data?: any } {
  const zoneLabel = parsed.zoneName || 'France'
  const sectorLabel = parsed.sectorName || 'all sectors'

  switch (parsed.intent) {
    case 'trends': {
      if (!data || data.length === 0) {
        return {
          message: `I couldn't find trend data for ${sectorLabel} in ${zoneLabel}. The database may not have data for this combination yet. Try a broader search or check the Explore page.`,
        }
      }

      const signals = data
      const topSignal = signals[0]
      const avgPotential = Math.round(
        signals.reduce((sum: number, s: any) => sum + (s.potential_score || 0), 0) / signals.length
      )
      const totalNew = signals.reduce((sum: number, s: any) => sum + (s.new_companies || 0), 0)
      const totalClosed = signals.reduce((sum: number, s: any) => sum + (s.closed_companies || 0), 0)
      const avgGrowth = (signals.reduce((sum: number, s: any) => sum + (s.growth_rate || 0), 0) / signals.length).toFixed(1)

      return {
        message: `Here are the market trends for ${sectorLabel} in ${zoneLabel}:`,
        data: {
          zone: zoneLabel,
          sector: sectorLabel,
          summary: {
            totalSignals: signals.length,
            avgPotential,
            totalNewCompanies: totalNew,
            totalClosedCompanies: totalClosed,
            avgGrowthRate: parseFloat(avgGrowth),
            topGrade: topSignal?.potential_grade || 'N/A',
            topScore: topSignal?.potential_score || 0,
          },
          signals: signals.map((s: any) => ({
            period: s.time_period,
            zone: s.zone_name,
            sector: s.naf_name || s.naf_code,
            totalCompanies: s.total_companies,
            newCompanies: s.new_companies,
            closedCompanies: s.closed_companies,
            netGrowth: s.net_growth,
            growthRate: s.growth_rate,
            potentialScore: s.potential_score,
            grade: s.potential_grade,
          })),
        },
      }
    }

    case 'potential': {
      if (!data || data.length === 0) {
        return {
          message: `I couldn't find potential data for ${sectorLabel} in ${zoneLabel}. Try asking about a specific city like Paris or Lyon, or a known sector like restaurants or software.`,
        }
      }

      const top = data[0]
      const avgScore = Math.round(
        data.reduce((sum: number, s: any) => sum + (s.potential_score || 0), 0) / data.length
      )

      return {
        message: `The market potential for ${sectorLabel} in ${zoneLabel} is ${avgScore >= 80 ? 'exceptional' : avgScore >= 60 ? 'strong' : avgScore >= 40 ? 'moderate' : 'emerging'}:`,
        data: {
          zone: zoneLabel,
          sector: sectorLabel,
          potential: avgScore,
          grade: top?.potential_grade || 'C',
          breakdown: {
            creationRate: top?.creation_rate || 0,
            growthRate: top?.growth_rate || 0,
            marketSize: Math.min(top?.total_companies || 0, 100),
            competition: top?.competition_score || 50,
          },
          recommendation: avgScore >= 80
            ? 'Strong buy - This is one of the highest potential markets with excellent growth indicators.'
            : avgScore >= 60
            ? 'Good opportunity - Solid fundamentals with room for growth.'
            : 'Monitor closely - Emerging market with potential but higher uncertainty.',
          topSignals: data.slice(0, 5).map((s: any) => ({
            period: s.time_period,
            zone: s.zone_name,
            score: s.potential_score,
            grade: s.potential_grade,
            newCompanies: s.new_companies,
            growthRate: s.growth_rate,
          })),
        },
      }
    }

    case 'stats': {
      const totalCount = data?.totalCount || 0
      const recentCompanies = data?.recentCompanies || []

      return {
        message: `Here are the statistics for ${sectorLabel} in ${zoneLabel}:`,
        data: {
          period: parsed.period || 'all time',
          sector: sectorLabel,
          zone: zoneLabel,
          total: totalCount,
          recentCompanies: recentCompanies.map((c: any) => ({
            name: c.name,
            commune: c.commune_name,
            date: c.creation_date,
            sector: c.naf_name,
          })),
        },
      }
    }

    case 'help':
      return {
        message: 'I can help you with:',
        data: {
          capabilities: [
            'Market trend analysis by zone and sector',
            'Company creation and closure statistics',
            'Potential scoring for business opportunities',
            'Geographic distribution of companies',
            'Sector performance comparisons',
            'Historical data analysis',
          ],
          examples: [
            '"Show me restaurant trends in Paris"',
            '"What is the potential for software companies in Lyon?"',
            '"How many new companies were created in retail last quarter?"',
            '"Compare growth rates between Paris and Lyon for NAF 62"',
            '"Find new companies created in my zone this month"',
          ],
        },
      }

    default: {
      // General query - try to provide useful data
      if (data && data.length > 0) {
        const topSignals = data.slice(0, 5)
        return {
          message: `Here's what I found for ${sectorLabel} in ${zoneLabel}:`,
          data: {
            zone: zoneLabel,
            sector: sectorLabel,
            signals: topSignals.map((s: any) => ({
              period: s.time_period,
              zone: s.zone_name,
              sector: s.naf_name || s.naf_code,
              totalCompanies: s.total_companies,
              newCompanies: s.new_companies,
              closedCompanies: s.closed_companies,
              netGrowth: s.net_growth,
              growthRate: s.growth_rate,
              potentialScore: s.potential_score,
              grade: s.potential_grade,
            })),
          },
        }
      }

      return {
        message: `I understand you're asking about "${parsed.zoneName || 'market data'}" and "${parsed.sectorName || 'business trends'}". I'm querying the database for relevant information. If you don't see specific results, try being more specific about a city (like Paris, Lyon, Marseille) or a sector (like restaurants, software, retail).`,
        data: {
          capabilities: [
            'Market trend analysis by zone and sector',
            'Company creation and closure statistics',
            'Potential scoring for business opportunities',
            'Geographic distribution of companies',
            'Sector performance comparisons',
          ],
          examples: [
            '"Show me restaurant trends in Paris"',
            '"What is the potential for software companies in Lyon?"',
            '"How many new companies in retail?"',
          ],
        },
      }
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const question: string = body.question?.trim()

    if (!question) {
      return NextResponse.json(
        { error: 'Question is required' },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()
    const parsed = parseQuestion(question)

    // Handle help intent without database queries
    if (parsed.intent === 'help') {
      const response = buildResponse(parsed, null)
      return NextResponse.json(response)
    }

    let responseData: any = null
    let resultsCount = 0

    if (parsed.intent === 'stats') {
      // For stats, query companies directly
      const [totalCount, recentCompanies] = await Promise.all([
        queryCompanyStats(supabase, parsed),
        queryRecentCompanies(supabase, parsed),
      ])
      resultsCount = totalCount || 0
      responseData = { totalCount, recentCompanies }
    } else {
      // For trends and potential, query market_signals
      const signals = await queryMarketSignals(supabase, parsed)
      resultsCount = signals?.length || 0
      responseData = signals
    }

    // Log the query
    await logUserQuery(supabase, question, parsed, resultsCount)

    const response = buildResponse(parsed, responseData)
    return NextResponse.json(response)

  } catch (error) {
    console.error('Error processing question:', error)

    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    const isAuthError = errorMessage.toLowerCase().includes('api key') ||
                        errorMessage.toLowerCase().includes('invalid') ||
                        errorMessage.toLowerCase().includes('jwt')

    return NextResponse.json(
      {
        message: isAuthError
          ? 'The database connection is not configured correctly. Please check your Supabase API keys in .env.local.'
          : 'Sorry, I encountered an error while processing your question. Please try again.',
        error: errorMessage,
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    message: 'B2BMax Ask API - POST a question to get started',
    examples: [
      'Show me restaurant trends in Paris',
      'What is the potential for software companies in Lyon?',
      'How many new companies in retail?',
    ],
  })
}
