// Data Loader pour B2Bmax Next.js
// Remplace le SupabaseDataLoader Python (psycopg2) et INSEEDataLoader (CSV)
// Charge les données de référence depuis les fichiers JSON locaux
// et interroge Supabase pour les entreprises

import { getSupabaseClient } from './supabase';
import type { Sector, Zone, Company, CompanySummary, SearchStatistics } from './types';

// ============================================================
// Chargement des données de référence (fichiers JSON locaux)
// ============================================================

let sectorsCache: Map<string, Sector> | null = null;
let zonesCache: Map<string, Zone> | null = null;

/**
 * Charge les secteurs depuis le fichier JSON local
 */
export async function loadSectors(): Promise<Map<string, Sector>> {
  if (sectorsCache) {
    return sectorsCache;
  }

  // En production Vercel, les fichiers JSON sont bundlés
  const sectorsData = await import('../../../data/sectors.json');
  sectorsCache = new Map();

  for (const s of sectorsData.default as Sector[]) {
    sectorsCache.set(s.id, s);
  }

  return sectorsCache;
}

/**
 * Charge les zones depuis le fichier JSON local
 */
export async function loadZones(): Promise<Map<string, Zone>> {
  if (zonesCache) {
    return zonesCache;
  }

  const zonesData = await import('../../../data/zones.json');
  zonesCache = new Map();

  for (const z of zonesData.default as Zone[]) {
    zonesCache.set(z.id, z);
  }

  return zonesCache;
}

/**
 * Charge toutes les données de référence
 */
export async function loadReferenceData(): Promise<{
  sectors: Map<string, Sector>;
  zones: Map<string, Zone>;
}> {
  const [sectors, zones] = await Promise.all([loadSectors(), loadZones()]);
  return { sectors, zones };
}

// ============================================================
// Recherche d'entreprises via Supabase
// ============================================================

export interface SearchCompaniesParams {
  sector_id?: string | null;
  zone_id?: string | null;
  naf_code?: string | null;
  date_from?: string | null;
  date_to?: string | null;
  category?: string | null;
  size?: string | null;
  is_active?: boolean | null;
  limit?: number;
}

/**
 * Recherche des entreprises dans Supabase
 * Équivalent de SupabaseDataLoader.search_companies() en Python
 */
export async function searchCompanies(
  params: SearchCompaniesParams
): Promise<Company[]> {
  const supabase = getSupabaseClient();
  const limit = params.limit || 100;

  let query = supabase
    .from('searchable_companies')
    .select('*')
    .limit(limit);

  // Filtre par secteur (code NAF)
  if (params.sector_id || params.naf_code) {
    const code = params.naf_code || params.sector_id;
    if (code) {
      query = query.ilike('sector_code', `${code}%`);
    }
  }

  // Filtre par zone
  if (params.zone_id) {
    const zones = await loadZones();
    const zoneCodes = getAllZoneCodes(params.zone_id, zones);
    if (zoneCodes.length > 0) {
      query = query.in('zone_code', zoneCodes);
    }
  }

  // Filtre par catégorie
  if (params.category) {
    query = query.eq('category', params.category);
  }

  // Filtre par statut actif
  if (params.is_active !== null && params.is_active !== undefined) {
    query = query.eq('is_active', params.is_active);
  }

  // Filtre par date de création
  if (params.date_from) {
    query = query.gte('creation_date', params.date_from);
  }
  if (params.date_to) {
    query = query.lte('creation_date', params.date_to);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Erreur recherche entreprises:', error);
    return [];
  }

  // Mapper les résultats vers le type Company
  return (data || []).map((row: Record<string, unknown>) => ({
    siren: row.siren as string,
    name: row.name as string,
    legal_form: null,
    date_created: row.creation_date as string | null,
    date_radiated: null,
    sector_id: row.sector_code as string | null,
    naf_code: row.sector_code as string | null,
    zone_id: row.zone_code as string | null,
    commune: row.commune_name as string | null,
    postal_code: row.postal_code as string | null,
    address: row.address as string | null,
    size: row.employee_range as string | null,
    category: row.category as string | null,
    is_active: row.is_active as boolean,
  }));
}

// ============================================================
// Statistiques
// ============================================================

export interface StatisticsParams {
  sector_id?: string | null;
  zone_id?: string | null;
  naf_code?: string | null;
  date_from?: string | null;
  date_to?: string | null;
}

/**
 * Calcule les statistiques pour une recherche
 * Équivalent de SupabaseDataLoader.get_statistics() en Python
 */
