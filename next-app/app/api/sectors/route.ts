// GET /api/sectors - Liste tous les secteurs NAF disponibles
// Équivalent de GET /v1/sectors dans le backend FastAPI

import { NextResponse } from 'next/server';
import { loadSectors } from '@/lib/data-loader';
import { corsResponse, handleCorsOptions } from '@/lib/utils';
import type { Sector } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function OPTIONS(request: Request): Promise<NextResponse> {
  return handleCorsOptions(request);
}

export async function GET(request: Request): Promise<NextResponse<Sector[]>> {
  const sectors = await loadSectors();
  return corsResponse(Array.from(sectors.values()), 200, request);
}
