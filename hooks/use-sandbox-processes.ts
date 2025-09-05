import useSWR from 'swr';
import { SWRKeys } from './key';
import { listProcessesOnPorts } from '@/actions/preview';

export function useSandboxProcesses(chatId: string) {
  const { data, error, isLoading, mutate } = useSWR(
    SWRKeys.sandboxProcesses(chatId),
    () => listProcessesOnPorts(chatId),
    {
      revalidateOnFocus: false,
      refreshInterval: 1000,
    }
  );

  return { data: data ?? [], error, isLoading, revalidate: mutate };
}


