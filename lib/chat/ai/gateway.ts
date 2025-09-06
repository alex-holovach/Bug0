import type { JSONValue } from 'ai';
import type { OpenAIResponsesProviderOptions } from '@ai-sdk/openai';
import { createGatewayProvider, type GatewayModelId } from '@ai-sdk/gateway';

const gateway = createGatewayProvider({
  baseURL: process.env.AI_GATEWAY_BASE_URL,
});

interface AvailableModel {
  id: GatewayModelId;
  name: string;
}

export async function getAvailableModels(): Promise<AvailableModel[]> {
  const response = await gateway.getAvailableModels();
  return [...response.models.map(({ id, name }) => ({ id, name }))];
}

interface ModelOptions {
  model: string;
  providerOptions?: Record<string, Record<string, JSONValue>>;
  headers?: Record<string, string>;
}

export function getModelOptions(modelId: string): any {
  if (modelId === 'openai/gpt-oss-120b') {
    return {
      model: modelId,
    };
  }

  return {
    model: modelId,
  };
}
