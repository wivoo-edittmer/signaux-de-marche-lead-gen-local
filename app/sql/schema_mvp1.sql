-- =============================================
-- SCHEMA MVP1 - B2Bmax
-- Adapté pour les fichiers extract_10000.csv
-- Version: 1.0
-- Date: 2026-10-07
-- =============================================

-- Extension UUID (nécessaire pour les UUID)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- 1. TABLES DE RÉFÉRENCE (STATIQUES)
-- Données de référence pour les secteurs NAF et zones géographiques
-- =============================================

-- Secteurs NAF (Nomenclature d'Activités Française)
CREATE TABLE IF NOT EXISTS sector (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    naf_code VARCHAR(10) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    level INTEGER NOT NULL CHECK (level BETWEEN 1 AND 3),
    parent_id UUID REFERENCES sector(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Zones géographiques (régions, départements, communes)
CREATE TABLE IF NOT EXISTS zone (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(10) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    level VARCHAR(20) NOT NULL CHECK (level IN ('region', 'department', 'commune')),
    parent_id UUID REFERENCES zone(id) ON DELETE SET NULL,
    insee_code VARCHAR(10) UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Mapping entre codes commune INSEE et zones
CREATE TABLE IF NOT EXISTS commune_to_zone (
    commune_code VARCHAR(10) PRIMARY KEY,
    zone_id UUID NOT NULL REFERENCES zone(id) ON DELETE CASCADE
);

-- =============================================
-- 2. TABLES INSEE (DONNÉES LOCALES)
-- Basées sur les fichiers extract_10000.csv
-- =============================================

-- Unités Légales (entreprises)
-- Source: StockUniteLegale_extract_10000.csv
CREATE TABLE IF NOT EXISTS legal_unit (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    siren VARCHAR(9) UNIQUE NOT NULL CHECK (siren ~ '^\d{9}$'),
    name VARCHAR(255) NOT NULL,
    legal_form VARCHAR(100),
    category VARCHAR(50),
    employee_range VARCHAR(50),
    main_activity_code VARCHAR(10),
    administrative_status VARCHAR(10) NOT NULL CHECK (administrative_status IN ('A', 'C')),
    creation_date DATE,
    radiation_date DATE,
    is_active BOOLEAN GENERATED ALWAYS AS (administrative_status = 'A') STORED,
    nic_siege VARCHAR(5) CHECK (nic_siege ~ '^\d{5}$' OR nic_siege IS NULL),
    insee_data JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Établissements (sites physiques)
-- Source: StockEtablissement_extract_10000.csv
CREATE TABLE IF NOT EXISTS establishment (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    siret VARCHAR(14) UNIQUE NOT NULL CHECK (siret ~ '^\d{14}$'),
    legal_unit_siren VARCHAR(9) NOT NULL REFERENCES legal_unit(siren) ON DELETE CASCADE,
    nic VARCHAR(5) NOT NULL CHECK (nic ~ '^\d{5}$'),
    is_headquarters BOOLEAN,
    -- Géolocalisation
    postal_code VARCHAR(10),
    commune_name VARCHAR(100),
    commune_code VARCHAR(10) CHECK (commune_code ~ '^\d{5}$' OR commune_code IS NULL),
    zone_id UUID REFERENCES zone(id) ON DELETE SET NULL,
    lambert_x FLOAT,
    lambert_y FLOAT,
    -- Activité
    activity_code VARCHAR(10),
    naf25_code VARCHAR(10),
    administrative_status VARCHAR(10),
    is_employer BOOLEAN,
    start_date DATE,
    -- Adresse
    address TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 3. INDEX POUR LES PERFORMANCES
-- =============================================

-- Index pour Sector
CREATE INDEX IF NOT EXISTS idx_sector_naf_code ON sector(naf_code);
CREATE INDEX IF NOT EXISTS idx_sector_parent ON sector(parent_id);
CREATE INDEX IF NOT EXISTS idx_sector_level ON sector(level);

-- Index pour Zone
CREATE INDEX IF NOT EXISTS idx_zone_code ON zone(code);
CREATE INDEX IF NOT EXISTS idx_zone_parent ON zone(parent_id);
CREATE INDEX IF NOT EXISTS idx_zone_level ON zone(level);

-- Index pour legal_unit (recherche rapide)
CREATE INDEX IF NOT EXISTS idx_legal_unit_siren ON legal_unit(siren);
CREATE INDEX IF NOT EXISTS idx_legal_unit_main_activity ON legal_unit(main_activity_code);
CREATE INDEX IF NOT EXISTS idx_legal_unit_category ON legal_unit(category);
CREATE INDEX IF NOT EXISTS idx_legal_unit_active ON legal_unit(is_active) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_legal_unit_creation_date ON legal_unit(creation_date);

-- Index pour establishment (recherche géographique)
CREATE INDEX IF NOT EXISTS idx_establishment_siret ON establishment(siret);
CREATE INDEX IF NOT EXISTS idx_establishment_legal_unit ON establishment(legal_unit_siren);
CREATE INDEX IF NOT EXISTS idx_establishment_commune_code ON establishment(commune_code);
CREATE INDEX IF NOT EXISTS idx_establishment_zone ON establishment(zone_id);
CREATE INDEX IF NOT EXISTS idx_establishment_postal_code ON establishment(postal_code);
CREATE INDEX IF NOT EXISTS idx_establishment_active ON establishment(administrative_status) WHERE administrative_status = 'A';

-- Index pour commune_to_zone
CREATE INDEX IF NOT EXISTS idx_commune_to_zone_id ON commune_to_zone(zone_id);

-- =============================================
-- 4. VUES POUR LES REQUÊTES MVP1
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
    COALESCE(s.name, 'Inconnu') AS sector_name,
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
    e.is_employer,
    lu.creation_date,
    e.start_date AS establishment_start_date
FROM legal_unit lu
LEFT JOIN establishment e ON lu.siren = e.legal_unit_siren
LEFT JOIN sector s ON lu.main_activity_code = s.naf_code
LEFT JOIN zone z ON e.zone_id = z.id;

-- Vue pour la recherche d'entreprises (MVP1)
CREATE OR REPLACE VIEW searchable_companies AS
SELECT 
    lu.siren,
    lu.name,
    lu.category,
    lu.employee_range,
    lu.main_activity_code AS sector_code,
    COALESCE(s.name, 'Inconnu') AS sector_name,
    e.commune_code,
    e.postal_code,
    e.commune_name,
    z.code AS zone_code,
    z.name AS zone_name,
    z.level AS zone_level,
    e.address,
    lu.is_active,
    lu.creation_date,
    e.start_date AS establishment_start_date,
    e.lambert_x,
    e.lambert_y
FROM legal_unit lu
LEFT JOIN establishment e ON lu.siren = e.legal_unit_siren
LEFT JOIN sector s ON lu.main_activity_code = s.naf_code
LEFT JOIN zone z ON e.zone_id = z.id
WHERE lu.is_active = TRUE AND e.administrative_status = 'A';

-- =============================================
-- 5. FONCTIONS UTILES POUR LES REQUÊTES
-- =============================================

-- Compter les entreprises par secteur dans une zone
CREATE OR REPLACE FUNCTION count_companies_by_sector_and_zone(
    p_zone_code VARCHAR DEFAULT NULL,
    p_sector_code VARCHAR DEFAULT NULL
) RETURNS TABLE (
    sector_code VARCHAR,
    sector_name VARCHAR,
    zone_code VARCHAR,
    zone_name VARCHAR,
    zone_level VARCHAR,
    company_count BIGINT,
    establishment_count BIGINT,
    active_company_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COALESCE(s.naf_code, 'Inconnu') AS sector_code,
        COALESCE(s.name, 'Inconnu') AS sector_name,
        COALESCE(z.code, 'Inconnu') AS zone_code,
        COALESCE(z.name, 'Inconnu') AS zone_name,
        COALESCE(z.level, 'unknown') AS zone_level,
        COUNT(DISTINCT lu.siren) AS company_count,
        COUNT(DISTINCT e.siret) AS establishment_count,
        COUNT(DISTINCT CASE WHEN lu.is_active THEN lu.siren END) AS active_company_count
    FROM legal_unit lu
    LEFT JOIN establishment e ON lu.siren = e.legal_unit_siren
    LEFT JOIN sector s ON 
        (p_sector_code IS NULL AND lu.main_activity_code = s.naf_code) OR
        (p_sector_code IS NOT NULL AND (s.naf_code = p_sector_code OR s.naf_code LIKE p_sector_code || '.%'))
    LEFT JOIN zone z ON e.zone_id = z.id
    WHERE 
        (p_zone_code IS NULL OR 
         z.code = p_zone_code OR 
         z.parent_id IN (SELECT id FROM zone WHERE code = p_zone_code))
    GROUP BY s.naf_code, s.name, z.code, z.name, z.level;
END;
$$ LANGUAGE plpgsql;

-- Trouver les entreprises dans des zones et secteurs spécifiques
CREATE OR REPLACE FUNCTION find_companies(
    p_zone_codes TEXT[] DEFAULT NULL,
    p_sector_codes TEXT[] DEFAULT NULL,
    p_category VARCHAR DEFAULT NULL
) RETURNS TABLE (
    siren VARCHAR,
    name VARCHAR,
    category VARCHAR,
    employee_range VARCHAR,
    sector_code VARCHAR,
    sector_name VARCHAR,
    zone_code VARCHAR,
    zone_name VARCHAR,
    commune_name VARCHAR,
    postal_code VARCHAR,
    address TEXT,
    is_active BOOLEAN,
    creation_date DATE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        lu.siren,
        lu.name,
        lu.category,
        lu.employee_range,
        lu.main_activity_code AS sector_code,
        COALESCE(s.name, 'Inconnu') AS sector_name,
        COALESCE(z.code, 'Inconnu') AS zone_code,
        COALESCE(z.name, 'Inconnu') AS zone_name,
        e.commune_name,
        e.postal_code,
        e.address,
        lu.is_active,
        lu.creation_date
    FROM legal_unit lu
    LEFT JOIN establishment e ON lu.siren = e.legal_unit_siren
    LEFT JOIN sector s ON lu.main_activity_code = s.naf_code
    LEFT JOIN zone z ON e.zone_id = z.id
    WHERE 
        (p_zone_codes IS NULL OR z.code = ANY(p_zone_codes)) AND
        (p_sector_codes IS NULL OR s.naf_code = ANY(p_sector_codes) OR lu.main_activity_code = ANY(p_sector_codes)) AND
        (p_category IS NULL OR lu.category = p_category)
    GROUP BY lu.siren, lu.name, lu.category, lu.employee_range, 
             lu.main_activity_code, s.name, z.code, z.name, 
             e.commune_name, e.postal_code, e.address, lu.is_active, lu.creation_date;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- 6. DONNÉES DE TEST (OPTIONNEL)
-- =============================================

-- Insertion de données de test pour validation rapide
-- À utiliser uniquement pour le développement

-- INSERT INTO sector (id, naf_code, name, description, level, parent_id) VALUES
--     ('00000000-0000-0000-0000-000000000001', 'J', 'Information et communication', 'Services d''information et de communication', 1, NULL),
--     ('00000000-0000-0000-0000-000000000002', '62', 'Programmation et conseil informatique', 'Programmation, conseil et autres activités informatiques', 2, '00000000-0000-0000-0000-000000000001');

-- INSERT INTO zone (id, code, name, level, parent_id, insee_code) VALUES
--     ('10000000-0000-0000-0000-000000000001', 'BRE', 'Bretagne', 'region', NULL, NULL),
--     ('10000000-0000-0000-0000-000000000002', '35', 'Ille-et-Vilaine', 'department', '10000000-0000-0000-0000-000000000001', NULL),
--     ('10000000-0000-0000-0000-000000000003', '35000', 'Rennes', 'commune', '10000000-0000-0000-0000-000000000002', '35000');

-- =============================================
-- INSTRUCTIONS D'EXÉCUTION
-- =============================================

-- 1. Exécuter ce script dans l'éditeur SQL de Supabase
-- 2. Puis exécuter: python scripts/data_loader.py
-- 3. Temps estimé: < 1 minute pour le schéma, < 30 secondes pour le chargement

-- Note: Pour MVP1, RLS est désactivé par défaut (données publiques INSEE)
