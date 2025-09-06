'use server';

import { getAvailableModels } from '@/lib/chat/ai/gateway';

export async function getAvailableModelsAction() {
  try {
    const models = await getAvailableModels();

    const allowedModelIds = [
      'openai/gpt-oss-120b',
    ];

    const filteredModels = models.filter(model =>
      allowedModelIds.includes(model.id)
    );

    return { success: true, data: filteredModels };
  } catch (error) {
    console.error('Failed to fetch available models:', error);
    return { success: false, error: 'Failed to fetch available models' };
  }
}
