'use server';

import { saveChat } from '@/lib/chat/db/queries';

export const createChat = async (chatId: string, environmentId: string) => {
  await saveChat({
    id: chatId,
    userId: '',
    organizationId: '',
    title: 'New Chat',
    environmentId,
    visibility: 'private',
  });
};