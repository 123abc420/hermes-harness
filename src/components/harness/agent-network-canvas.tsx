'use client';

import React, { useRef, useEffect, useCallback } from 'react';
import { useAgentLiveStore, type NetworkNode, type AgentVisualState } from '@/store/agent-live-store';

/* ═══════════════════════════════════════════════════════════════════════
   AGENT NETWORK CANVAS v2.0 — Multi-Agent "Living Network"

   A node graph where each agent is a glowing orb connected by
   energy lines. Nodes pulse, drift, and resize based on state.
   Connections show flowing energy particles.
   Background: subtle starfield + nebula gradients.
   ═══════════════════════════════════════════════════════════════════════ */

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

const NODE_TYPE_COLORS: Record<string, string> = {
  orchestrator: '#f59e0b',
  assessor: '#06b6d4',
  planner: '#a855f7',
  executor: '#f43f5e',
  verifier: '#22c55e',
  'git-agent': '#38bdf8',
  custom: '#8b5cf6',
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

interface Star {
  x: number;
  y: number;
  size: number;
  brightness: number;
  twinkleSpeed: number;
  twinkleOffset: number;
}

interface EnergyParticle {
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  t: number;
  speed: number;
  color: [number, number, number];
  size: number;
}

export function AgentNetworkCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const nodesRef = useRef<NetworkNode[]>([]);
  const animFrameRef = useRef<number>(0);
  const starsRef = useRef<Star[]>([]);
  const particlesRef = useRef<EnergyParticle[]>([]);
  const mouseRef = useRef({ x: -1000, y: -1000 });
  const clickCallbackRef = useRef<((nodeId: string | null) => void) | null>(null);
  const timeRef = useRef(0);

  const agentState = useAgentLiveStore(s => s.agentState);
  const networkNodes = useAgentLiveStore(s => s.networkNodes);
  const selectedNodeId = useAgentLiveStore(s => s.selectedNodeId);
  const selectNode = useAgentLiveStore(s => s.selectNode);
  const waveNumber = useAgentLiveStore(s => s.waveNumber);
  const progress = useAgentLiveStore(s => s.progress);
  const healthScore = useAgentLiveStore(s => s.healthScore);

  // Generate stars once
  useEffect(() => {
    const stars: Star[] = [];
    for (let i = 0; i < 200; i++) {
      stars.push({
        x: Math.random(),
        y: Math.random(),
        size: Math.random() * 1.5 + 0.3,
        brightness: Math.random() * 0.5 + 0.1,
        twinkleSpeed: Math.random() * 2 + 1,
        twinkleOffset: Math.random() * Math.PI * 2,
      });
    }
    starsRef.current = stars;
  }, []);

  // Sync nodes ref with store
  useEffect(() => {
    nodesRef.current = networkNodes;
  }, [networkNodes]);

  // Ensure orchestrator always exists in the canvas
  const getOrchestratorNode = useCallback((): NetworkNode => {
    const existing = nodesRef.current.find(n => n.type === 'orchestrator');
    if (existing) return existing;
    return {
      id: 'orchestrator',
      type: 'orchestrator',
      name: 'HERMES',
      state: agentState,
      message: '',
      color: '#f59e0b',
      connections: [],
      spawnTime: Date.now(),
      x: 0.5,
      y: 0.45,
      size: 1.0,
      glowIntensity: 0.5,
    };
  }, [agentState]);

  // Parse hex color to RGB
  const hexToRgb = useCallback((hex: string): [number, number, number] => {
    const h = hex.replace('#', '');
    return [
      parseInt(h.substring(0, 2), 16),
      parseInt(h.substring(2, 4), 16),
      parseInt(h.substring(4, 6), 16),
    ];
  }, []);

  // Spawn energy particles along connections
  const spawnParticles = useCallback((nodes: NetworkNode[], time: number) => {
    const particles = particlesRef.current;
    // Spawn new particles periodically
    if (Math.random() < 0.15) {
      for (const node of nodes) {
        for (const connId of node.connections) {
          const target = nodes.find(n => n.id === connId);
          if (!target) continue;
          // Random direction
          const forward = Math.random() > 0.5;
          const from = forward ? node : target;
          const to = forward ? target : node;
          const rgb = hexToRgb(from.color);
          particles.push({
            fromX: from.x, fromY: from.y,
            toX: to.x, toY: to.y,
            t: 0,
            speed: 0.005 + Math.random() * 0.01,
            color: rgb,
            size: 1 + Math.random() * 2,
          });
        }
      }
    }
    // Update particles
    for (let i = particles.length - 1; i >= 0; i--) {
      particles[i].t += particles[i].speed;
      if (particles[i].t > 1) {
        particles.splice(i, 1);
      }
    }
    // Cap particles
    if (particles.length > 60) {
      particles.splice(0, particles.length - 60);
    }
  }, [hexToRgb]);

  // Main render loop
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;

    const resize = () => {
      const rect = container.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    const ro = new ResizeObserver(resize);
    ro.observe(container);

    const draw = () => {
      const w = canvas.width / dpr;
      const h = canvas.height / dpr;
      if (w === 0 || h === 0) { animFrameRef.current = requestAnimationFrame(draw); return; }

      timeRef.current += 0.016;
      const t = timeRef.current;

      // ── Background ──
      // Dark base with subtle nebula
      ctx.fillStyle = '#0a0806';
      ctx.fillRect(0, 0, w, h);

      // Nebula gradient
      const stateRgb = STATE_COLORS[agentState] || STATE_COLORS.idle;
      const nebula = ctx.createRadialGradient(w * 0.5, h * 0.4, 0, w * 0.5, h * 0.4, w * 0.7);
      nebula.addColorStop(0, `rgba(${stateRgb[0]}, ${stateRgb[1]}, ${stateRgb[2]}, 0.03)`);
      nebula.addColorStop(0.5, `rgba(${stateRgb[0]}, ${stateRgb[1]}, ${stateRgb[2]}, 0.01)`);
      nebula.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = nebula;
      ctx.fillRect(0, 0, w, h);

      // ── Stars ──
      const stars = starsRef.current;
      for (const star of stars) {
        const twinkle = Math.sin(t * star.twinkleSpeed + star.twinkleOffset) * 0.5 + 0.5;
        const alpha = star.brightness * twinkle;
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
        ctx.beginPath();
        ctx.arc(star.x * w, star.y * h, star.size, 0, Math.PI * 2);
        ctx.fill();
      }

      // ── Get all nodes to draw ──
      const allNodes = [...nodesRef.current];
      // Ensure at least orchestrator
      if (!allNodes.find(n => n.type === 'orchestrator')) {
        allNodes.push(getOrchestratorNode());
      }

      // Calculate screen positions with organic drift
      const screenNodes = allNodes.map((node, i) => {
        const isOrch = node.type === 'orchestrator';
        const baseX = isOrch ? 0.5 : node.x;
        const baseY = isOrch ? 0.45 : node.y;
        // Organic drift
        const driftX = Math.sin(t * 0.3 + i * 2.1) * 0.008 + Math.cos(t * 0.2 + i * 1.3) * 0.005;
        const driftY = Math.cos(t * 0.25 + i * 1.7) * 0.006 + Math.sin(t * 0.15 + i * 2.5) * 0.004;
        return {
          ...node,
          sx: (baseX + driftX) * w,
          sy: (baseY + driftY) * h,
        };
      });

      // ── Draw Connections (lines between nodes) ──
      for (const node of screenNodes) {
        for (const connId of node.connections) {
          const target = screenNodes.find(n => n.id === connId);
          if (!target) continue;
          const fromRgb = hexToRgb(node.color);
          const isOrchConn = node.type === 'orchestrator' || target.type === 'orchestrator';
          const baseAlpha = isOrchConn ? 0.25 : 0.12;
          const pulse = Math.sin(t * 2 + node.spawnTime * 0.001) * 0.08;
          const alpha = baseAlpha + pulse + (node.state === 'executing' ? 0.15 : 0);

          // Main line
          ctx.strokeStyle = `rgba(${fromRgb[0]}, ${fromRgb[1]}, ${fromRgb[2]}, ${Math.max(0, alpha)})`;
          ctx.lineWidth = isOrchConn ? 1.5 : 0.8;
          ctx.beginPath();
          // Curved line
          const midX = (node.sx + target.sx) / 2;
          const midY = (node.sy + target.sy) / 2 - 20;
          ctx.moveTo(node.sx, node.sy);
          ctx.quadraticCurveTo(midX, midY, target.sx, target.sy);
          ctx.stroke();
        }
      }

      // ── Spawn & Draw Energy Particles ──
      spawnParticles(allNodes, t);
      const particles = particlesRef.current;
      for (const p of particles) {
        const fromNode = screenNodes.find(n => n.id === (allNodes.find(an =>
          (an.x === p.fromX && an.y === p.fromY) || (an.x === p.toX && an.y === p.toY)
        )?.id));
        // Interpolate position
        const cx = (p.fromX * w + (p.toX * w - p.fromX * w) * p.t);
        const cy = (p.fromY * h + (p.toY * h - p.fromY * h) * p.t);
        const alpha = Math.sin(p.t * Math.PI) * 0.8;
        ctx.fillStyle = `rgba(${p.color[0]}, ${p.color[1]}, ${p.color[2]}, ${alpha})`;
        ctx.beginPath();
        ctx.arc(cx, cy, p.size, 0, Math.PI * 2);
        ctx.fill();
      }

      // ── Draw Nodes ──
      for (const node of screenNodes) {
        const rgb = hexToRgb(node.color);
        const stateRgb = STATE_COLORS[node.state] || STATE_COLORS.idle;
        const baseRadius = node.type === 'orchestrator' ? 32 : 22;
        const radius = baseRadius * node.size * (1 + Math.sin(t * 1.5 + node.spawnTime * 0.001) * 0.05);
        const glow = node.glowIntensity;

        // Outer glow
        const glowRadius = radius * (2.5 + glow);
        const outerGlow = ctx.createRadialGradient(node.sx, node.sy, radius * 0.5, node.sx, node.sy, glowRadius);
        outerGlow.addColorStop(0, `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${0.15 * glow})`);
        outerGlow.addColorStop(0.5, `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${0.05 * glow})`);
        outerGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = outerGlow;
        ctx.beginPath();
        ctx.arc(node.sx, node.sy, glowRadius, 0, Math.PI * 2);
        ctx.fill();

        // State-based secondary glow
        if (node.state !== 'idle' && node.state !== 'offline') {
          const stateGlowRadius = radius * (1.8 + glow * 0.5);
          const stateGlow = ctx.createRadialGradient(node.sx, node.sy, 0, node.sx, node.sy, stateGlowRadius);
          stateGlow.addColorStop(0, `rgba(${stateRgb[0]}, ${stateRgb[1]}, ${stateRgb[2]}, ${0.2 * glow})`);
          stateGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
          ctx.fillStyle = stateGlow;
          ctx.beginPath();
          ctx.arc(node.sx, node.sy, stateGlowRadius, 0, Math.PI * 2);
          ctx.fill();
        }

        // Pulsing ring (for active nodes)
        if (node.state !== 'idle' && node.state !== 'offline') {
          const ringPulse = (Math.sin(t * 3 + node.spawnTime * 0.001) + 1) / 2;
          const ringRadius = radius * (1.3 + ringPulse * 0.5);
          ctx.strokeStyle = `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${0.2 - ringPulse * 0.15})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(node.sx, node.sy, ringRadius, 0, Math.PI * 2);
          ctx.stroke();
        }

        // Selected highlight ring
        if (selectedNodeId === node.id) {
          ctx.strokeStyle = `rgba(255, 255, 255, 0.3)`;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(node.sx, node.sy, radius + 6, 0, Math.PI * 2);
          ctx.stroke();
        }

        // Core circle
        const coreGrad = ctx.createRadialGradient(
          node.sx - radius * 0.2, node.sy - radius * 0.2, 0,
          node.sx, node.sy, radius
        );
        coreGrad.addColorStop(0, `rgba(${Math.min(255, rgb[0] + 80)}, ${Math.min(255, rgb[1] + 80)}, ${Math.min(255, rgb[2] + 80)}, 0.95)`);
        coreGrad.addColorStop(0.7, `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, 0.85)`);
        coreGrad.addColorStop(1, `rgba(${Math.floor(rgb[0] * 0.6)}, ${Math.floor(rgb[1] * 0.6)}, ${Math.floor(rgb[2] * 0.6)}, 0.8)`);
        ctx.fillStyle = coreGrad;
        ctx.beginPath();
        ctx.arc(node.sx, node.sy, radius, 0, Math.PI * 2);
        ctx.fill();

        // Inner bright spot
        ctx.fillStyle = `rgba(255, 255, 255, ${0.15 + glow * 0.1})`;
        ctx.beginPath();
        ctx.arc(node.sx - radius * 0.15, node.sy - radius * 0.15, radius * 0.35, 0, Math.PI * 2);
        ctx.fill();

        // Label
        const label = NODE_TYPE_LABELS[node.type] || node.name.toUpperCase();
        ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
        ctx.font = `${node.type === 'orchestrator' ? 'bold 10px' : '8px'} monospace`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(label, node.sx, node.sy);

        // Type indicator below
        if (node.type !== 'orchestrator' && node.message) {
          ctx.fillStyle = `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, 0.6)`;
          ctx.font = '7px monospace';
          const msg = node.message.length > 25 ? node.message.slice(0, 25) + '...' : node.message;
          ctx.fillText(msg, node.sx, node.sy + radius + 12);
        }
      }

      // ── Wave Progress Ring (around orchestrator) ──
      if (waveNumber > 0 && progress > 0) {
        const orch = screenNodes.find(n => n.type === 'orchestrator');
        if (orch) {
          const ringRadius = 44 * orch.size;
          const startAngle = -Math.PI / 2;
          const endAngle = startAngle + Math.PI * 2 * progress;
          const progRgb = STATE_COLORS[agentState] || STATE_COLORS.idle;
          ctx.strokeStyle = `rgba(${progRgb[0]}, ${progRgb[1]}, ${progRgb[2]}, 0.5)`;
          ctx.lineWidth = 2;
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.arc(orch.sx, orch.sy, ringRadius, startAngle, endAngle);
          ctx.stroke();
          ctx.lineCap = 'butt';
        }
      }

      // ── CRT scanlines (very subtle) ──
      ctx.fillStyle = 'rgba(0, 0, 0, 0.03)';
      for (let y = 0; y < h; y += 3) {
        ctx.fillRect(0, y, w, 1);
      }

      // ── Vignette ──
      const vignette = ctx.createRadialGradient(w / 2, h / 2, w * 0.25, w / 2, h / 2, w * 0.75);
      vignette.addColorStop(0, 'rgba(0, 0, 0, 0)');
      vignette.addColorStop(1, 'rgba(0, 0, 0, 0.5)');
      ctx.fillStyle = vignette;
      ctx.fillRect(0, 0, w, h);

      animFrameRef.current = requestAnimationFrame(draw);
    };

    animFrameRef.current = requestAnimationFrame(draw);

    // ── Mouse tracking ──
    const onMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };

    const onClick = () => {
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;
      let clicked: string | null = null;
      const allNodes = [...nodesRef.current];
      if (!allNodes.find(n => n.type === 'orchestrator')) {
        allNodes.push(getOrchestratorNode());
      }
      for (const node of allNodes) {
        const isOrch = node.type === 'orchestrator';
        const nx = (isOrch ? 0.5 : node.x) * w;
        const ny = (isOrch ? 0.45 : node.y) * h;
        const baseR = (isOrch ? 32 : 22) * node.size;
        const dist = Math.sqrt((mx - nx) ** 2 + (my - ny) ** 2);
        if (dist < baseR + 10) {
          clicked = selectedNodeId === node.id ? null : node.id;
          break;
        }
      }
      selectNode(clicked);
    };

    canvas.addEventListener('mousemove', onMouseMove);
    canvas.addEventListener('click', onClick);

    return () => {
      ro.disconnect();
      cancelAnimationFrame(animFrameRef.current);
      canvas.removeEventListener('mousemove', onMouseMove);
      canvas.removeEventListener('click', onClick);
    };
  }, [agentState, selectedNodeId, selectNode, getOrchestratorNode, spawnParticles, hexToRgb, waveNumber, progress, healthScore]);

  return (
    <div ref={containerRef} className="absolute inset-0">
      <canvas ref={canvasRef} className="w-full h-full" />
    </div>
  );
}