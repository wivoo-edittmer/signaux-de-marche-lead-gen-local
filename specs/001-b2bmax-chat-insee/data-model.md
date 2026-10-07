# Modèle de Données - B2Bmax

**Feature**: B2Bmax - Agent Conversationnel de Prospection INSEE  
**Date**: 2026-10-07  
**Version**: 1.0

---

## Entités Principales

### Diagramme Entité-Relation

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                BASE DE DONNÉES                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌──────────────┐       ┌──────────────┐       ┌──────────────┐            │
│  │   User        │       │  Company      │       │   Sector      │            │
│  ├──────────────┤       ├──────────────┤       ├──────────────┤            │
│  │ id (PK)       │◄──────│ sector_id (FK)│──────►│ id (PK)       │            │
│  │ email         │       │ siren         │       │ naf_code     │            │
│  │ password_hash │       │ siret         │       │ name         │            │
│  │ full_name     │       │ name          │       │ description  │            │
│  │ company_name  │       │ address       │       │ parent_id (FK)│            │
│  │ role          │       │ city          │       │ created_at   │            │
│  │ created_at    │       │ postal_code   │       │ updated_at   │            │
│  │ updated_at    │       │ zone_id (FK)  │       └──────────────┘            │
│  └──────────────┘       │ date_created  │                              │
│                           │ date_radiated │                              │
│                           │ size          │       ┌──────────────┐            │
│                           │ revenue       │       │   Zone        │            │
│                           │ created_at    │──────►│ id (PK)       │            │
│                           │ updated_at    │       │ code          │            │
│                           └──────────────┘       │ name          │            │
│                                                    │ level         │            │
│       ┌──────────────┐       ┌──────────────┐    │ parent_id (FK)│            │
│       │  Conversation │       │   Message     │    │ created_at    │            │
│       ├──────────────┤       ├──────────────┤    │ updated_at    │            │
│       │ id (PK)       │◄──────│ conversation  │    └──────────────┘            │
│       │ user_id (FK)  │       │ id (PK)       │                              │
│       │ title         │◄──────│ content       │                              │
│       │ status        │       │ role          │       ┌──────────────┐    │
│       │ created_at    │       │ token_count   │       │   Search      │    │
│       │ updated_at    │       │ created_at    │       ├──────────────┤    │
│       └──────────────┘       └──────────────┘       │ id (PK)       │    │
│                                                    │ user_id (FK)  │    │
│       ┌──────────────┐       ┌──────────────┐       │ query         │    │
│       │   Agent       │       │  Contact      │       │ sector_id (FK)│    │
│       ├──────────────┤       ├──────────────┤       │ zone_id (FK)  │    │
│       │ id (PK)       │◄──────│ agent_id (FK) │       │ period_start  │    │
│       │ user_id (FK)  │       │ company_id    │       │ period_end    │    │
│       │ name          │       │ channel       │       │ created_at    │    │
│       │ description   │       │ message       │       └──────────────┘    │
│       │ status        │       │ status        │                              │
│       │ config        │       │ sent_at       │       ┌──────────────┐    │
│       │ created_at    │       │ responded_at  │       │  Summary      │    │
│       │ updated_at    │       │ converted     │       ├──────────────┤    │
│       └──────────────┘       │ created_at    │       │ id (PK)       │    │
│                           │ updated_at    │──────►│ search_id (FK)│    │
│                           └──────────────┘       │ total_companies│    │
│                                                    │ creations     │    │
│       ┌──────────────┐       ┌──────────────┐       │ radiations    │    │
│       │ Subscription  │       │ Notification  │       │ net_change    │    │
│       ├──────────────┤       ├──────────────┤       │ trend         │    │
│       │ id (PK)       │       │ id (PK)       │       │ insight       │    │
│       │ user_id (FK)  │       │ user_id (FK)  │       │ subsectors    │    │
│       │ name          │       │ type          │       │ created_at    │    │
│       │ frequency     │       │ content       │       └──────────────┘    │
│       │ content       │       │ status        │                              │
│       │ format        │       │ company_id    │                              │
│       │ recipients    │       │ created_at    │                              │
│       │ status        │       │ updated_at    │                              │
│       │ created_at    │       └──────────────┘                              │
│       │ updated_at    │                                                      │
│       └──────────────┘                                                      │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Schéma Détaillé

### 1. User (Utilisateur)

