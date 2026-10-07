// POST /api/transcribe - Transcription audio batch (offline)
//
// Reçoit un fichier audio (multipart/form-data) et retourne la transcription
// via l'API Mistral Voxtral.
//
// Paramètres (multipart/form-data):
//   - file: fichier audio (requis) - mp3, wav, m4a, ogg, flac, webm
//   - model: modèle Voxtral (défaut: "voxtral-mini-latest")
//   - language: code langue ISO 639-1 (ex: "fr", "en") - auto-détection si omis
//   - timestamp_granularities: "segment" et/ou "word" pour les timestamps
//   - diarize: "true" pour activer la séparation des speakers
//   - custom_terms: termes personnalisés (jusqu'à 100)
//
// Alternative: envoyer file_url à la place de file pour transcrire depuis une URL.
//
// Exemple:
//   curl -X POST http://localhost:3000/api/transcribe \
//     -F "file=@audio.mp3" \
//     -F "language=fr" \
//     -F "timestamp_granularities=segment"

import { NextResponse } from 'next/server';
import { transcribeAudio, isMistralConfigured } from '@/lib/mistral';
import { corsResponse, corsErrorResponse, handleCorsOptions } from '@/lib/utils';
import type { TranscriptionResponse, TranscriptionError } from '@/lib/transcription-types';

export const dynamic = 'force-dynamic';
// Augmenter la limite de taille pour les fichiers audio (50 MB)
export const maxDuration = 300; // 5 minutes max

export async function OPTIONS(request: Request): Promise<NextResponse> {
  return handleCorsOptions(request);
}

export async function POST(
  request: Request
): Promise<NextResponse<TranscriptionResponse | TranscriptionError>> {
  // Vérifier la configuration
  if (!isMistralConfigured()) {
    return corsErrorResponse(
      'Service de transcription non configuré',
      503,
      'La variable d\'environnement MISTRAL_API_KEY est requise',
      request
    );
  }

  try {
    const contentType = request.headers.get('content-type') || '';

    let file: Blob | undefined;
    let fileUrl: string | undefined;
    let model: string | undefined;
    let language: string | undefined;
    let timestampGranularities: ('segment' | 'word')[] | undefined;
    let diarize: boolean | undefined;
    let customTerms: string[] | undefined;

    if (contentType.includes('multipart/form-data')) {
      // Upload de fichier via multipart
      const formData = await request.formData();

      const fileEntry = formData.get('file');
      if (fileEntry instanceof File) {
        file = fileEntry;
      }

      fileUrl = formData.get('file_url') as string | null || undefined;
      model = formData.get('model') as string | null || undefined;
      language = formData.get('language') as string | null || undefined;
      diarize = formData.get('diarize') === 'true' ? true : undefined;

      // timestamp_granularities peut être multiple
      const granularities = formData.getAll('timestamp_granularities');
      if (granularities.length > 0) {
        timestampGranularities = granularities as ('segment' | 'word')[];
      }

      // custom_terms peut être multiple
      const terms = formData.getAll('custom_terms');
      if (terms.length > 0) {
        customTerms = terms as string[];
      }
    } else if (contentType.includes('application/json')) {
      // Transcription depuis une URL via JSON
      const body = await request.json();
      fileUrl = body.file_url;
      model = body.model;
      language = body.language;
      timestampGranularities = body.timestamp_granularities;
      diarize = body.diarize;
      customTerms = body.custom_terms;
    } else {
      return corsErrorResponse(
        'Content-Type non supporté',
        400,
        'Utilisez multipart/form-data (upload fichier) ou application/json (file_url)',
        request
      );
    }

    // Validation
    if (!file && !fileUrl) {
      return corsErrorResponse(
        'Fichier audio requis',
        400,
        'Envoyez un fichier via "file" (multipart) ou une URL via "file_url" (JSON)',
        request
      );
    }

    // Appeler l'API Mistral
    const result = await transcribeAudio({
      file,
      fileUrl,
      model,
      language,
      timestampGranularities,
      diarize,
      customTerms,
    });

    return corsResponse(result as TranscriptionResponse, 200, request);
  } catch (error) {
    console.error('Erreur transcription:', error);
    const message = (error as Error).message;

    // Déterminer le code d'erreur approprié
    let status = 500;
    if (message.includes('401') || message.includes('403')) {
      status = 502; // Erreur d'authentification upstream
    } else if (message.includes('400') || message.includes('requis')) {
      status = 400;
    } else if (message.includes('MISTRAL_API_KEY')) {
      status = 503;
    }

    return corsErrorResponse('Erreur de transcription', status, message, request);
  }
}
