---
name: ensure-server
version: 1.0.0
created: 2026-06-21
category: infrastructure
trigger: at the start of every response when the user needs to see the Live Code Preview
---

# Ensure Server Running

## When to use
ALWAYS run this at the very beginning of your response when:
1. The user asks to see the app / preview
2. The user reports the preview is blank or shows errors
3. Any cron wave or task runs that needs the dashboard visible

## Steps
1. **Run the startup script**:
   ```bash
   bash /home/z/my-project/scripts/start-server.sh
   ```
   This script:
   - Checks if the server is already running (returns immediately if so)
   - Kills stale processes
   - Starts agent-live-service on port 3004 if needed
   - Starts `next start` (production mode) on port 3000
   - Waits up to 10 seconds for port binding
   - Returns "OK" or "FAIL"

2. **Verify it responds**:
   ```bash
   curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/
   ```
   Should return `200`.

## How it works
- Uses **production build** (`next start`) instead of `next dev` — starts instantly, no Turbopack compilation needed
- The production build is in `.next/standalone/`
- Uses `setsid` + `</dev/null` to fully detach from the terminal
- The server survives the bash tool session ending because `node` running in production mode is a simple long-lived process

## Important notes
- Do NOT run `rm -rf .next` — that destroys the production build
- Do NOT run `bun run lint` with `rm -rf .next` prefix — just run `bun run lint` alone
- If you need to rebuild: `bun run build` (this recreates `.next/standalone/`)
- The Caddy gateway on port 81 proxies to port 3000 automatically