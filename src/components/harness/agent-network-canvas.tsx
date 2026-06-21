'use client';

import React, { useRef, useEffect, useCallback } from 'react';
import { useAgentLiveStore, type NetworkNode } from '@/store/agent-live-store';
import { STATE_RGB } from '@/lib/constants';

/* ═════════════════════════════════════════════════════════════════════
   AGENT NETWORK CANVAS v3.0 — Multi-Agent "Living World"

   W235 visual upgrades:
   - Dot grid (not line grid) — modern look
   - Ambient pulse waves emitting from nodes
   - Node name labels on ALL nodes (orchestrator shows "HERMES")
   - Hover connection highlight (proximity to connection boosts line)
   - Selected node breathing halo effect
   - Orchestrator shows current task text below
   - Improved particle trail (glow + fade)
   - Secondary nebula (dual-layer atmosphere)

   W237 visual upgrades ("un mundo para los agentes"):
   - Mesh connections: sub-nodes connect to each other, not just orchestrator
   - Grid dot interaction: dots near active nodes glow with node color
   - Spawn flash: bright expanding ring when a node is born
   - Energy dashes: animated flow on active connections
   - Node repulsion: nodes push apart to avoid overlap
   - Mouse attraction: nodes subtly pulled toward cursor
   - Third nebula layer: dynamic per-node ambient glow
   ═════════════════════════════════════════════════════════════════════ */

// STATE_COLORS now imported from constants.ts as STATE_RGB (single source of truth)

const NODE_TYPE_LABELS: Record<string, string> = {
  orchestrator: 'HERMES',
  assessor: 'ASSESSOR',
  planner: 'PLANNER',
  executor: 'EXECUTOR',
  verifier: 'VERIFIER',
  'git-agent': 'GIT',
  custom: 'AGENT',
};

// ─── Animated node (internal canvas state) ────────────────────────
interface AnimNode {
  id: string;
  name: string;
  type: string;
  state: string;
  message: string;
  color: string;
  rgb: [number, number, number]; // parsed once on creation — avoids per-frame hexToRgb
  connections: string[];
  spawnTime: number;
  tx: number;
  ty: number;
  ax: number;
  ay: number;
  size: number;
  glow: number;
  tGlow: number;
  orbitAngle: number;
  orbitSpeed: number;
  orbitRadius: number;
  spawnProgress: number;
}

// ─── Energy particle flowing along a bezier connection ───────────
interface FlowParticle {
  fromId: string;
  toId: string;
  t: number;
  speed: number;
  color: [number, number, number];
  size: number;
  trail: Array<{ x: number; y: number }>;
}

// ─── Ambient pulse wave ──────────────────────────────────────────
interface PulseWave {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  color: [number, number, number];
  alpha: number;
  speed: number;
}

// ─── Star in the background ──────────────────────────────────────
interface Star {
  x: number;
  y: number;
  size: number;
  brightness: number;
  twinkleSpeed: number;
  twinkleOffset: number;
}

// ─── Constants ───────────────────────────────────────────────────
const LERP_SPEED = 0.04;
const MAX_PARTICLES = 60;
const MOUSE_GLOW_RADIUS = 120;
const GRID_DOT_SIZE = 1;
const GRID_DOT_SPACING = 60;
const GRID_DOT_ALPHA = 0.04;
const MAX_PULSE_WAVES = 8;
const GRID_INTERACT_RADIUS = 90;    // W237: dots within this px of a node glow
const MESH_CONN_ALPHA = 0.06;       // W237: alpha for sub-node mesh connections
const MESH_CONN_THRESHOLD = 0.22;   // W237: normalized dist for mesh connection
const NODE_REPULSE_DIST = 0.1;      // W237: normalized dist for repulsion
const MOUSE_ATTRACT_STRENGTH = 0.0004; // W237: how strongly mouse pulls nodes

