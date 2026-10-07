# Quickstart - B2Bmax

**Feature**: B2Bmax - Agent Conversationnel de Prospection INSEE  
**Date**: 2026-10-07  
**Version**: 1.0

---

## Aperçu

Ce guide vous permet de valider rapidement que l'application B2Bmax fonctionne correctement en testant les scénarios principaux end-to-end.

---

## Prérequis

### Environnement de Développement

- **Node.js**: 18+ (pour le frontend Next.js)
- **Python**: 3.10+ (pour le backend FastAPI)
- **Docker**: Optionnel (pour Celery/Redis)
- **Git**: Pour cloner les repositories

### Comptes et Clés API

- **Supabase**: Projet créé (https://supabase.com/)
  - URL du projet
  - Clé anonyme (anon key)
  - Clé de service (service key)
- **Mistral AI**: Clé API (https://console.mistral.ai/)
- **SendGrid**: Clé API (optionnelle, pour les emails)
- **INSEE API**: Clé API Sirius (optionnelle, pour les données réelles)

### Structure du Projet

```
b2bmax/
├── frontend/          # Application Next.js
│   ├── src/
│   │   ├── app/
│   │   │   ├── (auth)/      # Pages d'authentification
│   │   │   ├── (chat)/      # Interface de chat
│   │   │   ├── (agents)/    # Gestion des agents
│   │   │   ├── (subscriptions)/ # Gestion des abonnements
│   │   │   └── layout.tsx
│   │   ├── components/
│   │   │   ├── Chat/
│   │   │   ├── Agents/
│   │   │   └── UI/
│   │   └── lib/
│   │       ├── supabase.ts
│   │       ├── mistral.ts
│   │       └── utils.ts
│   └── package.json
│
├── backend/           # API FastAPI
│   ├── app/
│   │   ├── api/
│   │   │   ├── v1/
│   │   │   │   ├── __init__.py
│   │   │   │   ├── auth.py
│   │   │   │   ├── chat.py
│   │   │   │   ├── searches.py
│   │   │   │   ├── agents.py
│   │   │   │   ├── subscriptions.py
│   │   │   │   ├── notifications.py
│   │   │   │   └── companies.py
│   │   ├── core/
│   │   │   ├── config.py
│   │   │   ├── database.py
│   │   │   └── security.py
│   │   ├── models/
│   │   ├── services/
│   │   │   ├── insee.py
│   │   │   ├── mistral.py
│   │   │   └── email.py
│   │   └── tasks/
│   │       ├── __init__.py
│   │       ├── reports.py
│   │       └── prospeting.py
│   ├── main.py
│   ├── requirements.txt
│   └── Dockerfile
│
├── data/              # Données statiques
│   ├── sectors.json
│   ├── zones.json
│   └── mock_insee.json
│
└── docker-compose.yml # Pour Celery/Redis
```

---

## Setup Initial

### 1. Cloner le Repository

```bash
git clone <b2bmax-repo-url>
cd b2bmax
```

### 2. Configurer le Backend

```bash
cd backend

# Créer l'environnement virtuel
python -m venv venv
source venv/bin/activate  # Linux/Mac
# venv\Scripts\activate  # Windows

# Installer les dépendances
pip install -r requirements.txt

# Créer le fichier .env
cp .env.example .env
```

**Contenu de .env**:
```env
# Supabase
SUPABASE_URL=your_supabase_project_url
SUPABASE_KEY=your_supabase_anon_key
SUPABASE_SERVICE_KEY=your_supabase_service_key

# Mistral
MISTRAL_API_KEY=your_mistral_api_key

# JWT
SECRET_KEY=your_jwt_secret_key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60

# SendGrid (optionnel)
SENDGRID_API_KEY=your_sendgrid_api_key
SENDGRID_FROM_EMAIL=noreply@b2bmax.com

# INSEE API (optionnel)
INSEE_API_KEY=your_insee_api_key

# Celery/Redis
CELERY_BROKER_URL=redis://localhost:6379/0
CELERY_RESULT_BACKEND=redis://localhost:6379/0

# App
DEBUG=True
```

### 3. Configurer le Frontend

```bash
cd ../frontend

# Installer les dépendances
npm install

# Créer le fichier .env.local
cp .env.local.example .env.local
```

**Contenu de .env.local**:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Configurer Supabase

1. Créer un projet Supabase: https://supabase.com/dashboard
2. Configurer la base de données avec le schéma de [data-model.md](./data-model.md)
3. Activer l'authentification (Email/Password)
4. Configurer Row-Level Security (RLS)
5. Créer un bucket Storage pour les rapports

### 5. Configurer Celery/Redis (Optionnel)

```bash
# Démarrer Redis avec Docker
docker run -d -p 6379:6379 --name b2bmax-redis redis:alpine

# Démarrer Celery (dans le backend)
celery -A app.tasks worker --loglevel=info

# Démarrer Celery Beat (pour les tâches planifiées)
celery -A app.tasks beat --loglevel=info
```

---

## Validation des Scénarios

### Scénario 1: Recherche Basique + Synthèse

**Objectif**: Valider que l'utilisateur peut poser une question et recevoir une synthèse.

#### Étapes:

1. **Démarrer les services**:
   ```bash
   # Terminal 1: Backend
   cd backend
   uvicorn main:app --reload --port 8000
   
   # Terminal 2: Frontend
   cd ../frontend
   npm run dev
   ```

2. **Ouvrir l'application**: http://localhost:3000

3. **Poser une question**:
   - Dans l'interface de chat, taper: "Quelles sont les PME en Bretagne dans le secteur du numérique ?"
   - Appuyer sur Entrée

4. **Vérifier les résultats**:
   - [ ] L'agent comprend la requête (secteur: Numérique, zone: Bretagne)
   - [ ] Une synthèse avec chiffres clés est affichée
   - [ ] Les indicateurs suivants sont présents:
     - Nombre total d'entreprises
     - Nombre de créations
     - Nombre de radiations
     - Variation nette
     - Tendance (croissance/déclin/stable)
   - [ ] Une synthèse en langage naturel est générée

5. **Vérifier les logs**:
   - Backend: `GET /companies` ou requête similaire
   - Backend: Appel à Mistral pour la génération de la synthèse
   - Frontend: Réception des données et affichage

#### Commande cURL pour tester directement l'API:

```bash
# Créer une recherche
curl -X POST http://localhost:8000/v1/searches \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "query": "PME numérique Bretagne",
    "period_start": "2025-10-07",
    "period_end": "2026-10-07"
  }'

# Obtenir les résultats
curl -X GET http://localhost:8000/v1/searches/{search_id} \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

### Scénario 2: Chat en Temps Réel

**Objectif**: Valider l'interface de chat en temps réel.

#### Étapes:

1. Ouvrir deux fenêtres de navigateur (ou deux appareils)
2. Se connecter avec le même compte dans les deux fenêtres
3. Dans la fenêtre 1, envoyer un message
4. **Vérifier**:
   - [ ] Le message apparaît immédiatement dans les deux fenêtres
   - [ ] La réponse de l'assistant apparaît dans les deux fenêtres
   - [ ] Les messages sont affichés dans l'ordre
   - [ ] Les ancien messages sont chargés au défilement

#### Test des Server-Sent Events (SSE):

```bash
# Écouter les événements d'une conversation
curl -N -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:8000/v1/chat/events?conversation_id={conversation_id}
```

---

### Scénario 3: Création d'un Agent de Prospection

**Objectif**: Valider la création et la gestion d'un agent de prospection.

#### Étapes:

1. Effectuer une recherche (comme dans le Scénario 1)
2. Dans la synthèse affichée, cliquer sur "Créer un agent de prospection"
3. **Vérifier**:
   - [ ] Un formulaire de configuration s'affiche
   - [ ] Les champs suivants sont présents:
     - Nom de l'agent
     - Message à envoyer
     - Canal de communication (email/LinkedIn)
     - Fréquence d'envoi
     - Objectif
   - [ ] Les valeurs par défaut sont raisonnables
4. Remplir le formulaire et soumettre
5. **Vérifier**:
   - [ ] L'agent est créé avec succès
   - [ ] Une confirmation est affichée
   - [ ] L'agent apparaît dans la liste des agents
6. Activer l'agent
7. **Vérifier**:
   - [ ] Le statut de l'agent passe à "active"
   - [ ] Les contacts commencent à être créés (en mock ou réel)

#### Commande cURL:

```bash
# Créer un agent
curl -X POST http://localhost:8000/v1/agents \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "Agent Test Numérique",
    "description": "Test de prospection",
    "config": {
      "target": {
        "sector_ids": ["sector_uuid"],
        "zone_ids": ["zone_uuid"]
      },
      "message": {
        "template": "Bonjour {company_name}, nous sommes B2Bmax..."
      },
      "channel": "email",
      "frequency": {
        "type": "immediate",
        "max_per_day": 5
      },
      "objective": "appointment"
    }
  }'

# Lister les agents
curl -X GET http://localhost:8000/v1/agents \
  -H "Authorization: Bearer YOUR_TOKEN"

# Activer un agent
curl -X POST http://localhost:8000/v1/agents/{agent_id}/activate \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

### Scénario 4: Abonnement aux Rapports

**Objectif**: Valider la création d'un abonnement aux rapports.

#### Étapes:

1. Effectuer une recherche (Scénario 1)
2. Dans la synthèse, cliquer sur "Recevoir un rapport hebdomadaire"
3. **Vérifier**:
   - [ ] Un formulaire de configuration s'affiche
   - [ ] Les champs suivants sont présents:
     - Nom de l'abonnement
     - Fréquence (hebdomadaire, mensuelle, etc.)
     - Contenu (métriques à inclure)
     - Format (email, PDF)
     - Destinataires
4. Remplir le formulaire et soumettre
5. **Vérifier**:
   - [ ] L'abonnement est créé
   - [ ] Une confirmation est affichée
   - [ ] L'abonnement apparaît dans la liste
6. (Optionnel) Forcer la génération d'un rapport manuellement
7. **Vérifier**:
   - [ ] Le rapport est généré
   - [ ] Le rapport est envoyé au destinataire

#### Commande cURL:

```bash
# Créer un abonnement
curl -X POST http://localhost:8000/v1/subscriptions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "Rapport Hebdo Test",
    "frequency": "weekly",
    "content": {
      "sectors": ["sector_uuid"],
      "zones": ["zone_uuid"],
      "metrics": ["total_companies", "creations", "net_change"],
      "include_top_companies": true
    },
    "format": "email",
    "recipients": [{"email": "test@example.com", "name": "Test User"}]
  }'

# Lister les abonnements
curl -X GET http://localhost:8000/v1/subscriptions \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

### Scénario 5: Suivi des Nouvelles Entreprises

**Objectif**: Valider le suivi des nouvelles créations d'entreprises.

#### Étapes:

1. Effectuer une recherche (Scénario 1)
2. Dans la synthèse, cliquer sur "Suivre la création de nouvelles entreprises"
3. **Vérifier**:
   - [ ] Un formulaire de configuration s'affiche
   - [ ] Les champs suivants sont présents:
     - Périmètre (secteur/zone)
     - Filtres supplémentaires
     - Canaux de notification (in-app, email)
4. Remplir le formulaire et soumettre
5. **Vérifier**:
   - [ ] Le suivi est activé
   - [ ] Une confirmation est affichée
6. (Optionnel) Simuler une nouvelle entreprise via l'API
7. **Vérifier**:
   - [ ] Une notification est reçue
   - [ ] La notification apparaît dans l'interface
   - [ ] La notification contient les bonnes informations

#### Commande cURL:

```bash
# Activer le suivi (simplifié)
curl -X POST http://localhost:8000/v1/notifications/follow \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "sector_id": "sector_uuid",
    "zone_id": "zone_uuid",
    "notification_channels": ["in_app", "email"]
  }'