export async function getStatistics(
  params: StatisticsParams
): Promise<SearchStatistics & { companies: Company[] }> {
  // Définir la période par défaut: 12 derniers mois
  const now = new Date();
  const dateTo = params.date_to || now.toISOString().split('T')[0];
  const oneYearAgo = new Date(now);
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
  const dateFrom = params.date_from || oneYearAgo.toISOString().split('T')[0];

  const companies = await searchCompanies({
    sector_id: params.sector_id,
    zone_id: params.zone_id,
    naf_code: params.naf_code,
    date_from: dateFrom,
    date_to: dateTo,
    is_active: true,
    limit: 10000,
  });

  const total = companies.length;

  // Compter les créations dans la période
  const creations = companies.filter((c) => {
    if (!c.date_created) return false;
    const dateStr = c.date_created.substring(0, 10);
    return dateFrom <= dateStr && dateStr <= dateTo;
  }).length;

  // Estimation des radiations (ratio de 10% pour le MVP)
  const radiations = Math.round(total * 0.1);
  const netChange = creations - radiations;

  const trend: 'growth' | 'decline' | 'stable' =
    netChange > 0 ? 'growth' : netChange < 0 ? 'decline' : 'stable';

  return {
    total_companies: total,
    creations,
    radiations,
    net_change: netChange,
    trend,
    companies,
  };
}

// ============================================================
// Extraction d'entités (NLP simplifié)
// ============================================================

export interface ExtractEntitiesResult {
  query: string;
  sector: { id: string; name: string; naf_code: string } | null;
  zone: { id: string; name: string; code: string; level?: string } | null;
  period: string;
  confidence: number;
  category: string | null;
}

/**
 * Extrait les entités (secteur, zone, période) d'une requête en langage naturel
 * Équivalent de SupabaseDataLoader.extract_entities() en Python
 */
