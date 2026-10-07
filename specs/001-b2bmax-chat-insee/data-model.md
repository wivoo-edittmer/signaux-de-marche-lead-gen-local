# Modèle de Données - B2Bmax (MVP1)

**Feature**: B2Bmax - Agent Conversationnel de Prospection INSEE  
**Version**: 2.0 (MVP1 - Données locales extract_10000.csv)  
**Date**: 2026-10-07  
**Statut**: Adapté pour MVP1 avec fichiers extract_10000.csv

---

## 📌 Changelog v2.0

### Modifications majeures pour MVP1 :
- ✅ **Remplacement de `Company`** par `legal_unit` + `establishment` (séparation INSEE)
- ✅ **Ajout des champs de géolocalisation** (`commune_code`, `postal_code`, `lambert_x/y`)
- ✅ **Intégration des tables de référence** (`sector`, `zone`, `commune_to_zone`)
- ✅ **Adaptation pour extract_10000.csv** (10K lignes, ~3.2MB)
- ✅ **Suppression des tables non-MVP1** (Agent, Contact, Subscription, Notification)
- ✅ **Simplification des RLS** (pas d'auth pour MVP1)

### Structure adaptée aux données INSEE réelles :
- **legal_unit** → StockUniteLegale_extract_10000.csv (entreprises)
- **establishment** → StockEtablissement_extract_10000.csv (sites physiques)
- **sector** → sectors.json (référence NAF)
- **zone** → zones.json (référence géographique)

---

## 🏗️ Diagramme Entité-Relation (MVP1)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                     MODELE DE DONNÉES MVP1 - B2Bmax                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌──────────────┐       ┌──────────────┐       ┌──────────────┐            │
│  │   Sector      │       │    Zone       │       │  User*        │            │
│  ├──────────────┤       ├──────────────┤       ├──────────────┤            │
│  │ id (PK)       │       │ id (PK)       │       │ id (PK)       │            │
│  │ naf_code     │       │ code          │       │ email         │            │
│  │ name         │       │ name          │       │ full_name     │            │
│  │ level        │       │ level         │       │ role          │            │
│  │ parent_id(FK)│       │ parent_id(FK) │       └──────────────┘            │
│  └──────┬───────┘       └──────┬───────┘                  │                │
│         │                      │                         │                │
│         │       ┌──────────────┴──────────────┐          │                │
│         │       │    commune_to_zone            │          │                │
│         │       │┌──────────┐┌────────────┐│          │                │
│         │       ││commune_  ││ zone_id (FK)││          │                │
│         │       ││code (PK) │└────────────┘│          │                │
│         │       └──────────┘               │          │                │
│         │              │                   │          │                │
│         ▼              ▼                   ▼          │                │
│  ┌──────────────┐       ┌──────────────┐            │                │
│  │ legal_unit   │       │ establishment │            │                │
│  ├──────────────┤       ├──────────────┤            │                │
│  │ id (PK)       │◄──────│ legal_unit_   │            │                │
│  │ siren (UQ)    │◄──────│ siren (FK)    │            │                │
│  │ name          │       │ siret (UQ)    │            │                │
│  │ category      │       │ nic           │            │                │
│  │ main_activity_│──────►│ zone_id (FK)  │            │                │
│  │ code          │       │ commune_code │            │                │
│  │ is_active     │       │ postal_code  │            │                │
│  │ creation_date │       │ address      │            │                │
│  └──────────────┘       │ is_active     │            │                │
│                          │ lambert_x     │            │                │
│                          │ lambert_y     │            │                │
│                          └──────────────┘            │                │
│                                                                    │                │
│       ┌──────────────┐       ┌──────────────┐                   │                │
│       │  Conversation │       │   Message     │                   │                │
│       ├──────────────┤       ├──────────────┤                   │                │
│       │ id (PK)       │◄──────│ conversation  │                   │                │
│       │ user_id (FK)* │       │ id (PK)       │                   │                │
│       │ context       │◄──────│ content       │                   │                │
│       │ created_at    │       │ role          │                   │                │
│       └──────────────┘       │ created_at    │                   │                │
│                            └──────────────┘                   │                │
│                                                                    │                │
│       ┌──────────────┐       ┌──────────────┐                   │                │
│       │   Search      │       │   Summary     │                   │                │
│       ├──────────────┤       ├──────────────┤                   │                │
│       │ id (PK)       │◄──────│ search_id     │                   │                │
│       │ query         │       │ total_companies│                  │                │
│       │ sector_id(FK) │       │ creations    │                   │                │
│       │ zone_id(FK)   │       │ radiations   │                   │                │
│       │ parameters    │       │ insight      │                   │                │
│       └──────────────┘       └──────────────┘                   │                │
│                                                                    │                │
└─────────────────────────────────────────────────────────────────────────────┘

*Note: Les tables marquées avec * (User, Conversation, Message, Search, Summary) 
sont optionnelles pour MVP1 et peuvent être implémentées avec ou sans Supabase.
Pour MVP1, on peut utiliser uniquement les données locales sans persistance utilisateur.
```

---

## 📊 Entités Principales (MVP1)

### 1️⃣ **Sector** (Secteur NAF) - Données de référence
**Source**: `data/sectors.json`

| Champ | Type | Nullable | Default | Description |
|-------|------|----------|---------|-------------|
| id | UUID | NO | gen_random_uuid() | Identifiant unique |
| naf_code | VARCHAR(10) | NO | - | Code NAF (ex: "62.01Z") |
| name | VARCHAR(255) | NO | - | Nom du secteur |
| description | TEXT | YES | NULL | Description détaillée |
| level | INTEGER | NO | - | Niveau hiérarchique (1, 2, 3) |
| parent_id | UUID | YES | NULL | Secteur parent (NULL pour niveau 1) |
| created_at | TIMESTAMPTZ | NO | NOW() | Date de création |

**Index**:
- PRIMARY KEY: id
- UNIQUE: naf_code
- INDEX: parent_id
- INDEX: level

**Contraintes**:
- parent_id REFERENCES sector(id) ON DELETE SET NULL

**Exemple de données** (à partir de sectors.json):
```json
{
  "naf_code": "J",
  "name": "Information et communication",
  "level": 1
}
{
  "naf_code": "62",
  "name": "Programmation et conseil informatique",
  "level": 2,
  "parent_id": "J"
}
```

---

### 2️⃣ **Zone** (Zone Géographique) - Données de référence
**Source**: `data/zones.json`

| Champ | Type | Nullable | Default | Description |
|-------|------|----------|---------|-------------|
| id | UUID | NO | gen_random_uuid() | Identifiant unique |
| code | VARCHAR(10) | NO | - | Code géographique (ex: "BRE", "35", "35000") |
| name | VARCHAR(255) | NO | - | Nom de la zone |
| level | VARCHAR(20) | NO | - | Niveau: 'region', 'department', 'commune' |
| parent_id | UUID | YES | NULL | Zone parente (NULL pour les régions) |
| insee_code | VARCHAR(10) | YES | NULL | Code INSEE (pour les communes) |
| created_at | TIMESTAMPTZ | NO | NOW() | Date de création |

**Index**:
- PRIMARY KEY: id
- UNIQUE: code
- INDEX: parent_id
- INDEX: level
- UNIQUE: insee_code

**Contraintes**:
- parent_id REFERENCES zone(id) ON DELETE SET NULL

**Exemple de données** (à partir de zones.json):
```json
{
  "code": "BRE",
  "name": "Bretagne",
  "level": "region"
}
{
  "code": "35",
  "name": "Ille-et-Vilaine",
  "level": "department",
  "parent_id": "BRE"
}
{
  "code": "35000",
  "name": "Rennes",
  "level": "commune",
  "parent_id": "35",
  "insee_code": "35000"
}
```

---

### 3️⃣ **commune_to_zone** (Mapping Commune → Zone)
**Source**: Calculé à partir de zones.json

| Champ | Type | Nullable | Default | Description |
|-------|------|----------|---------|-------------|
| commune_code | VARCHAR(10) | NO | - | Code commune INSEE (5 chiffres) |
| zone_id | UUID | NO | - | ID de la zone correspondante |

**Index**:
- PRIMARY KEY: commune_code
- INDEX: zone_id

**Contraintes**:
- zone_id REFERENCES zone(id) ON DELETE CASCADE

---

### 4️⃣ **legal_unit** (Unité Légale = Entreprise)
**Source**: `data/StockUniteLegale_extract_10000.csv`

**Description**: Représente une entreprise (unité légale) du répertoire INSEE. Une entreprise peut avoir plusieurs établissements.

| Champ | Type | Nullable | Default | Description | Source CSV |
|-------|------|----------|---------|-------------|------------|
| id | UUID | NO | gen_random_uuid() | Identifiant unique | - |
| siren | VARCHAR(9) | NO | - | Numéro SIREN (unique, 9 chiffres) | siren |
| name | VARCHAR(255) | NO | - | Nom de l'entreprise | denominationUniteLegale / nomUniteLegale |
| legal_form | VARCHAR(100) | YES | NULL | Forme juridique | categorieJuridiqueUniteLegale |
| category | VARCHAR(50) | YES | NULL | Catégorie: PME, GE, etc. | categorieEntreprise |
| employee_range | VARCHAR(50) | YES | NULL | Tranche d'effectifs | trancheEffectifsUniteLegale |
| main_activity_code | VARCHAR(10) | YES | NULL | Code NAF principal | activitePrincipaleUniteLegale |
| administrative_status | VARCHAR(10) | NO | - | Statut: 'A' (active), 'C' (cessée) | etatAdministratifUniteLegale |
| creation_date | DATE | YES | NULL | Date de création | dateCreationUniteLegale |
| radiation_date | DATE | YES | NULL | Date de radiation | dateDernierTraitementUniteLegale |
| is_active | BOOLEAN | NO | - | Entreprise active ? | Généré (administrative_status = 'A') |
| nic_siege | VARCHAR(5) | YES | NULL | NIC du siège | nicSiegeUniteLegale |
| insee_data | JSONB | YES | '{}' | Données brutes INSEE | Tous les champs CSV |
| created_at | TIMESTAMPTZ | NO | NOW() | Date d'ajout à la base | - |

**Index**:
- PRIMARY KEY: id
- UNIQUE: siren
- INDEX: main_activity_code
- INDEX: category
- INDEX: is_active (WHERE is_active = TRUE)
- INDEX: creation_date

**Contraintes**:
- is_active est généré: `GENERATED ALWAYS AS (administrative_status = 'A') STORED`

---

### 5️⃣ **establishment** (Établissement = Site physique)
**Source**: `data/StockEtablissement_extract_10000.csv`

**Description**: Représente un établissement (site physique) d'une entreprise. Une entreprise (legal_unit) peut avoir plusieurs établissements.

| Champ | Type | Nullable | Default | Description | Source CSV |
|-------|------|----------|---------|-------------|------------|
| id | UUID | NO | gen_random_uuid() | Identifiant unique | - |
| siret | VARCHAR(14) | NO | - | Numéro SIRET (unique, 14 chiffres = SIREN + NIC) | siret |
| legal_unit_siren | VARCHAR(9) | NO | - | SIREN de l'unité légale | siren |
| nic | VARCHAR(5) | NO | - | NIC (5 chiffres) | nic |
| is_headquarters | BOOLEAN | YES | NULL | Est le siège social ? | etablissementSiege |
| postal_code | VARCHAR(10) | YES | NULL | Code postal | codePostalEtablissement |
| commune_name | VARCHAR(100) | YES | NULL | Nom de la commune | libelleCommuneEtablissement |
| commune_code | VARCHAR(10) | YES | NULL | Code commune INSEE (5 chiffres) | codeCommuneEtablissement |
| zone_id | UUID | YES | NULL | ID de la zone géographique | Via commune_to_zone |
| lambert_x | FLOAT | YES | NULL | Coordonnée Lambert X | coordonneeLambertAbscisseEtablissement |
| lambert_y | FLOAT | YES | NULL | Coordonnée Lambert Y | coordonneeLambertOrdonneeEtablissement |
| activity_code | VARCHAR(10) | YES | NULL | Code NAF de l'établissement | activitePrincipaleEtablissement |
| naf25_code | VARCHAR(10) | YES | NULL | Code NAF version 25 | activitePrincipaleNAF25Etablissement |
| administrative_status | VARCHAR(10) | YES | NULL | Statut administratif | etatAdministratifEtablissement |
| is_employer | BOOLEAN | YES | NULL | Est employeur ? | caractereEmployeurEtablissement |
| start_date | DATE | YES | NULL | Date de début | dateDebut |
| address | TEXT | YES | NULL | Adresse complète | Construite à partir des champs voie, numéro, etc. |
| created_at | TIMESTAMPTZ | NO | NOW() | Date d'ajout à la base | - |

**Index**:
- PRIMARY KEY: id
- UNIQUE: siret
- INDEX: legal_unit_siren (FK)
- INDEX: commune_code
- INDEX: zone_id
- INDEX: postal_code
- INDEX: is_active (WHERE is_active = TRUE)
- INDEX: (legal_unit_siren, commune_code)

**Contraintes**:
- legal_unit_siren REFERENCES legal_unit(siren) ON DELETE CASCADE
- zone_id REFERENCES zone(id) ON DELETE SET NULL

---

## 🔄 **Tables Optionnelles pour MVP1+**

> ⚠️ **Ces tables ne sont pas nécessaires pour le MVP1** (qui utilise uniquement les données locales).
> Elles sont incluses pour référence et seront implémentées dans les MVP suivants.

### 6️⃣ **User** (Utilisateur) - *Optionnel MVP1*
**Source**: Authentification Supabase (si activée)

| Champ | Type | Nullable | Default | Description |
|-------|------|----------|---------|-------------|
| id | UUID | NO | gen_random_uuid() | Identifiant unique (auth.uid()) |
| email | VARCHAR(255) | NO | - | Email de l'utilisateur (unique) |
| full_name | VARCHAR(255) | YES | NULL | Nom complet |
| company_name | VARCHAR(255) | YES | NULL | Nom de l'entreprise de l'utilisateur |
| role | VARCHAR(50) | NO | 'user' | Rôle: user, admin |
| preferences | JSONB | YES | '{}' | Préférences utilisateur |
| created_at | TIMESTAMPTZ | NO | NOW() | Date de création |
| updated_at | TIMESTAMPTZ | NO | NOW() | Date de mise à jour |

**Index**:
- PRIMARY KEY: id
- UNIQUE: email

**RLS** (si Supabase Auth activé):
```sql
CREATE POLICY "Enable read access for authenticated users" ON "user"
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Enable insert for authenticated users" ON "user"
  FOR INSERT WITH CHECK (auth.uid() = id);
```

---

### 7️⃣ **Conversation** (Conversation Chat) - *Optionnel MVP1*

| Champ | Type | Nullable | Default | Description |
|-------|------|----------|---------|-------------|
| id | UUID | NO | gen_random_uuid() | Identifiant unique |
| user_id | UUID | YES | NULL | Utilisateur (NULL si pas d'auth) |
| context | JSONB | YES | '{}' | Contexte de la conversation |
| status | VARCHAR(20) | NO | 'active' | Statut: active, archived |
| created_at | TIMESTAMPTZ | NO | NOW() | Date de création |
| updated_at | TIMESTAMPTZ | NO | NOW() | Date de mise à jour |

**Index**:
- PRIMARY KEY: id
- INDEX: user_id
- INDEX: status
- INDEX: created_at

---

### 8️⃣ **Message** (Message Chat) - *Optionnel MVP1*

| Champ | Type | Nullable | Default | Description |
|-------|------|----------|---------|-------------|
| id | UUID | NO | gen_random_uuid() | Identifiant unique |
| conversation_id | UUID | YES | NULL | Conversation (NULL si standalone) |
| content | TEXT | NO | - | Contenu du message |
| role | VARCHAR(20) | NO | - | Rôle: user, assistant, system |
| token_count | INTEGER | YES | NULL | Nombre de tokens |
| model_used | VARCHAR(50) | YES | NULL | Modèle Mistral utilisé |
| created_at | TIMESTAMPTZ | NO | NOW() | Date de création |

**Index**:
- PRIMARY KEY: id
- INDEX: conversation_id
- INDEX: created_at

---

### 9️⃣ **Search** (Recherche) - *Optionnel MVP1*

| Champ | Type | Nullable | Default | Description |
|-------|------|----------|---------|-------------|
| id | UUID | NO | gen_random_uuid() | Identifiant unique |
| user_id | UUID | YES | NULL | Utilisateur (NULL si pas d'auth) |
| query | TEXT | NO | - | Requête en langage naturel |
| parameters | JSONB | YES | '{}' | Paramètres extraits (secteur, zone, etc.) |
| status | VARCHAR(20) | NO | 'completed' | Statut |
| created_at | TIMESTAMPTZ | NO | NOW() | Date de création |

**Index**:
- PRIMARY KEY: id
- INDEX: user_id
- INDEX: created_at

---

### 🔟 **Summary** (Synthèse) - *Optionnel MVP1*

| Champ | Type | Nullable | Default | Description |
|-------|------|----------|---------|-------------|
| id | UUID | NO | gen_random_uuid() | Identifiant unique |
| search_id | UUID | YES | NULL | Recherche associée (NULL si standalone) |
| total_companies | INTEGER | NO | 0 | Nombre total d'entreprises |
| creations | INTEGER | NO | 0 | Nombre de créations |
| radiations | INTEGER | NO | 0 | Nombre de radiations |
| net_change | INTEGER | NO | 0 | Variation nette |
| trend | VARCHAR(20) | YES | NULL | Tendance: growth, decline, stable |
| insight | TEXT | YES | NULL | Synthèse en langage naturel |
| sector_breakdown | JSONB | YES | '{}' | Répartition par secteur |
| zone_breakdown | JSONB | YES | '{}' | Répartition par zone |
| top_companies | JSONB | YES | '[]' | Top entreprises |
| created_at | TIMESTAMPTZ | NO | NOW() | Date de création |

**Index**:
- PRIMARY KEY: id
- INDEX: search_id
- INDEX: created_at

---

## 📜 **Script SQL pour MVP1**

### **Fichier: `sql/schema_mvp1.sql`**

```sql
-- =============================================
-- SCHEMA MVP1 - B2Bmax
-- Adapté pour les fichiers extract_10000.csv
-- =============================================

-- Extension UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- 1. TABLES DE RÉFÉRENCE (STATIQUES)
-- =============================================

-- Secteurs NAF
CREATE TABLE IF NOT EXISTS sector (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    naf_code VARCHAR(10) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    level INTEGER NOT NULL,
    parent_id UUID REFERENCES sector(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Zones géographiques
CREATE TABLE IF NOT EXISTS zone (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(10) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    level VARCHAR(20) NOT NULL CHECK (level IN ('region', 'department', 'commune')),
    parent_id UUID REFERENCES zone(id) ON DELETE SET NULL,
    insee_code VARCHAR(10),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Mapping Commune → Zone
CREATE TABLE IF NOT EXISTS commune_to_zone (
    commune_code VARCHAR(10) PRIMARY KEY,
    zone_id UUID NOT NULL REFERENCES zone(id) ON DELETE CASCADE
);

-- =============================================
-- 2. TABLES INSEE (DONNÉES LOCALES)
-- =============================================

-- Unités Légales (entreprises)
CREATE TABLE IF NOT EXISTS legal_unit (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    siren VARCHAR(9) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    legal_form VARCHAR(100),
    category VARCHAR(50),
    employee_range VARCHAR(50),
    main_activity_code VARCHAR(10),
    administrative_status VARCHAR(10) NOT NULL CHECK (administrative_status IN ('A', 'C')),
    creation_date DATE,
    radiation_date DATE,
    is_active BOOLEAN GENERATED ALWAYS AS (administrative_status = 'A') STORED,
    nic_siege VARCHAR(5),
    insee_data JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Établissements (sites physiques)
CREATE TABLE IF NOT EXISTS establishment (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    siret VARCHAR(14) UNIQUE NOT NULL,
    legal_unit_siren VARCHAR(9) NOT NULL REFERENCES legal_unit(siren) ON DELETE CASCADE,
    nic VARCHAR(5) NOT NULL,
    is_headquarters BOOLEAN,
    postal_code VARCHAR(10),
    commune_name VARCHAR(100),
    commune_code VARCHAR(10),
    zone_id UUID REFERENCES zone(id) ON DELETE SET NULL,
    lambert_x FLOAT,
    lambert_y FLOAT,
    activity_code VARCHAR(10),
    naf25_code VARCHAR(10),
    administrative_status VARCHAR(10),
    is_employer BOOLEAN,
    start_date DATE,
    address TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 3. INDEX
-- =============================================

-- Index pour Sector
CREATE INDEX IF NOT EXISTS idx_sector_naf_code ON sector(naf_code);
CREATE INDEX IF NOT EXISTS idx_sector_parent ON sector(parent_id);
CREATE INDEX IF NOT EXISTS idx_sector_level ON sector(level);

-- Index pour Zone
CREATE INDEX IF NOT EXISTS idx_zone_code ON zone(code);
CREATE INDEX IF NOT EXISTS idx_zone_parent ON zone(parent_id);
CREATE INDEX IF NOT EXISTS idx_zone_level ON zone(level);
CREATE INDEX IF NOT EXISTS idx_zone_insee_code ON zone(insee_code);

-- Index pour legal_unit
CREATE INDEX IF NOT EXISTS idx_legal_unit_siren ON legal_unit(siren);
CREATE INDEX IF NOT EXISTS idx_legal_unit_main_activity ON legal_unit(main_activity_code);
CREATE INDEX IF NOT EXISTS idx_legal_unit_category ON legal_unit(category);
CREATE INDEX IF NOT EXISTS idx_legal_unit_active ON legal_unit(is_active) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_legal_unit_creation_date ON legal_unit(creation_date);

-- Index pour establishment
CREATE INDEX IF NOT EXISTS idx_establishment_siret ON establishment(siret);
CREATE INDEX IF NOT EXISTS idx_establishment_legal_unit ON establishment(legal_unit_siren);
CREATE INDEX IF NOT EXISTS idx_establishment_commune_code ON establishment(commune_code);
CREATE INDEX IF NOT EXISTS idx_establishment_zone ON establishment(zone_id);
CREATE INDEX IF NOT EXISTS idx_establishment_postal_code ON establishment(postal_code);
CREATE INDEX IF NOT EXISTS idx_establishment_active ON establishment(administrative_status) WHERE administrative_status = 'A';
CREATE INDEX IF NOT EXISTS idx_establishment_geo ON establishment(legal_unit_siren, commune_code);

-- Index pour commune_to_zone
CREATE INDEX IF NOT EXISTS idx_commune_to_zone_id ON commune_to_zone(zone_id);

-- =============================================
-- 4. VUES POUR MVP1
-- =============================================

-- Statistiques par secteur et zone
CREATE OR REPLACE VIEW company_stats AS
SELECT 
    COALESCE(s.naf_code, 'Inconnu') AS sector_code,
    COALESCE(s.name, 'Inconnu') AS sector_name,
    COALESCE(z.code, 'Inconnu') AS zone_code,
    COALESCE(z.name, 'Inconnu') AS zone_name,
    COALESCE(z.level, 'unknown') AS zone_level,
    COUNT(DISTINCT lu.siren) AS company_count,
    COUNT(DISTINCT e.siret) AS establishment_count,
    COUNT(DISTINCT CASE WHEN lu.is_active THEN lu.siren END) AS active_company_count,
    COUNT(DISTINCT CASE WHEN e.administrative_status = 'A' THEN e.siret END) AS active_establishment_count
FROM legal_unit lu
LEFT JOIN establishment e ON lu.siren = e.legal_unit_siren
LEFT JOIN sector s ON lu.main_activity_code = s.naf_code
LEFT JOIN zone z ON e.zone_id = z.id
GROUP BY s.naf_code, s.name, z.code, z.name, z.level;

-- Entreprises avec leurs informations géographiques
CREATE OR REPLACE VIEW companies_with_geo AS
SELECT 
    lu.siren,
    lu.name AS company_name,
    lu.category,
    lu.employee_range,
    lu.main_activity_code,
    s.name AS sector_name,
    e.postal_code,
    e.commune_name,
    e.commune_code,
    z.code AS zone_code,
    z.name AS zone_name,
    z.level AS zone_level,
    e.address,
    e.lambert_x,
    e.lambert_y,
    lu.is_active,
    e.is_headquarters,
    e.is_employer
FROM legal_unit lu
LEFT JOIN establishment e ON lu.siren = e.legal_unit_siren
LEFT JOIN sector s ON lu.main_activity_code = s.naf_code
LEFT JOIN zone z ON e.zone_id = z.id;

-- Recherche d'entreprises par secteur et zone
CREATE OR REPLACE VIEW searchable_companies AS
SELECT 
    lu.siren,
    lu.name,
    lu.category,
    lu.employee_range,
    lu.main_activity_code AS sector_code,
    s.name AS sector_name,
    e.commune_code,
    e.postal_code,
    e.commune_name,
    z.code AS zone_code,
    z.name AS zone_name,
    z.level AS zone_level,
    e.address,
    lu.is_active,
    lu.creation_date,
    e.start_date AS establishment_start_date
FROM legal_unit lu
LEFT JOIN establishment e ON lu.siren = e.legal_unit_siren
LEFT JOIN sector s ON lu.main_activity_code = s.naf_code
LEFT JOIN zone z ON e.zone_id = z.id
WHERE lu.is_active = TRUE AND e.administrative_status = 'A';
```

-- =============================================
-- 5. FONCTIONS UTILES
-- =============================================

-- Compter les entreprises par secteur dans une zone
CREATE OR REPLACE FUNCTION count_companies_by_sector(
    p_zone_code VARCHAR,
    p_sector_code VARCHAR DEFAULT NULL
) RETURNS TABLE (
    sector_code VARCHAR,
    sector_name VARCHAR,
    company_count BIGINT,
    establishment_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COALESCE(s.naf_code, 'Inconnu') AS sector_code,
        COALESCE(s.name, 'Inconnu') AS sector_name,
        COUNT(DISTINCT lu.siren) AS company_count,
        COUNT(DISTINCT e.siret) AS establishment_count
    FROM legal_unit lu
    LEFT JOIN establishment e ON lu.siren = e.legal_unit_siren
    LEFT JOIN sector s ON lu.main_activity_code = s.naf_code
    LEFT JOIN zone z ON e.zone_id = z.id
    WHERE 
        (p_sector_code IS NULL OR s.naf_code = p_sector_code OR s.naf_code LIKE p_sector_code || '.%')
        AND (
            p_zone_code IS NULL OR 
            z.code = p_zone_code OR 
            z.parent_id IN (SELECT id FROM zone WHERE code = p_zone_code)
        )
    GROUP BY s.naf_code, s.name;
END;
$$ LANGUAGE plpgsql;

-- Trouver les entreprises dans une zone et un secteur
CREATE OR REPLACE FUNCTION find_companies(
    p_zone_codes TEXT[],
    p_sector_codes TEXT[],
    p_min_employees VARCHAR DEFAULT NULL,
    p_max_employees VARCHAR DEFAULT NULL
) RETURNS TABLE (
    siren VARCHAR,
    name VARCHAR,
    sector_name VARCHAR,
    zone_name VARCHAR,
    commune_name VARCHAR,
    postal_code VARCHAR,
    employee_range VARCHAR,
    is_active BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        lu.siren,
        lu.name,
        COALESCE(s.name, 'Inconnu') AS sector_name,
        COALESCE(z.name, 'Inconnu') AS zone_name,
        e.commune_name,
        e.postal_code,
        lu.employee_range,
        lu.is_active
    FROM legal_unit lu
    LEFT JOIN establishment e ON lu.siren = e.legal_unit_siren
    LEFT JOIN sector s ON lu.main_activity_code = s.naf_code
    LEFT JOIN zone z ON e.zone_id = z.id
    WHERE 
        (p_sector_codes IS NULL OR s.naf_code = ANY(p_sector_codes) OR lu.main_activity_code = ANY(p_sector_codes))
        AND (p_zone_codes IS NULL OR z.code = ANY(p_zone_codes))
        AND (p_min_employees IS NULL OR lu.employee_range >= p_min_employees)
        AND (p_max_employees IS NULL OR lu.employee_range <= p_max_employees)
    GROUP BY lu.siren, lu.name, s.name, z.name, e.commune_name, e.postal_code, lu.employee_range, lu.is_active;
END;
$$ LANGUAGE plpgsql;
```

-- =============================================
-- 6. POLICIES RLS (Désactivées pour MVP1)
-- =============================================

-- Pour MVP1, on peut désactiver RLS ou utiliser des politiques permissives
-- car on utilise uniquement des données publiques INSEE.

-- Si on active RLS:
-- CREATE POLICY "Public read access for all" ON legal_unit FOR SELECT USING (true);
-- CREATE POLICY "Public read access for all" ON establishment FOR SELECT USING (true);
-- CREATE POLICY "Public read access for all" ON sector FOR SELECT USING (true);
-- CREATE POLICY "Public read access for all" ON zone FOR SELECT USING (true);
```

-- =============================================
-- INSTRUCTIONS D'EXÉCUTION
-- =============================================

-- 1. Exécuter ce script dans Supabase SQL Editor
-- 2. Puis exécuter le script data_loader.py pour charger les données
-- 3. Les vues et fonctions sont automatiquement créées

-- Temps estimé: < 1 minute pour le schéma, < 30 secondes pour le chargement
