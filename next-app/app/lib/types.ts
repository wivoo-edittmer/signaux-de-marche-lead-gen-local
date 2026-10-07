// Types pour l'API B2Bmax - Next.js
// Correspondance avec les modèles Pydantic du backend FastAPI original

// ============================================================
// Entités de référence
// ============================================================

export interface Sector {
  id: string;
  naf_code: string;
  name: string;
  description?: string;
  level: number;
  parent_id?: string | null;
}

export interface Zone {
  id: string;
  code: string;
  name: string;
  level: string; // 'region' | 'department' | 'commune'
  parent_id?: string | null;
  insee_code?: string | null;
}

// ============================================================
// Entreprise
// ============================================================

export interface Company {
  siren: string;
  name: string;
  legal_form?: string | null;
  date_created?: string | null;
  date_radiated?: string | null;
  sector_id?: string | null;
  naf_code?: string | null;
  zone_id?: string | null;
  commune?: string | null;
  postal_code?: string | null;
  address?: string | null;
  size?: string | null;
  category?: string | null;
  is_active: boolean;
}

export interface CompanySummary {
  siren: string;
  name: string;
  naf_code?: string | null;
  commune?: string | null;
  postal_code?: string | null;
  size?: string | null;
  category?: string | null;
}

// ============================================================
// Recherche et statistiques
// ============================================================

export interface SearchStatistics {
  total_companies: number;
  creations: number;
  radiations: number;
  net_change: number;
  trend: 'growth' | 'decline' | 'stable';
}

export interface QueryResult {
  query: string;
  sector?: {
    id: string;
    name: string;
    naf_code: string;
  } | null;
  zone?: {
    id: string;
    name: string;
    code: string;
    level?: string;
  } | null;
  total_companies: number;
  creations: number;
  radiations: number;
  net_change: number;
  trend: string;
  companies: CompanySummary[];
  next_actions: NextAction[];
  confidence?: number;
}

export interface NextAction {
  type: 'report' | 'agent' | 'followup' | 'follow';
  title: string;
  description: string;
  action: string;
  label?: string;
  icon?: string;
}

// ============================================================
// Requêtes API
// ============================================================

export interface ChatMessageRequest {
  message: string;
  session_id?: string;
  conversation_id?: string;
}

export interface ChatMessageResponse {
  message: string;
  entities: ExtractedEntities;
  query_result?: QueryResult | null;
  next_actions: NextAction[];
  session_id?: string;
  // Champs additionnels pour compatibilité avec l'ancien format
  id?: string;
  conversation_id?: string;
  content?: string;
  role?: 'user' | 'assistant';
  created_at?: string;
  type?: 'text' | 'summary' | 'action' | 'error';
  data?: Record<string, unknown>;
}

export interface SearchRequest {
  query?: string;
  sector_id?: string;
  zone_id?: string;
  naf_code?: string;
  date_from?: string;
  date_to?: string;
  period_start?: string;
  period_end?: string;
  category?: string;
  size?: string;
  is_active?: boolean;
  limit?: number;
}

export interface SearchResponse {
  id: string;
  query?: string;
  sector_id?: string;
  sector_name?: string;
  zone_id?: string;
  zone_name?: string;
  period_start?: string;
  period_end?: string;
  statistics: SearchStatistics;
  companies: CompanySummary[];
  insight?: string;
  actions: NextAction[];
  created_at: string;
  status: string;
}

// ============================================================
// Extraction d'entités
// ============================================================

export interface ExtractedEntities {
  query: string;
  sector?: {
    id: string;
    name: string;
    naf_code: string;
  } | null;
  zone?: {
    id: string;
    name: string;
    code: string;
    level?: string;
  } | null;
  period: string;
  confidence: number;
  category?: string | null;
}

// ============================================================
// Health check
// ============================================================

export interface HealthResponse {
  status: string;
  timestamp: string;
  version: string;
  database: {
    status: string;
    connection?: string;
    error?: string;
  };
  data_loader?: {
    loaded: boolean;
    companies_count: number;
    sectors_count: number;
    zones_count: number;
  };
}

// ============================================================
// Utilitaires
// ============================================================

export interface ApiError {
  error: string;
  detail?: string;
  status: number;
}