**Description**: Représente un professionnel utilisateur de B2Bmax.

| Champ | Type | Nullable | Default | Description |
|-------|------|----------|---------|-------------|
| id | UUID | NO | gen_random_uuid() | Identifiant unique |
| email | VARCHAR(255) | NO | - | Email de l'utilisateur (unique) |
| password_hash | VARCHAR(255) | YES | NULL | Hash du mot de passe |
| full_name | VARCHAR(255) | YES | NULL | Nom complet |
| company_name | VARCHAR(255) | YES | NULL | Nom de l'entreprise de l'utilisateur |
| role | VARCHAR(50) | NO | 'user' | Rôle: user, admin |
| avatar_url | VARCHAR(500) | YES | NULL | URL de l'avatar |
| preferences | JSONB | YES | '{}' | Préférences utilisateur |
| created_at | TIMESTAMPTZ | NO | NOW() | Date de création |
| updated_at | TIMESTAMPTZ | NO | NOW() | Date de mise à jour |

**Index**:
- PRIMARY KEY: id
- UNIQUE: email

**RLS (Row-Level Security)**:
- Les utilisateurs ne peuvent accéder qu'à leurs propres données

---

### 2. Sector (Secteur)

**Description**: Représente un secteur d'activité (code NAF).

| Champ | Type | Nullable | Default | Description |
|-------|------|----------|---------|-------------|
| id | UUID | NO | gen_random_uuid() | Identifiant unique |
| naf_code | VARCHAR(10) | YES | NULL | Code NAF (ex: "56" pour restauration) |
| name | VARCHAR(255) | NO | - | Nom du secteur |
| description | TEXT | YES | NULL | Description détaillée |
| parent_id | UUID | YES | NULL | Secteur parent (pour hiérarchie) |
| level | INTEGER | NO | 1 | Niveau dans la hiérarchie (1, 2, 3) |
| created_at | TIMESTAMPTZ | NO | NOW() | Date de création |
| updated_at | TIMESTAMPTZ | NO | NOW() | Date de mise à jour |

**Index**:
- PRIMARY KEY: id
- INDEX: naf_code (UNIQUE)
- INDEX: parent_id

**Contraintes**:
- parent_id REFERENCES Sector(id) ON DELETE SET NULL

---

### 3. Zone (Zone Géographique)

**Description**: Représente une zone géographique (région, département, commune).

| Champ | Type | Nullable | Default | Description |
|-------|------|----------|---------|-------------|
| id | UUID | NO | gen_random_uuid() | Identifiant unique |
| code | VARCHAR(10) | YES | NULL | Code géographique (ex: "69" pour Rhône, "69001" pour Lyon) |
| name | VARCHAR(255) | NO | - | Nom de la zone |
| level | VARCHAR(20) | NO | - | Niveau: region, department, commune |
| parent_id | UUID | YES | NULL | Zone parente |
| insee_code | VARCHAR(10) | YES | NULL | Code INSEE |
| created_at | TIMESTAMPTZ | NO | NOW() | Date de création |
| updated_at | TIMESTAMPTZ | NO | NOW() | Date de mise à jour |

**Index**:
- PRIMARY KEY: id
- INDEX: code (UNIQUE)
- INDEX: parent_id
- INDEX: level
- INDEX: insee_code (UNIQUE)

**Contraintes**:
- parent_id REFERENCES Zone(id) ON DELETE SET NULL

---

### 4. Company (Entreprise)

**Description**: Représente une entreprise du répertoire INSEE.

| Champ | Type | Nullable | Default | Description |
|-------|------|----------|---------|-------------|
| id | UUID | NO | gen_random_uuid() | Identifiant unique |
| siren | VARCHAR(9) | NO | - | Numéro SIREN (unique) |
| siret | VARCHAR(14) | YES | NULL | Numéro SIRET de l'établissement principal |
| name | VARCHAR(255) | NO | - | Nom de l'entreprise |
| legal_form | VARCHAR(100) | YES | NULL | Forme juridique |
| address | TEXT | YES | NULL | Adresse complète |
| city | VARCHAR(100) | YES | NULL | Ville |
| postal_code | VARCHAR(10) | YES | NULL | Code postal |
| sector_id | UUID | YES | NULL | Secteur d'activité |
| zone_id | UUID | YES | NULL | Zone géographique |
| date_created | DATE | YES | NULL | Date de création |
| date_radiated | DATE | YES | NULL | Date de radiation (NULL si active) |
| size | VARCHAR(50) | YES | NULL | Taille: micro, small, medium, large |
| revenue_range | VARCHAR(50) | YES | NULL | Tranche de CA |
| employee_range | VARCHAR(50) | YES | NULL | Tranche d'effectifs |
| is_active | BOOLEAN | NO | TRUE | Entreprise active ? |
| insee_data | JSONB | YES | '{}' | Données brutes INSEE |
| created_at | TIMESTAMPTZ | NO | NOW() | Date d'ajout à la base |
| updated_at | TIMESTAMPTZ | NO | NOW() | Date de mise à jour |

