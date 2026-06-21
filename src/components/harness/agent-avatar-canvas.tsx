'use client';

import React, { useRef, useEffect, useCallback } from 'react';
import { useAgentLiveStore } from '@/store/agent-live-store';

/* ═══════════════════════════════════════════════════════════════════════
   2D CANVAS AVATAR — Immersive "Mind's Eye" Version (W228 → W229)
   
   Full-bleed canvas that fills the Agent Live panel.
   Character drawn 2.5x larger. ResizeObserver keeps canvas sized correctly.
   State-reactive background effects (all 10 states):
   - idle: gentle amber pulse
   - thinking: cyan brain-wave ripples
   - searching: orange radar sweep
   - planning: violet rotating hex grid
   - executing: rose energy surge lines
   - verifying: green ascending checkmarks
   - celebrating: golden expanding rings
   - error: red pulse warnings
   - evolving: fuchsia spiral patterns
   - offline: dim gray static
   
   CRT scanline overlay + intensified vignette for terminal feel.
   Zero heavy dependencies — pure Canvas 2D + requestAnimationFrame.
   ═══════════════════════════════════════════════════════════════════════ */

const STATE_COLORS: Record<string, string> = {
  idle: '#f59e0b', thinking: '#06b6d4', searching: '#f97316',
  planning: '#a855f7', executing: '#f43f5e', verifying: '#22c55e',
  celebrating: '#eab308', error: '#dc2626', evolving: '#d946ef', offline: '#71717a',
};

// RGBA base for each state (used for gradients / glow effects)
const STATE_RGBA: Record<string, [number, number, number]> = {
  idle: [245, 158, 11], thinking: [6, 182, 212], searching: [249, 115, 22],
  planning: [168, 85, 247], executing: [244, 63, 94], verifying: [34, 197, 94],
  celebrating: [234, 179, 8], error: [220, 38, 38], evolving: [217, 70, 239], offline: [113, 113, 122],
};

function rgba(state: string, a: number): string {
  const [r, g, b] = STATE_RGBA[state] || STATE_RGBA.idle;
  return `rgba(${r},${g},${b},${a})`;
}

