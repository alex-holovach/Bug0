import { cookies } from 'next/headers';

import { Chat } from '@/components/chat/chat';
import { DEFAULT_CHAT_MODEL } from '@/lib/chat/ai/models';
import { generateUUID } from '@/lib/chat/utils';
import { DataStreamHandler } from '@/components/chat/data-stream-handler';
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from '@/components/ui/resizable';
import { AppPreview } from '@/containers/preview/app-preview';

export default async function Page() {
  const id = generateUUID();

  const cookieStore = await cookies();
  const modelIdFromCookie = cookieStore.get('selected-chat-model');

  const chat = (
    <Chat
      key={id}
      id={id}
      initialMessages={[]}
      initialChatModel={
        modelIdFromCookie ? modelIdFromCookie.value : DEFAULT_CHAT_MODEL
      }
      initialVisibilityType="private"
      isReadonly={false}
      autoResume={false}
    />
  );

  return (
    <>
      <ResizablePanelGroup
        direction="horizontal"
        className="h-[calc(100vh-4rem)]"
      >
        <ResizablePanel defaultSize={55} minSize={30}>
          {chat}
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={45} minSize={25}>
          <AppPreview chatId={id} />
        </ResizablePanel>
      </ResizablePanelGroup>
      <DataStreamHandler />
    </>
  );
}
