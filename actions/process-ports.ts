'use server';

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export type PortInfo = {
  port: number;
  protocol: string;
  address: string;
  state?: string;
};

/**
 * Find all ports that a process is listening on by its PID
 * @param pid - The process ID to search for
 * @returns Array of port information for the given PID
 */
export async function getPortsByPidAction(pid: number): Promise<PortInfo[]> {
  try {
    const ports: PortInfo[] = [];

    // Determine which command to use based on platform
    let command: string;

    if (process.platform === 'darwin' || process.platform === 'linux') {
      // Try lsof first (most reliable on macOS and Linux)
      command = `lsof -Pan -p ${pid} -i`;
    } else if (process.platform === 'win32') {
      // Windows uses netstat
      command = `netstat -ano | findstr ${pid}`;
    } else {
      throw new Error(`Unsupported platform: ${process.platform}`);
    }

    try {
      const { stdout } = await execAsync(command);

      if (process.platform === 'darwin' || process.platform === 'linux') {
        // Parse lsof output
        const lines = stdout.split('\n').filter(line => line.trim());

        for (const line of lines) {
          // Skip header line
          if (line.startsWith('COMMAND')) continue;

          // lsof format: COMMAND PID USER FD TYPE DEVICE SIZE/OFF NODE NAME
          // Example: node 1234 user 23u IPv4 123456 0t0 TCP *:3000 (LISTEN)
          const tcpMatch = line.match(/TCP\s+([^:]+):(\d+)(?:\s+\(([^)]+)\))?/);
          const udpMatch = line.match(/UDP\s+([^:]+):(\d+)/);

          if (tcpMatch) {
            const address = tcpMatch[1] === '*' ? '0.0.0.0' : tcpMatch[1];
            const port = parseInt(tcpMatch[2], 10);
            const state = tcpMatch[3] || 'ESTABLISHED';

            // Avoid duplicates
            if (!ports.some(p => p.port === port && p.protocol === 'TCP')) {
              ports.push({
                port,
                protocol: 'TCP',
                address,
                state
              });
            }
          }

          if (udpMatch) {
            const address = udpMatch[1] === '*' ? '0.0.0.0' : udpMatch[1];
            const port = parseInt(udpMatch[2], 10);

            // Avoid duplicates
            if (!ports.some(p => p.port === port && p.protocol === 'UDP')) {
              ports.push({
                port,
                protocol: 'UDP',
                address
              });
            }
          }
        }
      } else if (process.platform === 'win32') {
        // Parse Windows netstat output
        const lines = stdout.split('\n').filter(line => line.trim());

        for (const line of lines) {
          // netstat format: Proto Local Address Foreign Address State PID
          // Example: TCP 0.0.0.0:3000 0.0.0.0:0 LISTENING 1234
          const match = line.match(/^\s*(TCP|UDP)\s+([^:]+):(\d+)\s+[^\s]+\s+(\w+)?\s*$/);

          if (match) {
            const protocol = match[1];
            const address = match[2];
            const port = parseInt(match[3], 10);
            const state = match[4];

            // Avoid duplicates
            if (!ports.some(p => p.port === port && p.protocol === protocol)) {
              ports.push({
                port,
                protocol,
                address,
                state
              });
            }
          }
        }
      }
    } catch (error: any) {
      // If lsof fails, try ss command (Linux) or continue with empty results
      if (process.platform === 'linux' && error.code === 'ENOENT') {
        try {
          const { stdout } = await execAsync(`ss -lntp | grep "pid=${pid}"`);
          const lines = stdout.split('\n').filter(line => line.trim());

          for (const line of lines) {
            // ss format: State Recv-Q Send-Q Local Address:Port Peer Address:Port Process
            const match = line.match(/([^:]+):(\d+)\s+.*?pid=\d+/);
            if (match) {
              const address = match[1].trim();
              const port = parseInt(match[2], 10);

              if (!ports.some(p => p.port === port)) {
                ports.push({
                  port,
                  protocol: line.includes('tcp') ? 'TCP' : 'UDP',
                  address: address === '*' ? '0.0.0.0' : address,
                  state: 'LISTEN'
                });
              }
            }
          }
        } catch {
          // If ss also fails, return empty array
        }
      }
    }

    // Sort ports by port number
    return ports.sort((a, b) => a.port - b.port);

  } catch (error) {
    console.error(`Failed to get ports for PID ${pid}:`, error);
    return [];
  }
}

