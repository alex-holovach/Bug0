'use server';

import { getAvailableModels } from '@/lib/chat/ai/gateway';

export async function getAvailableModelsAction() {
  try {
    const models = await getAvailableModels();

    const allowedModelIds = [
      'openai/o4-mini',
      'openai/gpt-5',
      'anthropic/claude-4-sonnet',
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
