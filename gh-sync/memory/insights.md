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