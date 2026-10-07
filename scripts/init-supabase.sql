-- B2BMax Supabase Database Schema
-- Project: zzqyokefesatkgvtdqqt

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- Companies table - Raw company data from INSEE
CREATE TABLE IF NOT EXISTS companies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  siren VARCHAR(9) UNIQUE NOT NULL,
  siret VARCHAR(14) UNIQUE,
  name TEXT NOT NULL,
  naf_code VARCHAR(5) NOT NULL,
  naf_level2 VARCHAR(2) NOT NULL,
  naf_level3 VARCHAR(3),
  naf_level4 VARCHAR(4),
  naf_level5 VARCHAR(5),
  naf_name TEXT,
  legal_form TEXT,
  address TEXT,
  postal_code VARCHAR(5),
  commune_code VARCHAR(5),
  commune_name TEXT,
  iris_code VARCHAR(9),
  department_code VARCHAR(3),
  region_code VARCHAR(2),
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  creation_date DATE,
  closure_date DATE,
  employees_range TEXT,
  turnover_range TEXT,
  source TEXT DEFAULT 'insee',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for companies table
CREATE INDEX IF NOT EXISTS idx_companies_siren ON companies(siren);
CREATE INDEX IF NOT EXISTS idx_companies_siret ON companies(siret);
CREATE INDEX IF NOT EXISTS idx_companies_naf_level2 ON companies(naf_level2);
CREATE INDEX IF NOT EXISTS idx_companies_commune_code ON companies(commune_code);
CREATE INDEX IF NOT EXISTS idx_companies_department_code ON companies(department_code);
CREATE INDEX IF NOT EXISTS idx_companies_region_code ON companies(region_code);
CREATE INDEX IF NOT EXISTS idx_companies_creation_date ON companies(creation_date);
CREATE INDEX IF NOT EXISTS idx_companies_lat_lng ON companies(latitude, longitude);

