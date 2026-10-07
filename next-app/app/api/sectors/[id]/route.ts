// GET /api/sectors/[id] - Obtient un secteur spécifique
// Équivalent de GET /v1/sectors/{sector_id} dans le backend FastAPI

import { NextResponse } from 'next/server';
import { loadSectors } from '@/lib/data-loader';
import { corsResponse, corsErrorResponse, handleCorsOptions } from '@/lib/utils';
import type { Sector } from '@/lib/types';

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
): Promise<NextResponse<Sector | { error: string }>> {
  const sectors = await loadSectors();
  const sector = sectors.get(params.id);

  if (!sector) {
    return corsErrorResponse('Secteur non trouvé', 404, undefined, request);
  }

  return corsResponse(sector, 200, request);
}
