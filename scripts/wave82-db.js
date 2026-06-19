const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
(async () => {
  const wave = await p.harnessWave.create({
    data: {
      waveNumber: 82,
      status: 'running',
      summary: 'Build Health Card + HarnessDashboard composite export',
      startedAt: new Date(),
    },
  });
  console.log('Wave created:', wave.id);

  const d1 = await p.harnessDecision.create({
    data: {
      waveId: wave.id,
      category: 'feature',
      priority: 'high',
      action: 'executed',
      description: 'Add BuildHealthCard to overview tab showing lint status (SPEC 7 gap)',
      reasoning: 'SPEC Section 7 requires Web app quality metric visible in dashboard. This was the only untracked success metric.',
      targetFile: 'src/components/harness/build-health-card.tsx',
      targetModule: 'build-health-card',
    },
  });
  console.log('Decision 1:', d1.id);

  const d2 = await p.harnessDecision.create({
    data: {
      waveId: wave.id,
      category: 'feature',
      priority: 'medium',
      action: 'executed',
      description: 'Create HarnessDashboard composite export component',
      reasoning: 'index.ts JSDoc references HarnessDashboard but it did not exist. External consumers need a single drop-in component.',
      targetFile: 'src/components/harness/harness-dashboard.tsx',
      targetModule: 'harness-dashboard',
    },
  });
  console.log('Decision 2:', d2.id);

  const d3 = await p.harnessDecision.create({
    data: {
      waveId: wave.id,
      category: 'code_quality',
      priority: 'medium',
      action: 'executed',
      description: 'Export HarnessErrorBoundary from index.ts',
      reasoning: 'ErrorBoundary was used internally but not in the export contract, preventing external consumers from wrapping the dashboard.',
      targetFile: 'src/index.ts',
      targetModule: 'index',
    },
  });
  console.log('Decision 3:', d3.id);

  await p.harnessWave.update({
    where: { id: wave.id },
    data: { status: 'completed', completedAt: new Date() },
  });
  console.log('Wave 82 completed');

  await p.$disconnect();
})();