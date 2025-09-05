import { getProjectStatusAction, getProjectServerProcessAction } from '@/actions/project-processes';
import Preview from './preview';
import { Chat } from '@/components/chat/chat';
import { Card, CardContent } from '@/components/ui/card';
import { cookies } from 'next/headers';
import { generateUUID } from '@/lib/chat/utils';
import { DEFAULT_CHAT_MODEL } from '@/lib/chat/ai/models';

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

  const cookieStore = await cookies();
  const modelIdFromCookie = cookieStore.get('selected-chat-model');

  const chat = (
    <Chat
      key={chatId}
      id={chatId}
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
    <div className="h-svh w-full flex gap-2 p-2">
      <Card className="w-1/3 h-full overflow-hidden py-0">
        <CardContent className="p-0 h-full">
          {chat}
        </CardContent>
      </Card>
      <Card className="w-2/3 h-full overflow-hidden py-0">
        <CardContent className="p-0 h-full">
          <Preview ports={ports} projectId={projectId} />
        </CardContent>
      </Card>
    </div>
  );
}