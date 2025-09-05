'use server';

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export type ProcessTreeNode = {
  pid: number;
  ppid: number;
  command: string;
  children: ProcessTreeNode[];
};

/**
 * Get the process tree for a given PID
 * @param pid - The parent process ID
 * @returns The process tree starting from the given PID
 */
export async function getProcessTreeAction(pid: number): Promise<ProcessTreeNode | null> {
  try {
    // Get all processes with their parent PIDs
    let command: string;

    if (process.platform === 'darwin') {
      // macOS: use ps to get process tree
      command = 'ps -eo pid,ppid,comm';
    } else if (process.platform === 'linux') {
      // Linux: use ps with similar format
      command = 'ps -eo pid,ppid,comm --no-headers';
    } else {
      console.error(`Unsupported platform: ${process.platform}`);
      return null;
    }

    const { stdout } = await execAsync(command);
    const lines = stdout.split('\n').filter(line => line.trim());

    // Parse process information
    const processes = new Map<number, { pid: number; ppid: number; command: string }>();

    for (const line of lines) {
      const parts = line.trim().split(/\s+/);
      if (parts.length >= 3) {
        const pid = parseInt(parts[0], 10);
        const ppid = parseInt(parts[1], 10);
        const command = parts.slice(2).join(' ');

        if (!isNaN(pid) && !isNaN(ppid)) {
          processes.set(pid, { pid, ppid, command });
        }
      }
    }

    // Build the tree recursively
    function buildTree(rootPid: number): ProcessTreeNode | null {
      const process = processes.get(rootPid);
      if (!process) return null;

      const children: ProcessTreeNode[] = [];

      // Find all children of this process
      for (const [childPid, childProcess] of processes) {
        if (childProcess.ppid === rootPid) {
          const childNode = buildTree(childPid);
          if (childNode) {
            children.push(childNode);
          }
        }
      }

      return {
        pid: process.pid,
        ppid: process.ppid,
        command: process.command,
        children
      };
    }

    return buildTree(pid);

  } catch (error) {
    console.error(`Failed to get process tree for PID ${pid}:`, error);
    return null;
  }
}

/**
 * Get all descendant PIDs of a process
 * @param pid - The parent process ID
 * @returns Array of all descendant PIDs (children, grandchildren, etc.)
 */
export async function getDescendantPidsAction(pid: number): Promise<number[]> {
  const tree = await getProcessTreeAction(pid);
  if (!tree) return [];

  const pids: number[] = [];

  function collectPids(node: ProcessTreeNode) {
    // Don't include the root PID itself, only descendants
    if (node.pid !== pid) {
      pids.push(node.pid);
    }
    for (const child of node.children) {
      collectPids(child);
    }
  }

  collectPids(tree);
  return pids;
}

/**
 * Kill a process and all its descendants
 * @param pid - The parent process ID
 * @param signal - The signal to send (default: SIGTERM)
 * @returns Success status and list of killed PIDs
 */
export async function killProcessTreeAction(pid: number, signal: 'SIGTERM' | 'SIGKILL' = 'SIGTERM'): Promise<{
  success: boolean;
  killedPids: number[];
  errors: string[];
}> {
  try {
    const errors: string[] = [];
    const killedPids: number[] = [];

    // Get all descendant PIDs first
    const descendants = await getDescendantPidsAction(pid);

    // Kill descendants first (bottom-up to avoid orphaned processes)
    for (const descendantPid of descendants.reverse()) {
      try {
        process.kill(descendantPid, signal);
        killedPids.push(descendantPid);
      } catch (error: any) {
        if (error.code !== 'ESRCH') { // ESRCH means process doesn't exist
          errors.push(`Failed to kill PID ${descendantPid}: ${error.message}`);
        }
      }
    }

    // Finally kill the parent
    try {
      process.kill(pid, signal);
      killedPids.push(pid);
    } catch (error: any) {
      if (error.code !== 'ESRCH') {
        errors.push(`Failed to kill parent PID ${pid}: ${error.message}`);
      }
    }

    return {
      success: errors.length === 0,
      killedPids,
      errors
    };

  } catch (error) {
    console.error(`Failed to kill process tree for PID ${pid}:`, error);
    return {
      success: false,
      killedPids: [],
      errors: [error instanceof Error ? error.message : 'Unknown error']
    };
  }
}