export async function extractEntities(query: string): Promise<ExtractEntitiesResult> {
  const { sectors, zones } = await loadReferenceData();
  const queryLower = query.toLowerCase();

  const result: ExtractEntitiesResult = {
    query,
    sector: null,
    zone: null,
    period: '12 derniers mois',
    confidence: 0.8,
    category: null,
  };

  // --- Extraction de la catégorie ---
  const categories = ['pme', 'ge', 'tpe', 'micro', 'petite', 'moyenne', 'grande'];
  for (const cat of categories) {
    if (queryLower.includes(cat)) {
      result.category = cat.toUpperCase();
      break;
    }
  }

  // --- Mapping synonymes secteurs ---
  const sectorSynonyms: Record<string, string[]> = {
    numérique: ['numérique', 'informatique', 'digital', 'web', 'internet', 'logiciel', 'information', 'communication', 'télécom', 'technologie', 'tech', 'saas', 'programmation', 'développement', 'software', 'data', 'cloud'],
    restauration: ['restauration', 'restaurant', 'café', 'bar', 'hôtel', 'hôtellerie', 'traiteur', 'brasserie', 'fast-food', 'fastfood', 'cuisine'],
    commerce: ['commerce', 'boutique', 'magasin', 'vente', 'achat', 'retail', 'e-commerce', 'ecommerce', 'distribution'],
    bâtiment: ['bâtiment', 'construction', 'travaux', 'btp'],
    industrie: ['industrie', 'fabrication', 'production', 'usine'],
    santé: ['santé', 'médecin', 'hôpital', 'médical', 'pharmacie'],
    éducation: ['éducation', 'école', 'formation', 'université', 'lycée'],
  };

  // Chercher par synonymes d'abord
  for (const [sectorName, keywords] of Object.entries(sectorSynonyms)) {
    for (const keyword of keywords) {
      if (queryLower.includes(keyword)) {
        // Chercher le secteur correspondant dans les données de référence
        for (const sector of sectors.values()) {
          if (
            sector.name.toLowerCase().includes(sectorName) ||
            sector.naf_code.toLowerCase().includes(sectorName)
          ) {
            result.sector = {
              id: sector.id,
              name: sector.name,
              naf_code: sector.naf_code,
            };
            result.confidence = 0.98;
            break;
          }
        }
        // Fallback: chercher par code NAF section
        if (!result.sector) {
          const nafSectionMap: Record<string, string> = {
            numérique: 'J',
            restauration: 'I',
            commerce: 'G',
            bâtiment: 'F',
            industrie: 'C',
            santé: 'Q',
            éducation: 'P',
          };
          const sectionCode = nafSectionMap[sectorName];
          if (sectionCode && sectors.has(sectionCode)) {
            const sector = sectors.get(sectionCode)!;
            result.sector = {
              id: sector.id,
              name: sector.name,
              naf_code: sector.naf_code,
            };
            result.confidence = 0.95;
          }
        }
        if (result.sector) break;
      }
    }
    if (result.sector) break;
  }

  // Si pas trouvé par synonymes, chercher dans les noms/codes de secteurs
  if (!result.sector) {
    for (const sector of sectors.values()) {
      const keywords = [
        sector.name.toLowerCase(),
        sector.naf_code.toLowerCase().replace('.', ''),
        sector.naf_code.toLowerCase(),
      ];
      for (const keyword of keywords) {
        if (keyword && queryLower.includes(keyword)) {
          result.sector = {
            id: sector.id,
            name: sector.name,
            naf_code: sector.naf_code,
          };
          result.confidence = 0.95;
          break;
        }
      }
      if (result.sector) break;
    }
  }

  // --- Extraction de la zone ---
  const zoneKeywords: Record<string, string[]> = {
    BRE: ['bretagne', 'rennes', 'brest', 'quimper', 'vannes', 'saint-brieuc'],
    '35': ['ille-et-vilaine', 'ille et vilaine'],
    '29': ['finistère', 'finistere'],
    '22': ["côtes-d'armor", "cotes-d'armor", "cotes d'armor", 'saint-brieuc'],
    '56': ['morbihan', 'lorient'],
    IDF: ['île-de-france', 'ile-de-france', 'idf', 'paris'],
    '75': ['paris'],
    '69': ['rhône', 'rhone', 'lyon'],
  };

  for (const [zoneId, keywords] of Object.entries(zoneKeywords)) {
    if (!zones.has(zoneId)) continue;
    for (const keyword of keywords) {
      if (queryLower.includes(keyword)) {
        const zone = zones.get(zoneId)!;
        result.zone = {
          id: zone.id,
          name: zone.name,
          code: zone.code,
          level: zone.level,
        };
        result.confidence = Math.max(result.confidence, 0.95);
        break;
      }
    }
    if (result.zone) break;
  }

  // Si pas trouvé par mots-clés, chercher dans les noms/codes de zones
  if (!result.zone) {
    for (const zone of zones.values()) {
      const keywords = [zone.name.toLowerCase(), zone.code.toLowerCase()];
      for (const keyword of keywords) {
        if (keyword && queryLower.includes(keyword)) {
          result.zone = {
            id: zone.id,
            name: zone.name,
            code: zone.code,
            level: zone.level,
          };
          result.confidence = Math.max(result.confidence, 0.95);
          break;
        }
      }
      if (result.zone) break;
    }
  }

  // --- Extraction de la période ---
  if (queryLower.includes('2023')) {
    result.period = '2023';
  } else if (queryLower.includes('2024')) {
    result.period = '2024';
  } else if (queryLower.includes('2025')) {
    result.period = '2025';
  } else if (queryLower.includes('trimestre') || queryLower.includes('3 mois')) {
    result.period = '3 derniers mois';
  } else if (queryLower.includes('6 mois') || queryLower.includes('semestre')) {
    result.period = '6 derniers mois';
  } else if (queryLower.includes('semaine') || queryLower.includes('7 jours')) {
    result.period = '7 derniers jours';
  } else if (queryLower.includes('mois')) {
    result.period = '1 mois';
  }

  return result;
}

// ============================================================
// Utilitaires de hiérarchie
// ============================================================

/**
 * Obtient tous les codes de zones enfants (récursif)
 */
export function getAllZoneCodes(
  zoneId: string,
  zones: Map<string, Zone>
): string[] {
  const codes: string[] = [];
  const stack: string[] = [zoneId];

  while (stack.length > 0) {
    const currentId = stack.pop()!;
    const zone = zones.get(currentId);
    if (zone) {
      codes.push(zone.code);
    }

    // Trouver les zones enfants
    for (const [zId, z] of zones.entries()) {
      if (z.parent_id === currentId) {
        stack.push(zId);
      }
    }
  }

  return codes;
}

/**
 * Convertit une liste d'entreprises en CompanySummary
 */
export function toCompanySummaries(companies: Company[]): CompanySummary[] {
  return companies.map((c) => ({
    siren: c.siren,
    name: c.name,
    naf_code: c.naf_code,
    commune: c.commune,
    postal_code: c.postal_code,
    size: c.size,
    category: c.category,
  }));
}
