/* ═══════════════════════════════════════════════════════════════════════
   VRM LOADER — DISABLED
   VRM (10MB model + @pixiv/three-vrm) caused Turbopack to hang during
   compilation. Removed in W226. ChibiCharacter is the sole 3D avatar.
   ═══════════════════════════════════════════════════════════════════════ */

/** Stub — no-op. Kept so any stale import doesn't crash. */
export function loadVRM(_onLoad?: () => void, _onError?: () => void) {
  // Intentionally empty — VRM support removed
}

/** Stub — renders nothing. */
export function VRMCharacter() {
  return null;
}