---
name: ensure-server
version: 2.0.0
created: 2026-06-21
updated: 2026-06-21
category: infrastructure
trigger: ALWAYS — at the very start of EVERY wave and EVERY response
---

# Ensure Server Running

## When to use
**ALWAYS** — unconditionally, at the very beginning of every wave execution and every response:
1. Cron wave runs (every 10 minutes)
2. User asks to see the app / preview
3. User reports blank preview or "sandbox is inactive"
4. Any task that requires the dashboard to be visible

## Critical context: Sandbox process lifecycle

The chat.z.ai sandbox kills ALL child processes when a `bash` tool call ends. This is a **cgroup-level cleanup** that cannot be bypassed:
- `nohup` — does NOT help
- `setsid` — does NOT help
- `disown` — does NOT help
- `detached: true` (Node spawn) — does NOT help
- Long `sleep` after startup — does NOT help

**Conclusion: The server MUST be started fresh in every wave/response.** There is no way to persist a process across tool calls.

## Steps

1. **Check if server is already running**:
   ```bash
   curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/ 2>/dev/null
   ```
   - If `200`, server is alive — skip to step 3
   - If anything else, proceed to step 2

2. **Start the server** (production mode — fast, no compilation):
   ```bash
   cd /home/z/my-project
   # Copy static assets into standalone
   cp -r .next/static .next/standalone/.next/ 2>/dev/null
   cp -r public .next/standalone/ 2>/dev/null
   # Start production server
   node .next/standalone/server.js &
   # Wait for it to bind
   for i in $(seq 1 10); do sleep 1; if curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/ 2>/dev/null | grep -q 200; then echo "OK"; break; fi; done
   ```

   Also start agent-live-service if not running:
   ```bash
   if ! ss -tlnp | grep -q ':3004'; then
     node scripts/agent-live-service.mjs &
     sleep 1
   fi
   ```

3. **Verify both ports respond**:
   ```bash
   curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/
   curl -s -o /dev/null -w "%{http_code}" http://localhost:3004/health
   ```
   Both should return `200`.

## Important notes
- Do NOT run `rm -rf .next` — that destroys the production build
- If the build is missing (`node .next/standalone/server.js` fails), run `bun run build` first
- The server will die when this tool call ends — this is EXPECTED and UNAVOIDABLE
- For Live Code Preview to work, the server must be running AT THE TIME the user checks
- Use `&` (background) + `sleep` pattern to keep the process alive during the current tool call
- The Caddy gateway on port 81 proxies to port 3000 automatically