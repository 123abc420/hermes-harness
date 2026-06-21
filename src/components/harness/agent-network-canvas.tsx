'use client';

import React, { useRef, useEffect, useCallback } from 'react';
import { useAgentLiveStore, type NetworkNode } from '@/store/agent-live-store';

/* ═════════════════════════════════════════════════════════════════════
   AGENT NETWORK CANVAS v2.1 — Multi-Agent "Living Network"

   A node graph where each agent is a glowing orb connected by
   energy lines. Nodes pulse, drift, and resize based on state.
   Connections show flowing energy particles along bezier curves.
   Background: subtle grid + state-tinted nebula.

   W234 fixes:
   - Full rewrite from broken v2.0 (20+ compile errors)
   - Particles now follow bezier curves (not straight lines)
   - Click detection uses animated positions (with drift)
   - Mouse proximity boosts node glow interactively
   - No unused subscriptions (healthScore removed)
   - No nested useEffect (React rules violation)
   ═════════════════════════════════════════════════════════════════════ */

const STATE_COLORS: Record<string, [number, number, number]> = {
  idle: [245, 158, 11],
  thinking: [6, 182, 212],
  searching: [249, 115, 22],
  planning: [168, 85, 247],
  executing: [244, 63, 94],
  verifying: [34, 197, 94],
  celebrating: [234, 179, 8],
  error: [220, 38, 38],
  evolving: [217, 70, 239],
  offline: [113, 113, 122],
};

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
  connections: string[];
  spawnTime: number;
  // Target position (from server)
  tx: number;
  ty: number;
  // Current animated position
  ax: number;
  ay: number;
  // Visual properties
  size: number;
  glow: number;
  tGlow: number;
  // Animation
  orbitAngle: number;
  orbitSpeed: number;
  orbitRadius: number;
  spawnProgress: number;
}

// ─── Energy particle flowing along a bezier connection ───────────
interface FlowParticle {
  fromId: string;
  toId: string;
  t: number;           // 0→1 progress along the curve
  speed: number;
  color: [number, number, number];
  size: number;
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
const MAX_PARTICLES = 50;
const MOUSE_GLOW_RADIUS = 120; // px — range where mouse proximity boosts glow

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
  const mouseRef = useRef({ x: -1000, y: -1000 });

  const agentState = useAgentLiveStore(s => s.agentState);
  const networkNodes = useAgentLiveStore(s => s.networkNodes);
  const selectedNodeId = useAgentLiveStore(s => s.selectedNodeId);
  const selectNode = useAgentLiveStore(s => s.selectNode);
  const waveNumber = useAgentLiveStore(s => s.waveNumber);
  const progress = useAgentLiveStore(s => s.progress);

  // ─── Hex → RGB ────────────────────────────────────────────────
  const hexToRgb = useCallback((hex: string): [number, number, number] => {
    const h = hex.replace('#', '');
    return [
      parseInt(h.substring(0, 2), 16),
      parseInt(h.substring(2, 4), 16),
      parseInt(h.substring(4, 6), 16),
    ];
  }, []);

  // ─── Ensure orchestrator exists as fallback ────────────────────
  const ensureOrchestrator = useCallback((): AnimNode => {
    const existing = nodesMapRef.current.get('orchestrator');
    if (existing) return existing;
    const fallback: AnimNode = {
      id: 'orchestrator', type: 'orchestrator', name: 'HERMES',
      state: agentState, message: '', color: '#f59e0b', connections: [],
      spawnTime: Date.now(), tx: 0.5, ty: 0.45, ax: 0.5, ay: 0.45,
      size: 1, glow: 0.5, tGlow: 0.5,
      orbitAngle: 0, orbitSpeed: 0, orbitRadius: 0, spawnProgress: 1,
    };
    nodesMapRef.current.set('orchestrator', fallback);
    return fallback;
  }, [agentState]);

