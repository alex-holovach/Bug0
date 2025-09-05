import type { UIMessageStreamWriter, UIMessage } from 'ai';
import type { DataPart } from '../messages/data-parts';
import { tool } from 'ai';
import z from 'zod';
import { createVibeKitClient } from '@/lib/vibekit/utils';
import { getIntegrationByID } from '@/actions/integrations';
import { getSelectedRepo } from '@/actions/chat';

interface Params {
  modelId: string;
  writer: UIMessageStreamWriter<UIMessage<never, DataPart>>;
  chatId: string;
}

export const runCodex = ({ writer, modelId, chatId }: Params) =>
  tool({
    description: 'Generate code in the sandbox.',
    inputSchema: z.object({
      sandboxId: z.string(),
      prompt: z
        .string()
        .describe(
          `Prompt to generate the code or run a command like npm run dev or any other command. 
          When running app or any long running commands make sure to mention to run it in the background.
          Codex will generate the file content based on this prompt.`
        ),
      mode: z
        .enum(['code', 'ask'])
        .describe(
          'Ask the question about code base or generate code based on the prompt.'
        ),
    }),
    execute: async ({ sandboxId, prompt, mode }, { toolCallId, messages }) => {
      writer.write({
        id: toolCallId,
        type: 'data-generating-files',
        data: { paths: [], status: 'generating' },
      });

      const integration = await getIntegrationByID('github');
      const accessToken =
        (integration?.metadata as { accessToken: string })?.accessToken || '';

      let vibeKit = await createVibeKitClient();

      const selectedRepo = await getSelectedRepo(chatId);

      if (selectedRepo) {
        vibeKit = vibeKit.withGithub({
          token: accessToken,
          repository: selectedRepo,
        });
      }

      vibeKit = vibeKit.withSession(sandboxId);

      const result = await vibeKit.generateCode({
        prompt,
        mode: mode,
      });

      console.log('result', result);

      return `Successfully generated code.` + result;
    },
  });
