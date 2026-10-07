"use client"

import { useState, useEffect, useCallback, useMemo } from 'react'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import ZoneSelector from '@/components/ZoneSelector'
import SectorSelector from '@/components/SectorSelector'
import DateRangePicker from '@/components/DateRangePicker'
import MapView from '@/components/MapView'
import { useI18n } from '@/lib/i18n'
import { getSectors, getZones, searchCompanies, type Sector, type Zone, type SearchResponse } from '@/lib/api'

// Types pour les options des sélecteurs
interface ZoneOption {
  code: string
  name: string
  type: string
}

interface SectorOption {
  code: string
  name: string
  type: string
}

// Données pour les cartes de marché (adaptées depuis SearchResponse)
interface MarketDataItem {
  zone: string
  zoneType: string
  sector: string
  sectorLevel: string
  potential: number
  grade: string
  growthRate: number
  creationRate: number
  companies: number
  newCompanies: number
  closedCompanies: number
  coordinates: [number, number]
}

const gradeColors: Record<string, string> = {
  A: 'bg-success-700',
  B: 'bg-success-500',
  C: 'bg-gray-500',
  D: 'bg-warning-500',
  E: 'bg-warning-700',
}

// Coordonnées approximatives pour les zones françaises
const zoneCoordinates: Record<string, [number, number]> = {
  'BRE': [ -2.5, 48.1],   // Bretagne
  'IDF': [2.5, 48.7],     // Île-de-France
  '75': [2.3522, 48.8566], // Paris
  '69': [4.8357, 45.7640], // Lyon
  '33': [ -0.5792, 44.8378], // Bordeaux
  '13': [5.3698, 43.2965],  // Marseille
  '31': [1.4442, 43.6047],  // Toulouse
  '44': [ -1.5536, 47.2184], // Nantes
  '67': [7.7521, 48.5734],  // Strasbourg
  '59': [3.0573, 50.6292],  // Lille
  '35': [ -1.6743, 48.1173], // Rennes
  '29': [ -4.0970, 48.3909], // Brest (Finistère)
  '22': [ -2.8, 48.5],       // Côtes-d'Armor
  '56': [ -2.8, 47.7],       // Morbihan
  'FR': [2.2137, 46.6034],   // France
}

// Convertit un score de tendance en grade
function trendToGrade(trend: string, netChange: number): string {
  if (trend === 'growth' && netChange > 50) return 'A'
  if (trend === 'growth') return 'B'
  if (trend === 'stable') return 'C'
  if (netChange > -20) return 'D'
  return 'E'
}

// Convertit un score de tendance en potentiel (0-100)
function trendToPotential(trend: string, totalCompanies: number, creations: number): number {
  let score = 50
  if (trend === 'growth') score += 25
  else if (trend === 'decline') score -= 20
  // Bonus basé sur le volume
  if (totalCompanies > 1000) score += 10
  else if (totalCompanies > 100) score += 5
  if (creations > 50) score += 10
  else if (creations > 10) score += 5
  return Math.min(Math.max(score, 0), 100)
}

