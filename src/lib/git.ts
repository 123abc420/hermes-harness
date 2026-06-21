import { readFileSync, existsSync, readdirSync } from 'fs';
import { join } from 'path';
import { logError } from './logger';

export interface GitData {
  count: number;
  commits: { sha: string; message: string }[];
  lastSha: string | null;
}

/**
 * Get git data using ONLY filesystem reads (no process spawning).
 * This is the most reliable approach in sandboxed/restricted environments.
 *
 * For commit count, we read the pack index or loose objects count as an approximation.
 * For the latest commits, we read from .git/refs and the reflog.
 */
export async function getGitData(): Promise<GitData> {
  try {
    const gitDir = join(process.cwd(), '.git');
    if (!existsSync(gitDir)) {
      return { count: 0, commits: [], lastSha: null };
    }

    // Read current HEAD reference
    const headContent = readFileSync(join(gitDir, 'HEAD'), 'utf-8').trim();
    const refMatch = headContent.match(/^ref:\s*(.+)$/);

    let currentSha: string | null = null;
    if (refMatch) {
      // Symbolic ref (e.g., "ref: refs/heads/main")
      const refPath = join(gitDir, refMatch[1]);
      // Check packed-refs first (common in repos with many commits)
      const packedRefsPath = join(gitDir, 'packed-refs');
      if (existsSync(packedRefsPath)) {
        const packedContent = readFileSync(packedRefsPath, 'utf-8');
        const targetRef = refMatch[1];
        for (const line of packedContent.split('\n')) {
          if (line.endsWith(` ${targetRef}`)) {
            currentSha = line.split(' ')[0];
            break;
          }
        }
      }
      // Loose ref overrides packed ref
      if (existsSync(refPath)) {
        currentSha = readFileSync(refPath, 'utf-8').trim();
      }
    } else {
      // Detached HEAD — SHA directly in HEAD file
      currentSha = headContent;
    }

    if (!currentSha) {
      return { count: 0, commits: [], lastSha: null };
    }

    // Read reflog for recent commits (much more reliable than parsing pack files)
    const refName = refMatch ? refMatch[1] : 'HEAD';
    const reflogPath = join(gitDir, 'logs', refName);
    const commits: { sha: string; message: string }[] = [];

    if (existsSync(reflogPath)) {
      const reflogContent = readFileSync(reflogPath, 'utf-8');
      // Reflog format: <old-sha(40)> <new-sha(40)> user <email> <timestamp> <tz>\t<message>
      const lines = reflogContent.trim().split('\n').reverse(); // Most recent first
      for (const line of lines) {
        const tabIdx = line.indexOf('\t');
        if (tabIdx === -1) continue;
        // Extract NEW SHA from position 41 (old-sha=40 chars + space)
        const newSha = line.slice(41, 48);
        let message = line.slice(tabIdx + 1).trim();
        // Only include actual commit operations (skip pull, merge, reset, checkout, etc.)
        if (!message.startsWith('commit')) continue;
        // Strip prefixes: "commit: ", "commit (amend): ", "commit (merge): "
        message = message.replace(/^commit\s*(?:\([^)]*\))?\s*:\s*/, '');
        if (newSha && message && newSha.length === 7) {
          commits.push({ sha: newSha, message });
          if (commits.length >= 5) break;
        }
      }
    }

    // Estimate commit count from reflog line count (accurate for non-rebased repos)
    let count = 0;
    if (existsSync(reflogPath)) {
      const reflogContent = readFileSync(reflogPath, 'utf-8');
      count = reflogContent.trim().split('\n').length;
    }

    // Fallback: if reflog is empty or missing, use pack index size as rough estimate
    if (count === 0) {
      // Check objects/pack directory
      const packDir = join(gitDir, 'objects', 'pack');
      if (existsSync(packDir)) {
        const packs = readdirSync(packDir).filter(f => f.endsWith('.idx'));
        if (packs.length > 0) {
          // Each .idx file represents a pack; rough estimate: count objects
          // This is a very rough estimate, but better than 0
          count = 1; // At least 1 commit exists
        }
      }
      // Check loose objects as a signal
      const objectsDir = join(gitDir, 'objects');
      if (existsSync(objectsDir)) {
        const entries = readdirSync(objectsDir).filter(e => e.length === 2 && /^[0-9a-f]{2}$/.test(e));
        if (entries.length > 0) count = Math.max(count, entries.length * 10); // Very rough
      }
    }

    return {
      count,
      commits,
      lastSha: currentSha.slice(0, 7),
    };
  } catch (err: unknown) {
    logError('GIT', err);
    return { count: 0, commits: [], lastSha: null };
  }
}