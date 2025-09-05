"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  ExternalLink,
  Maximize2,
  Minimize2,
  Eye,
  Code,
  MousePointer,
  Terminal,
  Activity,
} from "lucide-react";

export type ViewMode = 'preview' | 'code' | 'logs' | 'traces';

interface BrowserToolbarProps {
  url: string;
  onUrlChange: (url: string) => void;
  onNavigate: (url: string) => void;
  onBack: () => void;
  onForward: () => void;
  onRefresh: () => void;
  onOpenInNewTab: () => void;
  onMaximize: () => void;
  canGoBack: boolean;
  canGoForward: boolean;
  isMaximized: boolean;
  // New props for mode switching and right-side buttons
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  onSelectElement: () => void;
  className?: string;
}

export function BrowserToolbar({
  url,
  onUrlChange,
  onNavigate,
  onBack,
  onForward,
  onRefresh,
  onOpenInNewTab,
  onMaximize,
  canGoBack,
  canGoForward,
  isMaximized,
  viewMode,
  onViewModeChange,
  onSelectElement,
  className = "",
}: BrowserToolbarProps) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      onNavigate(url);
    }
  };

  return (
    <div className={`flex h-12 w-full shrink-0 items-center justify-between gap-2 px-3 border-b ${className}`}>
      <div className="flex min-w-0 flex-1 flex-row items-center gap-1.5">
        {/* Mode Tabs - Left Side */}
        <div className="flex items-center gap-1 mr-2">
          <Button
            variant={viewMode === 'preview' ? 'default' : 'ghost'}
            size="sm"
            className="h-7 px-2"
            onClick={() => onViewModeChange('preview')}
            title="Preview mode"
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'code' ? 'default' : 'ghost'}
            size="sm"
            className="h-7 px-2"
            onClick={() => onViewModeChange('code')}
            title="Code mode"
          >
            <Code className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'logs' ? 'default' : 'ghost'}
            size="sm"
            className="h-7 px-2"
            onClick={() => onViewModeChange('logs')}
            title="Logs"
          >
            <Terminal className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'traces' ? 'default' : 'ghost'}
            size="sm"
            className="h-7 px-2"
            onClick={() => onViewModeChange('traces')}
            title="Traces"
          >
            <Activity className="h-4 w-4" />
          </Button>
        </div>

        {viewMode == 'preview' && (<>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1 flex-1 justify-center">
              <div className="relative flex items-center flex-1 bg-muted/50 border rounded-full h-7 max-w-[500px]">
                <div className="flex items-center pl-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-5 rounded-full p-0.5"
                    onClick={onBack}
                    disabled={!canGoBack}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-5 rounded-full p-0.5"
                    onClick={onForward}
                    disabled={!canGoForward}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>

                <Input
                  type="text"
                  className="flex-1 h-full px-2 text-sm bg-transparent border-0 outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
                  placeholder="Enter URL..."
                  value={url}
                  onChange={(e) => onUrlChange(e.target.value)}
                  onKeyDown={handleKeyDown}
                />

                {/* Action buttons */}
                <div className="flex items-center pr-1 gap-0.5">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-5 rounded-full p-0.5"
                    onClick={onOpenInNewTab}
                    title="Open in new tab"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-5 rounded-full p-0.5"
                    onClick={onRefresh}
                    title="Refresh"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </>)}
      </div>

      {/* Right side buttons */}
      <div className="flex items-center gap-1">
        {/* Developer tools */}
        {/* <Button
          variant="ghost"
          size="icon"
          className="size-6 rounded-md"
          onClick={onSelectElement}
          title="Select element"
        >
          <MousePointer className="h-4 w-4" />
        </Button> */}

        {/* Separator */}
        <div className="w-px h-4 bg-border mx-1" />

        {/* Maximize button */}
        <Button
          variant="ghost"
          size="icon"
          className="size-6 rounded-md"
          onClick={onMaximize}
          title={isMaximized ? "Exit fullscreen" : "Fullscreen"}
        >
          {isMaximized ? (
            <Minimize2 className="h-4 w-4" />
          ) : (
            <Maximize2 className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  );
}
