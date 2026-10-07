# Supabase Setup Guide for B2BMax

**Project:** `zzqyokefesatkgvtdqqt`  
**Dashboard:** https://supabase.com/dashboard/project/zzqyokefesatkgvtdqqt

---

## Quick Start

### 1. Get Your API Keys

1. Go to your Supabase project dashboard
2. Navigate to **Settings → API**
3. Copy:
   - **Project URL**: `https://zzqyokefesatkgvtdqqt.supabase.co`
   - **anon public key**: Your public API key
   - **service_role secret key**: Your service role key (for backend)

### 2. Configure Environment Variables

Create a `.env.local` file in the project root:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your keys:

```
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://zzqyokefesatkgvtdqqt.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Mapbox Configuration
NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_token_here
```

**Important:**
- `NEXT_PUBLIC_*` variables are exposed to the browser
- `SUPABASE_SERVICE_ROLE_KEY` is server-side only (never expose publicly!)

---

## Database Schema

### Tables

The following tables are defined in `scripts/init-supabase.sql`:

1. **companies** - Raw company data from INSEE
2. **market_signals** - Aggregated market data by zone/sector/time
3. **user_queries** - User search history
4. **zones** - Geographic reference data (IRIS, commune, department, region)
5. **sectors** - NAF code reference data

### How to Initialize

**Option 1: Use Supabase SQL Editor**
1. Go to **SQL Editor** in Supabase dashboard
2. Copy the contents of `scripts/init-supabase.sql`
3. Run the query

**Option 2: Use psql**
```bash
psql -h db.zzqyokefesatkgvtdqqt.supabase.co -p 5432 -U postgres -d postgres
\i scripts/init-supabase.sql
```

**Option 3: Use Supabase CLI**
```bash
npx supabase db push --db-url postgres://postgres:yourpassword@db.zzqyokefesatkgvtdqqt.supabase.co:5432/postgres
```

---

## Security Configuration

### Row Level Security (RLS)

All tables have RLS enabled with public read policies:

- **companies**: Public read access
- **market_signals**: Public read access
- **zones**: Public read access
- **sectors**: Public read access
- **user_queries**: Authenticated users can insert

### Service Role Key

The service role key has **full access** to your database. **Never expose it:**
- Never commit it to GitHub
- Never use it in frontend code
- Only use it in server-side code (API routes, getServerSideProps)

---

## Client Setup

### Frontend Client (Browser)

Use the anon key for frontend operations:

```typescript
import { createBrowserClient } from '@/lib/supabase/client'

const supabase = createBrowserClient()
```

**Use cases:**
- Reading public data
- Authenticated user queries
- Real-time subscriptions

### Backend Client (Server)

Use the service role key for admin operations:

```typescript
import { createAdminClient } from '@/lib/supabase/client'

const supabaseAdmin = createAdminClient()
```

**Use cases:**
- Data aggregation
- Batch operations
- Admin functions
- Bypassing RLS

---

## Realtime Subscriptions

Supabase provides realtime functionality for live updates:

```typescript
import { createBrowserClient } from '@/lib/supabase/client'

const supabase = createBrowserClient()

// Subscribe to new companies in a zone
supabase
  .channel('new_companies_paris')
  .on(
    'postgres',
    'INSERT',
    { event: '*', schema: 'public', table: 'companies', filter: 'commune_code=eq.75001' },
    (payload) => {
      console.log('New company in Paris:', payload.new)
    }
  )
  .subscribe()
```

---

## Storage

A storage bucket `b2bmax-logos` is configured for:
- Logo files
- Static assets
- Uploaded content

**Usage:**
```typescript
const { data, error } = await supabase
  .storage
  .from('b2bmax-logos')
  .upload('logo.svg', file)
```

---

## Functions

Two PostgreSQL functions are included:

### 1. `calculate_potential(creation_rate, growth_rate, market_size, competition_score)`