# Lister les notifications
curl -X GET http://localhost:8000/v1/notifications \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

### Scénario 6: Authentification

**Objectif**: Valider le système d'authentification.

#### Étapes:

1. **Inscription**:
   ```bash
   curl -X POST http://localhost:8000/v1/auth/register \
     -H "Content-Type: application/json" \
     -d '{
       "email": "test@example.com",
       "password": "SecurePassword123!",
       "full_name": "Test User",
       "company_name": "Test Company"
     }'
   ```
   - [ ] L'utilisateur est créé
   - [ ] Un token JWT est retourné

2. **Connexion**:
   ```bash
   curl -X POST http://localhost:8000/v1/auth/login \
     -H "Content-Type: application/json" \
     -d '{
       "email": "test@example.com",
       "password": "SecurePassword123!"
     }'
   ```
   - [ ] Un token JWT valide est retourné

3. **Obtenir le profil**:
   ```bash
   curl -X GET http://localhost:8000/v1/auth/me \
     -H "Authorization: Bearer YOUR_TOKEN"
   ```
   - [ ] Les informations de l'utilisateur sont retournées

4. **Accès non autorisé**:
   ```bash
   curl -X GET http://localhost:8000/v1/agents \
     -H "Authorization: Bearer INVALID_TOKEN"
   ```
   - [ ] Une erreur 401 est retournée

