#!/bin/bash
# Persistent dev runner for HERMES harness
# Restarts Next.js automatically if it crashes

cd /home/z/my-project

# Start live service
node scripts/agent-live-service.mjs &

# Start Next.js with auto-restart
while true; do
  npx next dev -p 3000 2>&1
  echo "[$(date)] Next.js crashed, restarting in 5s..."
  sleep 5
done