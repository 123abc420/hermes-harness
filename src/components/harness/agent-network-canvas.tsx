'use client';

import React, { useRef, useEffect, useCallback } from 'react';
import { useAgentLiveStore, type NetworkNode, type AgentVisualState } from '@/store/agent-live-store';

/* ═════════════════════════════════════════════════════════════════════
   AGENT NETWORK CANVAS — Lightweight "Red de Nodos" Edition (W234)

   Multi-agent node world:
   - Glowing nodes with state-reactive colors and sizes
   - Curved connections between connected nodes with pulse effect
   - Nodes drift/float with organic motion
   - Click-to-select node popup with task details
   - Subtle grid background
   - State-tinted nebula atmosphere
   - Wave progress ring around orchestrator
   CRT scanline overlay + vignette

   Zero heavy effects — pure Canvas 2D + requestAnimationFrame.
   ══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════ */

const STATE_COLORS: Record<string, [number, number, number]> = {
  idle: [245, 158, 11], thinking: [6, 182, 212], searching: [249, 115, 22],
  planning: [168, 85, 247], executing: [244, 63, 94],
  verifying: [34, 197, 94], celebrating: [234, 179, 8],
  error: [220, 38, 38], evolving: [217, 70, 239], offline: [113, 113, 122],
};

function rgba(r: number, g: number, b: number, a: number): string {
  return `rgba(${r},${g},${b},${a})`;
}

// Pre-computed state colors as RGBA tuples
const STATE_RGBA: Record<string, [number, number, number]> = {
  idle: [245, 158, 11], thinking: [6, 182, 212], searching: [249, 115, 22],
  planning: [168, 85, 247], executing: [244, 63, 94], verifying: [34, 197, 94],
  celebrating: [234, 179, 8], error: [220, 38, 38], evolving: [217, 70, 239], offline: [113, 113, 122],
};

interface AnimNode {
  id: string;
  name: string;
  type: string;
  state: string;
  color: string;
  connections: string[];
  spawnTime: number;
  tx: number; ty: number;
  size: number; glow: number;
  // Animated position
  ax: number; ay: number;
  orbitAngle: number; orbitSpeed: number;
  spawnProgress: number;
}

// ──── Animations ───────────────────────────────────────────────────────
const LERP_SPEED = 0.04;
const DRIFT_STRENGTH = 0.006;
const MAX_PARTICLES = 8;

interface Particle {
  id: string;
  cx: number; cy: number;
  vx: number; vy: number;
  life: number;
  alpha: number;
  decay: number;
  speed: number;
  size: number;
  color: string;
}

