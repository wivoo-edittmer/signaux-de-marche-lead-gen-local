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
│   ├── lib/                    # Utilitaires et logique métier
│   │   ├── types.ts            # Types TypeScript
│   │   ├── utils.ts            # Fonctions utilitaires
│   │   ├── supabase.ts         # Client Supabase
│   │   └── data-loader.ts      # Chargement données + recherche
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
