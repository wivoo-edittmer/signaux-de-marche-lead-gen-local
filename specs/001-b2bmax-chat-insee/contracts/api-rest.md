# Contrat API REST - B2Bmax

**Feature**: B2Bmax - Agent Conversationnel de Prospection INSEE  
**Date**: 2026-10-07  
**Version**: 1.0

---

## Aperçu

L'API REST de B2Bmax expose les fonctionnalités principales de l'application via des endpoints HTTP. Elle suit les principes REST et utilise JSON comme format de données.

**Base URL**: `https://api.b2bmax.com/v1` (production)  
**Base URL Dev**: `http://localhost:8000/v1` (développement)

---

## Authentification

Toutes les requêtes (sauf les endpoints publics) nécessitent un token JWT dans l'en-tête:

```
Authorization: Bearer <token>
```

**Obtention du token**:
- Via l'endpoint `/auth/login` (POST)
- Via Supabase Auth (si intégré)

---

## Endpoints

### 1. Authentification

#### POST /auth/register

**Description**: Inscrire un nouvel utilisateur.

**Request**:
```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "full_name": "John Doe",
  "company_name": "Acme Corp"
}
```

**Response (201 Created)**:
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "full_name": "John Doe",
  "company_name": "Acme Corp",
  "role": "user",
  "created_at": "2026-10-07T10:00:00Z",
  "token": "jwt_token"
}
```

**Erreurs**:
- 400: Email invalide ou déjà utilisé
- 400: Mot de passe trop faible

---

#### POST /auth/login

**Description**: Connecter un utilisateur.

**Request**:
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response (200 OK)**:
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "full_name": "John Doe",
  "company_name": "Acme Corp",
  "role": "user",
  "token": "jwt_token",
  "expires_in": 3600
}
```

**Erreurs**:
- 401: Identifiants invalides

---

#### GET /auth/me

**Description**: Obtenir les informations de l'utilisateur connecté.

