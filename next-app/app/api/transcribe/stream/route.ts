// POST /api/transcribe/stream - Transcription audio avec streaming SSE
//
// Reçoit un fichier audio et retourne la transcription en streaming
// via Server-Sent Events (SSE).
//
// Le client reçoit les événements suivants:
//   - {"type":"started","model":"..."}     : début de la transcription
//   - {"type":"delta","text":"..."}        : fragment de texte (si disponible)
//   - {"type":"segment","segment":{...}}   : segment complet avec timestamps
//   - {"type":"done","full_text":"..."}    : transcription terminée
//   - {"type":"error","message":"..."}     : erreur
//
// Paramètres (multipart/form-data):
//   - file: fichier audio (requis)
//   - model: modèle Voxtral (défaut: "voxtral-mini-latest")
//   - language: code langue ISO 639-1
//   - timestamp_granularities: "segment" et/ou "word"
//   - diarize: "true" pour la diarisation
//
// Exemple client JavaScript:
//   const formData = new FormData();
//   formData.append('file', audioBlob, 'audio.webm');
//   formData.append('language', 'fr');
//
//   const response = await fetch('/api/transcribe/stream', {
//     method: 'POST',
//     body: formData,
//   });
//
//   const reader = response.body.getReader();
//   const decoder = new TextDecoder();
//
//   while (true) {
//     const { done, value } = await reader.read();
//     if (done) break;
//     const events = decoder.decode(value).split('\n\n');
//     for (const event of events) {
//       if (event.startsWith('data: ')) {
//         const data = JSON.parse(event.slice(6));
//         console.log(data);
//       }
//     }
//   }

import { transcribeAudio, isMistralConfigured, TRANSCRIPTION_MODELS } from '@/lib/mistral';
import type { TranscriptionStreamEvent, TranscriptionSegment } from '@/lib/transcription-types';

export const dynamic = 'force-dynamic';
export const maxDuration = 300; // 5 minutes max

/**
 * Crée un ReadableStream SSE à partir d'un générateur d'événements
 */
function createSSEStream(
  generator: AsyncGenerator<TranscriptionStreamEvent>
): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();

  return new ReadableStream({
    async start(controller) {
      try {
        for await (const event of generator) {
          const data = `data: ${JSON.stringify(event)}\n\n`;
          controller.enqueue(encoder.encode(data));
        }
      } catch (error) {
        const errorEvent: TranscriptionStreamEvent = {
          type: 'error',
          message: (error as Error).message,
        };
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(errorEvent)}\n\n`));
      } finally {
        controller.close();
      }
    },
  });
}

/**
 * Génère les événements SSE à partir du résultat de transcription Mistral
 */
async function* generateTranscriptionEvents(params: {
  file: Blob;
  model?: string;
  language?: string;
  timestampGranularities?: ('segment' | 'word')[];
  diarize?: boolean;
  customTerms?: string[];
}): AsyncGenerator<TranscriptionStreamEvent> {
  const model = params.model || TRANSCRIPTION_MODELS.BATCH;

  // Événement de démarrage
  yield { type: 'started', model };

  try {
    // Appeler l'API Mistral
    const result = (await transcribeAudio({
      file: params.file,
      model: params.model,
      language: params.language,
      timestampGranularities: params.timestampGranularities,
      diarize: params.diarize,
      customTerms: params.customTerms,
    })) as {
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
    };

    // Si on a des segments, les émettre un par un
    if (result.segments && result.segments.length > 0) {
      for (let i = 0; i < result.segments.length; i++) {
        const seg = result.segments[i];
        const segment: TranscriptionSegment = {
          start: seg.start,
          end: seg.end,
          text: seg.text,
          speaker: seg.speaker,
          words: seg.words,
        };

        // Émettre le segment
        yield { type: 'segment', segment };

        // Émettre aussi un delta pour le texte du segment
        yield { type: 'delta', text: seg.text, segment_index: i };
      }
    } else {
      // Pas de segments, émettre le texte complet comme un seul delta
      // Découper en mots pour simuler un streaming
      const words = result.text.split(/(\s+)/);
      let accumulated = '';
      for (const word of words) {
        accumulated += word;
        yield { type: 'delta', text: word };
      }
    }

    // Événement de fin
    yield {
      type: 'done',
      full_text: result.text,
      usage: result.usage,
    };
  } catch (error) {
    yield {
      type: 'error',
      message: (error as Error).message,
    };
  }
}

export async function POST(request: Request): Promise<Response> {
  // Vérifier la configuration
  if (!isMistralConfigured()) {
    const errorEvent: TranscriptionStreamEvent = {
      type: 'error',
      message: 'Service de transcription non configuré. MISTRAL_API_KEY est requis.',
    };
    const encoder = new TextEncoder();
    return new Response(`data: ${JSON.stringify(errorEvent)}\n\n`, {
      status: 503,
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  }

  try {
    const contentType = request.headers.get('content-type') || '';

    if (!contentType.includes('multipart/form-data')) {
      const errorEvent: TranscriptionStreamEvent = {
        type: 'error',
        message: 'Content-Type multipart/form-data requis pour le streaming',
      };
      return new Response(`data: ${JSON.stringify(errorEvent)}\n\n`, {
        status: 400,
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      });
    }

    const formData = await request.formData();

    const fileEntry = formData.get('file');
    if (!(fileEntry instanceof File)) {
      const errorEvent: TranscriptionStreamEvent = {
        type: 'error',
        message: 'Fichier audio requis (champ "file")',
      };
      return new Response(`data: ${JSON.stringify(errorEvent)}\n\n`, {
        status: 400,
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      });
    }

    const model = formData.get('model') as string | null || undefined;
    const language = formData.get('language') as string | null || undefined;
    const diarize = formData.get('diarize') === 'true' ? true : undefined;

    const granularities = formData.getAll('timestamp_granularities');
    const timestampGranularities =
      granularities.length > 0 ? (granularities as ('segment' | 'word')[]) : undefined;

    const terms = formData.getAll('custom_terms');
    const customTerms = terms.length > 0 ? (terms as string[]) : undefined;

    // Créer le stream SSE
    const stream = createSSEStream(
      generateTranscriptionEvents({
        file: fileEntry,
        model,
        language,
        timestampGranularities,
        diarize,
        customTerms,
      })
    );

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
        'X-Accel-Buffering': 'no', // Désactiver le buffering nginx
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    console.error('Erreur transcription stream:', error);
    const errorEvent: TranscriptionStreamEvent = {
      type: 'error',
      message: (error as Error).message,
    };
    return new Response(`data: ${JSON.stringify(errorEvent)}\n\n`, {
      status: 500,
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  }
}

// OPTIONS pour CORS preflight
export async function OPTIONS(): Promise<Response> {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
