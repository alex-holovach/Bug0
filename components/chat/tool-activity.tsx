'use client';

import { useMemo } from 'react';
import type { DataUIPart } from 'ai';
import type { CustomUIDataTypes } from '@/lib/chat/types';
import { useDataStream } from '@/components/chat/data-stream-provider';
import { cn } from '@/lib/chat/utils';

interface ActivityItem {
  key: string;
  label: string;
  status: 'loading' | 'done';
}

function statusLabelFor(
  part: DataUIPart<CustomUIDataTypes>
): ActivityItem | null {
  switch (part.type) {
    case 'data-create-sandbox': {
      const status = part.data.status;
      const sandboxId = part.data.sandboxId;
      return {
        key: (part as any).id ?? 'create-sandbox',
        label:
          status === 'loading'
            ? 'Creating sandbox...'
            : sandboxId
              ? `Sandbox created (${sandboxId})`
              : 'Sandbox created',
        status,
      };
    }
    case 'data-generating-files': {
      const status = part.data.status;
      let stage = 'Generating files...';
      if (status === 'uploading') stage = 'Uploading generated files...';
      if (status === 'uploaded') stage = 'Uploaded generated files';
      if (status === 'done') stage = 'Finished generating files';
      return {
        key: (part as any).id ?? 'generating-files',
        label: stage,
        status: status === 'done' ? 'done' : 'loading',
      };
    }
    case 'data-run-command': {
      const { command, status } = part.data;
      return {
        key: (part as any).id ?? `run-command-${command}`,
        label: status === 'loading' ? `Running: ${command}` : `Ran: ${command}`,
        status,
      };
    }
    case 'data-wait-command': {
      const { command, status, exitCode } = part.data;
      return {
        key: (part as any).id ?? `wait-command-${command}`,
        label:
          status === 'loading'
            ? `Waiting for: ${command}`
            : `Completed: ${command} (exit ${exitCode ?? 0})`,
        status,
      };
    }
    case 'data-get-sandbox-url': {
      const { status, url } = part.data;
      return {
        key: (part as any).id ?? 'get-sandbox-url',
        label:
          status === 'loading'
            ? 'Fetching preview URL...'
            : `Preview ready: ${url}`,
        status,
      };
    }
    default:
      return null;
  }
}

export function ToolActivity() {
  const { dataStream } = useDataStream();

  const items = useMemo(() => {
    if (!dataStream?.length) return [] as ActivityItem[];

    const map = new Map<string, ActivityItem>();

    for (const part of dataStream) {
      const item = statusLabelFor(part as DataUIPart<CustomUIDataTypes>);
      if (!item) continue;
      // Always keep the latest state per key
      map.set(item.key, item);
    }

    // Sort so loading items show first, then done
    return Array.from(map.values()).sort((a, b) => {
      if (a.status === b.status) return 0;
      return a.status === 'loading' ? -1 : 1;
    });
  }, [dataStream]);

  if (!items.length) return null;

  return (
    <div className="w-full mx-auto max-w-3xl px-4">
      <div
        className={cn(
          'w-full rounded-lg border dark:border-zinc-700 border-zinc-200 px-3 py-2',
          'bg-muted text-muted-foreground'
        )}
      >
        <div className="text-xs font-medium mb-1">Tool activity</div>
        <ul className="text-sm space-y-1">
          {items.map(item => (
            <li key={item.key} className="flex items-center gap-2">
              {item.status === 'loading' ? (
                <span className="inline-flex h-4 w-4 items-center justify-center">
                  <span className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
                </span>
              ) : (
                <span className="inline-flex h-4 w-4 items-center justify-center text-emerald-500">
                  ✓
                </span>
              )}
              <span
                className={cn({ 'text-foreground': item.status === 'loading' })}
              >
                {item.label}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