**Index**:
- PRIMARY KEY: id
- UNIQUE: siren
- INDEX: sector_id
- INDEX: zone_id
- INDEX: date_created
- INDEX: date_radiated
- INDEX: is_active
- INDEX: (sector_id, zone_id)

**Contraintes**:
- sector_id REFERENCES Sector(id) ON DELETE SET NULL
- zone_id REFERENCES Zone(id) ON DELETE SET NULL

---

### 5. Search (Recherche)

**Description**: Représente une recherche effectuée par un utilisateur.

| Champ | Type | Nullable | Default | Description |
|-------|------|----------|---------|-------------|
| id | UUID | NO | gen_random_uuid() | Identifiant unique |
| user_id | UUID | NO | - | Utilisateur qui a effectué la recherche |
| query | TEXT | NO | - | Requête en langage naturel |
| sector_id | UUID | YES | NULL | Secteur recherché |
| zone_id | UUID | YES | NULL | Zone géographique |
| period_start | DATE | YES | NULL | Date de début de période |
| period_end | DATE | YES | NULL | Date de fin de période |
| parameters | JSONB | YES | '{}' | Paramètres supplémentaires |
| status | VARCHAR(20) | NO | 'pending' | Statut: pending, processing, completed, failed |
| created_at | TIMESTAMPTZ | NO | NOW() | Date de création |
| updated_at | TIMESTAMPTZ | NO | NOW() | Date de mise à jour |

**Index**:
- PRIMARY KEY: id
- INDEX: user_id
- INDEX: sector_id
- INDEX: zone_id
- INDEX: created_at
- INDEX: status

**Contraintes**:
- user_id REFERENCES User(id) ON DELETE CASCADE
- sector_id REFERENCES Sector(id) ON DELETE SET NULL
- zone_id REFERENCES Zone(id) ON DELETE SET NULL

---

### 6. Summary (Synthèse)

**Description**: Représente une synthèse générée pour une recherche.

| Champ | Type | Nullable | Default | Description |
|-------|------|----------|---------|-------------|
| id | UUID | NO | gen_random_uuid() | Identifiant unique |
| search_id | UUID | NO | - | Recherche associée |
| total_companies | INTEGER | NO | 0 | Nombre total d'entreprises |
| creations | INTEGER | NO | 0 | Nombre de créations |
| radiations | INTEGER | NO | 0 | Nombre de radiations |
| net_change | INTEGER | NO | 0 | Variation nette |
| trend | VARCHAR(20) | YES | NULL | Tendance: growth, decline, stable |
| insight | TEXT | YES | NULL | Synthèse en langage naturel |
| subsectors | JSONB | YES | '[]' | Répartition par sous-secteurs |
| top_companies | JSONB | YES | '[]' | Top entreprises (id, nom, etc.) |
| metadata | JSONB | YES | '{}' | Métadonnées supplémentaires |
| created_at | TIMESTAMPTZ | NO | NOW() | Date de création |

**Index**:
- PRIMARY KEY: id
- UNIQUE: search_id
- INDEX: created_at

**Contraintes**:
- search_id REFERENCES Search(id) ON DELETE CASCADE

---

### 7. Conversation (Conversation)

**Description**: Représente une session de chat entre un utilisateur et l'agent.

| Champ | Type | Nullable | Default | Description |
|-------|------|----------|---------|-------------|
| id | UUID | NO | gen_random_uuid() | Identifiant unique |
| user_id | UUID | NO | - | Utilisateur |
| title | VARCHAR(255) | YES | NULL | Titre de la conversation |
| context | JSONB | YES | '{}' | Contexte de la conversation (secteur, zone, etc.) |
| status | VARCHAR(20) | NO | 'active' | Statut: active, archived, deleted |
| created_at | TIMESTAMPTZ | NO | NOW() | Date de création |
| updated_at | TIMESTAMPTZ | NO | NOW() | Date de mise à jour |