  // ─── Sync store NetworkNode[] → internal AnimNode map ─────────
  useEffect(() => {
    const nodeMap = nodesMapRef.current;
    const currentIds = new Set<string>();

    // Skip if nothing changed
    const key = networkNodes.map(n => `${n.id}:${n.state}:${n.size}:${n.glowIntensity}`).join('|');
    if (key === prevNodeKeyRef.current) return;
    prevNodeKeyRef.current = key;

    for (const node of networkNodes) {
      currentIds.add(node.id);
      const existing = nodeMap.get(node.id);
      if (existing) {
        // Update mutable fields (animated position lerps toward target)
        existing.tx = node.x;
        existing.ty = node.y;
        existing.tGlow = node.glowIntensity;
        existing.size = node.size;
        existing.state = node.state;
        existing.message = node.message;
        existing.color = node.color;
        existing.connections = node.connections;
      } else {
        // New node — place in orbit around orchestrator
        const isOrch = node.type === 'orchestrator';
        const nonOrchCount = [...nodeMap.values()].filter(n => n.type !== 'orchestrator').length;
        const total = Math.max(nonOrchCount + 1, 1);
        const angle = (2 * Math.PI / total) * nonOrchCount + (Math.random() - 0.5) * 0.4;
        const radius = 0.2 + Math.random() * 0.08;
        const targetX = isOrch ? 0.5 : 0.5 + radius * Math.cos(angle);
        const targetY = isOrch ? 0.45 : 0.45 + radius * Math.sin(angle);
        nodeMap.set(node.id, {
          id: node.id, name: node.name, type: node.type,
          state: node.state, message: node.message, color: node.color,
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

    // Remove stale nodes (but never remove orchestrator)
    for (const [id] of nodeMap) {
      if (!currentIds.has(id) && id !== 'orchestrator') {
        nodeMap.delete(id);
      }
    }
  }, [networkNodes]);

  // ─── Generate stars once ──────────────────────────────────────
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

  // ─── Main canvas effect (resize, draw loop, events) ───────────
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // ── Resize handler ──
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

    // ── Mouse tracking ──
    const onMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };

    // ── Click detection (uses animated positions) ──
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
          clicked = selectedNodeId === n.id ? null : n.id;
          break;
        }
      }
      selectNode(clicked);
    };

    canvas.addEventListener('mousemove', onMouseMove);
    canvas.addEventListener('click', onClick);

    // ── Quadratic bezier point at parameter t ──
    const bezierPoint = (
      x0: number, y0: number,
      cx: number, cy: number,
      x1: number, y1: number,
      t: number,
    ): [number, number] => {
      const u = 1 - t;
      return [
        u * u * x0 + 2 * u * t * cx + t * t * x1,
        u * u * y0 + 2 * u * t * cy + t * t * y1,
      ];
    };

    // ── Spawn flow particles along connections ──
    const spawnParticles = (nodes: AnimNode[]) => {
      const particles = particlesRef.current;
      if (Math.random() < 0.12 && particles.length < MAX_PARTICLES) {
        // Pick a random node that has connections
        const candidates = nodes.filter(n => n.connections.length > 0);
        if (candidates.length === 0) return;
        const src = candidates[Math.floor(Math.random() * candidates.length)];
        const connId = src.connections[Math.floor(Math.random() * src.connections.length)];
        const dst = nodes.find(n => n.id === connId);
        if (!dst) return;

        const forward = Math.random() > 0.5;
        const from = forward ? src : dst;
        const to = forward ? dst : src;
        const rgb = hexToRgb(from.color);
        particles.push({
          fromId: from.id, toId: to.id,
          t: 0, speed: 0.004 + Math.random() * 0.008,
          color: rgb, size: 1 + Math.random() * 1.5,
        });
      }
      // Cull
      for (let i = particles.length - 1; i >= 0; i--) {
        particles[i].t += particles[i].speed;
        if (particles[i].t > 1) particles.splice(i, 1);
      }
    };

    // ── Main draw loop ──────────────────────────────────────────
    const draw = () => {
      const { w, h } = sizeRef.current;
      if (w === 0 || h === 0) { animFrameRef.current = requestAnimationFrame(draw); return; }

      timeRef.current += 0.016;
      const t = timeRef.current;
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;

      // ── Background ──
      ctx.fillStyle = '#08080a';
      ctx.fillRect(0, 0, w, h);

      // Subtle grid
      ctx.strokeStyle = 'rgba(255,255,255,0.015)';
      ctx.lineWidth = 0.5;
      const gridSize = 80;
      for (let gx = 0; gx < w; gx += gridSize) {
        ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, h); ctx.stroke();
      }
      for (let gy = 0; gy < h; gy += gridSize) {
        ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(w, gy); ctx.stroke();
      }

      // State-tinted nebula
      const stateRgb = STATE_COLORS[agentState] || STATE_COLORS.idle;
      const nebula = ctx.createRadialGradient(w * 0.5, h * 0.4, 0, w * 0.5, h * 0.4, w * 0.7);
      nebula.addColorStop(0, `rgba(${stateRgb[0]},${stateRgb[1]},${stateRgb[2]},0.04)`);
      nebula.addColorStop(0.5, `rgba(${stateRgb[0]},${stateRgb[1]},${stateRgb[2]},0.01)`);
      nebula.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = nebula;
      ctx.fillRect(0, 0, w, h);

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

      // ── Ensure orchestrator ──
      ensureOrchestrator();
      const allNodes = [...nodesMapRef.current.values()];

