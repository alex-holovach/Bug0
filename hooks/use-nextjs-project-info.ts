import useSWR from 'swr';
import { getNextjsProjectInfoAction, NextjsProjectInfo } from '@/actions/file-system';
import { SWRKeys } from './key';

export function useNextjsProjectInfo(projectPath: string | undefined) {
  const { data: result, error, isLoading, mutate } = useSWR(
    projectPath ? SWRKeys.nextjsProjectInfo(projectPath) : null,
    async () => {
      if (!projectPath) return null;
      return await getNextjsProjectInfoAction(projectPath);
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      revalidateIfStale: false,
    }
  );

  return {
    projectInfo: result?.data || null,
    error,
    isLoading,
    mutate,
  };
}