-- Market Signals table - Aggregated data by zone, sector, time
CREATE TABLE IF NOT EXISTS market_signals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  zone_type VARCHAR(10) NOT NULL CHECK (zone_type IN ('iris', 'commune', 'department', 'region')),
  zone_code VARCHAR(10) NOT NULL,
  zone_name TEXT NOT NULL,
  naf_level VARCHAR(10) NOT NULL CHECK (naf_level IN ('naf2', 'naf3', 'naf4', 'naf5')),
  naf_code VARCHAR(5) NOT NULL,
  naf_name TEXT,
  time_period VARCHAR(20) NOT NULL, -- e.g., "2024-Q1", "2024-10", "2024"
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  total_companies INTEGER NOT NULL DEFAULT 0,
  new_companies INTEGER NOT NULL DEFAULT 0,
  closed_companies INTEGER NOT NULL DEFAULT 0,
  net_growth INTEGER NOT NULL DEFAULT 0,
  growth_rate DECIMAL(5,2) NOT NULL DEFAULT 0,
  creation_rate DECIMAL(5,2) NOT NULL DEFAULT 0,
  potential_score DECIMAL(5,2) NOT NULL DEFAULT 0,
  potential_grade VARCHAR(1) NOT NULL DEFAULT 'C' CHECK (potential_grade IN ('A', 'B', 'C', 'D', 'E')),
  competition_score DECIMAL(5,2),
  zone_population INTEGER,
  zone_area DECIMAL(10,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for market_signals table
CREATE INDEX IF NOT EXISTS idx_market_signals_zone ON market_signals(zone_type, zone_code);
CREATE INDEX IF NOT EXISTS idx_market_signals_sector ON market_signals(naf_level, naf_code);
CREATE INDEX IF NOT EXISTS idx_market_signals_period ON market_signals(time_period);
CREATE INDEX IF NOT EXISTS idx_market_signals_potential ON market_signals(potential_score);

-- User Queries table - Track user search history
CREATE TABLE IF NOT EXISTS user_queries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID,
  query_text TEXT NOT NULL,
  zone_type VARCHAR(10),
  zone_code VARCHAR(10),
  naf_level VARCHAR(10),
  naf_code VARCHAR(5),
  results_count INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for user_queries table
CREATE INDEX IF NOT EXISTS idx_user_queries_user ON user_queries(user_id);
CREATE INDEX IF NOT EXISTS idx_user_queries_created ON user_queries(created_at);

-- Zones table - Geographic reference data
CREATE TABLE IF NOT EXISTS zones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code VARCHAR(10) UNIQUE NOT NULL,
  name TEXT NOT NULL,
  type VARCHAR(10) NOT NULL CHECK (type IN ('iris', 'commune', 'department', 'region')),
  parent_code VARCHAR(10),
  parent_type VARCHAR(10),
  population INTEGER,
  area DECIMAL(10,2), -- in km²
  density DECIMAL(10,2), -- inhabitants per km²
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for zones table
CREATE INDEX IF NOT EXISTS idx_zones_code ON zones(code);
CREATE INDEX IF NOT EXISTS idx_zones_type ON zones(type);
CREATE INDEX IF NOT EXISTS idx_zones_parent ON zones(parent_code);

-- Sectors table - NAF code reference data
CREATE TABLE IF NOT EXISTS sectors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code VARCHAR(5) UNIQUE NOT NULL,
  name TEXT NOT NULL,
  level VARCHAR(10) NOT NULL CHECK (level IN ('naf2', 'naf3', 'naf4', 'naf5')),
  parent_code VARCHAR(5),
  parent_level VARCHAR(10),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for sectors table
CREATE INDEX IF NOT EXISTS idx_sectors_code ON sectors(code);
CREATE INDEX IF NOT EXISTS idx_sectors_level ON sectors(level);
CREATE INDEX IF NOT EXISTS idx_sectors_parent ON sectors(parent_code);

-- Function to calculate potential score
CREATE OR REPLACE FUNCTION calculate_potential(
  creation_rate DECIMAL(5,2),
  growth_rate DECIMAL(5,2),
  market_size INTEGER,
  competition_score DECIMAL(5,2)
) RETURNS DECIMAL(5,2) AS $$
DECLARE
  result DECIMAL(5,2);
BEGIN
  -- Normalize each component to 0-100 scale
  -- Creation Rate: 0-20% -> 0-100
  creation_score := LEAST(creation_rate * 5, 100);
  
  -- Growth Rate: -20% to +20% -> 0-100
  IF growth_rate >= 0 THEN
    growth_score := LEAST(growth_rate * 5, 100);
  ELSE
    growth_score := GREATEST(growth_rate * 5 + 100, 0);
  END IF;
  
  -- Market Size: 0-100 companies -> 0-100 (diminishing returns)
  market_score := LEAST(market_size, 100);
  
  -- Competition: 0-100 (inverse relationship)
  competition_normalized := 100 - competition_score;
  
  -- Apply weights
  result := (creation_score * 0.4) + (growth_score * 0.3) + (market_score * 0.2) + (competition_normalized * 0.1);
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Function to determine potential grade
CREATE OR REPLACE FUNCTION get_potential_grade(
  score DECIMAL(5,2)
) RETURNS VARCHAR(1) AS $$
BEGIN
  IF score >= 80 THEN
    RETURN 'A';
  ELSIF score >= 60 THEN
    RETURN 'B';
  ELSIF score >= 40 THEN
    RETURN 'C';
  ELSIF score >= 20 THEN
    RETURN 'D';
  ELSE
    RETURN 'E';
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at on companies table
CREATE OR REPLACE FUNCTION update_companies_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_companies_updated_at ON companies;
CREATE TRIGGER trigger_update_companies_updated_at
  BEFORE UPDATE ON companies
  FOR EACH ROW
  EXECUTE FUNCTION update_companies_updated_at();

-- Insert sample data (optional)
-- Uncomment to insert initial zones and sectors

-- Sample: Insert regions of France
-- INSERT INTO zones (code, name, type, population, area) VALUES
-- ('11', 'Île-de-France', 'region', 12292895, 12011.5),
-- ('24', 'Centre-Val de Loire', 'region', 2572853, 39151.0),
-- ('27', 'Bourgogne-Franche-Comté', 'region', 2811423, 47784.0);

-- Sample: Insert NAF level 2 sectors
-- INSERT INTO sectors (code, name, level, description) VALUES
-- ('56', 'Restauration', 'naf2', 'Restauration and food services'),
-- ('47', 'Commerce de détail', 'naf2', 'Retail trade'),
-- ('62', 'Programmation, conseil', 'naf2', 'Computer programming, consultancy');

-- Sample: Insert a market signal
-- INSERT INTO market_signals (
--   zone_type, zone_code, zone_name, naf_level, naf_code, naf_name,
--   time_period, start_date, end_date,
--   total_companies, new_companies, closed_companies, net_growth,
--   growth_rate, creation_rate, potential_score, potential_grade
-- ) VALUES (
--   'department', '75', 'Paris', 'naf2', '56', 'Restauration',
--   '2024-Q3', '2024-07-01', '2024-09-30',
--   2458, 213, 45, 168, 12.5, 8.65, 87.0, 'A'
-- );

-- Enable Row Level Security (RLS) for public access
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE market_signals ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_queries ENABLE ROW LEVEL SECURITY;
ALTER TABLE zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE sectors ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Allow public read access on companies"
  ON companies FOR SELECT USING (true);

CREATE POLICY "Allow public read access on market_signals"
  ON market_signals FOR SELECT USING (true);

CREATE POLICY "Allow public read access on user_queries"
  ON user_queries FOR SELECT USING (true);

CREATE POLICY "Allow public read access on zones"
  ON zones FOR SELECT USING (true);

CREATE POLICY "Allow public read access on sectors"
  ON sectors FOR SELECT USING (true);

-- Allow insert on user_queries for authenticated users
CREATE POLICY "Allow authenticated insert on user_queries"
  ON user_queries FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Storage for logo files
CREATE STORAGE IF NOT EXISTS b2bmax_logos
  WITH (
    file_size_limit='5MB',
    allowed_mime_types='image/*',
    bucket_name='b2bmax-logos'
  );
