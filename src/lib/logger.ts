/**
 * Centralized structured logger for HARNESS API routes.
 *
 * - Consistent `[TAG]` prefix format
 * - Sanitizes error objects (extracts message + stack, avoids leaking internal fields)
 * - `logError` for catch blocks (always visible)
 * - `logDebug` for non-critical failures (visible in dev, silenced in prod)
 */

const IS_DEV = process.env.NODE_ENV !== 'production';

function safeMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  try { return String(error); } catch { return '[unstringifiable]'; }
}

function safeStack(error: unknown): string | undefined {
  if (error instanceof Error) return error.stack;
  return undefined;
}

/** Log a route-level error (always visible). Use in catch blocks. */
export function logError(tag: string, error: unknown, extra?: Record<string, unknown>): void {
  const entry = {
    tag,
    message: safeMessage(error),
    ...(IS_DEV && { stack: safeStack(error) }),
    ...extra,
  };
  console.error(JSON.stringify(entry));
}

/** Log a non-critical failure. Visible in dev, suppressed in production. */
export function logDebug(tag: string, message: string, extra?: Record<string, unknown>): void {
  if (!IS_DEV) return;
  const entry = { tag, level: 'debug', message, ...extra };
  console.debug(JSON.stringify(entry));
}