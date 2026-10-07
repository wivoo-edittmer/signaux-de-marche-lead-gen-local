// POST /api/extract-entities - Extrait les entités d'un message
// Équivalent de POST /v1/extract-entities dans le backend FastAPI

import { NextResponse } from 'next/server';
import { extractEntities } from '@/lib/data-loader';
import { corsResponse, corsErrorResponse, handleCorsOptions } from '@/lib/utils';
import type { ChatMessageRequest, ExtractedEntities } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function OPTIONS(request: Request): Promise<NextResponse> {
  return handleCorsOptions(request);
}

export async function POST(
  request: Request
): Promise<NextResponse<{ entities: ExtractedEntities } | { error: string }>> {
  try {
    const body: ChatMessageRequest = await request.json();

    if (!body.message) {
      return corsErrorResponse('Le champ "message" est requis', 400, undefined, request);
    }

    const entities = await extractEntities(body.message);

    return corsResponse({ entities }, 200, request);
  } catch (error) {
    console.error('Erreur dans extract-entities:', error);
    return corsErrorResponse(
      (error as Error).message || 'Erreur interne du serveur',
      500,
      undefined,
      request
    );
  }
}
