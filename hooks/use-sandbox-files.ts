'use client';

import useSWR from 'swr';
import { SWRKeys } from './key';
import { getSandboxFiles } from '@/actions/environment';

export function useSandboxFiles(sandboxId: string | null) {
  const { data, error, isLoading, mutate } = useSWR(
    sandboxId ? SWRKeys.sandboxFiles(sandboxId) : null,
    () => getSandboxFiles(sandboxId!),
    {
      revalidateOnFocus: false,
      refreshInterval: 5000, // Refresh every 5 seconds
    }
  );

  return {
    files: data || [],
    error,
    isLoading,
    mutate,
  };
}
