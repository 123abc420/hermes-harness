import { execSync } from 'child_process';

export interface GitData {
  count: number;
  commits: { sha: string; message: string }[];
  lastSha: string | null;
}

/** Run git commands to get commit count, last 5 commits, and latest SHA. */
export function getGitData(): GitData {
  try {
    const count = parseInt(
      execSync('git rev-list --count HEAD', { encoding: 'utf-8' }).trim(),
      10,
    );
    const log = execSync('git log --oneline -5', { encoding: 'utf-8' }).trim();
    const commits = log.split('\n').map((line) => {
      const spaceIdx = line.indexOf(' ');
      const sha = line.slice(0, spaceIdx > 0 ? spaceIdx : 7);
      const message = line.slice(spaceIdx + 1);
      return { sha, message };
    });
    const lastSha = commits[0]?.sha ?? null;
    return { count, commits, lastSha };
  } catch {
    return { count: 0, commits: [], lastSha: null };
  }
}