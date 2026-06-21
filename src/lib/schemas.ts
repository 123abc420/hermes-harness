/**
 * Shared Zod validation schemas for harness API routes.
 *
 * These schemas enforce type safety on request bodies that previously
 * relied on manual `if (!field)` checks. Categories and actions are
 * freeform strings (the DB has 21+ distinct categories and 60+ actions),
 * but priority, wave status, and metric value type are constrained.
 */
import { z } from 'zod';

// ── Reusable primitives ───────────────────────────────────────────

/** Valid decision priorities observed in the DB. */
export const DECISION_PRIORITIES = ['low', 'medium', 'high', 'critical'] as const;
export type DecisionPriority = (typeof DECISION_PRIORITIES)[number];

/** Valid wave statuses. */
export const WAVE_STATUSES = [
  'running',
  'completed',
  'failed',
  'error',
  'interrupted',
  'pending',
] as const;
export type WaveStatus = (typeof WAVE_STATUSES)[number];

/** Valid decision outcomes observed in the DB. */
export const DECISION_OUTCOMES = [
  'success_verified',
  'success',
  'failed',
  'failed_wave',
  'interrupted',
  'skipped',
  'pending',
] as const;
export type DecisionOutcome = (typeof DECISION_OUTCOMES)[number];

// ── Input schemas (request body validation) ───────────────────────

export const createDecisionSchema = z.object({
  waveId: z.string().min(1, 'waveId is required'),
  category: z.string().min(1, 'category is required'),
  priority: z.enum(DECISION_PRIORITIES).default('medium'),
  action: z.string().min(1).default('planned'),
  description: z.string().min(1, 'description is required'),
  reasoning: z.string().nullable().optional(),
  targetFile: z.string().nullable().optional(),
  targetModule: z.string().nullable().optional(),
  outcome: z.string().nullable().optional(),
});

export type CreateDecisionInput = z.infer<typeof createDecisionSchema>;

export const updateDecisionSchema = z
  .object({
    category: z.string().min(1).optional(),
    priority: z.enum(DECISION_PRIORITIES).optional(),
    action: z.string().min(1).optional(),
    description: z.string().min(1).optional(),
    reasoning: z.string().nullable().optional(),
    targetFile: z.string().nullable().optional(),
    targetModule: z.string().nullable().optional(),
    outcome: z.string().nullable().optional(),
  })
  .refine((obj) => Object.keys(obj).length > 0, {
    message: 'At least one field must be provided',
  });

export type UpdateDecisionInput = z.infer<typeof updateDecisionSchema>;

export const patchWaveSchema = z
  .object({
    status: z.enum(WAVE_STATUSES).optional(),
    completedAt: z.string().datetime({ offset: true }).nullable().optional(),
    summary: z.string().nullable().optional(),
    decisionsCount: z.number().int().min(0).optional(),
    improvementsCount: z.number().int().min(0).optional(),
    errorsCount: z.number().int().min(0).optional(),
    metricsSnapshot: z.record(z.string(), z.unknown()).nullable().optional(),
  })
  .refine((obj) => Object.keys(obj).length > 0, {
    message: 'At least one field must be provided',
  });

export type PatchWaveInput = z.infer<typeof patchWaveSchema>;

export const createWaveSchema = z.object({
  summary: z.string().optional(),
});

export type CreateWaveInput = z.infer<typeof createWaveSchema>;

export const createMetricSchema = z.object({
  metricKey: z.string().min(1, 'metricKey is required'),
  metricValue: z.number({ message: 'metricValue must be a number' }),
  waveId: z.string().nullable().optional(),
});

export type CreateMetricInput = z.infer<typeof createMetricSchema>;

export const updateMemorySchema = z.object({
  context: z.string().max(3200, 'context exceeds 3200 char cap').optional(),
  insights: z.string().max(8000, 'insights exceeds 8000 char cap').optional(),
});

export type UpdateMemoryInput = z.infer<typeof updateMemorySchema>;

export const updateConfigSchema = z.object({
  key: z.string().min(1, 'key is required'),
  value: z.string({ message: 'value must be a string' }),
  description: z.string().optional(),
});

export type UpdateConfigInput = z.infer<typeof updateConfigSchema>;

// ── Agent-status POST schemas ──────────────────────────────────────

