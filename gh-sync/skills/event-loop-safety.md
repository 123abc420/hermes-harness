---
name: event-loop-safety
version: 0.1.0
created: 2026-06-20
category: performance
trigger: when any code uses execSync, or when creating ReadableStream for SSE
---

# Event Loop Safety Pattern

## When to use
Any code that spawns child processes (`execSync`/`execFile`) or creates long-lived streams (SSE, WebSockets).

## Problem 1: execSync Blocks Everything
`execSync` freezes the **entire** Node.js event loop. No other requests can be served while it runs. Even a cached dashboard response can't be sent if another route is running `execSync('bun run lint')`.

### Fix
Always use `execFile` (async) with a timeout:
```typescript
import { execFile } from 'child_process';
import { promisify } from 'util';
const execFileAsync = promisify(execFile);

const { stdout } = await execFileAsync('git', ['rev-list', '--count', 'HEAD'], {
  encoding: 'utf-8',
  timeout: 10_000, // 10s is generous for git; 60s for lint
});
```

## Problem 2: SSE ReadableStream Timer Leaks
A `ReadableStream` used for Server-Sent Events creates `setInterval` timers. If the client disconnects (browser close, network drop) and the `cancel()` method is missing, those timers fire forever into a dead controller.

### Fix
```typescript
// Variables MUST be in the outer scope (not inside start())
let closed = false;
let interval: ReturnType<typeof setInterval> | null = null;

const cleanup = () => {
  if (closed) return;
  closed = true;
  if (interval) { clearInterval(interval); interval = null; }
};

const stream = new ReadableStream({
  start(controller) {
    interval = setInterval(() => {
      if (closed) return;
      try { controller.enqueue(data); }
      catch { cleanup(); } // enqueue throws if controller closed
    }, 2000);

    req.signal.addEventListener('abort', () => {
      cleanup();
      try { controller.close(); } catch { /* already closed */ }
    });
  },
  cancel() {
    // Called when stream consumer cancels (may fire before abort)
    cleanup();
  },
});
```

### Key Rules
- `cancel()` cannot access variables declared inside `start()` — hoist to outer scope
- Always wrap `controller.enqueue()` in try/catch — it throws if the stream is closed
- Set a `closed` flag to prevent race conditions between abort and cancel

## Audit Commands
```bash
# Find execSync usage (should be 0 in src/)
rg 'execSync' src/
```