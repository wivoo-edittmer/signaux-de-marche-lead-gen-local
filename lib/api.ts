// Client API pour appeler le backend B2Bmax Next.js
// Remplace les appels mockés et l'ancienne route /api/ask locale

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';

// ============================================================
// Types (correspondance avec le backend next-app)
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
  level: string;
  parent_id?: string | null;
  insee_code?: string | null;
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

export interface SearchStatistics {
  total_companies: number;
  creations: number;
  radiations: number;
  net_change: number;
  trend: 'growth' | 'decline' | 'stable';
}

export interface NextAction {
  type: string;
  title: string;
  description: string;
  action: string;
  label?: string;
  icon?: string;
}

export interface QueryResult {
  query: string;
  sector?: { id: string; name: string; naf_code: string } | null;
  zone?: { id: string; name: string; code: string; level?: string } | null;
  total_companies: number;
  creations: number;
  radiations: number;
  net_change: number;
  trend: string;
  companies: CompanySummary[];
  next_actions: NextAction[];
  confidence?: number;
}

export interface ChatMessageResponse {
  message: string;
  entities: {
    query: string;
    sector?: { id: string; name: string; naf_code: string } | null;
    zone?: { id: string; name: string; code: string; level?: string } | null;
    period: string;
    confidence: number;
    category?: string | null;
  };
  query_result?: QueryResult | null;
  next_actions: NextAction[];
  session_id?: string;
  id?: string;
  conversation_id?: string;
  content?: string;
  role?: 'user' | 'assistant';
  created_at?: string;
  type?: 'text' | 'summary' | 'action' | 'error';
  data?: Record<string, unknown>;
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

export interface HealthResponse {
  status: string;
  timestamp: string;
  version: string;
  database: { status: string; connection?: string; error?: string };
  data_loader?: {
    loaded: boolean;
    companies_count: number;
    sectors_count: number;
    zones_count: number;
  };
}

// ============================================================
// Types pour la transcription
// ============================================================

export interface TranscriptionResponse {
  text: string;
  model: string;
  language?: string;
  segments?: Array<{
    start: number;
    end: number;
    text: string;
    speaker?: string;
    words?: Array<{ word: string; start: number; end: number; speaker?: string }>;
  }>;
  usage?: {
    prompt_tokens?: number;
    completion_tokens?: number;
    total_tokens?: number;
  };
}

export type TranscriptionStreamEvent =
  | { type: 'started'; model: string }
  | { type: 'delta'; text: string; segment_index?: number }
  | { type: 'segment'; segment: { start: number; end: number; text: string; speaker?: string } }
  | { type: 'done'; full_text: string; usage?: TranscriptionResponse['usage'] }
  | { type: 'error'; message: string };

// ============================================================
// Utilitaires
// ============================================================

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || errorData.detail || `API error: ${response.status}`);
  }
  return response.json();
}

// ============================================================
// API Methods
// ============================================================

/** Vérifie la santé de l'API */
export async function getHealth(): Promise<HealthResponse> {
  const res = await fetch(`${API_BASE_URL}/api/health`);
  return handleResponse<HealthResponse>(res);
}

/** Liste tous les secteurs NAF */
export async function getSectors(): Promise<Sector[]> {
  const res = await fetch(`${API_BASE_URL}/api/sectors`);
  return handleResponse<Sector[]>(res);
}

/** Obtient un secteur par son ID */
export async function getSector(id: string): Promise<Sector> {
  const res = await fetch(`${API_BASE_URL}/api/sectors/${encodeURIComponent(id)}`);
  return handleResponse<Sector>(res);
}

/** Liste toutes les zones géographiques */
export async function getZones(): Promise<Zone[]> {
  const res = await fetch(`${API_BASE_URL}/api/zones`);
  return handleResponse<Zone[]>(res);
}

/** Obtient une zone par son ID */
export async function getZone(id: string): Promise<Zone> {
  const res = await fetch(`${API_BASE_URL}/api/zones/${encodeURIComponent(id)}`);
  return handleResponse<Zone>(res);
}

/**
 * Envoie un message dans le chat et reçoit une réponse avec analyse
 */
export async function sendChatMessage(
  message: string,
  sessionId?: string
): Promise<ChatMessageResponse> {
  const res = await fetch(`${API_BASE_URL}/api/chat/messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, session_id: sessionId }),
  });
  return handleResponse<ChatMessageResponse>(res);
}

/**
 * Effectue une recherche d'entreprises
 */
export async function searchCompanies(params: {
  query?: string;
  sector_id?: string;
  zone_id?: string;
  naf_code?: string;
  date_from?: string;
  date_to?: string;
  category?: string;
  size?: string;
  limit?: number;
}): Promise<SearchResponse> {
  const res = await fetch(`${API_BASE_URL}/api/searches`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  return handleResponse<SearchResponse>(res);
}

/**
 * Extrait les entités d'un message
 */
export async function extractEntities(message: string): Promise<{
  entities: ChatMessageResponse['entities'];
}> {
  const res = await fetch(`${API_BASE_URL}/api/extract-entities`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message }),
  });
  return handleResponse(res);
}

/**
 * Transcription audio batch (fichier complet → JSON)
 */
export async function transcribeAudio(params: {
  file: Blob;
  fileName?: string;
  language?: string;
  model?: string;
  diarize?: boolean;
}): Promise<TranscriptionResponse> {
  const formData = new FormData();
  formData.append('file', params.file, params.fileName || 'audio.webm');
  if (params.language) formData.append('language', params.language);
  if (params.model) formData.append('model', params.model);
  if (params.diarize !== undefined) formData.append('diarize', String(params.diarize));

  const res = await fetch(`${API_BASE_URL}/api/transcribe`, {
    method: 'POST',
    body: formData,
  });
  return handleResponse<TranscriptionResponse>(res);
}

/**
 * Transcription audio en streaming (SSE)
 * Retourne un AsyncGenerator d'événements
 */
export async function* transcribeAudioStream(params: {
  file: Blob;
  fileName?: string;
  language?: string;
  model?: string;
  diarize?: boolean;
}): AsyncGenerator<TranscriptionStreamEvent> {
  const formData = new FormData();
  formData.append('file', params.file, params.fileName || 'audio.webm');
  if (params.language) formData.append('language', params.language);
  if (params.model) formData.append('model', params.model);
  if (params.diarize !== undefined) formData.append('diarize', String(params.diarize));

  const res = await fetch(`${API_BASE_URL}/api/transcribe/stream`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `API error: ${res.status}`);
  }

  const reader = res.body?.getReader();
  if (!reader) throw new Error('Pas de stream reçu');

  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const events = buffer.split('\n\n');
    buffer = events.pop() || '';

    for (const event of events) {
      if (event.startsWith('data: ')) {
        const data = JSON.parse(event.slice(6));
        yield data as TranscriptionStreamEvent;
      }
    }
  }
}
