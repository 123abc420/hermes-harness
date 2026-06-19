// ─── Shared mutable state for 3D sandbox (avoids circular deps) ────

/** Mouse position — written by MouseTracker, read inside useFrame only */
export const mousePosition = { x: 0, y: 0 };

/** VRM loading state — shared between sandbox and character */
export const vrmLoadingState = {
  loaded: false,
  _listeners: new Set<() => void>(),
  setLoaded(val: boolean) {
    this.loaded = val;
    this._listeners.forEach(fn => fn());
  },
  subscribe(fn: () => void) {
    this._listeners.add(fn);
    return () => { this._listeners.delete(fn); };
  },
};