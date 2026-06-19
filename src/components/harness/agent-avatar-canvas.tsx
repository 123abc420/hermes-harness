'use client';

import { useRef, useEffect, useCallback } from 'react';
import { useAgentLiveStore } from '@/store/agent-live-store';
import { EVOLUTION_STAGES } from '@/lib/constants';

// ─── State Configuration ─────────────────────────────────────────────
export type AgentVisualState =
  | 'idle'
  | 'thinking'
  | 'searching'
  | 'planning'
  | 'executing'
  | 'verifying'
  | 'celebrating'
  | 'error'
  | 'evolving'
  | 'offline';

interface StateConfig {
  primary: string;
  secondary: string;
  glow: string;
  particleSpeed: number;
  pulseSpeed: number;
  ringSpeed: number;
  label: string;
  // Facial expression params
  eyeSize: number;
  pupilSize: number;
  browAngle: number;      // radians, negative = worried, positive = alert
  browY: number;          // offset up/down
  mouthCurve: number;     // -1 frown, 0 neutral, 1 smile
  mouthOpen: number;      // 0 closed, 1 wide open
  mouthWidth: number;     // relative to face
  cheekGlow: number;      // 0 none, 1 full blush
  eyeSquint: number;      // 0 open, 1 fully squinted (thinking)
  eyeSparkle: boolean;
}