export function AgentNetworkCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasState = useRef({ w: 0, h: 0, dpr: 1 });
  const animRef = useRef<number>(0);
  const particlesRef = useRef<Particle[]>([]);
  const nodesRef = useRef<Map<string, AnimNode>>(new Map());
  const mouseRef = useRef({ x: 0.5, y: 0.5 });

  const agentState = useAgentLiveStore(s => s.agentState);
  const networkNodes = useAgentLiveStore(s => s.networkNodes);
  const selectedNodeId = useAgentLiveStore(s => s.selectedNodeId);
  const selectNode = useAgentLiveStore(s => s.selectNode);
  const waveNumber = useAgentLiveStore(s => s.waveNumber);
  const progress = useAgentLiveStore(s => s.progress);

  // Ensure orchestrator always exists
  const getOrchestratorNode = useCallback((): AnimNode => ({
    id: 'orchestrator', type: 'orchestrator', name: 'HERMES',
    state: agentState, message: '', color: '#f59e0b', connections: [],
    spawnTime: Date.now(), x: 0.5, y: 0.45, size: 1, glow: 0.5,
  })), [agentState]);

  // Hex → RGB conversion
  const hexToRgb = useCallback((hex: string): [number, number, number] => {
    const h = hex.replace('#', '');
    return [parseInt(h.substring(0, 2), 16), parseInt(h.substring(2, 4), 16), parseInt(h.substring(4, 6), 16)];
  }, []);

  // ─── Sync server nodes → animated nodes ───────────────────────
  useEffect(() => {
    const nodeMap = nodesRef.current;
    const currentIds = new Set<string>();
    const nodeKey = networkNodes.map(n => `${n.id}:${n.state}:${n.size}:${n.glow}`).join('|');
    if (nodeKey === prevNodesRef.current) return;
    prevNodesRef.current = nodeKey;

    for (const node of networkNodes) {
      currentIds.add(node.id);
      const existing = nodeMap.get(node.id);
      if (existing) {
        existing.tx = node.x;
        existing.ty = node.y;
        existing.tSize = node.size;
        existing.tGlow = node.glowIntensity;
        existing.state = node.state;
        existing.message = node.message;
        existing.color = node.color;
        existing.connections = node.connections;
      } else {
        const isOrch = node.type === 'orchestrator';
        const nonOrchCount = [...nodeMap.values()].filter(n => n.type !== 'orchestrator').length;
        const total = Math.max(nonOrchCount, 1);
        const angle = (2 * Math.PI) / total;
        const radius = 0.22 + (isOrch ? 0 : 0.12 * Math.sin(angle));
        nodeMap.set(node.id, {
          id: node.id, name: node.name, type: node.type,
          state: node.state, message: node.message, color: node.color,
          connections: node.connections, spawnTime: node.spawnTime,
          tx: isOrch ? 0.5 : 0.5 + radius * Math.cos(angle),
          ty: isOrch ? 0.45 : 0.45 + radius * Math.sin(angle),
          tSize: node.size, tGlow: node.glowIntensity,
          ax: 0.5, ay: 0.5,  // animated position
          orbitAngle: Math.random() * Math.PI * 2,
          orbitSpeed: 0.0004 + Math.random() * 0.0006,
          orbitRadius: 0.01 + Math.random() * 0.03,
          spawnProgress: 0,
        });
      }
    }
    // Remove stale nodes
    for (const [id] of nodeMap.keys()) {
      if (!currentIds.has(id)) nodeMap.delete(id);
    }
  }, [networkNodes]);

  // ─── Canvas setup ───────────────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const ro = new ResizeObserver(() => {
      const rect = container.getBoundingClientRect();
      canvas.width = rect.width * (window.devicePixelRatio || 1);
      canvas.height = rect.height * (window.devicePixelRatio || 1);
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      canvasState.current = { w: rect.width, h: rect.height, dpr: window.devicePixelRatio || 1 };
      ctx.setTransform(canvasState.current.dpr, 0, 0, canvasState.current.dpr, 0, 0);
    });
    ro.observe(container);

    // ─── Main draw loop ───────────────────────────────────────────────
    useEffect(() => {
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const { w, h, dpr } = canvasState.current;
      if (w === 0 || h === 0) {
        animRef.current = requestAnimationFrame(draw);
        return;
      }

      const t = (performance.now() - animRef.current * 16) / 1000;
      animRef.current = performance.now();

      // ── Background ──
      ctx.fillStyle = '#08080a';
      ctx.fillRect(0, 0, w, h);

      // Subtle grid
      ctx.strokeStyle = 'rgba(255,255,255,0.018)';
      ctx.lineWidth = 0.5;
      const gridSize = 80;
      for (let gx = 0; gx < w; gx += gridSize) {
        ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, h); ctx.stroke();
      }
      for (let gy = 0; gy < h; gy += gridSize) {
        ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(w, gy); ctx.stroke();
      }

      // State-tinted nebula atmosphere
      const stRgb = STATE_RGBA[agentState] || STATE_RGBA.idle;
      const nebGrad = ctx.createRadialGradient(w * 0.5, h * 0.4, 0, w * 0.4, h * 0.4);
      nebGrad.addColorStop(0, `rgba(${stRgb[0]}, ${stRgb[1]}, ${stRgb[2]}, 0.04)`);
      nebGrad.addColorStop(0.5, `rgba(${stRgb[0]}, ${stRgb[1]}, ${stRgb[2]}, 0.01)`);
      nebGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = nebGrad;
      ctx.fillRect(0, 0, w, h);

      // ── Animated node state for interpolation
      const dt = Math.min(t, 0.05);
      for (const [id, node] of nodesRef.current) {
        const n = node;
        // Spawn animation
        if (n.spawnProgress < 1) {
          n.spawnProgress = Math.min(n.spawnProgress + dt * 2, 1);
        }
        // Orbit drift
        if (n.type !== 'orchestrator') {
          n.orbitAngle += n.orbitSpeed * dt;
          n.ax += (Math.cos(n.orbitAngle) * n.orbitRadius) * dt;
          n.ay += (Math.sin(n.orbitAngle) * n.orbitRadius) * dt;
        }
        // Lerp toward target
        const lerpK = LERP_SPEED;
        n.ax += (n.tx - n.ax) * lerpK;
        n.ay += (n.ty - n.ay) * lerpK;
        // Glow decay
        n.glow += (n.tGlow - n.glow) * dt * 0.5;
      }

      // ── Draw Connections (curved glowing lines) ──
      for (const [id1, connId] of Object.entries(Object.fromEntries(nodesRef.current))) {
        const node = nodesRef.current.get(id1) || nodesRef.current.get(connId);
        const other = nodesRef.current.get(connId);
        if (!node || !other) continue;
        if (id1 > connId) continue; // draw once per pair

        const [r1, g1, b1] = hexToRgb(node.color);
        const isActive = node.state !== 'idle' && node.state !== 'offline';
        const alpha = (isActive ? 0.18 : 0.06) + Math.sin(t * 2 + node.spawnTime * 0.001) * 0.06;
        ctx.strokeStyle = `rgba(${r1},${g1},${b1},${Math.max(0, alpha)})`;
        ctx.lineWidth = (id1 === 'orchestrator' || connId === 'orchestrator') ? 1.5 : 0.8;
        ctx.beginPath();
        ctx.moveTo(node.ax * w, node.ay * h);
        const midX = (node.ax * w + other.ax * w) / 2;
        const midY = (node.ay * h + other.ay * h) / 2 - 15;
        ctx.quadraticCurveTo(midX, midY, other.ax * w, other.ay * h);
        ctx.stroke();
      }

      // ── Spawn energy particles (lightweight) ──
      const particles = particlesRef.current;
      if (Math.random() < 0.08) {
        const node = [...nodesRef.current].find(n => n.type === 'orchestrator') || [...nodesRef.current][0];
        if (!node) continue;
        if (node.connections.length === 0) continue;
        const target = nodesRef.current.get(node.connections[Math.floor(Math.random() * node.connections.length)]) || node.connections[0]);
        if (!target) continue;
        const from = Math.random() > 0.5 ? node : target;
        const to = Math.random() > 0.5 ? node : target;
        const rgb = hexToRgb(from.color);
        if (particles.length < MAX_PARTICLES) {
          particles.push({
            fromX: from.ax, fromY: from.ay,
            toX: to.ax, toY: to.ay, t: 0,
            speed: 0.004 + Math.random() * 0.008,
            color: rgb, size: 1 + Math.random() * 1.5,
          });
        }
      }
      // Update & cull particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.t += p.speed;
        if (p.t > 1) particles.splice(i, 1);
      }
      if (particles.length > MAX_PARTICLES) {
        particles.splice(0, particles.length - MAX_PARTICLES);
      }

      // ── Draw Nodes ──
      for (const [id, n] of Object.entries(nodesRef.current)) {
        const rgb = hexToRgb(n.color);
        const stRgb = STATE_RGBA[n.state] || STATE_RGBA.idle;
        const baseRadius = (n.type === 'orchestrator' ? 36 : 22) * n.size * (1 + Math.sin(t * 1.2 + n.spawnTime * 0.001) * 0.03);
        const radius = Math.max(8, baseRadius);
        const glow = n.glow;

        // Outer glow
        const glowR = radius * (2 + glow * 0.8);
        if (glowR > 4) {
          const outerGlow = ctx.createRadialGradient(n.ax, n.ay, radius * 0.4, n.ay, n.ay, glowR);
          outerGlow.addColorStop(0, `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${0.12 * glow})`);
          outerGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
          ctx.fillStyle = outerGlow;
          ctx.beginPath();
          ctx.arc(n.ax, n.ay, glowR, 0, Math.PI * 2);
          ctx.fill();
        }

        // State ring pulse (active nodes)
        if (n.state !== 'idle' && n.state !== 'offline') {
          const ringPulse = (Math.sin(t * 2 + n.spawnTime * 0.001) + 1) / 2;
          const ringR = radius * (1.2 + ringPulse * 0.4);
          ctx.strokeStyle = `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${0.2 - ringPulse * 0.15})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(n.ax, n.ay, ringR, 0, Math.PI * 2);
          ctx.stroke();
        }

        // Core gradient
        const coreGrad = ctx.createRadialGradient(
          n.ax - radius * 0.15, n.ay - radius * 0.15, 0,
          n.ax, n.ay, radius,
        );
        const bright = Math.min(1, glow * 0.7);
        coreGrad.addColorStop(0, `rgba(${bright * 255}, ${bright * 255}, 0.9)`);
        coreGrad.addColorStop(0.6, `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, 0.7)`);
        coreGrad.addColorStop(1, `rgba(${Math.floor(rgb[0] * 0.5)}, ${Math.floor(rgb[1] * 0.5)}, ${Math.floor(rgb[2] * 0.6)}, 0.7)`);
        ctx.fillStyle = coreGrad;
        ctx.beginPath();
        ctx.arc(n.ax, n.ay, radius, 0, Math.PI * 2);
        ctx.fill();

        // Inner bright spot
        if (bright > 0.05) {
          ctx.fillStyle = `rgba(255, 255, 255, ${bright * 0.15})`;
          ctx.beginPath();
          ctx.arc(n.ax - radius * 0.1, n.ay - radius * 0.1, radius * 0.3, 0, Math.PI * 2);
          ctx.fill();
        }

        // Label
        ctx.fillStyle = `rgba(255, 255, 255, 0.8)`;
        ctx.font = `${n.type === 'orchestrator' ? 'bold 11px' : '9px'} monospace`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(n.name, n.ax, n.ay);

        // State indicator below (non-orchestrator only)
        if (n.type !== 'orchestrator' && n.message) {
          ctx.fillStyle = `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, 0.5)`;
          ctx.font = '7px monospace';
          const msg = n.message.length > 25 ? n.message.slice(0, 25) + '...' : n.message;
          ctx.fillText(msg, n.ax, n.ay + radius + 12);
        }
      }

      // ── Wave Progress Ring (around orchestrator) ──
      if (waveNumber > 0 && progress > 0) {
        const orch = [...nodesRef.current].find(n => n.type === 'orchestrator') || nodesRef.current.get('orchestrator'));
        if (orch) {
          const ringRadius = 40 * orch.size;
          const startAngle = -Math.PI / 2;
          const endAngle = startAngle + Math.PI * 2 * progress;
          const progRgb = STATE_RGBA[agentState] || STATE_RGBA.idle;
          ctx.strokeStyle = `rgba(${progRgb[0]}, ${progRgb[1]}, ${progRgb[2]}, 0.45)`;
          ctx.lineWidth = 2;
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.arc(orch.ax, orch.ay, ringRadius, startAngle, endAngle);
          ctx.stroke();
          ctx.lineCap = 'butt';
        }
      }

      // ── Vignette ──
      const vigR = Math.max(w, h) * 0.75;
      const vignette = ctx.createRadialGradient(w / 2, h / 2, w * 0.25, h / 2, vigR);
      vignette.addColorStop(0, 'rgba(0,0,0,0,0)');
      vignette.addColorStop(1, 'rgba(0,0,0,0,0.5)');
      ctx.fillStyle = vignette;
      ctx.fillRect(0, 0, w, h);

      animRef.current = requestAnimationFrame(draw);
    };

    return () => {
      ro.disconnect();
      cancelAnimationFrame(animRef.current);
      canvas.removeEventListener('mousemove', onMouseMove);
      canvas.removeEventListener('click', onClick);
    };
  }, [agentState, selectedNodeId, selectNode, getOrchestratorNode, hexToRgb, waveNumber, progress, healthScore]);
}