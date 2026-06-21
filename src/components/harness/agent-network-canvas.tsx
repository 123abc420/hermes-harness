'use client';

import { useRef, useEffect, useCallback } from 'react';
import { useAgentLiveStore, type NetworkNode } from '@/store/agent-live-store';
import { STATE_RGB } from '@/lib/constants';

/* ═════════════════════════════════════════════════════════════════════
   AGENT NETWORK CANVAS v4.0 — "Neural Mesh" Red de Nodos

   Complete rewrite: from character-based to pure animated node network.
   Every node is a living entity in a shared world.
   
   Features:
   - Organic node movement with drift and orbital motion
   - Animated connections with flowing energy particles
   - Nodes glow, breathe, pulse based on state
   - Size changes dynamically with activity
   - Mouse interaction: hover glow + gentle attraction
   - Mesh network: all nearby nodes connect, not just to orchestrator
   - Deep space atmosphere with nebula and particles
   - Spawn/destroy animations
   ═════════════════════════════════════════════════════════════════════ */

// ─── Internal animated node ────────────────────────────────────
interface AnimNode {
  id: string;
  type: string;
  name: string;
  state: string;
  message: string;
  color: string;
  connections: string[];
  spawnTime: number;
  
  // Animation state (normalized 0-1)
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  vx: number;
  vy: number;
  size: number;
  targetSize: number;
  glowIntensity: number;
  targetGlow: number;
  opacity: number;
  
  // Per-node animation phase (for breathing/pulsing)
  phase: number;
  orbitAngle: number;
  orbitRadius: number;
  orbitSpeed: number;
  
  // Spawn animation
  spawnProgress: number;
}

// Energy particle flowing along a connection
interface EnergyParticle {
  fromId: string;
  toId: string;
  t: number; // 0-1 position along the line
  speed: number;
  size: number;
  alpha: number;
}

// Pulse ring emanating from a node
interface PulseRing {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  alpha: number;
  color: [number, number, number];
}

// Background star
interface Star {
  x: number;
  y: number;
  size: number;
  brightness: number;
  twinkleSpeed: number;
  twinklePhase: number;
}

// ─── Constants ─────────────────────────────────────────────────
const LERP_SPEED = 0.035;
const SIZE_LERP = 0.06;
const GLOW_LERP = 0.05;
const NODE_REPULSE_DIST = 0.12;
const NODE_REPULSE_FORCE = 0.0008;
const MOUSE_ATTRACT_STRENGTH = 0.0003;
const MESH_CONN_DIST = 0.30;
const ORCHESTRATOR_CONN_DIST = 0.60;
const MAX_ENERGY_PARTICLES = 80;
const MAX_PULSE_RINGS = 12;
const ENERGY_SPAWN_RATE = 0.015;
const EPS = 0.001;

// State → visual properties
const STATE_SIZE_MULT: Record<string, number> = {
  idle: 1.0, thinking: 1.15, searching: 1.1, planning: 1.2,
  executing: 1.3, verifying: 1.1, celebrating: 1.4, error: 1.25,
  evolving: 1.35, offline: 0.8,
};

const STATE_GLOW_MULT: Record<string, number> = {
  idle: 0.5, thinking: 0.8, searching: 0.7, planning: 0.9,
  executing: 1.0, verifying: 0.7, celebrating: 1.2, error: 1.1,
  evolving: 1.3, offline: 0.2,
};

const STATE_BREATH_SPEED: Record<string, number> = {
  idle: 0.5, thinking: 1.5, searching: 1.2, planning: 0.8,
  executing: 2.0, verifying: 1.0, celebrating: 2.5, error: 3.0,
  evolving: 1.8, offline: 0.2,
};

function hexToRgb(hex: string): [number, number, number] {
  const m = hex.replace('#', '').match(/.{2}/g);
  if (!m) return [150, 150, 150];
  return m.map(c => parseInt(c, 16)) as [number, number, number];
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * Math.min(1, t);
}

function dist(x1: number, y1: number, x2: number, y2: number) {
  return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
}

