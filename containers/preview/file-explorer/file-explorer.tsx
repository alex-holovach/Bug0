'use client';

import { useMemo, useEffect, useState, useCallback } from 'react';
import { useVsCodeServerUrl } from '@/hooks/use-vs-code-server-url';
import { checkUrl } from '@/actions/check-url';

interface Props {
  sandboxId?: string;
  reloadToken?: number;
  onIframeLoad?: () => void;
}

export function FileExplorer({ sandboxId, reloadToken, onIframeLoad }: Props) {
  const { url, isLoading } = useVsCodeServerUrl(sandboxId || null);
  const [shouldRenderIframe, setShouldRenderIframe] = useState(false);

  useEffect(() => {
    (async () => {
      const res = await checkUrl(url || '');
      if (res) {
        setShouldRenderIframe(true);
        return;
      }

      setTimeout(() => {
        checkUrl(url || '');
      }, 1000);
    })();
  }, [url]);

  console.log('url', url);

  if (!sandboxId) {
    return (
      <div className="h-full w-full flex items-center justify-center text-sm text-muted-foreground">
        No sandbox yet.
      </div>
    );
  }

  const iframeSrc = useMemo(() => {
    if (!url) return '';
    const separator = url?.includes('?') ? '&' : '?';
    const urlWithToken = reloadToken
      ? `${url}${separator}r=${reloadToken}`
      : url;
    return `https://${urlWithToken}`;
  }, [url, reloadToken]);

  return (
    <div className="h-full w-full bg-card rounded-md overflow-hidden">
      {isLoading || !shouldRenderIframe ? (
        <div className="h-full w-full flex items-center justify-center text-sm text-muted-foreground">
          Connecting to VS Code server...
        </div>
      ) : url ? (
        <iframe
          title="VS Code Server"
          src={iframeSrc}
          className="w-full h-full border-0"
          onLoad={onIframeLoad}
        />
      ) : (
        <div className="h-full w-full flex items-center justify-center text-sm text-muted-foreground">
          VS Code server not available on port 8080.
        </div>
      )}
    </div>
  );
}
