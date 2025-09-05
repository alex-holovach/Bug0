import type { InferUITools, UIMessage, UIMessageStreamWriter } from 'ai';
import type { DataPart } from '../messages/data-parts';
import { runCodex } from './run-codex';
import { getSandboxURL } from './get-sandbox-url';
import { waitCommand } from './wait-command';

interface Params {
  modelId: string;
  writer: UIMessageStreamWriter<UIMessage<never, DataPart>>;
  chatId: string;
}

export function tools({ modelId, writer, chatId }: Params) {
  return {
    // runCodex: runCodex({ writer, modelId, chatId }),
    // getSandboxURL: getSandboxURL({ writer, chatId }),
    // waitCommand: waitCommand({ writer }),
  };
}

export type ToolSet = InferUITools<ReturnType<typeof tools>>;
