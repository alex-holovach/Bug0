import { getDOMTool as getDOM } from './get-dom';
import { clickElementTool } from './click-element';
import { takeScreenshotTool } from './take-screenshot';
import puppeteer from 'puppeteer';
import { tool } from 'ai';
import { z } from 'zod';

export const createBrowserToolWithUrl = (projectUrl: string) => tool({
  description:
    'Create a browser instance.',
  inputSchema: z.object({}),
  execute: async () => {
    try {
      const browser = await puppeteer.launch({
        headless: true,
      });
      const page = await browser.newPage();
      await page.goto(projectUrl, { waitUntil: 'networkidle0' });
      const wsEndpoint = browser.wsEndpoint();
      console.log('Browser created with wsEndpoint:', wsEndpoint);
      await new Promise(resolve => setTimeout(resolve, 2000));
      return wsEndpoint;
    } catch (error) {
      console.error(error);
      return error;
    }
  },
});

export const waitCommandTool = tool({
  description:
    'Use this tool to wait. For example when you wait for loading to finish.',
  inputSchema: z.object({}),
  execute: async () => {
    await new Promise(resolve => setTimeout(resolve, 1000))
    return true;
  },
});

export const createTools = (projectUrl: string) => ({
  createBrowser: createBrowserToolWithUrl(projectUrl),
  getDOM: getDOM,
  clickElement: clickElementTool,
  takeScreenshot: takeScreenshotTool,
  sleep: waitCommandTool,
});

// Default tools for backward compatibility
export const Tools = {
  createBrowser: createBrowserToolWithUrl('http://localhost:3000'),
  getDOM: getDOM,
  clickElement: clickElementTool,
  takeScreenshot: takeScreenshotTool,
  sleep: waitCommandTool,
}
