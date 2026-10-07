"use client"

import { useEffect, useRef, useCallback } from 'react'
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

export default function MapView({
  markers,
  center = [2.2137, 46.6034],
  zoom = 5,
  height = '400px',
}: MapViewProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)
  const markersRef = useRef<mapboxgl.Marker[]>([])

  const clearMarkers = useCallback(() => {
    markersRef.current.forEach(marker => marker.remove())
    markersRef.current = []
  }, [])

  const addMarkers = useCallback((data: MarketMarker[]) => {
    if (!map.current) return

    clearMarkers()

    data.forEach(item => {
      const coords = item.coordinates || zoneCoordinates[item.zone] || center
      const color = gradeColors[item.grade] || '#6B7280'

      const el = document.createElement('div')
      el.className = 'custom-marker'
      el.style.cssText = `
        width: 32px;
        height: 32px;
        border-radius: 50%;
        background-color: ${color};
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.25);
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 11px;
        font-weight: 700;
        color: white;
        transition: transform 0.2s ease;
      `
      el.textContent = item.grade
      el.addEventListener('mouseenter', () => {
        el.style.transform = 'scale(1.2)'
      })
      el.addEventListener('mouseleave', () => {
        el.style.transform = 'scale(1)'
      })

      const popup = new mapboxgl.Popup({ offset: 25, closeButton: false })
        .setHTML(`
          <div style="font-family: system-ui, sans-serif; min-width: 180px;">
            <div style="font-weight: 700; font-size: 14px; margin-bottom: 4px;">${item.zone}</div>
            <div style="font-size: 12px; color: #6B7280; margin-bottom: 8px;">${item.sector}</div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
              <span style="font-size: 12px; color: #6B7280;">Potential</span>
              <span style="font-weight: 700; font-size: 14px;">${item.potential}/100</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
              <span style="font-size: 12px; color: #6B7280;">Growth</span>
              <span style="font-weight: 600; font-size: 12px; color: ${item.growthRate >= 0 ? '#16A34A' : '#FF7000'};">
                ${item.growthRate >= 0 ? '+' : ''}${item.growthRate}%
              </span>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span style="font-size: 12px; color: #6B7280;">Companies</span>
              <span style="font-weight: 600; font-size: 12px;">${item.companies.toLocaleString()}</span>
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

  useEffect(() => {
    if (!mapContainer.current || map.current) return

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
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
        addMarkers(markers)
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
      addMarkers(markers)
    }
  }, [markers, addMarkers])

  return (
    <div className="relative rounded-xl overflow-hidden shadow-card">
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
