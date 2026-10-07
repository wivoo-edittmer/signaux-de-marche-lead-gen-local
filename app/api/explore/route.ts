import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/client'

// GET /api/explore
// Query params:
//   - zone_code: filter by zone code (e.g. "75", "69123")
//   - naf_code: filter by NAF code (e.g. "56", "62")
//   - period: filter by time period (e.g. "2024-Q3")
//   - view: "signals" (default) | "leads" | "all"
//   - limit: max signals to return (default 50)
//   - leads_limit: max recent companies to return (default 20)
//
// Returns:
//   - zones: all available zones for the selector
//   - sectors: all available sectors for the selector
//   - signals: filtered market signals
//   - summary: aggregated stats from signals
//   - leads: recent company creations matching filters (lead gen)

export async function GET(request: NextRequest) {
  try {
    const supabase = createAdminClient()
    const params = request.nextUrl.searchParams

    const zoneCode = params.get('zone_code') || undefined
    const nafCode = params.get('naf_code') || undefined
    const period = params.get('period') || undefined
    const view = params.get('view') || 'all'
    const limit = Math.min(parseInt(params.get('limit') || '50', 10), 200)
    const leadsLimit = Math.min(parseInt(params.get('leads_limit') || '20', 10), 100)

    // Fetch zones and sectors in parallel (always needed for selectors)
    const [zonesResult, sectorsResult] = await Promise.all([
      supabase
        .from('zones')
        .select('code, name, type, parent_code, population')
        .order('type', { ascending: true })
        .order('name', { ascending: true }),
      supabase
        .from('sectors')
        .select('code, name, level, parent_code, description')
        .order('level', { ascending: true })
        .order('code', { ascending: true }),
    ])

    if (zonesResult.error) throw zonesResult.error
    if (sectorsResult.error) throw sectorsResult.error

    // Build market signals query
    let signalsQuery = supabase
      .from('market_signals')
      .select('*')
      .order('potential_score', { ascending: false })
      .limit(limit)

    if (zoneCode) {
      signalsQuery = signalsQuery.eq('zone_code', zoneCode)
    }
    if (nafCode) {
      signalsQuery = signalsQuery.eq('naf_code', nafCode)
    }
    if (period) {
      signalsQuery = signalsQuery.eq('time_period', period)
    }

    // Build leads query (recent company creations)
    let leadsQuery = supabase
      .from('companies')
      .select('siren, name, naf_code, naf_level2, naf_name, commune_name, department_code, creation_date, employees_range, latitude, longitude')
      .not('creation_date', 'is', null)
      .order('creation_date', { ascending: false })
      .limit(leadsLimit)

    if (zoneCode) {
      // Match by department code (first 2-3 chars of zone_code) or commune code
      if (zoneCode.length <= 3) {
        leadsQuery = leadsQuery.eq('department_code', zoneCode)
      } else {
        leadsQuery = leadsQuery.eq('commune_code', zoneCode)
      }
    }
    if (nafCode) {
      // Match NAF at level 2 (first 2 digits)
      const naf2 = nafCode.substring(0, 2)
      leadsQuery = leadsQuery.eq('naf_level2', naf2)
    }

    // Fetch signals and leads in parallel
    const [signalsResult, leadsResult] = await Promise.all([
      view === 'leads' ? Promise.resolve({ data: [], error: null }) : signalsQuery,
      view === 'signals' ? Promise.resolve({ data: [], error: null }) : leadsQuery,
    ])

    if (signalsResult.error) throw signalsResult.error
    if (leadsResult.error) throw leadsResult.error

    const signals = signalsResult.data || []
    const leads = leadsResult.data || []

    // Compute summary stats from signals
    const summary = computeSummary(signals)

    // Get available periods from signals (for period filter)
    const periods = [...new Set(signals.map((s: any) => s.time_period))].sort().reverse()

    return NextResponse.json({
      zones: zonesResult.data || [],
      sectors: sectorsResult.data || [],
      signals,
      summary,
      leads,
      periods,
      filters: {
        zone_code: zoneCode || null,
        naf_code: nafCode || null,
        period: period || null,
      },
    })
  } catch (error) {
    console.error('Error in explore API:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { error: 'Failed to fetch explore data', details: errorMessage },
      { status: 500 }
    )
  }
}

function computeSummary(signals: any[]) {
  if (signals.length === 0) {
    return {
      totalMarkets: 0,
      avgPotential: 0,
      highestGrowth: 0,
      totalNewCompanies: 0,
      totalClosedCompanies: 0,
      totalCompanies: 0,
      avgCreationRate: 0,
      topGrade: null,
      topScore: 0,
      gradeDistribution: { A: 0, B: 0, C: 0, D: 0, E: 0 },
    }
  }

  const totalNew = signals.reduce((sum, s) => sum + (s.new_companies || 0), 0)
  const totalClosed = signals.reduce((sum, s) => sum + (s.closed_companies || 0), 0)
  const totalCompanies = signals.reduce((sum, s) => sum + (s.total_companies || 0), 0)
  const avgPotential = Math.round(
    signals.reduce((sum, s) => sum + (s.potential_score || 0), 0) / signals.length
  )
  const highestGrowth = Math.max(...signals.map((s) => s.growth_rate || 0))
  const avgCreationRate = Math.round(
    (signals.reduce((sum, s) => sum + (s.creation_rate || 0), 0) / signals.length) * 10
  ) / 10

  const gradeDistribution: Record<string, number> = { A: 0, B: 0, C: 0, D: 0, E: 0 }
  signals.forEach((s) => {
    const grade = s.potential_grade || 'C'
    if (gradeDistribution[grade] !== undefined) {
      gradeDistribution[grade]++
    }
  })

  const topSignal = signals.reduce((best, s) =>
    (s.potential_score || 0) > (best.potential_score || 0) ? s : best
  , signals[0])

  return {
    totalMarkets: signals.length,
    avgPotential,
    highestGrowth,
    totalNewCompanies: totalNew,
    totalClosedCompanies: totalClosed,
    totalCompanies,
    avgCreationRate,
    topGrade: topSignal?.potential_grade || null,
    topScore: topSignal?.potential_score || 0,
    gradeDistribution,
  }
}
