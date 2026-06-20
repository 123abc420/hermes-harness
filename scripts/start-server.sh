#!/bin/bash
# HERMES HARNESS - Server startup script
# Keeps the dev server alive by daemonizing properly

PROJECT_DIR="/home/z/my-project"
LOG_FILE="$PROJECT_DIR/dev.log"
PID_FILE="$PROJECT_DIR/.server.pid"

# Kill existing server processes
pkill -f "next dev" 2>/dev/null
pkill -f "next start" 2>/dev/null
pkill -f "agent-live-service" 2>/dev/null
sleep 2

cd "$PROJECT_DIR"

# Start agent-live service
setsid node scripts/agent-live-service.mjs > /dev/null 2>&1 &

# Start Next.js dev server, fully detached via setsid
setsid bash -c 'npx next dev -p 3000' > "$LOG_FILE" 2>&1 </dev/null &

# Wait for the server to bind port 3000
for i in $(seq 1 15); do
  sleep 1
  if ss -tlnp | grep -q ':3000'; then
    # Get the actual next-server PID
    ACTUAL_PID=$(ss -tlnp | grep ':3000' | grep -oP 'pid=\K[0-9]+' | head -1)
    echo "$ACTUAL_PID" > "$PID_FILE"
    echo "OK: Server running (next-server PID $ACTUAL_PID)"
    exit 0
  fi
done

echo "FAIL: Server did not bind port 3000 within 15s"
exit 1