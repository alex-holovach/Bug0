'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft, History, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';

export function PageHeaderWithTitle({
  title,
  showBackButton = false,
  showSidebarTrigger = true,
  showHistoryButton = false,
  showPlusButton = false,
  onHistoryClick,
  onPlusClick,
  children,
  modelSelector,
}: {
  title: string;
  showBackButton?: boolean;
  showSidebarTrigger?: boolean;
  showHistoryButton?: boolean;
  showPlusButton?: boolean;
  onHistoryClick?: () => void;
  onPlusClick?: () => void;
  children?: React.ReactNode;
  modelSelector?: React.ReactNode;
}) {
  const router = useRouter();

  return (
    <header className="sticky top-0 z-50 bg-background border-b flex flex-wrap md:flex-nowrap items-center justify-between gap-3 p-3 md:gap-4 md:p-4 md:h-12">
      <div className="flex items-center gap-2 w-full md:h-4">
        {showBackButton && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="shrink-0"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Go back</span>
          </Button>
        )}
        {showSidebarTrigger && <SidebarTrigger />}
        {showHistoryButton && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onHistoryClick}
            className="shrink-0"
          >
            <History className="h-4 w-4" />
            <span className="sr-only">Open chat history</span>
          </Button>
        )}
        {showPlusButton && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onPlusClick}
            className="shrink-0"
          >
            <Plus className="h-4 w-4" />
            <span className="sr-only">New chat</span>
          </Button>
        )}

        {(showSidebarTrigger || showHistoryButton || showPlusButton) && (
          <Separator orientation="vertical" className="h-4" />
        )}
        <h1 className="text-base font-medium truncate">{title}</h1>
        {modelSelector && <>{modelSelector}</>}
      </div>
      {children && <div className="w-full md:w-auto">{children}</div>}
    </header>
  );
}
