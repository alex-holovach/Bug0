'use client';

import useSWR, { mutate as globalMutate } from 'swr';
import { BackgroundAgent } from '@/db/schema';
import { listBackgroundAgents } from '@/actions/background-agents';

export function useBackgroundAgents() {
  const { data, error, isLoading, mutate } = useSWR<BackgroundAgent[]>(
    ['backgroundAgents'],
    () => listBackgroundAgents(),
    { refreshInterval: 2000 }
  );

  return {
    data: data ?? [],
    error,
    isLoading,
    mutate,
  };
}

