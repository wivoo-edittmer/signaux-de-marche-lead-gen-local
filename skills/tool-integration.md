# Tool Integration Knowledge

## Core Principle
Know what tools exist, what they do, and when to use them.

## Discovery Workflow
1. **Search first**: Use `search_tool_functions` with a capability query
   ```
   query: "list files" or "search code"
   mode: "best_match"
   ```
2. **Get details**: Once you have function names, use `mode: "details"` to see parameters
3. **Use via run_typescript**: Call functions through `tools.<group>.<function>`

## Essential Tool Groups
- `file_system`: read_file, write_file, edit, bash
- `vibe`: todo tracking
- `self`: session management
- `process`: background processes
- `connector_web_search`: web search

## When to Use What
- **Reading files**: `read_file` (not `bash cat`)
- **Editing files**: `edit` for precise changes, `write_file` for new files
- **Finding code**: `bash` with `grep`, `find`, `rg`
- **Complex workflows**: `run_typescript` with tool calls
- **Tracking work**: `todo` for multi-step tasks

## Pro Tips
- Always check function schemas before first use
- Prefer `bash` for quick shell commands, `run_typescript` for orchestration
- Use background processes (`tools.process`) for long-running commands
- Keep tool calls in `run_typescript` when you need to chain operations

## Common Patterns
```typescript
// Discover
const results = await tools.search_tool_functions({
  mode: "best_match",
  query: "read directory"
});

// Use
const files = await tools.file_system.bash({
  command: "ls -la"
});
```