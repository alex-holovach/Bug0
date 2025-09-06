import { Chat } from '@/components/chat/chat';
import { generateUUID } from '@/lib/chat/utils';
import { DataStreamHandler } from '@/components/chat/data-stream-handler';
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from '@/components/ui/resizable';
import Preview from '@/app/(auth)/projects/[id]/preview';

export default async function Page() {
  const id = generateUUID();

  const chat = (
    <Chat
      key={id}
      id={id}
      initialMessages={[]}
      initialVisibilityType="private"
      isReadonly={false}
      autoResume={false}
    />
  );

  const ports = [{
    port: 3001,
    protocol: 'http',
    address: 'localhost',
    state: 'LISTEN',
  }]
  const projectId = 1;

  return (
    <>
      <ResizablePanelGroup
        direction="horizontal"
        className="h-[calc(100vh-4rem)]"
      >
        <ResizablePanel defaultSize={60} minSize={30}>
          {chat}
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={40} minSize={25}>
          <Preview ports={ports} projectId={projectId} />
        </ResizablePanel>
      </ResizablePanelGroup>
      <DataStreamHandler />
    </>
  );
}
