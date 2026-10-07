"use client"

import { useState, useEffect, useCallback, useMemo } from 'react'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import ZoneSelector from '@/components/ZoneSelector'
import SectorSelector from '@/components/SectorSelector'
import DateRangePicker from '@/components/DateRangePicker'
import MapView from '@/components/MapView'
import IrisHeatmap from '@/components/IrisHeatmap'
import {
  PotentialByZoneChart,
  GrowthTrendChart,
  GradeDistributionChart,
  NewBySectorChart,
  NetGrowthByZoneChart,
  CompaniesTrendChart,
  type ChartFilterEvent,
} from '@/components/ExploreCharts'
import { useI18n } from '@/lib/i18n'

// ─── Types ──────────────────────────────────────────────────────────────────

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

interface MarketSignal {
  id: string
  zone_code: string
  zone_name: string
  zone_type: string
  naf_code: string
  naf_name: string
  time_period: string
  total_companies: number
  new_companies: number
  closed_companies: number
  net_growth: number
  growth_rate: number
  creation_rate: number
  potential_score: number
  potential_grade: string
  competition_score: number | null
  coordinates: [number, number]
}

interface Lead {
  siren: string
  name: string
  naf_code: string
  naf_name: string
  commune_name: string
  department_code: string
  creation_date: string
  employees_range: string | null
  latitude: number | null
  longitude: number | null
}

type ViewMode = 'signals' | 'leads'
type SortField = 'potential_score' | 'growth_rate' | 'new_companies' | 'total_companies'
type SortDir = 'asc' | 'desc'

interface ActiveFilter {
  type: 'zone' | 'sector' | 'period' | 'grade'
  value: string
  label: string
}

// ─── Mock Data ──────────────────────────────────────────────────────────────

const MOCK_ZONES: ZoneOption[] = [
  { code: '11', name: 'Île-de-France', type: 'region' },
  { code: '84', name: 'Auvergne-Rhône-Alpes', type: 'region' },
  { code: '75', name: 'Paris', type: 'department' },
  { code: '69', name: 'Rhône', type: 'department' },
  { code: '13', name: 'Bouches-du-Rhône', type: 'department' },
  { code: '33', name: 'Gironde', type: 'department' },
  { code: '59', name: 'Nord', type: 'department' },
  { code: '31', name: 'Haute-Garonne', type: 'department' },
  { code: '44', name: 'Loire-Atlantique', type: 'department' },
  { code: '06', name: 'Alpes-Maritimes', type: 'department' },
  { code: '67', name: 'Bas-Rhin', type: 'department' },
  { code: '34', name: 'Hérault', type: 'department' },
  { code: '69123', name: 'Lyon', type: 'commune' },
]

const MOCK_SECTORS: SectorOption[] = [
  { code: '56', name: 'Restauration', type: 'naf2' },
  { code: '47', name: 'Commerce de détail', type: 'naf2' },
  { code: '62', name: 'Programmation, conseil', type: 'naf2' },
  { code: '41', name: 'Construction', type: 'naf2' },
  { code: '55', name: 'Hébergement', type: 'naf2' },
  { code: '68', name: 'Immobilier', type: 'naf2' },
  { code: '86', name: 'Santé', type: 'naf2' },
  { code: '49', name: 'Transports', type: 'naf2' },
]

const ZONE_COORDS: Record<string, [number, number]> = {
  '75': [2.3522, 48.8566],
  '69123': [4.8357, 45.7640],
  '69': [4.8357, 45.7640],
  '13': [5.3698, 43.2965],
  '33': [-0.5792, 44.8378],
  '59': [3.0573, 50.6292],
  '31': [1.4442, 43.6047],
  '44': [-1.5536, 47.2184],
  '06': [7.2620, 43.7102],
  '67': [7.7521, 48.5734],
  '34': [3.8767, 43.6108],
  '11': [2.5, 48.7],
  '84': [5.5, 44.5],
}

