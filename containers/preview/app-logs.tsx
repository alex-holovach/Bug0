'use client';

import useSWR from 'swr';
import { Card, CardHeader } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { SquareChevronRight } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { useChatEnvironment } from '@/hooks/use-chat-environment';

interface CommandsLogsProps {
  className?: string;
  chatId: string;
}

export function CommandsLogs({ className, chatId }: CommandsLogsProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  // Fetch sandbox environment data using existing SWR hook
  const { data: environment, isLoading: isEnvironmentLoading } =
    useChatEnvironment(chatId);
  const sandboxId = environment?.sandboxId;

  const { data: logsContent = '', isLoading: isLogsLoading } = useSWR(
    sandboxId
      ? `/api/sandboxes/${sandboxId}/files?path=${encodeURIComponent('/tmp/ship-or-die.log')}`
      : null,
    async (pathname: string, init?: RequestInit) => {
      const response = await fetch(pathname, init);
      if (!response.ok) {
        // Treat missing file or read error as empty content
        return '';
      }
      const text = await response.text();
      return text;
    },
    { refreshInterval: 1000, revalidateOnFocus: false }
  );

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logsContent]);

  // Show loading state while fetching environment
  if (isEnvironmentLoading) {
    return (
      <Card className={className}>
        <div className="h-[calc(100%-2rem)] flex items-center justify-center">
          <div className="text-sm text-muted-foreground">
            Loading sandbox environment...
          </div>
        </div>
      </Card>
    );
  }

  // Show message if no sandbox is available
  if (!sandboxId) {
    return (
      <Card className={className}>
        <div className="h-[calc(100%-2rem)] flex items-center justify-center">
          <div className="text-sm text-muted-foreground">
            No sandbox environment available. Please create a sandbox first.
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <div className="h-[calc(100%-2rem)]">
        <ScrollArea className="h-full">
          <div className="p-2">
            <pre className="whitespace-pre-wrap font-mono text-sm">
              {isLogsLoading || logsContent.length === 0
                ? 'No logs yet'
                : logsContent}
            </pre>
            <div ref={bottomRef} />
          </div>
        </ScrollArea>
      </div>
    </Card>
  );
}
