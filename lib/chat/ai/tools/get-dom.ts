import { tool } from 'ai';
import { z } from 'zod';
import { getCleanDOM } from '@/actions/puppeteer';
import puppeteer from 'puppeteer';

export const getDOMTool = tool({
  description:
    'Get DOM of the current web page.',
  inputSchema: z.object({
    browserUrl: z.string().describe('The URL of the browser to get the DOM of.'),
  }),
  execute: async ({ browserUrl }) => {
    try {
      const browser = await puppeteer.connect({ browserWSEndpoint: browserUrl });
      const pages = await browser.pages();
      const page = pages[0];
      const elements = await getCleanDOM(page);
      return elements;
    } catch (error) {
      console.error(error);
      return error;
    }
  },
});
