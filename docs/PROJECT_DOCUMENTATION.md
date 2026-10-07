# B2BMax - Complete Project Documentation

**Version:** 1.0.0  
**Last Updated:** 2026-10-07  
**Branch:** ZEBESTFRONT  
**Repository:** https://github.com/mbody/b2bmax

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Challenge & Problem Statement](#2-challenge--problem-statement)
3. [Architecture](#3-architecture)
4. [Data Sources & MCP Servers](#4-data-sources--mcp-servers)
5. [Design System (Mistral Charter)](#5-design-system-mistral-charter)
6. [Potential KPI Specification](#6-potential-kpi-specification)
7. [Component Library](#7-component-library)
8. [API Endpoints](#8-api-endpoints)
9. [Frontend Implementation](#9-frontend-implementation)
10. [Mapbox Integration](#10-mapbox-integration)
11. [Setup Instructions](#11-setup-instructions)
12. [Environment Variables](#12-environment-variables)
13. [Testing Strategy](#13-testing-strategy)
14. [Deployment](#14-deployment)
15. [Next Steps & Roadmap](#15-next-steps--roadmap)

---

## 1. Project Overview

### Purpose
B2BMax is a market intelligence platform that analyzes company creation and closure data to identify economic trends by geographic zone and business sector. It provides actionable insights for banks, software vendors, and investors to understand market dynamics and identify new business opportunities.

### Core Value Proposition
- **Early Signal Detection**: Identify market trends before competitors
- **Precision Targeting**: Find new companies to contact immediately after creation
- **Geographic Intelligence**: Understand market dynamics by zone (IRIS, commune, department, region)
- **Sector Analysis**: Deep dive into specific business sectors using NAF codes

### Target Users
| User Type | Use Case | Primary Need |
|-----------|----------|--------------|
| Regional Banks | Sector health monitoring | Identify growing/declining sectors in their zones |
| Software Vendors | Lead generation | Contact new businesses immediately after creation |
| Local Governments | Economic development | Track business attractiveness and economic health |
| Investors | Market research | Identify emerging markets and investment opportunities |
| Business Consultants | Market analysis | Provide data-driven recommendations to clients |

---

## 2. Challenge & Problem Statement

### The Problem
From `insee-api/README.md`:

> "Les créations et les radiations d'entreprises disent si un marché se développe ou se contracte, secteur par secteur et zone par zone. Chaque création est aussi une entreprise nouvelle à contacter. Mais ces informations sont publiées sous forme d'annonces à lire une à une : le signal est difficile à voir."

**Translation:**
> "Company creations and closures indicate whether a market is expanding or contracting, by sector and by zone. Each creation is also a new business to contact. But this information is published as individual announcements to read one by one: the signal is hard to see."

### Current Pain Points
1. **Scattered Data**: Information exists but is fragmented across announcements
2. **Time Delay**: Data is often weeks old by the time it's manually processed
3. **Manual Analysis**: No automated aggregation or trend detection
4. **Missed Opportunities**: New businesses are contacted too late
5. **No Visualization**: Hard to see geographic and sectoral patterns

### Solution Requirements
- Automated data aggregation from INSEE and other sources
- Real-time or near-real-time processing
- Geographic and sectoral analysis
- Visual mapping of market signals
- Custom KPIs for business potential
- Actionable alerts and notifications

---

## 3. Architecture

### High-Level Architecture (No Supabase)

```
┌─────────────────────────────────────────────────────────────────┐
│                        User Browser                                │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                  Next.js Application                         │    │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │    │
│  │  │   Chat UI    │  │   Mapbox     │  │   KPI       │        │    │
│  │  │             │  │   Mapping    │  │   Display   │        │    │
│  │  └─────────────┘  └─────────────┘  └─────────────┘        │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     Next.js API Routes                             │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  /api/companies     - Fetch from data.gouv.fr MCP            │    │
│  │  /api/potential      - Calculate Potential KPI                 │    │
│  │  /api/zones          - Geographic data lookup                │    │
│  │  /api/sectors        - Sector/NAF code lookup                │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     External Services                               │
│  ┌─────────────────┐      ┌─────────────────┐                 │
│  │  data.gouv.fr    │      │   Mapbox         │                 │
│  │  MCP Server      │      │   (via token)    │                 │
│  │                 │      │                 │                 │
│  │ - INSEE data     │      │ - Geocoding     │                 │
│  │ - Company info   │      │ - Maps          │                 │
│  │ - Economic data  │      │ - Heatmaps      │                 │
│  └─────────────────┘      └─────────────────┘                 │
└─────────────────────────────────────────────────────────────────┘
```

### Technology Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| Frontend | Next.js 14 | React framework, SSR, API routes |
| Styling | Tailwind CSS | Utility-first CSS, Mistral charter |
| Maps | Mapbox GL JS | Interactive maps, heatmaps |
| Data Access | MCP Client | Connect to data.gouv.fr |
| KPI Engine | TypeScript | Potential calculation |
| State Management | Zustand | Lightweight state |
| Testing | Jest + React Testing Library | Unit & integration tests |
| E2E Testing | Cypress | End-to-end tests |

### Data Flow

```
1. User submits query via chat: "Show me restaurant trends in Paris"
2. Next.js API route (/api/companies) receives request
3. API route calls data.gouv.fr MCP with parameters:
   - zone: "Paris"
   - sector: "Restauration" (NAF 56)
   - startDate: "2024-01-01"
   - endDate: "2024-10-07"
4. MCP returns structured company data
5. API route calculates Potential KPI
6. Frontend renders:
   - Map with geographic distribution
   - Potential score and breakdown
   - List of companies with details
```

---

## 4. Data Sources & MCP Servers

### data.gouv.fr MCP Server

**Configuration** (from `~/.vibe/config.toml`):
```toml
[[mcp_servers]]
name = "datagouv"
transport = "streamable-http"
url = "https://mcp.data.gouv.fr/mcp"
```

**Available Data:**
- INSEE company registry (SIRENE)
- Company creations and closures
- Geographic data (IRIS, commune, department, region)
- NAF sector codes
- Economic indicators

**MCP Tools (Anticipated):**
```typescript
// Tool: search_companies
{
  "name": "search_companies",
  "description": "Search companies by zone, sector, and date range",
  "parameters": {
    "zone": "string | null",        // IRIS, commune, department, region
    "zone_type": "string | null",   // iris, commune, department, region
    "sector": "string | null",      // NAF code or name
    "sector_level": "string | null", // naf2, naf3, naf4, naf5
    "start_date": "string | null",   // YYYY-MM-DD
    "end_date": "string | null",     // YYYY-MM-DD
    "limit": "number | null",       // Max results
    "offset": "number | null"       // Pagination
  }
}

// Tool: get_zone_info
{
  "name": "get_zone_info",
  "description": "Get information about a geographic zone",
  "parameters": {
    "zone": "string",
    "zone_type": "string"
  }
}

// Tool: get_sector_info
{
  "name": "get_sector_info",
  "description": "Get information about a NAF sector",
  "parameters": {
    "sector": "string",
    "sector_level": "string"
  }
}
```

### Mapbox Integration

**Token Source:** Environment variable `NEXT_PUBLIC_MAPBOX_TOKEN`

**Usage:**
- Geocoding: Convert addresses to coordinates
- Reverse geocoding: Convert coordinates to addresses
- Static maps: Generate map images
- Interactive maps: Render with Mapbox GL JS
- Heatmaps: Visualize company density

---

## 5. Design System (Mistral Charter)

### Source
Extracted from `logo/logo-b2bmax-charte-mistral.svg` and `logo/logo-b2bmax-version-verte.svg`

**Comment in SVG:**
> "B2BMax - charte Mistral : pixels orange, M en degrade jaune-orange"
> "B2BMax - version verte : M en degrade vert clair -> vert profond"

### Color Palette

#### Primary Palette (Mistral Orange)
| Name | Hex | Usage |
|------|-----|-------|
| Orange Primary | `#FF7000` | Primary brand color, buttons, links |
| Yellow Light | `#F5D90A` | Gradient start, highlights |
| Yellow-Orange | `#FAA42B` | Gradient middle |
| Orange-Yellow | `#FF9E00` | Gradient middle |
| Gradient Formula | `linear-gradient(to right, #F5D90A, #FAA42B, #FF9E00, #FF7000)` | "M" shape in logo |

#### Accent Palette (Green Version)
| Name | Hex | Usage |
|------|-----|-------|
| Green Primary | `#16A34A` | Positive signals, growth |
| Green Very Light | `#A3E635` | Gradient start |
| Green Light | `#65C547` | Gradient middle |
| Green Medium | `#22C55E` | Gradient middle |
| Green Dark | `#15803D` | Gradient end |
| Gradient Formula | `linear-gradient(to right, #A3E635, #65C547, #22C55E, #16A34A, #15803D)` | "M" shape in green logo |

#### Semantic Colors (Market Signals)
| Signal | Color | Hex | Score Range |
|--------|-------|-----|--------------|
| Strong Growth | Green 700 | `#16A34A` | >10% growth |
| Moderate Growth | Green 500 | `#22C55E` | 5-10% growth |
| Stable | Gray 500 | `#6B7280` | -5% to +5% |
| Moderate Decline | Orange 500 | `#FF9E00` | -5% to -10% |
| Strong Decline | Orange 700 | `#FF7000` | <-10% |

#### Standard Colors
| Name | Hex | Usage |
|------|-----|-------|
| White | `#FFFFFF` | Backgrounds |
| Gray 50 | `#F9FAFB` | Subtle backgrounds |
| Gray 100 | `#F3F4F6` | Cards, elevated surfaces |
| Gray 200 | `#E5E7EB` | Borders |
| Gray 300 | `#D1D5DB` | Disabled states |
| Gray 400 | `#9CA3AF` | Secondary text |
| Gray 500 | `#6B7280` | Body text |
| Gray 600 | `#4B5563` | Headings |
| Gray 700 | `#374151` | Strong text |
| Gray 800 | `#1F2937` | Primary text |
| Gray 900 | `#111827` | Dark backgrounds |

### Typography

**Font Families:**
```css
--font-sans: 'Inter', system-ui, -apple-system, sans-serif;
--font-mono: 'Fira Code', 'Monaco', monospace;
```

**Type Scale:**
```css
--text-xs: 0.75rem;   /* 12px - Captions, labels */
--text-sm: 0.875rem;  /* 14px - Secondary text */
--text-base: 1rem;    /* 16px - Body text */
--text-lg: 1.125rem;  /* 18px - Large text */
--text-xl: 1.25rem;   /* 20px - Headings */
--text-2xl: 1.5rem;   /* 24px - Section headings */
--text-3xl: 1.875rem; /* 30px - Page titles */
```

**Font Weights:**
```css
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
```

### Spacing System (16px Pixel Grid)

From logo: Each square is 16x16px with 2px rounded corners

```css
--space-1: 0.25rem;  /* 4px */
--space-2: 0.5rem;   /* 8px */
--space-3: 0.75rem;  /* 12px */
--space-4: 1rem;     /* 16px - Base unit (matches logo grid) */
--space-5: 1.25rem;  /* 20px */
--space-6: 1.5rem;   /* 24px */
--space-8: 2rem;     /* 32px */
--space-10: 2.5rem;  /* 40px */
--space-12: 3rem;    /* 48px */
--space-16: 4rem;    /* 64px */
```

### Logo Usage

**Primary Logo:** `logo/logo-b2bmax-charte-mistral.svg`
- Colors: Orange palette
- Use: Main brand identity

**Alternative Logo:** `logo/logo-b2bmax-version-verte.svg`
- Colors: Green palette
- Use: For contexts where green is more appropriate (growth, success)

**Clear Space:** Maintain 16px padding around logo

---

## 6. Potential KPI Specification

### Definition

The **Potential KPI** is a composite score (0-100) that evaluates the business potential of a specific zone and sector combination. It answers: "How attractive is this market segment for business development?"

### Formula

```
POTENTIAL = 
  (Creation Rate × 0.4) +
  (Growth Rate × 0.3) +
  (Market Size × 0.2) +
  (Competition Score × 0.1)
```

### Component Metrics

#### 1. Creation Rate (Weight: 40%)
**Definition:** Rate of new company creations relative to existing companies

**Calculation:**
```
Creation Rate = (New Companies in Period) / (Total Companies at Start) × 100
```

**Data Source:** INSEE company creation data from data.gouv.fr MCP

**Normalization:**
- 0-10% = 0-40 points
- 10-20% = 40-80 points
- >20% = 80-100 points

#### 2. Growth Rate (Weight: 30%)
**Definition:** Net growth rate of companies in the zone/sector

**Calculation:**
```
Growth Rate = ((New Companies - Closed Companies) / Total Companies at Start) × 100
```

**Data Source:** INSEE company creation and closure data

**Normalization:**
- Negative = 0-30 points (inverse scale)
- 0-5% = 30-55 points
- 5-10% = 55-80 points
- >10% = 80-100 points

#### 3. Market Size (Weight: 20%)
**Definition:** Total number of companies in the zone/sector

**Calculation:**
```
Market Size Score = min(Total Companies / 100, 1) × 100 × 0.2
```

**Rationale:** Larger markets have more opportunity, but diminishing returns after 100 companies

**Normalization:** Linear scaling up to 100 companies

#### 4. Competition Score (Weight: 10%)
**Definition:** Inverse of competition density (lower competition = higher score)

**Calculation:**
```
Competition Density = Total Companies / Zone Population
Competition Score = (1 - min(Competition Density, 1)) × 100
```

**Data Source:** Population data from INSEE + company count

**Normalization:** 0-100 points (inverse relationship)

### Bonus Factors (Optional)

| Factor | Weight | Calculation |
|--------|--------|-------------|
| Population Growth | +5% | Zone population growth rate |
| Income Level | +5% | Average income percentile |
| Digital Adoption | +5% | Digital infrastructure score |
| Government Incentives | +5% | Subsidies/grants available |

### Grading Scale

| Score Range | Grade | Meaning | Color (Mistral) |
|-------------|-------|---------|----------------|
| 80-100 | A | Exceptional potential | `#16A34A` (Green) |
| 60-79 | B | High potential | `#22C55E` (Green) |
| 40-59 | C | Average potential | `#6B7280` (Gray) |
| 20-39 | D | Below average | `#FF9E00` (Orange) |
| 0-19 | E | Low potential | `#FF7000` (Orange) |

### Example Calculation

**Input:**
- Zone: Paris 75001 (Commune)
- Sector: Restaurant (NAF 56)
- Period: Last 12 months
- New companies: 45
- Closed companies: 5
- Total companies at start: 400
- Zone population: 20,000

**Calculations:**
- Creation Rate = (45/400) × 100 = 11.25% → 45 points (40% weight)
- Growth Rate = ((45-5)/400) × 100 = 10% → 80 points (30% weight)
- Market Size = min(400/100, 1) × 100 × 0.2 = 80 points (20% weight)
- Competition Density = 400/20000 = 0.02 → Competition Score = (1-0.02) × 100 = 98 → 98 × 0.1 = 9.8 points

**Potential Score:** 45 + 24 + 16 + 9.8 = **94.8 → Grade A**

---

## 7. Component Library

### 1. MarketMap Component

**File:** `components/MarketMap.tsx`

**Purpose:** Interactive map showing company distribution and market signals

**Features:**
- Heatmap layer for company density
- Cluster markers for grouped companies
- Zone boundaries (IRIS, commune, department, region)
- Sector-based color coding
- Time-based filtering
- Click interactions for drill-down

**Props:**
```typescript
interface MarketMapProps {
  zone?: string;           // Current selected zone
  sector?: string;         // Current selected sector
  zoneType?: 'iris' | 'commune' | 'department' | 'region';
  sectorLevel?: 'naf2' | 'naf3' | 'naf4' | 'naf5';
  startDate?: string;      // YYYY-MM-DD
  endDate?: string;        // YYYY-MM-DD
  onZoneSelect?: (zone: string, zoneType: string) => void;
  onSectorSelect?: (sector: string, sectorLevel: string) => void;
  onCompanyClick?: (company: Company) => void;
}
```

**Implementation:**
```typescript
import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;

export default function MarketMap({ 
  zone, 
  sector, 
  zoneType = 'commune',
  sectorLevel = 'naf2',
  onZoneSelect,
  onSectorSelect,
  onCompanyClick 
}: MarketMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch company data
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const response = await fetch(`/api/companies?zone=${zone}&sector=${sector}&zoneType=${zoneType}&sectorLevel=${sectorLevel}`);
      const data = await response.json();
      setCompanies(data);
      setLoading(false);
    }
    fetchData();
  }, [zone, sector, zoneType, sectorLevel]);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v10',
      center: [2.3522, 46.6034], // France center
      zoom: zoneType === 'region' ? 5 : zoneType === 'department' ? 6 : zoneType === 'commune' ? 8 : 10
    });

    // Add navigation control
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    // Add geolocate control
    map.current.addControl(new mapboxgl.GeolocateControl({
      positionOptions: { enableHighAccuracy: true },
      trackUserLocation: true
    }), 'top-right');

    // Cleanup
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  // Update map when companies data changes
  useEffect(() => {
    if (!map.current || !companies.length) return;

    // Clear existing layers
    const layers = map.current.getStyle().layers || [];
    layers.forEach(layer => {
      if (layer.id.startsWith('b2bmax-')) {
        map.current?.removeLayer(layer.id);
        map.current?.removeSource(layer.id);
      }
    });

    // Add heatmap layer
    addHeatmapLayer();
    
    // Add cluster layer
    addClusterLayer();
    
    // Add zone boundaries
    addZoneBoundaries();

  }, [companies]);

  function addHeatmapLayer() {
    // Implementation for heatmap
  }

  function addClusterLayer() {
    // Implementation for clusters
  }

  function addZoneBoundaries() {
    // Implementation for zone boundaries
  }

  return (
    <div className="relative w-full h-full">
      <div 
        ref={mapContainer} 
        className="absolute inset-0"
      />
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-primary"></div>
        </div>
      )}
    </div>
  );
}
```

### 2. PotentialDisplay Component

**File:** `components/PotentialDisplay.tsx`

**Purpose:** Display the Potential KPI score and breakdown

**Props:**
```typescript
interface PotentialDisplayProps {
  zone: string;
  zoneType: string;
  sector: string;
  sectorLevel: string;
  startDate?: string;
  endDate?: string;
}
```

**Implementation:**
```typescript
import { useQuery } from '@tanstack/react-query';
import { calculatePotential } from '@/lib/kpi/potential';

export default function PotentialDisplay({
  zone,
  zoneType,
  sector,
  sectorLevel,
  startDate,
  endDate
}: PotentialDisplayProps) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['potential', zone, zoneType, sector, sectorLevel, startDate, endDate],
    queryFn: async () => {
      const response = await fetch(
        `/api/potential?zone=${zone}&zoneType=${zoneType}&sector=${sector}&sectorLevel=${sectorLevel}&startDate=${startDate}&endDate=${endDate}`
      );
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-pulse">Calculating potential...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500">
        Error calculating potential: {error.message}
      </div>
    );
  }

  const gradeColors = {
    A: 'bg-green-700',
    B: 'bg-green-500',
    C: 'bg-gray-500',
    D: 'bg-orange-500',
    E: 'bg-orange-700',
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-800">
          Market Potential
        </h2>
        <div className="text-sm text-gray-500">
          {zone} · {sector}
        </div>
      </div>

      {/* Score Display */}
      <div className="flex items-center gap-4 mb-6">
        <div className="relative">
          <svg 
            className="w-24 h-24 transform -rotate-90" 
            viewBox="0 0 36 36"
          >
            <path
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="#e5e7eb"
              strokeWidth="2"
            />
            <path
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831" 
              fill="none"
              stroke="url(#gradient)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeDasharray="75, 100"
              strokeDashoffset="0"
            />
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#16A34A" />
                <stop offset="100%" stopColor="#FF7000" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex items-center justify-center text-2xl font-bold text-gray-800">
            {data?.score}
          </div>
        </div>
        <div className={`px-4 py-2 rounded-full text-white font-semibold ${gradeColors[data?.grade || 'C']}`}>
          Grade {data?.grade}
        </div>
      </div>

      {/* Breakdown */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {Object.entries(data?.breakdown || {}).map(([key, value]) => (
          <div 
            key={key} 
            className="bg-gray-50 p-3 rounded-lg"
          >
            <div className="text-sm text-gray-500 capitalize">
              {key.replace(/([A-Z])/g, ' $1')}
            </div>
            <div className="font-semibold text-gray-800">
              {typeof value === 'number' ? `${value.toFixed(1)}%` : value}
            </div>
          </div>
        ))}
      </div>

      {/* Comparison */}
      {data?.comparison && (
        <div className="border-t pt-4">
          <h3 className="font-medium text-gray-800 mb-3">
            Comparison
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-500">Zone Rank</span>
              <span className="font-semibold">#{data.comparison.zoneRank}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Sector Rank</span>
              <span className="font-semibold">#{data.comparison.sectorRank}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">National Percentile</span>
              <span className="font-semibold">{data.comparison.nationalPercentile}%</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
```

### 3. ChatInterface Component

**File:** `components/ChatInterface.tsx`

**Purpose:** Main chat interface for querying market data

**Features:**
- Message input and history
- AI responses with structured data
- Quick action buttons
- Context-aware suggestions

**Implementation:**
```typescript
import { useState, useRef, useEffect } from 'react';

interface Message {
  id: string;
  role: 'user' | 'ai';
  content: string;
  data?: any; // Structured data from AI
  timestamp: Date;
}

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Call API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input, history: messages }),
      });
      const data = await response.json();

      // Add AI message
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        content: data.message,
        data: data.data, // Structured data
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Chat error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Messages */}
      <div className="flex-1 overflow-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <div className="text-4xl mb-2">👋</div>
            <p>Ask me about market trends...</p>
            <p className="text-sm">Try: "Show restaurant trends in Paris"</p>
          </div>
        )}
        {messages.map(message => (
          <div 
            key={message.id} 
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div 
              className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                message.role === 'user' 
                  ? 'bg-brand-primary text-white' 
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              <div className="whitespace-pre-wrap">{message.content}</div>
              {message.data && (
                <div className="mt-2 p-2 bg-white rounded-lg">
                  {/* Render structured data */}
                  <pre className="text-sm">{JSON.stringify(message.data, null, 2)}</pre>
                </div>
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-2xl px-4 py-2">
              <div className="flex space-x-1">
                <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"></div>
                <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-200 bg-white">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about market trends..."
            className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-brand-primary"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="bg-brand-primary text-white px-4 py-2 rounded-lg disabled:opacity-50 hover:bg-brand-primary-dark transition-colors"
          >
            Send
          </button>
        </form>
        <p className="text-xs text-gray-400 mt-1">
          Powered by Mistral AI with data from INSEE
        </p>
      </div>
    </div>
  );
}
```

### 4. CompanyList Component

**File:** `components/CompanyList.tsx`

**Purpose:** Display list of companies matching criteria

**Props:**
```typescript
interface CompanyListProps {
  companies: Company[];
  onCompanyClick?: (company: Company) => void;
}
```

---

## 8. API Endpoints

### GET /api/companies

**Purpose:** Fetch company data from data.gouv.fr MCP

**Query Parameters:**
```typescript
interface CompanyQueryParams {
  zone?: string;           // Zone identifier (IRIS code, commune code, etc.)
  zoneType?: 'iris' | 'commune' | 'department' | 'region';
  sector?: string;         // NAF code or sector name
  sectorLevel?: 'naf2' | 'naf3' | 'naf4' | 'naf5';
  startDate?: string;      // YYYY-MM-DD
  endDate?: string;        // YYYY-MM-DD
  limit?: number;          // Max results (default: 100)
  offset?: number;         // Pagination offset (default: 0)
}
```

**Response:**
```typescript
interface Company {
  siren: string;           // Company SIREN
  siret: string;           // Establishment SIRET
  name: string;            // Company name
  naf_code: string;        // NAF 5-digit code
  naf_name: string;        // NAF description
  legal_form: string;      // Legal form (SARL, SAS, etc.)
  address: string;         // Full address
  postal_code: string;     // Postal code
  commune_code: string;    // INSEE commune code
  commune_name: string;    // Commune name
  iris_code: string;       // IRIS code
  department_code: string; // Department code
  region_code: string;     // Region code
  latitude: number;        // Latitude
  longitude: number;       // Longitude
  creation_date: string;    // YYYY-MM-DD
  closure_date: string | null; // YYYY-MM-DD or null
  employees_range: string;  // Size category
  turnover_range: string;   // Revenue category
}

interface CompaniesResponse {
  data: Company[];
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}
```

**Implementation:**
```typescript
// app/api/companies/route.ts
import { NextResponse } from 'next/server';
import { MCPClient } from '@modelcontextprotocol/sdk';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  
  const params = {
    zone: searchParams.get('zone'),
    zoneType: searchParams.get('zoneType'),
    sector: searchParams.get('sector'),
    sectorLevel: searchParams.get('sectorLevel'),
    startDate: searchParams.get('startDate'),
    endDate: searchParams.get('endDate'),
    limit: parseInt(searchParams.get('limit') || '100'),
    offset: parseInt(searchParams.get('offset') || '0'),
  };

  try {
    const mcp = new MCPClient({
      url: 'https://mcp.data.gouv.fr/mcp',
      transport: 'streamable-http',
    });

    const result = await mcp.callTool({
      name: 'search_companies',
      arguments: params,
    });

    const companies = result.data?.companies || [];
    const total = result.data?.total || companies.length;

    return NextResponse.json({
      data: companies,
      total,
      limit: params.limit,
      offset: params.offset,
      hasMore: params.offset + params.limit < total,
    });
  } catch (error) {
    console.error('Error fetching companies:', error);
    return NextResponse.json(
      { error: 'Failed to fetch companies' },
      { status: 500 }
    );
  }
}
```

### GET /api/potential

**Purpose:** Calculate Potential KPI for a zone/sector

**Query Parameters:**
```typescript
interface PotentialQueryParams {
  zone: string;           // Required
  zoneType: 'iris' | 'commune' | 'department' | 'region'; // Required
  sector: string;         // Required
  sectorLevel: 'naf2' | 'naf3' | 'naf4' | 'naf5'; // Required
  startDate?: string;    // YYYY-MM-DD
  endDate?: string;      // YYYY-MM-DD
}
```

**Response:**
```typescript
interface PotentialResult {
  score: number;          // 0-100
  grade: 'A' | 'B' | 'C' | 'D' | 'E';
  breakdown: {
    creationRate: number;    // %
    growthRate: number;      // %
    marketSize: number;      // Score contribution
    competition: number;      // Score contribution
  };
  comparison: {
    zoneRank: number;        // Rank within all zones of this type
    sectorRank: number;      // Rank within all sectors of this level
    nationalPercentile: number; // Percentile compared to national average
  };
  data: {
    totalCompanies: number;
    newCompanies: number;
    closedCompanies: number;
    zonePopulation: number;
    zoneArea: number;        // km²
    sectorCompaniesNational: number;
  };
}
```

**Implementation:**
```typescript
// app/api/potential/route.ts
import { NextResponse } from 'next/server';
import { calculatePotential } from '@/lib/kpi/potential';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  
  const zone = searchParams.get('zone');
  const zoneType = searchParams.get('zoneType');
  const sector = searchParams.get('sector');
  const sectorLevel = searchParams.get('sectorLevel');
  const startDate = searchParams.get('startDate');
  const endDate = searchParams.get('endDate');

  if (!zone || !zoneType || !sector || !sectorLevel) {
    return NextResponse.json(
      { error: 'Missing required parameters: zone, zoneType, sector, sectorLevel' },
      { status: 400 }
    );
  }

  try {
    // Fetch company data
    const companiesResponse = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/companies?` +
      new URLSearchParams({
        zone,
        zoneType,
        sector,
        sectorLevel,
        startDate: startDate || '',
        endDate: endDate || '',
      })
    );
    const { data: companies } = await companiesResponse.json();

    // Fetch zone population data
    const populationResponse = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/zones?zone=${zone}&zoneType=${zoneType}`
    );
    const { population, area } = await populationResponse.json();

    // Calculate potential
    const result = calculatePotential({
      companies,
      zone,
      zoneType,
      sector,
      sectorLevel,
      zonePopulation: population,
      zoneArea: area,
      startDate,
      endDate,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error calculating potential:', error);
    return NextResponse.json(
      { error: 'Failed to calculate potential' },
      { status: 500 }
    );
  }
}
```

### GET /api/zones

**Purpose:** Get information about geographic zones

**Query Parameters:**
```typescript
interface ZoneQueryParams {
  zone: string;           // Zone code
  zoneType: 'iris' | 'commune' | 'department' | 'region';
}
```

**Response:**
```typescript
interface ZoneInfo {
  code: string;
  name: string;
  type: string;
  parent?: {
    code: string;
    name: string;
    type: string;
  };
  children?: {
    code: string;
    name: string;
    type: string;
  }[];
  population: number;
  area: number; // km²
  density: number; // inhabitants/km²
}
```

### GET /api/sectors

**Purpose:** Get information about NAF sectors

**Query Parameters:**
```typescript
interface SectorQueryParams {
  sector: string;         // NAF code
  sectorLevel: 'naf2' | 'naf3' | 'naf4' | 'naf5';
}
```

**Response:**
```typescript
interface SectorInfo {
  code: string;
  name: string;
  level: string;
  parent?: {
    code: string;
    name: string;
    level: string;
  };
  children?: {
    code: string;
    name: string;
    level: string;
  }[];
  description: string;
}
```

---

## 9. Frontend Implementation

### Project Structure

```
b2bmax/
├── app/
│   ├── layout.tsx              # Root layout
│   ├── page.tsx                # Dashboard
│   ├── chat/
│   │   └── page.tsx            # Chat interface
│   ├── markets/
│   │   └── page.tsx            # Market explorer
│   ├── alerts/
│   │   └── page.tsx            # Alerts management
│   ├── reports/
│   │   └── page.tsx            # Reports
│   ├── settings/
│   │   └── page.tsx            # User settings
│   └── api/
│       ├── companies/route.ts  # Company data
│       ├── potential/route.ts   # Potential KPI
│       ├── zones/route.ts       # Zone info
│       └── sectors/route.ts     # Sector info
├── components/
│   ├── ui/                     # Reusable UI components
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Input.tsx
│   │   ├── Modal.tsx
│   │   └── ...
│   ├── MarketMap.tsx           # Mapbox integration
│   ├── PotentialDisplay.tsx    # KPI display
│   ├── ChatInterface.tsx       # Chat UI
│   ├── CompanyList.tsx         # Company list
│   ├── CompanyCard.tsx         # Individual company
│   ├── ZoneSelector.tsx        # Zone picker
│   ├── SectorSelector.tsx      # Sector picker
│   └── DateRangePicker.tsx     # Date range
├── lib/
│   ├── mcp/                    # MCP utilities
│   │   └── client.ts          # MCP client setup
│   ├── kpi/                    # KPI calculations
│   │   └── potential.ts        # Potential KPI
│   ├── api/                    # API utilities
│   │   └── fetch.ts            # HTTP client
│   ├── hooks/                  # React hooks
│   │   ├── useCompanies.ts
│   │   ├── usePotential.ts
│   │   └── useMap.ts
│   └── types/                  # TypeScript types
│       ├── company.ts
│       ├── zone.ts
│       └── sector.ts
├── public/                     # Static assets
│   └── logo/                   # Logo files
├── styles/                     # Global styles
│   └── globals.css
├── tailwind.config.js          # Tailwind config
├── next.config.js              # Next.js config
└── package.json
```

### Tailwind Configuration

```javascript
// tailwind.config.js
const { fontFamily } = require("tailwindcss/defaultTheme");

module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', ...fontFamily.sans],
        mono: ['Fira Code', ...fontFamily.mono],
      },
      colors: {
        // Mistral Charter Colors
        brand: {
          primary: '#FF7000',
          primaryLight: '#F5D90A',
          primaryDark: '#FAA42B',
          accent: '#16A34A',
          accentLight: '#A3E635',
          accentDark: '#15803D',
        },
        success: {
          50: '#A3E635',
          100: '#65C547',
          500: '#22C55E',
          700: '#16A34A',
          900: '#15803D',
        },
        warning: {
          50: '#F5D90A',
          100: '#FAA42B',
          500: '#FF9E00',
          700: '#FF7000',
        },
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      borderRadius: {
        '4xl': '2rem',
      },
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
      },
      animation: {
        'spin-slow': 'spin 3s linear infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
};
```

---

## 10. Mapbox Integration

### Setup

**Installation:**
```bash
npm install mapbox-gl @mapbox/mapbox-gl-geocoder
```

**Environment Variable:**
```
NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_token_here
```

### Map Styles

| Style | Use Case | Token |
|-------|----------|-------|
| `mapbox://styles/mapbox/light-v10` | Default (light theme) | ✅ |
| `mapbox://styles/mapbox/dark-v10` | Dark mode | ✅ |
| `mapbox://styles/mapbox/outdoors-v11` | Outdoor look | ✅ |
| `mapbox://styles/mapbox/satellite-v9` | Satellite imagery | ✅ |

### Geocoding

**Forward Geocoding:** Address → Coordinates
```typescript
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';

const geocoder = new MapboxGeocoder({
  accessToken: mapboxgl.accessToken,
  mapboxgl: mapboxgl,
  marker: false,
  countries: 'fr',
  types: 'address,poi,place,postcode,locality,neighborhood',
});
```

**Reverse Geocoding:** Coordinates → Address
```typescript
const response = await fetch(
  `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?access_token=${mapboxgl.accessToken}&country=fr`
);
```

### Heatmap Layer

```typescript
function addHeatmapLayer(map: mapboxgl.Map, companies: Company[]) {
  const points = companies.map(company => ({
    type: 'Feature' as const,
    geometry: {
      type: 'Point' as const,
      coordinates: [company.longitude, company.latitude],
    },
    properties: {
      score: calculateCompanyScore(company),
    },
  }));

  const heatmapSource = {
    type: 'geojson',
    data: {
      type: 'FeatureCollection',
      features: points,
    },
  };

  map.addSource('companies-heat', heatmapSource);

  map.addLayer({
    id: 'companies-heatmap',
    type: 'heatmap',
    source: 'companies-heat',
    maxzoom: 15,
    paint: {
      'heatmap-weight': ['get', 'score'],
      'heatmap-intensity': ['interpolate', ['linear'], ['zoom'], 0, 1, 9, 3],
      'heatmap-color': [
        'interpolate',
        ['linear'],
        ['heatmap-density'],
        0,
        'rgba(236, 222, 10, 0)',
        0.2,
        'rgba(236, 222, 10, 0.5)',
        0.5,
        'rgba(240, 164, 43, 0.7)',
        0.8,
        'rgba(250, 84, 34, 0.9)',
        1,
        'rgba(255, 112, 0, 1)',
      ],
      'heatmap-radius': ['interpolate', ['linear'], ['zoom'], 0, 2, 9, 20],
      'heatmap-opacity': ['interpolate', ['linear'], ['zoom'], 7, 1, 9, 0],
    },
  });
}
```

### Cluster Layer

```typescript
function addClusterLayer(map: mapboxgl.Map, companies: Company[]) {
  const points = companies.map(company => ({
    type: 'Feature' as const,
    geometry: {
      type: 'Point' as const,
      coordinates: [company.longitude, company.latitude],
    },
    properties: {
      id: company.siren,
      count: 1,
    },
  }));

  const clusterSource = {
    type: 'geojson',
    data: {
      type: 'FeatureCollection',
      features: points,
    },
    cluster: true,
    clusterRadius: 50,
    clusterProperties: {
      count: ['+', ['case', ['has', 'count'], ['get', 'count'], 0]],
    },
  };

  map.addSource('companies-cluster', clusterSource);

  // Cluster circles
  map.addLayer({
    id: 'companies-clusters',
    type: 'circle',
    source: 'companies-cluster',
    filter: ['has', 'point_count'],
    paint: {
      'circle-color': [
        'step',
        ['get', 'point_count'],
        '#F5D90A',
        10,
        '#FAA42B',
        30,
        '#FF9E00',
        70,
        '#FF7000',
      ],
      'circle-radius': ['step', ['get', 'point_count'], 20, 10, 30, 30, 40, 70, 50],
      'circle-opacity': 0.8,
      'circle-stroke-width': 2,
      'circle-stroke-color': '#fff',
    },
  });

  // Cluster count labels
  map.addLayer({
    id: 'companies-cluster-count',
    type: 'symbol',
    source: 'companies-cluster',
    filter: ['has', 'point_count'],
    layout: {
      'text-field': ['get', 'point_count_abbreviated'],
      'text-font': ['Inter Medium'],
      'text-size': 12,
    },
    paint: {
      'text-color': '#fff',
    },
  });

  // Individual points
  map.addLayer({
    id: 'companies-individual',
    type: 'circle',
    source: 'companies-cluster',
    filter: ['!', ['has', 'point_count']],
    paint: {
      'circle-color': '#16A34A',
      'circle-radius': 8,
      'circle-opacity': 0.8,
      'circle-stroke-width': 2,
      'circle-stroke-color': '#fff',
    },
  });
}
```

---

## 11. Setup Instructions

### Prerequisites

1. **Node.js**: Version 18+ LTS
2. **npm**: Version 9+
3. **Git**: Version 2.30+
4. **Mapbox Account**: With valid access token
5. **data.gouv.fr Access**: Verify MCP connectivity

### Installation

```bash
# Clone repository
git clone https://github.com/mbody/b2bmax.git
cd b2bmax

# Switch to ZEBESTFRONT branch
git checkout ZEBESTFRONT

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Edit .env with your tokens
NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_token_here
# Add other environment variables as needed
```

### Environment Variables

See [Section 12](#12-environment-variables)

### Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Build for Production

```bash
npm run build
npm start
```

---

## 12. Environment Variables

### Required Variables

| Variable | Description | Example | Source |
|----------|-------------|---------|--------|
| `NEXT_PUBLIC_MAPBOX_TOKEN` | Mapbox access token | `pk.xxx...` | Mapbox |
| `NEXT_PUBLIC_APP_URL` | Application URL | `http://localhost:3000` | Self |

### Optional Variables

| Variable | Description | Example | Default |
|----------|-------------|---------|---------|
| `NEXT_PUBLIC_ANALYTICS_ID` | Analytics tracking ID | `G-XXXXXX` | None |
| `NEXT_PUBLIC_MODE` | Application mode | `development` | `development` |
| `MAX_COMPANIES_PER_REQUEST` | API limit | `1000` | `100` |
| `CACHE_TTL_SECONDS` | Data cache TTL | `300` | `300` |

### .env.example

```
# Mapbox
NEXT_PUBLIC_MAPBOX_TOKEN=pk.your_mapbox_token_here

# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_MODE=development

# API Configuration
MAX_COMPANIES_PER_REQUEST=1000
CACHE_TTL_SECONDS=300

# Analytics (optional)
NEXT_PUBLIC_ANALYTICS_ID=G-XXXXXX
```

---

## 13. Testing Strategy

### Unit Tests

**Framework:** Jest + React Testing Library

**Location:** `__tests__/`

**Example Test:**
```typescript
// __tests__/lib/kpi/potential.test.ts
import { calculatePotential } from '@/lib/kpi/potential';

describe('calculatePotential', () => {
  it('should return score A for high growth', () => {
    const result = calculatePotential({
      companies: [],
      zone: '75001',
      zoneType: 'commune',
      sector: '56',
      sectorLevel: 'naf2',
      zonePopulation: 20000,
      zoneArea: 100,
    });
    
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(100);
    expect(['A', 'B', 'C', 'D', 'E']).toContain(result.grade);
  });
});
```

### Integration Tests

**Framework:** Jest

**Test:** API endpoint integration
```typescript
// __tests__/api/companies.test.ts
import { GET } from '@/app/api/companies/route';
import { NextRequest } from 'next/server';

describe('/api/companies', () => {
  it('should return companies for valid query', async () => {
    const request = new NextRequest('http://localhost:3000/api/companies?zone=75001&sector=56');
    const response = await GET(request);
    const data = await response.json();
    
    expect(response.status).toBe(200);
    expect(data).toHaveProperty('data');
    expect(Array.isArray(data.data)).toBe(true);
  });
});
```

### E2E Tests

**Framework:** Cypress

**Example Test:**
```typescript
// cypress/e2e/chat.cy.ts
describe('Chat Interface', () => {
  it('should load and display chat input', () => {
    cy.visit('/chat');
    cy.get('input[placeholder="Ask about market trends..."]').should('be.visible');
  });

  it('should send message and receive response', () => {
    cy.visit('/chat');
    cy.get('input').type('Show me restaurant trends in Paris');
    cy.get('button[type="submit"]').click();
    
    // Should show user message
    cy.contains('Show me restaurant trends in Paris').should('be.visible');
    
    // Should show loading state, then AI response
    cy.get('.animate-pulse').should('be.visible');
    // cy.contains('Here are the restaurant trends').should('be.visible'); // Uncomment when AI is ready
  });
});
```

### Visual Regression Tests

**Framework:** Percy or Chromatic

**Configuration:**
```javascript
// percy.config.js
module.exports = {
  version: 2,
  snapshot: {
    widths: [375, 1280],
  },
  server: {
    command: 'npm start',
    port: 3000,
  },
};
```

---

## 14. Deployment

### Platform Options

| Platform | Recommended | Notes |
|----------|-------------|-------|
| Vercel | ✅ Yes | Best for Next.js, built-in support |
| Netlify | ✅ Yes | Good alternative |
| AWS Amplify | ⚠️ Maybe | More configuration needed |
| Docker | ⚠️ Maybe | For self-hosting |

### Vercel Deployment

1. **Connect GitHub repository** to Vercel
2. **Import b2bmax project**
3. **Configure environment variables** in Vercel dashboard:
   - `NEXT_PUBLIC_MAPBOX_TOKEN`
   - Other required variables
4. **Deploy**

**vercel.json:**
```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/next"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/"
    }
  ]
}
```

### Docker Deployment (Alternative)

**Dockerfile:**
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

**docker-compose.yml:**
```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_MAPBOX_TOKEN=${MAPBOX_TOKEN}
      - NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 15. Next Steps & Roadmap

### Phase 1: MVP (1-2 weeks)
- [ ] Set up Next.js project structure
- [ ] Configure Tailwind CSS with Mistral charter
- [ ] Connect data.gouv.fr MCP
- [ ] Implement basic company data fetching
- [ ] Create MarketMap component
- [ ] Build Potential KPI calculator
- [ ] Develop simple chat interface

### Phase 2: Core Features (2-3 weeks)
- [ ] Add zone/sector filtering
- [ ] Implement time range filters
- [ ] Create detailed company view
- [ ] Add comparison features
- [ ] Develop export functionality
- [ ] Implement responsive design

### Phase 3: Advanced Features (3-4 weeks)
- [ ] Add user accounts/authentication
- [ ] Implement saved searches
- [ ] Create alert system
- [ ] Build report generation
- [ ] Add data caching
- [ ] Implement performance optimizations

### Phase 4: Production (1-2 weeks)
- [ ] Set up monitoring
- [ ] Add error tracking
- [ ] Implement logging
- [ ] Performance testing
- [ ] Security audit
- [ ] Deploy to production

---

## Appendices

### Appendix A: NAF Code Structure

The French NAF (Nomenclature d'Activités Française) classification:

| Level | Digits | Example | Description |
|-------|--------|---------|-------------|
| Level 1 | 1 | A | Agriculture, Forestry, Fishing |
| Level 2 | 2 | 56 | Restaurant industry |
| Level 3 | 3 | 561 | Restaurants and mobile food service |
| Level 4 | 4 | 5610 | Traditional restaurants |
| Level 5 | 5 | 5610A | Licensed restaurants |

### Appendix B: Geographic Hierarchy

| Level | Code Format | Example | Description |
|-------|-------------|---------|-------------|
| Region | 2 digits | 11 | Île-de-France |
| Department | 2-3 digits | 75 | Paris |
| Commune | 5 digits | 75001 | Paris 1st arrondissement |
| IRIS | 9 digits | 750010100 | Specific block in Paris 1 |

### Appendix C: Data Sources Reference

| Source | Data Type | Frequency | Coverage |
|--------|-----------|-----------|----------|
| INSEE SIRENE | Company registry | Daily | France |
| INSEE DEMO | Population | Annual | France |
| INSEE CLA | Local economic data | Quarterly | France |
| data.gouv.fr | Aggregated datasets | Varies | France |

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2026-10-07 | Vibe + User | Initial comprehensive documentation |

---

**Document Status:** ✅ Complete  
**Last Review:** 2026-10-07  
**Next Review:** 2026-10-14
