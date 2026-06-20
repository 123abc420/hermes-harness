'use client';

import React, { useRef, useEffect, useCallback } from 'react';
import { useAgentLiveStore } from '@/store/agent-live-store';

/* ═══════════════════════════════════════════════════════════════════════
   2D CANVAS AVATAR — lightweight replacement for Three.js (W227)
   Uses requestAnimationFrame + Canvas 2D API. Zero heavy dependencies.
   Draws a cute chibi character with state-reactive colors, eye tracking,
   idle breathing, walk cycle, and arrival flash effects.
   ═══════════════════════════════════════════════════════════════════════ */

const STATE_COLORS: Record<string, string> = {
  idle: '#6366f1', thinking: '#06b6d4', searching: '#f97316',
  planning: '#a855f7', executing: '#ef4444', verifying: '#22c55e',
  celebrating: '#eab308', error: '#dc2626', evolving: '#d946ef', offline: '#71717a',
};

export function AgentAvatarCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0.5, y: 0.5 });
  const rafRef = useRef<number>(0);
  const prevTimeRef = useRef(0);
  const blinkTimer = useRef(0);
  const nextBlink = useRef(3 + Math.random() * 2);
  const isBlinking = useRef(false);

  const agentState = useAgentLiveStore(s => s.agentState);
  const stateRef = useRef(agentState);
  useEffect(() => { stateRef.current = agentState; }, [agentState]);

  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mouseRef.current.x = (e.clientX - rect.left) / rect.width;
    mouseRef.current.y = (e.clientY - rect.top) / rect.height;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // High-DPI support
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    const W = rect.width;
    const H = rect.height;

    // Character center
    const cx = W / 2;
    const cy = H / 2 + 10;

    // Particles
    const particles = Array.from({ length: 30 }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      speed: 0.2 + Math.random() * 0.5,
      offset: Math.random() * Math.PI * 2,
      size: 1 + Math.random() * 2,
      alpha: 0.2 + Math.random() * 0.4,
    }));

    function draw(t: number) {
      const dt = Math.min((t - prevTimeRef.current) / 1000, 0.1);
      prevTimeRef.current = t;

      const state = stateRef.current;
      const color = STATE_COLORS[state] || STATE_COLORS.idle;

      // Background
      ctx.fillStyle = '#050a08';
      ctx.fillRect(0, 0, W, H);

      // Grid
      ctx.strokeStyle = 'rgba(26, 58, 42, 0.3)';
      ctx.lineWidth = 0.5;
      const gridSize = 30;
      for (let x = gridSize; x < W; x += gridSize) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
      }
      for (let y = gridSize; y < H; y += gridSize) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
      }

      // Particles
      for (const p of particles) {
        p.x += Math.sin(t * 0.001 * p.speed + p.offset) * 0.3;
        p.y += Math.cos(t * 0.0007 * p.speed + p.offset) * 0.3;
        if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
        if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(165, 243, 252, ${p.alpha})`;
        ctx.fill();
      }

      // Station markers
      const stations = [
        { x: cx - 80, y: cy - 60, label: 'LIBRARY', c: '#06b6d4' },
        { x: cx + 80, y: cy - 60, label: 'OBSERVATORY', c: '#f97316' },
        { x: cx, y: cy - 90, label: 'MAP', c: '#a855f7' },
        { x: cx + 90, y: cy + 30, label: 'WORKSHOP', c: '#ef4444' },
        { x: cx - 90, y: cy + 30, label: 'LAB', c: '#22c55e' },
        { x: cx, y: cy + 70, label: 'PLAZA', c: '#eab308' },
      ];
      for (const s of stations) {
        ctx.fillStyle = s.c + '40';
        ctx.beginPath(); ctx.arc(s.x, s.y, 3, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = s.c + '90';
        ctx.font = '7px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(s.label, s.x, s.y - 8);
      }

      // Ground glow
      const grd = ctx.createRadialGradient(cx, cy + 65, 5, cx, cy + 65, 50);
      grd.addColorStop(0, color + '40');
      grd.addColorStop(1, 'transparent');
      ctx.fillStyle = grd;
      ctx.fillRect(cx - 60, cy + 30, 120, 60);

      // ── CHARACTER ──
      const breathe = Math.sin(t * 0.003) * 2;
      const headY = cy - 35 + breathe;
      const bodyY = cy + 5 + breathe * 0.5;

      // Body
      ctx.fillStyle = color;
      roundRect(ctx, cx - 22, bodyY - 20, 44, 48, 8);
      ctx.fill();

      // Belt
      ctx.fillStyle = '#3a3a3a';
      ctx.fillRect(cx - 23, bodyY + 18, 46, 4);

      // Scarf
      ctx.fillStyle = color + 'CC';
      roundRect(ctx, cx - 16, bodyY - 26, 32, 8, 3);
      ctx.fill();

      // Arms
      const armSwing = state === 'executing' ? Math.sin(t * 0.008) * 15 :
                       state === 'celebrating' ? -40 + Math.sin(t * 0.012) * 10 :
                       state === 'thinking' ? 5 :
                       state === 'error' ? -30 + Math.sin(t * 0.02) * 5 :
                       Math.sin(t * 0.002) * 3;

      // Left arm
      ctx.save();
      ctx.translate(cx - 25, bodyY - 14);
      ctx.rotate((15 + armSwing) * Math.PI / 180);
      ctx.fillStyle = '#FFD5B8';
      roundRect(ctx, -5, 0, 10, 35, 5);
      ctx.fill();
      ctx.restore();

      // Right arm
      ctx.save();
      ctx.translate(cx + 25, bodyY - 14);
      ctx.rotate((-15 - armSwing) * Math.PI / 180);
      ctx.fillStyle = '#FFD5B8';
      roundRect(ctx, -5, 0, 10, 35, 5);
      ctx.fill();
      ctx.restore();

      // Legs
      const legSwing = Math.sin(t * 0.005) * 3;
      ctx.fillStyle = '#37474F';
      roundRect(ctx, cx - 14 + legSwing, bodyY + 22, 12, 30, 4);
      ctx.fill();
      roundRect(ctx, cx + 2 - legSwing, bodyY + 22, 12, 30, 4);
      ctx.fill();

      // Shoes
      ctx.fillStyle = '#5D4037';
      ctx.fillRect(cx - 16 + legSwing, bodyY + 48, 16, 5);
      ctx.fillRect(cx, bodyY + 48 - legSwing, 16, 5);

      // Head
      ctx.fillStyle = '#FFD5B8';
      ctx.beginPath();
      ctx.arc(cx, headY, 32, 0, Math.PI * 2);
      ctx.fill();

      // Hair
      ctx.fillStyle = '#4A3728';
      ctx.beginPath();
      ctx.arc(cx, headY - 5, 34, Math.PI, 0);
      ctx.fill();
      // Bangs
      ctx.fillRect(cx - 25, headY - 18, 50, 10);

      // Blink logic
      blinkTimer.current += dt;
      if (blinkTimer.current > nextBlink.current) {
        isBlinking.current = true;
        if (blinkTimer.current > nextBlink.current + 0.15) {
          isBlinking.current = false;
          blinkTimer.current = 0;
          nextBlink.current = 3 + Math.random() * 2;
        }
      }

      // Eyes
      const mx = (mouseRef.current.x - 0.5) * 4;
      const my = (mouseRef.current.y - 0.5) * 2;

      if (!isBlinking.current) {
        // Eye whites
        ctx.fillStyle = '#fff';
        ctx.beginPath(); ctx.ellipse(cx - 12, headY + 2, 8, 9, 0, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.ellipse(cx + 12, headY + 2, 8, 9, 0, 0, Math.PI * 2); ctx.fill();
        // Pupils
        ctx.fillStyle = '#1a1a2e';
        ctx.beginPath(); ctx.arc(cx - 12 + mx, headY + 2 + my, 4.5, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(cx + 12 + mx, headY + 2 + my, 4.5, 0, Math.PI * 2); ctx.fill();
        // Highlights
        ctx.fillStyle = '#fff';
        ctx.beginPath(); ctx.arc(cx - 10 + mx, headY - 1 + my, 2, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(cx + 14 + mx, headY - 1 + my, 2, 0, Math.PI * 2); ctx.fill();
      } else {
        // Closed eyes
        ctx.strokeStyle = '#1a1a2e';
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(cx - 18, headY + 2); ctx.lineTo(cx - 6, headY + 2); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(cx + 6, headY + 2); ctx.lineTo(cx + 18, headY + 2); ctx.stroke();
      }

      // Blush
      if (state === 'celebrating' || state === 'thinking') {
        ctx.fillStyle = 'rgba(255, 153, 153, 0.35)';
        ctx.beginPath(); ctx.ellipse(cx - 22, headY + 8, 6, 4, 0, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.ellipse(cx + 22, headY + 8, 6, 4, 0, 0, Math.PI * 2); ctx.fill();
      }

      // Mouth
      ctx.fillStyle = '#cc6666';
      const mouthW = state === 'error' ? 6 : state === 'celebrating' ? 5 : 4;
      const mouthH = state === 'error' ? 2 : state === 'celebrating' ? 5 : 3;
      ctx.beginPath();
      ctx.ellipse(cx, headY + 15, mouthW, mouthH, 0, 0, Math.PI * 2);
      ctx.fill();

      // Floating orb
      const orbX = cx + Math.sin(t * 0.002) * 40;
      const orbY = headY - 30 + Math.cos(t * 0.003) * 10;
      const orbSize = 6 + Math.sin(t * 0.006) * 2;
      const orbGrd = ctx.createRadialGradient(orbX, orbY, 0, orbX, orbY, orbSize * 3);
      orbGrd.addColorStop(0, color + 'AA');
      orbGrd.addColorStop(0.3, color + '44');
      orbGrd.addColorStop(1, 'transparent');
      ctx.fillStyle = orbGrd;
      ctx.fillRect(orbX - orbSize * 3, orbY - orbSize * 3, orbSize * 6, orbSize * 6);
      ctx.fillStyle = color;
      ctx.beginPath(); ctx.arc(orbX, orbY, orbSize, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.beginPath(); ctx.arc(orbX - 1, orbY - 1, orbSize * 0.3, 0, Math.PI * 2); ctx.fill();

      rafRef.current = requestAnimationFrame(draw);
    }

    rafRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      onPointerMove={handlePointerMove}
      className="w-full aspect-square max-w-[560px] mx-auto rounded-2xl cursor-crosshair"
      style={{ background: '#050a08' }}
    />
  );
}

/* ── Helper: rounded rectangle ── */
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