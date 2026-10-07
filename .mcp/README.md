# MCP Servers for Market Signals Project

MCP (Model Context Protocol) enables AI assistants to interact with external systems.

## Available Servers

### 1. **Supabase MCP** (Database & Realtime)
- **Purpose**: Query and modify Supabase database
- **Capabilities**: SQL execution, realtime subscriptions, table operations
- **Requires**: `SUPABASE_URL` and `SUPABASE_ACCESS_TOKEN`

### 2. **Mapbox MCP** (Geospatial)
- **Purpose**: Geocoding, maps, spatial analysis
- **Capabilities**: Address lookup, reverse geocoding, static maps
- **Requires**: `MAPBOX_TOKEN`

### 3. **GitHub MCP** (Repository)
- **Purpose**: Manage GitHub repositories
- **Capabilities**: Read files, create PRs, manage issues
- **Requires**: GitHub OAuth token

### 4. **Filesystem MCP** (Local Development)
- **Purpose**: Access project files
- **Capabilities**: Read, write, search local files
- **Requires**: Local file access

## Setup

Add to your MCP client configuration:

```json
{
  "servers": {
    "supabase": {
      "command": "npx",
      "args": ["@modelcontextprotocol/server-supabase", "${SUPABASE_URL}", "${SUPABASE_ACCESS_TOKEN}"]
    },
    "mapbox": {
      "command": "npx",
      "args": ["@modelcontextprotocol/server-mapbox", "${MAPBOX_TOKEN}"]
    },
    "github": {
      "command": "npx",
      "args": ["@modelcontextprotocol/server-github"]
    },
    "filesystem": {
      "command": "npx",
      "args": ["@modelcontextprotocol/server-filesystem", "/Users/emerydittmer/Documents/Mistral Challenge"]
    }
  }
}
```

## Usage with AI Assistants

Once configured, AI can:
- Query Supabase directly: "Show me new restaurants created this month"
- Use Mapbox: "Map all new companies in Paris by sector"
- Manage GitHub: "Create a new feature branch for the analysis module"
- Read local files: "Check the data processing script"
