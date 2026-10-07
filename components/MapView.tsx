"use client"

import { useEffect, useRef, useCallback, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || ''

interface MarketMarker {
  zone: string
  zoneType: string
  sector: string
  potential: number
  grade: string
  growthRate: number
  companies: number
  newCompanies: number
  closedCompanies: number
  coordinates: [number, number]
}

interface MapViewProps {
  markers: MarketMarker[]
  center?: [number, number]
  zoom?: number
  height?: string
}

type DataView = 'potential' | 'growth' | 'newCompanies' | 'totalCompanies' | 'netGrowth'

const DATA_VIEWS: { id: DataView; label: string }[] = [
  { id: 'potential', label: 'Potential' },
  { id: 'growth', label: 'Growth' },
  { id: 'newCompanies', label: 'New Cos.' },
  { id: 'totalCompanies', label: 'Total Cos.' },
  { id: 'netGrowth', label: 'Net Growth' },
]

const MAP_STYLES = [
  { id: 'streets', label: 'Streets', url: 'mapbox://styles/mapbox/streets-v12' },
  { id: 'light', label: 'Light', url: 'mapbox://styles/mapbox/light-v11' },
  { id: 'dark', label: 'Dark', url: 'mapbox://styles/mapbox/dark-v11' },
  { id: 'outdoors', label: 'Outdoors', url: 'mapbox://styles/mapbox/outdoors-v12' },
  { id: 'satellite', label: 'Satellite', url: 'mapbox://styles/mapbox/satellite-v9' },
  { id: 'satellite-streets', label: 'Satellite Streets', url: 'mapbox://styles/mapbox/satellite-streets-v12' },
  { id: 'navigation-day', label: 'Navigation Day', url: 'mapbox://styles/mapbox/navigation-day-v1' },
  { id: 'navigation-night', label: 'Navigation Night', url: 'mapbox://styles/mapbox/navigation-night-v1' },
]

// Approximate coordinates for French cities/regions used in mock data
const zoneCoordinates: Record<string, [number, number]> = {
  'Paris': [2.3522, 48.8566],
  'Lyon': [4.8357, 45.7640],
  'France': [2.2137, 46.6034],
  'Île-de-France': [2.5, 48.7],
}

const gradeColors: Record<string, string> = {
  A: '#16A34A',
  B: '#22C55E',
  C: '#6B7280',
  D: '#FF9E00',
  E: '#FF7000',
}

// Get marker appearance based on data view
function getMarkerAppearance(item: MarketMarker, view: DataView): { color: string; size: number; label: string } {
  switch (view) {
    case 'potential':
      return {
        color: gradeColors[item.grade] || '#6B7280',
        size: 36,
        label: item.grade,
      }
    case 'growth': {
      const rate = item.growthRate
      const color = rate >= 15 ? '#15803D' : rate >= 8 ? '#22C55E' : rate >= 0 ? '#84CC16' : rate >= -5 ? '#FF9E00' : '#DC2626'
      const size = 28 + Math.min(Math.abs(rate) * 1.5, 20)
      return { color, size, label: `${rate >= 0 ? '+' : ''}${rate}%` }
    }
    case 'newCompanies': {
      const count = item.newCompanies
      const maxNew = Math.max(...[count, 1])
      const size = 24 + Math.min((count / maxNew) * 24, 24)
      return { color: '#16A34A', size, label: `+${count}` }
    }
    case 'totalCompanies': {
      const count = item.companies
      const size = 24 + Math.min(Math.log10(count + 1) * 6, 24)
      return { color: '#2563EB', size, label: count >= 1000 ? `${(count / 1000).toFixed(1)}k` : `${count}` }
    }
    case 'netGrowth': {
      const net = item.newCompanies - item.closedCompanies
      const color = net >= 100 ? '#15803D' : net >= 0 ? '#22C55E' : net >= -50 ? '#FF9E00' : '#DC2626'
      const size = 28 + Math.min(Math.abs(net) * 0.15, 20)
      return { color, size, label: `${net >= 0 ? '+' : ''}${net}` }
    }
    default:
      return { color: '#6B7280', size: 32, label: '' }
  }
}

export default function MapView({
  markers,
  center = [2.2137, 46.6034],
  zoom = 5,
  height = '400px',
}: MapViewProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)
  const markersRef = useRef<mapboxgl.Marker[]>([])
  const [activeStyle, setActiveStyle] = useState('streets')
  const [styleMenuOpen, setStyleMenuOpen] = useState(false)
  const [dataView, setDataView] = useState<DataView>('potential')

  const clearMarkers = useCallback(() => {
    markersRef.current.forEach(marker => marker.remove())
    markersRef.current = []
  }, [])

  const addMarkers = useCallback((data: MarketMarker[], view: DataView) => {
    if (!map.current) return

    clearMarkers()

    data.forEach(item => {
      const coords = item.coordinates || zoneCoordinates[item.zone] || center
      const { color, size, label } = getMarkerAppearance(item, view)

      const el = document.createElement('div')
      el.className = 'custom-marker'
      el.style.cssText = `
        width: ${size}px;
        height: ${size}px;
        border-radius: 50%;
        background-color: ${color};
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.25);
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: ${size > 32 ? '11px' : '10px'};
        font-weight: 700;
        color: white;
        transition: transform 0.2s ease;
        white-space: nowrap;
      `
      el.textContent = label
      el.addEventListener('mouseenter', () => {
        el.style.transform = 'scale(1.2)'
      })
      el.addEventListener('mouseleave', () => {
        el.style.transform = 'scale(1)'
      })

      const netGrowth = item.newCompanies - item.closedCompanies
      const popup = new mapboxgl.Popup({ offset: 25, closeButton: false })
        .setHTML(`
          <div style="font-family: system-ui, sans-serif; min-width: 180px;">
            <div style="font-weight: 700; font-size: 14px; margin-bottom: 4px;">${item.zone}</div>
            <div style="font-size: 12px; color: #6B7280; margin-bottom: 8px;">${item.sector}</div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
              <span style="font-size: 12px; color: #6B7280;">Potential</span>
              <span style="font-weight: 700; font-size: 14px;">${item.potential}/100 (${item.grade})</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
              <span style="font-size: 12px; color: #6B7280;">Growth</span>
              <span style="font-weight: 600; font-size: 12px; color: ${item.growthRate >= 0 ? '#16A34A' : '#FF7000'};">
                ${item.growthRate >= 0 ? '+' : ''}${item.growthRate}%
              </span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
              <span style="font-size: 12px; color: #6B7280;">Companies</span>
              <span style="font-weight: 600; font-size: 12px;">${item.companies.toLocaleString()}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
              <span style="font-size: 12px; color: #6B7280;">New / Closed</span>
              <span style="font-weight: 600; font-size: 12px;">
                <span style="color: #16A34A;">+${item.newCompanies}</span> /
                <span style="color: #FF7000;">${item.closedCompanies}</span>
              </span>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span style="font-size: 12px; color: #6B7280;">Net Growth</span>
              <span style="font-weight: 700; font-size: 12px; color: ${netGrowth >= 0 ? '#16A34A' : '#DC2626'};">
                ${netGrowth >= 0 ? '+' : ''}${netGrowth}
              </span>
            </div>
          </div>
        `)

      const marker = new mapboxgl.Marker({ element: el })
        .setLngLat(coords)
        .setPopup(popup)
        .addTo(map.current!)

      markersRef.current.push(marker)
    })
  }, [center, clearMarkers])

  const handleStyleChange = useCallback((styleUrl: string, styleId: string) => {
    if (!map.current) return
    setActiveStyle(styleId)
    setStyleMenuOpen(false)
    map.current.setStyle(styleUrl)
    map.current.once('styledata', () => {
      if (markers.length > 0) {
        addMarkers(markers, dataView)
      }
    })
  }, [markers, dataView, addMarkers])

  const handleDataViewChange = useCallback((view: DataView) => {
    setDataView(view)
    if (map.current?.loaded() && markers.length > 0) {
      addMarkers(markers, view)
    }
  }, [markers, addMarkers])

  useEffect(() => {
    if (!mapContainer.current || map.current) return

    const initialStyle = MAP_STYLES.find(s => s.id === activeStyle)?.url || MAP_STYLES[0].url

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: initialStyle,
      center: center,
      zoom: zoom,
      attributionControl: false,
    })

    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right')
    map.current.addControl(
      new mapboxgl.AttributionControl({ compact: true }),
      'bottom-right'
    )

    map.current.on('load', () => {
      if (markers.length > 0) {
        addMarkers(markers, dataView)
      }
    })

    return () => {
      clearMarkers()
      map.current?.remove()
      map.current = null
    }
  }, [])

  useEffect(() => {
    if (map.current?.loaded() && markers.length > 0) {
      addMarkers(markers, dataView)
    }
  }, [markers, dataView, addMarkers])

  const activeStyleLabel = MAP_STYLES.find(s => s.id === activeStyle)?.label || 'Streets'

  return (
    <div className="relative rounded-xl overflow-hidden shadow-card">
      {/* Data View Buttons */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10">
        <div className="flex items-center gap-1 bg-white rounded-lg shadow-md p-1">
          {DATA_VIEWS.map((view) => (
            <button
              key={view.id}
              onClick={() => handleDataViewChange(view.id)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${
                dataView === view.id
                  ? 'bg-brand-primary text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {view.label}
            </button>
          ))}
        </div>
      </div>

      {/* Style Switcher */}
      <div className="absolute top-3 left-3 z-10">
        <div className="relative">
          <button
            onClick={() => setStyleMenuOpen(!styleMenuOpen)}
            className="flex items-center gap-2 bg-white rounded-lg shadow-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <svg className="w-4 h-4 text-brand-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
            {activeStyleLabel}
            <svg className={`w-4 h-4 text-gray-400 transition-transform ${styleMenuOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {styleMenuOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setStyleMenuOpen(false)}
              />
              <div className="absolute top-full left-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-20 max-h-72 overflow-y-auto">
                {MAP_STYLES.map((style) => (
                  <button
                    key={style.id}
                    onClick={() => handleStyleChange(style.url, style.id)}
                    className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                      activeStyle === style.id
                        ? 'bg-brand-primary bg-opacity-10 text-brand-primary font-medium'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {style.label}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      <div
        ref={mapContainer}
        style={{ height, width: '100%' }}
        className="map-container"
      />
      {markers.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <p className="text-gray-500">No location data available</p>
        </div>
      )}
    </div>
  )
}
