// Utilitaires pour l'API B2Bmax Next.js

import { NextResponse } from 'next/server';
import type { ApiError, NextAction } from './types';

/**
 * Crée une réponse JSON standardisée
 */
export function jsonResponse<T>(data: T, status = 200): NextResponse<T> {
  return NextResponse.json(data, { status });
}

/**
 * Crée une réponse d'erreur standardisée
 */
export function errorResponse(
  message: string,
  status = 500,
  detail?: string
): NextResponse<ApiError> {
  return NextResponse.json(
    {
      error: message,
      detail: detail || message,
      status,
    },
    { status }
  );
}

/**
 * Génère un UUID v4
 */
export function generateId(): string {
  return crypto.randomUUID();
}

/**
 * Retourne la date actuelle au format ISO
 */
export function nowIso(): string {
  return new Date().toISOString();
}

/**
 * Génère les prochaines actions suggérées selon les entités extraites
 */
export function getNextActions(entities: {
  sector?: { id: string; name: string; naf_code: string } | null;
  zone?: { id: string; name: string; code: string } | null;
}): NextAction[] {
  const sectorName = entities.sector?.name || '';
  const zoneName = entities.zone?.name || '';
  const target = sectorName || zoneName || 'cette recherche';

  return [
    {
      type: 'report',
      title: 'Générer un rapport détaillé',
      description: `Créer un rapport complet sur ${target}`,
      action: '/reports/generate',
      label: 'Recevoir un rapport hebdomadaire',
      icon: '📊',
    },
    {
      type: 'agent',
      title: 'Lancer un agent de prospection',
      description: zoneName
        ? `Prospecter les entreprises en ${zoneName}`
        : 'Automatiser la prospection des entreprises trouvées',
      action: '/agents/create',
      label: 'Créer un agent de prospection',
      icon: '🤖',
    },
    {
      type: 'followup',
      title: 'Suivre cette recherche',
      description: 'Recevoir des notifications sur les mises à jour',
      action: '/searches/subscribe',
      label: 'Suivre les nouvelles entreprises',
      icon: '🔔',
    },
  ];
}

/**
 * Génère une synthèse en langage naturel (mock sans Mistral API)
 */
export function generateInsight(params: {
  sectorName: string;
  zoneName: string;
  totalCompanies: number;
  creations: number;
  radiations: number;
  netChange: number;
  trend: string;
}): string {
  const { sectorName, zoneName, totalCompanies, creations, radiations, netChange, trend } = params;
  const location = zoneName || 'France';

  if (trend === 'growth') {
    return (
      `Le marché ${sectorName} à ${location} est en croissance ` +
      `nette de +${netChange} entreprises. ` +
      `Avec ${creations} nouvelles créations et ${radiations} radiations, ` +
      `ce secteur montre une dynamique positive. ` +
      `Opportunité: ${totalCompanies} entreprises actives à contacter.`
    );
  } else if (trend === 'decline') {
    return (
      `Le marché ${sectorName} à ${location} est en déclin ` +
      `avec ${netChange} entreprises en moins. ` +
      `Les radiations (${radiations}) dépassent les créations (${creations}). ` +
      `Attention: secteur en difficulté avec ${totalCompanies} entreprises.`
    );
  } else {
    return (
      `Le marché ${sectorName} à ${location} est stable ` +
      `avec un solde net de ${netChange} entreprises. ` +
      `Équilibre entre créations (${creations}) et radiations (${radiations}). ` +
      `Secteur mature avec ${totalCompanies} entreprises.`
    );
  }
}

/**
 * Génère une réponse conversationnelle à partir des entités et du résultat
 */
