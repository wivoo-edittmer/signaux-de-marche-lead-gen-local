# B2BMax Integration Guide

**Complete integration guide for connecting Supabase, MCP, Mapbox, and Next.js frontend**

---

## Overview

This guide explains how all components of B2BMax work together:
- **Frontend**: Next.js with Tailwind CSS (Mistral Charter)
- **Database**: Supabase (`zzqyokefesatkgvtdqqt`)
- **Data Source**: data.gouv.fr via MCP
- **Mapping**: Mapbox for geographic visualization

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        User Browser                                │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                  Next.js Application                         │    │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │    │
│  │  │   Pages     │  │  Components  │  │    State    │        │    │
│  │  │  - Home     │  │  - Header    │  │   (Zustand) │        │    │
│  │  │  - Explore  │  │  - Footer    │  │            │        │    │
│  │  │  - Ask     │  │  - Selectors │  │            │        │    │
│  │  └─────────────┘  │  - Mapbox    │  │            │        │    │
│  │                  └─────────────┘  └─────────────┘        │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     Next.js API Routes                             │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  /api/companies     - Fetch & cache from Supabase          │    │
│  │  /api/potential      - Calculate KPI using Supabase data     │    │
│  │  /api/zones          - Geographic lookup from Supabase      │    │
│  │  /api/sectors        - Sector lookup from Supabase          │    │
│  │  /api/mcp           - Direct MCP access (fallback)         │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
         │                              │                            │
         ▼                              ▼                            ▼
┌─────────────────┐    ┌─────────────────────┐    ┌─────────────────┐
│  Supabase DB     │    │   data.gouv.fr MCP   │    │   Mapbox        │
│                 │    │                     │    │                 │
│ - companies     │◄───┤  - Company data    │    │ - Maps          │
│ - market_signals│    │  - INSEE data       │    │ - Geocoding     │
│ - zones         │    │  - Economic data     │    │ - Heatmaps      │
│ - sectors       │    │                     │    │ - Clusters      │
│ - user_queries  │    │                     │    │                 │
└─────────────────┘    └─────────────────────┘    └─────────────────┘
```

---

## Component Relationships

### 1. Frontend ↔ API Routes

```
Frontend Components → API Routes → Data Sources
│                    │
├─ MarketMap       → /api/companies
│                 → /api/potential
│                 → Mapbox
│
├─ PotentialDisplay → /api/potential
│
├─ ChatInterface   → /api/chat (future)
│                 → MCP (direct)
│
└─ Selectors       → /api/zones
                   → /api/sectors
```

### 2. API Routes ↔ Data Sources

| API Route | Primary Data Source | Secondary Data Source | Purpose |
|-----------|---------------------|------------------------|---------|
| `/api/companies` | Supabase | MCP (fallback) | Fetch company data |
| `/api/potential` | Supabase | - | Calculate KPI |
| `/api/zones` | Supabase | MCP | Geographic data |
| `/api/sectors` | Supabase | MCP | NAF code data |

---

## Integration Steps

### Step 1: Set Up Environment

```bash
# Clone repository
cd b2bmax

# Install dependencies
npm install

# Set up environment
cp .env.example .env.local

# Edit .env.local
NEXT_PUBLIC_SUPABASE_URL=https://zzqyokefesatkgvtdqqt.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key
NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_token
```

### Step 2: Initialize Supabase Database

**Option A: SQL Editor**
1. Go to https://supabase.com/dashboard/project/zzqyokefesatkgvtdqqt
2. Open SQL Editor
3. Run `scripts/init-supabase.sql`

**Option B: Supabase CLI**
```bash
npx supabase link --project-ref zzqyokefesatkgvtdqqt
npx supabase db push
```

### Step 3: Seed Initial Data

**Manual Seed (SQL Editor):**
```sql
-- Insert regions
INSERT INTO zones (code, name, type, population, area) VALUES
('11', 'Île-de-France', 'region', 12292895, 12011.5),
('24', 'Centre-Val de Loire', 'region', 2572853, 39151.0),
('27', 'Bourgogne-Franche-Comté', 'region', 2811423, 47784.0);

