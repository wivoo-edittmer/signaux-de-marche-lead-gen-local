# Contrat Interface Chat - B2Bmax

**Feature**: B2Bmax - Agent Conversationnel de Prospection INSEE  
**Date**: 2026-10-07  
**Version**: 1.0

---

## Aperçu

L'interface de chat de B2Bmax permet une interaction conversationnelle en temps réel entre les utilisateurs et l'agent virtuel. Elle prend en charge:
- Les messages en langage naturel
- La génération de synthèses basées sur les données INSEE
- La proposition d'actions suivantes
- La création et gestion des agents de prospection

---

## Flux de Conversation

```
┌─────────────────────────────────────────────────────────────┐
│                    FLUX PRINCIPAL                                │
├─────────────────────────────────────────────────────────────┤
│                                                                  │
│  Utilisateur                          Agent                       │
│    │                                   │                         │
│    │─► Message en NL               █─► Analyse               │
│    │   (ex: "PME numérique Bretagne")  │   de la requête          │
│    │                                   │                         │
│    │◄─ Questions de clarification     │   (si ambigu)             │
│    │   (si nécessaire)                │                         │
│    │                                   │                         │
│    │◄─ Synthèse avec chiffres clés   █─► Requête INSEE          │
│    │   (ex: total, créations,        │   + Génération           │
│    │    radiations, net change)      │   synthèse Mistral        │
│    │                                   │                         │
│    │◄─ Proposition d'actions         █─► Préparation            │
│    │   (3 options)                    │   des choix               │
│    │                                   │                         │
│    │─► Sélection d'une action       █─► Exécution              │
│    │   (ex: créer agent)             │   de l'action             │
│    │                                   │                         │
│    │◄─ Confirmation/Suivi            █─► Retour résultat         │
│    │                                   │                         │
└─────────────────────────────────────────────────────────────┘
```

---

## Types de Messages

### 1. Message Utilisateur

**Structure**:
```typescript
interface UserMessage {
  id: string;              // UUID unique
  conversation_id: string; // UUID de la conversation
  content: string;         // Texte du message
  role: 'user';
  created_at: string;      // ISO 8601
  metadata?: {
    intent?: string;       // Intent détecté (optionnel)
    entities?: {
      sector?: string;
      zone?: string;
      period?: string;
    };
  };
}
```

