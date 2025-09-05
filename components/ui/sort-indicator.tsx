import { ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SortIndicatorProps {
  sortDirection?: 'asc' | 'desc' | false;
  className?: string;
}

export function SortIndicator({
  sortDirection,
  className,
}: SortIndicatorProps) {
  if (sortDirection === 'asc') {
    return <ArrowUp className={cn('ml-2 h-4 w-4', className)} />;
  }

  if (sortDirection === 'desc') {
    return <ArrowDown className={cn('ml-2 h-4 w-4', className)} />;
  }

  return <ArrowUpDown className={cn('ml-2 h-4 w-4', className)} />;
}
