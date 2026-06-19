import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const research = [
      {
        id: 'hermes-agent',
        title: 'Hermes Agent Framework',
        source: 'Anthropic',
        url: 'https://www.anthropic.com/research',
        summary: 'Autonomous agent architecture with self-reflection loops and hierarchical planning. Hermes uses a three-phase approach: perceive, plan, execute — with continuous feedback integration.',
        keyInsight: 'Self-reflection loops every N steps dramatically improve task completion rates.',
      },
      {
        id: 'harness-engineering',
        title: 'Harness Engineering Patterns',
        source: 'GitHub Engineering',
        url: 'https://github.blog/engineering/',
        summary: 'Patterns for building evolutionary software systems. Covers incremental migration strategies, feature flags for self-modification, and rollback safety nets.',
        keyInsight: 'Golden path architecture enables safe autonomous modifications.',
      },
      {
        id: 'spec-driven-dev',
        title: 'Spec-Driven Development',
        source: 'ThoughtWorks',
        url: 'https://www.thoughtworks.com/radar',
        summary: 'Using specifications as the single source of truth. The spec defines what the system should be, and the system continuously measures its compliance.',
        keyInsight: 'Specs as executable contracts eliminate drift between intent and implementation.',
      },
      {
        id: 'anthropic-agentic',
        title: 'Building Effective Agents',
        source: 'Anthropic',
        url: 'https://docs.anthropic.com/en/docs/build-with-claude/agentic',
        summary: 'Best practices for building AI agents: agentic loops, tool use patterns, and orchestration strategies. Emphasizes simplicity over complexity.',
        keyInsight: 'The best agents are often the simplest — avoid over-engineering the orchestration layer.',
      },
      {
        id: 'addy-osmani',
        title: 'JavaScript Architecture Patterns',
        source: 'Addy Osmani',
        url: 'https://addyosmani.com/',
        summary: 'Large-scale JavaScript application architecture, module patterns, and design patterns for maintainable codebases.',
        keyInsight: 'Module boundaries and clear interfaces are the foundation of evolvable systems.',
      },
    ];

    return NextResponse.json({ research });
  } catch (error) {
    console.error('[RESEARCH] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch research' }, { status: 500 });
  }
}