      // ── Update animated positions ──
      for (const n of allNodes) {
        // Spawn-in animation
        if (n.spawnProgress < 1) n.spawnProgress = Math.min(n.spawnProgress + 0.02, 1);

        // Orbit drift (non-orchestrator)
        if (n.type !== 'orchestrator') {
          n.orbitAngle += n.orbitSpeed;
          n.ax += Math.cos(n.orbitAngle) * n.orbitRadius * 0.02;
          n.ay += Math.sin(n.orbitAngle) * n.orbitRadius * 0.02;
        }

        // Lerp toward target
        n.ax += (n.tx - n.ax) * LERP_SPEED;
        n.ay += (n.ty - n.ay) * LERP_SPEED;

        // Glow lerp
        n.glow += (n.tGlow - n.glow) * 0.05;
      }

      // ── Screen positions ──
      const screen = new Map<string, { x: number; y: number; node: AnimNode }>();
      for (const n of allNodes) {
        screen.set(n.id, { x: n.ax * w, y: n.ay * h, node: n });
      }

      // ── Draw Connections (quadratic bezier) ──
      const drawnPairs = new Set<string>();
      for (const n of allNodes) {
        for (const connId of n.connections) {
          const pairKey = [n.id, connId].sort().join(':');
          if (drawnPairs.has(pairKey)) continue;
          drawnPairs.add(pairKey);

          const target = screen.get(connId);
          if (!target) continue;

          const fromRgb = hexToRgb(n.color);
          const isOrchConn = n.type === 'orchestrator' || target.node.type === 'orchestrator';
          const isActive = n.state !== 'idle' && n.state !== 'offline';
          const alpha = (isActive ? 0.2 : 0.07) + Math.sin(t * 2 + n.spawnTime * 0.001) * 0.06;

          ctx.strokeStyle = `rgba(${fromRgb[0]},${fromRgb[1]},${fromRgb[2]},${Math.max(0, alpha)})`;
          ctx.lineWidth = isOrchConn ? 1.5 : 0.8;
          ctx.beginPath();
          const sx = n.ax * w;
          const sy = n.ay * h;
          const ex = target.x;
          const ey = target.y;
          const cpx = (sx + ex) / 2;
          const cpy = (sy + ey) / 2 - 18;
          ctx.moveTo(sx, sy);
          ctx.quadraticCurveTo(cpx, cpy, ex, ey);
          ctx.stroke();
        }
      }

      // ── Spawn & draw flow particles (along bezier curves) ──
      spawnParticles(allNodes);
      const particles = particlesRef.current;
      for (const p of particles) {
        const fromScreen = screen.get(p.fromId);
        const toScreen = screen.get(p.toId);
        if (!fromScreen || !toScreen) continue;

        // Compute bezier control point (same as connection drawing)
        const cpx = (fromScreen.x + toScreen.x) / 2;
        const cpy = (fromScreen.y + toScreen.y) / 2 - 18;
        const [px, py] = bezierPoint(
          fromScreen.x, fromScreen.y,
          cpx, cpy,
          toScreen.x, toScreen.y,
          p.t,
        );

        const alpha = Math.sin(p.t * Math.PI) * 0.8;
        ctx.fillStyle = `rgba(${p.color[0]},${p.color[1]},${p.color[2]},${alpha})`;
        ctx.beginPath();
        ctx.arc(px, py, p.size, 0, Math.PI * 2);
        ctx.fill();
      }