export function AgentAvatarCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0.5, y: 0.5 });
  const rafRef = useRef<number>(0);
  const prevTimeRef = useRef(0);
  const blinkTimer = useRef(0);
  const nextBlink = useRef(3 + Math.random() * 2);
  const isBlinking = useRef(false);
  const prevStateRef = useRef<string>('idle');
  const stateChangeTime = useRef(0);

  const agentState = useAgentLiveStore(s => s.agentState);
  const stateRef = useRef(agentState);
  useEffect(() => {
    if (stateRef.current !== agentState) {
      prevStateRef.current = stateRef.current;
      stateChangeTime.current = performance.now();
    }
    stateRef.current = agentState;
  }, [agentState]);

  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mouseRef.current.x = (e.clientX - rect.left) / rect.width;
    mouseRef.current.y = (e.clientY - rect.top) / rect.height;
  }, []);

  // Mutable refs for layout values that ResizeObserver updates
  const layoutRef = useRef({ W: 800, H: 600, cx: 400, cy: 252, SCALE: 2.2, dpr: 1 });

  // Character personality: look-around state (plain mutable objects, not hooks)
  const lookTarget = useRef({ x: 0.5, y: 0.5 });
  const lookCurrent = useRef({ x: 0.5, y: 0.5 });
  const nextLookTime = useRef(5000 + Math.random() * 3000);
  const lookTimer = useRef(0);
  const headTilt = useRef(0);
  const headTiltTarget = useRef(0);
  const nextPulseTime = useRef(4000 + Math.random() * 2000);
  const pulseTimer = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current!;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    // ctx is asserted non-null; getContext('2d') only returns null for unsupported contexts

    // ─── ResizeObserver: keep canvas pixel-perfect on resize ───
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    layoutRef.current.dpr = dpr;

    function resize() {
      const rect = canvas.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      layoutRef.current.W = w;
      layoutRef.current.H = h;
      layoutRef.current.cx = w / 2;
      layoutRef.current.cy = h * 0.42;
      layoutRef.current.SCALE = Math.min(w / 500, h / 600) * 2.2;
    }

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    // Read layout from ref (updated by ResizeObserver)
    let { W, H, cx, cy, SCALE } = layoutRef.current;

    // ─── Data Rain (ambient vertical character streams) ───
    const DATA_RAIN_CHARS = ['0','1','{','}','[',']','<','>','/','+','-','=','*'];
    const dataRainDrops: Array<{ x: number; y: number; speed: number; char: string; alpha: number }> = [];
    const RAIN_COLS = 25;
    for (let c = 0; c < RAIN_COLS; c++) {
      if (Math.random() < 0.4) {
        dataRainDrops.push({
          x: (c / RAIN_COLS) * W + Math.random() * (W / RAIN_COLS),
          y: Math.random() * H,
          speed: 0.3 + Math.random() * 0.8,
          char: DATA_RAIN_CHARS[Math.floor(Math.random() * DATA_RAIN_CHARS.length)],
          alpha: 0.03 + Math.random() * 0.06,
        });
      }
    }

    // ─── Heartbeat pulse rings (plain array, timer in component-level ref) ───
    const pulseRings: Array<{ radius: number; alpha: number }> = [];

    // ─── Particles (60 floating dots) ───
    const particles = Array.from({ length: 60 }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      speed: 0.15 + Math.random() * 0.5,
      offset: Math.random() * Math.PI * 2,
      size: 0.6 + Math.random() * 2.5,
      alpha: 0.1 + Math.random() * 0.3,
    }));

    // ─── Energy ring particles (12 on elliptical orbit) ───
    const ringParticles = Array.from({ length: 12 }, (_, i) => ({
      angle: (Math.PI * 2 * i) / 12,
      radiusX: (55 + Math.random() * 20) * SCALE * 0.5,
      radiusY: (18 + Math.random() * 10) * SCALE * 0.5,
      speed: 0.0004 + Math.random() * 0.0006,
      size: (1.2 + Math.random() * 1.8) * SCALE * 0.5,
      yOff: cy + 8 * SCALE * 0.5,
      trail: [] as Array<{ x: number; y: number; a: number }>,
    }));

    // ─── State-transition burst particles ───
    const burstParticles: Array<{
      x: number; y: number; vx: number; vy: number;
      life: number; maxLife: number; size: number; color: string;
    }> = [];

    function spawnBurst(color: string, count: number) {
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 1.5 + Math.random() * 4;
        burstParticles.push({
          x: cx, y: cy,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 1, maxLife: 0.6 + Math.random() * 0.8,
          size: 1.5 + Math.random() * 3,
          color,
        });
      }
    }

    // ─── Wave rings (expanding circles on state change) ───
    const waveRings: Array<{ x: number; y: number; radius: number; maxRadius: number; alpha: number; color: string }> = [];

    function spawnWaveRing(color: string) {
      waveRings.push({
        x: cx, y: cy, radius: 10 * SCALE, maxRadius: Math.max(W, H) * 0.6,
        alpha: 0.4, color,
      });
    }

    // ─── MAIN DRAW LOOP ───
    function draw(t: number) {
      const dt = Math.min((t - prevTimeRef.current) / 1000, 0.1);
      prevTimeRef.current = t;

      const state = stateRef.current;
      const color = STATE_COLORS[state] || STATE_COLORS.idle;

      // ─── Check for state change → spawn effects ───
      const timeSinceChange = (t - stateChangeTime.current) / 1000;
      if (timeSinceChange < 0.1 && timeSinceChange > 0) {
        spawnBurst(color, 25);
        spawnWaveRing(color);
      }

      // ════════════════════════════════════════════════════
      // BACKGROUND
      // ════════════════════════════════════════════════════
      // Base dark gradient
      const bgGrd = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(W, H) * 0.7);
      bgGrd.addColorStop(0, '#0a0f0d');
      bgGrd.addColorStop(0.5, '#060b08');
      bgGrd.addColorStop(1, '#030504');
      ctx.fillStyle = bgGrd;
      ctx.fillRect(0, 0, W, H);

      // State-reactive ambient glow (big soft light behind character)
      const ambGrd = ctx.createRadialGradient(cx, cy, 0, cx, cy, 200 * SCALE);
      ambGrd.addColorStop(0, rgba(state, 0.12 + Math.sin(t * 0.001) * 0.04));
      ambGrd.addColorStop(0.4, rgba(state, 0.05));
      ambGrd.addColorStop(1, 'transparent');
      ctx.fillStyle = ambGrd;
      ctx.fillRect(0, 0, W, H);

      // ─── STATE-SPECIFIC BACKGROUND EFFECTS ───

      // THINKING: concentric brain-wave ripples
      if (state === 'thinking') {
        for (let i = 0; i < 4; i++) {
          const phase = (t * 0.001 + i * 1.5) % 6;
          const r = phase * 40 * SCALE * 0.5;
          const a = Math.max(0, 0.15 - phase * 0.025);
          ctx.beginPath();
          ctx.arc(cx, cy, r, 0, Math.PI * 2);
          ctx.strokeStyle = rgba('thinking', a);
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }
      }

      // SEARCHING: radar sweep line
      if (state === 'searching') {
        const sweepAngle = t * 0.003;
        const sweepR = 100 * SCALE * 0.5;
        // Sweep cone
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, sweepR, sweepAngle - 0.5, sweepAngle, false);
        ctx.closePath();
        const sweepGrd = ctx.createRadialGradient(cx, cy, 0, cx, cy, sweepR);
        sweepGrd.addColorStop(0, rgba('searching', 0.15));
        sweepGrd.addColorStop(1, rgba('searching', 0.02));
        ctx.fillStyle = sweepGrd;
        ctx.fill();
        // Range rings
        for (let i = 1; i <= 3; i++) {
          ctx.beginPath();
          ctx.arc(cx, cy, sweepR * (i / 3), 0, Math.PI * 2);
          ctx.strokeStyle = rgba('searching', 0.08);
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
        // Sweep line
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + Math.cos(sweepAngle) * sweepR, cy + Math.sin(sweepAngle) * sweepR);
        ctx.strokeStyle = rgba('searching', 0.4);
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      // EXECUTING: energy surge lines
      if (state === 'executing') {
        for (let i = 0; i < 6; i++) {
          const angle = (Math.PI * 2 * i / 6) + t * 0.002;
          const innerR = 30 * SCALE;
          const outerR = (80 + Math.sin(t * 0.005 + i) * 20) * SCALE * 0.5;
          ctx.beginPath();
          ctx.moveTo(cx + Math.cos(angle) * innerR, cy + Math.sin(angle) * innerR);
          ctx.lineTo(cx + Math.cos(angle) * outerR, cy + Math.sin(angle) * outerR);
          ctx.strokeStyle = rgba('executing', 0.2 + Math.sin(t * 0.01 + i * 0.5) * 0.1);
          ctx.lineWidth = 2 + Math.sin(t * 0.008 + i) * 1;
          ctx.stroke();
        }
      }

      // VERIFYING: ascending checkmark cascade
      if (state === 'verifying') {
        const checkCount = 5;
        for (let i = 0; i < checkCount; i++) {
          const phase = ((t * 0.0008 + i * 0.4) % 2) / 2; // 0→1 cycle
          const checkY = cy + 40 * SCALE * 0.5 - phase * 80 * SCALE * 0.5;
          const checkAlpha = Math.max(0, 0.3 * (1 - phase));
          const checkSize = (6 + phase * 4) * SCALE * 0.3;
          ctx.save();
          ctx.translate(cx - 40 * SCALE * 0.5 + i * 20 * SCALE * 0.5, checkY);
          ctx.strokeStyle = rgba('verifying', checkAlpha);
          ctx.lineWidth = 2;
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';
          ctx.beginPath();
          ctx.moveTo(-checkSize * 0.5, 0);
          ctx.lineTo(-checkSize * 0.1, checkSize * 0.4);
          ctx.lineTo(checkSize * 0.5, -checkSize * 0.3);
          ctx.stroke();
          ctx.restore();
        }
      }

      // CELEBRATING: expanding golden rings
      if (state === 'celebrating') {
        for (let i = 0; i < 3; i++) {
          const phase = ((t * 0.001 + i * 2) % 4) / 4;
          const r = phase * 150 * SCALE * 0.5;
          const a = Math.max(0, 0.25 * (1 - phase));
          ctx.beginPath();
          ctx.arc(cx, cy, r, 0, Math.PI * 2);
          ctx.strokeStyle = rgba('celebrating', a);
          ctx.lineWidth = 2;
          ctx.stroke();
        }
      }

      // ERROR: red warning pulses
      if (state === 'error') {
        const pulse = Math.sin(t * 0.008) * 0.5 + 0.5;
        const errGrd = ctx.createRadialGradient(cx, cy, 0, cx, cy, 120 * SCALE);
        errGrd.addColorStop(0, rgba('error', 0.15 * pulse));
        errGrd.addColorStop(1, 'transparent');
        ctx.fillStyle = errGrd;
        ctx.fillRect(0, 0, W, H);
      }

      // EVOLVING: spiral pattern
      if (state === 'evolving') {
        ctx.beginPath();
        for (let a = 0; a < Math.PI * 6; a += 0.05) {
          const r = a * 8 * SCALE * 0.15;
          const x = cx + Math.cos(a + t * 0.001) * r;
          const y = cy + Math.sin(a + t * 0.001) * r;
          if (a === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = rgba('evolving', 0.12);
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      // PLANNING: rotating hex grid (faint)
      if (state === 'planning') {
        const hexR = 25 * SCALE * 0.5;
        const rot = t * 0.0005;
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(rot);
        ctx.strokeStyle = rgba('planning', 0.08);
        ctx.lineWidth = 0.8;
        for (let row = -3; row <= 3; row++) {
          for (let col = -3; col <= 3; col++) {
            const hx = col * hexR * 1.8 + (row % 2) * hexR * 0.9;
            const hy = row * hexR * 1.55;
            drawHex(ctx, hx, hy, hexR * 0.8);
          }
        }
        ctx.restore();
      }

      // OFFLINE: dim gray static noise
      if (state === 'offline') {
        for (let i = 0; i < 40; i++) {
          const nx = Math.random() * W;
          const ny = Math.random() * H;
          ctx.fillStyle = `rgba(113,113,122,${Math.random() * 0.1})`;
          ctx.fillRect(nx, ny, 2 + Math.random() * 4, 1);
        }
      }

      // ════════════════════════════════════════════════════
      // DATA RAIN (ambient terminal feel)
      // ════════════════════════════════════════════════════
      ctx.font = `${Math.round(10 * SCALE * 0.3)}px monospace`;
      ctx.textAlign = 'center';
      for (const drop of dataRainDrops) {
        drop.y += drop.speed;
        if (drop.y > H + 20) {
          drop.y = -20;
          drop.char = DATA_RAIN_CHARS[Math.floor(Math.random() * DATA_RAIN_CHARS.length)];
        }
        // Occasional character change
        if (Math.random() < 0.005) {
          drop.char = DATA_RAIN_CHARS[Math.floor(Math.random() * DATA_RAIN_CHARS.length)];
        }
        const [dr, dg, db] = STATE_RGBA[state] || STATE_RGBA.idle;
        ctx.fillStyle = `rgba(${dr},${dg},${db},${drop.alpha})`;
        ctx.fillText(drop.char, drop.x, drop.y);
      }

      // ════════════════════════════════════════════════════
      // HEARTBEAT PULSE RINGS
      // ════════════════════════════════════════════════════
      pulseTimer.current += dt * 1000;
      if (pulseTimer.current > nextPulseTime.current) {
        pulseRings.push({ radius: 15 * SCALE * 0.5, alpha: 0.2 });
        pulseTimer.current = 0;
        nextPulseTime.current = 4000 + Math.random() * 2000;
      }
      for (let i = pulseRings.length - 1; i >= 0; i--) {
        const pr = pulseRings[i];
        pr.radius += dt * 60 * SCALE * 0.5;
        pr.alpha *= 0.985;
        if (pr.alpha < 0.005) { pulseRings.splice(i, 1); continue; }
        ctx.beginPath();
        ctx.arc(cx, cy + 5, pr.radius, 0, Math.PI * 2);
        ctx.strokeStyle = rgba(state, pr.alpha);
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // ════════════════════════════════════════════════════
      // GRID (very subtle)
      // ════════════════════════════════════════════════════
      ctx.strokeStyle = 'rgba(26, 58, 42, 0.15)';
      ctx.lineWidth = 0.5;
      const gridSize = 40;
      for (let x = gridSize; x < W; x += gridSize) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
      }
      for (let y = gridSize; y < H; y += gridSize) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
      }

      // ════════════════════════════════════════════════════
      // PARTICLES
      // ════════════════════════════════════════════════════
      for (const p of particles) {
        p.x += Math.sin(t * 0.001 * p.speed + p.offset) * 0.4;
        p.y += Math.cos(t * 0.0007 * p.speed + p.offset) * 0.4;
        if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
        if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;
        // Tint particles with state color
        const [pr, pg, pb] = STATE_RGBA[state] || STATE_RGBA.idle;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${pr},${pg},${pb},${p.alpha * 0.6})`;
        ctx.fill();
        // White core
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 0.4, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${p.alpha * 0.3})`;
        ctx.fill();
      }

      // ════════════════════════════════════════════════════
      // ENERGY RING (orbiting particles with trails)
      // ════════════════════════════════════════════════════
      const ringAlpha = 0.15 + Math.sin(t * 0.001) * 0.08;
      ctx.strokeStyle = rgba(state, ringAlpha);
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.ellipse(cx, cy + 8 * SCALE * 0.5, 65 * SCALE * 0.5, 22 * SCALE * 0.5, 0, 0, Math.PI * 2);
      ctx.stroke();

      // Second ring (tilted)
      ctx.strokeStyle = rgba(state, ringAlpha * 0.5);
      ctx.beginPath();
      ctx.ellipse(cx, cy, 80 * SCALE * 0.5, 15 * SCALE * 0.5, 0.3, 0, Math.PI * 2);
      ctx.stroke();

      for (const rp of ringParticles) {
        rp.angle += rp.speed * (t % 100000);
        const rx = cx + Math.cos(rp.angle) * rp.radiusX;
        const ry = rp.yOff + Math.sin(rp.angle) * rp.radiusY;
        // Store trail
        rp.trail.push({ x: rx, y: ry, a: 0.6 });
        if (rp.trail.length > 8) rp.trail.shift();
        // Draw trail
        for (let ti = 0; ti < rp.trail.length; ti++) {
          const tp = rp.trail[ti];
          tp.a *= 0.85;
          ctx.beginPath();
          ctx.arc(tp.x, tp.y, rp.size * (ti / rp.trail.length) * 0.7, 0, Math.PI * 2);
          ctx.fillStyle = rgba(state, tp.a * 0.3);
          ctx.fill();
        }
        // Main dot
        ctx.beginPath();
        ctx.arc(rx, ry, rp.size, 0, Math.PI * 2);
        ctx.fillStyle = rgba(state, 0.7);
        ctx.fill();
        // Glow
        const rpGrd = ctx.createRadialGradient(rx, ry, 0, rx, ry, rp.size * 4);
        rpGrd.addColorStop(0, rgba(state, 0.3));
        rpGrd.addColorStop(1, 'transparent');
        ctx.fillStyle = rpGrd;
        ctx.fillRect(rx - rp.size * 4, ry - rp.size * 4, rp.size * 8, rp.size * 8);
      }

      // ════════════════════════════════════════════════════
      // WAVE RINGS (expanding from state change)
      // ════════════════════════════════════════════════════
      for (let i = waveRings.length - 1; i >= 0; i--) {
        const wr = waveRings[i];
        wr.radius += dt * 200 * SCALE * 0.5;
        wr.alpha *= 0.97;
        if (wr.radius > wr.maxRadius || wr.alpha < 0.01) {
          waveRings.splice(i, 1);
          continue;
        }
        ctx.beginPath();
        ctx.arc(wr.x, wr.y, wr.radius, 0, Math.PI * 2);
        ctx.strokeStyle = rgba(state, wr.alpha);
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      // ════════════════════════════════════════════════════
      // BURST PARTICLES (from state change)
      // ════════════════════════════════════════════════════
      for (let i = burstParticles.length - 1; i >= 0; i--) {
        const bp = burstParticles[i];
        bp.x += bp.vx;
        bp.y += bp.vy;
        bp.vx *= 0.97;
        bp.vy *= 0.97;
        bp.life -= dt / bp.maxLife;
        if (bp.life <= 0) {
          burstParticles.splice(i, 1);
          continue;
        }
        const a = bp.life;
        ctx.beginPath();
        ctx.arc(bp.x, bp.y, bp.size * a, 0, Math.PI * 2);
        ctx.fillStyle = rgba(state, a * 0.8);
        ctx.fill();
      }

      // ════════════════════════════════════════════════════
      // STATION MARKERS (repositioned for bigger canvas)
      // ════════════════════════════════════════════════════
      const stations = [
        { x: cx - 130 * SCALE * 0.5, y: cy - 100 * SCALE * 0.5, label: 'LIBRARY', c: '#06b6d4' },
        { x: cx + 130 * SCALE * 0.5, y: cy - 100 * SCALE * 0.5, label: 'OBSERV.', c: '#f97316' },
        { x: cx, y: cy - 150 * SCALE * 0.5, label: 'MAP', c: '#a855f7' },
        { x: cx + 150 * SCALE * 0.5, y: cy + 50 * SCALE * 0.5, label: 'WORKSHOP', c: '#f43f5e' },
        { x: cx - 150 * SCALE * 0.5, y: cy + 50 * SCALE * 0.5, label: 'LAB', c: '#22c55e' },
        { x: cx, y: cy + 120 * SCALE * 0.5, label: 'PLAZA', c: '#eab308' },
      ];

      ctx.setLineDash([3, 6]);
      ctx.lineWidth = 0.5;
      for (const s of stations) {
        const lineAlpha = 0.06 + Math.sin(t * 0.002 + s.x * 0.01) * 0.03;
        ctx.strokeStyle = s.c + Math.round(lineAlpha * 255).toString(16).padStart(2, '0');
        ctx.beginPath();
        ctx.moveTo(cx, cy + 5);
        ctx.lineTo(s.x, s.y);
        ctx.stroke();
      }
      ctx.setLineDash([]);

      for (const s of stations) {
        const pulse = 1 + Math.sin(t * 0.004 + s.x * 0.02) * 0.3;
        const sgrd = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, 10 * pulse);
        sgrd.addColorStop(0, s.c + '25');
        sgrd.addColorStop(1, 'transparent');
        ctx.fillStyle = sgrd;
        ctx.fillRect(s.x - 12, s.y - 12, 24, 24);
        ctx.fillStyle = s.c + '80';
        ctx.beginPath(); ctx.arc(s.x, s.y, 3 * pulse, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = s.c + '80';
        ctx.font = `600 ${Math.round(8 * SCALE * 0.6)}px monospace`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText(s.label, s.x, s.y + 8);
      }

      // ════════════════════════════════════════════════════
      // GROUND GLOW + ENERGY AURA
      // ════════════════════════════════════════════════════
      const groundGrd = ctx.createRadialGradient(cx, cy + 65 * SCALE * 0.5, 5, cx, cy + 65 * SCALE * 0.5, 60 * SCALE * 0.5);
      groundGrd.addColorStop(0, rgba(state, 0.25));
      groundGrd.addColorStop(1, 'transparent');
      ctx.fillStyle = groundGrd;
      ctx.fillRect(cx - 80 * SCALE * 0.5, cy + 20 * SCALE * 0.5, 160 * SCALE * 0.5, 100 * SCALE * 0.5);

      // Energy aura around character (pulsing)
      const auraSize = (50 + Math.sin(t * 0.002) * 10) * SCALE * 0.5;
      const auraGrd = ctx.createRadialGradient(cx, cy, 10 * SCALE * 0.5, cx, cy, auraSize);
      auraGrd.addColorStop(0, rgba(state, 0.08 + Math.sin(t * 0.003) * 0.04));
      auraGrd.addColorStop(0.7, rgba(state, 0.02));
      auraGrd.addColorStop(1, 'transparent');
      ctx.fillStyle = auraGrd;
      ctx.beginPath();
      ctx.arc(cx, cy, auraSize, 0, Math.PI * 2);
      ctx.fill();

      // ════════════════════════════════════════════════════
      // CHARACTER (2.5x bigger)
      // ════════════════════════════════════════════════════
      const breathe = Math.sin(t * 0.003) * 2.5 * SCALE * 0.5;
      const headY = cy - 35 * SCALE * 0.5 + breathe;
      const bodyY = cy + 5 * SCALE * 0.5 + breathe * 0.5;

      // Body
      ctx.fillStyle = color;
      roundRect(ctx, cx - 22 * SCALE * 0.5, bodyY - 20 * SCALE * 0.5, 44 * SCALE * 0.5, 48 * SCALE * 0.5, 8 * SCALE * 0.5);
      ctx.fill();

      // Belt
      ctx.fillStyle = '#3a3a3a';
      ctx.fillRect(cx - 23 * SCALE * 0.5, bodyY + 18 * SCALE * 0.5, 46 * SCALE * 0.5, 4 * SCALE * 0.5);

      // Scarf
      ctx.fillStyle = color + 'CC';
      roundRect(ctx, cx - 16 * SCALE * 0.5, bodyY - 26 * SCALE * 0.5, 32 * SCALE * 0.5, 8 * SCALE * 0.5, 3 * SCALE * 0.5);
      ctx.fill();

      // Arms
      const armSwing = state === 'executing' ? Math.sin(t * 0.008) * 18 :
                       state === 'celebrating' ? -45 + Math.sin(t * 0.012) * 12 :
                       state === 'thinking' ? 8 :
                       state === 'error' ? -35 + Math.sin(t * 0.02) * 8 :
                       Math.sin(t * 0.002) * 4;

      ctx.save();
      ctx.translate(cx - 25 * SCALE * 0.5, bodyY - 14 * SCALE * 0.5);
      ctx.rotate((15 + armSwing) * Math.PI / 180);
      ctx.fillStyle = '#FFD5B8';
      roundRect(ctx, -5 * SCALE * 0.5, 0, 10 * SCALE * 0.5, 35 * SCALE * 0.5, 5 * SCALE * 0.5);
      ctx.fill();
      ctx.restore();

      ctx.save();
      ctx.translate(cx + 25 * SCALE * 0.5, bodyY - 14 * SCALE * 0.5);
      ctx.rotate((-15 - armSwing) * Math.PI / 180);
      ctx.fillStyle = '#FFD5B8';
      roundRect(ctx, -5 * SCALE * 0.5, 0, 10 * SCALE * 0.5, 35 * SCALE * 0.5, 5 * SCALE * 0.5);
      ctx.fill();
      ctx.restore();

      // Legs
      const legSwing = Math.sin(t * 0.005) * 4;
      ctx.fillStyle = '#37474F';
      roundRect(ctx, cx - 14 * SCALE * 0.5 + legSwing, bodyY + 22 * SCALE * 0.5, 12 * SCALE * 0.5, 30 * SCALE * 0.5, 4 * SCALE * 0.5);
      ctx.fill();
      roundRect(ctx, cx + 2 * SCALE * 0.5 - legSwing, bodyY + 22 * SCALE * 0.5, 12 * SCALE * 0.5, 30 * SCALE * 0.5, 4 * SCALE * 0.5);
      ctx.fill();

      // Shoes
      ctx.fillStyle = '#5D4037';
      ctx.fillRect(cx - 16 * SCALE * 0.5 + legSwing, bodyY + 48 * SCALE * 0.5, 16 * SCALE * 0.5, 5 * SCALE * 0.5);
      ctx.fillRect(cx, bodyY + 48 * SCALE * 0.5 - legSwing, 16 * SCALE * 0.5, 5 * SCALE * 0.5);

      // Head (with subtle tilt)
      ctx.save();
      ctx.translate(cx, headY);
      ctx.rotate(headTilt.current * Math.PI / 180);
      ctx.fillStyle = '#FFD5B8';
      ctx.beginPath();
      ctx.arc(0, 0, 32 * SCALE * 0.5, 0, Math.PI * 2);
      ctx.fill();

      // Hair
      ctx.fillStyle = '#4A3728';
      ctx.beginPath();
      ctx.arc(0, -5 * SCALE * 0.5, 34 * SCALE * 0.5, Math.PI, 0);
      ctx.fill();
      ctx.fillRect(cx - 25 * SCALE * 0.5, headY - 18 * SCALE * 0.5, 50 * SCALE * 0.5, 10 * SCALE * 0.5);

      // Blink
      blinkTimer.current += dt;
      if (blinkTimer.current > nextBlink.current) {
        isBlinking.current = true;
        if (blinkTimer.current > nextBlink.current + 0.15) {
          isBlinking.current = false;
          blinkTimer.current = 0;
          nextBlink.current = 3 + Math.random() * 2;
        }
      }

      // ── Character personality: look-around ──
      lookTimer.current += dt * 1000;
      if (lookTimer.current > nextLookTime.current) {
        lookTarget.current = {
          x: 0.3 + Math.random() * 0.4,
          y: 0.35 + Math.random() * 0.3,
        };
        headTiltTarget.current = (Math.random() - 0.5) * 6; // -3 to +3 degrees
        nextLookTime.current = 5000 + Math.random() * 3000;
        lookTimer.current = 0;
      }
      // Smooth interpolation toward look target
      lookCurrent.current.x += (lookTarget.current.x - lookCurrent.current.x) * dt * 2;
      lookCurrent.current.y += (lookTarget.current.y - lookCurrent.current.y) * dt * 2;
      headTilt.current += (headTiltTarget.current - headTilt.current) * dt * 3;

      // If mouse is moving, override look target with mouse position
      const mouseActive = Math.abs(mouseRef.current.x - 0.5) > 0.05 || Math.abs(mouseRef.current.y - 0.5) > 0.05;
      const lookX = mouseActive ? mouseRef.current.x : lookCurrent.current.x;
      const lookY = mouseActive ? mouseRef.current.y : lookCurrent.current.y;

      // Eyes (with tracking — mouse or auto-look)
      const mx = (lookX - 0.5) * 5;
      const my = (lookY - 0.5) * 3;

      const eyeScale = SCALE * 0.5;
      if (!isBlinking.current) {
        ctx.fillStyle = '#fff';
        ctx.beginPath(); ctx.ellipse(-12 * eyeScale, 2 * eyeScale, 8 * eyeScale, 9 * eyeScale, 0, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.ellipse(12 * eyeScale, 2 * eyeScale, 8 * eyeScale, 9 * eyeScale, 0, 0, Math.PI * 2); ctx.fill();
        // Pupils
        ctx.fillStyle = '#1a1a2e';
        ctx.beginPath(); ctx.arc(-12 * eyeScale + mx, 2 * eyeScale + my, 4.5 * eyeScale, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(12 * eyeScale + mx, 2 * eyeScale + my, 4.5 * eyeScale, 0, Math.PI * 2); ctx.fill();
        // Highlights
        ctx.fillStyle = '#fff';
        ctx.beginPath(); ctx.arc(-10 * eyeScale + mx, -1 * eyeScale + my, 2 * eyeScale, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(14 * eyeScale + mx, -1 * eyeScale + my, 2 * eyeScale, 0, Math.PI * 2); ctx.fill();
        // State-tinted eye glow
        const eyeGlow = ctx.createRadialGradient(0, 2 * eyeScale, 0, 0, 2 * eyeScale, 20 * eyeScale);
        eyeGlow.addColorStop(0, rgba(state, 0.06));
        eyeGlow.addColorStop(1, 'transparent');
        ctx.fillStyle = eyeGlow;
        ctx.fillRect(-25 * eyeScale, -20 * eyeScale, 50 * eyeScale, 40 * eyeScale);
      } else {
        ctx.strokeStyle = '#1a1a2e';
        ctx.lineWidth = 2 * eyeScale;
        ctx.beginPath(); ctx.moveTo(-18 * eyeScale, 2 * eyeScale); ctx.lineTo(-6 * eyeScale, 2 * eyeScale); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(6 * eyeScale, 2 * eyeScale); ctx.lineTo(18 * eyeScale, 2 * eyeScale); ctx.stroke();
      }

      // Blush
      if (state === 'celebrating' || state === 'thinking') {
        ctx.fillStyle = 'rgba(255, 153, 153, 0.35)';
        ctx.beginPath(); ctx.ellipse(-22 * eyeScale, 8 * eyeScale, 6 * eyeScale, 4 * eyeScale, 0, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.ellipse(22 * eyeScale, 8 * eyeScale, 6 * eyeScale, 4 * eyeScale, 0, 0, Math.PI * 2); ctx.fill();
      }

      // Mouth
      ctx.fillStyle = state === 'error' ? '#cc4444' : state === 'celebrating' ? '#dd8844' : '#cc6666';
      const mouthW = (state === 'error' ? 6 : state === 'celebrating' ? 5 : 4) * eyeScale;
      const mouthH = (state === 'error' ? 2 : state === 'celebrating' ? 5 : 3) * eyeScale;
      ctx.beginPath();
      ctx.ellipse(0, 15 * eyeScale, mouthW, mouthH, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore(); // Restore from head tilt transform
      ctx.fill();

      // ════════════════════════════════════════════════════
      // FLOATING ORB with trail (follows head tilt slightly)
      // ════════════════════════════════════════════════════
      const orbAngle = t * 0.002;
      const orbX = cx + Math.sin(orbAngle) * 50 * SCALE * 0.5 + headTilt.current * 0.3;
      const orbY = headY - 35 * SCALE * 0.5 + Math.cos(t * 0.003) * 12;
      const orbSize = (7 + Math.sin(t * 0.006) * 2.5) * SCALE * 0.5;

      // Trail (4 ghost orbs)
      for (let ti = 1; ti <= 4; ti++) {
        const trailAngle = orbAngle - ti * 0.18;
        const tx = cx + Math.sin(trailAngle) * 50 * SCALE * 0.5;
        const ty = headY - 35 * SCALE * 0.5 + Math.cos(t * 0.003 - ti * 0.12) * 12;
        const tAlpha = 0.2 / ti;
        ctx.fillStyle = rgba(state, tAlpha);
        ctx.beginPath(); ctx.arc(tx, ty, orbSize * (1 - ti * 0.12), 0, Math.PI * 2); ctx.fill();
      }

      // Main orb glow
      const orbGrd = ctx.createRadialGradient(orbX, orbY, 0, orbX, orbY, orbSize * 4);
      orbGrd.addColorStop(0, rgba(state, 0.7));
      orbGrd.addColorStop(0.3, rgba(state, 0.25));
      orbGrd.addColorStop(1, 'transparent');
      ctx.fillStyle = orbGrd;
      ctx.fillRect(orbX - orbSize * 4, orbY - orbSize * 4, orbSize * 8, orbSize * 8);
      // Main orb core
      ctx.fillStyle = color;
      ctx.beginPath(); ctx.arc(orbX, orbY, orbSize, 0, Math.PI * 2); ctx.fill();
      // Highlight
      ctx.fillStyle = '#fff';
      ctx.beginPath(); ctx.arc(orbX - orbSize * 0.15, orbY - orbSize * 0.15, orbSize * 0.35, 0, Math.PI * 2); ctx.fill();

      // ════════════════════════════════════════════════════
      // VIGNETTE (intensified for W229)
      // ════════════════════════════════════════════════════
      const vigGrd = ctx.createRadialGradient(W / 2, H / 2, W * 0.15, W / 2, H / 2, W * 0.8);
      vigGrd.addColorStop(0, 'transparent');
      vigGrd.addColorStop(0.7, 'rgba(0,0,0,0.2)');
      vigGrd.addColorStop(1, 'rgba(0,0,0,0.65)');
      ctx.fillStyle = vigGrd;
      ctx.fillRect(0, 0, W, H);

      // ════════════════════════════════════════════════════
      // CRT SCANLINES (subtle terminal feel)
      // ════════════════════════════════════════════════════
      ctx.fillStyle = 'rgba(0,0,0,0.06)';
      const scanGap = 3;
      for (let sy = 0; sy < H; sy += scanGap) {
        ctx.fillRect(0, sy, W, 1);
      }

      // ════════════════════════════════════════════════════
      // READ LATEST LAYOUT (may have changed via ResizeObserver)
      // ════════════════════════════════════════════════════
      const latest = layoutRef.current;
      if (latest.W !== W || latest.H !== H) {
        W = latest.W; H = latest.H;
        cx = latest.cx; cy = latest.cy; SCALE = latest.SCALE;
        // Re-spread particles into new bounds
        for (const p of particles) {
          if (p.x > W) p.x = Math.random() * W;
          if (p.y > H) p.y = Math.random() * H;
        }
      }

      rafRef.current = requestAnimationFrame(draw);
    }

    rafRef.current = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(rafRef.current);
      ro.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      onPointerMove={handlePointerMove}
      className="absolute inset-0 w-full h-full cursor-crosshair"
      style={{ background: '#050a08' }}
    />
  );
}

/* ── Helpers ── */
function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function drawHex(ctx: CanvasRenderingContext2D, x: number, y: number, r: number) {
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i - Math.PI / 6;
    const px = x + r * Math.cos(angle);
    const py = y + r * Math.sin(angle);
    if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.stroke();
}