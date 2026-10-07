# B2Bmax API - Next.js Backend

Backend Next.js (App Router) pour l'application B2Bmax - Agent Conversationnel de Prospection INSEE.

Ce projet remplace le backend FastAPI Python original par des API Routes Next.js, déployables sur Vercel.

## Architecture

```
next-app/
├── app/
│   ├── api/                    # API Routes (remplacent les endpoints FastAPI)
│   │   ├── health/route.ts     # GET  /api/health
│   │   ├── sectors/
│   │   │   ├── route.ts        # GET  /api/sectors
│   │   │   └── [id]/route.ts   # GET  /api/sectors/:id
│   │   ├── zones/
│   │   │   ├── route.ts        # GET  /api/zones
│   │   │   └── [id]/route.ts   # GET  /api/zones/:id
│   │   ├── chat/
│   │   │   └── messages/route.ts  # POST /api/chat/messages
│   │   ├── searches/
│   │   │   ├── route.ts        # POST /api/searches
│   │   │   └── [id]/route.ts   # GET  /api/searches/:id
│   │   └── extract-entities/route.ts  # POST /api/extract-entities
│   │   ├── transcribe/
│   │   │   ├── route.ts        # POST /api/transcribe (batch)
│   │   │   └── stream/route.ts # POST /api/transcribe/stream (SSE)
│   ├── lib/                    # Utilitaires et logique métier
│   │   ├── types.ts            # Types TypeScript
│   │   ├── utils.ts            # Fonctions utilitaires
│   │   ├── supabase.ts         # Client Supabase
│   │   ├── data-loader.ts      # Chargement données + recherche
│   │   ├── mistral.ts          # Client Mistral AI (transcription)
│   │   └── transcription-types.ts  # Types transcription audio
│   ├── layout.tsx              # Layout racine
│   └── page.tsx                # Page d'accueil (doc API)
├── data/
│   ├── sectors.json            # Secteurs NAF de référence
│   └── zones.json              # Zones géographiques de référence
├── package.json
├── next.config.js
└── tsconfig.json
```

## Correspondance API (FastAPI → Next.js)

| Ancien endpoint (FastAPI) | Nouvel endpoint (Next.js) |
|---------------------------|---------------------------|
| `GET /v1/health` | `GET /api/health` |
| `GET /v1/sectors` | `GET /api/sectors` |
| `GET /v1/sectors/{id}` | `GET /api/sectors/[id]` |
| `GET /v1/zones` | `GET /api/zones` |
| `GET /v1/zones/{id}` | `GET /api/zones/[id]` |
| `POST /v1/chat/messages` | `POST /api/chat/messages` |
| `POST /v1/searches` | `POST /api/searches` |
| `GET /v1/searches/{id}` | `GET /api/searches/[id]` |
| `POST /v1/extract-entities` | `POST /api/extract-entities` |

## Installation

```bash
cd next-app
npm install
```

## Configuration

Créer un fichier `.env.local` :

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-or-service-key
```

## Développement

```bash
npm run dev
```

L'API est accessible sur `http://localhost:3000`

## Déploiement sur Vercel

```bash
# Installer Vercel CLI
npm i -g vercel

# Déployer
vercel
```

Ou connecter le dépôt GitHub à Vercel pour un déploiement automatique.

### Variables d'environnement Vercel

Dans les paramètres du projet Vercel, ajouter :
- `SUPABASE_URL`
- `SUPABASE_KEY`
- `MISTRAL_API_KEY` (pour la transcription audio)

## Exemples d'utilisation

### Chat

```bash
curl -X POST https://your-app.vercel.app/api/chat/messages \
  -H "Content-Type: application/json" \
  -d '{"message": "Quelles sont les PME du numérique en Bretagne ?"}'
```

### Recherche

```bash
curl -X POST https://your-app.vercel.app/api/searches \
  -H "Content-Type: application/json" \
  -d '{"sector_id": "J", "zone_id": "BRE", "limit": 10}'
```

### Extraction d'entités

```bash
curl -X POST https://your-app.vercel.app/api/extract-entities \
  -H "Content-Type: application/json" \
  -d '{"message": "PME restauration à Lyon"}'
```

### Health check