-- Insert NAF level 2 sectors
INSERT INTO sectors (code, name, level) VALUES
('56', 'Restauration', 'naf2'),
('47', 'Commerce de détail', 'naf2'),
('62', 'Programmation, conseil', 'naf2');
```

**Automated Seed (Future):**
```bash
npm run seed:zones
npm run seed:sectors
```

### Step 4: Connect Data Sources

#### MCP Connection

The data.gouv.fr MCP server is configured in `~/.vibe/config.toml`:

```toml
[[mcp_servers]]
name = "datagouv"
transport = "streamable-http"
url = "https://mcp.data.gouv.fr/mcp"
```

**API Route Example:**
```typescript
// app/api/mcp/route.ts
import { MCPClient } from '@modelcontextprotocol/sdk'

export async function GET(request: Request) {
  const mcp = new MCPClient({
    url: 'https://mcp.data.gouv.fr/mcp',
    transport: 'streamable-http',
  })

  const data = await mcp.callTool({
    name: 'search_companies',
    arguments: { zone: '75', sector: '56' }
  })

  return Response.json(data)
}
```

#### Supabase Connection

**Frontend Client:**
```typescript
// lib/supabase/client.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl!, supabaseAnonKey!)
```

**Backend Client:**
```typescript
// lib/supabase/admin-client.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

export const supabaseAdmin = createClient(supabaseUrl!, serviceRoleKey!)
```

### Step 5: Implement Data Pipeline

#### Pipeline 1: Direct MCP → Frontend (Real-time)

```typescript
// components/MarketMap.tsx
async function fetchCompanies(zone: string, sector: string) {
  const response = await fetch(`/api/mcp?zone=${zone}&sector=${sector}`)
  return response.json()
}
```

#### Pipeline 2: MCP → Supabase → Frontend (Cached)

```typescript
// app/api/companies/route.ts
import { supabase } from '@/lib/supabase/client'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const zone = searchParams.get('zone')
  const sector = searchParams.get('sector')

  // Try Supabase first
  const { data: cachedData, error } = await supabase
    .from('companies')
    .select('*')
    .eq('commune_code', zone)
    .eq('naf_level2', sector)

  if (cachedData && cachedData.length > 0) {
    return Response.json({ source: 'supabase', data: cachedData })
  }

  // Fallback to MCP
  const mcpResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/mcp?zone=${zone}&sector=${sector}`)
  const mcpData = await mcpResponse.json()

  // Cache in Supabase
  if (mcpData.data && mcpData.data.length > 0) {
    const { error: insertError } = await supabase
      .from('companies')
      .insert(mcpData.data)
  }

  return Response.json({ source: 'mcp', data: mcpData.data })
}
```

#### Pipeline 3: Supabase Aggregation → Market Signals

```typescript
// scripts/aggregate-data.ts
import { supabaseAdmin } from '@/lib/supabase/client'

export async function aggregateMarketSignals() {
  const { data: zones, error: zonesError } = await supabaseAdmin
    .from('zones')
    .select('*')
    .eq('type', 'commune')

  const { data: sectors, error: sectorsError } = await supabaseAdmin
    .from('sectors')
    .select('*')
    .eq('level', 'naf2')

  for (const zone of zones || []) {
    for (const sector of sectors || []) {
      const { count: totalCompanies } = await supabaseAdmin
        .from('companies')
        .select('*', { count: 'exact' })
        .eq('commune_code', zone.code)
        .eq('naf_level2', sector.code)

      const { count: newCompanies } = await supabaseAdmin
        .from('companies')
        .select('*', { count: 'exact' })
        .eq('commune_code', zone.code)
        .eq('naf_level2', sector.code)
        .gte('creation_date', '2024-01-01')
        .lte('creation_date', '2024-10-07')

      const { count: closedCompanies } = await supabaseAdmin
        .from('companies')
        .select('*', { count: 'exact' })
        .eq('commune_code', zone.code)
        .eq('naf_level2', sector.code)
        .gte('closure_date', '2024-01-01')
        .lte('closure_date', '2024-10-07')

      // Calculate KPI
      const creationRate = (newCompanies || 0) / Math.max(totalCompanies || 1, 1) * 100
      const growthRate = ((newCompanies || 0) - (closedCompanies || 0)) / Math.max(totalCompanies || 1, 1) * 100
      const competitionScore = (totalCompanies || 0) / (zone.population || 1) * 100

      const potentialScore = calculatePotential(
        creationRate,
        growthRate,
        totalCompanies || 0,
        competitionScore
      )

      const grade = getPotentialGrade(potentialScore)

      // Insert into market_signals
      await supabaseAdmin
        .from('market_signals')
        .insert({
          zone_type: 'commune',
          zone_code: zone.code,
          zone_name: zone.name,
          naf_level: 'naf2',
          naf_code: sector.code,
          naf_name: sector.name,
          time_period: '2024-Q3',
          start_date: '2024-07-01',
          end_date: '2024-09-30',
          total_companies: totalCompanies || 0,
          new_companies: newCompanies || 0,
          closed_companies: closedCompanies || 0,
          net_growth: (newCompanies || 0) - (closedCompanies || 0),
          growth_rate: growthRate,
          creation_rate: creationRate,
          potential_score: potentialScore,
          potential_grade: grade,
          competition_score: competitionScore,
          zone_population: zone.population,
          zone_area: zone.area,
        })
    }
  }
}
```

