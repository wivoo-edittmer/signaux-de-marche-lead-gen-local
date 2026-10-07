// Types pour la transcription audio Mistral (Voxtral)

// ============================================================
// Requêtes
// ============================================================

export interface TranscriptionRequest {
  /** Fichier audio (multipart/form-data) ou URL */
  file?: File | Blob;
  file_url?: string;
  /** Modèle Voxtral à utiliser */
  model?: string;
  /** Langue de l'audio (code ISO 639-1, ex: "fr", "en") */
  language?: string;
  /** Granularité des timestamps: "segment" ou "word" */
  timestamp_granularities?: ('segment' | 'word')[];
  /** Activer la diarisation (séparation des speakers) */
  diarize?: boolean;
  /** Termes personnalisés pour améliorer la reconnaissance (jusqu'à 100) */
  custom_terms?: string[];
}

// ============================================================
// Réponses
// ============================================================

export interface TranscriptionSegment {
  start: number;
  end: number;
  text: string;
  speaker?: string;
  words?: TranscriptionWord[];
}

export interface TranscriptionWord {
  word: string;
  start: number;
  end: number;
  speaker?: string;
}

export interface TranscriptionResponse {
  /** Texte complet transcrit */
  text: string;
  /** Modèle utilisé */
  model: string;
  /** Langue détectée */
  language?: string;
  /** Durée de l'audio en secondes */
  duration?: number;
  /** Segments avec timestamps */
  segments?: TranscriptionSegment[];
  /** Utilisation (tokens) */
  usage?: {
    prompt_tokens?: number;
    completion_tokens?: number;
    total_tokens?: number;
  };
}

// ============================================================
// Streaming (SSE)
// ============================================================

export type TranscriptionStreamEvent =
  | { type: 'started'; model: string }
  | { type: 'delta'; text: string; segment_index?: number }
  | { type: 'segment'; segment: TranscriptionSegment }
  | { type: 'done'; full_text: string; usage?: TranscriptionResponse['usage'] }
  | { type: 'error'; message: string };

// ============================================================
// Erreurs
// ============================================================

export interface TranscriptionError {
  error: string;
  detail?: string;
  status: number;
}