const STATE_CONFIG: Record<AgentVisualState, StateConfig> = {
  idle:        { primary: '#10b981', secondary: '#059669', glow: 'rgba(16,185,129,0.3)',  particleSpeed: 0.3, pulseSpeed: 0.8, ringSpeed: 0.2, label: 'IDLE',        eyeSize: 1.0,  pupilSize: 1.0,  browAngle: 0,    browY: 0,   mouthCurve: 0.3,  mouthOpen: 0,   mouthWidth: 1.0,  cheekGlow: 0.1, eyeSquint: 0.1,  eyeSparkle: false },
  thinking:    { primary: '#06b6d4', secondary: '#0891b2', glow: 'rgba(6,182,212,0.3)',   particleSpeed: 0.6, pulseSpeed: 1.5, ringSpeed: 0.5, label: 'THINKING',    eyeSize: 0.85, pupilSize: 0.8,  browAngle: -0.15, browY: -3,  mouthCurve: 0,    mouthOpen: 0,   mouthWidth: 0.9,  cheekGlow: 0,   eyeSquint: 0.6,  eyeSparkle: false },
  searching:   { primary: '#f59e0b', secondary: '#d97706', glow: 'rgba(245,158,11,0.3)',  particleSpeed: 0.8, pulseSpeed: 1.2, ringSpeed: 0.7, label: 'SEARCHING',   eyeSize: 1.3,  pupilSize: 1.2,  browAngle: 0.2,  browY: -4,  mouthCurve: 0.1,  mouthOpen: 0,   mouthWidth: 1.1,  cheekGlow: 0,   eyeSquint: 0,    eyeSparkle: true  },
  planning:    { primary: '#a78bfa', secondary: '#7c3aed', glow: 'rgba(167,139,250,0.3)', particleSpeed: 0.4, pulseSpeed: 1.0, ringSpeed: 0.3, label: 'PLANNING',    eyeSize: 0.9,  pupilSize: 0.9,  browAngle: 0.1,  browY: -2,  mouthCurve: 0.2,  mouthOpen: 0,   mouthWidth: 0.8,  cheekGlow: 0,   eyeSquint: 0.3,  eyeSparkle: false },
  executing:   { primary: '#f43f5e', secondary: '#e11d48', glow: 'rgba(244,63,94,0.3)',   particleSpeed: 1.0, pulseSpeed: 2.0, ringSpeed: 0.9, label: 'EXECUTING',   eyeSize: 1.1,  pupilSize: 0.7,  browAngle: 0.25, browY: -3,  mouthCurve: 0,    mouthOpen: 0.2, mouthWidth: 1.0,  cheekGlow: 0,   eyeSquint: 0.2,  eyeSparkle: false },
  verifying:   { primary: '#22d3ee', secondary: '#06b6d4', glow: 'rgba(34,211,238,0.3)',  particleSpeed: 0.5, pulseSpeed: 1.3, ringSpeed: 0.4, label: 'VERIFYING',   eyeSize: 1.15, pupilSize: 1.0,  browAngle: 0.1,  browY: -2,  mouthCurve: 0.4,  mouthOpen: 0,   mouthWidth: 1.0,  cheekGlow: 0.1, eyeSquint: 0.1,  eyeSparkle: true  },
  celebrating: { primary: '#fbbf24', secondary: '#f59e0b', glow: 'rgba(251,191,36,0.3)',  particleSpeed: 1.5, pulseSpeed: 2.5, ringSpeed: 1.2, label: 'CELEBRATING', eyeSize: 1.2,  pupilSize: 1.1,  browAngle: -0.1, browY: -5,  mouthCurve: 1.0,  mouthOpen: 0.8, mouthWidth: 1.4,  cheekGlow: 0.5, eyeSquint: 0,    eyeSparkle: true  },
  error:       { primary: '#ef4444', secondary: '#dc2626', glow: 'rgba(239,68,68,0.3)',   particleSpeed: 0.2, pulseSpeed: 3.0, ringSpeed: 0.1, label: 'ERROR',       eyeSize: 1.3,  pupilSize: 0.6,  browAngle: -0.35, browY: 2,   mouthCurve: -0.8, mouthOpen: 0.4, mouthWidth: 1.2,  cheekGlow: 0,   eyeSquint: 0.5,  eyeSparkle: false },
  evolving:    { primary: '#c084fc', secondary: '#8b5cf6', glow: 'rgba(192,132,252,0.3)', particleSpeed: 1.2, pulseSpeed: 2.0, ringSpeed: 1.0, label: 'EVOLVING',    eyeSize: 1.0,  pupilSize: 1.3,  browAngle: 0,    browY: -4,  mouthCurve: 0.5,  mouthOpen: 0.3, mouthWidth: 1.1,  cheekGlow: 0.3, eyeSquint: 0,    eyeSparkle: true  },
  offline:     { primary: '#525252', secondary: '#3f3f46', glow: 'rgba(82,82,82,0.2)',     particleSpeed: 0.1, pulseSpeed: 0.3, ringSpeed: 0.05, label: 'OFFLINE',     eyeSize: 0.7,  pupilSize: 0.5,  browAngle: -0.2, browY: 2,   mouthCurve: -0.3, mouthOpen: 0,   mouthWidth: 0.7,  cheekGlow: 0,   eyeSquint: 0.4,  eyeSparkle: false },
};

// ─── Particle System ─────────────────────────────────────────────────
interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  opacity: number;
}

interface OrbitalNode {
  angle: number;
  radius: number;
  speed: number;
  size: number;
  opacity: number;
}

// ─── Evolution Levels (imported from constants — single source of truth) ──

function getEvolution(waveCount: number, totalImprovements: number) {
  const effectiveLevel = Math.floor(waveCount / 2) + Math.floor(totalImprovements / 5) + 1;
  let stage = EVOLUTION_STAGES[0];
  for (const s of EVOLUTION_STAGES) {
    if (effectiveLevel >= s.level) stage = s;
  }
  return { ...stage, effectiveLevel };
}

// ─── Smoothed face params ────────────────────────────────────────────
interface SmoothedFace {
  eyeSize: number;
  pupilSize: number;
  browAngle: number;
  browY: number;
  mouthCurve: number;
  mouthOpen: number;
  mouthWidth: number;
  cheekGlow: number;
  eyeSquint: number;
}

const FACE_LERP_SPEED = 0.06;