---

## API Route Examples

### GET /api/companies

**Purpose:** Fetch company data
**Sources:** Supabase (primary) → MCP (fallback)

```typescript
// app/api/companies/route.ts
import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/client'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  
  const zone = searchParams.get('zone')
  const zoneType = searchParams.get('zoneType') || 'commune'
  const sector = searchParams.get('sector')
  const sectorLevel = searchParams.get('sectorLevel') || 'naf2'
  const startDate = searchParams.get('startDate')
  const endDate = searchParams.get('endDate')
  const limit = parseInt(searchParams.get('limit') || '100')
  const offset = parseInt(searchParams.get('offset') || '0')

  try {
    // Build query
    let query = supabase
      .from('companies')
      .select('*', { count: 'exact' })
      .range(offset, offset + limit - 1)

    // Apply filters
    if (zone && zoneType) {
      const columnMap = {
        iris: 'iris_code',
        commune: 'commune_code',
        department: 'department_code',
        region: 'region_code',
      }
      const column = columnMap[zoneType as keyof typeof columnMap]
      if (column) {
        query = query.eq(column, zone)
      }
    }

    if (sector && sectorLevel) {
      const column = `naf_level${sectorLevel.replace('naf', '')}`
      query = query.eq(column, sector)
    }

    if (startDate) {
      query = query.gte('creation_date', startDate)
    }

    if (endDate) {
      query = query.lte('creation_date', endDate)
    }

    const { data: companies, count, error } = await query

    if (error) throw error

    return NextResponse.json({
      data: companies || [],
      total: count || 0,
      limit,
      offset,
      hasMore: offset + limit < (count || 0),
    })

  } catch (error) {
    console.error('Error fetching companies:', error)
    return NextResponse.json(
      { error: 'Failed to fetch companies' },
      { status: 500 }
    )
  }
}
```

### GET /api/potential

**Purpose:** Calculate Potential KPI
**Sources:** Supabase (market_signals table)

```typescript
// app/api/potential/route.ts
import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/client'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  
  const zone = searchParams.get('zone')
  const zoneType = searchParams.get('zoneType')
  const sector = searchParams.get('sector')
  const sectorLevel = searchParams.get('sectorLevel')
  const startDate = searchParams.get('startDate')
  const endDate = searchParams.get('endDate')

  if (!zone || !zoneType || !sector || !sectorLevel) {
    return NextResponse.json(
      { error: 'Missing required parameters' },
      { status: 400 }
    )
  }

  try {
    // Query market_signals table
    let query = supabase
      .from('market_signals')
      .select('*')
      .eq('zone_type', zoneType)
      .eq('zone_code', zone)
      .eq('naf_level', sectorLevel)
      .eq('naf_code', sector)

    if (startDate && endDate) {
      query = query
        .gte('start_date', startDate)
        .lte('end_date', endDate)
    }

    query = query.order('start_date', { ascending: false })

    const { data: signals, error } = await query

    if (error) throw error

    if (!signals || signals.length === 0) {
      return NextResponse.json(
        { error: 'No data found for the specified parameters' },
        { status: 404 }
      )
    }

    // Return the most recent signal
    const latestSignal = signals[0]

    return NextResponse.json({
      score: latestSignal.potential_score,
      grade: latestSignal.potential_grade,
      breakdown: {
        creationRate: parseFloat(latestSignal.creation_rate.toFixed(1)),
        growthRate: parseFloat(latestSignal.growth_rate.toFixed(1)),
        marketSize: latestSignal.total_companies,
        competition: parseFloat(latestSignal.competition_score?.toFixed(1) || '0'),
      },
      comparison: {
        zoneRank: 0, // Would be calculated from all zones
        sectorRank: 0, // Would be calculated from all sectors
        nationalPercentile: 0, // Would be calculated
      },
      data: {
        totalCompanies: latestSignal.total_companies,
        newCompanies: latestSignal.new_companies,
        closedCompanies: latestSignal.closed_companies,
        zonePopulation: latestSignal.zone_population,
        zoneArea: latestSignal.zone_area,
      },
    })

  } catch (error) {
    console.error('Error fetching potential:', error)
    return NextResponse.json(
      { error: 'Failed to fetch potential' },
      { status: 500 }
    )
  }
}
```