---

## Tests Automatiques

### Backend Tests

```bash
cd backend

# Installer pytest
pip install pytest pytest-asyncio httpx

# Exécuter les tests
pytest tests/ -v
```

**Exemple de test (tests/test_chat.py)**:
```python
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_chat_message():
    # Login first
    response = client.post("/v1/auth/login", json={
        "email": "test@example.com",
        "password": "testpassword"
    })
    token = response.json()["token"]
    
    # Send chat message
    response = client.post(
        "/v1/chat/messages",
        json={"message": "PME numérique Bretagne"},
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 201
    data = response.json()
    assert "id" in data
    assert data["role"] == "user"
```

### Frontend Tests

```bash
cd frontend

# Installer Jest et Testing Library
npm install --save-dev @testing-library/react @testing-library/jest-dom jest

# Exécuter les tests
npm test
```

**Exemple de test (src/components/Chat/MessageInput.test.tsx)**:
```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import MessageInput from './MessageInput';

describe('MessageInput', () => {
  it('calls onSend when form is submitted', () => {
    const mockSend = jest.fn();
    render(<MessageInput onSend={mockSend} />);
    
    const input = screen.getByPlaceholderText(/Type a message.../i);
    fireEvent.change(input, { target: { value: 'Hello' } });
    fireEvent.submit(screen.getByRole('form'));
    
    expect(mockSend).toHaveBeenCalledWith('Hello');
  });
});
```

