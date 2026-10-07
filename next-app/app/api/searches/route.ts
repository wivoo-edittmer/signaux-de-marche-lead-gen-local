// POST /api/searches - Effectue une recherche d'entreprises
// Équivalent de POST /v1/searches dans le backend FastAPI
//
// GET /api/searches - Liste les recherches (non implémenté pour MVP1)

import { NextResponse } from 'next/server';
import {
  getStatistics,
  toCompanySummaries,
  loadSectors,
  loadZones,
} from '@/lib/data-loader';
import { generateId, nowIso, getNextActions, generateInsight, corsResponse, corsErrorResponse, handleCorsOptions } from '@/lib/utils';
import type { SearchRequest, SearchResponse } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function OPTIONS(request: Request): Promise<NextResponse> {
  return handleCorsOptions(request);
}

export async function POST(
  request: Request
): Promise<NextResponse<SearchResponse | { error: string }>> {
  try {
    const body: SearchRequest = await request.json();

    // Effectuer la recherche
    const stats = await getStatistics({
      sector_id: body.sector_id || null,
      zone_id: body.zone_id || null,
      naf_code: body.naf_code || null,
      date_from: body.date_from || body.period_start || null,
      date_to: body.date_to || body.period_end || null,
    });

    // Filtrer par catégorie et taille si spécifié
    let companies = stats.companies;
    if (body.category) {
      companies = companies.filter((c) => c.category === body.category);
    }
    if (body.size) {
      companies = companies.filter((c) => c.size === body.size);
    }

    const limit = body.limit || 50;
    companies = companies.slice(0, limit);

    // Résoudre les noms de secteur et zone
    const sectors = await loadSectors();
    const zones = await loadZones();

    let sectorName = body.sector_id || body.naf_code || undefined;
    if (body.sector_id && sectors.has(body.sector_id)) {
      sectorName = sectors.get(body.sector_id)!.name;
    } else if (body.naf_code) {
      for (const s of sectors.values()) {
        if (s.naf_code === body.naf_code) {
          sectorName = s.name;
          break;
        }
      }
    }

    let zoneName = body.zone_id || undefined;
    if (body.zone_id && zones.has(body.zone_id)) {
      zoneName = zones.get(body.zone_id)!.name;
    }

    // Générer l'insight
    const insight = generateInsight({
      sectorName: sectorName || 'Tous secteurs',
      zoneName: zoneName || 'France',
      totalCompanies: stats.total_companies,
      creations: stats.creations,
      radiations: stats.radiations,
      netChange: stats.net_change,
      trend: stats.trend,
    });

    const response: SearchResponse = {
      id: generateId(),
      query: body.query,
      sector_id: body.sector_id,
      sector_name: sectorName,
      zone_id: body.zone_id,
      zone_name: zoneName,
      period_start: body.date_from || body.period_start,
      period_end: body.date_to || body.period_end,
      statistics: {
        total_companies: stats.total_companies,
        creations: stats.creations,
        radiations: stats.radiations,
        net_change: stats.net_change,
        trend: stats.trend,
      },
      companies: toCompanySummaries(companies),
      insight,
      actions: getNextActions({
        sector: body.sector_id
          ? { id: body.sector_id, name: sectorName || body.sector_id, naf_code: body.sector_id }
          : null,
        zone: body.zone_id
          ? { id: body.zone_id, name: zoneName || body.zone_id, code: body.zone_id }
          : null,
      }),
      created_at: nowIso(),
      status: 'completed',
    };

    return corsResponse(response, 200, request);
  } catch (error) {
    console.error('Erreur dans searches:', error);
    return corsErrorResponse(
      (error as Error).message || 'Erreur interne du serveur',
      500,
      undefined,
      request
    );
  }
}