**Response (200 OK)**:
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "full_name": "John Doe",
  "company_name": "Acme Corp",
  "role": "user",
  "preferences": {},
  "created_at": "2026-10-07T10:00:00Z"
}
```

---

### 2. Secteurs et Zones

#### GET /sectors

**Description**: Lister tous les secteurs disponibles.

**Query Parameters**:
- `level`: Filtrer par niveau (1, 2, 3)
- `parent_id`: Filtrer par secteur parent
- `q`: Recherche par nom
- `limit`: Nombre max de résultats (default: 100)
- `offset`: Décalage (default: 0)

**Response (200 OK)**:
```json
{
  "sectors": [
    {
      "id": "uuid",
      "naf_code": "56",
      "name": "Restauration",
      "description": "Activités de restauration",
      "level": 1,
      "parent_id": null
    }
  ],
  "total": 100,
  "limit": 100,
  "offset": 0
}
```

---

#### GET /sectors/{id}

**Description**: Obtenir un secteur spécifique.

**Response (200 OK)**:
```json
{
  "id": "uuid",
  "naf_code": "56",
  "name": "Restauration",
  "description": "Activités de restauration",
  "level": 1,
  "parent_id": null,
  "children": [...],
  "created_at": "2026-10-07T10:00:00Z"
}
```

---

#### GET /zones

**Description**: Lister toutes les zones géographiques.

**Query Parameters**:
- `level`: Filtrer par niveau (region, department, commune)
- `parent_id`: Filtrer par zone parente
- `q`: Recherche par nom
- `limit`: Nombre max de résultats (default: 100)
- `offset`: Décalage (default: 0)

**Response (200 OK)**:
```json
{
  "zones": [
    {
      "id": "uuid",
      "code": "69",
      "name": "Rhône",
      "level": "department",
      "parent_id": "region_uuid"
    }
  ],
  "total": 100,
  "limit": 100,
  "offset": 0
}
```

---

### 3. Recherche et Synthèse

#### POST /searches

**Description**: Effectuer une nouvelle recherche.

**Request**:
```json
{
  "query": "PME numérique Bretagne",
  "sector_id": "uuid",  // optionnel
  "zone_id": "uuid",     // optionnel
  "period_start": "2025-01-01",
  "period_end": "2025-12-31"
}
```

**Response (201 Created)**:
```json
{
  "id": "uuid",
  "user_id": "uuid",
  "query": "PME numérique Bretagne",
  "sector_id": "uuid",
  "zone_id": "uuid",
  "status": "processing",
  "created_at": "2026-10-07T10:00:00Z"
}
```

---

#### GET /searches/{id}

**Description**: Obtenir les détails d'une recherche.

**Response (200 OK)**:
```json
{
  "id": "uuid",
  "user_id": "uuid",
  "query": "PME numérique Bretagne",
  "sector": {
    "id": "uuid",
    "name": "Numérique"
  },
  "zone": {
    "id": "uuid",
    "name": "Bretagne"
  },
  "period_start": "2025-01-01",
  "period_end": "2025-12-31",
  "status": "completed",
  "summary": {
    "id": "uuid",
    "total_companies": 1523,
    "creations": 245,
    "radiations": 180,
    "net_change": 65,
    "trend": "growth",
    "insight": "Le marché du numérique en Bretagne est en forte croissance...",
    "subsectors": {...},
    "top_companies": [...]
  },
  "created_at": "2026-10-07T10:00:00Z",
  "updated_at": "2026-10-07T10:00:10Z"
}
```

---

#### GET /searches

**Description**: Lister les recherches de l'utilisateur.

**Query Parameters**:
- `status`: Filtrer par statut
- `sector_id`: Filtrer par secteur
- `zone_id`: Filtrer par zone
- `limit`: Nombre max de résultats (default: 50)
- `offset`: Décalage (default: 0)

**Response (200 OK)**:
```json
{
  "searches": [...],
  "total": 10,
  "limit": 50,
  "offset": 0
}
```

---

### 4. Agents de Prospection

#### POST /agents

**Description**: Créer un nouvel agent de prospection.

**Request**:
```json
{
  "name": "Agent Prospection Numérique Bretagne",
  "description": "Contacte les PME du numérique en Bretagne",
  "config": {
    "target": {
      "sector_ids": ["uuid1", "uuid2"],
      "zone_ids": ["uuid"],
      "size_filter": ["micro", "small"],
      "date_range": {"start": "2025-01-01", "end": "2025-10-07"}
    },
    "message": {
      "template": "Bonjour {company_name}, nous sommes {my_company}..."
    },
    "channel": "email",
    "frequency": {
      "type": "daily",
      "max_per_day": 10
    },
    "objective": "appointment"
  }
}
```

**Response (201 Created)**:
```json
{
  "id": "uuid",
  "user_id": "uuid",
  "name": "Agent Prospection Numérique Bretagne",
  "status": "draft",
  "config": {...},
  "created_at": "2026-10-07T10:00:00Z"
}
```

---

#### GET /agents/{id}

**Description**: Obtenir un agent spécifique.

**Response (200 OK)**:
```json
{
  "id": "uuid",
  "user_id": "uuid",
  "name": "Agent Prospection Numérique Bretagne",
  "description": "Contacte les PME du numérique en Bretagne",
  "status": "active",
  "config": {...},
  "statistics": {
    "total_contacts": 150,
    "sent": 145,
    "delivered": 140,
    "read": 100,
    "responded": 45,
    "converted": 20
  },
  "created_at": "2026-10-07T10:00:00Z",
  "updated_at": "2026-10-07T10:00:00Z"
}
```

---

#### PUT /agents/{id}

**Description**: Mettre à jour un agent.

**Request**:
```json
{
  "name": "Nouveau nom",
  "description": "Nouvelle description",
  "status": "active",
  "config": {...}
}
```

---

#### GET /agents

**Description**: Lister les agents de l'utilisateur.

**Query Parameters**:
- `status`: Filtrer par statut
- `limit`: Nombre max de résultats (default: 50)
- `offset`: Décalage (default: 0)

**Response (200 OK)**:
```json
{
  "agents": [...],
  "total": 10,
  "limit": 50,
  "offset": 0
}
```

---

#### POST /agents/{id}/activate

**Description**: Activer un agent.

**Response (200 OK)**:
```json
{
  "id": "uuid",
  "status": "active",
  "activated_at": "2026-10-07T10:00:00Z"
}
```

---

#### POST /agents/{id}/pause

**Description**: Mettre en pause un agent.

---

#### GET /agents/{id}/contacts

**Description**: Lister les contacts d'un agent.

**Query Parameters**:
- `status`: Filtrer par statut
- `limit`: Nombre max de résultats (default: 100)
- `offset`: Décalage (default: 0)

**Response (200 OK)**:
```json
{
  "contacts": [
    {
      "id": "uuid",
      "company": {"id": "uuid", "name": "..."},
      "status": "sent",
      "sent_at": "2026-10-07T10:00:00Z",
      "message": "...",
      "channel": "email"
    }
  ],
  "total": 145,
  "limit": 100,
  "offset": 0
}
```

---

### 5. Abonnements

#### POST /subscriptions

**Description**: Créer un nouvel abonnement.

**Request**:
```json
{
  "name": "Rapport Hebdo Numérique Bretagne",
  "frequency": "weekly",
  "content": {
    "sectors": ["uuid"],
    "zones": ["uuid"],
    "metrics": ["total_companies", "creations", "net_change"],
    "include_top_companies": true
  },
  "format": "email",
  "recipients": [{"email": "user@example.com", "name": "John"}]
}
```

**Response (201 Created)**:
```json
{
  "id": "uuid",
  "user_id": "uuid",
  "name": "Rapport Hebdo Numérique Bretagne",
  "frequency": "weekly",
  "format": "email",
  "status": "active",
  "created_at": "2026-10-07T10:00:00Z"
}
```

---

#### GET /subscriptions/{id}

**Description**: Obtenir un abonnement spécifique.

---

#### GET /subscriptions

**Description**: Lister les abonnements de l'utilisateur.

---

#### DELETE /subscriptions/{id}

**Description**: Supprimer un abonnement.

---

### 6. Notifications

#### GET /notifications

**Description**: Lister les notifications de l'utilisateur.

**Query Parameters**:
- `status`: Filtrer par statut (unread, read, archived)
- `type`: Filtrer par type
- `limit`: Nombre max de résultats (default: 50)
- `offset`: Décalage (default: 0)

**Response (200 OK)**:
```json
{
  "notifications": [
    {
      "id": "uuid",
      "type": "new_company",
      "title": "Nouvelle entreprise: TechStart",
      "content": "Une nouvelle entreprise du numérique a été créée en Bretagne...",
      "status": "unread",
      "company": {"id": "uuid", "name": "TechStart"},
      "created_at": "2026-10-07T10:00:00Z"
    }
  ],
  "total": 5,
  "limit": 50,
  "offset": 0,
  "unread_count": 3
}
```

---

#### PUT /notifications/{id}/read

**Description**: Marquer une notification comme lue.

---

#### PUT /notifications/read-all

**Description**: Marquer toutes les notifications comme lues.

---

### 7. Entreprises (Données INSEE)

#### GET /companies

**Description**: Rechercher des entreprises (avec filtres).

**Query Parameters**:
- `sector_id`: Filtrer par secteur
- `zone_id`: Filtrer par zone
- `size`: Filtrer par taille
- `date_from`: Date de création à partir de
- `date_to`: Date de création jusqu'à
- `is_active`: Filtrer par statut (true/false)
- `q`: Recherche par nom
- `limit`: Nombre max de résultats (default: 100)
- `offset`: Décalage (default: 0)

**Response (200 OK)**:
```json
{
  "companies": [
    {
      "id": "uuid",
      "siren": "123456789",
      "name": "TechCorp",
      "address": "10 Rue de Paris, 75001 Paris",
      "sector": {"id": "uuid", "name": "Numérique"},
      "zone": {"id": "uuid", "name": "Paris"},
      "date_created": "2025-01-15",
      "size": "small",
      "is_active": true
    }
  ],
  "total": 1523,
  "limit": 100,
  "offset": 0
}
```

---

#### GET /companies/{id}

**Description**: Obtenir une entreprise spécifique.

---

### 8. Chat (Converation en temps réel)

#### POST /chat/messages

**Description**: Envoyer un message dans une conversation.

**Request**:
```json
{
  "conversation_id": "uuid",  // optionnel, crée une nouvelle si absent
  "message": "Quelles sont les PME en Bretagne dans le secteur du numérique ?"
}
```

**Response (201 Created)**:
```json
{
  "id": "uuid",
  "conversation_id": "uuid",
  "content": "Quelles sont les PME en Bretagne dans le secteur du numérique ?",
  "role": "user",
  "created_at": "2026-10-07T10:00:00Z"
}
```

**Streaming Response (Server-Sent Events)**:
```json
{
  "type": "message",
  "data": {
    "id": "uuid",
    "conversation_id": "uuid",
    "content": "Analyse de votre demande...",
    "role": "assistant",
    "created_at": "2026-10-07T10:00:01Z"
  }
}
```

**Final Response (avec synthèse)**:
```json
{
  "type": "summary",
  "data": {
    "search_id": "uuid",
    "total_companies": 1523,
    "creations": 245,
    "radiations": 180,
    "net_change": 65,
    "insight": "Le marché du numérique en Bretagne est en forte croissance...",
    "actions": [
      {
        "type": "report",
        "label": "Recevoir un rapport hebdomadaire",
        "description": "Je peux vous envoyer un rapport hebdomadaire sur ces données"
      },
      {
        "type": "agent",
        "label": "Créer un agent de prospection",
        "description": "Créer un agent pour contacter chacune de ces entreprises"
      },
      {
        "type": "follow",
        "label": "Suivre les nouvelles entreprises",
        "description": "Suivre la création de nouvelles entreprises dans ce secteur"
      }
    ]
  }
}
```

---

#### GET /chat/conversations

**Description**: Lister les conversations de l'utilisateur.

---

#### GET /chat/conversations/{id}

**Description**: Obtenir une conversation avec ses messages.

---

## Webhooks

### POST /webhooks/sendgrid

**Description**: Webhook pour les événements SendGrid.

**Headers**:
```
Authorization: Bearer <webhook_secret>
Content-Type: application/json
```

**Events gérés**:
- `delivered`: Message délivré
- `open`: Message ouvert
- `click`: Lien cliqué
- `bounce`: Rebond
- `spamreport`: Signalement comme spam

---

## Rate Limiting

| Endpoint | Limite | Période |
|----------|--------|---------|
| /auth/* | 10 req | minute |
| /searches | 30 req | minute |
| /chat/messages | 60 req | minute |
| Autres | 100 req | minute |

**Réponse en cas de dépassement**:
```json
{
  "error": "Rate limit exceeded",
  "retry_after": 60
}
```

---

## Codes de Réponse

| Code | Description |
|------|-------------|
| 200 | OK - Succès |
| 201 | Created - Ressource créée |
| 204 | No Content - Succès sans contenu |
| 400 | Bad Request - Requête invalide |
| 401 | Unauthorized - Non autorisé |
| 403 | Forbidden - Accès interdit |
| 404 | Not Found - Ressource non trouvée |
| 422 | Unprocessable Entity - Validation échouée |
| 429 | Too Many Requests - Rate limit dépassé |
| 500 | Internal Server Error - Erreur serveur |

---

## Erreurs

**Format des erreurs**:
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request body",
    "details": {
      "query": "This field is required"
    }
  }
}
```

**Codes d'erreur courants**:
- `VALIDATION_ERROR`: Erreur de validation des données
- `AUTHENTICATION_ERROR`: Erreur d'authentification
- `AUTHORIZATION_ERROR`: Accès non autorisé
- `NOT_FOUND`: Ressource non trouvée
- `RATE_LIMITED`: Rate limit dépassé
- `INSEE_ERROR`: Erreur avec l'API INSEE
- `MISTRAL_ERROR`: Erreur avec Mistral AI
- `INTERNAL_ERROR`: Erreur interne

---

## Versioning

L'API utilise un versioning dans l'URL:
- `/v1/` - Version actuelle
- `/v2/` - Futures versions

**Stratégie**: Les nouvelles versions sont introduites en parallèle, avec une période de transition.

---

## Historique

| Date | Auteur | Changement |
|------|--------|------------|
| 2026-10-07 | Mistral Vibe | Création initiale du contrat API REST |
