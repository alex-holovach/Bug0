'use server';

import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

export interface GitInfo {
  branch: string | null;
  commitSha: string | null;
  commitMessage: string | null;
  isGitRepo: boolean;
}

export async function getGitInfoAction(folderPath: string): Promise<GitInfo> {
  try {
    const gitDir = path.join(folderPath, '.git');

    if (!fs.existsSync(gitDir)) {
      return {
        branch: null,
        commitSha: null,
        commitMessage: null,
        isGitRepo: false,
      };
    }

    let branch: string | null = null;
    let commitSha: string | null = null;
    let commitMessage: string | null = null;

    // Try git CLI first (more reliable)
    try {
      const cwd = folderPath;
      if (!branch) {
        const out = execSync('git rev-parse --abbrev-ref HEAD', { cwd, stdio: ['ignore', 'pipe', 'ignore'] })
          .toString()
          .trim();
        if (out) branch = out;
      }
      if (!commitSha) {
        const out = execSync('git rev-parse HEAD', { cwd, stdio: ['ignore', 'pipe', 'ignore'] })
          .toString()
          .trim();
        if (out) commitSha = out;
      }
      if (!commitMessage) {
        const out = execSync('git log -1 --pretty=%B', { cwd, stdio: ['ignore', 'pipe', 'ignore'] })
          .toString()
          .trim();
        if (out) commitMessage = out;
      }
    } catch { }

    // Fallback to reading from .git files if CLI failed
    try {
      const headPath = path.join(gitDir, 'HEAD');
      if (fs.existsSync(headPath)) {
        const head = fs.readFileSync(headPath, 'utf8').trim();
        const match = head.match(/^ref:\s+refs\/heads\/(.+)$/);
        if (match) {
          branch = branch || match[1];
        } else if (/^[0-9a-f]{40}$/i.test(head)) {
          commitSha = commitSha || head;
        }
      }

      if (!commitSha && branch) {
        const refPath = path.join(gitDir, 'refs', 'heads', branch);
        if (fs.existsSync(refPath)) {
          commitSha = commitSha || fs.readFileSync(refPath, 'utf8').trim();
        } else {
          const packed = path.join(gitDir, 'packed-refs');
          if (fs.existsSync(packed)) {
            const lines = fs.readFileSync(packed, 'utf8').split(/\r?\n/);
            const line = lines.find(l => l.endsWith(` refs/heads/${branch}`));
            if (line) commitSha = commitSha || line.split(' ')[0];
          }
        }
      }

      // Only read from logs if we still don't have a commit message
      if (!commitMessage) {
        const logPath = path.join(gitDir, 'logs', 'HEAD');
        if (fs.existsSync(logPath)) {
          const lines = fs.readFileSync(logPath, 'utf8').trim().split(/\r?\n/);
          const last = lines[lines.length - 1] || '';
          const tabIdx = last.indexOf('\t');
          if (tabIdx !== -1) commitMessage = last.slice(tabIdx + 1);
        }
      }
    } catch { }

    return {
      branch,
      commitSha,
      commitMessage,
      isGitRepo: true,
    };
  } catch (error) {
    console.error('Failed to get git info:', error);
    return {
      branch: null,
      commitSha: null,
      commitMessage: null,
      isGitRepo: false,
    };
  }
}
