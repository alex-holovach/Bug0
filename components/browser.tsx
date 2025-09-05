"use client";

import { useState, useEffect } from "react";

interface BrowserProps {
  url: string;
  className?: string;
}

export default function Browser({
  url: initialUrl,
  className = "",
}: BrowserProps) {
  const [currentUrl, setCurrentUrl] = useState(initialUrl);
  const [key, setKey] = useState(0); // For forcing iframe reload

  // Sync currentUrl with external url prop changes
  useEffect(() => {
    if (initialUrl !== currentUrl) {
      setCurrentUrl(initialUrl);
    }
  }, [initialUrl, currentUrl]);

  return (
    <div
      id="browser-container"
      className={`relative grid h-full min-h-[512px] flex-1 overflow-hidden rounded-lg border bg-background ${className}`}
    >
      <div className="flex size-full flex-col">
        {/* Browser content */}
        <div className="h-full min-h-0 w-full min-w-0">
          <div className="bg-muted/20 h-full min-h-0 overflow-hidden">
            <div className="size-full">
              <iframe
                key={key}
                id="browser-iframe"
                src={currentUrl}
                className="h-full w-full select-none border-0"
                title="Browser content"
                allow="fullscreen; camera; microphone; gyroscope; accelerometer; geolocation; clipboard-write; autoplay"
                sandbox="allow-scripts allow-same-origin allow-forms allow-downloads allow-popups-to-escape-sandbox allow-pointer-lock allow-popups allow-modals allow-orientation-lock allow-presentation"
                loading="eager"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}