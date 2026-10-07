// Client Supabase pour Next.js API Routes
// Remplace la connexion psycopg2 du backend FastAPI original

import { createClient, SupabaseClient } from '@supabase/supabase-js';

let supabaseInstance: SupabaseClient | null = null;

/**
 * Retourne une instance singleton du client Supabase
 */
export function getSupabaseClient(): SupabaseClient {
  if (supabaseInstance) {
    return supabaseInstance;
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      'SUPABASE_URL et SUPABASE_KEY doivent être définis dans les variables d\'environnement'
    );
  }

  supabaseInstance = createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  return supabaseInstance;
}

/**
 * Réinitialise le client (utile pour les tests)
 */
export function resetSupabaseClient(): void {
  supabaseInstance = null;
}
