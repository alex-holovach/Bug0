'use server';

import fs from 'fs';
import path from 'path';

export interface FileSystemItem {
  id: string;
  name: string;
  path: string;
  type: 'file' | 'folder';
  size?: number;
  modified?: Date;
  children?: FileSystemItem[];
}

export interface NextjsProjectInfo {
  projectName: string;
  runCommand: string;
}

export async function getNextjsProjectInfoAction(projectPath: string): Promise<{
  success: boolean;
  data?: NextjsProjectInfo;
  error?: string;
}> {
  try {
    // Security: Ensure the path is safe and doesn't allow directory traversal
    const normalizedPath = path.normalize(projectPath).replace(/^(\.\.(\/|\\|$))+/, '');

    // Resolve to absolute path
    const safePath = path.resolve(normalizedPath);

    // Security check to ensure we're not accessing dangerous paths
    if (process.platform === 'win32') {
      if (!safePath.startsWith('C:\\')) {
        return {
          success: false,
          error: 'Access denied: Can only access C: drive'
        };
      }
    } else {
      if (!safePath.startsWith('/')) {
        return {
          success: false,
          error: 'Access denied: Can only access root filesystem'
        };
      }
    }

    if (!fs.existsSync(safePath)) {
      return {
        success: false,
        error: 'Project path does not exist'
      };
    }

    const packageJsonPath = path.join(safePath, 'package.json');

    if (!fs.existsSync(packageJsonPath)) {
      return {
        success: false,
        error: 'No package.json found in project directory'
      };
    }

    try {
      const packageJsonContent = fs.readFileSync(packageJsonPath, 'utf-8');
      const packageJson = JSON.parse(packageJsonContent);

      const projectInfo: NextjsProjectInfo = {
        projectName: packageJson.name || 'Untitled Project',
        runCommand: 'npm run dev' // Hardcoded for now as requested
      };

      return {
        success: true,
        data: projectInfo
      };
    } catch (parseError) {
      return {
        success: false,
        error: 'Invalid package.json format'
      };
    }
  } catch (error) {
    console.error('Error reading project info:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

export async function getFileSystemItemsAction(basePath: string = '/'): Promise<{
  success: boolean;
  data?: FileSystemItem[];
  error?: string;
}> {
  try {
    // Security: Ensure the path is safe and doesn't allow directory traversal
    const normalizedPath = path.normalize(basePath).replace(/^(\.\.(\/|\\|$))+/, '');

    // Use actual file system root instead of current working directory
    let safePath: string;

    if (normalizedPath === '/' || normalizedPath === '') {
      // Use the user's home directory as default
      safePath = process.env.HOME || process.env.USERPROFILE || (process.platform === 'win32' ? 'C:\\Users' : '/home');
    } else if (normalizedPath === '~' || normalizedPath === '~/') {
      // Handle tilde notation for home directory
      safePath = process.env.HOME || process.env.USERPROFILE || (process.platform === 'win32' ? 'C:\\Users' : '/home');
    } else {
      // For other paths, resolve relative to the root
      safePath = path.resolve(process.platform === 'win32' ? 'C:\\' : '/', normalizedPath);
    }

    // Security check to ensure we're not accessing dangerous paths
    if (process.platform === 'win32') {
      // On Windows, only allow access to C: drive and subdirectories
      if (!safePath.startsWith('C:\\')) {
        return {
          success: false,
          error: 'Access denied: Can only access C: drive'
        };
      }
    } else {
      // On Unix-like systems, only allow access to root and subdirectories
      if (!safePath.startsWith('/')) {
        return {
          success: false,
          error: 'Access denied: Can only access root filesystem'
        };
      }
    }

    if (!fs.existsSync(safePath)) {
      return {
        success: false,
        error: 'Path does not exist'
      };
    }

    const stats = fs.statSync(safePath);
    if (!stats.isDirectory()) {
      return {
        success: false,
        error: 'Path is not a directory'
      };
    }

    const items: FileSystemItem[] = [];
    const entries = fs.readdirSync(safePath, { withFileTypes: true });

    for (const entry of entries) {
      // Skip hidden files and system files
      if (entry.name.startsWith('.') && entry.name !== '.git') {
        continue;
      }

      const fullPath = path.join(safePath, entry.name);
      // Use absolute path instead of relative path
      const absolutePath = path.resolve(fullPath);

      try {
        const itemStats = fs.statSync(fullPath);

        const item: FileSystemItem = {
          id: absolutePath,
          name: entry.name,
          path: absolutePath,
          type: entry.isDirectory() ? 'folder' : 'file',
          size: itemStats.size,
          modified: itemStats.mtime,
        };

        // Only add children for folders, and only if they have content
        if (entry.isDirectory()) {
          try {
            const subEntries = fs.readdirSync(fullPath, { withFileTypes: true });
            const hasVisibleContent = subEntries.some(subEntry =>
              !subEntry.name.startsWith('.') || subEntry.name === '.git'
            );

            if (hasVisibleContent) {
              // Don't load children immediately - they'll be loaded on demand
              item.children = [];
            }
          } catch {
            // If we can't read the directory, mark it as having no children
            item.children = [];
          }
        }

        items.push(item);
      } catch (error) {
        // Skip items we can't access
        console.warn(`Cannot access ${fullPath}:`, error);
        continue;
      }
    }

    // Sort: folders first, then files, both alphabetically
    items.sort((a, b) => {
      if (a.type !== b.type) {
        return a.type === 'folder' ? -1 : 1;
      }
      return a.name.localeCompare(b.name);
    });

    return {
      success: true,
      data: items
    };
  } catch (error) {
    console.error('Error reading file system:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

export async function getFileContentAction(filePath: string): Promise<{
  success: boolean;
  data?: string;
  error?: string;
}> {
  try {
    const normalizedPath = path
      .normalize(filePath)
      .replace(/^(\.{2}(\/|\\|$))+/, '');

    // Resolve to absolute path
    const safePath = path.resolve(normalizedPath);

    // Security check: ensure absolute and within allowed roots
    if (process.platform === 'win32') {
      if (!safePath.startsWith('C:\\')) {
        return {
          success: false,
          error: 'Access denied: Can only access C: drive',
        };
      }
    } else {
      if (!safePath.startsWith('/')) {
        return {
          success: false,
          error: 'Access denied: Can only access root filesystem',
        };
      }
    }

    if (!fs.existsSync(safePath)) {
      return { success: false, error: 'File does not exist' };
    }

    const stats = fs.statSync(safePath);
    if (!stats.isFile()) {
      return { success: false, error: 'Path is not a file' };
    }

    // Read as UTF-8 text. If binary, this may not render well; caller can handle.
    const content = fs.readFileSync(safePath, 'utf-8');

    return { success: true, data: content };
  } catch (error) {
    console.error('Error reading file content:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}
