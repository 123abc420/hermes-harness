#!/bin/bash
# Fast dev server starter for HERMES HARNESS dashboard
# Starts next dev with webpack (turbopack crashes in sandbox) if not already running

PORT=3000
if curl -s --max-time 2 -o /dev/null http://127.0.0.1:$PORT 2>/dev/null; then
  echo "Server already running on port $PORT"
  exit 0
fi

# Kill any zombie processes on the port
fuser -k $PORT/tcp 2>/dev/null || true
sleep 1

echo "Starting Next.js dev server (webpack mode)..."
cd /home/z/my-project

# Ensure .next doesn't have stale turbopack cache
if [ -d ".next" ]; then
  rm -rf .next
fi

nohup npx next dev -p $PORT --webpack > dev.log 2>&1 &
DEV_PID=$!
disown $DEV_PID 2>/dev/null || true

# Wait for server to be ready (up to 20s)
for i in $(seq 1 20); do
  sleep 1
  if curl -s --max-time 2 -o /dev/null http://127.0.0.1:$PORT 2>/dev/null; then
    echo "Server ready on http://127.0.0.1:$PORT (PID: $DEV_PID)"
    exit 0
  fi
  echo "  waiting... ($i/20)"
done

echo "WARNING: Server may not have started. Check dev.log"
exit 1