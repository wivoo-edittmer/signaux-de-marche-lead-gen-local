"use client"

import { useEffect, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { useI18n } from '@/lib/i18n'
import type { TranslationKeys } from '@/lib/translations'

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || ''

// Contours IRIS officiels (IGN Géoplateforme, WFS public, CORS ouvert)
const IRIS_WFS_URL = 'https://data.geopf.fr/wfs/ows'
const IRIS_LAYER = 'STATISTICALUNITS.IRIS:contours_iris'
// En dessous de ce zoom, trop d'IRIS seraient visibles pour être chargés
const MIN_IRIS_ZOOM = 11
const MAX_FEATURES_PER_REQUEST = 3000
const MAX_CACHED_FEATURES = 20000

type Metric = 'potential' | 'companies' | 'creations'

const METRICS: { id: Metric; labelKey: keyof TranslationKeys; stops: [number, number, number] }[] = [
  { id: 'potential', labelKey: 'explore_heatmap_metric_potential', stops: [0, 50, 100] },
  { id: 'companies', labelKey: 'explore_heatmap_metric_companies', stops: [0, 250, 600] },
  { id: 'creations', labelKey: 'explore_heatmap_metric_creations', stops: [0, 20, 50] },
]

const COLORS: [string, string, string] = ['#FEF3C7', '#F97316', '#7F1D1D']

interface IrisProperties {
  code_iris: string
  nom_iris: string
  nom_commune: string
  type_iris: string
}

// Nombre pseudo-aléatoire stable pour un même code IRIS (0 → 1)
function seededRandom(seed: string) {
  let hash = 2166136261
  for (let i = 0; i < seed.length; i++) {
    hash ^= seed.charCodeAt(i)
    hash = Math.imul(hash, 16777619)
  }
  return ((hash >>> 0) % 10000) / 10000
}

// Données factices : les IRIS d'activité (type A) concentrent davantage d'entreprises
function withDummyMetrics(feature: GeoJSON.Feature): GeoJSON.Feature {
  const props = feature.properties as IrisProperties
  const code = props.code_iris
  const activityBoost = props.type_iris === 'A' ? 2.2 : props.type_iris === 'H' ? 1 : 0.5
  const companies = Math.round((40 + seededRandom(code + 'n') * 260) * activityBoost)
  const creations = Math.round(companies * (0.03 + seededRandom(code + 'c') * 0.09))
  const potential = Math.round(Math.min(100, 20 + seededRandom(code + 'p') * 60 + (activityBoost - 1) * 15))
  return { ...feature, properties: { ...props, companies, creations, potential } }
}

function fillColor(metric: Metric): mapboxgl.Expression {
  const { stops } = METRICS.find((m) => m.id === metric)!
  return [
    'interpolate', ['linear'], ['get', metric],
    stops[0], COLORS[0],
    stops[1], COLORS[1],
    stops[2], COLORS[2],
  ]
}

export default function IrisHeatmap({ height = '500px' }: { height?: string }) {
  const { t } = useI18n()
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)
  const cache = useRef<Map<string, GeoJSON.Feature>>(new Map())
  const abortRef = useRef<AbortController | null>(null)
  const metricRef = useRef<Metric>('potential')
  const [metric, setMetric] = useState<Metric>('potential')
  const [isLoading, setIsLoading] = useState(false)
  const [tooFarOut, setTooFarOut] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!mapContainer.current || map.current) return

    const m = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: [2.3488, 48.8534],
      zoom: 11.5,
      minZoom: 4,
      attributionControl: false,
    })
    map.current = m

    m.addControl(new mapboxgl.NavigationControl(), 'top-right')
    m.addControl(
      new mapboxgl.AttributionControl({ compact: true, customAttribution: 'Contours IRIS © IGN' }),
      'bottom-right'
    )

    const popup = new mapboxgl.Popup({ closeButton: false, closeOnClick: false, offset: 8 })

    const refreshSource = () => {
      const source = m.getSource('iris') as mapboxgl.GeoJSONSource | undefined
      source?.setData({ type: 'FeatureCollection', features: Array.from(cache.current.values()) })
    }

    const loadVisibleIris = async () => {
      if (m.getZoom() < MIN_IRIS_ZOOM) {
        setTooFarOut(true)
        return
      }
      setTooFarOut(false)

      const b = m.getBounds()
      if (!b) return
      const bbox = [b.getWest(), b.getSouth(), b.getEast(), b.getNorth()].map((v) => v.toFixed(5)).join(',')
      const params = new URLSearchParams({
        SERVICE: 'WFS',
        VERSION: '2.0.0',
        REQUEST: 'GetFeature',
        TYPENAMES: IRIS_LAYER,
        OUTPUTFORMAT: 'application/json',
        SRSNAME: 'CRS:84',
        BBOX: `${bbox},CRS:84`,
        COUNT: String(MAX_FEATURES_PER_REQUEST),
      })

      abortRef.current?.abort()
      const controller = new AbortController()
      abortRef.current = controller
      setIsLoading(true)
      setError(null)

      try {
        const res = await fetch(`${IRIS_WFS_URL}?${params}`, { signal: controller.signal })
        if (!res.ok) throw new Error(`IGN ${res.status}`)
        const data: GeoJSON.FeatureCollection = await res.json()

        if (cache.current.size + data.features.length > MAX_CACHED_FEATURES) {
          cache.current.clear()
        }
        for (const feature of data.features) {
          const code = (feature.properties as IrisProperties).code_iris
          if (!cache.current.has(code)) {
            cache.current.set(code, withDummyMetrics(feature))
          }
        }
        refreshSource()
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          setError((err as Error).message)
        }
      } finally {
        if (abortRef.current === controller) setIsLoading(false)
      }
    }

    let debounce: ReturnType<typeof setTimeout> | undefined
    const scheduleLoad = () => {
      clearTimeout(debounce)
      debounce = setTimeout(loadVisibleIris, 300)
    }

    m.on('load', () => {
      m.addSource('iris', { type: 'geojson', data: { type: 'FeatureCollection', features: [] } })
      m.addLayer({
        id: 'iris-fill',
        type: 'fill',
        source: 'iris',
        paint: { 'fill-color': fillColor(metricRef.current), 'fill-opacity': 0.7 },
      })
      m.addLayer({
        id: 'iris-outline',
        type: 'line',
        source: 'iris',
        paint: { 'line-color': '#FFFFFF', 'line-width': 0.6, 'line-opacity': 0.8 },
      })
      loadVisibleIris()
    })

    m.on('moveend', scheduleLoad)

    m.on('mousemove', 'iris-fill', (e) => {
      const feature = e.features?.[0]
      if (!feature) return
      m.getCanvas().style.cursor = 'pointer'
      const p = feature.properties as IrisProperties & { companies: number; creations: number; potential: number }
      popup
        .setLngLat(e.lngLat)
        .setHTML(`
          <div style="font-family: system-ui, sans-serif; min-width: 180px;">
            <div style="font-weight: 700; font-size: 13px;">${p.nom_iris}</div>
            <div style="font-size: 11px; color: #6B7280; margin-bottom: 6px;">${p.nom_commune} · IRIS ${p.code_iris}</div>
            <div style="display: flex; justify-content: space-between; font-size: 12px;"><span>Potentiel</span><b>${p.potential}/100</b></div>
            <div style="display: flex; justify-content: space-between; font-size: 12px;"><span>Entreprises</span><b>${p.companies}</b></div>
            <div style="display: flex; justify-content: space-between; font-size: 12px;"><span>Créations</span><b>+${p.creations}</b></div>
          </div>
        `)
        .addTo(m)
    })
    m.on('mouseleave', 'iris-fill', () => {
      m.getCanvas().style.cursor = ''
      popup.remove()
    })

    return () => {
      clearTimeout(debounce)
      abortRef.current?.abort()
      popup.remove()
      m.remove()
      map.current = null
    }
  }, [])

  const handleMetricChange = (next: Metric) => {
    setMetric(next)
    metricRef.current = next
    if (map.current?.getLayer('iris-fill')) {
      map.current.setPaintProperty('iris-fill', 'fill-color', fillColor(next))
    }
  }

  const activeMetric = METRICS.find((m) => m.id === metric)!

  return (
    <div className="relative rounded-xl overflow-hidden shadow-card">
      {/* Choix de l'indicateur */}
      <div className="absolute top-3 left-3 z-10 flex items-center gap-1 bg-white rounded-lg shadow-md p-1">
        {METRICS.map((m) => (
          <button
            key={m.id}
            onClick={() => handleMetricChange(m.id)}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${
              metric === m.id ? 'bg-brand-primary text-white' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            {t(m.labelKey)}
          </button>
        ))}
      </div>

      {/* Légende */}
      <div className="absolute bottom-8 left-3 z-10 bg-white rounded-lg shadow-md px-3 py-2 text-xs text-gray-600">
        <div className="font-medium text-gray-900 mb-1">{t(activeMetric.labelKey)}</div>
        <div
          className="h-2 w-40 rounded"
          style={{ background: `linear-gradient(to right, ${COLORS.join(', ')})` }}
        />
        <div className="flex justify-between mt-1">
          <span>{activeMetric.stops[0]}</span>
          <span>{activeMetric.stops[2]}+</span>
        </div>
        <div className="mt-1 text-gray-400">{t('explore_heatmap_demo_note')}</div>
      </div>

      {/* États */}
      {(tooFarOut || isLoading || error) && (
        <div className="absolute top-14 left-1/2 -translate-x-1/2 z-10 bg-white/95 rounded-lg shadow-md px-3 py-2 text-xs text-gray-700 flex items-center gap-2">
          {isLoading && !tooFarOut && (
            <div className="w-3 h-3 border-2 border-brand-primary border-t-transparent rounded-full animate-spin" />
          )}
          {tooFarOut
            ? t('explore_heatmap_zoom_in')
            : error
              ? `${t('explore_heatmap_error')} (${error})`
              : t('explore_heatmap_loading')}
        </div>
      )}

      <div ref={mapContainer} style={{ height, width: '100%' }} />
    </div>
  )
}
