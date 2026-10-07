// POST /api/chat/messages - Traite un message du chat
// Équivalent de POST /v1/chat/messages dans le backend FastAPI
//
// Ce endpoint:
// 1. Reçoit un message utilisateur
// 2. Extrait les entités (secteur, zone, période)
// 3. Effectue une recherche dans Supabase
// 4. Génère une synthèse
// 5. Retourne la réponse avec les résultats

import { NextResponse } from 'next/server';
import {
  extractEntities,
  getStatistics,
  toCompanySummaries,
  loadSectors,
  loadZones,
} from '@/lib/data-loader';
import {
  generateId,
  nowIso,
  getNextActions,
  generateInsight,
  generateChatResponse,
} from '@/lib/utils';
import type {
  ChatMessageRequest,
  ChatMessageResponse,
  QueryResult,
} from '@/lib/types';

export const dynamic = 'force-dynamic';

// Gestion des sessions en mémoire (pour MVP1, pas de persistance)
const sessions = new Map<string, {
  created_at: string;
  query_history: Array<{ query: string; result: unknown; timestamp: string }>;
}>();

function createSession(): string {
  const sessionId = generateId();
  sessions.set(sessionId, {
    created_at: nowIso(),
    query_history: [],
  });
  return sessionId;
}

function addToSession(sessionId: string, query: string, result: unknown): void {
  const session = sessions.get(sessionId);
  if (session) {
    session.query_history.push({
      query,
      result,
      timestamp: nowIso(),
    });
  }
}

export async function POST(
  request: Request
): Promise<NextResponse<ChatMessageResponse | { error: string }>> {
  try {
    const body: ChatMessageRequest = await request.json();

    if (!body.message || body.message.trim().length === 0) {
      return NextResponse.json(
        { error: 'Le champ "message" est requis' },
        { status: 400 }
      );
    }

    // 1. Extraire les entités de la requête
    const entities = await extractEntities(body.message);

    // 2. Si on a un secteur ou une zone, effectuer une recherche
    let queryResult: QueryResult | null = null;

    if (entities.sector || entities.zone) {
      const sectorId = entities.sector?.id || null;
      const zoneId = entities.zone?.id || null;

      // Obtenir les statistiques
      const stats = await getStatistics({
        sector_id: sectorId,
        zone_id: zoneId,
      });

      // Préparer les résultats
      const companies = toCompanySummaries(stats.companies.slice(0, 50));
      const nextActions = getNextActions({
        sector: entities.sector,
        zone: entities.zone,
      });

      queryResult = {
        query: body.message,
        sector: entities.sector,
        zone: entities.zone,
        total_companies: stats.total_companies,
        creations: stats.creations,
        radiations: stats.radiations,
        net_change: stats.net_change,
        trend: stats.trend,
        companies,
        next_actions: nextActions,
        confidence: entities.confidence,
      };
    }

    // 3. Générer une réponse en langage naturel
    const responseMessage = generateChatResponse(entities, queryResult);

    // 4. Gérer la session
    const sessionId = body.session_id || body.conversation_id || createSession();
    if (queryResult) {
      addToSession(sessionId, body.message, queryResult);
    }

    // 5. Construire la réponse
    const response: ChatMessageResponse = {
      message: responseMessage,
      entities: {
        query: entities.query,
        sector: entities.sector,
        zone: entities.zone,
        period: entities.period,
        confidence: entities.confidence,
        category: entities.category,
      },
      query_result: queryResult,
      next_actions: queryResult ? [] : getNextActions({
        sector: entities.sector,
        zone: entities.zone,
      }),
      session_id: sessionId,
      // Champs additionnels pour compatibilité
      id: generateId(),
      conversation_id: sessionId,
      content: responseMessage,
      role: 'assistant',
      created_at: nowIso(),
      type: queryResult ? 'summary' : 'text',
      data: queryResult
        ? {
            search_id: generateId(),
            query: body.message,
            sector: entities.sector,
            zone: entities.zone,
            period: entities.period,
            statistics: {
              total_companies: queryResult.total_companies,
              creations: queryResult.creations,
              radiations: queryResult.radiations,
              net_change: queryResult.net_change,
              trend: queryResult.trend,
            },
            insight: generateInsight({
              sectorName: entities.sector?.name || 'Tous secteurs',
              zoneName: entities.zone?.name || 'France',
              totalCompanies: queryResult.total_companies,
              creations: queryResult.creations,
              radiations: queryResult.radiations,
              netChange: queryResult.net_change,
              trend: queryResult.trend,
            }),
            companies: queryResult.companies.map((c) => ({
              id: generateId(),
              siren: c.siren,
              name: c.name,
              sector: c.naf_code ? { id: c.naf_code, name: c.naf_code } : null,
              zone: c.commune ? { id: c.postal_code || '', name: c.commune } : null,
              date_created: null,
              is_active: true,
            })),
            actions: getNextActions({
              sector: entities.sector,
              zone: entities.zone,
            }),
          }
        : undefined,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Erreur dans chat/messages:', error);
    return NextResponse.json(
      { error: (error as Error).message || 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