**Exemple**:
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "conversation_id": "550e8400-e29b-41d4-a716-446655440001",
  "content": "Quelles sont les PME en Bretagne dans le secteur du numérique ?",
  "role": "user",
  "created_at": "2026-10-07T10:00:00Z",
  "metadata": {
    "intent": "search",
    "entities": {
      "sector": "numérique",
      "zone": "Bretagne",
      "period": "12 derniers mois"
    }
  }
}
```

---

### 2. Message Assistant (Texte)

**Structure**:
```typescript
interface AssistantTextMessage {
  id: string;
  conversation_id: string;
  content: string;
  role: 'assistant';
  created_at: string;
  metadata?: {
    model?: string;        // Modèle Mistral utilisé
    tokens?: number;       // Nombre de tokens générés
    sources?: string[];    // Sources utilisées (INSEE, etc.)
    confidence?: number;   // Confiance (0-1)
  };
}
```

---

### 3. Message Synthèse

**Structure**:
```typescript
interface SummaryMessage {
  id: string;
  conversation_id: string;
  role: 'assistant';
  type: 'summary';
  data: {
    search_id: string;
    query: string;
    sector: {
      id: string;
      name: string;
      naf_code?: string;
    };
    zone: {
      id: string;
      name: string;
      level: string;
    };
    period: {
      start: string;
      end: string;
    };
    statistics: {
      total_companies: number;
      creations: number;
      radiations: number;
      net_change: number;
      trend: 'growth' | 'decline' | 'stable';
    };
    insight: string;
    subsectors?: Array<{
      id: string;
      name: string;
      companies: number;
      creations: number;
      radiations: number;
      net_change: number;
    }>;
    top_companies?: Array<{
      id: string;
      name: string;
      siren: string;
      address: string;
      date_created: string;
    }>;
    actions: Action[];
  };
  created_at: string;
}
```

**Exemple**:
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440002",
  "conversation_id": "550e8400-e29b-41d4-a716-446655440001",
  "role": "assistant",
  "type": "summary",
  "data": {
    "search_id": "550e8400-e29b-41d4-a716-446655440003",
    "query": "PME numérique Bretagne",
    "sector": {
      "id": "sector_uuid",
      "name": "Numérique",
      "naf_code": "J"
    },
    "zone": {
      "id": "zone_uuid",
      "name": "Bretagne",
      "level": "region"
    },
    "period": {
      "start": "2025-10-07",
      "end": "2026-10-07"
    },
    "statistics": {
      "total_companies": 1523,
      "creations": 245,
      "radiations": 180,
      "net_change": 65,
      "trend": "growth"
    },
    "insight": "Le marché du numérique en Bretagne est en forte croissance avec +65 entreprises nettes sur les 12 derniers mois. Cette dynamique est tirée par les créations de startups dans le développement logiciel et les services web. Opportunité majeure pour les prestataires de solutions digitales.",
    "subsectors": [
      {
        "id": "subsector_1",
        "name": "Développement logiciel",
        "companies": 450,
        "creations": 89,
        "radiations": 34,
        "net_change": 55
      },
      {
        "id": "subsector_2",
        "name": "Services web",
        "companies": 380,
        "creations": 67,
        "radiations": 28,
        "net_change": 39
      }
    ],
    "top_companies": [
      {
        "id": "company_1",
        "name": "TechBretagne",
        "siren": "123456789",
        "address": "10 Rue de Rennes, 35000 Rennes",
        "date_created": "2026-09-15"
      }
    ],
    "actions": [
      {
        "type": "report",
        "label": "Recevoir un rapport hebdomadaire",
        "description": "Je peux vous envoyer un rapport hebdomadaire avec les dernières tendances pour ce secteur et cette zone.",
        "icon": "📊",
        "payload": {
          "frequency": "weekly",
          "sector_id": "sector_uuid",
          "zone_id": "zone_uuid"
        }
      },
      {
        "type": "agent",
        "label": "Créer un agent de prospection",
        "description": "Créer un agent automatisé qui contactera chacune de ces 1523 entreprises avec un message personnalisé.",
        "icon": "🤖",
        "payload": {
          "sector_id": "sector_uuid",
          "zone_id": "zone_uuid",
          "company_count": 1523
        }
      },
      {
        "type": "follow",
        "label": "Suivre les nouvelles entreprises",
        "description": "Recevoir une notification chaque fois qu'une nouvelle entreprise est créée dans ce secteur et cette zone.",
        "icon": "🔔",
        "payload": {
          "sector_id": "sector_uuid",
          "zone_id": "zone_uuid"
        }
      }
    ]
  },
  "created_at": "2026-10-07T10:00:05Z"
}
```

---

### 4. Message Action

**Structure**:
```typescript
interface ActionMessage {
  id: string;
  conversation_id: string;
  role: 'assistant';
  type: 'action_request';
  data: {
    action_type: 'report' | 'agent' | 'follow';
    title: string;
    message: string;
    form: FormDefinition;
  };
  created_at: string;
}
```

**FormDefinition**:
```typescript
interface FormDefinition {
  fields: Array<{
    name: string;
    type: 'text' | 'select' | 'multiselect' | 'number' | 'date' | 'boolean';
    label: string;
    description?: string;
    required: boolean;
    default?: any;
    options?: Array<{ value: string; label: string }>;
    placeholder?: string;
    validation?: {
      min?: number;
      max?: number;
      pattern?: string;
    };
  }>;
  submit_label: string;
}
```

