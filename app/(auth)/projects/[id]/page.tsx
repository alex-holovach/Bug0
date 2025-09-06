import { getProjectServerProcessAction } from '@/actions/project-processes';
import Preview from './preview';
import { Chat } from '@/components/chat/chat';
import { Card, CardContent } from '@/components/ui/card';
import { generateUUID } from '@/lib/chat/utils';
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from '@/components/ui/resizable';

interface ProjectPageProps {
  params: {
    id: string;
  };
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { id } = await params;
  const projectId = parseInt(id);

  const serverInfo = await getProjectServerProcessAction(projectId);
  const ports = serverInfo.ports.filter((port: any) => port.state === 'LISTEN');

  const chatId = generateUUID();

  const chat = (
    <Chat
      key={chatId}
      id={chatId}
      initialMessages={[]}
      initialVisibilityType="private"
      isReadonly={false}
      autoResume={false}
    />
  );

  return (
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
  );
}