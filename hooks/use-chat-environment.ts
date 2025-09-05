import useSWR from 'swr';
import { SWRKeys } from './key';
import { getChatEnvironment } from '@/actions/environment';

export function useChatEnvironment(chatId: string) {
  const {
    data,
    error,
    isLoading,
    mutate: revalidate,
  } = useSWR(SWRKeys.sandboxEnvironment(chatId), () => getChatEnvironment(chatId), {
    revalidateOnFocus: false,
  });

  return {
    data,
    isLoading,
    error,
    revalidate,
  };
}