**Exemple (Création d'agent)**:
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440004",
  "conversation_id": "550e8400-e29b-41d4-a716-446655440001",
  "role": "assistant",
  "type": "action_request",
  "data": {
    "action_type": "agent",
    "title": "Configuration de l'agent de prospection",
    "message": "Pour créer votre agent de prospection, veuillez compléter les informations suivantes:",
    "form": {
      "fields": [
        {
          "name": "agent_name",
          "type": "text",
          "label": "Nom de l'agent",
          "required": true,
          "placeholder": "Ex: Agent Numérique Bretagne",
          "default": "Agent Prospection - Numérique Bretagne"
        },
        {
          "name": "message_template",
          "type": "text",
          "label": "Message à envoyer",
          "description": "Utilisez {company_name} pour le nom de l'entreprise, {my_company} pour votre entreprise",
          "required": true,
          "placeholder": "Bonjour {company_name}, je représente {my_company}...",
          "default": "Bonjour {company_name},\n\nJe représente {my_company} et nous aidons les entreprises comme la vôtre à optimiser leur présence digitale.\n\nSeriez-vous intéressé par une démonstration gratuite ?\n\nCordialement"
        },
        {
          "name": "channel",
          "type": "select",
          "label": "Canal de communication",
          "required": true,
          "options": [
            { "value": "email", "label": "Email" },
            { "value": "linkedin", "label": "LinkedIn" }
          ],
          "default": "email"
        },
        {
          "name": "max_per_day",
          "type": "number",
          "label": "Nombre max de contacts par jour",
          "required": true,
          "default": 10,
          "validation": { "min": 1, "max": 100 }
        }
      ],
      "submit_label": "Créer l'agent"
    }
  },
  "created_at": "2026-10-07T10:00:10Z"
}
```

---

### 5. Message de Confirmation

**Structure**:
```typescript
interface ConfirmationMessage {
  id: string;
  conversation_id: string;
  role: 'assistant';
  type: 'confirmation';
  data: {
    action_type: string;
    resource_id: string;
    resource_type: string;
    message: string;
    details?: any;
  };
  created_at: string;
}
```

**Exemple**:
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440005",
  "conversation_id": "550e8400-e29b-41d4-a716-446655440001",
  "role": "assistant",
  "type": "confirmation",
  "data": {
    "action_type": "agent",
    "resource_id": "agent_uuid",
    "resource_type": "agent",
    "message": "✅ Votre agent de prospection a été créé avec succès !",
    "details": {
      "name": "Agent Numérique Bretagne",
      "target_count": 1523,
      "status": "draft",
      "next_steps": [
        "Configurez le message de prospection",
        "Activez l'agent pour commencer"
      ]
    }
  },
  "created_at": "2026-10-07T10:00:15Z"
}
```

---

### 6. Message d'Erreur

**Structure**:
```typescript
interface ErrorMessage {
  id: string;
  conversation_id: string;
  role: 'assistant';
  type: 'error';
  data: {
    code: string;
    message: string;
    details?: any;
    suggestions?: string[];
  };
  created_at: string;
}
```

