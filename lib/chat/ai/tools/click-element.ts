import { tool } from 'ai';
import { z } from 'zod';
import { clickElement } from '@/actions/puppeteer';
import puppeteer from 'puppeteer';

export const clickElementTool = tool({
  description:
    'Click on an element on the current web page using its CSS selector. The selector should be obtained from the get-interactable-elements tool first to ensure accuracy.',
  inputSchema: z.object({
    selector: z.string().describe('The CSS selector of the element to click (e.g., "#button-id", ".button-class", "button[type="submit"]")'),
    browserUrl: z.string().describe('The URL of the browser to click the element on.'),
  }),
  execute: async ({ selector, browserUrl }) => {
    try {
      const browser = await puppeteer.connect({ browserWSEndpoint: browserUrl });
      const pages = await browser.pages();
      const page = pages[0];
      const result = await clickElement(selector, page);
      await new Promise(resolve => setTimeout(resolve, 1000));
      return result;
    } catch (error: any) {
      console.error('Click element error:', error);
      return `Error: ${error.message || error}`;
    }
  },
});
