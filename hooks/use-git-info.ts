import useSWR from 'swr';
import { getGitInfoAction, GitInfo } from '@/actions/git';
import { SWRKeys } from './key';

export function useGitInfo(folderPath: string | undefined) {
  const { data: result, error, isLoading, mutate } = useSWR(
    folderPath ? SWRKeys.gitInfo(folderPath) : null,
    async () => {
      if (!folderPath) return null;
      return await getGitInfoAction(folderPath);
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      revalidateIfStale: false,
    }
  );

  return {
    gitInfo: result || null,
    error,
    isLoading,
    mutate,
  };
}
