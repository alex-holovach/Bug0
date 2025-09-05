import { cookies } from 'next/headers';
import { notFound, redirect } from 'next/navigation';

import { Chat } from '@/components/chat/chat';
import { getChatById, getMessagesByChatId } from '@/lib/chat/db/queries';
import { DataStreamHandler } from '@/components/chat/data-stream-handler';
import { DEFAULT_CHAT_MODEL } from '@/lib/chat/ai/models';
import { convertToUIMessages } from '@/lib/chat/utils';
import { AppPreview } from '@/containers/preview/app-preview';
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from '@/components/ui/resizable';

export default async function Page(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const { id } = params;
  const chat = await getChatById({ id });

  if (!chat) {
    notFound();
  }

  const messagesFromDb = await getMessagesByChatId({
    id,
  });

  const uiMessages = convertToUIMessages(messagesFromDb);

  const cookieStore = await cookies();
  const chatModelFromCookie = cookieStore.get('selected-chat-model');

  const chatComponent = (
    <Chat
      id={chat.id}
      initialMessages={uiMessages}
      initialChatModel={
        chatModelFromCookie ? chatModelFromCookie.value : DEFAULT_CHAT_MODEL
      }
      initialVisibilityType={chat.visibility}
      isReadonly={false}
      autoResume={true}
    />
  );

  return (
    <>
      <ResizablePanelGroup
        direction="horizontal"
        className="h-[calc(100vh-4rem)]"
      >
        <ResizablePanel defaultSize={55} minSize={30}>
          {chatComponent}
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={45} minSize={25}>
          <AppPreview chatId={chat.id} />
        </ResizablePanel>
      </ResizablePanelGroup>
      <DataStreamHandler />
    </>
  );
}
