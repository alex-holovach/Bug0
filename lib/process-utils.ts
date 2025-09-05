import { readFileSync, existsSync } from 'fs';
import { join } from 'path';


const PROCESS_LOG_FILE = '/tmp/.kubiks-processes.json';

export interface ProcessInfo {
  projectId: number;
  processId: number;
  command: string;
  workingDirectory: string;
  startedAt: string;
  status: 'running' | 'stopped' | 'failed';
  stdoutLog?: string;
  stderrLog?: string;
}

export function loadProcesses(): Record<number, ProcessInfo> {
  if (!existsSync(PROCESS_LOG_FILE)) {
    return {};
  }
  try {
    const data = readFileSync(PROCESS_LOG_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return {};
  }
}

export function isProcessRunning(processId: number): boolean {
  try {
    // Signal 0 just checks if process exists
    process.kill(processId, 0);
    return true;
  } catch {
    return false;
  }
}

export function getProcessStatus(processId: number): 'running' | 'stopped' {
  return isProcessRunning(processId) ? 'running' : 'stopped';
}

export function formatUptime(startedAt: string): string {
  const startTime = new Date(startedAt);
  const now = new Date();
  const diff = now.getTime() - startTime.getTime();

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}

export function getLogFilePaths(projectId: number, processId: number): { stdout: string; stderr: string } {
  // Use global /tmp directory to ensure predictable ephemeral location
  const logDir = join('/tmp', 'kubiks-logs');
  return {
    stdout: join(logDir, `project-${projectId}-${processId}-stdout.log`),
    stderr: join(logDir, `project-${projectId}-${processId}-stderr.log`),
  };
}