const MOCK_SIGNALS: MarketSignal[] = [
  { id: '1', zone_code: '75', zone_name: 'Paris', zone_type: 'department', naf_code: '56', naf_name: 'Restauration', time_period: '2024-Q3', total_companies: 2458, new_companies: 213, closed_companies: 45, net_growth: 168, growth_rate: 12.5, creation_rate: 8.65, potential_score: 87, potential_grade: 'A', competition_score: 35, coordinates: ZONE_COORDS['75'] },
  { id: '2', zone_code: '75', zone_name: 'Paris', zone_type: 'department', naf_code: '56', naf_name: 'Restauration', time_period: '2024-Q2', total_companies: 2290, new_companies: 198, closed_companies: 52, net_growth: 146, growth_rate: 11.2, creation_rate: 8.12, potential_score: 84.5, potential_grade: 'A', competition_score: 38, coordinates: ZONE_COORDS['75'] },
  { id: '3', zone_code: '75', zone_name: 'Paris', zone_type: 'department', naf_code: '56', naf_name: 'Restauration', time_period: '2024-Q1', total_companies: 2092, new_companies: 175, closed_companies: 48, net_growth: 127, growth_rate: 9.8, creation_rate: 7.45, potential_score: 81.2, potential_grade: 'A', competition_score: 40, coordinates: ZONE_COORDS['75'] },
  { id: '4', zone_code: '75', zone_name: 'Paris', zone_type: 'department', naf_code: '62', naf_name: 'Programmation, conseil', time_period: '2024-Q3', total_companies: 1562, new_companies: 254, closed_companies: 23, net_growth: 231, growth_rate: 18.7, creation_rate: 14.2, potential_score: 94, potential_grade: 'A', competition_score: 55, coordinates: ZONE_COORDS['75'] },
  { id: '5', zone_code: '75', zone_name: 'Paris', zone_type: 'department', naf_code: '62', naf_name: 'Programmation, conseil', time_period: '2024-Q2', total_companies: 1331, new_companies: 198, closed_companies: 31, net_growth: 167, growth_rate: 16.2, creation_rate: 12.8, potential_score: 91.5, potential_grade: 'A', competition_score: 58, coordinates: ZONE_COORDS['75'] },
  { id: '6', zone_code: '75', zone_name: 'Paris', zone_type: 'department', naf_code: '62', naf_name: 'Programmation, conseil', time_period: '2024-Q1', total_companies: 1164, new_companies: 175, closed_companies: 28, net_growth: 147, growth_rate: 14.5, creation_rate: 11.5, potential_score: 89.2, potential_grade: 'A', competition_score: 60, coordinates: ZONE_COORDS['75'] },
  { id: '7', zone_code: '75', zone_name: 'Paris', zone_type: 'department', naf_code: '47', naf_name: 'Commerce de détail', time_period: '2024-Q3', total_companies: 3847, new_companies: 158, closed_companies: 89, net_growth: 69, growth_rate: 6.2, creation_rate: 5.8, potential_score: 72, potential_grade: 'B', competition_score: 65, coordinates: ZONE_COORDS['75'] },
  { id: '8', zone_code: '75', zone_name: 'Paris', zone_type: 'department', naf_code: '47', naf_name: 'Commerce de détail', time_period: '2024-Q2', total_companies: 3778, new_companies: 142, closed_companies: 95, net_growth: 47, growth_rate: 5.1, creation_rate: 5.2, potential_score: 69.5, potential_grade: 'B', competition_score: 68, coordinates: ZONE_COORDS['75'] },
  { id: '9', zone_code: '69123', zone_name: 'Lyon', zone_type: 'commune', naf_code: '56', naf_name: 'Restauration', time_period: '2024-Q3', total_companies: 1234, new_companies: 98, closed_companies: 32, net_growth: 66, growth_rate: 9.4, creation_rate: 7.1, potential_score: 78, potential_grade: 'B', competition_score: 45, coordinates: ZONE_COORDS['69123'] },
  { id: '10', zone_code: '69123', zone_name: 'Lyon', zone_type: 'commune', naf_code: '56', naf_name: 'Restauration', time_period: '2024-Q2', total_companies: 1168, new_companies: 85, closed_companies: 28, net_growth: 57, growth_rate: 8.2, creation_rate: 6.5, potential_score: 75.5, potential_grade: 'B', competition_score: 48, coordinates: ZONE_COORDS['69123'] },
  { id: '11', zone_code: '69123', zone_name: 'Lyon', zone_type: 'commune', naf_code: '62', naf_name: 'Programmation, conseil', time_period: '2024-Q3', total_companies: 892, new_companies: 156, closed_companies: 18, net_growth: 138, growth_rate: 21.3, creation_rate: 15.8, potential_score: 92, potential_grade: 'A', competition_score: 50, coordinates: ZONE_COORDS['69123'] },
  { id: '12', zone_code: '69123', zone_name: 'Lyon', zone_type: 'commune', naf_code: '62', naf_name: 'Programmation, conseil', time_period: '2024-Q2', total_companies: 754, new_companies: 128, closed_companies: 22, net_growth: 106, growth_rate: 18.9, creation_rate: 14.2, potential_score: 89.5, potential_grade: 'A', competition_score: 52, coordinates: ZONE_COORDS['69123'] },
  { id: '13', zone_code: '69123', zone_name: 'Lyon', zone_type: 'commune', naf_code: '47', naf_name: 'Commerce de détail', time_period: '2024-Q3', total_companies: 2156, new_companies: 89, closed_companies: 54, net_growth: 35, growth_rate: 4.8, creation_rate: 4.5, potential_score: 65, potential_grade: 'B', competition_score: 70, coordinates: ZONE_COORDS['69123'] },
  { id: '14', zone_code: '13', zone_name: 'Bouches-du-Rhône', zone_type: 'department', naf_code: '56', naf_name: 'Restauration', time_period: '2024-Q3', total_companies: 1876, new_companies: 142, closed_companies: 38, net_growth: 104, growth_rate: 8.7, creation_rate: 6.8, potential_score: 76.5, potential_grade: 'B', competition_score: 48, coordinates: ZONE_COORDS['13'] },
  { id: '15', zone_code: '13', zone_name: 'Bouches-du-Rhône', zone_type: 'department', naf_code: '62', naf_name: 'Programmation, conseil', time_period: '2024-Q3', total_companies: 678, new_companies: 98, closed_companies: 15, net_growth: 83, growth_rate: 16.5, creation_rate: 12.8, potential_score: 85, potential_grade: 'A', competition_score: 58, coordinates: ZONE_COORDS['13'] },
  { id: '16', zone_code: '33', zone_name: 'Gironde', zone_type: 'department', naf_code: '41', naf_name: 'Construction', time_period: '2024-Q3', total_companies: 2345, new_companies: 187, closed_companies: 62, net_growth: 125, growth_rate: 10.8, creation_rate: 7.2, potential_score: 74, potential_grade: 'B', competition_score: 52, coordinates: ZONE_COORDS['33'] },
  { id: '17', zone_code: '59', zone_name: 'Nord', zone_type: 'department', naf_code: '47', naf_name: 'Commerce de détail', time_period: '2024-Q3', total_companies: 3120, new_companies: 134, closed_companies: 78, net_growth: 56, growth_rate: 5.5, creation_rate: 5.1, potential_score: 63, potential_grade: 'C', competition_score: 72, coordinates: ZONE_COORDS['59'] },
  { id: '18', zone_code: '31', zone_name: 'Haute-Garonne', zone_type: 'department', naf_code: '62', naf_name: 'Programmation, conseil', time_period: '2024-Q3', total_companies: 1456, new_companies: 198, closed_companies: 22, net_growth: 176, growth_rate: 19.5, creation_rate: 14.8, potential_score: 93, potential_grade: 'A', competition_score: 48, coordinates: ZONE_COORDS['31'] },
  { id: '19', zone_code: '44', zone_name: 'Loire-Atlantique', zone_type: 'department', naf_code: '56', naf_name: 'Restauration', time_period: '2024-Q3', total_companies: 987, new_companies: 76, closed_companies: 24, net_growth: 52, growth_rate: 7.8, creation_rate: 6.2, potential_score: 71, potential_grade: 'B', competition_score: 50, coordinates: ZONE_COORDS['44'] },
  { id: '20', zone_code: '06', zone_name: 'Alpes-Maritimes', zone_type: 'department', naf_code: '55', naf_name: 'Hébergement', time_period: '2024-Q3', total_companies: 1234, new_companies: 89, closed_companies: 34, net_growth: 55, growth_rate: 8.2, creation_rate: 6.5, potential_score: 73.5, potential_grade: 'B', competition_score: 55, coordinates: ZONE_COORDS['06'] },
  { id: '21', zone_code: '67', zone_name: 'Bas-Rhin', zone_type: 'department', naf_code: '62', naf_name: 'Programmation, conseil', time_period: '2024-Q3', total_companies: 567, new_companies: 78, closed_companies: 12, net_growth: 66, growth_rate: 15.2, creation_rate: 11.8, potential_score: 82, potential_grade: 'A', competition_score: 60, coordinates: ZONE_COORDS['67'] },
  { id: '22', zone_code: '34', zone_name: 'Hérault', zone_type: 'department', naf_code: '62', naf_name: 'Programmation, conseil', time_period: '2024-Q3', total_companies: 445, new_companies: 68, closed_companies: 9, net_growth: 59, growth_rate: 17.8, creation_rate: 13.2, potential_score: 88, potential_grade: 'A', competition_score: 55, coordinates: ZONE_COORDS['34'] },
  { id: '23', zone_code: '11', zone_name: 'Île-de-France', zone_type: 'region', naf_code: '68', naf_name: 'Immobilier', time_period: '2024-Q3', total_companies: 8934, new_companies: 312, closed_companies: 298, net_growth: 14, growth_rate: 1.2, creation_rate: 3.8, potential_score: 42, potential_grade: 'D', competition_score: 78, coordinates: ZONE_COORDS['11'] },
  { id: '24', zone_code: '84', zone_name: 'Auvergne-Rhône-Alpes', zone_type: 'region', naf_code: '86', naf_name: 'Santé', time_period: '2024-Q3', total_companies: 5621, new_companies: 245, closed_companies: 89, net_growth: 156, growth_rate: 7.5, creation_rate: 5.2, potential_score: 68, potential_grade: 'B', competition_score: 62, coordinates: ZONE_COORDS['84'] },
]