export function AgentNetworkCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const sizeRef = useRef({ w: 0, h: 0, dpr: 1 });
  const animFrameRef = useRef<number>(0);
  const timeRef = useRef(0);
  const prevNodeKeyRef = useRef('');
  const nodesMapRef = useRef<Map<string, AnimNode>>(new Map());
  const particlesRef = useRef<FlowParticle[]>([]);
  const starsRef = useRef<Star[]>([]);
  const pulseWavesRef = useRef<PulseWave[]>([]);
  const mouseRef = useRef({ x: -1000, y: -1000 });
  const lastPulseTimeRef = useRef(0);

  const agentState = useAgentLiveStore(s => s.agentState);
  const agentStateRef = useRef(agentState);
  const networkNodes = useAgentLiveStore(s => s.networkNodes);
  const selectedNodeId = useAgentLiveStore(s => s.selectedNodeId);
  const selectNode = useAgentLiveStore(s => s.selectNode);
  const waveNumber = useAgentLiveStore(s => s.waveNumber);
  const progress = useAgentLiveStore(s => s.progress);

  // Sync reactive store values into refs for stable draw-loop reads
  useEffect(() => { agentStateRef.current = agentState; }, [agentState]);
  const selectedIdRef = useRef(selectedNodeId);
  useEffect(() => { selectedIdRef.current = selectedNodeId; }, [selectedNodeId]);
  const waveNumRef = useRef(waveNumber);
  useEffect(() => { waveNumRef.current = waveNumber; }, [waveNumber]);
  const progressRef = useRef(progress);
  useEffect(() => { progressRef.current = progress; }, [progress]);

  const hexToRgb = useCallback((hex: string): [number, number, number] => {
    const h = hex.replace('#', '');
    return [
      parseInt(h.substring(0, 2), 16),
      parseInt(h.substring(2, 4), 16),
      parseInt(h.substring(4, 6), 16),
    ];
  }, []);

  // Stable function — reads agentState from ref, safe to call inside draw loop
  // Not a useCallback to avoid re-creating the animation loop on state changes
  const ensureOrchestrator = (): AnimNode => {
    const existing = nodesMapRef.current.get('orchestrator');
    if (existing) return existing;
    const fallback: AnimNode = {
      id: 'orchestrator', type: 'orchestrator', name: 'HERMES',
      state: agentStateRef.current, message: '', color: '#f59e0b', rgb: [245, 158, 11], connections: [],
      spawnTime: Date.now(), tx: 0.5, ty: 0.45, ax: 0.5, ay: 0.45,
      size: 1, glow: 0.5, tGlow: 0.5,
      orbitAngle: 0, orbitSpeed: 0, orbitRadius: 0, spawnProgress: 1,
    };
    nodesMapRef.current.set('orchestrator', fallback);
    return fallback;
  };

  useEffect(() => {
    const nodeMap = nodesMapRef.current;
    const currentIds = new Set<string>();
    const key = networkNodes.map(n => `${n.id}:${n.state}:${n.size}:${n.glowIntensity}`).join('|');
    if (key === prevNodeKeyRef.current) return;
    prevNodeKeyRef.current = key;

    for (const node of networkNodes) {
      currentIds.add(node.id);
      const existing = nodeMap.get(node.id);
      if (existing) {
        existing.tx = node.x;
        existing.ty = node.y;
        existing.tGlow = node.glowIntensity;
        existing.size = node.size;
        existing.state = node.state;
        existing.message = node.message;
        existing.color = node.color;
        existing.rgb = hexToRgb(node.color);
        existing.connections = node.connections;
      } else {
        const isOrch = node.type === 'orchestrator';
        const nonOrchCount = [...nodeMap.values()].filter(n => n.type !== 'orchestrator').length;
        const total = Math.max(nonOrchCount + 1, 1);
        const angle = (2 * Math.PI / total) * nonOrchCount + (Math.random() - 0.5) * 0.3;
        // Two-tier radius: first 4 agents closer, rest in outer ring
        const baseRadius = nonOrchCount < 4 ? 0.18 : 0.28;
        const radius = baseRadius + Math.random() * 0.06;
        const targetX = isOrch ? 0.5 : 0.5 + radius * Math.cos(angle);
        const targetY = isOrch ? 0.45 : 0.45 + radius * Math.sin(angle);
        nodeMap.set(node.id, {
          id: node.id, name: node.name, type: node.type,
          state: node.state, message: node.message, color: node.color,
          rgb: hexToRgb(node.color),
          connections: node.connections, spawnTime: node.spawnTime,
          tx: targetX, ty: targetY,
          ax: isOrch ? 0.5 : 0.5, ay: isOrch ? 0.45 : 0.45,
          size: node.size, glow: node.glowIntensity, tGlow: node.glowIntensity,
          orbitAngle: Math.random() * Math.PI * 2,
          orbitSpeed: 0.0003 + Math.random() * 0.0005,
          orbitRadius: 0.008 + Math.random() * 0.015,
          spawnProgress: 0,
        });
      }
    }

    for (const [id] of nodeMap) {
      if (!currentIds.has(id) && id !== 'orchestrator') {
        nodeMap.delete(id);
      }
    }
  }, [networkNodes]);

  useEffect(() => {
    const stars: Star[] = [];
    for (let i = 0; i < 150; i++) {
      stars.push({
        x: Math.random(), y: Math.random(),
        size: Math.random() * 1.2 + 0.3,
        brightness: Math.random() * 0.4 + 0.1,
        twinkleSpeed: Math.random() * 2 + 0.8,
        twinkleOffset: Math.random() * Math.PI * 2,
      });
    }
    starsRef.current = stars;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      const rect = container.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      sizeRef.current = { w: rect.width, h: rect.height, dpr };
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(container);

    const onMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };

    const onClick = () => {
      const { w, h } = sizeRef.current;
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;
      let clicked: string | null = null;

      ensureOrchestrator();
      for (const [, n] of nodesMapRef.current) {
        const nx = n.ax * w;
        const ny = n.ay * h;
        const baseR = (n.type === 'orchestrator' ? 32 : 22) * n.size;
        const dist = Math.sqrt((mx - nx) ** 2 + (my - ny) ** 2);
        if (dist < baseR + 12) {
          clicked = selectedIdRef.current === n.id ? null : n.id;
          break;
        }
      }
      selectNode(clicked);
    };

    canvas.addEventListener('mousemove', onMouseMove);
    canvas.addEventListener('click', onClick);

    const bezierPoint = (
      x0: number, y0: number, cx: number, cy: number, x1: number, y1: number, t: number,
    ): [number, number] => {
      const u = 1 - t;
      return [u * u * x0 + 2 * u * t * cx + t * t * x1, u * u * y0 + 2 * u * t * cy + t * t * y1];
    };

    // Smart bezier control point: curves perpendicular to the line, scaled by distance
    // Gives organic-looking arcs instead of always-bending-up
    const smartCP = (sx: number, sy: number, ex: number, ey: number, seed: number): [number, number] => {
      const mx = (sx + ex) / 2;
      const my = (sy + ey) / 2;
      const dx = ex - sx;
      const dy = ey - sy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      // Normal vector (perpendicular)
      const nx = -dy / (dist || 1);
      const ny = dx / (dist || 1);
      // Curve amount: 20% of distance, direction based on seed
      const curve = dist * 0.18 * (seed > 0.5 ? 1 : -1);
      return [mx + nx * curve, my + ny * curve];
    };

    // Distance from point to quadratic bezier (approximate: sample 10 points)
    const distToBezier = (
      px: number, py: number,
      x0: number, y0: number, cx: number, cy: number, x1: number, y1: number,
    ): number => {
      let minD = Infinity;
      for (let i = 0; i <= 10; i++) {
        const [bx, by] = bezierPoint(x0, y0, cx, cy, x1, y1, i / 10);
        const d = Math.sqrt((px - bx) ** 2 + (py - by) ** 2);
        if (d < minD) minD = d;
      }
      return minD;
    };

    const spawnParticles = (nodes: AnimNode[]) => {
      const particles = particlesRef.current;
      if (Math.random() < 0.14 && particles.length < MAX_PARTICLES) {
        const candidates = nodes.filter(n => n.connections.length > 0);
        if (candidates.length === 0) return;
        const src = candidates[Math.floor(Math.random() * candidates.length)];
        const connId = src.connections[Math.floor(Math.random() * src.connections.length)];
        const dst = nodes.find(n => n.id === connId);
        if (!dst) return;

        const forward = Math.random() > 0.5;
        const from = forward ? src : dst;
        const to = forward ? dst : src;
        particles.push({
          fromId: from.id, toId: to.id,
          t: 0, speed: 0.003 + Math.random() * 0.007,
          color: from.rgb, size: 1.2 + Math.random() * 1.5,
          trail: [],
        });
      }
      for (let i = particles.length - 1; i >= 0; i--) {
        particles[i].t += particles[i].speed;
        if (particles[i].t > 1) particles.splice(i, 1);
      }
    };

    // Spawn ambient pulse waves from active nodes
    const spawnPulseWaves = (nodes: AnimNode[], w: number, h: number) => {
      const now = Date.now();
      const waves = pulseWavesRef.current;
      if (now - lastPulseTimeRef.current > 2500 && waves.length < MAX_PULSE_WAVES) {
        const active = nodes.filter(n => n.state !== 'idle' && n.state !== 'offline' && n.spawnProgress >= 1);
        if (active.length > 0) {
          const src = active[Math.floor(Math.random() * active.length)];
          waves.push({
            x: src.ax * w, y: src.ay * h,
            radius: (src.type === 'orchestrator' ? 32 : 22) * src.size,
            maxRadius: 120 + Math.random() * 80,
            color: src.rgb,
            alpha: 0.15,
            speed: 0.6 + Math.random() * 0.4,
          });
          lastPulseTimeRef.current = now;
        }
      }
      for (let i = waves.length - 1; i >= 0; i--) {
        waves[i].radius += waves[i].speed;
        waves[i].alpha *= 0.985;
        if (waves[i].alpha < 0.005 || waves[i].radius > waves[i].maxRadius) {
          waves.splice(i, 1);
        }
      }
    };

    const draw = () => {
      const { w, h } = sizeRef.current;
      if (w === 0 || h === 0) { animFrameRef.current = requestAnimationFrame(draw); return; }

      timeRef.current += 0.016;
      const t = timeRef.current;
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;

      // ── Background ──
      ctx.fillStyle = '#07070a';
      ctx.fillRect(0, 0, w, h);

      // ── Ensure nodes exist (needed for grid + nebula interaction) ──
      ensureOrchestrator();
      const allNodes = [...nodesMapRef.current.values()];

      // ── Dot grid with node interaction (W237: dots glow near active nodes) ──
      // Pre-compute active node screen positions for grid interaction
      const activeNodePositions: Array<{ x: number; y: number; rgb: [number, number, number]; intensity: number }> = [];
      for (const n of allNodes) {
        if (n.state !== 'idle' && n.state !== 'offline' && n.spawnProgress >= 0.8) {
          activeNodePositions.push({
            x: n.ax * w, y: n.ay * h,
            rgb: n.state !== 'idle' ? (STATE_RGB[n.state] || n.rgb) : n.rgb,
            intensity: n.glow,
          });
        }
      }
      for (let gx = GRID_DOT_SPACING; gx < w; gx += GRID_DOT_SPACING) {
        for (let gy = GRID_DOT_SPACING; gy < h; gy += GRID_DOT_SPACING) {
          // Check proximity to active nodes
          let dotR = 255, dotG = 255, dotB = 255;
          let dotAlpha = GRID_DOT_ALPHA;
          for (const an of activeNodePositions) {
            const dx = gx - an.x;
            const dy = gy - an.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < GRID_INTERACT_RADIUS) {
              const influence = (1 - dist / GRID_INTERACT_RADIUS) * an.intensity;
              const blend = Math.min(influence * 0.6, 0.9);
              dotR = Math.round(dotR * (1 - blend) + an.rgb[0] * blend);
              dotG = Math.round(dotG * (1 - blend) + an.rgb[1] * blend);
              dotB = Math.round(dotB * (1 - blend) + an.rgb[2] * blend);
              dotAlpha = Math.min(dotAlpha + influence * 0.12, 0.18);
            }
          }
          ctx.fillStyle = `rgba(${dotR},${dotG},${dotB},${dotAlpha})`;
          ctx.beginPath();
          ctx.arc(gx, gy, GRID_DOT_SIZE + (dotAlpha > GRID_DOT_ALPHA + 0.02 ? 0.3 : 0), 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // ── Dual-layer nebula (primary state + secondary ambient) ──
      const stateRgb = STATE_RGB[agentStateRef.current] || STATE_RGB.idle;
      const nebula1 = ctx.createRadialGradient(w * 0.5, h * 0.4, 0, w * 0.5, h * 0.4, w * 0.7);
      nebula1.addColorStop(0, `rgba(${stateRgb[0]},${stateRgb[1]},${stateRgb[2]},0.05)`);
      nebula1.addColorStop(0.4, `rgba(${stateRgb[0]},${stateRgb[1]},${stateRgb[2]},0.015)`);
      nebula1.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = nebula1;
      ctx.fillRect(0, 0, w, h);

      // Secondary nebula — offset, different color, very subtle
      const neb2Rgb = STATE_RGB.thinking;
      const nebula2 = ctx.createRadialGradient(w * 0.3, h * 0.6, 0, w * 0.3, h * 0.6, w * 0.5);
      nebula2.addColorStop(0, `rgba(${neb2Rgb[0]},${neb2Rgb[1]},${neb2Rgb[2]},0.015)`);
      nebula2.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = nebula2;
      ctx.fillRect(0, 0, w, h);

      // W237: Third nebula layer — dynamic per-node ambient glow (faint colored halos)
      for (const n of allNodes) {
        if (n.state === 'idle' || n.state === 'offline' || n.spawnProgress < 0.5) continue;
        const nx = n.ax * w;
        const ny = n.ay * h;
        const nebRgb = STATE_RGB[n.state] || n.rgb;
        const nebR = 100 + n.glow * 60;
        const nodeNeb = ctx.createRadialGradient(nx, ny, 0, nx, ny, nebR);
        nodeNeb.addColorStop(0, `rgba(${nebRgb[0]},${nebRgb[1]},${nebRgb[2]},${0.025 * n.glow})`);
        nodeNeb.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = nodeNeb;
        ctx.beginPath();
        ctx.arc(nx, ny, nebR, 0, Math.PI * 2);
        ctx.fill();
      }

      // ── Stars ──
      const stars = starsRef.current;
      for (const star of stars) {
        const twinkle = Math.sin(t * star.twinkleSpeed + star.twinkleOffset) * 0.5 + 0.5;
        const alpha = star.brightness * twinkle;
        ctx.fillStyle = `rgba(255,255,255,${alpha})`;
        ctx.beginPath();
        ctx.arc(star.x * w, star.y * h, star.size, 0, Math.PI * 2);
        ctx.fill();
      }

      // ── Update animated positions with repulsion + mouse attraction (W237) ──
      for (const n of allNodes) {
        if (n.spawnProgress < 1) n.spawnProgress = Math.min(n.spawnProgress + 0.02, 1);
        if (n.type !== 'orchestrator') {
          n.orbitAngle += n.orbitSpeed;
          n.ax += Math.cos(n.orbitAngle) * n.orbitRadius * 0.02;
          n.ay += Math.sin(n.orbitAngle) * n.orbitRadius * 0.02;
        }
        n.ax += (n.tx - n.ax) * LERP_SPEED;
        n.ay += (n.ty - n.ay) * LERP_SPEED;
        n.glow += (n.tGlow - n.glow) * 0.05;
      }
      // W237: Node proximity repulsion — push apart overlapping non-orchestrator nodes
      const subNodes = allNodes.filter(n => n.type !== 'orchestrator' && n.spawnProgress > 0.5);
      for (let i = 0; i < subNodes.length; i++) {
        for (let j = i + 1; j < subNodes.length; j++) {
          const a = subNodes[i], b = subNodes[j];
          const dx = b.ax - a.ax;
          const dy = b.ay - a.ay;
          const dist = Math.sqrt(dx * dx + dy * dy) || 0.001;
          if (dist < NODE_REPULSE_DIST) {
            const force = (NODE_REPULSE_DIST - dist) * 0.003;
            const nx = dx / dist;
            const ny = dy / dist;
            a.ax -= nx * force;
            a.ay -= ny * force;
            b.ax += nx * force;
            b.ay += ny * force;
          }
        }
      }
      // W237: Mouse attraction — subtly pull non-orchestrator nodes toward cursor
      if (mx > 0 && my > 0) {
        const mxNorm = mx / w;
        const myNorm = my / h;
        for (const n of subNodes) {
          const dx = mxNorm - n.ax;
          const dy = myNorm - n.ay;
          const dist = Math.sqrt(dx * dx + dy * dy) || 0.001;
          if (dist < 0.25) {
            const attract = (1 - dist / 0.25) * MOUSE_ATTRACT_STRENGTH;
            n.ax += (dx / dist) * attract;
            n.ay += (dy / dist) * attract;
          }
        }
      }

      // ── Screen positions ──
      const screen = new Map<string, { x: number; y: number; node: AnimNode }>();
      for (const n of allNodes) {
        screen.set(n.id, { x: n.ax * w, y: n.ay * h, node: n });
      }

      // ── Ambient pulse waves ──
      spawnPulseWaves(allNodes, w, h);
      for (const pw of pulseWavesRef.current) {
        ctx.strokeStyle = `rgba(${pw.color[0]},${pw.color[1]},${pw.color[2]},${pw.alpha})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(pw.x, pw.y, pw.radius, 0, Math.PI * 2);
        ctx.stroke();
      }

      // ── Draw Connections (quadratic bezier) with hover highlight + energy dashes ──
      const drawnPairs = new Set<string>();
      for (const n of allNodes) {
        for (const connId of n.connections) {
          const pairKey = [n.id, connId].sort().join(':');
          if (drawnPairs.has(pairKey)) continue;
          drawnPairs.add(pairKey);

          const target = screen.get(connId);
          if (!target) continue;

          const fromRgb = n.rgb;
          const isOrchConn = n.type === 'orchestrator' || target.node.type === 'orchestrator';
          const isActive = n.state !== 'idle' && n.state !== 'offline';
          let alpha = (isActive ? 0.2 : 0.07) + Math.sin(t * 2 + n.spawnTime * 0.001) * 0.06;

          // W235: Hover connection highlight
          const sx = n.ax * w;
          const sy = n.ay * h;
          const ex = target.x;
          const ey = target.y;
          const [cpx, cpy] = smartCP(sx, sy, ex, ey, n.spawnTime);
          const distToConn = distToBezier(mx, my, sx, sy, cpx, cpy, ex, ey);
          if (distToConn < 30) {
            alpha += (1 - distToConn / 30) * 0.35;
          }

          ctx.strokeStyle = `rgba(${fromRgb[0]},${fromRgb[1]},${fromRgb[2]},${Math.max(0, alpha)})`;
          ctx.lineWidth = isOrchConn ? 1.5 : 0.8;

          // W237: Animated energy dashes on active orchestrator connections
          if (isOrchConn && isActive) {
            ctx.setLineDash([4, 8]);
            ctx.lineDashOffset = -t * 30;
          }

          ctx.beginPath();
          ctx.moveTo(sx, sy);
          ctx.quadraticCurveTo(cpx, cpy, ex, ey);
          ctx.stroke();
          ctx.setLineDash([]);
          ctx.lineDashOffset = 0;
        }
      }

      // W237: Mesh connections between sub-nodes (not just to orchestrator)
      for (let i = 0; i < subNodes.length; i++) {
        for (let j = i + 1; j < subNodes.length; j++) {
          const a = subNodes[i], b = subNodes[j];
          const dx = (b.ax - a.ax);
          const dy = (b.ay - a.ay);
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < MESH_CONN_THRESHOLD) {
            const proximity = 1 - dist / MESH_CONN_THRESHOLD;
            const meshAlpha = MESH_CONN_ALPHA * proximity;
            // Blend colors of both nodes
            const mr = Math.round((a.rgb[0] + b.rgb[0]) / 2);
            const mg = Math.round((a.rgb[1] + b.rgb[1]) / 2);
            const mb = Math.round((a.rgb[2] + b.rgb[2]) / 2);
            ctx.strokeStyle = `rgba(${mr},${mg},${mb},${meshAlpha})`;
            ctx.lineWidth = 0.5;
            const ax2 = a.ax * w, ay2 = a.ay * h;
            const bx2 = b.ax * w, by2 = b.ay * h;
            const seed = ((a.spawnTime + b.spawnTime) % 1000) / 1000;
            const [mcpx, mcpy] = smartCP(ax2, ay2, bx2, by2, seed);
            ctx.beginPath();
            ctx.moveTo(ax2, ay2);
            ctx.quadraticCurveTo(mcpx, mcpy, bx2, by2);
            ctx.stroke();
          }
        }
      }

      // ── Spawn & draw flow particles with glow trail ──
      spawnParticles(allNodes);
      const particles = particlesRef.current;
      for (const p of particles) {
        const fromScreen = screen.get(p.fromId);
        const toScreen = screen.get(p.toId);
        if (!fromScreen || !toScreen) continue;

        // Use the same smartCP as connections (seed from particle fromId hash)
        const seed = (parseInt(p.fromId.slice(-4), 36) || 0.5) % 1;
        const [cpx, cpy] = smartCP(
          fromScreen.x, fromScreen.y, toScreen.x, toScreen.y, seed,
        );
        const [px, py] = bezierPoint(
          fromScreen.x, fromScreen.y, cpx, cpy, toScreen.x, toScreen.y, p.t,
        );

        // Store trail position
        p.trail.push({ x: px, y: py });
        if (p.trail.length > 6) p.trail.shift();

        // Draw trail (fading glow)
        for (let ti = 0; ti < p.trail.length; ti++) {
          const trailAlpha = (ti / p.trail.length) * Math.sin(p.t * Math.PI) * 0.3;
          const trailSize = p.size * (ti / p.trail.length) * 0.6;
          ctx.fillStyle = `rgba(${p.color[0]},${p.color[1]},${p.color[2]},${trailAlpha})`;
          ctx.beginPath();
          ctx.arc(p.trail[ti].x, p.trail[ti].y, trailSize, 0, Math.PI * 2);
          ctx.fill();
        }

        // Draw main particle with glow
        const alpha = Math.sin(p.t * Math.PI) * 0.9;
        // Glow halo
        const glowGrad = ctx.createRadialGradient(px, py, 0, px, py, p.size * 4);
        glowGrad.addColorStop(0, `rgba(${p.color[0]},${p.color[1]},${p.color[2]},${alpha * 0.3})`);
        glowGrad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = glowGrad;
        ctx.beginPath();
        ctx.arc(px, py, p.size * 4, 0, Math.PI * 2);
        ctx.fill();
        // Core
        ctx.fillStyle = `rgba(${p.color[0]},${p.color[1]},${p.color[2]},${alpha})`;
        ctx.beginPath();
        ctx.arc(px, py, p.size, 0, Math.PI * 2);
        ctx.fill();
      }

      // ── Draw Nodes ──
      for (const n of allNodes) {
        const sx = n.ax * w;
        const sy = n.ay * h;
        const rgb = n.rgb;

        // Mouse proximity → extra glow boost
        const mouseDist = Math.sqrt((mx - sx) ** 2 + (my - sy) ** 2);
        const mouseBoost = mouseDist < MOUSE_GLOW_RADIUS
          ? (1 - mouseDist / MOUSE_GLOW_RADIUS) * 0.4
          : 0;
        const effectiveGlow = Math.min(1, n.glow + mouseBoost);

        const baseRadius = (n.type === 'orchestrator' ? 32 : 22) * n.size
          * (1 + Math.sin(t * 1.2 + n.spawnTime * 0.001) * 0.03)
          * n.spawnProgress;
        const radius = Math.max(6, baseRadius);

        // Outer glow (larger, more diffuse)
        const glowR = radius * (2.2 + effectiveGlow * 1.0);
        const outerGlow = ctx.createRadialGradient(sx, sy, radius * 0.3, sx, sy, glowR);
        outerGlow.addColorStop(0, `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${0.14 * effectiveGlow})`);
        outerGlow.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = outerGlow;
        ctx.beginPath();
        ctx.arc(sx, sy, glowR, 0, Math.PI * 2);
        ctx.fill();

        // State-based secondary glow (active nodes)
        if (n.state !== 'idle' && n.state !== 'offline') {
          const stRgb = STATE_RGB[n.state] || STATE_RGB.idle;
          const stateGlowR = radius * (2.0 + effectiveGlow * 0.6);
          const stateGlow = ctx.createRadialGradient(sx, sy, 0, sx, sy, stateGlowR);
          stateGlow.addColorStop(0, `rgba(${stRgb[0]},${stRgb[1]},${stRgb[2]},${0.2 * effectiveGlow})`);
          stateGlow.addColorStop(1, 'rgba(0,0,0,0)');
          ctx.fillStyle = stateGlow;
          ctx.beginPath();
          ctx.arc(sx, sy, stateGlowR, 0, Math.PI * 2);
          ctx.fill();
        }

        // Pulsing ring (active nodes) — double ring for more visual interest
        if (n.state !== 'idle' && n.state !== 'offline') {
          const ringPulse = (Math.sin(t * 2.5 + n.spawnTime * 0.001) + 1) / 2;
          const ringR = radius * (1.3 + ringPulse * 0.4);
          ctx.strokeStyle = `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${0.2 - ringPulse * 0.15})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(sx, sy, ringR, 0, Math.PI * 2);
          ctx.stroke();

          // Second outer pulse ring (offset phase)
          const ring2Pulse = (Math.sin(t * 1.8 + n.spawnTime * 0.001 + 1.5) + 1) / 2;
          const ring2R = radius * (1.6 + ring2Pulse * 0.5);
          ctx.strokeStyle = `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${0.08 - ring2Pulse * 0.06})`;
          ctx.lineWidth = 0.5;
          ctx.beginPath();
          ctx.arc(sx, sy, ring2R, 0, Math.PI * 2);
          ctx.stroke();
        }

        // W237: Spawn flash — bright expanding ring when node is being born
        if (n.spawnProgress < 0.4) {
          const flashProgress = n.spawnProgress / 0.4;
          const flashRadius = radius * (1 + flashProgress * 3);
          const flashAlpha = (1 - flashProgress) * 0.5;
          const flashGrad = ctx.createRadialGradient(sx, sy, radius, sx, sy, flashRadius);
          flashGrad.addColorStop(0, `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${flashAlpha})`);
          flashGrad.addColorStop(0.5, `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${flashAlpha * 0.3})`);
          flashGrad.addColorStop(1, 'rgba(0,0,0,0)');
          ctx.fillStyle = flashGrad;
          ctx.beginPath();
          ctx.arc(sx, sy, flashRadius, 0, Math.PI * 2);
          ctx.fill();
          // Flash ring
          ctx.strokeStyle = `rgba(${Math.min(255, rgb[0] + 80)},${Math.min(255, rgb[1] + 80)},${Math.min(255, rgb[2] + 80)},${(1 - flashProgress) * 0.6})`;
          ctx.lineWidth = 1.5 * (1 - flashProgress);
          ctx.beginPath();
          ctx.arc(sx, sy, flashRadius * 0.8, 0, Math.PI * 2);
          ctx.stroke();
        }

        // W235: Selected node — breathing halo with gradient
        if (selectedIdRef.current === n.id) {
          const breathe = (Math.sin(t * 2) + 1) / 2;
          // Inner ring
          ctx.strokeStyle = `rgba(255,255,255,${0.3 + breathe * 0.15})`;
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(sx, sy, radius + 8, 0, Math.PI * 2);
          ctx.stroke();

          // Breathing halo
          const haloR = radius + 14 + breathe * 6;
          const haloGrad = ctx.createRadialGradient(sx, sy, haloR - 4, sx, sy, haloR + 4);
          haloGrad.addColorStop(0, `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${0.12 + breathe * 0.08})`);
          haloGrad.addColorStop(1, 'rgba(0,0,0,0)');
          ctx.strokeStyle = `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${0.2 + breathe * 0.1})`;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(sx, sy, haloR, 0, Math.PI * 2);
          ctx.stroke();

          // Outer faint ring
          const outerR = radius + 22 + breathe * 8;
          ctx.strokeStyle = `rgba(255,255,255,${0.04 + breathe * 0.04})`;
          ctx.lineWidth = 0.5;
          ctx.beginPath();
          ctx.arc(sx, sy, outerR, 0, Math.PI * 2);
          ctx.stroke();
        }

        // Core circle gradient (improved lighting)
        const coreGrad = ctx.createRadialGradient(
          sx - radius * 0.2, sy - radius * 0.2, 0,
          sx, sy, radius,
        );
        coreGrad.addColorStop(0, `rgba(${Math.min(255, rgb[0] + 90)},${Math.min(255, rgb[1] + 90)},${Math.min(255, rgb[2] + 90)},0.97)`);
        coreGrad.addColorStop(0.5, `rgba(${rgb[0]},${rgb[1]},${rgb[2]},0.9)`);
        coreGrad.addColorStop(1, `rgba(${Math.floor(rgb[0] * 0.5)},${Math.floor(rgb[1] * 0.5)},${Math.floor(rgb[2] * 0.5)},0.85)`);
        ctx.fillStyle = coreGrad;
        ctx.beginPath();
        ctx.arc(sx, sy, radius, 0, Math.PI * 2);
        ctx.fill();

        // Specular highlight
        const brightAlpha = 0.2 + effectiveGlow * 0.15;
        ctx.fillStyle = `rgba(255,255,255,${brightAlpha})`;
        ctx.beginPath();
        ctx.arc(sx - radius * 0.18, sy - radius * 0.18, radius * 0.28, 0, Math.PI * 2);
        ctx.fill();

        // W235: Node label for ALL nodes
        const isOrch = n.type === 'orchestrator';
        const label = NODE_TYPE_LABELS[n.type] || n.name.toUpperCase().slice(0, 10);
        ctx.fillStyle = 'rgba(255,255,255,0.9)';
        ctx.font = `${isOrch ? 'bold 10px' : 'bold 8px'} monospace`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(label, sx, sy);

        // W235: Task message for ALL nodes with messages (not just non-orchestrator)
        if (n.message) {
          const msgAlpha = isOrch ? 0.5 : 0.55;
          ctx.fillStyle = `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${msgAlpha})`;
          ctx.font = `${isOrch ? '7.5px' : '7px'} monospace`;
          const maxLen = isOrch ? 36 : 28;
          const msg = n.message.length > maxLen ? n.message.slice(0, maxLen) + '...' : n.message;
          ctx.fillText(msg, sx, sy + radius + 13);
        }
      }

      // ── Wave Progress Ring (around orchestrator) — with glow ──
      if (waveNumRef.current > 0 && progressRef.current > 0) {
        const orch = nodesMapRef.current.get('orchestrator');
        if (orch) {
          const sx = orch.ax * w;
          const sy = orch.ay * h;
          const ringRadius = 44 * orch.size;
          const startAngle = -Math.PI / 2;
          const endAngle = startAngle + Math.PI * 2 * progressRef.current;
          const progRgb = STATE_RGB[agentStateRef.current] || STATE_RGB.idle;

          // Glow behind the arc
          ctx.strokeStyle = `rgba(${progRgb[0]},${progRgb[1]},${progRgb[2]},0.15)`;
          ctx.lineWidth = 6;
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.arc(sx, sy, ringRadius, startAngle, endAngle);
          ctx.stroke();

          // Main arc
          ctx.strokeStyle = `rgba(${progRgb[0]},${progRgb[1]},${progRgb[2]},0.6)`;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(sx, sy, ringRadius, startAngle, endAngle);
          ctx.stroke();

          // Leading dot
          const dotX = sx + Math.cos(endAngle) * ringRadius;
          const dotY = sy + Math.sin(endAngle) * ringRadius;
          ctx.fillStyle = `rgba(${progRgb[0]},${progRgb[1]},${progRgb[2]},0.8)`;
          ctx.beginPath();
          ctx.arc(dotX, dotY, 3, 0, Math.PI * 2);
          ctx.fill();

          ctx.lineCap = 'butt';
        }
      }

      // ── Subtle CRT scanlines ──
      ctx.fillStyle = 'rgba(0,0,0,0.02)';
      for (let y = 0; y < h; y += 3) {
        ctx.fillRect(0, y, w, 1);
      }

      // ── Vignette (improved: softer edges) ──
      const vigR = Math.max(w, h) * 0.85;
      const vignette = ctx.createRadialGradient(w / 2, h / 2, w * 0.25, w / 2, h / 2, vigR);
      vignette.addColorStop(0, 'rgba(0,0,0,0)');
      vignette.addColorStop(0.7, 'rgba(0,0,0,0.1)');
      vignette.addColorStop(1, 'rgba(0,0,0,0.55)');
      ctx.fillStyle = vignette;
      ctx.fillRect(0, 0, w, h);

      animFrameRef.current = requestAnimationFrame(draw);
    };

    animFrameRef.current = requestAnimationFrame(draw);

    return () => {
      ro.disconnect();
      cancelAnimationFrame(animFrameRef.current);
      canvas.removeEventListener('mousemove', onMouseMove);
      canvas.removeEventListener('click', onClick);
    };
  }, [networkNodes, selectNode]); // stable: agentState/selectedNodeId/waveNumber/progress read via refs

  return (
    <div ref={containerRef} className="absolute inset-0">
      <canvas ref={canvasRef} className="w-full h-full" />
    </div>
  );
}