function lerpFace(current: SmoothedFace, target: StateConfig, dt: number) {
  const s = Math.min(FACE_LERP_SPEED * dt, 1);
  current.eyeSize += (target.eyeSize - current.eyeSize) * s;
  current.pupilSize += (target.pupilSize - current.pupilSize) * s;
  current.browAngle += (target.browAngle - current.browAngle) * s;
  current.browY += (target.browY - current.browY) * s;
  current.mouthCurve += (target.mouthCurve - current.mouthCurve) * s;
  current.mouthOpen += (target.mouthOpen - current.mouthOpen) * s;
  current.mouthWidth += (target.mouthWidth - current.mouthWidth) * s;
  current.cheekGlow += (target.cheekGlow - current.cheekGlow) * s;
  current.eyeSquint += (target.eyeSquint - current.eyeSquint) * s;
  return current;
}

// ─── Main Component ──────────────────────────────────────────────────
interface AgentAvatarCanvasProps {
  size?: number;
  interactive?: boolean;
  showLabel?: boolean;
}

export function AgentAvatarCanvas({ size = 320, interactive = true, showLabel = true }: AgentAvatarCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0.5, y: 0.5 });
  const particlesRef = useRef<Particle[]>([]);
  const nodesRef = useRef<OrbitalNode[]>([]);
  const frameRef = useRef(0);
  const timeRef = useRef(0);
  const prevTimeRef = useRef(0);
  const stateRef = useRef<AgentVisualState>('idle');
  const colorLerpRef = useRef({ r: 16, g: 185, b: 129 });
  const transitionRef = useRef(0);
  const faceRef = useRef<SmoothedFace>({
    eyeSize: 1.0, pupilSize: 1.0, browAngle: 0, browY: 0,
    mouthCurve: 0.3, mouthOpen: 0, mouthWidth: 1.0, cheekGlow: 0.1, eyeSquint: 0.1,
  });

  const agentState = useAgentLiveStore(s => s.agentState);
  const waveCount = useAgentLiveStore(s => s.waveCount);
  const totalImprovements = useAgentLiveStore(s => s.totalImprovements);

  // Parse color to RGB
  const parseColor = useCallback((hex: string) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return { r, g, b };
  }, []);

  // Smooth color lerp
  const lerpColor = useCallback((target: { r: number; g: number; b: number }, speed: number) => {
    const c = colorLerpRef.current;
    c.r += (target.r - c.r) * speed;
    c.g += (target.g - c.g) * speed;
    c.b += (target.b - c.b) * speed;
    return `rgb(${Math.round(c.r)},${Math.round(c.g)},${Math.round(c.b)})`;
  }, []);

  // Initialize particles
  const initParticles = useCallback((count: number, cx: number, cy: number) => {
    const particles: Particle[] = [];
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = 30 + Math.random() * (size * 0.35);
      particles.push({
        x: cx + Math.cos(angle) * dist,
        y: cy + Math.sin(angle) * dist,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        life: Math.random() * 200 + 100,
        maxLife: 300,
        size: 1 + Math.random() * 2.5,
        opacity: 0.3 + Math.random() * 0.5,
      });
    }
    particlesRef.current = particles;
  }, [size]);

  // Initialize orbital nodes
  const initNodes = useCallback((count: number, rings: number) => {
    const nodes: OrbitalNode[] = [];
    const ringRadii = [];
    for (let r = 0; r < rings; r++) {
      ringRadii.push(size * 0.18 + r * (size * 0.1));
    }
    for (let i = 0; i < count; i++) {
      const ring = i % rings;
      nodes.push({
        angle: (Math.PI * 2 / count) * i + Math.random() * 0.5,
        radius: ringRadii[ring],
        speed: 0.3 + Math.random() * 0.5,
        size: 2 + Math.random() * 3,
        opacity: 0.5 + Math.random() * 0.5,
      });
    }
    nodesRef.current = nodes;
  }, [size]);

  // Mouse tracking
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!interactive) return;
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      mouseRef.current.x = (e.clientX - rect.left) / rect.width;
      mouseRef.current.y = (e.clientY - rect.top) / rect.height;
    }
  }, [interactive]);

  // Main render loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const displaySize = size;
    canvas.width = displaySize * dpr;
    canvas.height = displaySize * dpr;
    canvas.style.width = `${displaySize}px`;
    canvas.style.height = `${displaySize}px`;
    ctx.scale(dpr, dpr);

    const cx = displaySize / 2;
    const cy = displaySize / 2;
    const coreRadius = displaySize * 0.14;

    const evolution = getEvolution(waveCount, totalImprovements);
    initParticles(evolution.particles, cx, cy);
    initNodes(evolution.nodes, evolution.rings);

    let animId: number;

    const render = (timestamp: number) => {
      if (!prevTimeRef.current) prevTimeRef.current = timestamp;
      const dt = Math.min((timestamp - prevTimeRef.current) / 16.67, 3);
      prevTimeRef.current = timestamp;
      timeRef.current += dt * 0.02;
      frameRef.current++;

      // State transition
      const currentState = agentState as AgentVisualState;
      if (currentState !== stateRef.current) {
        stateRef.current = currentState;
        transitionRef.current = 1.0;
        particlesRef.current.forEach(p => {
          const angle = Math.random() * Math.PI * 2;
          p.vx += Math.cos(angle) * 2;
          p.vy += Math.sin(angle) * 2;
        });
      }
      transitionRef.current *= 0.95;

      const config = STATE_CONFIG[currentState] || STATE_CONFIG.idle;
      const targetColor = parseColor(config.primary);
      const currentColor = lerpColor(targetColor, 0.05);
      const secondaryColor = parseColor(config.secondary);
      const r2 = Math.round(secondaryColor.r * 0.3 + targetColor.r * 0.7);
      const g2 = Math.round(secondaryColor.g * 0.3 + targetColor.g * 0.7);
      const b2 = Math.round(secondaryColor.b * 0.3 + targetColor.b * 0.7);
      const secondaryRgb = `rgb(${r2},${g2},${b2})`;

      // Smooth face params
      lerpFace(faceRef.current, config, dt);
      const face = faceRef.current;

      // Clear
      ctx.clearRect(0, 0, displaySize, displaySize);

      const t = timeRef.current;
      const R = Math.round(targetColor.r);
      const G = Math.round(targetColor.g);
      const B = Math.round(targetColor.b);

      // ─── 1. Background glow ──────────────────────
      const bgGlow = ctx.createRadialGradient(cx, cy, 0, cx, cy, displaySize * 0.5);
      bgGlow.addColorStop(0, `rgba(${R},${G},${B},0.08)`);
      bgGlow.addColorStop(0.5, `rgba(${R},${G},${B},0.02)`);
      bgGlow.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = bgGlow;
      ctx.fillRect(0, 0, displaySize, displaySize);

      // ─── 2. Orbital rings ────────────────────────
      const ringCount = evolution.rings;
      for (let r = 0; r < ringCount; r++) {
        const ringRadius = size * 0.18 + r * (size * 0.1);
        const ringRotation = t * config.ringSpeed * (r % 2 === 0 ? 1 : -1) * (1 + r * 0.2);

        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(ringRotation);

        ctx.beginPath();
        ctx.ellipse(0, 0, ringRadius, ringRadius * 0.35, 0, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(${R},${G},${B},${0.08 + r * 0.02})`;
        ctx.lineWidth = 1;
        ctx.setLineDash(r === 0 ? [4, 8] : r === 1 ? [2, 6] : []);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.restore();
      }

      // ─── 3. Connection lines between nodes ───────
      const nodes = nodesRef.current;
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const ni = nodes[i];
          const nj = nodes[j];
          const xi = cx + Math.cos(ni.angle) * ni.radius;
          const yi = cy + Math.sin(ni.angle) * ni.radius * 0.35;
          const xj = cx + Math.cos(nj.angle) * nj.radius;
          const yj = cy + Math.sin(nj.angle) * nj.radius * 0.35;
          const dist = Math.hypot(xi - xj, yi - yj);
          if (dist < size * 0.25) {
            const alpha = (1 - dist / (size * 0.25)) * 0.12;
            ctx.beginPath();
            ctx.moveTo(xi, yi);
            ctx.lineTo(xj, yj);
            ctx.strokeStyle = `rgba(${R},${G},${B},${alpha})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      // ─── 4. Orbital nodes ────────────────────────
      nodes.forEach(node => {
        node.angle += node.speed * config.ringSpeed * 0.01 * dt;
        const nx = cx + Math.cos(node.angle) * node.radius;
        const ny = cy + Math.sin(node.angle) * node.radius * 0.35;

        const nodeGlow = ctx.createRadialGradient(nx, ny, 0, nx, ny, node.size * 4);
        nodeGlow.addColorStop(0, `rgba(${R},${G},${B},${node.opacity * 0.3})`);
        nodeGlow.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = nodeGlow;
        ctx.fillRect(nx - node.size * 4, ny - node.size * 4, node.size * 8, node.size * 8);

        ctx.beginPath();
        ctx.arc(nx, ny, node.size, 0, Math.PI * 2);
        ctx.fillStyle = currentColor;
        ctx.fill();
      });

      // ─── 5. Particles ────────────────────────────
      const particles = particlesRef.current;
      particles.forEach(p => {
        if (interactive) {
          const mx = mouseRef.current.x * displaySize;
          const my = mouseRef.current.y * displaySize;
          const dx = mx - p.x;
          const dy = my - p.y;
          const dist = Math.hypot(dx, dy) + 1;
          p.vx += (dx / dist) * 0.02 * config.particleSpeed;
          p.vy += (dy / dist) * 0.02 * config.particleSpeed;
        }

        const dx = cx - p.x;
        const dy = cy - p.y;
        const dist = Math.hypot(dx, dy) + 1;
        if (currentState === 'celebrating' || currentState === 'evolving') {
          p.vx -= (dx / dist) * 0.03;
          p.vy -= (dy / dist) * 0.03;
        } else if (currentState === 'thinking' || currentState === 'searching') {
          p.vx += (-dy / dist) * 0.02;
          p.vy += (dx / dist) * 0.02;
        } else {
          p.vx += (dx / dist) * 0.005;
          p.vy += (dy / dist) * 0.005;
        }

        p.vx *= 0.98;
        p.vy *= 0.98;
        p.x += p.vx * config.particleSpeed * dt;
        p.y += p.vy * config.particleSpeed * dt;
        p.life -= dt;

        if (p.life <= 0 || p.x < -20 || p.x > displaySize + 20 || p.y < -20 || p.y > displaySize + 20) {
          const angle = Math.random() * Math.PI * 2;
          const d = 20 + Math.random() * (size * 0.3);
          p.x = cx + Math.cos(angle) * d;
          p.y = cy + Math.sin(angle) * d;
          p.vx = (Math.random() - 0.5) * 0.5;
          p.vy = (Math.random() - 0.5) * 0.5;
          p.life = 150 + Math.random() * 200;
          p.maxLife = p.life;
        }

        const lifeRatio = p.life / p.maxLife;
        const alpha = p.opacity * Math.sin(lifeRatio * Math.PI);

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * lifeRatio, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${R},${G},${B},${alpha * 0.6})`;
        ctx.fill();
      });

      // ─── 6. Core orb (face body) ─────────────────
      const pulse = 1 + Math.sin(t * config.pulseSpeed * 3) * 0.06;
      const shakeX = currentState === 'error' ? (Math.random() - 0.5) * 3 : 0;
      const shakeY = currentState === 'error' ? (Math.random() - 0.5) * 3 : 0;
      const coreCx = cx + shakeX;
      const coreCy = cy + shakeY;
      const actualCoreR = coreRadius * pulse;

      // Outer glow
      const outerGlow = ctx.createRadialGradient(coreCx, coreCy, actualCoreR * 0.5, coreCx, coreCy, actualCoreR * 3);
      outerGlow.addColorStop(0, config.glow);
      outerGlow.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = outerGlow;
      ctx.beginPath();
      ctx.arc(coreCx, coreCy, actualCoreR * 3, 0, Math.PI * 2);
      ctx.fill();

      // Core gradient (face base)
      const coreGrad = ctx.createRadialGradient(
        coreCx - actualCoreR * 0.3, coreCy - actualCoreR * 0.3, 0,
        coreCx, coreCy, actualCoreR
      );
      coreGrad.addColorStop(0, `rgba(255,255,255,0.9)`);
      coreGrad.addColorStop(0.3, currentColor);
      coreGrad.addColorStop(1, secondaryRgb);
      ctx.beginPath();
      ctx.arc(coreCx, coreCy, actualCoreR, 0, Math.PI * 2);
      ctx.fillStyle = coreGrad;
      ctx.fill();

      // Core inner ring
      ctx.beginPath();
      ctx.arc(coreCx, coreCy, actualCoreR * 0.7, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(255,255,255,0.12)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // ─── 7. Inner rotating hexagon ───────────────
      ctx.save();
      ctx.translate(coreCx, coreCy);
      ctx.rotate(t * 0.5);

      const hexSides = 6;
      const innerR = actualCoreR * 0.5;
      ctx.beginPath();
      for (let i = 0; i <= hexSides; i++) {
        const a = (Math.PI * 2 / hexSides) * i;
        const hx = Math.cos(a) * innerR;
        const hy = Math.sin(a) * innerR;
        if (i === 0) { ctx.moveTo(hx, hy); } else { ctx.lineTo(hx, hy); }
      }
      ctx.strokeStyle = 'rgba(255,255,255,0.15)';
      ctx.lineWidth = 0.5;
      ctx.stroke();

      for (let i = 0; i < hexSides; i++) {
        const a = (Math.PI * 2 / hexSides) * i;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(Math.cos(a) * innerR, Math.sin(a) * innerR);
        ctx.strokeStyle = 'rgba(255,255,255,0.08)';
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }
      ctx.restore();

      // ─── 8. FACE: Eyes ───────────────────────────
      const mouseOffsetX = (mouseRef.current.x - 0.5);
      const mouseOffsetY = (mouseRef.current.y - 0.5);

      const eyeSpacing = actualCoreR * 0.28;
      const eyeY = coreCy - actualCoreR * 0.08;
      const baseEyeSize = actualCoreR * 0.14 * face.eyeSize;
      const basePupilSize = actualCoreR * 0.055 * face.pupilSize;

      // Blink cycle
      const blinkCycle = (timestamp % 3500) / 3500;
      const isBlinking = blinkCycle > 0.95 && (currentState === 'idle' || currentState === 'thinking');
      // Squint factor for eye height
      const squintY = isBlinking ? 0.1 : (1 - face.eyeSquint * 0.7);

      for (const side of [-1, 1]) {
        const ex = coreCx + side * eyeSpacing;
        const ey = eyeY;

        // Eye glow
        const eyeGlow = ctx.createRadialGradient(ex, ey, 0, ex, ey, baseEyeSize * 3);
        eyeGlow.addColorStop(0, 'rgba(255,255,255,0.3)');
        eyeGlow.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = eyeGlow;
        ctx.beginPath();
        ctx.arc(ex, ey, baseEyeSize * 3, 0, Math.PI * 2);
        ctx.fill();

        // Eye white (ellipse for squint)
        ctx.save();
        ctx.translate(ex, ey);
        ctx.scale(1, squintY);
        ctx.beginPath();
        ctx.arc(0, 0, baseEyeSize, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255,255,255,0.95)';
        ctx.fill();
        ctx.restore();

        if (!isBlinking) {
          // Iris
          const irisSize = baseEyeSize * 0.7;
          const pupilOffX = mouseOffsetX * baseEyeSize * 0.4;
          const pupilOffY = mouseOffsetY * baseEyeSize * 0.4;
          ctx.beginPath();
          ctx.arc(ex + pupilOffX, ey + pupilOffY, irisSize, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${Math.round(R * 0.4)},${Math.round(G * 0.4)},${Math.round(B * 0.4)},0.9)`;
          ctx.fill();

          // Pupil
          ctx.beginPath();
          ctx.arc(ex + pupilOffX, ey + pupilOffY, basePupilSize, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(0,0,0,0.9)`;
          ctx.fill();

          // Eye sparkle
          if (config.eyeSparkle) {
            ctx.beginPath();
            ctx.arc(ex + pupilOffX - baseEyeSize * 0.15, ey + pupilOffY - baseEyeSize * 0.15, basePupilSize * 0.6, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255,255,255,0.9)';
            ctx.fill();
          }

          // Light reflection
          ctx.beginPath();
          ctx.arc(ex + baseEyeSize * 0.25, ey - baseEyeSize * 0.2, baseEyeSize * 0.12, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(255,255,255,0.7)';
          ctx.fill();
        }
      }

      // ─── 9. FACE: Eyebrows ───────────────────────
      for (const side of [-1, 1]) {
        const bx = coreCx + side * eyeSpacing;
        const by = eyeY - baseEyeSize * 1.4 + face.browY;
        const browLen = baseEyeSize * 1.3;

        ctx.save();
        ctx.translate(bx, by);
        ctx.rotate(side * face.browAngle);

        ctx.beginPath();
        ctx.moveTo(-browLen / 2, 0);
        ctx.quadraticCurveTo(0, -baseEyeSize * 0.4 * (1 + Math.abs(face.browAngle) * 2), browLen / 2, 0);
        ctx.strokeStyle = `rgba(${R},${G},${B},0.7)`;
        ctx.lineWidth = Math.max(1.5, baseEyeSize * 0.18);
        ctx.lineCap = 'round';
        ctx.stroke();

        ctx.restore();
      }

      // ─── 10. FACE: Mouth ─────────────────────────
      const mouthY = coreCy + actualCoreR * 0.28;
      const mouthW = actualCoreR * 0.22 * face.mouthWidth;
      const mouthCurveAmount = actualCoreR * 0.15 * face.mouthCurve;
      const mouthOpenAmount = actualCoreR * 0.08 * face.mouthOpen;

      ctx.beginPath();
      if (face.mouthOpen > 0.15) {
        // Open mouth (ellipse)
        ctx.save();
        ctx.translate(coreCx, mouthY);
        ctx.scale(1, face.mouthOpen * 1.5 + 0.3);
        ctx.beginPath();
        ctx.arc(0, 0, mouthW * 0.7, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${Math.round(R * 0.3)},${Math.round(G * 0.3)},${Math.round(B * 0.3)},0.8)`;
        ctx.fill();
        // Inner mouth
        ctx.beginPath();
        ctx.arc(0, 0, mouthW * 0.5, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0,0,0,0.6)';
        ctx.fill();
        ctx.restore();
      } else {
        // Closed mouth (bezier curve)
        ctx.moveTo(coreCx - mouthW, mouthY);
        ctx.quadraticCurveTo(coreCx, mouthY + mouthCurveAmount, coreCx + mouthW, mouthY);
        ctx.strokeStyle = `rgba(${R},${G},${B},0.6)`;
        ctx.lineWidth = Math.max(1.5, actualCoreR * 0.03);
        ctx.lineCap = 'round';
        ctx.stroke();

        // Smile glow
        if (face.mouthCurve > 0.5) {
          const smileGlow = ctx.createRadialGradient(coreCx, mouthY + mouthCurveAmount * 0.5, 0, coreCx, mouthY, mouthW * 2);
          smileGlow.addColorStop(0, `rgba(${R},${G},${B},0.1)`);
          smileGlow.addColorStop(1, 'rgba(0,0,0,0)');
          ctx.fillStyle = smileGlow;
          ctx.beginPath();
          ctx.arc(coreCx, mouthY + mouthCurveAmount * 0.5, mouthW * 2, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // ─── 11. FACE: Cheek blush ───────────────────
      if (face.cheekGlow > 0.02) {
        for (const side of [-1, 1]) {
          const cheekX = coreCx + side * actualCoreR * 0.45;
          const cheekY = coreCy + actualCoreR * 0.15;
          const cheekGlow = ctx.createRadialGradient(cheekX, cheekY, 0, cheekX, cheekY, actualCoreR * 0.25);
          cheekGlow.addColorStop(0, `rgba(255,150,150,${face.cheekGlow * 0.3})`);
          cheekGlow.addColorStop(1, 'rgba(0,0,0,0)');
          ctx.fillStyle = cheekGlow;
          ctx.beginPath();
          ctx.arc(cheekX, cheekY, actualCoreR * 0.25, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // ─── 12. State label ─────────────────────────
      if (showLabel) {
        ctx.font = `bold ${displaySize * 0.035}px monospace`;
        ctx.textAlign = 'center';
        ctx.fillStyle = `rgba(${R},${G},${B},0.8)`;
        ctx.fillText(config.label, cx, cy + actualCoreR * 2.8);

        ctx.font = `${displaySize * 0.025}px monospace`;
        ctx.fillStyle = 'rgba(255,255,255,0.4)';
        ctx.fillText(`LV.${evolution.effectiveLevel} ${evolution.name}`, cx, cy + actualCoreR * 2.8 + displaySize * 0.04);
      }

      // ─── 13. Transition flash ────────────────────
      if (transitionRef.current > 0.01) {
        ctx.fillStyle = `rgba(255,255,255,${transitionRef.current * 0.12})`;
        ctx.fillRect(0, 0, displaySize, displaySize);
      }

      // ─── 14. Celebrating confetti ────────────────
      if (currentState === 'celebrating') {
        for (let i = 0; i < 3; i++) {
          const fx = cx + (Math.random() - 0.5) * displaySize * 0.8;
          const fy = cy + (Math.random() - 0.5) * displaySize * 0.8;
          const fs = 1 + Math.random() * 3;
          const hue = Math.random() * 360;
          ctx.fillStyle = `hsla(${hue},80%,60%,${0.5 + Math.random() * 0.5})`;
          ctx.fillRect(fx, fy, fs, fs * 2);
        }
      }

      // ─── 15. Thinking dots ───────────────────────
      if (currentState === 'thinking') {
        const dotCount = 3;
        const dotY = cy + actualCoreR * 2.8 + displaySize * 0.07;
        for (let i = 0; i < dotCount; i++) {
          const phase = (t * 2 + i * 0.7) % 3;
          const alpha = Math.max(0, 1 - phase / 1.5) * 0.6;
          const dotX = cx + (i - 1) * displaySize * 0.025;
          ctx.beginPath();
          ctx.arc(dotX, dotY, 2, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${R},${G},${B},${alpha})`;
          ctx.fill();
        }
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [size, interactive, showLabel, agentState, waveCount, totalImprovements, initParticles, initNodes, parseColor, lerpColor]);

  return (
    <canvas
      ref={canvasRef}
      onMouseMove={handleMouseMove}
      className="select-none"
      style={{ width: size, height: size }}
    />
  );
}