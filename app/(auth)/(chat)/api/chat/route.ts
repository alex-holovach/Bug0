import {
  createUIMessageStream,
  streamText,
  JsonToSseTransformStream,
  smoothStream,
  stepCountIs,
  convertToModelMessages,
} from 'ai';
import {
  createStreamId,
  deleteChatById,
  getChatById,
  getMessagesByChatId,
  saveChat,
  saveMessages,
} from '@/lib/chat/db/queries';
import { convertToUIMessages, generateUUID } from '@/lib/chat/utils';
import { generateTitleFromUserMessage } from '../../chat/actions';
import { createTools } from '@/lib/chat/ai/tools';
import { postRequestBodySchema, type PostRequestBody } from './schema';
import {
  createResumableStreamContext,
  type ResumableStreamContext,
} from 'resumable-stream';
import { after } from 'next/server';
import { ChatSDKError } from '@/lib/chat/errors';
import type { ChatMessage } from '@/lib/chat/types';
import type { VisibilityType } from '@/components/chat/visibility-selector';
import { systemPrompt } from '@/lib/chat/ai/prompts';
import { cookies } from 'next/headers';

export const maxDuration = 60;

let globalStreamContext: ResumableStreamContext | null = null;

export function getStreamContext() {
  if (!globalStreamContext) {
    try {
      globalStreamContext = createResumableStreamContext({
        waitUntil: after,
      });
    } catch (error: any) {
      if (error.message.includes('REDIS_URL')) {
        console.log(
          ' > Resumable streams are disabled due to missing REDIS_URL'
        );
      } else {
        console.error(error);
      }
    }
  }

  return globalStreamContext;
}

export async function POST(request: Request) {
  let requestBody: PostRequestBody;

  try {
    const json = await request.json();
    requestBody = postRequestBodySchema.parse(json);
  } catch (_) {
    return new ChatSDKError('bad_request:api').toResponse();
  }

  try {
    const {
      id,
      message,
      selectedVisibilityType,
    }: {
      id: string;
      message: ChatMessage;
      selectedVisibilityType: VisibilityType;
    } = requestBody;

    const chat = await getChatById({ id });

    if (!chat) {
      const title = await generateTitleFromUserMessage({
        message,
      });

      await saveChat({
        id,
        userId: '',
        organizationId: '',
        title,
        visibility: selectedVisibilityType,
        environmentId: '',
      });
    }

    const messagesFromDb = await getMessagesByChatId({ id });
    const uiMessages = [...convertToUIMessages((messagesFromDb as any) || []), message];

    await saveMessages({
      messages: [
        {
          chatId: id,
          id: message.id,
          role: 'user',
          parts: message.parts,
          attachments: [],
          createdAt: new Date().toISOString(),
        },
      ],
    });

    const streamId = generateUUID();
    await createStreamId({ streamId, chatId: id });

    const stream = createUIMessageStream({
      execute: async ({ writer: dataStream }) => {
        // Get project URL from cookie
        const cookieStore = await cookies();
        const projectUrl = cookieStore.get('current-project-url')?.value!;

        console.log('projectUrl', projectUrl);

        const result = streamText({
          model: 'anthropic/claude-sonnet-4',
          system: systemPrompt(),
          messages: convertToModelMessages(uiMessages),
          stopWhen: stepCountIs(500),
          tools: createTools(projectUrl),
          toolChoice: 'auto',
          experimental_transform: smoothStream({ chunking: 'word' }),
          experimental_telemetry: {
            isEnabled: true,
            functionId: 'stream-text',
          },
        });

        result.consumeStream();

        dataStream.merge(
          result.toUIMessageStream({
            sendReasoning: false,
          }),
        );
      },
      generateId: generateUUID,
      onFinish: async ({ messages }) => {
        await saveMessages({
          messages: messages.map((message) => ({
            id: message.id,
            role: message.role,
            parts: message.parts,
            createdAt: new Date().toISOString(),
            attachments: [],
            chatId: id,
          })),
        });
      },
      onError: () => {
        return 'Oops, an error occurred!';
      },
    });

    const streamContext = getStreamContext();

    if (streamContext) {
      return new Response(
        await streamContext.resumableStream(streamId, () =>
          stream.pipeThrough(new JsonToSseTransformStream())
        )
      );
    } else {
      return new Response(stream.pipeThrough(new JsonToSseTransformStream()));
    }
  } catch (error) {
    if (error instanceof ChatSDKError) {
      return error.toResponse();
    }
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return new ChatSDKError('bad_request:api').toResponse();
  }

  const user = { id: '' };
  const organizationId = '';

  if (!user) {
    return new ChatSDKError('unauthorized:chat').toResponse();
  }

  const chat = await getChatById({ id });

  if ((chat as any)?.userId !== user.id && (chat as any)?.organizationId !== organizationId) {
    return new ChatSDKError('forbidden:chat').toResponse();
  }

  const deletedChat = await deleteChatById({ id });

  return Response.json(deletedChat, { status: 200 });
}
