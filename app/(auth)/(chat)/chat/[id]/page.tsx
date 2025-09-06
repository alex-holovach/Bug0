import { notFound } from 'next/navigation';
import { Chat } from '@/components/chat/chat';
import { getChatById, getMessagesByChatId } from '@/lib/chat/db/queries';
import { DataStreamHandler } from '@/components/chat/data-stream-handler';
import { convertToUIMessages } from '@/lib/chat/utils';
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from '@/components/ui/resizable';
import Preview from '@/app/(auth)/projects/[id]/preview';

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

  const chatComponent = (
    <Chat
      id={chat.id}
      initialMessages={uiMessages}
      initialVisibilityType={"private"}
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
        <ResizablePanel defaultSize={60} minSize={30}>
          {chatComponent}
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={40} minSize={25}>
          <Preview />
        </ResizablePanel>
      </ResizablePanelGroup>
      <DataStreamHandler />
    </>
  );
}
