import dynamic from 'next/dynamic';
import { PulseLoader } from 'react-spinners';
import useSWR from 'swr';

interface Props {
  sandboxId: string;
  path: string;
}

export function FileContent({ sandboxId, path }: Props) {
  const searchParams = new URLSearchParams({ path });
  const content = useSWR(
    `/api/sandboxes/${sandboxId}/files?${searchParams.toString()}`,
    async (pathname: string, init: RequestInit) => {
      const response = await fetch(pathname, init);
      const text = await response.text();
      return text;
    },
    { refreshInterval: 500 }
  );

  if (content.isLoading || !content.data) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-background">
        <div className="flex flex-col items-center space-y-3">
          <PulseLoader color="hsl(var(--primary))" size={8} margin={4} />
          <p className="text-sm text-muted-foreground">Loading file...</p>
        </div>
      </div>
    );
  }

  const MonacoViewer = dynamic(
    () => import('./monaco-viewer').then(m => m.default),
    { ssr: false }
  );
  return (
    <div className="relative h-full w-full">
      <MonacoViewer path={path} code={content.data} />
    </div>
  );
}
