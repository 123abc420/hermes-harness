#!/usr/bin/env node
/**
 * Keepalive dev server wrapper.
 * Starts the Next.js dev server only (agent-live-service removed in W233).
 * Runs indefinitely, restarting on crash.
 */
import { spawn } from 'child_process';

const __dirname = dirname(import.meta.url);

function startService(cmd, args, label) {
  const child = spawn(cmd, args, {
    cwd: __dirname,
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

console.log('[keepalive] Starting dev server...');
startService('npx', ['next', 'dev', '-p', '3000'], 'next-dev');
setInterval(() => {}, 60000);