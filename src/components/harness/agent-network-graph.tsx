'use client';

import { useState, useMemo, useRef, useCallback, useId } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePrefersReducedMotion } from '@/hooks/use-prefers-reduced-motion';
import { useAgentLiveStore, type NetworkNode } from '@/store/agent-live-store';
import { getStateHex } from '@/lib/constants';
import type { AgentVisualState } from '@/lib/schemas';

/* ═════════════════════════════════════════════════════════════════════
   AGENT NETWORK GRAPH — Clean SVG Node Graph

   Replaces the procedural canvas with a crisp, zero-lag SVG graph.
   Nodes are positioned from server data, edges connect declared connections.
   State = color. Message = tooltip. No particles, no orbits, no lag.
   ═════════════════════════════════════════════════════════════════════ */

// ─── Layout constants ────────────────────────────────────────
const PADDING = 50;           // px from SVG edge to node area
const NODE_RADIUS = 22;       // base circle radius
const ORCH_RADIUS = 30;       // orchestrator is bigger
const LABEL_OFFSET_Y = 36;    // px below node center for label
const MSG_OFFSET_Y = 50;      // px below node center for message

// ─── Helpers ─────────────────────────────────────────────────
function stateToStroke(state: string): string {
  return getStateHex(state as AgentVisualState);
}

function stateToFill(state: string): string {
  const hex = getStateHex(state as AgentVisualState);
  // Return a very translucent version for fill
  return hex + '15'; // ~8% opacity
}

function truncate(str: string, max: number): string {
  return str.length > max ? str.slice(0, max) + '…' : str;
}

// ─── Edge Component ──────────────────────────────────────────
function Edge({
  x1, y1, x2, y2, color, animated, reducedMotion,
}: {
  x1: number; y1: number;
  x2: number; y2: number;
  color: string;
  animated: boolean;
  reducedMotion: boolean;
}) {
  const id = `edge-${x1.toFixed(0)}-${y1.toFixed(0)}-${x2.toFixed(0)}-${y2.toFixed(0)}`;

  return (
    <g>
      {/* Shadow line for depth */}
      <line
        x1={x1} y1={y1} x2={x2} y2={y2}
        stroke="rgba(255,255,255,0.03)"
        strokeWidth={3}
      />
      {/* Main edge */}
      <line
        x1={x1} y1={y1} x2={x2} y2={y2}
        stroke={color}
        strokeWidth={1.5}
        strokeOpacity={animated ? 0.6 : 0.2}
        strokeDasharray={animated ? '6 4' : 'none'}
      />
      {/* Animated dot for active connections — SMIL gated behind reduced-motion */}
      {animated && !reducedMotion && (
        <circle r={2.5} fill={color}>
          <animateMotion
            dur="2s"
            repeatCount="indefinite"
            path={`M${x1},${y1} L${x2},${y2}`}
          />
        </circle>
      )}
    </g>
  );
}

// ─── Node Component ──────────────────────────────────────────
function GraphNode({
  node,
  isHovered,
  isOrchestrator,
  onSelect,
  onHover,
  svgW,
  svgH,
  reducedMotion,
}: {
  node: NetworkNode;
  isHovered: boolean;
  isOrchestrator: boolean;
  onSelect: () => void;
  onHover: (h: boolean) => void;
  svgW: number;
  svgH: number;
  reducedMotion: boolean;
}) {
  // Convert 0-1 position to SVG coordinates with padding
  const cx = PADDING + node.x * (svgW - 2 * PADDING);
  const cy = PADDING + node.y * (svgH - 2 * PADDING);
  const r = isOrchestrator ? ORCH_RADIUS : NODE_RADIUS * (node.size || 1);
  const strokeColor = stateToStroke(node.state);
  const fillColor = stateToFill(node.state);
  const isActive = node.state === 'executing' || node.state === 'thinking' || node.state === 'verifying';

  return (
    <g
      className="cursor-pointer"
      onClick={onSelect}
      onMouseEnter={() => onHover(true)}
      onMouseLeave={() => onHover(false)}
    >
      {/* Glow ring for active nodes — SMIL gated behind reduced-motion */}
      {isActive && (
        <circle cx={cx} cy={cy} r={r + 6} fill="none" stroke={strokeColor} strokeWidth={1} strokeOpacity={0.3}>
          {!reducedMotion && <>
            <animate
              attributeName="r"
              values={`${r + 4};${r + 10};${r + 4}`}
              dur="2.5s"
              repeatCount="indefinite"
            />
            <animate
              attributeName="stroke-opacity"
              values="0.3;0.1;0.3"
              dur="2.5s"
              repeatCount="indefinite"
            />
          </>}
        </circle>
      )}

      {/* Outer ring */}
      <circle
        cx={cx} cy={cy} r={r}
        fill={fillColor}
        stroke={strokeColor}
        strokeWidth={isHovered ? 2.5 : 1.5}
        strokeOpacity={isHovered ? 1 : 0.7}
        style={{ transition: 'stroke-width 0.2s, stroke-opacity 0.2s' }}
      />

      {/* Inner dot — solid for active, hollow for idle */}
      <circle
        cx={cx} cy={cy} r={r * 0.4}
        fill={isActive ? strokeColor : 'transparent'}
        fillOpacity={isActive ? 0.9 : 0}
        stroke={strokeColor}
        strokeWidth={1}
        strokeOpacity={0.5}
      />

      {/* State indicator dot (top-right) */}
      <circle
        cx={cx + r * 0.65} cy={cy - r * 0.65} r={4}
        fill={strokeColor}
        fillOpacity={node.state === 'idle' ? 0.3 : 0.9}
      />

      {/* Name label */}
      <text
        x={cx} y={cy + LABEL_OFFSET_Y}
        textAnchor="middle"
        fill="rgba(255,255,255,0.85)"
        fontSize={isOrchestrator ? 11 : 10}
        fontWeight={isOrchestrator ? 700 : 600}
        fontFamily="system-ui, sans-serif"
      >
        {truncate(node.name, 14)}
      </text>

      {/* Message — only show on hover or if orchestrator */}
      {(isHovered || isOrchestrator) && node.message && (
        <text
          x={cx} y={cy + MSG_OFFSET_Y}
          textAnchor="middle"
          fill="rgba(255,255,255,0.35)"
          fontSize={9}
          fontFamily="system-ui, sans-serif"
        >
          {truncate(node.message, 30)}
        </text>
      )}
    </g>
  );
}

