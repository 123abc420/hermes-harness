import { NextRequest, NextResponse } from 'next/server';
import { logError } from '@/lib/logger';
import { formatArgentinaTime } from '@/lib/constants';
import {
  agentStatusPostSchema,
  validationError,
  FULL_UPDATE_KEYS,
} from '@/lib/schemas';

// ─── In-memory state ─
interface AgentStatus {
  agentState: string;
  message: string;
  phase: string;
  waveNumber: number;
  progress: number;
  waveCount: number;
  totalImprovements: number;
  totalDecisions: number;
  decisionCountThisWave: number;
  timestamp: number;
}

interface ActivityEntry {
  state: string;
  agentState: string;
  message: string;
  phase: string;
  id: string;
  timestamp: number;
  timestampAR: string;
}

let latestStatus: AgentStatus = {
  agentState: 'idle',
  message: 'Waiting for activity...',
  phase: '',
  waveNumber: 0,
  progress: 0,
  waveCount: 0,
  totalImprovements: 0,
  totalDecisions: 0,
  decisionCountThisWave: 0,
  timestamp: Date.now(),
};

let activityLog: ActivityEntry[] = [];
const MAX_LOG = 50;
const SSE_POLL_INTERVAL = 2000;
const SSE_KEEP_ALIVE = 30_000;

// ─── Sub-agents (legacy) ─
interface SubAgentEntry {
  id: string;
  name: string;
  state: string;
  message: string;
  color: string;
  spawnTime: number;
  timestampAR: string;
}

let subAgents: SubAgentEntry[] = [];
let activityTimestamp = 0;

// ─── Network nodes (v2.0) ─
interface NetworkNode {
  id: string;
  type: string;
  name: string;
  state: string;
  message: string;
  color: string;
  connections: string[];
  spawnTime: number;
  x: number;
  y: number;
  size: number;
  glowIntensity: number;
}

let networkNodes: NetworkNode[] = [];
let nodeTimestamp = 0;

// Seed a default network so the canvas is never empty on first load
function ensureDefaultNetwork(): void {
  if (networkNodes.length > 0) return;
  const now = Date.now();
  networkNodes = [
    {
      id: 'orchestrator', type: 'orchestrator', name: 'HERMES',
      state: 'idle', message: 'System ready — awaiting next wave',
      color: '#f59e0b',
      connections: ['assessor', 'planner', 'executor', 'verifier'],
      spawnTime: now, x: 0.5, y: 0.42, size: 1.8, glowIntensity: 0.6,
    },
    {
      id: 'assessor', type: 'assessor', name: 'ASSESSOR',
      state: 'idle', message: 'Codebase scanner',
      color: '#06b6d4',
      connections: ['orchestrator'],
      spawnTime: now, x: 0.22, y: 0.28, size: 1.0, glowIntensity: 0.4,
    },
    {
      id: 'planner', type: 'planner', name: 'PLANNER',
      state: 'idle', message: 'Architecture designer',
      color: '#a855f7',
      connections: ['orchestrator', 'executor'],
      spawnTime: now, x: 0.78, y: 0.28, size: 1.0, glowIntensity: 0.4,
    },
    {
      id: 'executor', type: 'executor', name: 'EXECUTOR',
      state: 'idle', message: 'Code writer',
      color: '#f43f5e',
      connections: ['orchestrator', 'planner', 'verifier'],
      spawnTime: now, x: 0.72, y: 0.65, size: 1.0, glowIntensity: 0.4,
    },
    {
      id: 'verifier', type: 'verifier', name: 'VERIFIER',
      state: 'idle', message: 'Quality gate',
      color: '#22c55e',
      connections: ['orchestrator', 'executor'],
      spawnTime: now, x: 0.28, y: 0.65, size: 1.0, glowIntensity: 0.4,
    },
    {
      id: 'git-agent', type: 'git-agent', name: 'GIT SYNC',
      state: 'idle', message: 'Version control',
      color: '#ea580c',
      connections: ['orchestrator'],
      spawnTime: now, x: 0.12, y: 0.48, size: 0.85, glowIntensity: 0.3,
    },
  ];
  nodeTimestamp = now;
}

