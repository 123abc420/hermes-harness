'use client';

import { HarnessDashboard } from '@/components/harness/harness-dashboard';

/**
 * Root page — thin wrapper around the exportable HarnessDashboard.
 * All dashboard logic lives in harness-dashboard.tsx (SPEC Section 5).
 */
export default function Home() {
  return <HarnessDashboard />;
}