// ─── Main Graph Component ────────────────────────────────────
export function AgentNetworkGraph() {
  const networkNodes = useAgentLiveStore(s => s.networkNodes);
  const selectedNodeId = useAgentLiveStore(s => s.selectedNodeId);
  const selectNode = useAgentLiveStore(s => s.selectNode);
  const reduced = usePrefersReducedMotion();
  const gridId = useId();

  const [hoveredId, setHoveredId] = useState<string | null>(null);

  // SVG dimensions — use the container's natural size
  const [dimensions, setDimensions] = useState({ w: 600, h: 400 });
  const roRef = useRef<ResizeObserver | null>(null);

  // Responsive resize via callback ref
  const setContainerRef = useCallback((el: HTMLDivElement | null) => {
    if (roRef.current) roRef.current.disconnect();
    if (!el) return;
    roRef.current = new ResizeObserver(entries => {
      const { width, height } = entries[0].contentRect;
      if (width > 0 && height > 0) {
        setDimensions({ w: Math.round(width), h: Math.round(height) });
      }
    });
    roRef.current.observe(el);
  }, []);

  const { w, h } = dimensions;

  // Build edge list from node connections (deduped)
  const edges = useMemo(() => {
    const edgeSet = new Set<string>();
    const result: { from: NetworkNode; to: NetworkNode; fromActive: boolean }[] = [];

    for (const node of networkNodes) {
      const fromActive = node.state !== 'idle' && node.state !== 'offline';
      for (const connId of node.connections) {
        const target = networkNodes.find(n => n.id === connId);
        if (!target) continue;

        // Dedupe: always use sorted IDs
        const key = [node.id, connId].sort().join('→');
        if (edgeSet.has(key)) continue;
        edgeSet.add(key);

        const toActive = target.state !== 'idle' && target.state !== 'offline';
        result.push({
          from: node,
          to: target,
          fromActive: fromActive || toActive,
        });
      }
    }
    return result;
  }, [networkNodes]);

  // Convert node 0-1 positions to SVG coords
  const toSvgX = (nx: number) => PADDING + nx * (w - 2 * PADDING);
  const toSvgY = (ny: number) => PADDING + ny * (h - 2 * PADDING);

  // No nodes — show placeholder
  if (networkNodes.length === 0) {
    return (
      <div
        ref={setContainerRef}
        className="absolute inset-0 flex items-center justify-center"
      >
        <p className="text-zinc-600 text-xs">No active nodes</p>
      </div>
    );
  }

  return (
    <div ref={setContainerRef} className="absolute inset-0">
      <svg
        width={w}
        height={h}
        viewBox={`0 0 ${w} ${h}`}
        className="w-full h-full"
        style={{ overflow: 'visible' }}
      >
        {/* Subtle grid background */}
        <defs>
          <pattern id={gridId} width="30" height="30" patternUnits="userSpaceOnUse">
            <path d="M 30 0 L 0 0 0 30" fill="none" stroke="rgba(255,255,255,0.02)" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width={w} height={h} fill={`url(#${gridId})`} />

        {/* Edges */}
        {edges.map((edge, i) => (
          <Edge
            key={`edge-${i}`}
            x1={toSvgX(edge.from.x)}
            y1={toSvgY(edge.from.y)}
            x2={toSvgX(edge.to.x)}
            y2={toSvgY(edge.to.y)}
            color={edge.fromActive ? edge.from.color : 'rgba(255,255,255,0.1)'}
            animated={edge.fromActive}
            reducedMotion={reduced}
          />
        ))}

        {/* Nodes */}
        {networkNodes.map(node => {
          const isOrch = node.type === 'orchestrator';
          const isHov = hoveredId === node.id;
          const isSel = selectedNodeId === node.id;

          return (
            <g key={node.id}>
              {/* Selection ring */}
              <AnimatePresence>
                {isSel && (
                  <motion.circle
                    initial={reduced ? { r: 30, opacity: 0.4 } : { r: 0, opacity: 0 }}
                    animate={{ r: (isOrch ? ORCH_RADIUS : NODE_RADIUS) + 12, opacity: 0.4 }}
                    exit={reduced ? { r: 0, opacity: 0 } : { r: 0, opacity: 0 }}
                    transition={reduced ? { duration: 0 } : { duration: 0.3 }}
                    cx={toSvgX(node.x)}
                    cy={toSvgY(node.y)}
                    fill="none"
                    stroke={node.color}
                    strokeWidth={2}
                    strokeDasharray="4 3"
                  />
                )}
              </AnimatePresence>
              <GraphNode
                node={node}
                isHovered={isHov}
                isOrchestrator={isOrch}
                onSelect={() => selectNode(isSel ? null : node.id)}
                onHover={(h) => setHoveredId(h ? node.id : null)}
                svgW={w}
                svgH={h}
                reducedMotion={reduced}
              />
            </g>
          );
        })}
      </svg>
    </div>
  );
}