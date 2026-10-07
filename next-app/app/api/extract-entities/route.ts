// POST /api/extract-entities - Extrait les entités d'un message
// Équivalent de POST /v1/extract-entities dans le backend FastAPI

import { NextResponse } from 'next/server';
import { extractEntities } from '@/lib/data-loader';
import type { ChatMessageRequest, ExtractedEntities } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function POST(
  request: Request
): Promise<NextResponse<{ entities: ExtractedEntities } | { error: string }>> {
  try {
    const body: ChatMessageRequest = await request.json();

    if (!body.message) {
      return NextResponse.json(
        { error: 'Le champ "message" est requis' },
        { status: 400 }
      );
    }

    const entities = await extractEntities(body.message);

    return NextResponse.json({ entities });
  } catch (error) {
    console.error('Erreur dans extract-entities:', error);
    return NextResponse.json(
      { error: (error as Error).message || 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
