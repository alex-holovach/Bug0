'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { Loader2, RefreshCw, ExternalLink, Maximize2, XIcon, PlayIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger, DialogClose, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useChatEnvironment } from '@/hooks/use-chat-environment';
import { FileExplorer } from './file-explorer/file-explorer';
import { useSandboxProcesses } from '@/hooks/use-sandbox-processes';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { createPreviewForPort } from '@/actions/preview';

export function AppPreview({
  className,
  chatId,
}: {
  className?: string;
  chatId: string;
}) {
  const { data: environment, revalidate: reloadEnvironment } = useChatEnvironment(chatId);
  const hasSandbox = Boolean(environment?.sandboxId);
  const hasPreview = Boolean(environment?.previewUrl);
  const [reloadToken, setReloadToken] = useState<number>(0);
  const [isReloading, setIsReloading] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>('code');
  const [isFullscreenOpen, setIsFullscreenOpen] = useState<boolean>(false);
  const fallbackTimerRef = useRef<number | null>(null);
  const [isRunPreviewOpen, setIsRunPreviewOpen] = useState<boolean>(false);
  const { data: processes, isLoading: isLoadingProcesses, revalidate: reloadProcesses } = useSandboxProcesses(chatId);
  const [selectedPort, setSelectedPort] = useState<string>('');
  const [isCreatingPreview, setIsCreatingPreview] = useState<boolean>(false);

  const iframeSrc = useMemo(() => {
    const baseUrl = environment?.previewUrl || '';
    if (!baseUrl) return '';
    const separator = baseUrl.includes('?') ? '&' : '?';
    return `${baseUrl}${separator}r=${reloadToken}`;
  }, [environment?.previewUrl, reloadToken]);

  const fullPreviewUrl = useMemo(() => {
    return environment?.previewUrl ? `https://${environment.previewUrl}` : undefined;
  }, [environment?.previewUrl]);

  // If sandbox is not yet created, show pre-setup UI
  if (!hasSandbox) {
    return (
      <div
        className={cn(
          'h-full w-full bg-card rounded-md overflow-hidden',
          className
        )}
      >
        <div className="flex items-center justify-center h-full w-full p-4">
          <div className="text-sm text-muted-foreground text-center space-y-4">
            {!environment ? (
              <div className="space-y-4">
                <p>Please send a message to start the preview.</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <p>
                  We're setting up your preview environment. This may take a few
                  minutes.
                </p>
                <div className="space-y-2">
                  <p className="text-xs">
                    Tired of waiting? Upgrade to Pro to persist your
                    environments and skip the setup time.
                  </p>
                  <Button variant="outline" asChild>
                    <a
                      href="https://buy.stripe.com/5kQ7sL4Xnc3d34q5AVgIo00"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Upgrade to Pro
                    </a>
                  </Button>
                </div>
              </div>
            )}
          </div>
          {/* <SetupLogsCard className="w-full max-w-lg" /> */}
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'h-full w-full bg-card rounded-md overflow-hidden flex flex-col',
        className
      )}
    >
      <div className="flex items-center justify-between gap-2 px-2 py-1 border-b border-border/50 h-16 relative z-10">
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="flex-1 min-w-0 overflow-hidden"
        >
          <TabsList className="h-8 max-w-full overflow-x-auto">
            <TabsTrigger value="code" className="text-xs">
              Code
            </TabsTrigger>
            <TabsTrigger value="preview" className="text-xs">
              Preview
            </TabsTrigger>
            {/* <TabsTrigger value="logs" className="text-xs">Logs</TabsTrigger> */}
          </TabsList>
        </Tabs>
        <div className="flex items-center gap-1.5 shrink-0">
          <Dialog open={isRunPreviewOpen} onOpenChange={(open) => {
            setIsRunPreviewOpen(open);
            if (open) {
              reloadProcesses();
            }
          }}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm" className="h-7 px-2" aria-label="Run preview">
                <PlayIcon className="h-3.5 w-3.5" />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Select a process to preview</DialogTitle>
                <DialogDescription>Choose a listening port from running processes.</DialogDescription>
              </DialogHeader>
              <div className="flex items-center gap-2">
                <Select value={selectedPort} onValueChange={setSelectedPort}>
                  <SelectTrigger className="min-w-[220px]">
                    <SelectValue placeholder={isLoadingProcesses ? 'Loading...' : 'Select port'} />
                  </SelectTrigger>
                  <SelectContent>
                    {processes.map((p) => (
                      <SelectItem key={p.port} value={String(p.port)}>
                        {p.port} — {p.command} {p.pid ? `(${p.pid})` : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  disabled={!selectedPort || isCreatingPreview}
                  onClick={async () => {
                    if (!selectedPort) return;
                    try {
                      setIsCreatingPreview(true);
                      const res = await createPreviewForPort(chatId, Number(selectedPort));
                      if (res?.url) {
                        // Reload environment to pick up saved previewUrl
                        setReloadToken(Date.now());
                        await reloadEnvironment();
                      }
                      setIsRunPreviewOpen(false);
                      setSelectedPort('');
                    } finally {
                      setIsCreatingPreview(false);
                    }
                  }}
                >
                  {isCreatingPreview ? 'Creating…' : 'Confirm'}
                </Button>
              </div>
              <DialogFooter />
            </DialogContent>
          </Dialog>
          {hasPreview && (
            <Button variant="ghost" size="sm" asChild className="h-7 px-2">
              <a
                href={fullPreviewUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Open app in new tab"
              >
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </Button>
          )}
          <Dialog open={isFullscreenOpen} onOpenChange={setIsFullscreenOpen}>
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2"
                aria-label="Open in fullscreen"
              >
                <Maximize2 className="h-3.5 w-3.5" />
              </Button>
            </DialogTrigger>
            <DialogContent
              showCloseButton={false}
              className="sm:max-w-none w-[90vw] max-w-[90vw] h-[90vh] p-0 overflow-hidden"
            >
              <div className="flex h-full w-full flex-col">
                <div className="flex items-center justify-between h-10 px-3 border-b border-border/50 bg-background/80">
                  <div className="text-xs text-muted-foreground">
                    {activeTab === 'code' ? 'Code' : 'Preview'}
                  </div>
                  <DialogClose asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2"
                      aria-label="Close fullscreen"
                    >
                      <XIcon className="h-3.5 w-3.5" />
                    </Button>
                  </DialogClose>
                </div>
                <div className="flex-1 min-h-0">
                  {activeTab === 'code' ? (
                    <FileExplorer
                      sandboxId={environment?.sandboxId || undefined}
                      reloadToken={reloadToken}
                      onIframeLoad={() => {
                        setIsReloading(false);
                        if (fallbackTimerRef.current) {
                          clearTimeout(fallbackTimerRef.current);
                          fallbackTimerRef.current = null;
                        }
                      }}
                    />
                  ) : (
                    hasPreview ? (
                      <iframe
                        title="App Preview (Fullscreen)"
                        src={`https://${iframeSrc}`}
                        className="w-full h-full border-0"
                        onLoad={() => {
                          setIsReloading(false);
                          if (fallbackTimerRef.current) {
                            clearTimeout(fallbackTimerRef.current);
                            fallbackTimerRef.current = null;
                          }
                        }}
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center">
                        <Button
                          onClick={() => setIsRunPreviewOpen(true)}
                          className="gap-2"
                        >
                          <PlayIcon className="h-4 w-4" /> Run preview
                        </Button>
                      </div>
                    )
                  )}
                </div>
              </div>
            </DialogContent>
          </Dialog>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setIsReloading(true);
              // Fallback in case iframe onLoad doesn't fire
              if (fallbackTimerRef.current) {
                clearTimeout(fallbackTimerRef.current);
              }
              fallbackTimerRef.current = window.setTimeout(() => {
                setIsReloading(false);
                fallbackTimerRef.current = null;
              }, 5000);

              // Trigger reload for both Preview and Code tabs via token bump
              setReloadToken(Date.now());
            }}
            className="h-7 px-2"
            aria-label="Reload preview"
          >
            <RefreshCw
              className={cn('h-3.5 w-3.5', isReloading && 'animate-spin')}
            />
          </Button>
        </div>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="flex-1 flex flex-col min-w-0 relative z-0 overflow-hidden"
      >
        <TabsContent
          value="code"
          className="flex-1 m-0 p-0 min-w-0 overflow-hidden"
        >
          <FileExplorer
            sandboxId={environment?.sandboxId || undefined}
            reloadToken={reloadToken}
            onIframeLoad={() => {
              setIsReloading(false);
              if (fallbackTimerRef.current) {
                clearTimeout(fallbackTimerRef.current);
                fallbackTimerRef.current = null;
              }
            }}
          />
        </TabsContent>
        <TabsContent value="preview" className="flex-1 m-0">
          {hasPreview ? (
            <iframe
              title="App Preview"
              src={`https://${iframeSrc}`}
              className="w-full h-full border-0"
              onLoad={() => {
                setIsReloading(false);
                if (fallbackTimerRef.current) {
                  clearTimeout(fallbackTimerRef.current);
                  fallbackTimerRef.current = null;
                }
              }}
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center">
              <Button
                onClick={() => setIsRunPreviewOpen(true)}
                className="gap-2"
              >
                <PlayIcon className="h-4 w-4" /> Run preview
              </Button>
            </div>
          )}
        </TabsContent>
        {/* <TabsContent value="logs" className="flex-1 m-0 p-0">
          <CommandsLogs chatId={chatId} className="h-full border-0 rounded-none" />
        </TabsContent> */}
      </Tabs>
    </div>
  );
}
