// GET /api/health - Vérification de santé de l'API
// Équivalent de GET /v1/health dans le backend FastAPI

import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';
import { loadReferenceData } from '@/lib/data-loader';
import type { HealthResponse } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET(): Promise<NextResponse<HealthResponse | { error: string }>> {
  try {
    // Vérifier la connexion à Supabase
    let dbStatus: HealthResponse['database'];
    try {
      const supabase = getSupabaseClient();
      const { error } = await supabase.from('legal_unit').select('siren', { count: 'exact', head: true });
      if (error) {
        dbStatus = { status: 'unhealthy', error: error.message };
      } else {
        dbStatus = { status: 'healthy', connection: 'ok' };
      }
    } catch (e) {
      dbStatus = { status: 'unhealthy', error: (e as Error).message };
    }

    // Charger les données de référence pour les stats
    let dataLoaderStats: HealthResponse['data_loader'];
    try {
      const { sectors, zones } = await loadReferenceData();
      dataLoaderStats = {
        loaded: true,
        companies_count: 0, // Les entreprises sont dans Supabase, pas en mémoire
        sectors_count: sectors.size,
        zones_count: zones.size,
      };
    } catch {
      dataLoaderStats = {
        loaded: false,
        companies_count: 0,
        sectors_count: 0,
        zones_count: 0,
      };
    }

    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      database: dbStatus,
      data_loader: dataLoaderStats,
    });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
