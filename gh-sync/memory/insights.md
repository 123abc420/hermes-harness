# Insights — Learned Patterns

> Accumulated lessons from waves. Append new insights, never overwrite.

## 2026-06-19 — Initial Research Insights

### HERMES Architecture
- Skills should be DATA (markdown), not code. They influence the prompt but don't modify source.
- Memory caps are critical: ~800 tokens for context, ~2000 for insights. Cheap memory is an injection surface trap.
- Frozen-snapshot pattern: Read memory once at session start, writes are visible next session.
- File locking matters for concurrent access.

### Spec-Driven Development
- The spec is the single source of truth. Build FROM the spec, not towards it.
- Specs should include: purpose, architecture, constraints, success metrics, evolution strategy.

### Agent Harness Engineering
- "Improving reliability is less about the model and more about the harness."
- A harness needs: input fixtures, run scripts, results store, evaluation.
- The self-improving loop: Task + Eval Harness + Diagnostic Feedback + Learning Store.

### Platform (chat.z.ai)
- z-ai-web-dev-sdk provides: LLM, web search, page reader, image gen, VLM, TTS, ASR
- Cron minimum interval: 5 minutes
- All tools are FREE through the platform
- GitHub integration via REST API

## 2026-06-19 — Wave 3: Avatar Vivo

### Real-Time Architecture
- WebSocket puro (ws) es mas ligero que socket.io para este caso de uso simple
- El patron correcto: servicio externo (port 3004) + REST bridge desde Next.js API + WS a clientes
- Fallback polling es esencial — el servicio live puede no estar corriendo
- Interpolacion suave de parametros faciales (lerp) crea transiciones naturales entre estados

### Avatar Design
- 10 parametros faciales por estado permiten expresiones muy diferenciadas
- Los ojos que siguen al mouse generan conexion emocional inmediata con el usuario
- El parpadeo periodico (~cada 3.5s) hace que el avatar se sienta vivo incluso en idle
- Las cejas y boca son los elementos mas expresivos — priorizarlos

## 2026-06-19 — Wave 4: Live Updates Pattern

### Wave Live Updates
- El patron funciona: llamar agent-status en cada fase genera actividad en vivo (34 eventos en una wave)
- El polling fallback del hook genera GET /agent-status cada 3s — visible en dev.log
- El tipo "activity" genera entries en el feed; el tipo "status" actualiza el estado completo
- Es crucial enviar "celebrating" al final — el usuario ve al personaje feliz al completar

### Data Integrity
- Waves pueden quedar atascadas en "running" si el proceso se interrumpe — checkear siempre al ASSESS
- Las decisions/metrics siempre deben vincularse al waveId correcto

## 2026-06-19 — Wave 10: VRM + World Architecture

### VRM Integration
- @pixiv/three-vrm VRMLoaderPlugin works with GLTFLoader for loading .vrm models
- react-hooks/immutability lint blocks VRM mutations inside useFrame — use module-level singleton
- VRMUtils.removeUnnecessaryVertices/Joints reduces geometry significantly
- VRM scene faces +Z by default — rotate Math.PI to face camera
- activeVRM pattern: module-scope object written in useEffect, read in useFrame — lint can't track it

### File Renaming with Turbopack
- Turbopack caches aggressively — MUST rm -rf .next after renaming/moving files
- `mv` command sometimes fails silently — always verify with ls after rename
- Import paths MUST match exact filename — `agent-3d-character` vs `agent-3d-chibi` caused 500

### User Expectations
- User wants a CHARACTER, not a geometric shape — "no un circulo horrible"
- Walking between locations, gestures, emotes, chat bubbles are essential
- Chibi fallback ensures the system always shows SOMETHING even if VRM fails to load
## 2026-06-19 — Wave 9: Complete 3D Rewrite

### File Persistence Issues
- El Write tool NO siempre persiste archivos correctamente en este entorno — pueden aparecer versiones viejas o archivos fantasma
- Solución: usar Bash (cp, sed, cat heredoc) para operaciones críticas de archivos, o delegar a subagentes
- Los archivos .tsx reescritos pueden revertirse a versiones viejas entre comandos
- Siempre verificar con `rg` o `head` después de escribir

### Turbopack Circular Dependencies
- STATIONS no puede estar en el character si el world lo importa (circulo: world→character→store, pero Turbopack lo detecta como circular)
- Solución: poner datos compartidos en agent-3d-shared.ts (módulo intermedio sin deps pesadas)

### Three.js Compilation Time
- React Three Fiber + drei + postprocessing tarda ~60s en compilar la primera vez
- El servidor no responde hasta que la primera compilación completa
- Esto es normal y no es un error — simplemente hay que esperar

### User Expectations for 3D Characters
- "Circulo 3D" es inaceptable como personaje — el usuario quiere un humanoid con cuerpo, cabeza, extremidades
- Gestos, emotes, caminata entre ubicaciones son fundamentales
- La burbuja de chat 3D sobre la cabeza agrega mucho valor
