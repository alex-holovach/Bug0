import {
  createUIMessageStream,
  generateId,
  generateText,
  JsonToSseTransformStream,
} from 'ai';
import { systemPrompt } from '@/lib/chat/ai/prompts';
import {
  createStreamId,
  deleteChatById,
  getChatById,
  getMessageCountByUserId,
  getMessagesByChatId,
  saveChat,
  saveMessages,
} from '@/lib/chat/db/queries';
import { convertToUIMessages, generateUUID } from '@/lib/chat/utils';
import { generateTitleFromUserMessage } from '../../chat/actions';
import { createDocument } from '@/lib/chat/ai/tools/create-document';
import { updateDocument } from '@/lib/chat/ai/tools/update-document';
import { requestSuggestions } from '@/lib/chat/ai/tools/request-suggestions';
import { isProductionEnvironment } from '@/lib/chat/constants';
import { postRequestBodySchema, type PostRequestBody } from './schema';
import { geolocation } from '@vercel/functions';
import {
  createResumableStreamContext,
  type ResumableStreamContext,
} from 'resumable-stream';
import { after } from 'next/server';
import { ChatSDKError } from '@/lib/chat/errors';
import type { ChatMessage } from '@/lib/chat/types';
import type { VisibilityType } from '@/components/chat/visibility-selector';
import { openrouter } from '@/lib/chat/ai/models';

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
      });
    }

    const messagesFromDb = await getMessagesByChatId({ id });
    const uiMessages = [...convertToUIMessages(messagesFromDb), message];

    await saveMessages({
      messages: [
        {
          chatId: id,
          id: message.id,
          role: 'user',
          parts: message.parts,
          attachments: [],
          createdAt: new Date(),
        },
      ],
    });

    const streamId = generateUUID();
    await createStreamId({ streamId, chatId: id });

    const stream = createUIMessageStream({
      execute: async ({ writer: dataStream }) => {
        const messageId = generateId();
        const textId = generateId();

        dataStream.write({ type: 'start', messageId });
        dataStream.write({ type: 'text-start', id: textId });

        try {
          // Prepare VibeKit client with optional GitHub + sandbox context
          const integration = await getIntegrationByID('github');
          const accessToken =
            (integration?.metadata as { accessToken?: string })?.accessToken || '';

          let vibeKit = await createVibeKitClient();

          const selectedRepo = await getSelectedRepo(id);
          if (selectedRepo && accessToken) {
            vibeKit = vibeKit.withGithub({ token: accessToken, repository: selectedRepo });
          }

          const environment = await getChatEnvironment(id);
          const sandboxId = environment?.sandboxId as string | undefined;
          if (sandboxId) {
            vibeKit = vibeKit.withSession(sandboxId);
          }

          const formatPrompt = `
          Given the following VibeKit update, format it as a clean, concise message for the UI. Follow these rules:

          1. For assistant messages with tool use intentions: "I'll [action]... then [action]."
          2. For tool use messages: "[Tool Name] [file path or action]"
          3. For tool results: Show a brief preview in a tiny code block, e.g. "Preview: "content""
          4. For file edits: "Edited [filename]: [number] lines changed" - DO NOT show actual code changes
          5. For final results: Simple summary like "Added '1' to the file."
          6. Suppress final result if it repeats the same sentence as the summary
          7. Never include system details, IDs, token counts, or technical metadata
          8. Keep messages human-readable and conversational
          9. Don't print actual code changes - only mention file names and number of lines modified

          Return only the formatted text, no other text or comments:
          `

          vibeKit.on?.('update', async (update: unknown) => {
            const { text } = await generateText({
              model: openrouter,
              prompt: formatPrompt + JSON.stringify(update),
            });
            dataStream.write({ type: 'text-delta', id: textId, delta: text + '\n' });
          });

          const errorPrompt = `
          Given the following error, format it for the UI. Please only return the formatted text, no other text or comments. Do not include system details like ids, number of tokens used. Only include codex output:
          `

          vibeKit.on?.('error', async (error: unknown) => {
            console.error('VibeKit streaming error:', error);
            const { text } = await generateText({
              model: openrouter,
              prompt: errorPrompt + JSON.stringify(error),
            });
            dataStream.write({ type: 'text-delta', id: textId, delta: text + '\n' });
          });

          // Build prompt from latest user message text parts
          const latestUserMessage = uiMessages.at(-1);
          const prompt = (latestUserMessage?.parts || [])
            .filter(p => p.type === 'text')
            // @ts-ignore - parts narrow to text above
            .map(p => p.text as string)
            .join('\n\n');

          const response = await vibeKit.generateCode({
            prompt,
            mode: 'code',
          });
        } catch (error) {
          console.error('Error running VibeKit generateCode:', error);
          dataStream.write({ type: 'text-delta', id: textId, delta: 'Error running generateCode: ' + JSON.stringify(error) + '\n' });
        } finally {
          dataStream.write({ type: 'text-end', id: textId });
          dataStream.write({ type: 'finish' });
        }
      },
      generateId: generateUUID,
      onFinish: async ({ messages }) => {
        console.log('messages', JSON.stringify(messages, null, 2));
        await saveMessages({
          messages: messages.map(message => ({
            id: message.id,
            role: message.role,
            parts: message.parts,
            createdAt: new Date(),
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

  const { user, organizationId } = await withAuth({ ensureSignedIn: true });

  if (!user) {
    return new ChatSDKError('unauthorized:chat').toResponse();
  }

  const chat = await getChatById({ id });

  if (chat.userId !== user.id && chat.organizationId !== organizationId) {
    return new ChatSDKError('forbidden:chat').toResponse();
  }

  const deletedChat = await deleteChatById({ id });

  return Response.json(deletedChat, { status: 200 });
}