      // ── Draw Nodes ──
      for (const n of allNodes) {
        const sx = n.ax * w;
        const sy = n.ay * h;
        const rgb = hexToRgb(n.color);

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

        // Outer glow
        const glowR = radius * (2 + effectiveGlow * 0.8);
        const outerGlow = ctx.createRadialGradient(sx, sy, radius * 0.4, sx, sy, glowR);
        outerGlow.addColorStop(0, `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${0.12 * effectiveGlow})`);
        outerGlow.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = outerGlow;
        ctx.beginPath();
        ctx.arc(sx, sy, glowR, 0, Math.PI * 2);
        ctx.fill();

        // State-based secondary glow (active nodes)
        if (n.state !== 'idle' && n.state !== 'offline') {
          const stRgb = STATE_COLORS[n.state] || STATE_COLORS.idle;
          const stateGlowR = radius * (1.8 + effectiveGlow * 0.5);
          const stateGlow = ctx.createRadialGradient(sx, sy, 0, sx, sy, stateGlowR);
          stateGlow.addColorStop(0, `rgba(${stRgb[0]},${stRgb[1]},${stRgb[2]},${0.18 * effectiveGlow})`);
          stateGlow.addColorStop(1, 'rgba(0,0,0,0)');
          ctx.fillStyle = stateGlow;
          ctx.beginPath();
          ctx.arc(sx, sy, stateGlowR, 0, Math.PI * 2);
          ctx.fill();
        }

        // Pulsing ring (active nodes)
        if (n.state !== 'idle' && n.state !== 'offline') {
          const ringPulse = (Math.sin(t * 2.5 + n.spawnTime * 0.001) + 1) / 2;
          const ringR = radius * (1.3 + ringPulse * 0.4);
          ctx.strokeStyle = `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${0.2 - ringPulse * 0.15})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(sx, sy, ringR, 0, Math.PI * 2);
          ctx.stroke();
        }

        // Selected highlight ring
        if (selectedNodeId === n.id) {
          ctx.strokeStyle = 'rgba(255,255,255,0.35)';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(sx, sy, radius + 8, 0, Math.PI * 2);
          ctx.stroke();

          // Pulsing outer ring for selected
          const selPulse = (Math.sin(t * 3) + 1) / 2;
          ctx.strokeStyle = `rgba(255,255,255,${0.1 + selPulse * 0.1})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(sx, sy, radius + 14 + selPulse * 4, 0, Math.PI * 2);
          ctx.stroke();
        }

        // Core circle gradient
        const coreGrad = ctx.createRadialGradient(
          sx - radius * 0.15, sy - radius * 0.15, 0,
          sx, sy, radius,
        );
        coreGrad.addColorStop(0, `rgba(${Math.min(255, rgb[0] + 80)},${Math.min(255, rgb[1] + 80)},${Math.min(255, rgb[2] + 80)},0.95)`);
        coreGrad.addColorStop(0.7, `rgba(${rgb[0]},${rgb[1]},${rgb[2]},0.85)`);
        coreGrad.addColorStop(1, `rgba(${Math.floor(rgb[0] * 0.6)},${Math.floor(rgb[1] * 0.6)},${Math.floor(rgb[2] * 0.6)},0.8)`);
        ctx.fillStyle = coreGrad;
        ctx.beginPath();
        ctx.arc(sx, sy, radius, 0, Math.PI * 2);
        ctx.fill();

        // Inner bright spot
        const brightAlpha = 0.15 + effectiveGlow * 0.1;
        ctx.fillStyle = `rgba(255,255,255,${brightAlpha})`;
        ctx.beginPath();
        ctx.arc(sx - radius * 0.15, sy - radius * 0.15, radius * 0.3, 0, Math.PI * 2);
        ctx.fill();

        // Label
        const label = NODE_TYPE_LABELS[n.type] || n.name.toUpperCase();
        ctx.fillStyle = 'rgba(255,255,255,0.85)';
        ctx.font = `${n.type === 'orchestrator' ? 'bold 10px' : '8px'} monospace`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(label, sx, sy);

        // Task message below (non-orchestrator)
        if (n.type !== 'orchestrator' && n.message) {
          ctx.fillStyle = `rgba(${rgb[0]},${rgb[1]},${rgb[2]},0.55)`;
          ctx.font = '7px monospace';
          const msg = n.message.length > 28 ? n.message.slice(0, 28) + '...' : n.message;
          ctx.fillText(msg, sx, sy + radius + 12);
        }
      }

      // ── Wave Progress Ring (around orchestrator) ──
      if (waveNumber > 0 && progress > 0) {
        const orch = nodesMapRef.current.get('orchestrator');
        if (orch) {
          const sx = orch.ax * w;
          const sy = orch.ay * h;
          const ringRadius = 44 * orch.size;
          const startAngle = -Math.PI / 2;
          const endAngle = startAngle + Math.PI * 2 * progress;
          const progRgb = STATE_COLORS[agentState] || STATE_COLORS.idle;
          ctx.strokeStyle = `rgba(${progRgb[0]},${progRgb[1]},${progRgb[2]},0.5)`;
          ctx.lineWidth = 2;
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.arc(sx, sy, ringRadius, startAngle, endAngle);
          ctx.stroke();
          ctx.lineCap = 'butt';
        }
      }

      // ── CRT scanlines (very subtle) ──
      ctx.fillStyle = 'rgba(0,0,0,0.025)';
      for (let y = 0; y < h; y += 3) {
        ctx.fillRect(0, y, w, 1);
      }

      // ── Vignette ──
      const vigR = Math.max(w, h) * 0.8;
      const vignette = ctx.createRadialGradient(w / 2, h / 2, w * 0.2, w / 2, h / 2, vigR);
      vignette.addColorStop(0, 'rgba(0,0,0,0)');
      vignette.addColorStop(1, 'rgba(0,0,0,0.5)');
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
  }, [agentState, selectedNodeId, selectNode, ensureOrchestrator, hexToRgb, waveNumber, progress]);

  return (
    <div ref={containerRef} className="absolute inset-0">
      <canvas ref={canvasRef} className="w-full h-full" />
    </div>
  );
}