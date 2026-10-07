// Réponses factices pour le chat /ask (utilisées tant qu'aucun backend n'est configuré)

import type { ChatMessageResponse, CompanySummary, NextAction, QueryResult } from './api'

interface MockSector {
  keywords: string[]
  id: string
  name: string
  naf_code: string
  companies: Omit<CompanySummary, 'naf_code'>[]
}

interface MockZone {
  keywords: string[]
  id: string
  name: string
  code: string
  level: string
}

const SECTORS: MockSector[] = [
  {
    keywords: ['numérique', 'numerique', 'informatique', 'logiciel', 'tech', 'digital'],
    id: 'sector-62',
    name: 'Programmation et conseil informatique',
    naf_code: '62.01Z',
    companies: [
      { siren: '812345671', name: 'Breizh Code', commune: 'Rennes', postal_code: '35000', size: 'PME', category: 'PME' },
      { siren: '823456782', name: 'Armor Digital', commune: 'Brest', postal_code: '29200', size: 'PME', category: 'PME' },
      { siren: '834567893', name: 'Ouest Logiciels', commune: 'Nantes', postal_code: '44000', size: 'ETI', category: 'ETI' },
      { siren: '845678904', name: 'Kerlab Studio', commune: 'Lorient', postal_code: '56100', size: 'TPE', category: 'TPE' },
      { siren: '856789015', name: 'Data Iroise', commune: 'Quimper', postal_code: '29000', size: 'PME', category: 'PME' },
    ],
  },
  {
    keywords: ['restauration', 'restaurant', 'café', 'cafe', 'traiteur'],
    id: 'sector-56',
    name: 'Restauration traditionnelle',
    naf_code: '56.10A',
    companies: [
      { siren: '901234561', name: 'Le Bouchon des Canuts', commune: 'Lyon 4e', postal_code: '69004', size: 'TPE', category: 'TPE' },
      { siren: '912345672', name: 'Maison Brotteaux', commune: 'Lyon 6e', postal_code: '69006', size: 'TPE', category: 'TPE' },
      { siren: '923456783', name: 'La Table de Fourvière', commune: 'Lyon 5e', postal_code: '69005', size: 'PME', category: 'PME' },
      { siren: '934567894', name: 'Saveurs de la Presqu\'île', commune: 'Lyon 2e', postal_code: '69002', size: 'TPE', category: 'TPE' },
    ],
  },
  {
    keywords: ['commerce', 'détail', 'detail', 'boutique', 'magasin', 'retail'],
    id: 'sector-47',
    name: 'Commerce de détail',
    naf_code: '47.19B',
    companies: [
      { siren: '701234561', name: 'Comptoir Saint-Honoré', commune: 'Paris 1er', postal_code: '75001', size: 'PME', category: 'PME' },
      { siren: '712345672', name: 'Bazar de Montreuil', commune: 'Montreuil', postal_code: '93100', size: 'TPE', category: 'TPE' },
      { siren: '723456783', name: 'Galeries Versaillaises', commune: 'Versailles', postal_code: '78000', size: 'ETI', category: 'ETI' },
      { siren: '734567894', name: 'Épicerie du Marais', commune: 'Paris 3e', postal_code: '75003', size: 'TPE', category: 'TPE' },
      { siren: '745678905', name: 'Boutique Vincennes', commune: 'Vincennes', postal_code: '94300', size: 'TPE', category: 'TPE' },
    ],
  },
]

const ZONES: MockZone[] = [
  { keywords: ['bretagne', 'rennes', 'brest'], id: 'zone-53', name: 'Bretagne', code: '53', level: 'region' },
  { keywords: ['lyon', 'rhône', 'rhone'], id: 'zone-69123', name: 'Lyon', code: '69123', level: 'commune' },
  { keywords: ['île-de-france', 'ile-de-france', 'idf', 'paris'], id: 'zone-11', name: 'Île-de-France', code: '11', level: 'region' },
]

const NEXT_ACTIONS: NextAction[] = [
  { type: 'export', title: 'Exporter la liste', description: 'Télécharger les entreprises en CSV', action: 'export_csv', icon: '📥' },
  { type: 'alert', title: 'Créer une alerte', description: 'Être notifié des nouvelles créations', action: 'create_alert', icon: '🔔' },
  { type: 'explore', title: 'Voir sur la carte', description: 'Ouvrir la vue Explorer', action: 'open_explore', icon: '🗺️' },
]

function normalize(text: string) {
  return text.toLowerCase()
}

// Nombre pseudo-aléatoire stable pour une même question
function seededNumber(seed: string, min: number, max: number) {
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) | 0
  }
  return min + (Math.abs(hash) % (max - min + 1))
}

export async function sendMockChatMessage(
  message: string,
  sessionId?: string
): Promise<ChatMessageResponse> {
  // Simule la latence réseau
  await new Promise((resolve) => setTimeout(resolve, 700))

  const text = normalize(message)
  const sector = SECTORS.find((s) => s.keywords.some((k) => text.includes(k)))
  const zone = ZONES.find((z) => z.keywords.some((k) => text.includes(k)))
  const session = sessionId || `mock-session-${Date.now()}`

  if (!sector && !zone) {
    return {
      message:
        "Je n'ai pas identifié de secteur ou de zone dans votre question. Essayez par exemple : « Quelles sont les PME du numérique en Bretagne ? » ou « Combien de restaurants ont été créés à Lyon ce trimestre ? »",
      entities: { query: message, sector: null, zone: null, period: 'last_quarter', confidence: 0.2 },
      query_result: null,
      next_actions: [],
      session_id: session,
    }
  }

  const totalCompanies = seededNumber(text, 800, 12000)
  const creations = seededNumber(text + 'c', 40, 400)
  const radiations = seededNumber(text + 'r', 20, 300)
  const netChange = creations - radiations
  const trend = netChange > 20 ? 'growth' : netChange < -20 ? 'decline' : 'stable'

  const sectorRef = sector ? { id: sector.id, name: sector.name, naf_code: sector.naf_code } : null
  const zoneRef = zone ? { id: zone.id, name: zone.name, code: zone.code, level: zone.level } : null
  const companies: CompanySummary[] = (sector ? sector.companies : SECTORS.flatMap((s) => s.companies.slice(0, 2))).map(
    (c) => ({ ...c, naf_code: sector?.naf_code ?? null })
  )

  const queryResult: QueryResult = {
    query: message,
    sector: sectorRef,
    zone: zoneRef,
    total_companies: totalCompanies,
    creations,
    radiations,
    net_change: netChange,
    trend,
    companies,
    next_actions: NEXT_ACTIONS,
    confidence: 0.85,
  }

  const trendLabel = trend === 'growth' ? 'en croissance' : trend === 'decline' ? 'en déclin' : 'stable'
  const scope = [sector?.name, zone ? `en ${zone.name}` : 'en France'].filter(Boolean).join(' ')

  return {
    message: `J'ai trouvé ${totalCompanies.toLocaleString('fr-FR')} entreprises — ${scope}. Sur le dernier trimestre : ${creations} créations et ${radiations} radiations, soit une variation nette de ${netChange >= 0 ? '+' : ''}${netChange}. Le marché est ${trendLabel}.\n\n(Données de démonstration)`,
    entities: { query: message, sector: sectorRef, zone: zoneRef, period: 'last_quarter', confidence: 0.85 },
    query_result: queryResult,
    next_actions: NEXT_ACTIONS,
    session_id: session,
  }
}
