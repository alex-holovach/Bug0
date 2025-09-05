'use client';

import { useCallback, useState } from 'react';
import { Clock } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { TimeRange } from '@/types/trace';
import { getTimePeriodGranularity } from '@/lib/granularity';

export interface TimePeriod {
  label: string;
  value: string;
  ms: number;
}

// Time period options for the dropdown
export const TIME_PERIODS: TimePeriod[] = [
  { label: '1 minute', value: '1m', ms: 60 * 1000 },
  { label: '5 minutes', value: '5m', ms: 5 * 60 * 1000 },
  { label: '15 minutes', value: '15m', ms: 15 * 60 * 1000 },
  { label: '30 minutes', value: '30m', ms: 30 * 60 * 1000 },
  { label: '1 hour', value: '1h', ms: 60 * 60 * 1000 },
  { label: '3 hours', value: '3h', ms: 3 * 60 * 60 * 1000 },
  { label: '6 hours', value: '6h', ms: 6 * 60 * 60 * 1000 },
  { label: '12 hours', value: '12h', ms: 12 * 60 * 60 * 1000 },
  { label: '24 hours', value: '24h', ms: 24 * 60 * 60 * 1000 },
  { label: '2 days', value: '2d', ms: 2 * 24 * 60 * 60 * 1000 },
  { label: '7 days', value: '7d', ms: 7 * 24 * 60 * 60 * 1000 },
  { label: '30 days', value: '30d', ms: 30 * 24 * 60 * 60 * 1000 },
];

interface TimePeriodSelectorProps {
  value?: string;
  onValueChange?: (value: string) => void;
  onTimeRangeChange?: (timeRange: TimeRange) => void;
  className?: string;
}

export interface TimePeriodUtils {
  selectedTimePeriod: string;
  setSelectedTimePeriod: (value: string) => void;
  getStartDate: () => Date;
  getEndDate: () => Date;
  getTimeRange: () => TimeRange;
  getGranularity: () => string;
}

export function TimePeriodSelector({
  value,
  onValueChange,
  onTimeRangeChange,
  className,
}: TimePeriodSelectorProps) {
  const handleValueChange = (newValue: string) => {
    onValueChange?.(newValue);

    // Calculate and emit time range
    const timePeriod = TIME_PERIODS.find(period => period.value === newValue);
    if (timePeriod && onTimeRangeChange) {
      const end = new Date();
      const start = new Date(end.getTime() - timePeriod.ms);
      onTimeRangeChange({ start, end });
    }
  };

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <Clock className="h-4 w-4 text-muted-foreground" />
      <Select value={value} onValueChange={handleValueChange}>
        <SelectTrigger className="w-[140px] h-8 bg-background border-border text-foreground text-sm">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="bg-background border-border">
          {TIME_PERIODS.map(period => (
            <SelectItem
              key={period.value}
              value={period.value}
              className="text-foreground hover:bg-accent hover:text-accent-foreground"
            >
              {period.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

export function useTimePeriod(defaultValue: string = '1h'): TimePeriodUtils {
  const [selectedTimePeriod, setSelectedTimePeriod] = useState(defaultValue);

  // Calculate start date based on selected time period
  const getStartDate = useCallback(() => {
    const timePeriod = TIME_PERIODS.find(
      period => period.value === selectedTimePeriod
    );
    return new Date(Date.now() - (timePeriod?.ms || 60 * 60 * 1000));
  }, [selectedTimePeriod]);

  // Calculate end date (current time)
  const getEndDate = useCallback(() => {
    return new Date();
  }, []);

  // Get complete time range
  const getTimeRange = useCallback((): TimeRange => {
    return {
      start: getStartDate(),
      end: getEndDate(),
    };
  }, [getStartDate, getEndDate]);

  // Calculate granularity to display at most 100 points
  const getGranularity = useCallback(() => {
    const timePeriod = TIME_PERIODS.find(
      period => period.value === selectedTimePeriod
    );
    const durationMs = timePeriod?.ms || 60 * 60 * 1000;
    return getTimePeriodGranularity(durationMs, 100);
  }, [selectedTimePeriod]);

  return {
    selectedTimePeriod,
    setSelectedTimePeriod,
    getStartDate,
    getEndDate,
    getTimeRange,
    getGranularity,
  };
}
