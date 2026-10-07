// Client Mistral AI pour la transcription audio (Voxtral)
// Documentation: https://docs.mistral.ai/studio/audio/speech_to_text/

const MISTRAL_API_BASE = 'https://api.mistral.ai/v1';

// Modèles disponibles
export const TRANSCRIPTION_MODELS = {
  /** Transcription batch - qualité optimale */
  BATCH: 'voxtral-mini-latest',
  /** Transcription batch - version épinglée */
  BATCH_PINNED: 'voxtral-mini-2507',
  /** Transcription temps réel (WebSocket uniquement) */
  REALTIME: 'voxtral-mini-transcribe-realtime-2602',
} as const;

export type TranscriptionModel = keyof typeof TRANSCRIPTION_MODELS;

/**
 * Récupère la clé API Mistral depuis les variables d'environnement
 */
export function getMistralApiKey(): string {
  const apiKey = process.env.MISTRAL_API_KEY;
  if (!apiKey) {
    throw new Error(
      'MISTRAL_API_KEY doit être défini dans les variables d\'environnement'
    );
  }
  return apiKey;
}

/**
 * Transcription batch d'un fichier audio via l'API Mistral
 *
 * @param params - Paramètres de transcription
 * @returns La réponse de transcription
 */
export async function transcribeAudio(params: {
  file?: Blob;
  fileUrl?: string;
  model?: string;
  language?: string;
  timestampGranularities?: ('segment' | 'word')[];
  diarize?: boolean;
  customTerms?: string[];
}): Promise<unknown> {
  const apiKey = getMistralApiKey();
  const model = params.model || TRANSCRIPTION_MODELS.BATCH;

  const formData = new FormData();
  formData.append('model', model);

  if (params.file) {
    const filename = params.file instanceof File ? params.file.name : 'audio.wav';
    formData.append('file', params.file, filename);
  } else if (params.fileUrl) {
    formData.append('file_url', params.fileUrl);
  } else {
    throw new Error('Un fichier audio ou une URL est requis');
  }

  if (params.language) {
    formData.append('language', params.language);
  }

  if (params.timestampGranularities && params.timestampGranularities.length > 0) {
    for (const granularity of params.timestampGranularities) {
      formData.append('timestamp_granularities', granularity);
    }
  }

  if (params.diarize !== undefined) {
    formData.append('diarize', String(params.diarize));
  }

  if (params.customTerms && params.customTerms.length > 0) {
    for (const term of params.customTerms) {
      formData.append('custom_terms', term);
    }
  }

  const response = await fetch(`${MISTRAL_API_BASE}/audio/transcriptions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Erreur Mistral API (${response.status}): ${errorText}`);
  }

  return response.json();
}

/**
 * Transcription batch avec streaming de la requête (upload progressif)
 * Retourne un ReadableStream de la réponse
 *
 * Note: L'API Mistral retourne la transcription complète en une fois,
 * mais on peut streamer la réponse côté client pour une meilleure UX.
 */
export async function transcribeAudioStream(params: {
  file: Blob;
  model?: string;
  language?: string;
  timestampGranularities?: ('segment' | 'word')[];
  diarize?: boolean;
  customTerms?: string[];
  /** Callback appelé à chaque chunk reçu */
  onChunk?: (chunk: string) => void;
}): Promise<ReadableStream<Uint8Array>> {
  const apiKey = getMistralApiKey();
  const model = params.model || TRANSCRIPTION_MODELS.BATCH;

  const formData = new FormData();
  formData.append('model', model);

  const filename = params.file instanceof File ? params.file.name : 'audio.wav';
  formData.append('file', params.file, filename);

  if (params.language) {
    formData.append('language', params.language);
  }

  if (params.timestampGranularities && params.timestampGranularities.length > 0) {
    for (const granularity of params.timestampGranularities) {
      formData.append('timestamp_granularities', granularity);
    }
  }

  if (params.diarize !== undefined) {
    formData.append('diarize', String(params.diarize));
  }

  if (params.customTerms && params.customTerms.length > 0) {
    for (const term of params.customTerms) {
      formData.append('custom_terms', term);
    }
  }

  const response = await fetch(`${MISTRAL_API_BASE}/audio/transcriptions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Erreur Mistral API (${response.status}): ${errorText}`);
  }

  if (!response.body) {
    throw new Error('Pas de corps de réponse reçu de Mistral');
  }

  // Lire le stream et appeler onChunk si fourni
  if (params.onChunk) {
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      params.onChunk(buffer);
    }
  }

  return response.body;
}

/**
 * Vérifie si la clé API Mistral est configurée
 */
export function isMistralConfigured(): boolean {
  return !!process.env.MISTRAL_API_KEY;
}
