import { z } from 'zod';
import type { createDocument } from './ai/tools/create-document';
import type { updateDocument } from './ai/tools/update-document';
import type { requestSuggestions } from './ai/tools/request-suggestions';
import type { InferUITool, UIMessage } from 'ai';

import type { Suggestion } from '@/db/schema';

export type DataPart = { type: 'append-message'; message: string };

export const messageMetadataSchema = z.object({
  createdAt: z.string(),
});

export type MessageMetadata = z.infer<typeof messageMetadataSchema>;

type createDocumentTool = InferUITool<ReturnType<typeof createDocument>>;
type updateDocumentTool = InferUITool<ReturnType<typeof updateDocument>>;
type requestSuggestionsTool = InferUITool<
  ReturnType<typeof requestSuggestions>
>;

export type ChatTools = {
  createDocument: createDocumentTool;
  updateDocument: updateDocumentTool;
  requestSuggestions: requestSuggestionsTool;
};

export type CustomUIDataTypes = {
  textDelta: string;
  imageDelta: string;
  sheetDelta: string;
  codeDelta: string;
  suggestion: Suggestion;
  appendMessage: string;
  id: string;
  title: string;
  kind: string;
  clear: null;
  finish: null;
  // Tool progress data parts
  'create-sandbox': {
    sandboxId?: string;
    status: 'loading' | 'done';
  };
  'generating-files': {
    paths: string[];
    status: 'generating' | 'uploading' | 'uploaded' | 'done';
  };
  'run-command': {
    command: string;
    status: 'loading' | 'done';
    commandId?: string;
    sandboxId: string;
  };
  'wait-command': {
    sandboxId: string;
    commandId: string;
    command: string;
    args: string[];
    exitCode?: number;
    status: 'loading' | 'done';
  };
  'get-sandbox-url': {
    url?: string;
    status: 'loading' | 'done';
  };
};

export type ChatMessage = UIMessage<
  MessageMetadata,
  CustomUIDataTypes,
  ChatTools
>;

export interface Attachment {
  name: string;
  url: string;
  contentType: string;
}