const MOCK_LEADS: Lead[] = [
  { siren: '912345678', name: 'Boulangerie du Marais', naf_code: '1071Z', naf_name: 'Boulangerie-pâtisserie', commune_name: 'Paris 3e', department_code: '75', creation_date: '2026-10-05', employees_range: '1-2', latitude: 48.8634, longitude: 2.3628 },
  { siren: '912345679', name: 'TechFlow Solutions', naf_code: '6201Z', naf_name: 'Programmation informatique', commune_name: 'Paris 11e', department_code: '75', creation_date: '2026-10-04', employees_range: '1-2', latitude: 48.8566, longitude: 2.3522 },
  { siren: '912345680', name: 'Le Petit Lyonnais', naf_code: '5610A', naf_name: 'Restauration traditionnelle', commune_name: 'Lyon 1er', department_code: '69', creation_date: '2026-10-03', employees_range: '3-5', latitude: 45.7640, longitude: 4.8357 },
  { siren: '912345681', name: 'Café de la Gare', naf_code: '5630Z', naf_name: 'Bars', commune_name: 'Paris 10e', department_code: '75', creation_date: '2026-10-02', employees_range: '1-2', latitude: 48.8766, longitude: 2.3622 },
  { siren: '912345682', name: 'DataPulse SAS', naf_code: '6201Z', naf_name: 'Programmation informatique', commune_name: 'Lyon 7e', department_code: '69', creation_date: '2026-10-01', employees_range: '1-2', latitude: 45.7484, longitude: 4.8467 },
  { siren: '912345683', name: 'Épicerie Bio Centre', naf_code: '4711B', naf_name: 'Supermarchés', commune_name: 'Paris 4e', department_code: '75', creation_date: '2026-09-30', employees_range: '3-5', latitude: 48.8546, longitude: 2.3522 },
  { siren: '912345684', name: 'Resto Végé', naf_code: '5610A', naf_name: 'Restauration traditionnelle', commune_name: 'Paris 15e', department_code: '75', creation_date: '2026-09-29', employees_range: '1-2', latitude: 48.8467, longitude: 2.2869 },
  { siren: '912345685', name: 'CloudNest SAS', naf_code: '6311Z', naf_name: 'Traitement de données, hébergement', commune_name: 'Paris 12e', department_code: '75', creation_date: '2026-09-28', employees_range: '1-2', latitude: 48.8467, longitude: 2.3869 },
  { siren: '912345686', name: 'Bistro du Port', naf_code: '5610A', naf_name: 'Restauration traditionnelle', commune_name: 'Marseille 2e', department_code: '13', creation_date: '2026-09-27', employees_range: '3-5', latitude: 43.2965, longitude: 5.3698 },
  { siren: '912345687', name: 'GreenLeaf Consulting', naf_code: '6202Z', naf_name: 'Conseil en systèmes informatiques', commune_name: 'Lyon 3e', department_code: '69', creation_date: '2026-09-26', employees_range: '1-2', latitude: 45.7578, longitude: 4.8320 },
  { siren: '912345688', name: 'Mode & Tendance', naf_code: '4771F', naf_name: 'Commerce de détail d\'habillement', commune_name: 'Paris 9e', department_code: '75', creation_date: '2026-09-25', employees_range: '1-2', latitude: 48.8766, longitude: 2.3372 },
  { siren: '912345689', name: 'SunnyStay SAS', naf_code: '5510Z', naf_name: 'Hôtels', commune_name: 'Nice', department_code: '06', creation_date: '2026-09-24', employees_range: '3-5', latitude: 43.7102, longitude: 7.2620 },
  { siren: '912345690', name: 'Artisan Bâtiment Pro', naf_code: '4120A', naf_name: 'Construction de maisons', commune_name: 'Bordeaux', department_code: '33', creation_date: '2026-09-23', employees_range: '1-2', latitude: 44.8378, longitude: -0.5792 },
  { siren: '912345691', name: 'DevHub Lyon', naf_code: '6201Z', naf_name: 'Programmation informatique', commune_name: 'Lyon 6e', department_code: '69', creation_date: '2026-09-22', employees_range: '1-2', latitude: 45.7640, longitude: 4.8357 },
  { siren: '912345692', name: 'Pâtisserie Douceur', naf_code: '1071Z', naf_name: 'Boulangerie-pâtisserie', commune_name: 'Paris 18e', department_code: '75', creation_date: '2026-09-21', employees_range: '1-2', latitude: 48.8867, longitude: 2.3431 },
  { siren: '912345693', name: 'Toulouse Tech Labs', naf_code: '6201Z', naf_name: 'Programmation informatique', commune_name: 'Toulouse', department_code: '31', creation_date: '2026-09-20', employees_range: '1-2', latitude: 43.6047, longitude: 1.4442 },
  { siren: '912345694', name: 'Tablier & Fourchette', naf_code: '5610A', naf_name: 'Restauration traditionnelle', commune_name: 'Nantes', department_code: '44', creation_date: '2026-09-19', employees_range: '3-5', latitude: 47.2184, longitude: -1.5536 },
  { siren: '912345695', name: 'Strasbourg Digital', naf_code: '6201Z', naf_name: 'Programmation informatique', commune_name: 'Strasbourg', department_code: '67', creation_date: '2026-09-18', employees_range: '1-2', latitude: 48.5734, longitude: 7.7521 },
  { siren: '912345696', name: 'Montpellier Web Studio', naf_code: '6201Z', naf_name: 'Programmation informatique', commune_name: 'Montpellier', department_code: '34', creation_date: '2026-09-17', employees_range: '1-2', latitude: 43.6108, longitude: 3.8767 },
  { siren: '912345697', name: 'Lille Mode Express', naf_code: '4771F', naf_name: 'Commerce de détail d\'habillement', commune_name: 'Lille', department_code: '59', creation_date: '2026-09-16', employees_range: '1-2', latitude: 50.6292, longitude: 3.0573 },
]

