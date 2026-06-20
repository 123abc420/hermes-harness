import { execFile } from 'child_process';
import { promisify } from 'util';

const execFileAsync = promisify(execFile);

export interface GitData {
  count: number;
  commits: { sha: string; message: string }[];
  lastSha: string | null;
}

/** Run git commands asynchronously to avoid blocking the event loop. */
export async function getGitData(): Promise<GitData> {
  try {
    const { stdout: countStr } = await execFileAsync('git', ['rev-list', '--count', 'HEAD'], {
      encoding: 'utf-8',
      timeout: 10_000,
    });
    const count = parseInt(countStr.trim(), 10);

    const { stdout: log } = await execFileAsync('git', ['log', '--oneline', '-5'], {
      encoding: 'utf-8',
      timeout: 10_000,
    });
    const commits = log.trim().split('\n').map((line) => {
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