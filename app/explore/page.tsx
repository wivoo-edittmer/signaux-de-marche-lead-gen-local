"use client"

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import ZoneSelector from '@/components/ZoneSelector'
import SectorSelector from '@/components/SectorSelector'
import DateRangePicker from '@/components/DateRangePicker'

// Mock data for demonstration
const mockZones = [
  { code: 'FR', name: 'France', type: 'country' },
  { code: '11', name: 'Île-de-France', type: 'region' },
  { code: '75', name: 'Paris', type: 'department' },
  { code: '75001', name: 'Paris 1er', type: 'commune' },
]

const mockSectors = [
  { code: '56', name: 'Restauration', type: 'naf2' },
  { code: '561', name: 'Restaurants traditionnels', type: 'naf3' },
  { code: '47', name: 'Commerce de détail', type: 'naf2' },
  { code: '62', name: 'Programmation, conseil', type: 'naf2' },
  { code: '6201', name: 'Programmation informatique', type: 'naf4' },
]

// Mock market data
const mockMarketData = [
  {
    zone: 'Paris',
    zoneType: 'department',
    sector: 'Restauration',
    sectorLevel: 'naf2',
    potential: 87,
    grade: 'A',
    growthRate: 12.5,
    creationRate: 8.3,
    companies: 2458,
    newCompanies: 213,
    closedCompanies: 45,
  },
  {
    zone: 'Paris',
    zoneType: 'department',
    sector: 'Commerce de détail',
    sectorLevel: 'naf2',
    potential: 72,
    grade: 'B',
    growthRate: 6.2,
    creationRate: 5.8,
    companies: 3847,
    newCompanies: 158,
    closedCompanies: 89,
  },
  {
    zone: 'Paris',
    zoneType: 'department',
    sector: 'Programmation, conseil',
    sectorLevel: 'naf2',
    potential: 94,
    grade: 'A',
    growthRate: 18.7,
    creationRate: 14.2,
    companies: 1562,
    newCompanies: 254,
    closedCompanies: 23,
  },
  {
    zone: 'Lyon',
    zoneType: 'commune',
    sector: 'Restauration',
    sectorLevel: 'naf2',
    potential: 78,
    grade: 'B',
    growthRate: 9.4,
    creationRate: 7.1,
    companies: 1234,
    newCompanies: 98,
    closedCompanies: 32,
  },
]

const gradeColors: Record<string, string> = {
  A: 'bg-success-700',
  B: 'bg-success-500',
  C: 'bg-gray-500',
  D: 'bg-warning-500',
  E: 'bg-warning-700',
}

const gradeTextColors = {
  A: 'text-success-700',
  B: 'text-success-500',
  C: 'text-gray-500',
  D: 'text-warning-500',
  E: 'text-warning-700',
}

export default function ExplorePage() {
  const [selectedZone, setSelectedZone] = useState<string>('75')
  const [selectedSector, setSelectedSector] = useState<string>('56')
  const [startDate, setStartDate] = useState<string>('2024-01-01')
  const [endDate, setEndDate] = useState<string>('2024-10-07')
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [marketData, setMarketData] = useState<any[]>([])

  // For demo purposes, use mock data
  useEffect(() => {
    setIsLoading(true)
    // Simulate API call
    const timer = setTimeout(() => {
      setMarketData(mockMarketData)
      setIsLoading(false)
    }, 500)
    return () => clearTimeout(timer)
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <Link href="/" className="hover:text-brand-primary transition-colors">
            Home
          </Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">Explore</span>
        </nav>

        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
            Explore Market Data
          </h1>
          <p className="text-gray-600 max-w-2xl">
            Discover market trends and business opportunities by zone and sector. 
            Analyze creation rates, growth patterns, and potential scores.
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-card p-6 mb-10">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Filters</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Geographic Zone
              </label>
              <ZoneSelector
                value={selectedZone}
                onChange={handleZoneChange}
                zones={mockZones}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Business Sector
              </label>
              <SectorSelector
                value={selectedSector}
                onChange={handleSectorChange}
                sectors={mockSectors}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Time Period
              </label>
              <DateRangePicker
                startDate={startDate}
                endDate={endDate}
                onChange={handleDateRangeChange}
              />
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="space-y-6">
          {/* Stats Overview */}
          {marketData.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <div className="bg-white rounded-xl shadow-card p-6">
                <div className="text-sm text-gray-500 mb-1">Total Markets</div>
                <div className="text-3xl font-bold text-gray-900">{marketData.length}</div>
              </div>
              
              <div className="bg-white rounded-xl shadow-card p-6">
                <div className="text-sm text-gray-500 mb-1">Avg. Potential</div>
                <div className="text-3xl font-bold text-brand-primary">
                  {Math.round(marketData.reduce((sum, item) => sum + item.potential, 0) / marketData.length)}
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow-card p-6">
                <div className="text-sm text-gray-500 mb-1">Highest Growth</div>
                <div className="text-3xl font-bold text-success-700">
                  {Math.max(...marketData.map(item => item.growthRate))}%
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow-card p-6">
                <div className="text-sm text-gray-500 mb-1">New Companies</div>
                <div className="text-3xl font-bold text-gray-900">
                  {marketData.reduce((sum, item) => sum + item.newCompanies, 0)}
                </div>
              </div>
            </div>
          )}

          {/* Market Cards */}
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-primary"></div>
              <p className="mt-4 text-gray-500">Loading market data...</p>
            </div>
          ) : marketData.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No market data found for selected filters.</p>
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
                        Grade {item.grade}
                      </span>
                    </div>

                    <div className="flex items-end gap-6 mb-6">
                      <div>
                        <div className="text-4xl font-bold text-gray-900">
                          {item.potential}
                        </div>
                        <div className="text-sm text-gray-500">
                          Potential Score
                        </div>
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm text-gray-500">Growth</span>
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
                        <span className="text-gray-500">Companies</span>
                        <span className="ml-2 font-medium text-gray-900">{item.companies}</span>
                      </div>
                      <div className="flex gap-4">
                        <div>
                          <span className="text-success-700 font-medium">+{item.newCompanies}</span>
                          <span className="text-gray-400 text-xs ml-1">new</span>
                        </div>
                        <div>
                          <span className="text-warning-700 font-medium">{item.closedCompanies}</span>
                          <span className="text-gray-400 text-xs ml-1">closed</span>
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
