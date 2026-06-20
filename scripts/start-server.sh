#!/bin/bash
# HERMES HARNESS - Server startup (production mode)
# Uses `next start` for instant startup, no compilation needed

PROJECT_DIR="/home/z/my-project"
LOG_FILE="$PROJECT_DIR/server.log"
PID_FILE="$PROJECT_DIR/.server.pid"

cd "$PROJECT_DIR"

# Only restart if not already running
if curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/ 2>/dev/null | grep -q "200"; then
  echo "OK: Already running"
  exit 0
fi

# Kill stale processes
pkill -f "next dev" 2>/dev/null
pkill -f "next start" 2>/dev/null
sleep 1

# Start agent-live service if not running
if ! ss -tlnp | grep -q ':3004'; then
  setsid node scripts/agent-live-service.mjs > /dev/null 2>&1 &
  sleep 1
fi

# Ensure static assets and public are copied into standalone
cp -r .next/static .next/standalone/.next/ 2>/dev/null
cp -r public .next/standalone/ 2>/dev/null

# Start production server, fully detached
setsid env NODE_ENV=production node .next/standalone/server.js > "$LOG_FILE" 2>&1 </dev/null &

# Wait for port 3000
for i in $(seq 1 10); do
  sleep 1
  if ss -tlnp | grep -q ':3000'; then
    ACTUAL_PID=$(ss -tlnp | grep ':3000' | grep -oP 'pid=\K[0-9]+' | head -1)
    echo "$ACTUAL_PID" > "$PID_FILE"
    echo "OK: Server running (PID $ACTUAL_PID)"
    exit 0
  fi
done

echo "FAIL: Server did not start within 10s"
exit 1