// GET /api/zones/[id] - Obtient une zone spécifique
// Équivalent de GET /v1/zones/{zone_id} dans le backend FastAPI

import { NextResponse } from 'next/server';
import { loadZones } from '@/lib/data-loader';
import { corsResponse, corsErrorResponse, handleCorsOptions } from '@/lib/utils';
import type { Zone } from '@/lib/types';

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
): Promise<NextResponse<Zone | { error: string }>> {
  const zones = await loadZones();
  const zone = zones.get(params.id);

  if (!zone) {
    return corsErrorResponse('Zone non trouvée', 404, undefined, request);
  }

  return corsResponse(zone, 200, request);
}
