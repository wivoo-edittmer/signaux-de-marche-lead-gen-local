// Company Types
export interface Company {
  siren: string
  siret: string
  name: string
  naf_code: string
  naf_name: string
  legal_form: string
  address: string
  postal_code: string
  commune_code: string
  commune_name: string
  iris_code: string
  department_code: string
  region_code: string
  latitude: number
  longitude: number
  creation_date: string
  closure_date: string | null
  employees_range: string
  turnover_range: string
}

// Zone Types
export type ZoneType = 'iris' | 'commune' | 'department' | 'region'

export interface Zone {
  code: string
  name: string
  type: ZoneType
  parent?: {
    code: string
    name: string
    type: ZoneType
  }
  population?: number
  area?: number
}

// Sector Types
export type SectorLevel = 'naf2' | 'naf3' | 'naf4' | 'naf5'

export interface Sector {
  code: string
  name: string
  level: SectorLevel
  parent?: {
    code: string
    name: string
    level: SectorLevel
  }
  description?: string
}

// Potential KPI Types
export interface PotentialBreakdown {
  creationRate: number
  growthRate: number
  marketSize: number
  competition: number
}

export interface PotentialComparison {
  zoneRank: number
  sectorRank: number
  nationalPercentile: number
}

export interface PotentialResult {
  score: number
  grade: 'A' | 'B' | 'C' | 'D' | 'E'
  breakdown: PotentialBreakdown
  comparison: PotentialComparison
  data?: {
    totalCompanies: number
    newCompanies: number
    closedCompanies: number
    zonePopulation?: number
    zoneArea?: number
    sectorCompaniesNational?: number
  }
}

// API Response Types
export interface CompaniesResponse {
  data: Company[]
  total: number
  limit: number
  offset: number
  hasMore: boolean
}

export interface ZoneInfo {
  code: string
  name: string
  type: ZoneType
  parent?: {
    code: string
    name: string
    type: ZoneType
  }
  children?: {
    code: string
    name: string
    type: ZoneType
  }[]
  population: number
  area: number
  density: number
}

export interface SectorInfo {
  code: string
  name: string
  level: SectorLevel
  parent?: {
    code: string
    name: string
    level: SectorLevel
  }
  children?: {
    code: string
    name: string
    level: SectorLevel
  }[]
  description: string
}

// Message Types (for Chat)
export interface Message {
  id: string
  role: 'user' | 'ai'
  content: string
  data?: any
  timestamp: Date
}

// Filter Types
export interface Filters {
  zone?: string
  zoneType?: ZoneType
  sector?: string
  sectorLevel?: SectorLevel
  startDate?: string
  endDate?: string
}

// Selector Props
export interface ZoneOption {
  code: string
  name: string
  type: ZoneType
}

export interface SectorOption {
  code: string
  name: string
  type: SectorLevel
}
