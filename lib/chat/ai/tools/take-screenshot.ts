import { tool } from 'ai';
import { z } from 'zod';
import puppeteer from 'puppeteer';
import { randomUUID } from 'crypto';

export const takeScreenshotTool = tool({
  description:
    'Take a screenshot of the current web page and save it to disk. Returns a unique ID that can be used to reference the screenshot.',
  inputSchema: z.object({
    browserUrl: z.string().describe('The URL of the browser to take screenshot from.'),
    fullPage: z.boolean().optional().describe('Whether to take a full page screenshot or just the viewport. Defaults to false.'),
  }),
  execute: async ({ browserUrl, fullPage = false }) => {
    try {
      const browser = await puppeteer.connect({ browserWSEndpoint: browserUrl });
      const pages = await browser.pages();
      const page = pages[0];

      // Generate unique ID for the screenshot
      const screenshotId = randomUUID();
      const filename = `/tmp/screenshot-${screenshotId}.png` as const;

      // Take screenshot and save directly to disk
      await page.screenshot({
        path: filename,
        fullPage,
        type: 'png',
      });

      console.log(`Screenshot saved: ${filename}`);

      return {
        success: true,
        screenshotId,
        filename,
        message: `Screenshot taken and saved with ID: ${screenshotId}`
      };
    } catch (error: any) {
      console.error('Take screenshot error:', error);
      return {
        success: false,
        error: error.message || error,
        message: `Error taking screenshot: ${error.message || error}`
      };
    }
  },
});