// Position new nodes in a circle/orbit around center
function assignPosition(index: number, total: number): { x: number; y: number } {
  if (total <= 1) return { x: 0.3, y: 0.4 };
  const angle = (2 * Math.PI * index) / total - Math.PI / 2;
  const radius = 0.25 + Math.random() * 0.1;
  return {
    x: 0.5 + radius * Math.cos(angle),
    y: 0.5 + radius * Math.sin(angle),
  };
}

// GET: Return latest state + activities + nodes (also supports SSE stream)
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  // Server-Sent Events endpoint
  if (searchParams.get('stream') === 'true') {
    const encoder = new TextEncoder();
    let lastDataHash = '';
    let closed = false;
    let interval: ReturnType<typeof setInterval> | null = null;
    let keepAlive: ReturnType<typeof setInterval> | null = null;

    const getHash = () => `${latestStatus.timestamp}_${activityTimestamp}_${nodeTimestamp}`;

    const cleanup = () => {
      if (closed) return;
      closed = true;
      if (interval) { clearInterval(interval); interval = null; }
      if (keepAlive) { clearInterval(keepAlive); keepAlive = null; }
    };

    const stream = new ReadableStream({
      start(controller) {
        const sendData = () => {
          if (closed) return;
          try {
            const payload = JSON.stringify({
              status: 'ok',
              clients: 0,
              latestStatus,
              activities: activityLog,
              activityCount: activityLog.length,
              activityTimestamp,
              subAgents,
              networkNodes,
              nodeTimestamp,
            });
            const hash = getHash();
            if (hash !== lastDataHash) {
              controller.enqueue(encoder.encode(`data: ${payload}\n\n`));
              lastDataHash = hash;
            }
          } catch {
            cleanup();
          }
        };

        // Send initial data
        sendData();

        // Poll every 2 seconds for changes
        interval = setInterval(sendData, SSE_POLL_INTERVAL);

        // Keep alive every 30s
        keepAlive = setInterval(() => {
          if (closed) return;
          try { controller.enqueue(encoder.encode(`: keepalive\n\n`)); }
          catch { cleanup(); }
        }, SSE_KEEP_ALIVE);

        req.signal.addEventListener('abort', () => {
          cleanup();
          try { controller.close(); } catch { /* already closed */ }
        });
      },
      cancel() {
        cleanup();
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  }

  // Regular GET
  return NextResponse.json({
    status: 'ok',
    clients: 0,
    latestStatus,
    activities: activityLog,
    activityCount: activityLog.length,
    activityTimestamp,
    subAgents,
    networkNodes,
    nodeTimestamp,
  });
}

// POST: Update agent status
export async function POST(req: NextRequest) {
  try {
    const raw = await req.json().catch(() => null);
    if (!raw) {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    const parsed = agentStatusPostSchema.safeParse(raw);
    if (!parsed.success) {
      return validationError(agentStatusPostSchema, raw);
    }
    const body = parsed.data;

    const { agentState, message, phase, waveNumber, progress, type } = body;

    if (!agentState && !message && !type) {
      return NextResponse.json({ error: 'Missing agentState or message' }, { status: 400 });
    }

    // ─── Activity ──────────────────────────────────────────────────
    if (type === 'activity') {
      const now = Date.now();
      const state = agentState || 'idle';
      const entry = {
        state,
        agentState: state,
        message: message || '',
        phase: phase || '',
        id: `act_${now}_${Math.random().toString(36).slice(2, 6)}`,
        timestamp: now,
        timestampAR: formatArgentinaTime(now),
      };
      activityLog = [entry, ...activityLog].slice(0, MAX_LOG);
      activityTimestamp = now;
      latestStatus = { ...latestStatus, agentState: state, message: entry.message, phase: entry.phase, timestamp: now };

      // Also update orchestrator node if it exists
      const orch = networkNodes.find(n => n.type === 'orchestrator');
      if (orch) {
        orch.state = state;
        orch.message = entry.message;
        nodeTimestamp = now;
      }

      return NextResponse.json({ ok: true, activities: activityLog.length });
    }

    // ─── Node Update (v2.0) ───────────────────────────────────────
    if (type === 'node') {
      const nodeId = body.nodeId || `node_${Date.now()}`;
      const nodeType = body.nodeType || 'custom';
      const nodeName = body.nodeName || nodeType;
      const nodeState = body.nodeState || 'executing';
      const nodeMessage = body.nodeMessage || '';
      const nodeColor = body.nodeColor || '#8b5cf6';
      const connections: string[] = body.connections || [];

      const existing = networkNodes.find(n => n.id === nodeId);
      if (existing) {
        // Update existing node
        existing.state = nodeState;
        existing.message = nodeMessage;
        existing.connections = connections;
        existing.glowIntensity = nodeState === 'executing' ? 1.0 : nodeState === 'thinking' ? 0.7 : 0.4;
        existing.size = nodeState === 'executing' ? 1.2 : nodeState === 'error' ? 1.3 : 1.0;
      } else {
        // New node
        const nonOrch = networkNodes.filter(n => n.type !== 'orchestrator');
        const pos = assignPosition(nonOrch.length, Math.max(nonOrch.length + 1, 5));
        networkNodes.push({
          id: nodeId,
          type: nodeType,
          name: nodeName,
          state: nodeState,
          message: nodeMessage,
          color: nodeColor,
          connections,
          spawnTime: Date.now(),
          ...pos,
          size: nodeState === 'executing' ? 1.2 : 1.0,
          glowIntensity: nodeState === 'executing' ? 1.0 : 0.6,
        });

        // Also add as activity
        const entry = {
          state: nodeState,
          agentState: nodeState,
          message: `🚀 Node ${nodeName} spawned (${nodeType})`,
          phase: phase || '',
          id: `act_${Date.now()}_node`,
          timestamp: Date.now(),
          timestampAR: formatArgentinaTime(Date.now()),
        };
        activityLog = [entry, ...activityLog].slice(0, MAX_LOG);
      }

      nodeTimestamp = Date.now();
      return NextResponse.json({ ok: true, nodes: networkNodes.length });
    }

    // ─── Node Remove (v2.0) ───────────────────────────────────────
    if (type === 'node-remove') {
      const nodeId = body.nodeId;
      if (nodeId) {
        const removed = networkNodes.find(n => n.id === nodeId);
        networkNodes = networkNodes.filter(n => n.id !== nodeId);
        // Also remove this node from other nodes' connections
        for (const node of networkNodes) {
          node.connections = node.connections.filter(c => c !== nodeId);
        }
        if (removed) {
          const entry = {
            state: 'idle',
            agentState: 'idle',
            message: `⏹ Node ${removed.name} removed`,
            phase: '',
            id: `act_${Date.now()}_nrm`,
            timestamp: Date.now(),
            timestampAR: formatArgentinaTime(Date.now()),
          };
          activityLog = [entry, ...activityLog].slice(0, MAX_LOG);
          activityTimestamp = Date.now();
        }
      }
      nodeTimestamp = Date.now();
      return NextResponse.json({ ok: true, nodes: networkNodes.length });
    }

    // ─── Node Clear All (v2.0) ────────────────────────────────────
    if (type === 'node-clear') {
      networkNodes = [];
      nodeTimestamp = Date.now();
      return NextResponse.json({ ok: true, nodes: 0 });
    }

    // ─── Sub-Agent (legacy — also creates a node) ─────────────────
    if (type === 'sub-agent') {
      const subAgent = {
        id: `sub_${Date.now()}_${Math.random().toString(36).slice(2, 4)}`,
        name: body.name || 'Sub-Agent',
        state: body.state || 'executing',
        message: body.message || 'Working...',
        color: body.color || '#8b5cf6',
        spawnTime: Date.now(),
        timestampAR: formatArgentinaTime(Date.now()),
      };
      subAgents = [...subAgents, subAgent];

      // Also create a network node for the sub-agent
      const nodeId = subAgent.id;
      const nonOrch = networkNodes.filter(n => n.type !== 'orchestrator');
      const pos = assignPosition(nonOrch.length, Math.max(nonOrch.length + 1, 5));
      networkNodes.push({
        id: nodeId,
        type: 'custom',
        name: subAgent.name,
        state: subAgent.state,
        message: subAgent.message,
        color: subAgent.color,
        connections: ['orchestrator'],
        spawnTime: subAgent.spawnTime,
        ...pos,
        size: 1.0,
        glowIntensity: 0.6,
      });

      const entry = {
        state: subAgent.state,
        agentState: subAgent.state,
        message: `🚀 Sub-agent deployed: ${subAgent.name}`,
        phase: phase || '',
        id: `act_${Date.now()}_sub`,
        timestamp: Date.now(),
        timestampAR: formatArgentinaTime(Date.now()),
      };
      activityLog = [entry, ...activityLog].slice(0, MAX_LOG);
      activityTimestamp = Date.now();
      nodeTimestamp = Date.now();

      return NextResponse.json({ ok: true, subAgents: subAgents.length, nodes: networkNodes.length });
    }

    if (type === 'sub-agent-remove') {
      const agentId = body.agentId;
      subAgents = subAgents.filter(a => a.id !== agentId);
      // Also remove corresponding node
      networkNodes = networkNodes.filter(n => n.id !== agentId);
      for (const node of networkNodes) {
        node.connections = (node.connections || []).filter((c: string) => c !== agentId);
      }
      nodeTimestamp = Date.now();
      return NextResponse.json({ ok: true, subAgents: subAgents.length, nodes: networkNodes.length });
    }

    if (type === 'sub-agent-clear') {
      subAgents = [];
      // Also clear non-orchestrator nodes
      networkNodes = networkNodes.filter(n => n.type === 'orchestrator');
      nodeTimestamp = Date.now();
      return NextResponse.json({ ok: true });
    }

    // ─── Sub-Agent Update (v2.0) ─────────────────────────────────
    if (type === 'sub-agent-update') {
      const agentId = body.agentId;
      if (!agentId) return NextResponse.json({ error: 'Missing agentId for sub-agent-update' }, { status: 400 });
      subAgents = subAgents.map(a =>
        a.id === agentId
          ? { ...a, state: body.state || a.state, message: body.message || a.message, timestampAR: formatArgentinaTime(Date.now()) }
          : a
      );
      // Also update corresponding node
      const node = networkNodes.find(n => n.id === agentId);
      if (node) {
        node.state = body.state || node.state;
        node.message = body.message || node.message;
        node.glowIntensity = body.state === 'executing' ? 1.0 : body.state === 'error' ? 1.2 : 0.6;
        node.size = body.state === 'executing' ? 1.2 : body.state === 'error' ? 1.3 : 1.0;
        nodeTimestamp = Date.now();
      }
      return NextResponse.json({ ok: true, subAgents: subAgents.length });
    }

    // ─── Node Pulse (v2.0) — ephemeral connection event ───────────
    if (type === 'node-pulse') {
      const fromId = body.fromNode || 'orchestrator';
      const toId = body.toNode || 'unknown';
      const pulseColor = body.color || '#a855f7';
      // Boost glow on connected nodes briefly
      const fromNode = networkNodes.find(n => n.id === fromId);
      const toNode = networkNodes.find(n => n.id === toId);
      if (fromNode) { fromNode.glowIntensity = Math.min(fromNode.glowIntensity + 0.3, 2.0); }
      if (toNode) { toNode.glowIntensity = Math.min(toNode.glowIntensity + 0.3, 2.0); }
      // Ensure connection exists
      if (fromNode && toNode && !fromNode.connections.includes(toId)) {
        fromNode.connections.push(toId);
      }
      if (toNode && fromNode && !toNode.connections.includes(fromId)) {
        toNode.connections.push(fromId);
      }
      nodeTimestamp = Date.now();
      // Add pulse to activity
      const entry = {
        state: 'executing',
        agentState: 'executing',
        message: `⚡ Pulse: ${fromId} → ${toId}`,
        phase: phase || '',
        id: `act_${Date.now()}_pulse`,
        timestamp: Date.now(),
        timestampAR: formatArgentinaTime(Date.now()),
      };
      activityLog = [entry, ...activityLog].slice(0, MAX_LOG);
      activityTimestamp = Date.now();
      return NextResponse.json({ ok: true });
    }

    // ─── Decision Count (v2.0) ────────────────────────────────────
    if (type === 'decision-count') {
      latestStatus = {
        ...latestStatus,
        totalDecisions: latestStatus.totalDecisions + 1,
        decisionCountThisWave: latestStatus.decisionCountThisWave + 1,
        timestamp: Date.now(),
      };
      // Boost orchestrator glow briefly
      ensureDefaultNetwork();
      const orch = networkNodes.find(n => n.type === 'orchestrator');
      if (orch) {
        orch.glowIntensity = Math.min(orch.glowIntensity + 0.2, 2.0);
        nodeTimestamp = Date.now();
      }
      // Add to activity
      const entry = {
        state: 'planning',
        agentState: 'planning',
        message: `🧠 Decision: ${body.description || 'Decision made'} [${body.category || 'general'}]`,
        phase: phase || 'plan',
        id: `act_${Date.now()}_dec`,
        timestamp: Date.now(),
        timestampAR: formatArgentinaTime(Date.now()),
      };
      activityLog = [entry, ...activityLog].slice(0, MAX_LOG);
      activityTimestamp = Date.now();
      return NextResponse.json({ ok: true, decisionCountThisWave: latestStatus.decisionCountThisWave });
    }

    // ─── Full Update ──────────────────────────────────────────────
    if (type === 'full-update') {
      // Only spread known-safe keys (prevents prototype pollution / injection)
      const safeFullUpdate: Partial<AgentStatus> = {};
      for (const key of FULL_UPDATE_KEYS) {
        if (key in body && body[key] !== undefined) {
          (safeFullUpdate as Record<string, unknown>)[key] = body[key];
        }
      }
      latestStatus = { ...latestStatus, ...safeFullUpdate, timestamp: Date.now() };
      if (body.activities) {
        activityLog = (body.activities as unknown as ActivityEntry[]).map(a => ({
          ...a,
          timestampAR: a.timestampAR || formatArgentinaTime(a.timestamp),
        }));
      }
      if (body.subAgents) {
        subAgents = body.subAgents as unknown as SubAgentEntry[];
      }

      // Update orchestrator node to celebrating state
      const orch = networkNodes.find(n => n.type === 'orchestrator');
      if (orch && body.agentState) {
        orch.state = body.agentState;
        orch.message = body.message || '';
        orch.glowIntensity = body.agentState === 'celebrating' ? 1.5 : 0.5;
        orch.size = body.agentState === 'celebrating' ? 1.4 : 1.0;
        nodeTimestamp = Date.now();
      }

      return NextResponse.json({ ok: true });
    }

    // ─── Default: status update ───────────────────────────────────
    latestStatus = {
      ...latestStatus,
      agentState: agentState || 'idle',
      message: message || '',
      phase: phase || '',
      waveNumber: waveNumber || 0,
      progress: progress || 0,
      waveCount: body.waveCount || latestStatus.waveCount || 0,
      totalImprovements: body.totalImprovements || latestStatus.totalImprovements || 0,
      totalDecisions: body.totalDecisions || latestStatus.totalDecisions || 0,
      decisionCountThisWave: body.decisionCountThisWave || latestStatus.decisionCountThisWave || 0,
      timestamp: Date.now(),
    };

    // Keep orchestrator in sync
    ensureDefaultNetwork();
    const orch = networkNodes.find(n => n.type === 'orchestrator');
    if (orch) {
      orch.state = latestStatus.agentState;
      orch.message = latestStatus.message;
      orch.glowIntensity = latestStatus.agentState === 'executing' ? 1.0
        : latestStatus.agentState === 'thinking' ? 0.7
        : latestStatus.agentState === 'celebrating' ? 1.5
        : latestStatus.agentState === 'error' ? 1.2
        : 0.4;
      nodeTimestamp = Date.now();
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    logError('AGENT_STATUS', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}