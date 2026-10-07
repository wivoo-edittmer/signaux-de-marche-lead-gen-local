// GET /api/zones/[id] - Obtient une zone spécifique
// Équivalent de GET /v1/zones/{zone_id} dans le backend FastAPI

import { NextResponse } from 'next/server';
import { loadZones } from '@/lib/data-loader';
import type { Zone } from '@/lib/types';

export const dynamic = 'force-dynamic';

interface RouteParams {
  params: { id: string };
}

export async function GET(
  _request: Request,
  { params }: RouteParams
): Promise<NextResponse<Zone | { error: string }>> {
  const zones = await loadZones();
  const zone = zones.get(params.id);

  if (!zone) {
    return NextResponse.json(
      { error: 'Zone non trouvée' },
      { status: 404 }
    );
  }

  return NextResponse.json(zone);
}
