'use server';

import { spawn } from 'child_process';
import { db } from '@/lib/db';
import { projectsTable } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { writeFileSync, existsSync, statSync, readdirSync, readFileSync, mkdirSync } from 'fs';
import { join, resolve } from 'path';
import { homedir } from 'os';
import { loadProcesses, isProcessRunning, ProcessInfo } from '@/lib/process-utils';
import { killProcessTreeAction, getDescendantPidsAction } from './process-tree';
import { getPortsByPidAction } from './process-ports';

// Store process info in a simple JSON file for persistence across restarts
const PROCESS_LOG_FILE = '/tmp/.bug0-processes.json';

function saveProcesses(processes: Record<number, any>) {
  writeFileSync(PROCESS_LOG_FILE, JSON.stringify(processes, null, 2));
}

export async function startProjectAction(projectId: number) {
  try {
    // Get project details
    const [project] = await db.select().from(projectsTable).where(eq(projectsTable.id, projectId));
    if (!project) {
      throw new Error('Project not found');
    }

    // Verify working directory exists and is accessible
    if (!existsSync(project.path)) {
      throw new Error(`Project directory does not exist: ${project.path}`);
    }

    if (!statSync(project.path).isDirectory()) {
      throw new Error(`Project path is not a directory: ${project.path}`);
    }

    // Resolve to absolute path
    const absolutePath = resolve(project.path);

    // Check if project is already running
    const processes = loadProcesses();
    if (processes[projectId] && processes[projectId].status === 'running') {
      // Check if process is actually still running
      if (isProcessRunning(processes[projectId].processId)) {
        throw new Error('Project is already running');
      } else {
        // Process is dead, remove it and continue
        delete processes[projectId];
      }
    }

    // Build an isolated environment to avoid inheriting this process's env
    const defaultPath = '/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin';
    const isolatedEnv: NodeJS.ProcessEnv = {
      PATH: defaultPath,
      HOME: homedir(),
      SHELL: '/bin/bash',
      // Force processes to use the global /tmp directory
      TMPDIR: '/tmp',
      NODE_ENV: 'development',
      // OpenTelemetry configuration
      OTEL_EXPORTER_OTLP_ENDPOINT: 'http://localhost:3000',
      OTEL_EXPORTER_OTLP_PROTOCOL: 'http/json',
    };

    // Prepare combined log file under /tmp
    const logDir = join('/tmp', 'bug0-logs');
    try {
      mkdirSync(logDir, { recursive: true });
    } catch { }
    const combinedLog = join(logDir, `project-${projectId}-${Date.now()}.log`);

    // Create shell command to change directory and run the project with combined stdout+stderr (chronological order)
    const shellCommand = `cd "${absolutePath}" && ( ${project.runCommand} ) >> "${combinedLog}" 2>&1`;

    let child;

    try {
      // Try the bash approach first
      child = spawn('/bin/bash', ['-c', shellCommand], {
        cwd: process.cwd(),
        detached: true,
        stdio: ['ignore', 'ignore', 'ignore'],
        env: isolatedEnv,
      });
    } catch (error) {
      // Fallback: try with cwd approach
      child = spawn(`${project.runCommand} >> "${combinedLog}" 2>&1`, [], {
        cwd: absolutePath,
        detached: true,
        stdio: ['ignore', 'ignore', 'ignore'],
        shell: true,
        env: isolatedEnv,
      });
    }

    // Add error handling for the spawn
    child.on('error', (error) => {
      console.error(`Failed to spawn process for project ${project.name}:`, error);
    });

    // Use the same combined log file for both fields
    const stdoutLog = combinedLog;
    const stderrLog = combinedLog;

    // Store process info
    const processInfo: ProcessInfo = {
      projectId,
      processId: child.pid!,
      command: project.runCommand,
      workingDirectory: absolutePath, // Store absolute path
      startedAt: new Date().toISOString(),
      status: 'running' as const,
      stdoutLog,
      stderrLog,
    };

    processes[projectId] = processInfo;
    saveProcesses(processes);

    // Update project status in DB
    await db
      .update(projectsTable)
      .set({
        status: 'running'
      })
      .where(eq(projectsTable.id, projectId));

    // Detach the child process completely
    child.unref();

    return { success: true, processId: child.pid };
  } catch (error) {
    console.error('Failed to start project:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function stopProjectAction(projectId: number) {
  try {
    const processes = loadProcesses();
    const processInfo = processes[projectId];

    if (!processInfo || processInfo.status !== 'running') {
      throw new Error('Project is not running');
    }

    // Kill the entire process tree (parent and all descendants)
    console.log(`Stopping project ${projectId} - killing process tree for PID ${processInfo.processId}`);

    // First try graceful termination
    const gracefulResult = await killProcessTreeAction(processInfo.processId, 'SIGTERM');
    console.log(`Gracefully terminated PIDs: ${gracefulResult.killedPids.join(', ')}`);

    if (gracefulResult.errors.length > 0) {
      console.warn('Some processes could not be terminated gracefully:', gracefulResult.errors);
    }

    // Wait 2 seconds for graceful shutdown
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Force kill any remaining processes
    const forceResult = await killProcessTreeAction(processInfo.processId, 'SIGKILL');
    if (forceResult.killedPids.length > 0) {
      console.log(`Force killed remaining PIDs: ${forceResult.killedPids.join(', ')}`);
    }

    // Update process status
    processInfo.status = 'stopped';
    saveProcesses(processes);

    // Update project status in DB
    await db
      .update(projectsTable)
      .set({
        status: 'stopped'
      })
      .where(eq(projectsTable.id, projectId));

    return { success: true };
  } catch (error) {
    console.error('Failed to stop project:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function getProjectStatusAction(projectId: number) {
  try {
    const processes = loadProcesses();
    const processInfo = processes[projectId];

    if (!processInfo) {
      return { status: 'stopped', processId: null };
    }

    // Check if process is actually running
    if (isProcessRunning(processInfo.processId)) {
      // Process is running, check if it's still healthy
      if (processInfo.status === 'running') {
        return {
          status: 'running',
          processId: processInfo.processId,
          startedAt: processInfo.startedAt
        };
      }
    } else {
      // Process is dead, update status
      processInfo.status = 'stopped';
      saveProcesses(processes);
    }

    return { status: 'stopped', processId: null };
  } catch (error) {
    console.error('Failed to get project status:', error);
    return { status: 'stopped', processId: null };
  }
}

export async function getAllProjectsStatusAction() {
  try {
    const processes = loadProcesses();
    const statuses: Record<number, { status: string; processId: number | null; startedAt?: string }> = {};

    for (const [projectId, processInfo] of Object.entries(processes)) {
      const pid = parseInt(projectId);

      if (isProcessRunning(processInfo.processId)) {
        if (processInfo.status === 'running') {
          statuses[pid] = {
            status: 'running',
            processId: processInfo.processId,
            startedAt: processInfo.startedAt
          };
        } else {
          statuses[pid] = { status: 'stopped', processId: null };
        }
      } else {
        // Process is dead
        processInfo.status = 'stopped';
        statuses[pid] = { status: 'stopped', processId: null };
      }
    }

    // Save updated process statuses
    saveProcesses(processes);

    return statuses;
  } catch (error) {
    console.error('Failed to get all projects status:', error);
    return {};
  }
}

// Clean up dead processes on startup
export async function cleanupDeadProcessesAction() {
  try {
    const processes = loadProcesses();
    let hasChanges = false;

    for (const [projectId, processInfo] of Object.entries(processes)) {
      if (processInfo.status === 'running') {
        if (!isProcessRunning(processInfo.processId)) {
          // Process is dead
          processInfo.status = 'stopped';
          hasChanges = true;
        }
      }
    }

    if (hasChanges) {
      saveProcesses(processes);
    }

    return { success: true };
  } catch (error) {
    console.error('Failed to cleanup dead processes:', error);
    return { success: false };
  }
}

// Get log file contents for debugging
export async function getProjectLogsAction(projectId: number) {
  try {
    const processes = loadProcesses();
    const processInfo = processes[projectId];

    if (!processInfo || !processInfo.stdoutLog || !processInfo.stderrLog) {
      return { success: false, error: 'No logs found for project' };
    }

    let stdout = '';
    let stderr = '';
    const sameFile = processInfo.stdoutLog === processInfo.stderrLog;

    try {
      if (existsSync(processInfo.stdoutLog)) {
        stdout = readFileSync(processInfo.stdoutLog, 'utf-8');
        if (sameFile) {
          stderr = stdout;
        }
      }
    } catch (error) {
      console.warn('Could not read stdout log:', error);
    }

    if (!sameFile) {
      try {
        if (existsSync(processInfo.stderrLog)) {
          stderr = readFileSync(processInfo.stderrLog, 'utf-8');
        }
      } catch (error) {
        console.warn('Could not read stderr log:', error);
      }
    }

    return {
      success: true,
      stdout,
      stderr,
      stdoutLogPath: processInfo.stdoutLog,
      stderrLogPath: processInfo.stderrLog,
    };
  } catch (error) {
    console.error('Failed to get project logs:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

/**
 * Get the actual server process info for a project (the process that's listening on ports)
 * This finds the descendant process that's actually serving the application
 */
export async function getProjectServerProcessAction(projectId: number) {
  try {
    const processes = loadProcesses();
    const processInfo = processes[projectId];

    if (!processInfo || processInfo.status !== 'running') {
      return {
        success: false,
        serverPid: null,
        ports: [],
        message: 'Project is not running'
      };
    }

    // Check if the parent process is still running
    if (!isProcessRunning(processInfo.processId)) {
      return {
        success: false,
        serverPid: null,
        ports: [],
        message: 'Parent process is not running'
      };
    }

    // Get all descendant processes
    const descendants = await getDescendantPidsAction(processInfo.processId);

    // Check parent and all descendants for listening ports
    const allPids = [processInfo.processId, ...descendants];
    let serverPid: number | null = null;
    let serverPorts: any[] = [];

    for (const pid of allPids) {
      const ports = await getPortsByPidAction(pid);
      if (ports.length > 0) {
        // Found a process with listening ports - this is likely the server
        serverPid = pid;
        serverPorts = ports;
        break; // Use the first process found with ports (usually the actual server)
      }
    }

    // If we found the server process, return its info
    if (serverPid) {
      return {
        success: true,
        parentPid: processInfo.processId,
        serverPid,
        ports: serverPorts,
        descendants,
        message: `Found server process ${serverPid} listening on ${serverPorts.length} port(s)`
      };
    }

    // No process found listening on ports
    return {
      success: false,
      parentPid: processInfo.processId,
      serverPid: null,
      ports: [],
      descendants,
      message: 'No process found listening on ports'
    };

  } catch (error) {
    console.error('Failed to get project server process:', error);
    return {
      success: false,
      serverPid: null,
      ports: [],
      message: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}
