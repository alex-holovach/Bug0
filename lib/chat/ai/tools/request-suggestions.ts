import { z } from 'zod';
import { streamObject, tool, type UIMessageStreamWriter } from 'ai';
import { getDocumentById, saveSuggestions } from '@/lib/chat/db/queries';
import type { Suggestion } from '@/db/schema';
import { generateUUID } from '@/lib/chat/utils';
import type { ChatMessage } from '@/lib/chat/types';
import { User } from '@workos-inc/node';
import { openrouter } from '@/lib/chat/ai/models';

interface RequestSuggestionsProps {
  user: User;
  organizationId: string;
  dataStream: UIMessageStreamWriter<ChatMessage>;
}

export const requestSuggestions = ({
  user,
  organizationId,
  dataStream,
}: RequestSuggestionsProps) =>
  tool({
    description: 'Request suggestions for a document',
    inputSchema: z.object({
      documentId: z
        .string()
        .describe('The ID of the document to request edits'),
    }),
    execute: async ({ documentId }) => {
      const document = await getDocumentById({ id: documentId });

      if (!document || !document.content) {
        return {
          error: 'Document not found',
        };
      }

      const suggestions: Array<
        Omit<Suggestion, 'userId' | 'createdAt' | 'documentCreatedAt'>
      > = [];

      const { elementStream } = streamObject({
        model: openrouter,
        system:
          'You are a help writing assistant. Given a piece of writing, please offer suggestions to improve the piece of writing and describe the change. It is very important for the edits to contain full sentences instead of just words. Max 5 suggestions.',
        prompt: document.content,
        output: 'array',
        schema: z.object({
          originalSentence: z.string().describe('The original sentence'),
          suggestedSentence: z.string().describe('The suggested sentence'),
          description: z.string().describe('The description of the suggestion'),
        }),
      });

      for await (const element of elementStream) {
        // @ts-ignore todo: fix type
        const suggestion: Suggestion = {
          originalText: element.originalSentence,
          suggestedText: element.suggestedSentence,
          description: element.description,
          id: generateUUID(),
          documentId: documentId,
          isResolved: false,
        };

        dataStream.write({
          type: 'data-suggestion',
          data: suggestion,
          transient: true,
        });

        suggestions.push(suggestion);
      }

      if (user.id) {
        const userId = user.id;

        await saveSuggestions({
          suggestions: suggestions.map((suggestion) => ({
            ...suggestion,
            userId: user.id,
            organizationId,
            createdAt: new Date(),
            documentCreatedAt: document.createdAt,
          })),
        });
      }

      return {
        id: documentId,
        title: document.title,
        kind: document.kind,
        message: 'Suggestions have been added to the document',
      };
    },
  });
