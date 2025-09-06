"use client";

import { useState, useEffect } from "react";
import Browser from "@/components/browser";
import { BrowserToolbar, type ViewMode } from "@/components/browser-toolbar";
import { TracesContent } from "@/containers/traces/traces-element";
import { Logs } from "@/containers/traces/logs";
import { Explore } from "@/containers/project-files/explore";

interface PreviewProps {
  ports?: any[];
  projectId?: number;
}

export default function Preview({ ports, projectId }: PreviewProps) {
  const [url, setUrl] = useState("");
  const [currentUrl, setCurrentUrl] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [key, setKey] = useState(0); // For forcing iframe reload
  const [isMaximized, setIsMaximized] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('logs');

  // Initialize with the first port when ports are available
  useEffect(() => {
    if (ports && ports.length > 0) {
      const initialUrl = `http://localhost:${ports[0].port}`;
      setUrl(initialUrl);
      setCurrentUrl(initialUrl);
      setHistory([initialUrl]);
      setHistoryIndex(0);
    }
  }, [ports]);

  const handleNavigate = (newUrl: string) => {
    if (newUrl !== currentUrl) {
      const newHistory = [...history.slice(0, historyIndex + 1), newUrl];
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
      setCurrentUrl(newUrl);
    }
  };

  const handleBack = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setCurrentUrl(history[newIndex]);
      setUrl(history[newIndex]);
    }
  };

  const handleForward = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setCurrentUrl(history[newIndex]);
      setUrl(history[newIndex]);
    }
  };

  const handleRefresh = () => {
    setKey((prev) => prev + 1);
  };

  const handleOpenInNewTab = () => {
    window.open(currentUrl, "_blank", "noopener,noreferrer");
  };

  const handleMaximize = () => {
    setIsMaximized(!isMaximized);
  };

  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode);
  };

  const handleSelectElement = () => {
  };

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isMaximized) {
        setIsMaximized(false);
      }
    };

    if (isMaximized) {
      // Prevent body scrolling when maximized
      document.body.style.overflow = "hidden";
      document.addEventListener("keydown", handleEscape);

      return () => {
        document.body.style.overflow = "";
        document.removeEventListener("keydown", handleEscape);
      };
    } else {
      // Restore body scrolling when not maximized
      document.body.style.overflow = "";
    }
  }, [isMaximized]);

  return (
    <div className={isMaximized ? "fixed inset-0 z-50 bg-background" : "w-full h-full overflow-hidden"}>
      <div className="flex h-full flex-col">
        {/* Toolbar */}
        <BrowserToolbar
          url={url}
          onUrlChange={setUrl}
          onNavigate={handleNavigate}
          onBack={handleBack}
          onForward={handleForward}
          onRefresh={handleRefresh}
          onOpenInNewTab={handleOpenInNewTab}
          onMaximize={handleMaximize}
          canGoBack={historyIndex > 0}
          canGoForward={historyIndex < history.length - 1}
          isMaximized={isMaximized}
          viewMode={viewMode}
          onViewModeChange={handleViewModeChange}
          onSelectElement={handleSelectElement}
        />

        {/* Browser content */}
        <div className="flex-1 min-h-0 overflow-y-scroll">
          {viewMode === 'traces' && (
            <TracesContent />
          )}
          {viewMode === 'logs' && (
            <Logs projectId={projectId!} />
          )}
          {viewMode === 'code' && (
            <Explore projectId={projectId!} />
          )}
          {viewMode === 'preview' && ports && ports.length > 0 && (
            <Browser
              url={currentUrl}
              className="border-0 rounded-none"
              key={key}
            />
          )}
        </div>
      </div>
    </div>
  );
}
