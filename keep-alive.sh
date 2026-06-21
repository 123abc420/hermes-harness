#!/bin/bash
# Keep-alive wrapper for Next.js dev server
# Restarts the server if it crashes
cd /home/z/my-project
while true; do
  echo "[$(date)] Starting Next.js dev server..." >> dev.log
  npx next dev -p 3000 --webpack >> dev.log 2>&1
  EXIT_CODE=$?
  echo "[$(date)] Server exited with code $EXIT_CODE. Restarting in 3s..." >> dev.log
  sleep 3
done