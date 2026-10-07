# Scripts B2Bmax MVP1

Ce dossier contient les scripts nécessaires pour le MVP1 de B2Bmax.

## 📁 Structure

```
scripts/
├── data_loader.py    # Script principal de chargement des données
└── README.md         # Ce fichier
```

## ⚙️ Prérequis

### 1. Python 3.8+

### 2. Dépendances Python

Installer les dépendances avec :

```bash
pip install -r ../requirements.txt
```

### 3. Supabase

- Créer un projet Supabase (le [Free Tier](https://supabase.com/pricing) suffit pour le MVP1)
- Récupérer les informations de connexion :
  - **SUPABASE_URL** : URL de votre projet (ex: `https://votre-projet.supabase.co`)
  - **SUPABASE_SERVICE_KEY** : Clé de service (dans Settings > API)

### 4. Fichiers de données

Les fichiers suivants doivent être présents dans le dossier `data/` :

```
data/
├── StockUniteLegale_extract_10000.csv    # 10K entreprises (1.3 MB)
├── StockEtablissement_extract_10000.csv # 10K établissements (1.9 MB)
├── sectors.json                           # Référence secteurs NAF
└── zones.json                             # Référence zones géographiques
```

## 🚀 Installation et Exécution

### 1. Cloner le projet (si ce n'est pas déjà fait)

```bash
cd /chemin/vers/b2bmax
```

### 2. Configurer l'environnement

Créer un fichier `.env` dans le dossier `insee-api/` :

```bash
cd insee-api
cp .env.example .env
```

Éditer `.env` avec vos informations Supabase :

```env
# Supabase
SUPABASE_URL=https://votre-projet.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

> ⚠️ **Important** : Utilisez la **Service Key** (dans Supabase > Settings > API > Service Key), pas la clé anonyme.

### 3. Exécuter le schéma SQL

Connectez-vous à votre base Supabase et exécutez le schéma :

```bash
# Méthode 1: Via l'interface web Supabase
# 1. Allez dans SQL Editor (https://app.supabase.com/project/votre-projet/sql)
# 2. Copiez le contenu de sql/schema_mvp1.sql
# 3. Exécutez le script

# Méthode 2: Via psql (si vous avez un accès direct)
psql -h db.votre-projet.supabase.co -U postgres -f sql/schema_mvp1.sql
```

### 4. Charger les données

Exécuter le script de chargement :

```bash
cd insee-api
python scripts/data_loader.py
```

**Sortie attendue :**

```
======================================================================
🚀 B2Bmax MVP1 - Chargement des données INSEE
======================================================================

1️⃣ Vérification des fichiers...
   ✅ StockUniteLegale_extract_10000.csv - 1,310,720 bytes
   ✅ StockEtablissement_extract_10000.csv - 1,920,000 bytes
   ✅ sectors.json - 1,782 bytes
   ✅ zones.json - 1,472 bytes

2️⃣ Chargement des fichiers de référence...
   ✅ 9 secteurs chargés
   ✅ 15 zones chargées

3️⃣ Insertion des secteurs...
   ✅ Batch 1: 9 lignes insérées dans sector

4️⃣ Insertion des zones...
   ✅ Batch 1: 15 lignes insérées dans zone

5️⃣ Insertion du mapping commune_to_zone...
   ✅ Batch 1: 5 lignes insérées dans commune_to_zone

6️⃣ Chargement des unités légales...
   📄 10000 lignes lues dans StockUniteLegale_extract_10000.csv
   ✅ 10000 unités légales traitées
   ✅ Batch 1-100: 10000 lignes insérées dans legal_unit

7️⃣ Création du mapping SIREN -> legal_unit.id...
   ✅ Mapping créé: 10000 entrées

8️⃣ Chargement des établissements...
   📄 10000 lignes lues dans StockEtablissement_extract_10000.csv
   ✅ 10000 établissements traités
   ✅ Batch 1-100: 10000 lignes insérées dans establishment

======================================================================
✅ CHARGEMENT TERMINÉ!
======================================================================
   Temps total: 25.34 secondes
   - Secteurs: 9
   - Zones: 15
   - Unités légales: 10000
   - Établissements: 10000

🎉 Les données sont prêtes pour le MVP1!
```

## ✅ Vérification

### 1. Vérifier le nombre de lignes

Dans Supabase SQL Editor, exécutez :

```sql
SELECT 
    (SELECT COUNT(*) FROM sector) AS sectors_count,
    (SELECT COUNT(*) FROM zone) AS zones_count,
    (SELECT COUNT(*) FROM legal_unit) AS legal_units_count,
    (SELECT COUNT(*) FROM establishment) AS establishments_count;
```

Résultat attendu :

| sectors_count | zones_count | legal_units_count | establishments_count |
|--------------|-------------|------------------|--------------------|
| 9+ | 15+ | 10000 | 10000 |

### 2. Tester une requête de base

```sql
-- Entreprises en Bretagne
SELECT * FROM companies_with_geo 
WHERE zone_name = 'Bretagne' 
LIMIT 10;

-- Statistiques par secteur
SELECT * FROM company_stats 
WHERE zone_name = 'Bretagne' 
ORDER BY company_count DESC;

-- Recherche d'entreprises dans le numérique
SELECT * FROM searchable_companies 
WHERE sector_code LIKE 'J%' 
   OR sector_code LIKE '62.%' 
   OR sector_code LIKE '63.%'
LIMIT 20;
```

### 3. Utiliser les fonctions

```sql
-- Compter les entreprises par secteur et zone
SELECT * FROM count_companies_by_sector_and_zone('BRE', 'J');

-- Trouver les entreprises dans un secteur et une zone
SELECT * FROM find_companies(
    ARRAY['BRE', '29', '35']::TEXT[],  -- Bretagne, Finistère, Ille-et-Vilaine
    ARRAY['J', '62']::TEXT[]           -- Information et communication, Programmation
);
```

## 🎯 Cas d'usage MVP1

### Exemple 1: "Quelles sont les PME en Bretagne dans le secteur du numérique ?"

```sql
WITH results AS (
    SELECT 
        COUNT(DISTINCT lu.siren) AS company_count,
        COUNT(DISTINCT e.siret) AS establishment_count,
        COUNT(DISTINCT CASE WHEN lu.creation_date >= NOW() - INTERVAL '12 months' THEN lu.siren END) AS new_companies_12m,
        COUNT(DISTINCT CASE WHEN lu.administrative_status = 'C' AND lu.radiation_date >= NOW() - INTERVAL '12 months' THEN lu.siren END) AS closed_companies_12m
    FROM legal_unit lu
    JOIN establishment e ON lu.siren = e.legal_unit_siren
    JOIN sector s ON lu.main_activity_code = s.naf_code
    JOIN zone z ON e.zone_id = z.id
    WHERE 
        (s.naf_code = 'J' OR s.naf_code LIKE 'J.%') AND  -- Information et communication
        z.code = 'BRE' AND  -- Bretagne
        lu.category = 'PME' AND
        lu.is_active = TRUE
)
SELECT 
    company_count AS "Nombre total d'entreprises",
    establishment_count AS "Nombre total d'établissements",
    new_companies_12m AS "Nouveaux (12 mois)",
    closed_companies_12m AS "Fermés (12 mois)",
    (new_companies_12m - closed_companies_12m) AS "Variation nette"
FROM results;
```

### Exemple 2: Liste des entreprises avec leurs coordonnées

```sql
SELECT 
    lu.siren,
    lu.name AS company_name,
    s.name AS sector_name,
    e.commune_name,
    e.postal_code,
    e.address,
    e.lambert_x,
    e.lambert_y
FROM legal_unit lu
JOIN establishment e ON lu.siren = e.legal_unit_siren
JOIN sector s ON lu.main_activity_code = s.naf_code
WHERE e.zone_id IN (
    SELECT id FROM zone WHERE code = 'BRE'
)
LIMIT 50;
```

## 🔧 Dépannage

### Problème : Connection refused

**Solution :** Vérifiez que :
1. Votre projet Supabase est bien démarré
2. L'URL dans `.env` est correcte
3. Vous utilisez bien la **Service Key**, pas la clé anonyme

### Problème : Erreur d'insertion

**Solution :** Vérifiez que :
1. Le schéma a bien été exécuté avant le chargement
2. Les contraintes de clé unique ne sont pas violées
3. Les types de données sont corrects

### Problème : Fichiers non trouvés

**Solution :** Vérifiez que :
1. Les fichiers CSV et JSON sont bien dans le dossier `data/`
2. Les noms des fichiers correspondent exactement (sensible à la casse)
3. Vous exécutez le script depuis le bon répertoire

## 📚 Documentation Complète

- [Spécification technique](../specs/001-b2bmax-chat-insee/spec.md)
- [Plan d'implémentation](../specs/001-b2bmax-chat-insee/plan.md)
- [Modèle de données](../specs/001-b2bmax-chat-insee/data-model.md)
- [Quickstart](../specs/001-b2bmax-chat-insee/quickstart.md)

## 💬 Support

Pour toute question, ouvrir une issue dans le dépôt ou contacter l'équipe.