/** Valid agent state values (single source of truth). */
export const VALID_AGENT_STATES_Z = [
  'idle', 'thinking', 'searching', 'planning', 'executing',
  'verifying', 'celebrating', 'error', 'evolving', 'offline',
] as const;

/** Valid wave phase values. */
export const VALID_PHASES_Z = [
  'assess', 'plan', 'execute', 'verify', 'persist', 'report', '',
] as const;

/** Valid broadcast type values. */
export const VALID_BROADCAST_TYPES = [
  'status', 'activity', 'node', 'node-remove', 'node-clear',
  'sub-agent', 'sub-agent-remove', 'sub-agent-clear', 'sub-agent-update',
  'node-pulse', 'decision-count', 'full-update',
] as const;
export type BroadcastType = (typeof VALID_BROADCAST_TYPES)[number];

/** Allowed keys for the full-update spread (prevents injection). */
export const FULL_UPDATE_KEYS = new Set([
  'agentState', 'message', 'phase', 'waveNumber', 'progress',
  'waveCount', 'totalImprovements', 'totalDecisions', 'decisionCountThisWave',
  'activities', 'subAgents',
]);

/**
 * Zod schema for agent-status POST body.
 * Validates base fields (agentState, progress, etc.) and constrains `type`
 * to known broadcast types. Type-specific fields are validated per-handler
 * to keep the schema maintainable.
 */
export const agentStatusPostSchema = z.object({
  type: z.enum(VALID_BROADCAST_TYPES).optional(),
  agentState: z.enum(VALID_AGENT_STATES_Z).optional(),
  message: z.string().max(500).optional(),
  phase: z.enum(VALID_PHASES_Z).optional(),
  waveNumber: z.number().int().min(0).optional(),
  progress: z.number().min(0).max(1).optional(),
  // Type-specific fields (validated on demand per handler)
  nodeId: z.string().max(100).optional(),
  nodeType: z.string().max(50).optional(),
  nodeName: z.string().max(80).optional(),
  nodeState: z.string().max(50).optional(),
  nodeMessage: z.string().max(300).optional(),
  nodeColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
  connections: z.array(z.string().max(100)).optional(),
  fromNode: z.string().max(100).optional(),
  toNode: z.string().max(100).optional(),
  name: z.string().max(80).optional(),
  state: z.string().max(50).optional(),
  color: z.string().max(20).optional(),
  agentId: z.string().max(100).optional(),
  category: z.string().max(50).optional(),
  description: z.string().max(200).optional(),
  waveCount: z.number().int().min(0).optional(),
  totalImprovements: z.number().int().min(0).optional(),
  totalDecisions: z.number().int().min(0).optional(),
  decisionCountThisWave: z.number().int().min(0).optional(),
  activities: z.array(z.record(z.string(), z.unknown())).optional(),
  subAgents: z.array(z.record(z.string(), z.unknown())).optional(),
}).strict();

export type AgentStatusPostInput = z.infer<typeof agentStatusPostSchema>;

/** Minimal validation for agent-demo POST body (forwarded to agent-status). */
export const agentDemoPostSchema = z.object({
  type: z.string().min(1).optional(),
  agentState: z.string().optional(),
  message: z.string().optional(),
  phase: z.string().optional(),
  waveNumber: z.number().int().min(0).optional(),
  progress: z.number().min(0).max(1).optional(),
  waveCount: z.number().int().min(0).optional(),
  totalImprovements: z.number().int().min(0).optional(),
  totalDecisions: z.number().int().min(0).optional(),
  name: z.string().optional(),
  state: z.string().optional(),
  color: z.string().optional(),
  agentId: z.string().optional(),
}).strict();

export type AgentDemoPostInput = z.infer<typeof agentDemoPostSchema>;

/**
 * Returns a 400 response from a Zod parse failure.
 * Pass the raw request body and schema to get the error message.
 */
export function validationError(schema: z.ZodType, body: unknown): Response {
  const result = schema.safeParse(body);
  const message = result.success
    ? 'Validation failed'
    : result.error.issues.map((i) => i.message).join('; ');
  return new Response(JSON.stringify({ error: message }), {
    status: 400,
    headers: { 'Content-Type': 'application/json' },
  });
}