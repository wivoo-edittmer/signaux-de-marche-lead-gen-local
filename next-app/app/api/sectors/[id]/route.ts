// GET /api/sectors/[id] - Obtient un secteur spécifique
// Équivalent de GET /v1/sectors/{sector_id} dans le backend FastAPI

import { NextResponse } from 'next/server';
import { loadSectors } from '@/lib/data-loader';
import type { Sector } from '@/lib/types';

export const dynamic = 'force-dynamic';

interface RouteParams {
  params: { id: string };
}

export async function GET(
  _request: Request,
  { params }: RouteParams
): Promise<NextResponse<Sector | { error: string }>> {
  const sectors = await loadSectors();
  const sector = sectors.get(params.id);

  if (!sector) {
    return NextResponse.json(
      { error: 'Secteur non trouvé' },
      { status: 404 }
    );
  }

  return NextResponse.json(sector);
}