---

## Validation des Données

### 1. Vérifier les Données INSEE

```bash
# Vérifier que les données sont chargées
curl -X GET http://localhost:8000/v1/companies \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"limit": 10}'
```
- [ ] Les entreprises sont retournées
- [ ] Les champs requis sont présents

### 2. Vérifier les Secteurs et Zones

```bash
# Lister les secteurs
curl -X GET http://localhost:8000/v1/sectors \
  -H "Authorization: Bearer YOUR_TOKEN"

# Lister les zones
curl -X GET http://localhost:8000/v1/zones \
  -H "Authorization: Bearer YOUR_TOKEN"
```
- [ ] Les secteurs sont disponibles
- [ ] Les zones sont disponibles

---

## Monitoring et Logs

### Backend Logs

```bash
# Démarrer le backend avec logs détaillés
uvicorn main:app --reload --log-level debug
```

**Points à vérifier**:
- [ ] Les requêtes API sont loguées
- [ ] Les erreurs sont capturées
- [ ] Les appels à Mistral sont traçables
- [ ] Les appels à l'API INSEE sont traçables

### Frontend Logs

Ouvrir la console du navigateur (F12) et vérifier:
- [ ] Les appels API sont visibles
- [ ] Les erreurs sont affichées
- [ ] Les événements WebSocket/SSE sont traçables

---

## Checklist de Validation

### ✅ Fonctionnalités de Base

- [ ] L'application démarre sans erreur
- [ ] L'interface de chat est accessible
- [ ] Les messages sont envoyés et reçus
- [ ] Les synthèses sont générées correctement
- [ ] Les actions suivantes sont proposées

