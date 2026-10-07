// GET /api/zones - Liste toutes les zones géographiques disponibles
// Équivalent de GET /v1/zones dans le backend FastAPI

import { NextResponse } from 'next/server';
import { loadZones } from '@/lib/data-loader';
import type { Zone } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET(): Promise<NextResponse<Zone[]>> {
  const zones = await loadZones();
  return NextResponse.json(Array.from(zones.values()));
}