Calculates the Potential KPI score (0-100) using the formula:
```
(creation_rate * 0.4) + (growth_rate * 0.3) + (market_size * 0.2) + ((100 - competition_score) * 0.1)
```

**Usage:**
```sql
SELECT calculate_potential(12.5, 8.3, 2458, 20) as potential_score;
```

### 2. `get_potential_grade(score)`

Returns the letter grade based on the score:
- A: 80-100
- B: 60-79
- C: 40-59
- D: 20-39
- E: 0-19

**Usage:**
```sql
SELECT get_potential_grade(87) as grade;  -- Returns 'A'
```

---

## Performance Tips

### 1. Indexes

All tables have appropriate indexes for common queries:
- Geographic lookups (commune_code, department_code, etc.)
- Sector lookups (naf_level2, naf_level3, etc.)
- Date ranges (creation_date)
- Spatial queries (latitude, longitude)

### 2. Query Optimization

Use `.select()` with specific columns instead of `*`:
```typescript
// Good
const { data } = await supabase
  .from('companies')
  .select('name, commune_name, creation_date')

// Bad (faster to fetch less data)
const { data } = await supabase
  .from('companies')
  .select('*')
```

### 3. Pagination

Always use pagination for large datasets:
```typescript
const { data, count } = await supabase
  .from('companies')
  .select('*', { count: 'exact' })
  .range(0, 50)
```

---

## Troubleshooting

### Common Issues

1. **RLS Blocking Queries**
   - Error: `new row violates row-level security policy`
   - Solution: Check your policies or use service role key for admin operations

2. **Connection Issues**
   - Error: `Failed to fetch`
   - Solution: Verify your Supabase URL and API key

3. **Slow Queries**
   - Solution: Add indexes, use `.select()` with specific columns, implement pagination

### Debug Mode

Enable Supabase debug logging:
```typescript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(supabaseUrl, supabaseKey, {
  db: {
    schema: 'public',
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
  global: {
    headers: {
      'x-my-custom-header': 'my-app-name',
    },
  },
})
```

---

## Backup & Restore

### Backup

1. Go to **Database → Backups** in Supabase dashboard
2. Click **Create backup**
3. Download the backup file

### Restore

1. Go to **Database → Backups**
2. Click **Restore**
3. Upload your backup file

---

## Monitoring

### Supabase Dashboard

Monitor your project at: https://supabase.com/dashboard/project/zzqyokefesatkgvtdqqt

Check:
- **Database**: Query performance, slow queries
- **Realtime**: Active subscriptions
- **Storage**: File uploads/downloads
- **Auth**: User signups and activity

### Alerts

Set up alerts for:
- High error rates
- Slow queries (> 1s)
- Storage usage (> 90%)
- Database size growth

---

## Cost Optimization

### Free Tier Limits

- **Database**: 500MB
- **Bandwidth**: 2GB
- **Realtime**: 100 connections
- **Storage**: 1GB

### Tips to Stay Free

1. **Clean up old data** - Archive or delete unused data
2. **Optimize queries** - Use indexes, pagination, selective column selection
3. **Cache results** - Cache frequent queries in your frontend
4. **Limit realtime** - Only subscribe to necessary channels

---

## Next Steps

1. ✅ **Initialize database** - Run `scripts/init-supabase.sql`
2. ✅ **Configure environment** - Set up `.env.local`
3. ⏳ **Test connection** - Verify Supabase client works
4. ⏳ **Seed data** - Import initial zone and sector data
5. ⏳ **Integrate with MCP** - Connect data.gouv.fr data to Supabase

---

## Support

- **Supabase Docs**: https://supabase.com/docs
- **Supabase Community**: https://github.com/supabase/supabase/discussions
- **Project Dashboard**: https://supabase.com/dashboard/project/zzqyokefesatkgvtdqqt

---

**Last Updated:** 2026-10-07  
**Project:** zzqyokefesatkgvtdqqt
