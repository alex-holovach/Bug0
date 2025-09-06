'use server';

import { Page } from 'puppeteer';

export async function clickElement(selector: string, page: Page): Promise<string> {
  try {
    // Handle text-based selectors like :contains()
    if (selector.includes(':contains(')) {
      // Extract the text from :contains() selector
      const match = selector.match(/(.+):contains\(['"](.+)['"]\)/);
      if (match) {
        const [, elementType, text] = match;
        // Use XPath to find element by text content
        await page.waitForFunction(
          (elementType: string, text: string) => {
            const xpath = `//${elementType}[contains(text(), '${text}')]`;
            const result = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
            return result.singleNodeValue !== null;
          },
          { timeout: 5000 },
          elementType,
          text
        );

        const element = await page.evaluateHandle(
          (elementType: string, text: string) => {
            const xpath = `//${elementType}[contains(text(), '${text}')]`;
            const result = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
            return result.singleNodeValue;
          },
          elementType,
          text
        );

        if (element) {
          await (element as any).click();
          return `Successfully clicked element with text "${text}"`;
        }
      }
    } else {
      // Standard CSS selector
      await page.waitForSelector(selector, { visible: true, timeout: 5000 });
      await page.click(selector);
      return `Successfully clicked element with selector "${selector}"`;
    }

    throw new Error(`Could not find element with selector: ${selector}`);
  } catch (error: any) {
    if (error.name === 'TimeoutError') {
      return `Timeout: Could not find element with selector "${selector}" within 5 seconds. Element may not exist or may not be visible.`;
    }
    throw error;
  }
}

export async function getCleanDOM(page: Page) {
  return await page.evaluate(() => {
    // Deep clone the document so we don't mess with live DOM
    const clone = document.documentElement.cloneNode(true);

    // Remove unwanted nodes
    const removeNodes = (root: Node) => {
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT, null);
      const toRemove = [];
      while (walker.nextNode()) {
        const node = walker.currentNode;
        const tag = (node as Element).tagName?.toLowerCase();
        if (tag === 'script' || tag === 'style' || tag === 'noscript') {
          toRemove.push(node);
        }
      }
      toRemove.forEach(n => (n as Element).remove());
    };

    removeNodes(clone);

    // Optionally strip comments
    const removeComments = (node: Node) => {
      for (let i = node.childNodes.length - 1; i >= 0; i--) {
        const child = node.childNodes[i];
        if (child.nodeType === Node.COMMENT_NODE) {
          node.removeChild(child);
        } else {
          removeComments(child);
        }
      }
    };
    removeComments(clone);

    return (clone as Element).outerHTML;
  });
}