**Index**:
- PRIMARY KEY: id
- INDEX: user_id
- INDEX: status
- INDEX: created_at

**Contraintes**:
- user_id REFERENCES User(id) ON DELETE CASCADE

---

### 8. Message (Message)

**Description**: Représente un message dans une conversation.

| Champ | Type | Nullable | Default | Description |
|-------|------|----------|---------|-------------|
| id | UUID | NO | gen_random_uuid() | Identifiant unique |
| conversation_id | UUID | NO | - | Conversation |
| content | TEXT | NO | - | Contenu du message |
| role | VARCHAR(20) | NO | - | Rôle: user, assistant, system |
| token_count | INTEGER | YES | NULL | Nombre de tokens (pour suivi des coûts) |
| model_used | VARCHAR(50) | YES | NULL | Modèle Mistral utilisé |
| temperature | FLOAT | YES | NULL | Température utilisée pour la génération |
| metadata | JSONB | YES | '{}' | Métadonnées |
| created_at | TIMESTAMPTZ | NO | NOW() | Date de création |

**Index**:
- PRIMARY KEY: id
- INDEX: conversation_id
- INDEX: created_at

**Contraintes**:
- conversation_id REFERENCES Conversation(id) ON DELETE CASCADE

---

### 9. Agent (Agent de Prospection)

**Description**: Représente un agent automatisé de prospection.

| Champ | Type | Nullable | Default | Description |
|-------|------|----------|---------|-------------|
| id | UUID | NO | gen_random_uuid() | Identifiant unique |
| user_id | UUID | NO | - | Utilisateur propriétaire |
| name | VARCHAR(255) | NO | - | Nom de l'agent |
| description | TEXT | YES | NULL | Description |
| status | VARCHAR(20) | NO | 'draft' | Statut: draft, active, paused, completed |
| config | JSONB | NO | '{}' | Configuration de l'agent |
| created_at | TIMESTAMPTZ | NO | NOW() | Date de création |
| updated_at | TIMESTAMPTZ | NO | NOW() | Date de mise à jour |

**Structure de config**:
```json
{
  "target": {
    "sector_ids": ["uuid", ...],
    "zone_ids": ["uuid", ...],
    "size_filter": ["micro", "small", ...],
    "date_range": {"start": "YYYY-MM-DD", "end": "YYYY-MM-DD"}
  },
  "message": {
    "template": "...",
    "variables": {"company_name": "{name}", ...}
  },
  "channel": "email", // email, linkedin
  "frequency": {
    "type": "immediate", // immediate, daily, weekly
    "max_per_day": 10
  },
  "objective": "appointment" // appointment, demo, documentation
}
```

**Index**:
- PRIMARY KEY: id
- INDEX: user_id
- INDEX: status
- INDEX: created_at

**Contraintes**:
- user_id REFERENCES User(id) ON DELETE CASCADE

---

### 10. Contact (Contact de Prospection)

**Description**: Représente un contact effectué par un agent de prospection.

| Champ | Type | Nullable | Default | Description |
|-------|------|----------|---------|-------------|
| id | UUID | NO | gen_random_uuid() | Identifiant unique |
| agent_id | UUID | NO | - | Agent de prospection |
| company_id | UUID | NO | - | Entreprise contactée |
| channel | VARCHAR(20) | NO | - | Canal: email, linkedin, phone |
| message | TEXT | NO | - | Message envoyé |
| status | VARCHAR(20) | NO | 'pending' | Statut: pending, sent, delivered, read, responded, converted, failed |
| sent_at | TIMESTAMPTZ | YES | NULL | Date d'envoi |
| delivered_at | TIMESTAMPTZ | YES | NULL | Date de livraison |
| read_at | TIMESTAMPTZ | YES | NULL | Date de lecture |
| responded_at | TIMESTAMPTZ | YES | NULL | Date de réponse |
| converted | BOOLEAN | NO | FALSE | Contact converti ? |
| conversion_value | VARCHAR(100) | YES | NULL | Valeur de la conversion |
| response | TEXT | YES | NULL | Réponse reçue |
| metadata | JSONB | YES | '{}' | Métadonnées |
| created_at | TIMESTAMPTZ | NO | NOW() | Date de création |
| updated_at | TIMESTAMPTZ | NO | NOW() | Date de mise à jour |

