// Supabase Table Types for B2BMax

// Companies Table
export interface CompanyRow {
  id: string
  siren: string
  siret: string | null
  name: string
  naf_code: string
  naf_level2: string
  naf_level3: string | null
  naf_level4: string | null
  naf_level5: string | null
  naf_name: string | null
  legal_form: string | null
  address: string | null
  postal_code: string | null
  commune_code: string | null
  commune_name: string | null
  iris_code: string | null
  department_code: string | null
  region_code: string | null
  latitude: number | null
  longitude: number | null
  creation_date: string | null
  closure_date: string | null
  employees_range: string | null
  turnover_range: string | null
  source: string | null
  created_at: string | null
  updated_at: string | null
}

// Market Signals Table (Aggregated Data)
export interface MarketSignalRow {
  id: string
  zone_type: string
  zone_code: string
  zone_name: string
  naf_level: string
  naf_code: string
  naf_name: string | null
  time_period: string
  start_date: string | null
  end_date: string | null
  total_companies: number
  new_companies: number
  closed_companies: number
  net_growth: number
  growth_rate: number
  creation_rate: number
  potential_score: number
  potential_grade: string
  competition_score: number | null
  zone_population: number | null
  zone_area: number | null
  created_at: string | null
}

// User Queries Table
export interface UserQueryRow {
  id: string
  user_id: string | null
  query_text: string
  zone_type: string | null
  zone_code: string | null
  naf_level: string | null
  naf_code: string | null
  results_count: number | null
  created_at: string | null
}

// Zones Table (Geographic Data)
export interface ZoneRow {
  id: string
  code: string
  name: string
  type: string
  parent_code: string | null
  parent_type: string | null
  population: number | null
  area: number | null
  density: number | null
}

// Sectors Table (NAF Codes)
export interface SectorRow {
  id: string
  code: string
  name: string
  level: string
  parent_code: string | null
  parent_level: string | null
  description: string | null
}

// Database Types
export interface Database {
  public: {
    Tables: {
      companies: {
        Row: CompanyRow
        Insert: Omit<CompanyRow, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<CompanyRow>
      }
      market_signals: {
        Row: MarketSignalRow
        Insert: Omit<MarketSignalRow, 'id' | 'created_at'>
        Update: Partial<MarketSignalRow>
      }
      user_queries: {
        Row: UserQueryRow
        Insert: Omit<UserQueryRow, 'id' | 'created_at'>
        Update: Partial<UserQueryRow>
      }
      zones: {
        Row: ZoneRow
        Insert: Omit<ZoneRow, 'id'>
        Update: Partial<ZoneRow>
      }
      sectors: {
        Row: SectorRow
        Insert: Omit<SectorRow, 'id'>
        Update: Partial<SectorRow>
      }
    }
    Views: {}
    Functions: {}
    Enums: {}
    CompositeTypes: {}
  }
}
