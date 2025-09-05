import useSWR, { mutate } from 'swr';
import { getFileSystemItemsAction, FileSystemItem } from '@/actions/file-system';

export function useFileSystem(basePath: string = '/') {
  const { data: result, error, isLoading } = useSWR(
    `file-system-${basePath}`,
    async () => {
      const response = await getFileSystemItemsAction(basePath);
      if (!response.success) {
        throw new Error(response.error);
      }
      return response.data;
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      keepPreviousData: true,
    }
  );

  const refresh = () => {
    mutate(`file-system-${basePath}`);
  };

  const loadFolder = async (folderPath: string) => {
    const response = await getFileSystemItemsAction(folderPath);
    if (!response.success) {
      throw new Error(response.error);
    }

    // Update the cache for this specific path
    mutate(`file-system-${folderPath}`, response.data, false);
    return response.data;
  };

  return {
    items: result || [],
    error,
    isLoading,
    refresh,
    loadFolder
  };
}
