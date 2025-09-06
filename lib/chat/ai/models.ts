import { createGatewayProvider } from '@ai-sdk/gateway';

export const DEFAULT_CHAT_MODEL: string = 'openai/gpt-oss-120b';

export interface ChatModel {
  id: string;
  name: string;
  description: string;
}

export const chatModels: Array<ChatModel> = [
  {
    id: 'openai/gpt-oss-120b',
    name: 'GPT-OSS-120B',
    description: 'Primary model for all-purpose chat',
  },
];

const gateway = createGatewayProvider({
  baseURL: process.env.AI_GATEWAY_BASE_URL,
});

export const model = gateway('openai/gpt-oss-120b');