**Index**:
- PRIMARY KEY: id
- INDEX: agent_id
- INDEX: company_id
- INDEX: status
- INDEX: created_at
- INDEX: (agent_id, status)
- INDEX: (user_id, created_at) via JOIN

**Contraintes**:
- agent_id REFERENCES Agent(id) ON DELETE CASCADE
- company_id REFERENCES Company(id) ON DELETE SET NULL

---

### 11. Subscription (Abonnement)

**Description**: Représente un abonnement aux rapports périodiques.

| Champ | Type | Nullable | Default | Description |
|-------|------|----------|---------|-------------|
| id | UUID | NO | gen_random_uuid() | Identifiant unique |
| user_id | UUID | NO | - | Utilisateur |
| name | VARCHAR(255) | NO | - | Nom de l'abonnement |
| frequency | VARCHAR(20) | NO | 'weekly' | Fréquence: daily, weekly, biweekly, monthly |
| content | JSONB | NO | '{}' | Contenu du rapport |
| format | VARCHAR(20) | NO | 'email' | Format: email, pdf |
| recipients | JSONB | NO | '[]' | Liste des destinataires |
| status | VARCHAR(20) | NO | 'active' | Statut: active, paused, cancelled |
| last_sent_at | TIMESTAMPTZ | YES | NULL | Dernier envoi |
| next_send_at | TIMESTAMPTZ | YES | NULL | Prochain envoi |
| created_at | TIMESTAMPTZ | NO | NOW() | Date de création |
| updated_at | TIMESTAMPTZ | NO | NOW() | Date de mise à jour |

**Structure de content**:
```json
{
  "sectors": ["uuid", ...],
  "zones": ["uuid", ...],
  "metrics": ["total_companies", "creations", "radiations", "net_change"],
  "include_top_companies": true,
  "include_trend_analysis": true
}
```

**Index**:
- PRIMARY KEY: id
- INDEX: user_id
- INDEX: status
- INDEX: next_send_at

**Contraintes**:
- user_id REFERENCES User(id) ON DELETE CASCADE

---

### 12. Notification (Notification)

**Description**: Représente une notification envoyée à un utilisateur.

| Champ | Type | Nullable | Default | Description |
|-------|------|----------|---------|-------------|
| id | UUID | NO | gen_random_uuid() | Identifiant unique |
| user_id | UUID | NO | - | Utilisateur destinataire |
| type | VARCHAR(50) | NO | - | Type: new_company, report_ready, agent_update, system |
| title | VARCHAR(255) | NO | - | Titre de la notification |
| content | TEXT | NO | - | Contenu de la notification |
| data | JSONB | YES | '{}' | Données associées |
| status | VARCHAR(20) | NO | 'unread' | Statut: unread, read, archived |
| company_id | UUID | YES | NULL | Entreprise concernée (pour new_company) |
| subscription_id | UUID | YES | NULL | Abonnement concerné |
| agent_id | UUID | YES | NULL | Agent concerné |
| created_at | TIMESTAMPTZ | NO | NOW() | Date de création |
| updated_at | TIMESTAMPTZ | NO | NOW() | Date de mise à jour |

**Index**:
- PRIMARY KEY: id
- INDEX: user_id
- INDEX: status
- INDEX: created_at
- INDEX: type

**Contraintes**:
- user_id REFERENCES User(id) ON DELETE CASCADE
- company_id REFERENCES Company(id) ON DELETE SET NULL
- subscription_id REFERENCES Subscription(id) ON DELETE SET NULL
- agent_id REFERENCES Agent(id) ON DELETE SET NULL

---

## Règles de Validation

### Règles Métier

1. **User**:
   - email doit être valide et unique
   - role doit être dans ['user', 'admin']
   - password_hash doit être un hash bcrypt valide

2. **Company**:
   - siren doit être un nombre à 9 chiffres
   - siret doit être un nombre à 14 chiffres
   - date_radiated doit être NULL ou postérieure à date_created
   - Une seule entreprise active par SIREN

3. **Search**:
   - period_start doit être ≤ period_end
   - user_id doit correspondre à un utilisateur valide

4. **Agent**:
   - status doit être dans ['draft', 'active', 'paused', 'completed']
   - config doit être un JSON valide avec les champs requis