**Exemple**:
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440006",
  "conversation_id": "550e8400-e29b-41d4-a716-446655440001",
  "role": "assistant",
  "type": "error",
  "data": {
    "code": "AMBIGUOUS_QUERY",
    "message": "Votre demande est un peu vague. Pourriez-vous préciser :",
    "details": {
      "missing": ["sector", "zone"]
    },
    "suggestions": [
      "Précisez un secteur d'activité",
      "Ajoutez une zone géographique",
      "Exemple: 'PME du numérique en Bretagne'"
    ]
  },
  "created_at": "2026-10-07T10:00:02Z"
}
```

---

## Actions Disponibles

### 1. Action: Report (Rapport)

**Description**: Créer un abonnement aux rapports périodiques.

**Payload**:
```json
{
  "action_type": "report",
  "frequency": "weekly" | "biweekly" | "monthly",
  "sector_id": "uuid",
  "zone_id": "uuid",
  "period_start": "YYYY-MM-DD",
  "period_end": "YYYY-MM-DD",
  "metrics": ["total_companies", "creations", "radiations", "net_change"],
  "include_top_companies": true,
  "format": "email" | "pdf",
  "recipients": [{"email": "user@example.com", "name": "User"}]
}
```

**Flux**:
1. Utilisateur sélectionne l'action
2. Agent affiche un formulaire de configuration
3. Utilisateur soumet le formulaire
4. Abonnement est créé
5. Confirmation affichée

---

### 2. Action: Agent (Agent de Prospection)

**Description**: Créer un agent de prospection.

**Payload**:
```json
{
  "action_type": "agent",
  "name": "string",
  "sector_id": "uuid",
  "zone_id": "uuid",
  "company_ids": ["uuid", ...],  // optionnel
  "size_filter": ["micro", "small", "medium", "large"],
  "date_range": {"start": "YYYY-MM-DD", "end": "YYYY-MM-DD"},
  "message_template": "string",
  "channel": "email" | "linkedin",
  "frequency": {"type": "immediate" | "daily" | "weekly", "max_per_day": number},
  "objective": "appointment" | "demo" | "documentation"
}
```

**Flux**:
1. Utilisateur sélectionne l'action
2. Agent affiche un formulaire de configuration
3. Utilisateur configure l'agent
4. Agent est créé en statut 'draft'
5. Utilisateur peut activer l'agent
6. Agent commence la prospection

---

### 3. Action: Follow (Suivi)

**Description**: Suivre les nouvelles créations d'entreprises.

**Payload**:
```json
{
  "action_type": "follow",
  "sector_id": "uuid",
  "zone_id": "uuid",
  "filters": {
    "size": ["micro", "small", ...],
    "min_revenue": number
  },
  "notification_channels": ["in_app", "email"],
  "notification_frequency": "immediate" | "daily_digest"
}
```

**Flux**:
1. Utilisateur sélectionne l'action
2. Agent affiche un formulaire de configuration
3. Utilisateur configure le suivi
4. Suivi est activé
5. Notifications sont envoyées selon la configuration

---

## States de Conversation

```typescript
type ConversationStatus = 
  | 'active'      // Conversation en cours
  | 'waiting'     // Attente de réponse utilisateur
  | 'processing'  // Traitement d'une requête
  | 'archived'    // Archivée
  | 'deleted';    // Supprimée
```

---

## Événements en Temps Réel

### Server-Sent Events (SSE)

**Endpoint**: `/api/chat/events?conversation_id={id}`

**Événements**:

```json
// Nouveau message
{
  "type": "message",
  "data": { "message": Message }
}

// Synthèse générée
{
  "type": "summary",
  "data": { "summary": SummaryMessage }
}

// Action requise
{
  "type": "action_required",
  "data": { "action": ActionMessage }
}

// Confirmation
{
  "type": "confirmation",
  "data": { "confirmation": ConfirmationMessage }
}

// Erreur
{
  "type": "error",
  "data": { "error": ErrorMessage }
}

// Statut de traitement
{
  "type": "status",
  "data": {
    "status": "processing" | "complete" | "error",
    "progress": 0.0-1.0,
    "message": "string"
  }
}
```

---

### WebSocket

**Alternative à SSE**, WebSocket peut être utilisé pour une communication bidirectionnelle.

**Messages**:

```json
// Client → Server
{
  "type": "send_message",
  "data": { "conversation_id": "uuid", "content": "string" }
}

