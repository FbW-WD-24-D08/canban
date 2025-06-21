# 📘 Setting Up Context7 in Cursor (MCP Integration Guide)

Context7 is a **Model Context Protocol (MCP)** server that integrates with Cursor to deliver **live documentation and framework intelligence** directly into your development environment.

---

## 🔧 What You’ll Gain

- ✅ Automatic access to up-to-date docs from Tailwind, Next.js, Supabase, etc.
- ✅ Faster, smarter answers from your AI code assistant
- ✅ No more hallucinated API responses

---

## 🧩 Step-by-Step Setup

### 1. ✅ Prerequisites
- Node.js ≥ 18
- Cursor ≥ v0.45.6 (MCP-capable)
- Internet access for `npx` (or `bunx`, `deno`)

---

### 2. 🚀 Add Context7 as MCP Server

#### Option A: Cursor GUI (preferred)
1. Open Cursor
2. Go to **Settings → Cursor Settings → MCP**
3. Click **“Add new global MCP server”**
4. Fill in:
   - **Name**: `context7`
   - **Command**: `npx`
   - **Args**: `-y @upstash/context7-mcp`
5. Save and restart Cursor

#### Option B: Manual config file
Create or update:
```json
// ~/.cursor/mcp.json
{
  "mcpServers": {
    "context7": {
      "command": "npx",
      "args": ["-y", "@upstash/context7-mcp"]
    }
  }
}
```
Then restart Cursor.

---

## 🧪 Test It

Prompt Cursor like:

```bash
How do I secure a NextAuth.js route? use context7
```

Cursor will:
- Fetch relevant docs
- Inject them into your AI chat
- Return up-to-date suggestions with citations

---

## 🧬 Optional: Custom Runtimes

Instead of `npx`, you can use:

| Tool  | Config Example |
|-------|----------------|
| bunx  | `"command": "bunx", "args": ["-y", "@upstash/context7-mcp"]` |
| deno  | `"command": "deno", "args": ["run", "--allow-net", "npm:@upstash/context7-mcp"]` |

---

## 🗣️ Pro Tips

- Add `use context7` only when docs are needed to **save tokens**
- Integrate via `CursorRules` if you want automatic triggers
- Keep `npx` updated or switch to `bunx` for faster startup

---

## 🧼 Maintenance

No installation is permanent. Everything runs via `npx`, so it’s:
- Always latest version
- Zero bloat
- Restart-safe

---

## 🏁 Summary

| Benefit        | Value                      |
|----------------|-----------------------------|
| Setup time     | ⏱️ ~1 minute                |
| Productivity   | 🚀 Boosts by 30–50%         |
| Cost overhead  | ⚡ Minimal (on-demand only)  |

---

© ChatGPT + pazzo — Cursor + Context7 FTW
