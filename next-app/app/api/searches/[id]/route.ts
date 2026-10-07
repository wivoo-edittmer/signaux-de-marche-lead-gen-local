// GET /api/searches/[id] - Obtient les résultats d'une recherche précédente
// Équivalent de GET /v1/searches/{search_id} dans le backend FastAPI
//
// Pour le MVP1, retourne des données mockées car les recherches
// ne sont pas persistées en base de données.

import { NextResponse } from 'next/server';
import { nowIso, getNextActions, corsResponse, handleCorsOptions } from '@/lib/utils';
import type { SearchResponse } from '@/lib/types';

export const dynamic = 'force-dynamic';

interface RouteParams {
  params: { id: string };
}

export async function OPTIONS(request: Request): Promise<NextResponse> {
  return handleCorsOptions(request);
}

export async function GET(
  request: Request,
  { params }: RouteParams
): Promise<NextResponse<SearchResponse>> {
  // Pour le MVP1, on retourne des données mockées
  const response: SearchResponse = {
    id: params.id,
    query: 'Recherche exemple',
    sector_id: '56',
    sector_name: 'Restauration',
    zone_id: '69',
    zone_name: 'Rhône',
    period_start: '2023-01-01',
    period_end: '2024-06-30',
    statistics: {
      total_companies: 2450,
      creations: 245,
      radiations: 180,
      net_change: 65,
      trend: 'growth',
    },
    companies: [
      {
        siren: '123456789',
        name: 'Le Bistrot Nouveau',
        naf_code: '56.10A',
        commune: 'Lyon',
        postal_code: '69002',
        size: 'small',
        category: 'PME',
      },
    ],
    insight:
      'Le marché de la restauration à Lyon est en croissance nette de +65 établissements sur les 12 derniers mois. 245 nouvelles entreprises créées, 180 radiations. Une dynamique positive pour le secteur.',
    actions: getNextActions({
      sector: { id: '56', name: 'Restauration', naf_code: '56' },
      zone: { id: '69', name: 'Rhône', code: '69' },
    }),
    created_at: nowIso(),
    status: 'completed',
  };

  return corsResponse(response, 200, request);
}