```bash
curl https://your-app.vercel.app/api/health
```

### Transcription audio (batch)

```bash
curl -X POST https://your-app.vercel.app/api/transcribe \
  -F "file=@audio.mp3" \
  -F "language=fr" \
  -F "timestamp_granularities=segment"
```

Transcription depuis une URL :

```bash
curl -X POST https://your-app.vercel.app/api/transcribe \
  -H "Content-Type: application/json" \
  -d '{"file_url": "https://example.com/audio.mp3", "language": "fr"}'
```

### Transcription audio (streaming SSE)

```bash
curl -X POST https://your-app.vercel.app/api/transcribe/stream \
  -F "file=@audio.webm" \
  -F "language=fr" \
  --no-buffer
```

Exemple client JavaScript pour le streaming :

```javascript
const formData = new FormData();
formData.append('file', audioBlob, 'audio.webm');
formData.append('language', 'fr');

const response = await fetch('/api/transcribe/stream', {
  method: 'POST',
  body: formData,
});

const reader = response.body.getReader();
const decoder = new TextDecoder();

while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  
  const events = decoder.decode(value).split('\n\n');
  for (const event of events) {
    if (event.startsWith('data: ')) {
      const data = JSON.parse(event.slice(6));
      console.log(data);
      // { type: 'started', model: 'voxtral-mini-latest' }
      // { type: 'delta', text: 'Bonjour...' }
      // { type: 'segment', segment: { start: 0, end: 2.5, text: '...' } }
      // { type: 'done', full_text: '...', usage: {...} }
    }
  }
}
```

## Transcription audio (Mistral Voxtral)

Deux endpoints sont disponibles pour la transcription speech-to-text :

| Endpoint | Méthode | Description |
|----------|---------|-------------|
| `/api/transcribe` | POST | Transcription batch (retourne JSON complet) |
| `/api/transcribe/stream` | POST | Transcription streaming (retourne SSE) |

### Modèles supportés

| Modèle | Usage |
|--------|-------|
| `voxtral-mini-latest` | Batch (défaut) - qualité optimale |
| `voxtral-mini-2507` | Batch - version épinglée |
| `voxtral-mini-transcribe-realtime-2602` | Temps réel (WebSocket, non exposé ici) |

### Paramètres

| Paramètre | Type | Description |
|-----------|------|-------------|
| `file` | File | Fichier audio (mp3, wav, m4a, ogg, flac, webm) |
| `file_url` | string | URL du fichier audio (alternative à `file`) |
| `model` | string | Modèle Voxtral à utiliser |
| `language` | string | Code langue ISO 639-1 (ex: `fr`, `en`) |
| `timestamp_granularities` | string[] | `segment` et/ou `word` pour les timestamps |
| `diarize` | boolean | Activer la séparation des speakers |
| `custom_terms` | string[] | Termes personnalisés (jusqu'à 100) |

### Événements SSE (streaming)

| Type | Payload | Description |
|------|---------|-------------|
| `started` | `{ model }` | Début de la transcription |
| `delta` | `{ text, segment_index? }` | Fragment de texte |
| `segment` | `{ segment: { start, end, text, speaker?, words? } }` | Segment complet |
| `done` | `{ full_text, usage? }` | Transcription terminée |
| `error` | `{ message }` | Erreur |

## Différences avec le backend FastAPI

| Aspect | FastAPI (Python) | Next.js (TypeScript) |
|--------|-----------------|----------------------|
| Client Supabase | `psycopg2` (PostgreSQL direct) | `@supabase/supabase-js` (REST API) |
| Chargement données | CSV local + mémoire | Supabase + cache JSON local |
| Sessions | En mémoire (dict Python) | En mémoire (Map JS) |
| Déploiement | Serveur dédié (Railway/Render) | Vercel (serverless) |
| CORS | Middleware FastAPI | Headers Next.js natifs |

## Limitations MVP1

- Les sessions de chat sont en mémoire (perdues au redémarrage)
- Les recherches ne sont pas persistées (GET /api/searches/:id retourne des données mockées)
- L'extraction d'entités utilise des règles simples (pas d'appel à Mistral AI)
- Les radiations sont estimées (ratio de 10%)