// ─── Component ─────────────────────────────────────────────────
export function AgentNetworkCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animNodesRef = useRef(new Map<string, AnimNode>());
  const particlesRef = useRef<EnergyParticle[]>([]);
  const pulsesRef = useRef<PulseRing[]>([]);
  const starsRef = useRef<Star[]>([]);
  const mouseRef = useRef({ x: 0.5, y: 0.5, active: false });
  const rafRef = useRef<number>(0);
  const frameRef = useRef(0);
  const sizeRef = useRef({ w: 0, h: 0 });

  const networkNodes = useAgentLiveStore(s => s.networkNodes);
  const selectedNodeId = useAgentLiveStore(s => s.selectedNodeId);
  const selectNode = useAgentLiveStore(s => s.selectNode);

  // Initialize stars
  useEffect(() => {
    const stars: Star[] = [];
    for (let i = 0; i < 200; i++) {
      stars.push({
        x: Math.random(),
        y: Math.random(),
        size: Math.random() * 1.5 + 0.3,
        brightness: Math.random() * 0.4 + 0.1,
        twinkleSpeed: Math.random() * 2 + 0.5,
        twinklePhase: Math.random() * Math.PI * 2,
      });
    }
    starsRef.current = stars;
  }, []);

  // Sync store nodes to animation nodes
  const syncNodes = useCallback(() => {
    const animNodes = animNodesRef.current;
    const now = Date.now();

    for (const node of networkNodes) {
      const existing = animNodes.get(node.id);
      const rgb = hexToRgb(node.color);
      const stateRgb = STATE_RGB[node.state] || [150, 150, 150];
      const isActive = node.state !== 'idle' && node.state !== 'offline';
      const sizeMult = STATE_SIZE_MULT[node.state] || 1.0;
      const glowMult = STATE_GLOW_MULT[node.state] || 0.5;
      const baseSize = node.type === 'orchestrator' ? 1.8 : 1.0;

      if (existing) {
        // Update existing node
        existing.name = node.name;
        existing.state = node.state;
        existing.message = node.message;
        existing.color = node.color;
        existing.connections = node.connections;
        existing.targetSize = baseSize * sizeMult * (node.size || 1.0);
        existing.targetGlow = glowMult * (node.glowIntensity || 1.0);
      } else {
        // Spawn new node
        const angle = Math.random() * Math.PI * 2;
        const radius = node.type === 'orchestrator' ? 0 : (Math.random() * 0.3 + 0.15);
        const cx = node.type === 'orchestrator' ? 0.5 : 0.5 + Math.cos(angle) * radius;
        const cy = node.type === 'orchestrator' ? 0.45 : 0.45 + Math.sin(angle) * radius;

        animNodes.set(node.id, {
          id: node.id,
          type: node.type,
          name: node.name,
          state: node.state,
          message: node.message,
          color: node.color,
          connections: node.connections,
          spawnTime: node.spawnTime || now,
          x: cx, y: cy,
          targetX: node.x ?? cx, targetY: node.y ?? cy,
          vx: 0, vy: 0,
          size: 0.01,
          targetSize: baseSize * sizeMult * (node.size || 1.0),
          glowIntensity: 0,
          targetGlow: glowMult * (node.glowIntensity || 1.0),
          opacity: 0,
          phase: Math.random() * Math.PI * 2,
          orbitAngle: angle,
          orbitRadius: radius,
          orbitSpeed: (Math.random() - 0.5) * 0.003,
          spawnProgress: 0,
        });

        // Add spawn pulse
        if (pulsesRef.current.length < MAX_PULSE_RINGS) {
          pulsesRef.current.push({
            x: cx, y: cy,
            radius: 0, maxRadius: 0.12,
            alpha: 0.8,
            color: stateRgb,
          });
        }
      }
    }

    // Remove nodes that no longer exist (keep orchestrator)
    for (const [id, node] of animNodes) {
      if (!networkNodes.find(n => n.id === id) && node.type !== 'orchestrator') {
        animNodes.delete(id);
      }
    }
  }, [networkNodes]);

  // Canvas resize
  const handleResize = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    sizeRef.current = { w: rect.width, h: rect.height };
  }, []);

  // Mouse tracking
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    mouseRef.current = {
      x: (e.clientX - rect.left) / rect.width,
      y: (e.clientY - rect.top) / rect.height,
      active: true,
    };
  }, []);

  const handleClick = useCallback((e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mx = (e.clientX - rect.left) / rect.width;
    const my = (e.clientY - rect.top) / rect.height;

    let closestId: string | null = null;
    let closestDist = 0.06;

    for (const [, node] of animNodesRef.current) {
      const d = dist(node.x, node.y, mx, my);
      if (d < closestDist) {
        closestDist = d;
        closestId = node.id;
      }
    }

    selectNode(closestId === selectedNodeId ? null : closestId);
  }, [selectNode, selectedNodeId]);

  // ─── Draw loop ──────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    handleResize();
    window.addEventListener('resize', handleResize);

    const draw = () => {
      const { w, h } = sizeRef.current;
      if (w === 0 || h === 0) {
        rafRef.current = requestAnimationFrame(draw);
        return;
      }

      const dpr = window.devicePixelRatio || 1;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const time = performance.now() * 0.001;
      frameRef.current++;

      // Sync node data from store
      syncNodes();

      const nodes = Array.from(animNodesRef.current.values());
      const mouse = mouseRef.current;

      // ── 1. Background gradient ──
      const bgGrad = ctx.createRadialGradient(w * 0.5, h * 0.4, 0, w * 0.5, h * 0.4, w * 0.8);
      bgGrad.addColorStop(0, '#0a0e1a');
      bgGrad.addColorStop(0.5, '#060a14');
      bgGrad.addColorStop(1, '#020408');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      // ── 2. Nebula layers ──
      for (let i = 0; i < 3; i++) {
        const nx = w * (0.3 + i * 0.2 + Math.sin(time * 0.1 + i) * 0.05);
        const ny = h * (0.3 + i * 0.15 + Math.cos(time * 0.08 + i * 2) * 0.05);
        const nr = w * (0.25 + i * 0.05);
        const nebGrad = ctx.createRadialGradient(nx, ny, 0, nx, ny, nr);
        const hue = (time * 5 + i * 40) % 360;
        nebGrad.addColorStop(0, `hsla(${hue}, 60%, 20%, 0.04)`);
        nebGrad.addColorStop(0.5, `hsla(${hue + 20}, 50%, 15%, 0.02)`);
        nebGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = nebGrad;
        ctx.fillRect(0, 0, w, h);
      }

      // Dynamic per-node nebula glow
      for (const node of nodes) {
        if (node.glowIntensity < 0.3 || node.type === 'orchestrator') continue;
        const rgb = STATE_RGB[node.state] || [150, 150, 150];
        const nx = node.x * w;
        const ny = node.y * h;
        const nr = w * 0.15 * node.glowIntensity;
        const nGrad = ctx.createRadialGradient(nx, ny, 0, nx, ny, nr);
        nGrad.addColorStop(0, `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${0.03 * node.glowIntensity})`);
        nGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = nGrad;
        ctx.fillRect(0, 0, w, h);
      }

      // ── 3. Stars ──
      for (const star of starsRef.current) {
        const twinkle = 0.5 + 0.5 * Math.sin(time * star.twinkleSpeed + star.twinklePhase);
        const alpha = star.brightness * twinkle;
        ctx.fillStyle = `rgba(200, 210, 255, ${alpha})`;
        ctx.beginPath();
        ctx.arc(star.x * w, star.y * h, star.size, 0, Math.PI * 2);
        ctx.fill();
      }

      // ── 4. Dot grid ──
      const gridSpacing = 50;
      const gridAlpha = 0.035;
      for (let gx = gridSpacing; gx < w; gx += gridSpacing) {
        for (let gy = gridSpacing; gy < h; gy += gridSpacing) {
          const gnx = gx / w;
          const gny = gy / h;
          let dotColor = `rgba(255, 255, 255, ${gridAlpha})`;
          let dotSize = 0.8;

          // Dots near active nodes glow with node color
          for (const node of nodes) {
            const d = dist(gnx, gny, node.x, node.y);
            if (d < 0.15) {
              const rgb = STATE_RGB[node.state] || [150, 150, 150];
              const influence = (1 - d / 0.15) * node.glowIntensity;
              dotColor = `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${gridAlpha + influence * 0.15})`;
              dotSize = 0.8 + influence * 1.2;
              break;
            }
          }

          ctx.fillStyle = dotColor;
          ctx.beginPath();
          ctx.arc(gx, gy, dotSize, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // ── 5. Physics: repulsion + mouse attraction + drift ──
      const nodeArr = nodes;
      for (let i = 0; i < nodeArr.length; i++) {
        const a = nodeArr[i];
        // Repulsion from other nodes
        for (let j = i + 1; j < nodeArr.length; j++) {
          const b = nodeArr[j];
          const dx = b.x - a.x;
          const dy = b.y - a.y;
          const d = Math.max(EPS, Math.sqrt(dx * dx + dy * dy));
          if (d < NODE_REPULSE_DIST) {
            const force = (NODE_REPULSE_DIST - d) * NODE_REPULSE_FORCE;
            const nx = dx / d;
            const ny = dy / d;
            a.vx -= nx * force;
            a.vy -= ny * force;
            b.vx += nx * force;
            b.vy += ny * force;
          }
        }

        // Mouse attraction
        if (mouse.active) {
          const dx = mouse.x - a.x;
          const dy = mouse.y - a.y;
          const d = Math.max(EPS, Math.sqrt(dx * dx + dy * dy));
          if (d < 0.4) {
            a.vx += (dx / d) * MOUSE_ATTRACT_STRENGTH * (1 - d / 0.4);
            a.vy += (dy / d) * MOUSE_ATTRACT_STRENGTH * (1 - d / 0.4);
          }
        }

        // Organic drift (orbit + noise)
        a.orbitAngle += a.orbitSpeed;
        if (a.type !== 'orchestrator') {
          a.vx += Math.cos(a.orbitAngle) * 0.00005;
          a.vy += Math.sin(a.orbitAngle * 1.3) * 0.00005;
        }

        // Damping
        a.vx *= 0.95;
        a.vy *= 0.95;

        // Update position
        a.x += a.vx;
        a.y += a.vy;

        // Soft bounds
        const margin = 0.05;
        if (a.x < margin) a.vx += 0.0002;
        if (a.x > 1 - margin) a.vx -= 0.0002;
        if (a.y < margin) a.vy += 0.0002;
        if (a.y > 1 - margin) a.vy -= 0.0002;

        // Lerp size and glow
        a.size = lerp(a.size, a.targetSize, SIZE_LERP);
        a.glowIntensity = lerp(a.glowIntensity, a.targetGlow, GLOW_LERP);
        a.opacity = Math.min(1, a.opacity + 0.03);
        a.spawnProgress = Math.min(1, a.spawnProgress + 0.02);

        // Breathing
        a.phase += STATE_BREATH_SPEED[a.state] || 0.5;
      }

      // ── 6. Connections ──
      const connections = new Set<string>();
      for (const node of nodes) {
        for (const connId of node.connections) {
          const target = animNodesRef.current.get(connId);
          if (!target) continue;
          const key = [node.id, connId].sort().join('→');
          if (connections.has(key)) continue;
          connections.add(key);

          const x1 = node.x * w;
          const y1 = node.y * h;
          const x2 = target.x * w;
          const y2 = target.y * h;
          const d = dist(node.x, node.y, target.x, target.y);

          const isActive = node.state !== 'idle' && node.state !== 'offline' &&
                           target.state !== 'idle' && target.state !== 'offline';
          const baseAlpha = isActive ? 0.25 : 0.06;
          const lineWidth = isActive ? 1.5 : 0.5;

          // Mouse proximity boost
          let mouseBoost = 0;
          if (mouse.active) {
            const mx = mouse.x * w;
            const my = mouse.y * h;
            const midX = (x1 + x2) / 2;
            const midY = (y1 + y2) / 2;
            const mDist = dist(midX / w, midY / h, mouse.x, mouse.y);
            if (mDist < 0.2) mouseBoost = (1 - mDist / 0.2) * 0.3;
          }

          // Bezier curve for organic connection
          const cpx = (x1 + x2) / 2 + (y2 - y1) * 0.15;
          const cpy = (y1 + y2) / 2 + (x1 - x2) * 0.15;

          const rgb1 = STATE_RGB[node.state] || [150, 150, 150];
          const rgb2 = STATE_RGB[target.state] || [150, 150, 150];

          const grad = ctx.createLinearGradient(x1, y1, x2, y2);
          const alpha = baseAlpha + mouseBoost;
          grad.addColorStop(0, `rgba(${rgb1[0]},${rgb1[1]},${rgb1[2]},${alpha})`);
          grad.addColorStop(1, `rgba(${rgb2[0]},${rgb2[1]},${rgb2[2]},${alpha})`);

          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.quadraticCurveTo(cpx, cpy, x2, y2);
          ctx.strokeStyle = grad;
          ctx.lineWidth = lineWidth;
          ctx.stroke();

          // Spawn energy particles on active connections
          if (isActive && Math.random() < ENERGY_SPAWN_RATE && particlesRef.current.length < MAX_ENERGY_PARTICLES) {
            const dir = Math.random() > 0.5 ? 1 : -1;
            particlesRef.current.push({
              fromId: node.id,
              toId: connId,
              t: dir > 0 ? 0 : 1,
              speed: (Math.random() * 0.005 + 0.003) * dir,
              size: Math.random() * 2 + 1.5,
              alpha: 0.9,
            });
          }
        }
      }

      // Mesh connections (nearby non-connected nodes)
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i];
          const b = nodes[j];
          const d = dist(a.x, a.y, b.x, b.y);
          if (d < MESH_CONN_DIST && !a.connections.includes(b.id)) {
            const x1 = a.x * w;
            const y1 = a.y * h;
            const x2 = b.x * w;
            const y2 = b.y * h;
            const fade = (1 - d / MESH_CONN_DIST);
            const alpha = fade * 0.08;

            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.strokeStyle = `rgba(100, 120, 180, ${alpha})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      // ── 7. Energy particles ──
      const aliveParticles: EnergyParticle[] = [];
      for (const p of particlesRef.current) {
        p.t += p.speed;
        if (p.t < 0 || p.t > 1) continue;
        p.alpha *= 0.997;

        const from = animNodesRef.current.get(p.fromId);
        const to = animNodesRef.current.get(p.toId);
        if (!from || !to) continue;

        // Quadratic bezier position
        const x1 = from.x * w;
        const y1 = from.y * h;
        const x2 = to.x * w;
        const y2 = to.y * h;
        const cpx = (x1 + x2) / 2 + (y2 - y1) * 0.15;
        const cpy = (y1 + y2) / 2 + (x1 - x2) * 0.15;
        const t = p.t;
        const px = (1 - t) * (1 - t) * x1 + 2 * (1 - t) * t * cpx + t * t * x2;
        const py = (1 - t) * (1 - t) * y1 + 2 * (1 - t) * t * cpy + t * t * y2;

        const rgb = STATE_RGB[from.state] || [150, 150, 150];

        // Glow
        const glowGrad = ctx.createRadialGradient(px, py, 0, px, py, p.size * 4);
        glowGrad.addColorStop(0, `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${p.alpha * 0.6})`);
        glowGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = glowGrad;
        ctx.fillRect(px - p.size * 4, py - p.size * 4, p.size * 8, p.size * 8);

        // Core
        ctx.fillStyle = `rgba(${Math.min(255, rgb[0] + 80)},${Math.min(255, rgb[1] + 80)},${Math.min(255, rgb[2] + 80)},${p.alpha})`;
        ctx.beginPath();
        ctx.arc(px, py, p.size, 0, Math.PI * 2);
        ctx.fill();

        aliveParticles.push(p);
      }
      particlesRef.current = aliveParticles;

      // ── 8. Pulse rings ──
      const alivePulses: PulseRing[] = [];
      for (const pulse of pulsesRef.current) {
        pulse.radius += 0.002;
        pulse.alpha *= 0.97;
        if (pulse.alpha < 0.01) continue;

        const px = pulse.x * w;
        const py = pulse.y * h;
        const pr = pulse.radius * w;

        ctx.beginPath();
        ctx.arc(px, py, pr, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(${pulse.color[0]},${pulse.color[1]},${pulse.color[2]},${pulse.alpha})`;
        ctx.lineWidth = 2;
        ctx.stroke();

        alivePulses.push(pulse);
      }
      pulsesRef.current = alivePulses;

      // Periodic ambient pulses from active nodes
      if (frameRef.current % 120 === 0) {
        for (const node of nodes) {
          if (node.state !== 'idle' && node.state !== 'offline' && node.glowIntensity > 0.5) {
            if (pulsesRef.current.length < MAX_PULSE_RINGS) {
              const rgb = STATE_RGB[node.state] || [150, 150, 150];
              pulsesRef.current.push({
                x: node.x, y: node.y,
                radius: node.size * 0.015,
                maxRadius: 0.08 + node.glowIntensity * 0.05,
                alpha: 0.3 * node.glowIntensity,
                color: rgb,
              });
            }
          }
        }
      }

      // ── 9. Nodes ──
      for (const node of nodes) {
        const nx = node.x * w;
        const ny = node.y * h;
        const baseRadius = Math.max(EPS, node.size * 14);
        const breath = 1 + Math.sin(node.phase) * 0.12;
        const radius = baseRadius * breath * node.spawnProgress;
        const rgb = STATE_RGB[node.state] || [150, 150, 150];
        const isSelected = node.id === selectedNodeId;
        const isOrchestrator = node.type === 'orchestrator';

        // Outer glow halo
        const glowRadius = radius * (2.5 + node.glowIntensity);
        const haloGrad = ctx.createRadialGradient(nx, ny, radius * 0.5, nx, ny, glowRadius);
        const haloAlpha = 0.15 * node.glowIntensity * node.opacity;
        haloGrad.addColorStop(0, `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${haloAlpha})`);
        haloGrad.addColorStop(0.5, `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${haloAlpha * 0.3})`);
        haloGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = haloGrad;
        ctx.beginPath();
        ctx.arc(nx, ny, glowRadius, 0, Math.PI * 2);
        ctx.fill();

        // Selected breathing ring
        if (isSelected) {
          const selBreath = 1 + Math.sin(time * 2) * 0.3;
          ctx.beginPath();
          ctx.arc(nx, ny, radius * 2 * selBreath, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${0.4 + Math.sin(time * 2) * 0.2})`;
          ctx.lineWidth = 2;
          ctx.setLineDash([4, 4]);
          ctx.lineDashOffset = -time * 20;
          ctx.stroke();
          ctx.setLineDash([]);
        }

        // Core gradient
        const coreGrad = ctx.createRadialGradient(
          nx - radius * 0.2, ny - radius * 0.2, 0,
          nx, ny, radius
        );
        const bright = isOrchestrator ? 40 : 20;
        coreGrad.addColorStop(0, `rgba(${Math.min(255, rgb[0] + bright)},${Math.min(255, rgb[1] + bright)},${Math.min(255, rgb[2] + bright)},${0.95 * node.opacity})`);
        coreGrad.addColorStop(0.7, `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${0.85 * node.opacity})`);
        coreGrad.addColorStop(1, `rgba(${Math.floor(rgb[0] * 0.6)},${Math.floor(rgb[1] * 0.6)},${Math.floor(rgb[2] * 0.6)},${0.6 * node.opacity})`);

        ctx.fillStyle = coreGrad;
        ctx.beginPath();
        ctx.arc(nx, ny, radius, 0, Math.PI * 2);
        ctx.fill();

        // Inner bright spot (specular)
        const specGrad = ctx.createRadialGradient(
          nx - radius * 0.3, ny - radius * 0.3, 0,
          nx - radius * 0.3, ny - radius * 0.3, radius * 0.5
        );
        specGrad.addColorStop(0, `rgba(255,255,255,${0.35 * node.opacity})`);
        specGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = specGrad;
        ctx.beginPath();
        ctx.arc(nx, ny, radius, 0, Math.PI * 2);
        ctx.fill();

        // Ring outline
        ctx.beginPath();
        ctx.arc(nx, ny, radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${0.5 * node.opacity})`;
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Name label
        const labelAlpha = node.opacity * 0.9;
        const labelSize = isOrchestrator ? 12 : 10;
        const label = isOrchestrator ? 'HERMES' : node.name.toUpperCase();
        ctx.fillStyle = `rgba(255, 255, 255, ${labelAlpha})`;
        ctx.font = `${isOrchestrator ? '700' : '600'} ${labelSize}px "Inter", system-ui, sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillText(label, nx, ny + radius + 16);

        // State indicator (small dot below name)
        if (!isOrchestrator) {
          const stateDotY = ny + radius + 26;
          ctx.fillStyle = `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${labelAlpha * 0.7})`;
          ctx.beginPath();
          ctx.arc(nx, stateDotY, 2, 0, Math.PI * 2);
          ctx.fill();
        }

        // Orchestrator message
        if (isOrchestrator && node.message) {
          ctx.fillStyle = `rgba(200, 200, 220, ${labelAlpha * 0.6})`;
          ctx.font = '400 10px "Inter", system-ui, sans-serif';
          const maxMsgWidth = w * 0.3;
          let msg = node.message;
          if (ctx.measureText(msg).width > maxMsgWidth) {
            while (msg.length > 0 && ctx.measureText(msg + '...').width > maxMsgWidth) {
              msg = msg.slice(0, -1);
            }
            msg += '...';
          }
          ctx.fillText(msg, nx, ny + radius + 30);
        }
      }

      // ── 10. Mouse glow ──
      if (mouse.active) {
        const mx = mouse.x * w;
        const my = mouse.y * h;
        const mouseGlow = ctx.createRadialGradient(mx, my, 0, mx, my, 100);
        mouseGlow.addColorStop(0, 'rgba(100, 140, 255, 0.04)');
        mouseGlow.addColorStop(1, 'transparent');
        ctx.fillStyle = mouseGlow;
        ctx.fillRect(0, 0, w, h);
      }

      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', handleResize);
    };
  }, [syncNodes, handleResize]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full cursor-crosshair"
      onMouseMove={handleMouseMove}
      onClick={handleClick}
      onMouseLeave={() => { mouseRef.current.active = false; }}
    />
  );
}