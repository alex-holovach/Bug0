"use client";

import { useState, useEffect } from "react";
import { useScreenshot } from "@/hooks/use-screenshot";

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

  const { data: screenshot } = useScreenshot();

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
              {screenshot ? (
                <img
                  src={`data:image/png;base64,${screenshot}`}
                  alt="Browser screenshot"
                  className="h-full w-full object-contain select-none"
                />
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}