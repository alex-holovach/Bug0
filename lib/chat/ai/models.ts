import { createOpenRouter } from '@openrouter/ai-sdk-provider';

export const DEFAULT_CHAT_MODEL: string = 'anthropic/claude-sonnet-4';

export interface ChatModel {
  id: string;
  name: string;
  description: string;
}

export const chatModels: Array<ChatModel> = [
  {
    id: 'openai/gpt-5',
    name: 'GPT-5',
    description: 'Primary model for all-purpose chat',
  },
  {
    id: 'openai/o4-mini',
    name: 'O4 Mini',
    description: 'Uses advanced reasoning',
  },
];

export const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
})('openai/gpt-oss-20b');
