import useSWR, { mutate } from 'swr';
import useSWRMutation from 'swr/mutation';
import { deleteIntegration, getIntegrationByID, getIntegrations } from '@/actions/integrations';
import { SWRKeys } from './key';

export function useIntegrations() {
  const {
    data: integrations,
    error,
    isLoading,
  } = useSWR(SWRKeys.integrations, () => getIntegrations());
  return {
    data: integrations,
    isLoading,
    error,
  };
}

export function useDeleteIntegration() {
  const { trigger, isMutating, error } = useSWRMutation(
    SWRKeys.integration('github'),
    async (url: string, { arg }: { arg: string }) => {
      await deleteIntegration(arg);
      mutate(SWRKeys.integrations);
    }
  );
  return {
    trigger,
    isMutating,
    error,
  };
}

export function useGithubIntegration() {
  const {
    data: githubIntegration,
    error,
    isLoading,
  } = useSWR(SWRKeys.integration('github'), () => getIntegrationByID('github'));
  return {
    data: githubIntegration,
    isLoading,
    error,
  };
}

export function useCreatePR(chatId: string) {
  const { trigger, data, error, isMutating } = useSWRMutation(
    SWRKeys.selectedRepo(chatId),
    async () => {
      const res = await fetch('/api/create-pr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chatId }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || 'Failed to create PR');
      }
      return res.json() as Promise<{
        id: number;
        number: number;
        url: string;
        title: string;
        state: string;
      }>;
    }
  );

  return {
    createPR: trigger,
    data,
    error,
    isLoading: isMutating,
  };
}
