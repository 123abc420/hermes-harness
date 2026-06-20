#!/bin/bash
# Ensure the Next.js dev server is running
if ! curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/ 2>/dev/null | grep -q "200"; then
  bash /home/z/my-project/scripts/start-server.sh
fi