---

## Mapbox Integration

### Setup

1. **Install Mapbox GL JS:**
```bash
npm install mapbox-gl @mapbox/mapbox-gl-geocoder
```

2. **Set token in environment:**
```
NEXT_PUBLIC_MAPBOX_TOKEN=your_token_here
```

3. **Use in components:**
```typescript
// components/MarketMap.tsx
import { useEffect, useRef } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!

// Use in useEffect
effect(() => {
  const map = new mapboxgl.Map({
    container: mapContainer.current,
    style: 'mapbox://styles/mapbox/light-v10',
    center: [2.3522, 46.6034], // France
    zoom: 5,
  })
}, [])
```

### Heatmap Example

```typescript
// Add heatmap layer
map.addSource('companies', {
  type: 'geojson',
  data: {
    type: 'FeatureCollection',
    features: companies.map(company => ({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [company.longitude, company.latitude],
      },
      properties: {
        potential: company.potential_score,
      },
    })),
  },
})

map.addLayer({
  id: 'companies-heat',
  type: 'heatmap',
  source: 'companies',
  paint: {
    'heatmap-weight': ['get', 'potential'],
    'heatmap-intensity': ['interpolate', ['linear'], ['zoom'], 0, 1, 9, 3],
    'heatmap-color': [
      'interpolate',
      ['linear'],
      ['heatmap-density'],
      0,
      'rgba(236, 222, 10, 0)',
      0.5,
      'rgba(240, 164, 43, 0.7)',
      1,
      'rgba(255, 112, 0, 1)',
    ],
  },
})
```

---

## Data Flow Examples

### Example 1: User Explores Paris Restaurants

```
1. User navigates to /explore
2. User selects: Zone="Paris", Sector="Restauration", Period="2024-Q3"
3. Frontend calls: GET /api/companies?zone=75&sector=56&startDate=2024-07-01&endDate=2024-09-30
4. API route queries Supabase: 
   SELECT * FROM companies 
   WHERE commune_code = '75' AND naf_level2 = '56' 
   AND creation_date BETWEEN '2024-07-01' AND '2024-09-30'
5. Supabase returns 213 companies
6. Frontend renders company list and statistics
7. User clicks on potential score
8. Frontend calls: GET /api/potential?zone=75&zoneType=commune&sector=56&sectorLevel=naf2
9. API route queries Supabase: 
   SELECT * FROM market_signals 
   WHERE zone_type = 'commune' AND zone_code = '75' 
   AND naf_level = 'naf2' AND naf_code = '56'
10. Supabase returns market signal with potential_score=87, grade='A'
11. Frontend displays Potential Card with score 87
```

### Example 2: User Asks AI About Lyon Software Sector

```
1. User navigates to /ask
2. User types: "What is the potential for software companies in Lyon?"
3. Frontend sends message to chat
4. Chat identifies intent: potential query for Lyon + software (NAF 62)
5. Chat calls: GET /api/potential?zone=69001&zoneType=commune&sector=62&sectorLevel=naf2
6. API route returns potential data
7. Frontend renders Potential Card in chat response
8. User sees: Score 94, Grade A, with breakdown
```

### Example 3: Scheduled Data Aggregation

```
1. Cron job runs every 24 hours
2. Script calls: npm run aggregate:data
3. Script fetches new data from MCP
4. Script inserts into Supabase companies table
5. Script runs aggregation function
6. Script inserts into market_signals table
7. Users see fresh data on next visit
```

---

## Performance Optimization

### 1. Caching Strategies

**API Route Caching:**
```typescript
// app/api/companies/route.ts
import { cache } from 'react'

export const dynamic = 'force-dynamic' // Disable static caching
// OR
export const revalidate = 300 // Revalidate every 5 minutes
```

**In-Memory Caching:**
```typescript
// lib/cache.ts
const cache = new Map<string, { data: any; timestamp: number }>()

const CACHE_TTL = 300000 // 5 minutes

export function getCached(key: string): any | null {
  const item = cache.get(key)
  if (!item) return null
  if (Date.now() - item.timestamp > CACHE_TTL) {
    cache.delete(key)
    return null
  }
  return item.data
}

export function setCached(key: string, data: any): void {
  cache.set(key, { data, timestamp: Date.now() })
}
```

