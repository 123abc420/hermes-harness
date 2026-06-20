#!/usr/bin/env node
/**
 * Keepalive dev server wrapper.
 * Starts the Next.js dev server and agent-live-service,
 * restarting them if they crash. Runs indefinitely.
 */
import { spawn } from 'child_process';
import { existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

function startService(cmd, args, label) {
  const child = spawn(cmd, args, {
    cwd: ROOT,
    stdio: ['ignore', 'pipe', 'pipe'],
    env: { ...process.env },
  });
  child.stdout.on('data', d => process.stdout.write(d));
  child.stderr.on('data', d => process.stderr.write(d));
  child.on('exit', (code) => {
    console.log(`[${label}] exited with code ${code}, restarting in 2s...`);
    setTimeout(() => startService(cmd, args, label), 2000);
  });
  return child;
}

console.log('[keepalive] Starting services...');
startService('node', ['scripts/agent-live-service.mjs'], 'agent-live');
startService('npx', ['next', 'dev', '-p', '3000'], 'next-dev');
console.log('[keepalive] All services started.');

// Keep this process alive forever
setInterval(() => {}, 60000);
