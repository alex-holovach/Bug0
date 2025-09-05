import useSWR from 'swr';
import { listEnvironmentsAction } from '@/actions/environments';

export function useEnvironments() {
  const { data, error, isLoading, mutate } = useSWR(
    ['environments'],
    async () => {
      const response = await listEnvironmentsAction();
      if (!response.success) {
        throw new Error(response.error);
      }
      return response.data;
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  );

  return {
    environments: data ?? [],
    error,
    isLoading,
    mutate,
  } as const;
}


