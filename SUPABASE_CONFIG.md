# Configuration Base de Données Supabase - B2Bmax

## Informations de Connexion

- **URL du projet**: `https://zzqyokefesatkgvtdqqt.supabase.co`
- **Utilisateur**: `postgres.zzqyokefesatkgvtdqqt`
- **Mot de passe**: `J'aimeLesChatons`
- **Hôte PostgreSQL**: `aws-0-eu-west-1.pooler.supabase.com`
- **Port**: `5432`
- **Base de données**: `postgres`

## URL de Connexion PostgreSQL

```
postgresql://postgres.zzqyokefesatkgvtdqqt:J'aimeLesChatons@aws-0-eu-west-1.pooler.supabase.com:5432/postgres
```

## Tables Créées

### 1. sectors
- **Description**: Secteurs d'activité NAF
- **Nombre d'enregistrements**: 10
- **Colonnes**: id, naf_code, name, description, level, parent_id, created_at
- **Index**: idx_sectors_parent_id, idx_sectors_naf_code

### 2. zones
- **Description**: Zones géographiques (régions, départements, communes)
- **Nombre d'enregistrements**: 13
- **Colonnes**: id, code, name, level, parent_id, created_at
- **Index**: idx_zones_parent_id, idx_zones_code, idx_zones_level

### 3. companies
- **Description**: Entreprises (Unités Légales) INSEE
- **Nombre d'enregistrements**: 9 007
- **Colonnes**: siren, name, legal_form, date_created, sector_id, naf_code, zone_id, postal_code, commune, address, size, category, is_active, created_at, updated_at
- **Index**: idx_companies_sector_id, idx_companies_naf_code, idx_companies_zone_id, idx_companies_is_active, idx_companies_size, idx_companies_category, idx_companies_date_created

### 4. establishments
- **Description**: Établissements des entreprises
- **Nombre d'enregistrements**: 9 998
- **Colonnes**: siret, siren, address, complement_adresse, numero_voie, type_voie, libelle_voie, code_postal, commune, code_commune, is_active, created_at
- **Index**: idx_establishments_siren, idx_establishments_code_postal, idx_establishments_code_commune

## Statistiques

- **8 994** entreprises ont des informations de zone (code commune)
- **8 967** entreprises ont un code NAF
- **2 207** entreprises sont actives
- **9998** établissements chargés

## Contraintes

- `establishments.siren` → `companies.siren` (clé étrangère)

## Exemples de Requêtes

### Obtenir le nombre d'entreprises par région
```sql
SELECT z.name as region, COUNT(c.*) as company_count
FROM companies c
JOIN zones z ON c.zone_id = z.code
WHERE z.level = 'region'
GROUP BY z.name
ORDER BY company_count DESC;
```

### Obtenir les entreprises d'un secteur spécifique
```sql
SELECT c.siren, c.name, c.commune, c.postal_code
FROM companies c
WHERE c.naf_code LIKE '62%'
LIMIT 10;
```

### Obtenir les entreprises actives dans une zone
```sql
SELECT c.siren, c.name, c.naf_code, c.commune
FROM companies c
WHERE c.is_active = TRUE AND c.zone_id = 'BRE'
LIMIT 10;
```

## Script Python pour la Connexion

```python
import psycopg2

conn = psycopg2.connect(
    host='aws-0-eu-west-1.pooler.supabase.com',
    port='5432',
    database='postgres',
    user='postgres.zzqyokefesatkgvtdqqt',
    password="J'aimeLesChatons",
    sslmode='require'
)

cursor = conn.cursor()
# Exécuter vos requêtes ici
```

## Supabase Client (JavaScript)

```javascript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://zzqyokefesatkgvtdqqt.supabase.co'
const supabaseKey = 'votre_clé_publishable'  // Obtenez-la depuis Supabase Dashboard
const supabase = createClient(supabaseUrl, supabaseKey)
```

## Fichiers de Données Sources

- **Secteurs**: `/data/sectors.json`
- **Zones**: `/data/zones.json`
- **Entreprises**: `/data/StockUniteLegale_extract_10000.csv`
- **Établissements**: `/data/StockEtablissement_extract_10000.csv`

## Date de Création

**7 octobre 2026** - Base de données initialisée et chargée avec les données INSEE pour B2Bmax MVP1.