export function generateChatResponse(
  entities: {
    sector?: { id: string; name: string; naf_code: string } | null;
    zone?: { id: string; name: string; code: string } | null;
    confidence: number;
  },
  queryResult?: {
    sector?: { id: string; name: string; naf_code: string } | null;
    zone?: { id: string; name: string; code: string } | null;
    total_companies: number;
    creations: number;
    radiations: number;
    net_change: number;
    trend: string;
    companies: unknown[];
    next_actions: unknown[];
  } | null
): string {
  if (!queryResult) {
    if (entities.confidence < 0.5) {
      return (
        "Votre requête est trop vague. Pouvez-vous préciser le secteur ou la zone géographique ? " +
        "Par exemple : 'PME du numérique en Bretagne' ou 'restauration à Lyon'"
      );
    }
    return "Je n'ai pas trouvé de données pour cette requête. Essayez une recherche plus spécifique.";
  }

  const parts: string[] = [];

  if (queryResult.sector) {
    const sectorName = queryResult.sector.name || queryResult.sector.id || 'ce secteur';
    parts.push(`secteur **${sectorName}**`);
  }

  if (queryResult.zone) {
    const zoneName = queryResult.zone.name || queryResult.zone.id || 'cette zone';
    parts.push(`zone **${zoneName}**`);
  }

  parts.push(`j'ai trouvé **${queryResult.total_companies}** entreprises correspondantes`);

  if (queryResult.creations > 0) {
    parts.push(`avec **${queryResult.creations}** créations estimées`);
  }

  if (queryResult.net_change !== 0) {
    const sign = queryResult.net_change > 0 ? '+' : '';
    parts.push(
      `et un changement net de **${sign}${queryResult.net_change}** (tendance : ${queryResult.trend})`
    );
  }

  if (queryResult.companies && queryResult.companies.length > 0) {
    const pmeCount = queryResult.companies.filter(
      (c: any) => c.category === 'PME'
    ).length;
    if (pmeCount > 0) {
      const pct = Math.round((pmeCount / queryResult.companies.length) * 100);
      parts.push(`dont environ **${pct}%** de PME`);
    }
  }

  if (queryResult.next_actions && queryResult.next_actions.length > 0) {
    parts.push('\nProchaines actions suggérées :');
    queryResult.next_actions.forEach((action: any, i: number) => {
      parts.push(`  ${i + 1}. ${action.title || action.type || 'Action'}`);
    });
  }

  return parts.join(' ');
}

/**
 * CORS - Origines autorisées
 */
const ALLOWED_ORIGINS = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:3002',
  'http://localhost:3003',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:3001',
  'http://127.0.0.1:3002',
  'http://127.0.0.1:3003',
  
];

// Ajouter les origines depuis les variables d'environnement
if (process.env.ALLOWED_ORIGINS) {
  ALLOWED_ORIGINS.push(...process.env.ALLOWED_ORIGINS.split(',').map((o) => o.trim()));
}

/**
 * Retourne les headers CORS pour une requête donnée
 * Si l'origine est autorisée, retourne cette origine, sinon retourne la première origine autorisée
 */
export function getCorsHeaders(request?: Request): Record<string, string> {
  const origin = request?.headers.get('origin') || '';
  const isAllowed = ALLOWED_ORIGINS.includes(origin) ||
    (process.env.NODE_ENV === 'production' && origin.endsWith('.vercel.app'));

  return {
    'Access-Control-Allow-Origin': isAllowed ? origin : ALLOWED_ORIGINS[0],
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With, Accept, Origin',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Max-Age': '86400',
  };
}

/**
 * Crée une réponse avec les headers CORS
 */
export function corsResponse<T>(data: T, status = 200, request?: Request): NextResponse<T> {
  return NextResponse.json(data, {
    status,
    headers: getCorsHeaders(request),
  });
}

/**
 * Crée une réponse d'erreur avec les headers CORS
 */
export function corsErrorResponse(
  message: string,
  status = 500,
  detail?: string,
  request?: Request
): NextResponse<ApiError> {
  return NextResponse.json(
    {
      error: message,
      detail: detail || message,
      status,
    },
    {
      status,
      headers: getCorsHeaders(request),
    }
  );
}

/**
 * Gère les requêtes OPTIONS (preflight CORS)
 */
export function handleCorsOptions(request: Request): NextResponse {
  return new NextResponse(null, {
    status: 204,
    headers: getCorsHeaders(request),
  });
}

/**
 * Anciennes fonctions pour compatibilité (deprecated)
 * @deprecated Utiliser getCorsHeaders, corsResponse, corsErrorResponse, handleCorsOptions
 */
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

/**
 * @deprecated Utiliser handleCorsOptions(request)
 */
export function handleOptions(): NextResponse {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}