/**
 * Find all listening ports on the system with their associated PIDs
 * @returns Array of all listening ports with process information
 */
export async function getAllListeningPortsAction(): Promise<Array<PortInfo & { pid?: number; command?: string }>> {
  try {
    const ports: Array<PortInfo & { pid?: number; command?: string }> = [];

    let command: string;

    if (process.platform === 'darwin') {
      // macOS: Use lsof to get all listening ports
      command = 'lsof -Pan -iTCP -sTCP:LISTEN';
    } else if (process.platform === 'linux') {
      // Linux: Try ss first, fallback to lsof or netstat
      command = 'ss -lntp 2>/dev/null || lsof -Pan -iTCP -sTCP:LISTEN 2>/dev/null || netstat -lntp 2>/dev/null';
    } else if (process.platform === 'win32') {
      // Windows: Use netstat
      command = 'netstat -ano | findstr LISTENING';
    } else {
      throw new Error(`Unsupported platform: ${process.platform}`);
    }

    const { stdout } = await execAsync(command);
    const lines = stdout.split('\n').filter(line => line.trim());

    if (process.platform === 'darwin' || (process.platform === 'linux' && stdout.includes('COMMAND'))) {
      // Parse lsof output
      for (const line of lines) {
        if (line.startsWith('COMMAND')) continue;

        // lsof format: COMMAND PID USER FD TYPE DEVICE SIZE/OFF NODE NAME
        const parts = line.split(/\s+/);
        if (parts.length >= 9) {
          const command = parts[0];
          const pid = parseInt(parts[1], 10);
          const name = parts[parts.length - 1];

          const match = name.match(/([^:]+):(\d+)(?:\s+\(([^)]+)\))?/);
          if (match) {
            const address = match[1] === '*' ? '0.0.0.0' : match[1];
            const port = parseInt(match[2], 10);

            if (!ports.some(p => p.port === port)) {
              ports.push({
                port,
                protocol: 'TCP',
                address,
                state: 'LISTEN',
                pid,
                command
              });
            }
          }
        }
      }
    } else if (process.platform === 'linux' && stdout.includes('State')) {
      // Parse ss output
      for (const line of lines) {
        // ss format with process info
        const match = line.match(/LISTEN\s+\d+\s+\d+\s+([^:]+):(\d+).*?users:\(\("([^"]+)",pid=(\d+)/);
        if (match) {
          const address = match[1] === '*' ? '0.0.0.0' : match[1];
          const port = parseInt(match[2], 10);
          const command = match[3];
          const pid = parseInt(match[4], 10);

          if (!ports.some(p => p.port === port)) {
            ports.push({
              port,
              protocol: 'TCP',
              address,
              state: 'LISTEN',
              pid,
              command
            });
          }
        }
      }
    } else if (process.platform === 'win32') {
      // Parse Windows netstat output
      for (const line of lines) {
        const match = line.match(/^\s*TCP\s+([^:]+):(\d+)\s+[^\s]+\s+LISTENING\s+(\d+)/);
        if (match) {
          const address = match[1];
          const port = parseInt(match[2], 10);
          const pid = parseInt(match[3], 10);

          if (!ports.some(p => p.port === port)) {
            ports.push({
              port,
              protocol: 'TCP',
              address,
              state: 'LISTENING',
              pid
            });
          }
        }
      }
    }

    return ports.sort((a, b) => a.port - b.port);

  } catch (error) {
    console.error('Failed to get all listening ports:', error);
    return [];
  }
}
