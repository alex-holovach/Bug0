import useSWR from 'swr';
import { getAvailableModelsAction } from '@/actions/ai-models';

export function useAvailableModels() {
  const {
    data: result,
    error,
    isLoading,
  } = useSWR(
    'available-models',
    async () => {
      const response = await getAvailableModelsAction();
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
    models: result || [],
    error,
    isLoading,
  };
}