### ✅ Chat

- [ ] Messages utilisateur affichés
- [ ] Réponses assistant affichées
- [ ] Synthèses avec chiffres clés
- [ ] Temps de réponse < 5 secondes
- [ ] Gestion des erreurs

### ✅ Agents de Prospection

- [ ] Création d'agent
- [ ] Configuration de l'agent
- [ ] Activation de l'agent
- [ ] Liste des agents
- [ ] Suivi des contacts

### ✅ Abonnements

- [ ] Création d'abonnement
- [ ] Configuration de l'abonnement
- [ ] Génération de rapport (manuelle)
- [ ] Liste des abonnements

### ✅ Notifications

- [ ] Activation du suivi
- [ ] Réception des notifications
- [ ] Liste des notifications
- [ ] Marquage comme lue

### ✅ Authentification

- [ ] Inscription
- [ ] Connexion
- [ ] Déconnexion
- [ ] Protection des routes
- [ ] Gestion du profil

### ✅ Performance

- [ ] Temps de réponse API < 1s (95% des cas)
- [ ] Temps de chargement frontend < 2s
- [ ] Pas de fuites mémoire

---

## Résolution des Problèmes

### Problèmes Courants

#### 1. Erreur de Connection à Supabase

**Symptôme**: `Connection refused` ou `Failed to fetch`

**Solution**:
- Vérifier que l'URL de Supabase est correcte
- Vérifier que le projet Supabase est en cours d'exécution
- Vérifier les CORS dans Supabase (ajouter `http://localhost:3000`)

#### 2. Erreur Mistral API

**Symptôme**: `Invalid API key` ou `Rate limit exceeded`

**Solution**:
- Vérifier que la clé API Mistral est valide
- Vérifier le solde du compte Mistral
- Utiliser un modèle plus petit (mistral-small)

#### 3. CORS Errors

**Symptôme**: `CORS policy blocked`

**Solution**:
- Configurer les CORS dans le backend FastAPI:
  ```python
  from fastapi.middleware.cors import CORSMiddleware
  
  app.add_middleware(
      CORSMiddleware,
      allow_origins=["http://localhost:3000", "https://b2bmax.com"],
      allow_credentials=True,
      allow_methods=["*"],
      allow_headers=["*"],
  )
  ```

#### 4. Erreurs de Database

**Symptôme**: `Relation does not exist` ou `Column not found`

**Solution**:
- Vérifier que le schéma de la base correspond à [data-model.md](./data-model.md)
- Exécuter les migrations si nécessaire
- Vérifier les noms des tables/colonnes

---

## Environnement de Production

### Déploiement

1. **Frontend (Vercel)**:
   ```bash
   # Installer Vercel CLI
   npm install -g vercel
   
   # Déployer
   vercel --prod
   ```

2. **Backend (Railway)**:
   ```bash
   # Installer Railway CLI
   npm install -g @railway/cli
   
   # Déployer
   railway up
   ```

3. **Base de données (Supabase)**:
   - Déjà hébergée, juste configurer les variables d'environnement

### Configuration Production

**Variables d'environnement production**:
```env
# Backend
DEBUG=False
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_KEY=your_production_anon_key
SUPABASE_SERVICE_KEY=your_production_service_key
MISTRAL_API_KEY=your_production_mistral_key
SECRET_KEY=your_production_jwt_secret
SENDGRID_API_KEY=your_production_sendgrid_key

# Frontend
NEXT_PUBLIC_API_URL=https://api.b2bmax.com
NEXT_PUBLIC_APP_URL=https://b2bmax.com
```

---

## Ressources Supplémentaires

- [Documentation API REST](./contracts/api-rest.md)
- [Contrat Interface Chat](./contracts/chat-interface.md)
- [Modèle de Données](./data-model.md)
- [Spécification Complète](./spec.md)
- [Plan d'Implémentation](./plan.md)

---

## Historique

| Date | Auteur | Changement |
|------|--------|------------|
| 2026-10-07 | Mistral Vibe | Création initiale du quickstart |