// Server → Client
{
  "type": "new_message",
  "data": { "message": Message }
}
```

---

## Intégration avec le Backend

### Endpoints Backend

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| POST | `/api/chat/messages` | Envoyer un message |
| GET | `/api/chat/conversations` | Lister les conversations |
| GET | `/api/chat/conversations/{id}` | Obtenir une conversation |
| POST | `/api/chat/conversations/{id}/messages` | Ajouter un message à une conversation |
| GET | `/api/chat/events` | Stream des événements (SSE) |

---

## Composants Frontend

### 1. ChatContainer

```typescript
interface ChatContainerProps {
  conversationId?: string;  // Si absent, crée une nouvelle conversation
  onClose?: () => void;
}
```

### 2. MessageList

```typescript
interface MessageListProps {
  messages: (UserMessage | AssistantTextMessage | SummaryMessage | ActionMessage | ConfirmationMessage | ErrorMessage)[];
  isLoading: boolean;
}
```

### 3. MessageInput

```typescript
interface MessageInputProps {
  onSend: (content: string) => void;
  disabled: boolean;
  placeholder?: string;
}
```

### 4. SummaryView

```typescript
interface SummaryViewProps {
  summary: SummaryMessage['data'];
  onActionSelect: (action: Action) => void;
}
```

### 5. ActionForm

```typescript
interface ActionFormProps {
  action: ActionMessage['data'];
  onSubmit: (values: Record<string, any>) => void;
  onCancel: () => void;
}
```

---

## Styles et UX

### Typographie

- **Messages utilisateur**: Bulle à droite, couleur bleue
- **Messages assistant**: Bulle à gauche, couleur grise
- **Synthèses**: Carte avec fond clair, bordure
- **Actions**: Boutons avec icônes, style cardi

### Animations

- Messages apparaissent avec un fade-in
- Indicateur de saisie (typing dots) quand l'assistant génère une réponse
- Squelettes de chargement pour les synthèses

### Accessibilité

- Navigation au clavier complète
- Lecteur d'écran compatible
- Contraste suffisant (WCAG AA)

---

## Exemples de Conversations

### Exemple 1: Recherche Simple

```
User: Quelles sont les PME en Bretagne dans le secteur du numérique ?

Assistant: (typing...)

Assistant [Summary]:
- Secteur: Numérique (Code NAF: J)
- Zone: Bretagne
- Période: 12 derniers mois (2025-10-07 à 2026-10-07)

Statistiques:
- Total: 1523 entreprises
- Créations: 245
- Radiations: 180
- Variation nette: +65
- Tendance: 📈 Croissance

Synthèse: Le marché du numérique en Bretagne est en forte croissance...

Prochaines actions:
[📊 Rapport hebdomadaire] [🤖 Créer un agent] [🔔 Suivre les nouvelles]

User: [clique sur "Créer un agent"]

Assistant [ActionRequest]:
Création d'agent de prospection

Nom: Agent Numérique Bretagne
Cible: 1523 entreprises
Message: [template par défaut]
Canal: Email
Fréquence: 10/jour

[Formulaire de configuration]

User: [remplit le formulaire et soumet]

Assistant [Confirmation]:
✅ Votre agent "Agent Numérique Bretagne" a été créé !
- Statut: Brouillon
- Cible: 1523 entreprises
- Prochaine étape: Activez l'agent pour commencer
```

---

### Exemple 2: Requête Imprécise

```
User: Comment va le marché ?

Assistant [Error]:
Votre demande est trop vague. Pourriez-vous préciser:
- De quel secteur parlez-vous ?
- Dans quelle zone géographique ?
- Quelle période souhaitez-vous analyser ?

Suggestions:
- "PME du numérique en Bretagne"
- "Restauration à Lyon ce trimestre"
- "Nouvelles entreprises en Île-de-France"

User: PME du numérique en Bretagne

Assistant [Summary]: [synthèse complète]
```

---

## Historique

| Date | Auteur | Changement |
|------|--------|------------|
| 2026-10-07 | Mistral Vibe | Création initiale du contrat d'interface chat |