### 2. Query Optimization

**Select Specific Columns:**
```typescript
// Good
const { data } = await supabase
  .from('companies')
  .select('id, name, commune_name, creation_date')

// Bad
const { data } = await supabase
  .from('companies')
  .select('*')
```

**Use Indexes:**
```typescript
// Queries on indexed columns are faster
const { data } = await supabase
  .from('companies')
  .select('*')
  .eq('commune_code', '75001') // Uses index
  .eq('naf_level2', '56')      // Uses index
```

**Limit Results:**
```typescript
const { data } = await supabase
  .from('companies')
  .select('*')
  .limit(100) // Always limit
```

---

## Troubleshooting

### Common Issues

#### 1. Supabase Connection Failed

**Error:** `Failed to fetch` or `FetchError`

**Solutions:**
- Verify `NEXT_PUBLIC_SUPABASE_URL` is correct
- Verify `NEXT_PUBLIC_SUPABASE_ANON_KEY` is valid
- Check network connectivity
- Verify CORS settings in Supabase

**Fix CORS:**
```sql
-- In Supabase SQL Editor
INSERT INTO cors (origin) VALUES ('http://localhost:3000'), ('https://yourdomain.com');
```

#### 2. RLS Blocking Queries

**Error:** `new row violates row-level security policy`

**Solutions:**
- Use service role key for admin operations
- Check RLS policies
- Temporarily disable RLS for testing

#### 3. Mapbox Not Loading

**Error:** `Mapbox GL JS is not installed` or `Access token is invalid`

**Solutions:**
- Verify `NEXT_PUBLIC_MAPBOX_TOKEN` is set
- Check token permissions in Mapbox dashboard
- Ensure token has `styles:read` scope

#### 4. MCP Connection Failed

**Error:** `MCP server not responding`

**Solutions:**
- Verify MCP server URL
- Check network connectivity
- Test MCP connection independently

---

## Testing the Integration

### Manual Tests

1. **Test Supabase Connection:**
```bash
curl -i -H "apikey: YOUR_ANON_KEY" \
  "https://zzqyokefesatkgvtdqqt.supabase.co/rest/v1/companies?select=*"
```

2. **Test API Route:**
```bash
curl -i "http://localhost:3000/api/companies?zone=75&sector=56"
```

3. **Test Frontend:**
- Open browser to http://localhost:3000/explore
- Select zone and sector
- Verify data loads

### Automated Tests

```typescript
// __tests__/api/companies.test.ts
import { GET } from '@/app/api/companies/route'

describe('/api/companies', () => {
  it('should return companies for valid query', async () => {
    const request = new Request('http://localhost:3000/api/companies?zone=75&sector=56')
    const response = await GET(request)
    const data = await response.json()
    
    expect(response.status).toBe(200)
    expect(data).toHaveProperty('data')
    expect(Array.isArray(data.data)).toBe(true)
  })
})
```

---

## Deployment Checklist

### Before Deployment

- [ ] Supabase database initialized (`scripts/init-supabase.sql`)
- [ ] Environment variables configured in deployment platform
- [ ] RLS policies tested
- [ ] CORS configured in Supabase
- [ ] Mapbox token valid
- [ ] MCP server accessible
- [ ] All tests passing
- [ ] Build successful (`npm run build`)

### Deployment Platform Setup

**Vercel:**
1. Connect GitHub repository
2. Add environment variables in Vercel dashboard
3. Deploy

**Netlify:**
1. Connect GitHub repository
2. Add environment variables in Netlify dashboard
3. Set build command: `npm run build`
4. Set publish directory: `.next`
5. Deploy

### Post-Deployment

- [ ] Test all API routes
- [ ] Test frontend functionality
- [ ] Set up monitoring
- [ ] Configure alerts
- [ ] Set up backup schedule

---

## Summary

This integration connects:
1. ✅ **Next.js Frontend** - Modern, sleek UI with Mistral Charter
2. ✅ **Supabase Database** - `zzqyokefesatkgvtdqqt` for data storage
3. ✅ **data.gouv.fr MCP** - French government data via MCP
4. ✅ **Mapbox** - Geographic visualization

**Result:** A complete market intelligence platform that provides actionable insights from company creation and closure data.

---

**Document Status:** ✅ Complete  
**Project:** zzqyokefesatkgvtdqqt  
**Last Updated:** 2026-10-07
