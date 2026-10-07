// GET /api/zones - Liste toutes les zones géographiques disponibles
// Équivalent de GET /v1/zones dans le backend FastAPI

import { NextResponse } from 'next/server';
import { loadZones } from '@/lib/data-loader';
import { corsResponse, handleCorsOptions } from '@/lib/utils';
import type { Zone } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function OPTIONS(request: Request): Promise<NextResponse> {
  return handleCorsOptions(request);
}

export async function GET(request: Request): Promise<NextResponse<Zone[]>> {
  const zones = await loadZones();
  return corsResponse(Array.from(zones.values()), 200, request);
}
