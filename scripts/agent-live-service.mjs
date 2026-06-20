#!/usr/bin/env node
/**
 * HERMES Agent Live Service
 * 
 * A lightweight Socket.IO server that bridges the wave engine (cron)
 * with the dashboard frontend. The wave engine POSTs status updates
 * to the Next.js API (/api/harness/agent-status), which forwards
 * them here via HTTP. We then broadcast to all connected clients.
 * 
 * Also serves as a REST endpoint for the Next.js API route to call.
 * 
 * Usage: node scripts/agent-live-service.mjs
 * Port: 3004
 */

import { createServer } from 'http';
import { WebSocketServer } from 'ws';

// ─── State ───────────────────────────────────────────────────────────────
const PORT = 3004;

const state = {
  latestStatus: {
    agentState: 'idle',
    message: 'Servicio iniciado',
    phase: '',
    waveNumber: 0,
    progress: 0,
    waveCount: 0,
    totalImprovements: 0,
    totalDecisions: 0,
    level: 1,
    levelName: 'Nascente',
    xp: 0,
    xpToNext: 15,
  },
  activityLog: [],
  maxActivities: 80,
  clients: new Set(),
};

// ─── WebSocket Server (raw, no socket.io dependency needed) ─────────────
const server = createServer((req, res) => {
  // Handle CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // Health check
  if (req.method === 'GET' && req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'online',
      clientsCount: state.clients.size,
      latestStatus: state.latestStatus,
      activitiesCount: state.activityLog.length,
      uptime: process.uptime(),
    }));
    return;
  }

  // Receive broadcast from Next.js API route
  if (req.method === 'POST' && req.url === '/broadcast') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        handleBroadcast(data);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: true, clientsNotified: state.clients.size }));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: false, error: err.message }));
      }
    });
    return;
  }

  // Unknown endpoint
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'not_found' }));
});

// ─── WebSocket upgrade ───────────────────────────────────────────────────
const wss = new WebSocketServer({ server, path: '/socket.io/?EIO=4&transport=websocket' });

wss.on('connection', (ws, req) => {
  state.clients.add(ws);
  console.log(`[AgentLive] Client connected (${state.clients.size} total)`);

  // Send current state immediately
  ws.send(JSON.stringify({
    type: 'agent:status',
    data: state.latestStatus,
  }));

  // Send activity log
  if (state.activityLog.length > 0) {
    ws.send(JSON.stringify({
      type: 'agent:activity-log',
      data: state.activityLog,
    }));
  }

  ws.on('message', (raw) => {
    try {
      const msg = JSON.parse(raw.toString());
      // Handle ping/pong for keepalive
      if (msg.type === 'ping') {
        ws.send(JSON.stringify({ type: 'pong' }));
      }
    } catch {}
  });

  ws.on('close', () => {
    state.clients.delete(ws);
    console.log(`[AgentLive] Client disconnected (${state.clients.size} total)`);
  });

  ws.on('error', () => {
    state.clients.delete(ws);
  });
});

// ─── Broadcast handler ───────────────────────────────────────────────────
function handleBroadcast(data) {
  const { type, payload } = data;

  if (type === 'status') {
    // Full status update
    state.latestStatus = { ...state.latestStatus, ...payload };
    broadcast({ type: 'agent:status', data: state.latestStatus });
    console.log(`[AgentLive] Status: ${payload.agentState} — ${payload.message?.slice(0, 60) || ''}`);
  } else if (type === 'activity') {
    // Activity log entry
    const entry = {
      id: `act_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      timestamp: Date.now(),
      state: payload.agentState || 'idle',
      message: payload.message || '',
      phase: payload.phase || '',
    };
    state.activityLog.unshift(entry);
    if (state.activityLog.length > state.maxActivities) {
      state.activityLog = state.activityLog.slice(0, state.maxActivities);
    }

    // Also update latest status from activity
    if (payload.agentState) state.latestStatus.agentState = payload.agentState;
    if (payload.message) state.latestStatus.message = payload.message;
    if (payload.phase) state.latestStatus.phase = payload.phase;

    broadcast({ type: 'agent:activity', data: entry });
    broadcast({ type: 'agent:status', data: state.latestStatus });
    console.log(`[AgentLive] Activity: [${payload.agentState}] ${payload.message?.slice(0, 60) || ''}`);
  } else if (type === 'full-update') {
    // Full sync (wave completion)
    Object.assign(state.latestStatus, payload);
    broadcast({ type: 'agent:status', data: state.latestStatus });
    console.log(`[AgentLive] Full update: wave ${payload.waveNumber || '?'}, ${payload.agentState || '?'}`);
  }
}

function broadcast(message) {
  const raw = JSON.stringify(message);
  for (const ws of state.clients) {
    if (ws.readyState === 1) { // OPEN
      ws.send(raw);
    }
  }
}

// ─── Start ───────────────────────────────────────────────────────────────
server.listen(PORT, () => {
  console.log(`[AgentLive] HERMES Agent Live Service running on port ${PORT}`);
  console.log(`[AgentLive] Health: http://localhost:${PORT}/health`);
  console.log(`[AgentLive] Broadcast: POST http://localhost:${PORT}/broadcast`);
  console.log(`[AgentLive] WebSocket: ws://localhost:${PORT}/socket.io/?EIO=4&transport=websocket`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n[AgentLive] Shutting down...');
  for (const ws of state.clients) {
    ws.close(1001, 'Server shutting down');
  }
  server.close(() => process.exit(0));
});

process.on('uncaughtException', (err) => {
  console.error('[AgentLive] Uncaught exception:', err);
});

process.on('unhandledRejection', (err) => {
  console.error('[AgentLive] Unhandled rejection:', err);
});