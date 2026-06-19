import { NextResponse } from 'next/server';

const SPEC_CONTENT = `# HERMES HARNESS — System Specification

## 1. Overview

HERMES HARNESS is a **self-evolving agent system** that uses a Spec-Driven Development methodology. The system continuously improves itself through scheduled cron waves, each analyzing code quality, identifying improvements, and making autonomous decisions.

### Core Principles
- **Spec as Source of Truth**: All system behavior is defined by this specification
- **Wave-Based Evolution**: Every cron trigger produces one "wave" of self-improvement
- **Decision Tracking**: Every change is traceable to a reasoned decision
- **GitHub Sync**: All improvements are version-controlled

## 2. Architecture

\`\`\`
┌─────────────────────────────────────────────────────────────┐
│                    HERMES HARNESS                           │
│                                                             │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐             │
│  │  SPEC     │───▶│  ANALYZER│───▶│ PLANNER  │             │
│  │ (Truth)   │    │ (Audit)  │    │ (Decide) │             │
│  └──────────┘    └──────────┘    └──────────┘             │
│                                         │                   │
│                                         ▼                   │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐             │
│  │  MEMORY   │◀───│EXECUTOR │◀───│ DECISION │             │
│  │ (Context) │    │ (Apply)  │    │ (Queue)  │             │
│  └──────────┘    └──────────┘    └──────────┘             │
│                      │                                     │
│                      ▼                                     │
│               ┌──────────┐                                 │
│               │  GITHUB  │                                 │
│               │  (Sync)  │                                 │
│               └──────────┘                                 │
└─────────────────────────────────────────────────────────────┘
\`\`\`

## 3. Wave Lifecycle

1. **Trigger**: Cron job fires (every 10 minutes)
2. **Analyze**: Read spec, scan codebase, compare current state vs spec
3. **Plan**: Generate decisions with priority and reasoning
4. **Execute**: Apply approved changes
5. **Record**: Store metrics, update memory, sync to GitHub
6. **Complete**: Wave marked as completed with summary

## 4. Decision Categories

| Category | Description |
|----------|-------------|
| \`code_quality\` | Code style, linting, type safety |
| \`feature\` | New functionality |
| \`fix\` | Bug fixes |
| \`refactor\` | Code restructuring |
| \`style\` | UI/UX improvements |
| \`performance\` | Optimization changes |
| \`architecture\` | Structural changes |

## 5. Guardrails

- **No destructive changes without confirmation**
- **All decisions must reference a spec section**
- **GitHub sync only on completed waves**
- **Maximum 20 decisions per wave**
- **Critical changes require 2-wave validation**

## 6. Metrics Tracked

- Total lines of code
- Component count
- API route count
- Test coverage percentage
- Decision success rate
- Wave completion rate
- GitHub sync frequency
`;

export async function GET() {
  try {
    return NextResponse.json({
      content: SPEC_CONTENT,
      version: '2.1.0',
      lastUpdated: '2025-06-19T00:00:00.000Z',
      sectionsCount: 6,
    });
  } catch (error) {
    console.error('[SPEC] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch spec' }, { status: 500 });
  }
}