export default function ExplorePage() {
  const { t } = useI18n()
  const [selectedZone, setSelectedZone] = useState<string>('BRE')
  const [selectedSector, setSelectedSector] = useState<string>('J')
  const [startDate, setStartDate] = useState<string>('2024-01-01')
  const [endDate, setEndDate] = useState<string>('2026-10-07')
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [marketData, setMarketData] = useState<MarketDataItem[]>([])
  const [zones, setZones] = useState<ZoneOption[]>([])
  const [sectors, setSectors] = useState<SectorOption[]>([])
  const [error, setError] = useState<string | null>(null)

  // Charger les zones et secteurs depuis l'API
  useEffect(() => {
    async function loadReferenceData() {
      try {
        const [zonesData, sectorsData] = await Promise.all([
          getZones(),
          getSectors(),
        ])

        // Convertir les zones pour le sélecteur
        const zoneOptions: ZoneOption[] = zonesData.map((z: Zone) => ({
          code: z.code,
          name: z.name,
          type: z.level,
        }))
        setZones(zoneOptions)

        // Convertir les secteurs pour le sélecteur
        const sectorOptions: SectorOption[] = sectorsData.map((s: Sector) => ({
          code: s.naf_code,
          name: s.name,
          type: `NAF niveau ${s.level}`,
        }))
        setSectors(sectorOptions)
      } catch (err) {
        console.error('Erreur chargement données de référence:', err)
        setError('Impossible de charger les données de référence')
      }
    }

    loadReferenceData()
  }, [])

  // Charger les données de marché depuis l'API
  useEffect(() => {
    async function loadMarketData() {
      setIsLoading(true)
      setError(null)

      try {
        const response: SearchResponse = await searchCompanies({
          sector_id: selectedSector,
          zone_id: selectedZone,
          date_from: startDate,
          date_to: endDate,
          limit: 50,
        })

        // Convertir la réponse en MarketDataItem
        const items: MarketDataItem[] = response.companies.map((company) => {
          const zoneCode = company.postal_code?.substring(0, 2) || selectedZone
          const coords = zoneCoordinates[zoneCode] || zoneCoordinates[selectedZone] || zoneCoordinates['FR']

          return {
            zone: company.commune || response.zone_name || selectedZone,
            zoneType: 'commune',
            sector: response.sector_name || selectedSector,
            sectorLevel: 'naf',
            potential: trendToPotential(response.statistics.trend, response.statistics.total_companies, response.statistics.creations),
            grade: trendToGrade(response.statistics.trend, response.statistics.net_change),
            growthRate: response.statistics.net_change > 0
              ? Math.round((response.statistics.creations / Math.max(response.statistics.total_companies, 1)) * 100 * 10) / 10
              : -Math.round((response.statistics.radiations / Math.max(response.statistics.total_companies, 1)) * 100 * 10) / 10,
            creationRate: Math.round((response.statistics.creations / Math.max(response.statistics.total_companies, 1)) * 100 * 10) / 10,
            companies: response.statistics.total_companies,
            newCompanies: response.statistics.creations,
            closedCompanies: response.statistics.radiations,
            coordinates: coords,
          }
        })

        // Si pas d'entreprises individuelles, créer une entrée agrégée
        if (items.length === 0 && response.statistics.total_companies > 0) {
          const coords = zoneCoordinates[selectedZone] || zoneCoordinates['FR']
          items.push({
            zone: response.zone_name || selectedZone,
            zoneType: 'region',
            sector: response.sector_name || selectedSector,
            sectorLevel: 'naf',
            potential: trendToPotential(response.statistics.trend, response.statistics.total_companies, response.statistics.creations),
            grade: trendToGrade(response.statistics.trend, response.statistics.net_change),
            growthRate: response.statistics.net_change > 0
              ? Math.round((response.statistics.creations / Math.max(response.statistics.total_companies, 1)) * 100 * 10) / 10
              : -Math.round((response.statistics.radiations / Math.max(response.statistics.total_companies, 1)) * 100 * 10) / 10,
            creationRate: Math.round((response.statistics.creations / Math.max(response.statistics.total_companies, 1)) * 100 * 10) / 10,
            companies: response.statistics.total_companies,
            newCompanies: response.statistics.creations,
            closedCompanies: response.statistics.radiations,
            coordinates: coords,
          })
        }

        setMarketData(items)
      } catch (err) {
        console.error('Erreur chargement données marché:', err)
        setError(err instanceof Error ? err.message : 'Erreur de chargement des données')
        setMarketData([])
      } finally {
        setIsLoading(false)
      }
    }

    if (selectedZone && selectedSector) {
      loadMarketData()
    }
  }, [selectedZone, selectedSector, startDate, endDate])

  const handleZoneChange = useCallback((zone: string) => {
    setSelectedZone(zone)
  }, [])

  const handleSectorChange = useCallback((sector: string) => {
    setSelectedSector(sector)
  }, [])

  const handleDateRangeChange = useCallback((start: string, end: string) => {
    setStartDate(start)
    setEndDate(end)
  }, [])

  const mapMarkers = useMemo(() => {
    return marketData.map(item => ({
      zone: item.zone,
      zoneType: item.zoneType,
      sector: item.sector,
      potential: item.potential,
      grade: item.grade,
      growthRate: item.growthRate,
      companies: item.companies,
      newCompanies: item.newCompanies,
      closedCompanies: item.closedCompanies,
      coordinates: item.coordinates,
    }))
  }, [marketData])

  // Calculer les statistiques agrégées
  const stats = useMemo(() => {
    if (marketData.length === 0) return null
    return {
      totalMarkets: marketData.length,
      avgPotential: Math.round(marketData.reduce((sum, item) => sum + item.potential, 0) / marketData.length),
      highestGrowth: Math.max(...marketData.map(item => item.growthRate)),
      totalNewCompanies: marketData.reduce((sum, item) => sum + item.newCompanies, 0),
      totalCompanies: marketData.reduce((sum, item) => sum + item.companies, 0),
    }
  }, [marketData])

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <Link href="/" className="hover:text-brand-primary transition-colors">
            {t('explore_breadcrumb_home')}
          </Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">{t('explore_breadcrumb_current')}</span>
        </nav>

        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
            {t('explore_title')}
          </h1>
          <p className="text-gray-600 max-w-2xl">
            {t('explore_subtitle')}
          </p>
        </div>

        {/* Filtres */}
        <div className="bg-white rounded-xl shadow-card p-6 mb-10">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">{t('explore_filters')}</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('explore_zone_label')}
              </label>
              <ZoneSelector
                value={selectedZone}
                onChange={handleZoneChange}
                zones={zones}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('explore_sector_label')}
              </label>
              <SectorSelector
                value={selectedSector}
                onChange={handleSectorChange}
                sectors={sectors}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('explore_period_label')}
              </label>
              <DateRangePicker
                startDate={startDate}
                endDate={endDate}
                onChange={handleDateRangeChange}
              />
            </div>
          </div>
        </div>

        {/* Résultats */}
        <div className="space-y-6">
          {/* Message d'erreur */}
          {error && (
            <div className="bg-warning-50 border border-warning-200 text-warning-700 rounded-xl p-4">
              {error}
            </div>
          )}

          {/* Stats Overview */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <div className="bg-white rounded-xl shadow-card p-6">
                <div className="text-sm text-gray-500 mb-1">{t('explore_total_markets')}</div>
                <div className="text-3xl font-bold text-gray-900">{stats.totalMarkets}</div>
              </div>

              <div className="bg-white rounded-xl shadow-card p-6">
                <div className="text-sm text-gray-500 mb-1">{t('explore_avg_potential')}</div>
                <div className="text-3xl font-bold text-brand-primary">{stats.avgPotential}</div>
              </div>

              <div className="bg-white rounded-xl shadow-card p-6">
                <div className="text-sm text-gray-500 mb-1">{t('explore_highest_growth')}</div>
                <div className="text-3xl font-bold text-success-700">
                  {stats.highestGrowth > 0 ? '+' : ''}{stats.highestGrowth}%
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-card p-6">
                <div className="text-sm text-gray-500 mb-1">{t('explore_new_companies')}</div>
                <div className="text-3xl font-bold text-gray-900">{stats.totalNewCompanies}</div>
              </div>
            </div>
          )}

          {/* Map */}
          {!isLoading && marketData.length > 0 && (
            <div className="bg-white rounded-xl shadow-card p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Geographic Overview</h2>
              <MapView markers={mapMarkers} height="450px" />
            </div>
          )}

          {/* Market Cards */}
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-primary"></div>
              <p className="mt-4 text-gray-500">{t('explore_loading')}</p>
            </div>
          ) : marketData.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">{t('explore_no_data')}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {marketData.map((item, index) => (
                <div
                  key={index}
                  className="bg-white rounded-xl shadow-card overflow-hidden hover:shadow-lg transition-shadow card-hover"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {item.zone}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                          {item.sector}
                        </p>
                      </div>
                      <span className={`badge ${gradeColors[item.grade as string]} text-white`}>
                        {t('explore_grade')} {item.grade}
                      </span>
                    </div>

                    <div className="flex items-end gap-6 mb-6">
                      <div>
                        <div className="text-4xl font-bold text-gray-900">
                          {item.potential}
                        </div>
                        <div className="text-sm text-gray-500">
                          {t('explore_potential_score')}
                        </div>
                      </div>

                      <div className="flex-1">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm text-gray-500">{t('explore_growth')}</span>
                          <span className={`font-semibold ${item.growthRate >= 0 ? 'text-success-700' : 'text-warning-700'}`}>
                            {item.growthRate >= 0 ? '+' : ''}{item.growthRate}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                          <div
                            className={`h-1.5 rounded-full ${item.growthRate >= 0 ? 'bg-success-500' : 'bg-warning-500'}`}
                            style={{ width: `${Math.min(Math.abs(item.growthRate) * 2, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>

                    <div className="pt-6 border-t border-gray-100 flex justify-between items-center text-sm">
                      <div>
                        <span className="text-gray-500">{t('explore_companies')}</span>
                        <span className="ml-2 font-medium text-gray-900">{item.companies.toLocaleString()}</span>
                      </div>
                      <div className="flex gap-4">
                        <div>
                          <span className="text-success-700 font-medium">+{item.newCompanies}</span>
                          <span className="text-gray-400 text-xs ml-1">{t('explore_new')}</span>
                        </div>
                        <div>
                          <span className="text-warning-700 font-medium">{item.closedCompanies}</span>
                          <span className="text-gray-400 text-xs ml-1">{t('explore_closed')}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
