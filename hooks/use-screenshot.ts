import useSWR from 'swr';
// import { getScreenshot } from '@/actions/puppeteer';
import { SWRKeys } from './key';

export function useScreenshot() {
  const { data, error, isLoading, mutate } = useSWR(
    SWRKeys.screenshot,
    async () => {
      try {
        // const screenshot = await getScreenshot();
        return null;
        // return screenshot;
      } catch (error) {
        console.error('Failed to get screenshot:', error);
        return null;
      }
    },
    {
      refreshInterval: 2000, // Poll every 2 seconds
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      revalidateIfStale: false,
      dedupingInterval: 1000, // Prevent duplicate requests within 1 second
    }
  );

  return {
    data,
    error,
    isLoading,
    mutate,
  };
}
