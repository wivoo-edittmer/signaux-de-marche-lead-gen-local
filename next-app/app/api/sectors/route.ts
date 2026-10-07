// GET /api/sectors - Liste tous les secteurs NAF disponibles
// Équivalent de GET /v1/sectors dans le backend FastAPI

import { NextResponse } from 'next/server';
import { loadSectors } from '@/lib/data-loader';
import type { Sector } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET(): Promise<NextResponse<Sector[]>> {
  const sectors = await loadSectors();
  return NextResponse.json(Array.from(sectors.values()));
}
