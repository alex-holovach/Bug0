'use client';

import { Button } from '../ui/button';
import { Play } from 'lucide-react';

export function RunProject({ chatId }: { chatId: string }) {
  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        className="flex items-center gap-2"
        onClick={() => {
          console.log('Run project clicked for chat:', chatId);
        }}
      >
        <Play className="h-4 w-4" />
        Run Project
      </Button>
    </div>
  );
}