// ─── Helpers ────────────────────────────────────────────────────────────────

const GRADE_COLORS: Record<string, string> = {
  A: 'bg-success-700',
  B: 'bg-success-500',
  C: 'bg-gray-500',
  D: 'bg-warning-500',
  E: 'bg-warning-700',
}

const GRADE_CHIP_COLORS: Record<string, string> = {
  A: 'bg-success-100 text-success-700',
  B: 'bg-success-50 text-success-700',
  C: 'bg-gray-100 text-gray-700',
  D: 'bg-warning-50 text-warning-700',
  E: 'bg-warning-100 text-warning-700',
}

function formatPeriod(period: string, t: (key: any) => string): string {
  const match = period.match(/^(\d{4})-Q([1-4])$/)
  if (match) {
    const qKey = `explore_period_q${match[2]}` as any
    return `${match[1]} ${t(qKey)}`
  }
  return period
}

function formatDate(dateStr: string, locale: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString(locale === 'fr' ? 'fr-FR' : 'en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

// ─── Data Fetch (mock — swap with /api/explore later) ──────────────────────

async function fetchExploreData(): Promise<{ signals: MarketSignal[]; leads: Lead[] }> {
  await new Promise((resolve) => setTimeout(resolve, 400))
  return { signals: MOCK_SIGNALS, leads: MOCK_LEADS }
}

// ─── Filter Logic ───────────────────────────────────────────────────────────

function applyFilters(
  signals: MarketSignal[],
  leads: Lead[],
  filters: { zone: string; sector: string; period: string; grade: string }
): { signals: MarketSignal[]; leads: Lead[] } {
  let filteredSignals = signals
  let filteredLeads = leads

  if (filters.zone) {
    filteredSignals = filteredSignals.filter((s) => s.zone_code === filters.zone)
    filteredLeads = filteredLeads.filter((l) => {
      if (filters.zone.length <= 3) return l.department_code === filters.zone
      const zone = MOCK_ZONES.find((z) => z.code === filters.zone)
      return l.department_code === filters.zone.substring(0, 2) ||
        (zone && l.commune_name.toLowerCase().includes(zone.name.toLowerCase()))
    })
  }

  if (filters.sector) {
    filteredSignals = filteredSignals.filter((s) => s.naf_code === filters.sector)
    const naf2 = filters.sector.substring(0, 2)
    filteredLeads = filteredLeads.filter((l) => l.naf_code.startsWith(naf2))
  }

  if (filters.period) {
    filteredSignals = filteredSignals.filter((s) => s.time_period === filters.period)
  }

  if (filters.grade) {
    filteredSignals = filteredSignals.filter((s) => s.potential_grade === filters.grade)
  }

  return { signals: filteredSignals, leads: filteredLeads }
}

// ─── Page Component ─────────────────────────────────────────────────────────

export default function ExplorePage() {
  const { t, locale } = useI18n()

  // Filters
  const [selectedZone, setSelectedZone] = useState<string>('')
  const [selectedSector, setSelectedSector] = useState<string>('')
  const [selectedPeriod, setSelectedPeriod] = useState<string>('')
  const [selectedGrade, setSelectedGrade] = useState<string>('')
  const [startDate, setStartDate] = useState<string>('2024-01-01')
  const [endDate, setEndDate] = useState<string>('2024-10-07')

  // View & sort
  const [viewMode, setViewMode] = useState<ViewMode>('signals')
  const [mapMode, setMapMode] = useState<'markers' | 'heatmap'>('markers')
  const [sortField, setSortField] = useState<SortField>('potential_score')
  const [sortDir, setSortDir] = useState<SortDir>('desc')

  // Data
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [allSignals, setAllSignals] = useState<MarketSignal[]>([])
  const [allLeads, setAllLeads] = useState<Lead[]>([])

  // Load data once on mount
  useEffect(() => {
    setIsLoading(true)
    fetchExploreData().then(({ signals, leads }) => {
      setAllSignals(signals)
      setAllLeads(leads)
      setIsLoading(false)
    })
  }, [])

  // ─── Cross-filtered data ───
  // All views use the same filtered dataset
  const { signals, leads } = useMemo(() => {
    return applyFilters(allSignals, allLeads, {
      zone: selectedZone,
      sector: selectedSector,
      period: selectedPeriod,
      grade: selectedGrade,
    })
  }, [allSignals, allLeads, selectedZone, selectedSector, selectedPeriod, selectedGrade])

  // ─── Chart data (cross-filtered: each chart excludes its own dimension) ───

  // Potential by Zone — filtered by sector, period, grade (NOT zone)
  const potentialByZoneData = useMemo(() => {
    const filtered = allSignals.filter((s) => {
      if (selectedSector && s.naf_code !== selectedSector) return false
      if (selectedPeriod && s.time_period !== selectedPeriod) return false
      if (selectedGrade && s.potential_grade !== selectedGrade) return false
      return true
    })
    const byZone = new Map<string, { zone_name: string; scores: number[] }>()
    filtered.forEach((s) => {
      const existing = byZone.get(s.zone_code)
      if (existing) {
        existing.scores.push(s.potential_score)
      } else {
        byZone.set(s.zone_code, { zone_name: s.zone_name, scores: [s.potential_score] })
      }
    })
    return Array.from(byZone.entries())
      .map(([zone_code, d]) => ({
        zone_code,
        zone_name: d.zone_name,
        avgScore: Math.round(d.scores.reduce((a, b) => a + b, 0) / d.scores.length),
        count: d.scores.length,
      }))
      .sort((a, b) => b.avgScore - a.avgScore)
  }, [allSignals, selectedSector, selectedPeriod, selectedGrade])

  // Growth Trend — filtered by zone, sector, grade (NOT period)
  const growthTrendData = useMemo(() => {
    const filtered = allSignals.filter((s) => {
      if (selectedZone && s.zone_code !== selectedZone) return false
      if (selectedSector && s.naf_code !== selectedSector) return false
      if (selectedGrade && s.potential_grade !== selectedGrade) return false
      return true
    })
    const byPeriod = new Map<string, { growths: number[]; new: number; closed: number }>()
    filtered.forEach((s) => {
      const existing = byPeriod.get(s.time_period)
      if (existing) {
        existing.growths.push(s.growth_rate)
        existing.new += s.new_companies
        existing.closed += s.closed_companies
      } else {
        byPeriod.set(s.time_period, { growths: [s.growth_rate], new: s.new_companies, closed: s.closed_companies })
      }
    })
    return Array.from(byPeriod.entries())
      .map(([period, d]) => ({
        period,
        avgGrowth: Math.round((d.growths.reduce((a, b) => a + b, 0) / d.growths.length) * 10) / 10,
        totalNew: d.new,
        totalClosed: d.closed,
      }))
      .sort((a, b) => a.period.localeCompare(b.period))
  }, [allSignals, selectedZone, selectedSector, selectedGrade])

  // Grade Distribution — filtered by zone, sector, period (NOT grade)
  const gradeDistributionData = useMemo(() => {
    const filtered = allSignals.filter((s) => {
      if (selectedZone && s.zone_code !== selectedZone) return false
      if (selectedSector && s.naf_code !== selectedSector) return false
      if (selectedPeriod && s.time_period !== selectedPeriod) return false
      return true
    })
    const counts: Record<string, number> = { A: 0, B: 0, C: 0, D: 0, E: 0 }
    filtered.forEach((s) => {
      if (counts[s.potential_grade] !== undefined) counts[s.potential_grade]++
    })
    return Object.entries(counts)
      .map(([grade, count]) => ({ grade, count }))
      .filter((d) => d.count > 0)
  }, [allSignals, selectedZone, selectedSector, selectedPeriod])

  // New Companies by Sector — filtered by zone, period, grade (NOT sector)
  const newBySectorData = useMemo(() => {
    const filtered = allSignals.filter((s) => {
      if (selectedZone && s.zone_code !== selectedZone) return false
      if (selectedPeriod && s.time_period !== selectedPeriod) return false
      if (selectedGrade && s.potential_grade !== selectedGrade) return false
      return true
    })
    const bySector = new Map<string, { naf_name: string; totalNew: number }>()
    filtered.forEach((s) => {
      const existing = bySector.get(s.naf_code)
      if (existing) {
        existing.totalNew += s.new_companies
      } else {
        bySector.set(s.naf_code, { naf_name: s.naf_name, totalNew: s.new_companies })
      }
    })
    return Array.from(bySector.entries())
      .map(([naf_code, d]) => ({ naf_code, naf_name: d.naf_name, totalNew: d.totalNew }))
      .sort((a, b) => b.totalNew - a.totalNew)
  }, [allSignals, selectedZone, selectedPeriod, selectedGrade])

  // Net Growth by Zone — filtered by sector, period, grade (NOT zone)
  const netGrowthByZoneData = useMemo(() => {
    const filtered = allSignals.filter((s) => {
      if (selectedSector && s.naf_code !== selectedSector) return false
      if (selectedPeriod && s.time_period !== selectedPeriod) return false
      if (selectedGrade && s.potential_grade !== selectedGrade) return false
      return true
    })
    const byZone = new Map<string, { zone_name: string; netGrowth: number }>()
    filtered.forEach((s) => {
      const existing = byZone.get(s.zone_code)
      if (existing) {
        existing.netGrowth += s.net_growth
      } else {
        byZone.set(s.zone_code, { zone_name: s.zone_name, netGrowth: s.net_growth })
      }
    })
    return Array.from(byZone.entries())
      .map(([zone_code, d]) => ({ zone_code, zone_name: d.zone_name, netGrowth: d.netGrowth }))
      .sort((a, b) => b.netGrowth - a.netGrowth)
  }, [allSignals, selectedSector, selectedPeriod, selectedGrade])

  // Companies Trend — filtered by zone, sector, grade (NOT period)
  const companiesTrendData = useMemo(() => {
    const filtered = allSignals.filter((s) => {
      if (selectedZone && s.zone_code !== selectedZone) return false
      if (selectedSector && s.naf_code !== selectedSector) return false
      if (selectedGrade && s.potential_grade !== selectedGrade) return false
      return true
    })
    const byPeriod = new Map<string, number>()
    filtered.forEach((s) => {
      byPeriod.set(s.time_period, (byPeriod.get(s.time_period) || 0) + s.total_companies)
    })
    return Array.from(byPeriod.entries())
      .map(([period, totalCompanies]) => ({ period, totalCompanies }))
      .sort((a, b) => a.period.localeCompare(b.period))
  }, [allSignals, selectedZone, selectedSector, selectedGrade])

  // ─── Active Filters (chips) ───
  const activeFilters = useMemo<ActiveFilter[]>(() => {
    const filters: ActiveFilter[] = []
    if (selectedZone) {
      const zone = MOCK_ZONES.find((z) => z.code === selectedZone)
      filters.push({ type: 'zone', value: selectedZone, label: zone?.name || selectedZone })
    }
    if (selectedSector) {
      const sector = MOCK_SECTORS.find((s) => s.code === selectedSector)
      filters.push({ type: 'sector', value: selectedSector, label: sector?.name || selectedSector })
    }
    if (selectedPeriod) {
      filters.push({ type: 'period', value: selectedPeriod, label: formatPeriod(selectedPeriod, t) })
    }
    if (selectedGrade) {
      filters.push({ type: 'grade', value: selectedGrade, label: `${t('explore_grade')} ${selectedGrade}` })
    }
    return filters
  }, [selectedZone, selectedSector, selectedPeriod, selectedGrade, t])

  // ─── Available periods ───
  const availablePeriods = useMemo(() => {
    return Array.from(new Set(allSignals.map((s) => s.time_period))).sort().reverse()
  }, [allSignals])

  // ─── Sorted signals ───
  const sortedSignals = useMemo(() => {
    return [...signals].sort((a, b) => {
      const aVal = a[sortField] || 0
      const bVal = b[sortField] || 0
      return sortDir === 'desc' ? bVal - aVal : aVal - bVal
    })
  }, [signals, sortField, sortDir])

  // ─── Summary stats ───
  const summary = useMemo(() => {
    if (signals.length === 0) {
      return { totalMarkets: 0, avgPotential: 0, highestGrowth: 0, totalNew: 0, totalClosed: 0, totalCompanies: 0, netGrowth: 0, gradeA: 0 }
    }
    return {
      totalMarkets: signals.length,
      avgPotential: Math.round(signals.reduce((sum, s) => sum + s.potential_score, 0) / signals.length),
      highestGrowth: Math.max(...signals.map((s) => s.growth_rate)),
      totalNew: signals.reduce((sum, s) => sum + s.new_companies, 0),
      totalClosed: signals.reduce((sum, s) => sum + s.closed_companies, 0),
      totalCompanies: signals.reduce((sum, s) => sum + s.total_companies, 0),
      netGrowth: signals.reduce((sum, s) => sum + s.net_growth, 0),
      gradeA: signals.filter((s) => s.potential_grade === 'A').length,
    }
  }, [signals])

  // ─── Map markers ───
  const mapMarkers = useMemo(() => {
    const byZone = new Map<string, MarketSignal>()
    signals.forEach((s) => {
      const existing = byZone.get(s.zone_code)
      if (!existing || s.potential_score > existing.potential_score) {
        byZone.set(s.zone_code, s)
      }
    })
    return Array.from(byZone.values()).map((s) => ({
      zone: s.zone_name,
      zoneType: s.zone_type,
      sector: s.naf_name,
      potential: Math.round(s.potential_score),
      grade: s.potential_grade,
      growthRate: s.growth_rate,
      companies: s.total_companies,
      newCompanies: s.new_companies,
      closedCompanies: s.closed_companies,
      coordinates: s.coordinates,
    }))
  }, [signals])

  // ─── Handlers ───

  // Cross-filter handler — called when clicking a chart element
  const handleChartFilter = useCallback((event: ChartFilterEvent) => {
    switch (event.type) {
      case 'zone':
        setSelectedZone((prev) => (prev === event.value ? '' : event.value))
        break
      case 'sector':
        setSelectedSector((prev) => (prev === event.value ? '' : event.value))
        break
      case 'period':
        setSelectedPeriod((prev) => (prev === event.value ? '' : event.value))
        break
      case 'grade':
        setSelectedGrade((prev) => (prev === event.value ? '' : event.value))
        break
    }
  }, [])

  // Remove a single filter chip
  const removeFilter = useCallback((type: ActiveFilter['type']) => {
    switch (type) {
      case 'zone': setSelectedZone(''); break
      case 'sector': setSelectedSector(''); break
      case 'period': setSelectedPeriod(''); break
      case 'grade': setSelectedGrade(''); break
    }
  }, [])

  // Clear all filters
  const handleClearFilters = useCallback(() => {
    setSelectedZone('')
    setSelectedSector('')
    setSelectedPeriod('')
    setSelectedGrade('')
  }, [])

  const handleSort = useCallback((field: SortField) => {
    if (sortField === field) {
      setSortDir((d) => (d === 'desc' ? 'asc' : 'desc'))
    } else {
      setSortField(field)
      setSortDir('desc')
    }
  }, [sortField])

  // ─── Render ────────────────────────────────────────────────────────────────

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

        {/* View Toggle — first thing on the page */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <button
            onClick={() => setViewMode('signals')}
            className={`relative text-left p-5 rounded-xl border-2 transition-all duration-200 ${
              viewMode === 'signals'
                ? 'border-brand-primary bg-white shadow-card'
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
          >
            <div className="flex items-start gap-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                viewMode === 'signals' ? 'bg-brand-primary bg-opacity-10' : 'bg-gray-100'
              }`}>
                <svg className={`w-5 h-5 ${viewMode === 'signals' ? 'text-brand-primary' : 'text-gray-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <h3 className={`font-semibold ${viewMode === 'signals' ? 'text-brand-primary' : 'text-gray-900'}`}>
                  {t('explore_view_signals')}
                </h3>
                <p className="text-sm text-gray-500 mt-0.5">
                  {t('explore_view_signals_desc')}
                </p>
              </div>
            </div>
            {viewMode === 'signals' && (
              <div className="absolute top-3 right-3">
                <div className="w-5 h-5 rounded-full bg-brand-primary flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            )}
          </button>

          <button
            onClick={() => setViewMode('leads')}
            className={`relative text-left p-5 rounded-xl border-2 transition-all duration-200 ${
              viewMode === 'leads'
                ? 'border-brand-primary bg-white shadow-card'
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
          >
            <div className="flex items-start gap-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                viewMode === 'leads' ? 'bg-brand-primary bg-opacity-10' : 'bg-gray-100'
              }`}>
                <svg className={`w-5 h-5 ${viewMode === 'leads' ? 'text-brand-primary' : 'text-gray-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div>
                <h3 className={`font-semibold ${viewMode === 'leads' ? 'text-brand-primary' : 'text-gray-900'}`}>
                  {t('explore_view_leads')}
                </h3>
                <p className="text-sm text-gray-500 mt-0.5">
                  {t('explore_view_leads_desc')}
                </p>
              </div>
            </div>
            {viewMode === 'leads' && (
              <div className="absolute top-3 right-3">
                <div className="w-5 h-5 rounded-full bg-brand-primary flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            )}
          </button>
        </div>

        {/* Page Header — dynamic based on selected view */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
            {viewMode === 'signals' ? t('explore_title_signals') : t('explore_title_leads')}
          </h1>
          <p className="text-gray-600 max-w-3xl">
            {viewMode === 'signals' ? t('explore_subtitle_signals') : t('explore_subtitle_leads')}
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-card p-5 mb-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
              {t('explore_filters')}
            </h2>
            {activeFilters.length > 0 && (
              <button
                onClick={handleClearFilters}
                className="text-sm text-brand-primary hover:text-orange-600 font-medium transition-colors"
              >
                {t('explore_clear_all')}
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                {t('explore_zone_label')}
              </label>
              <ZoneSelector
                value={selectedZone}
                onChange={setSelectedZone}
                zones={MOCK_ZONES}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                {t('explore_sector_label')}
              </label>
              <SectorSelector
                value={selectedSector}
                onChange={setSelectedSector}
                sectors={MOCK_SECTORS}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                {t('explore_period_label')}
              </label>
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="w-full input cursor-pointer appearance-none"
                style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em', paddingRight: '2.5rem' }}
              >
                <option value="">{t('explore_all_periods')}</option>
                {availablePeriods.map((p) => (
                  <option key={p} value={p}>{formatPeriod(p, t)}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                {t('explore_period_label')}
              </label>
              <DateRangePicker
                startDate={startDate}
                endDate={endDate}
                onChange={(start, end) => {
                  setStartDate(start)
                  setEndDate(end)
                }}
              />
            </div>
          </div>
        </div>

        {/* Active Filter Chips */}
        {activeFilters.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 mb-6">
            <span className="text-sm text-gray-500">{t('explore_filtered_by')}:</span>
            {activeFilters.map((filter) => (
              <button
                key={`${filter.type}-${filter.value}`}
                onClick={() => removeFilter(filter.type)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all hover:opacity-80 ${
                  filter.type === 'grade'
                    ? GRADE_CHIP_COLORS[filter.value] || 'bg-gray-100 text-gray-700'
                    : 'bg-brand-primary bg-opacity-10 text-brand-primary'
                }`}
              >
                <span className="text-xs opacity-60">
                  {filter.type === 'zone' ? t('explore_filter_zone') :
                   filter.type === 'sector' ? t('explore_filter_sector') :
                   filter.type === 'period' ? t('explore_filter_period') :
                   t('explore_filter_grade')}:
                </span>
                {filter.label}
                <svg className="w-3.5 h-3.5 ml-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            ))}
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-brand-primary"></div>
            <p className="mt-4 text-gray-500">{t('explore_loading')}</p>
          </div>
        )}

        {/* Summary Stats */}
        {!isLoading && signals.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
            <div className="bg-white rounded-xl shadow-card p-4">
              <div className="text-xs text-gray-500 mb-1">{t('explore_total_markets')}</div>
              <div className="text-2xl font-bold text-gray-900">{summary.totalMarkets}</div>
            </div>
            <div className="bg-white rounded-xl shadow-card p-4">
              <div className="text-xs text-gray-500 mb-1">{t('explore_avg_potential')}</div>
              <div className="text-2xl font-bold text-brand-primary">{summary.avgPotential}<span className="text-sm text-gray-400">/100</span></div>
            </div>
            <div className="bg-white rounded-xl shadow-card p-4">
              <div className="text-xs text-gray-500 mb-1">{t('explore_highest_growth')}</div>
              <div className="text-2xl font-bold text-success-700">+{summary.highestGrowth}%</div>
            </div>
            <div className="bg-white rounded-xl shadow-card p-4">
              <div className="text-xs text-gray-500 mb-1">{t('explore_stat_total_companies')}</div>
              <div className="text-2xl font-bold text-gray-900">{summary.totalCompanies.toLocaleString()}</div>
            </div>
            <div className="bg-white rounded-xl shadow-card p-4">
              <div className="text-xs text-gray-500 mb-1">{t('explore_new_companies')}</div>
              <div className="text-2xl font-bold text-success-700">+{summary.totalNew}</div>
            </div>
            <div className="bg-white rounded-xl shadow-card p-4">
              <div className="text-xs text-gray-500 mb-1">{t('explore_stat_net_growth')}</div>
              <div className={`text-2xl font-bold ${summary.netGrowth >= 0 ? 'text-success-700' : 'text-warning-700'}`}>
                {summary.netGrowth >= 0 ? '+' : ''}{summary.netGrowth}
              </div>
            </div>
          </div>
        )}

        {/* ─── Charts Section (cross-filterable) ─── */}
        {!isLoading && viewMode === 'signals' && (
          <div className="mb-6">
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-gray-900">{t('explore_charts_title')}</h2>
              <p className="text-sm text-gray-500 mt-0.5">{t('explore_charts_subtitle')}</p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <PotentialByZoneChart
                data={potentialByZoneData}
                onFilter={handleChartFilter}
                selectedZone={selectedZone}
              />
              <GradeDistributionChart
                data={gradeDistributionData}
                onFilter={handleChartFilter}
                selectedGrade={selectedGrade}
              />
              <GrowthTrendChart
                data={growthTrendData}
                onFilter={handleChartFilter}
                selectedPeriod={selectedPeriod}
              />
              <NewBySectorChart
                data={newBySectorData}
                onFilter={handleChartFilter}
                selectedSector={selectedSector}
              />
              <NetGrowthByZoneChart
                data={netGrowthByZoneData}
                onFilter={handleChartFilter}
                selectedZone={selectedZone}
              />
              <CompaniesTrendChart
                data={companiesTrendData}
                onFilter={handleChartFilter}
                selectedPeriod={selectedPeriod}
              />
            </div>
          </div>
        )}

        {/* ─── Market Health View (Signals Table) ─── */}
        {!isLoading && viewMode === 'signals' && (
          <div className="bg-white rounded-xl shadow-card overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">{t('explore_signals_title')}</h2>
                <p className="text-sm text-gray-500 mt-0.5">{t('explore_signals_subtitle')}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">{t('explore_sort_by')}:</span>
                <select
                  value={sortField}
                  onChange={(e) => setSortField(e.target.value as SortField)}
                  className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-brand-primary cursor-pointer"
                >
                  <option value="potential_score">{t('explore_sort_score')}</option>
                  <option value="growth_rate">{t('explore_sort_growth')}</option>
                  <option value="new_companies">{t('explore_sort_new')}</option>
                  <option value="total_companies">{t('explore_sort_companies')}</option>
                </select>
              </div>
            </div>

            {sortedSignals.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">{t('explore_no_signals')}</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-gray-500 text-xs uppercase tracking-wider border-b border-gray-100">
                      <th className="text-left px-6 py-3 font-medium">{t('explore_col_zone')}</th>
                      <th className="text-left px-6 py-3 font-medium">{t('explore_col_sector')}</th>
                      <th className="text-left px-6 py-3 font-medium">{t('explore_col_period')}</th>
                      <th className="text-right px-6 py-3 font-medium cursor-pointer hover:text-brand-primary" onClick={() => handleSort('total_companies')}>
                        {t('explore_col_companies')} {sortField === 'total_companies' && (sortDir === 'desc' ? '↓' : '↑')}
                      </th>
                      <th className="text-right px-6 py-3 font-medium cursor-pointer hover:text-brand-primary" onClick={() => handleSort('new_companies')}>
                        {t('explore_col_new')} {sortField === 'new_companies' && (sortDir === 'desc' ? '↓' : '↑')}
                      </th>
                      <th className="text-right px-6 py-3 font-medium">{t('explore_col_closed')}</th>
                      <th className="text-right px-6 py-3 font-medium">{t('explore_col_net')}</th>
                      <th className="text-right px-6 py-3 font-medium cursor-pointer hover:text-brand-primary" onClick={() => handleSort('growth_rate')}>
                        {t('explore_col_growth')} {sortField === 'growth_rate' && (sortDir === 'desc' ? '↓' : '↑')}
                      </th>
                      <th className="text-right px-6 py-3 font-medium">{t('explore_col_creation_rate')}</th>
                      <th className="text-right px-6 py-3 font-medium cursor-pointer hover:text-brand-primary" onClick={() => handleSort('potential_score')}>
                        {t('explore_col_score')} {sortField === 'potential_score' && (sortDir === 'desc' ? '↓' : '↑')}
                      </th>
                      <th className="text-center px-6 py-3 font-medium">{t('explore_col_grade')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedSignals.map((signal) => (
                      <tr key={signal.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-3">
                          <div className="font-medium text-gray-900">{signal.zone_name}</div>
                          <div className="text-xs text-gray-400">{signal.zone_type}</div>
                        </td>
                        <td className="px-6 py-3 text-gray-600">{signal.naf_name}</td>
                        <td className="px-6 py-3 text-gray-500">{formatPeriod(signal.time_period, t)}</td>
                        <td className="px-6 py-3 text-right font-medium text-gray-900">{signal.total_companies.toLocaleString()}</td>
                        <td className="px-6 py-3 text-right text-success-700 font-medium">+{signal.new_companies}</td>
                        <td className="px-6 py-3 text-right text-warning-700">{signal.closed_companies}</td>
                        <td className={`px-6 py-3 text-right font-medium ${signal.net_growth >= 0 ? 'text-success-700' : 'text-warning-700'}`}>
                          {signal.net_growth >= 0 ? '+' : ''}{signal.net_growth}
                        </td>
                        <td className="px-6 py-3 text-right">
                          <span className={`font-semibold ${signal.growth_rate >= 0 ? 'text-success-700' : 'text-warning-700'}`}>
                            {signal.growth_rate >= 0 ? '+' : ''}{signal.growth_rate}%
                          </span>
                        </td>
                        <td className="px-6 py-3 text-right text-gray-600">{signal.creation_rate}%</td>
                        <td className="px-6 py-3 text-right">
                          <span className="font-bold text-brand-primary">{Math.round(signal.potential_score)}</span>
                          <span className="text-gray-400 text-xs">/100</span>
                        </td>
                        <td className="px-6 py-3 text-center">
                          <span
                            className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-white text-sm font-bold ${GRADE_COLORS[signal.potential_grade]}`}
                            title={t(`explore_grade_${signal.potential_grade.toLowerCase()}` as any)}
                          >
                            {signal.potential_grade}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ─── Lead Gen View (New Companies) ─── */}
        {!isLoading && viewMode === 'leads' && (
          <div>
            <div className="bg-white rounded-xl shadow-card px-6 py-4 mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">{t('explore_leads_title')}</h2>
                <p className="text-sm text-gray-500 mt-0.5">{t('explore_leads_subtitle')}</p>
              </div>
              <span className="badge badge-primary">
                {t('explore_leads_count').replace('{count}', String(leads.length))}
              </span>
            </div>

            {leads.length === 0 ? (
              <div className="bg-white rounded-xl shadow-card text-center py-12">
                <p className="text-gray-500">{t('explore_no_leads')}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {leads.map((lead) => (
                  <div
                    key={lead.siren}
                    className="bg-white rounded-xl shadow-card p-5 hover:shadow-lg transition-shadow card-hover"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-brand-primary bg-opacity-10 flex items-center justify-center flex-shrink-0">
                          <span className="text-brand-primary font-bold text-sm">
                            {lead.name.substring(0, 2).toUpperCase()}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-semibold text-gray-900 truncate">{lead.name}</h3>
                          <p className="text-xs text-gray-500 truncate">{lead.naf_name}</p>
                        </div>
                      </div>
                      <span className="badge badge-success flex-shrink-0">
                        {t('explore_new')}
                      </span>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span>{lead.commune_name} ({lead.department_code})</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span>{formatDate(lead.creation_date, locale)}</span>
                      </div>
                      {lead.employees_range && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <span>{lead.employees_range} {locale === 'fr' ? 'salarié(s)' : 'employees'}</span>
                        </div>
                      )}
                    </div>

                    <div className="pt-3 border-t border-gray-100 flex gap-2">
                      <button className="btn btn-primary flex-1 text-sm py-2">
                        {t('explore_lead_contact')}
                      </button>
                      <button className="btn btn-outline text-sm py-2 px-4">
                        {t('explore_lead_view')}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {leads.length > 0 && (
              <div className="mt-6 bg-gradient-to-r from-brand-primary to-orange-600 rounded-xl p-6 text-white flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="font-medium">{t('explore_leads_cta')}</p>
                <button className="btn bg-white text-brand-primary hover:bg-gray-100 flex-shrink-0">
                  {t('explore_leads_cta_button')}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Map */}
        {!isLoading && viewMode === 'signals' && (
          <div className="mt-6 bg-white rounded-xl shadow-card p-6">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <h2 className="text-lg font-semibold text-gray-900">{t('explore_map_title')}</h2>
              <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                {(['markers', 'heatmap'] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setMapMode(mode)}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                      mapMode === mode ? 'bg-white text-brand-primary shadow-sm' : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {t(mode === 'markers' ? 'explore_map_view_markers' : 'explore_map_view_heatmap')}
                  </button>
                ))}
              </div>
            </div>
            {mapMode === 'heatmap' ? (
              <IrisHeatmap height="500px" />
            ) : mapMarkers.length > 0 ? (
              <MapView markers={mapMarkers} height="400px" />
            ) : (
              <p className="text-sm text-gray-500">{t('explore_map_no_data')}</p>
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}