5. **Contact**:
   - status doit être dans ['pending', 'sent', 'delivered', 'read', 'responded', 'converted', 'failed']
   - sent_at doit être ≤ delivered_at (si les deux sont définis)

6. **Subscription**:
   - frequency doit être dans ['daily', 'weekly', 'biweekly', 'monthly']
   - format doit être dans ['email', 'pdf']

### Règles de Sécurité (RLS)

**Supabase Row-Level Security**:

```sql
-- Pour toutes les tables liées aux utilisateurs:
CREATE POLICY "Enable read access for authenticated users" ON user
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Enable insert for authenticated users" ON user
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Exemple pour Conversation:
CREATE POLICY "Users can access their conversations" ON conversation
  FOR ALL USING (auth.uid() = user_id);

-- Exemple pour Agent:
CREATE POLICY "Users can manage their agents" ON agent
  FOR ALL USING (auth.uid() = user_id);

-- Pour les données publiques (Sector, Zone, Company):
CREATE POLICY "Public read access for sectors" ON sector
  FOR SELECT USING (true);

CREATE POLICY "Public read access for zones" ON zone
  FOR SELECT USING (true);

CREATE POLICY "Public read access for companies" ON company
  FOR SELECT USING (true);
```

---

## Transitions d'État

### Conversation
```
┌──────────┐    create    ┌──────────┐
│  NEW      │────────────►│  ACTIVE  │
└──────────┘             └──────────┘
                          │
                          │ archive
                          ▼
                     ┌──────────┐
                     │ ARCHIVED │
                     └──────────┘
```

### Search
```
┌──────────┐    submit    ┌──────────┐    process    ┌──────────┐
│ PENDING   │────────────►│PROCESSING│────────────►│ COMPLETED │
└──────────┘             └──────────┘             └──────────┘
                          │
                          │ fail
                          ▼
                     ┌──────────┐
                     │  FAILED  │
                     └──────────┘
```

### Agent
```
┌──────────┐    save    ┌──────────┐    activate    ┌──────────┐
│  DRAFT    │──────────►│  ACTIVE   │◄──────────────│  PAUSED   │
└──────────┘           └──────────┘               └──────────┘
                          │
                          │ complete
                          ▼
                     ┌──────────┐
                     │ COMPLETED│
                     └──────────┘
```

### Contact
```
┌──────────┐    send    ┌──────────┐    deliver    ┌──────────┐
│ PENDING   │──────────►│   SENT    │────────────►│DELIVERED │
└──────────┘           └──────────┘             └──────────┘
                          │                         │
                          │ fail                    │ read
                          ▼                         ▼
                     ┌──────────┐                ┌──────────┐
                     │  FAILED  │                │   READ   │
                     └──────────┘                └──────────┘
                                                │
                                                │ respond
                                                ▼
                                           ┌──────────┐
                                           │RESPONDED │
                                           └──────────┘
                                                │
                                                │ convert
                                                ▼
                                           ┌──────────┐
                                           │ CONVERTED│
                                           └──────────┘
```

---

## Scripts de Migration

*À générer lors de l'implémentation*

---

## Optimisations

### Index Recommandés

Tous les index primaires et secondaires sont déjà listés dans chaque table.

### Partitions

Pour les tables qui vont croître rapidement:
- **Message**: Partition par mois (sur created_at)
- **Contact**: Partition par mois (sur created_at)
- **Notification**: Partition par mois (sur created_at)

### Cache

Stratégies de cache recommandées:
- **Sector, Zone**: Cache long (24h) - données statiques
- **Company**: Cache moyen (1h) - données semi-statiques
- **Summary**: Cache court (5min) - données générées
- **Search**: Pas de cache - requêtes spécifiques

---

## Notes d'Implémentation

1. **Supabase**: Utiliser le client @supabase/supabase-js pour le frontend et supabase-py pour le backend
2. **Migrations**: Utiliser l'outil de migration de Supabase ou créer des scripts SQL
3. **Seed Data**: Pré-remplir les tables Sector et Zone avec les données INSEE
4. **Performance**: Pour les requêtes complexes, utiliser des vues matérialisées
5. **Backup**: Configurer des sauvegardes automatiques de la base de données

---

## Historique

| Date | Auteur | Changement |
|------|--------|------------|
| 2026-10-07 | Mistral Vibe | Création initiale du modèle de données |
