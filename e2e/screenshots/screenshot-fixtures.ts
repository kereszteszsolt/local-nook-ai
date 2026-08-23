/*
 * SPDX-FileCopyrightText: 2026 Keresztes Zsolt <https://kereszteszsolt.hu>
 * SPDX-License-Identifier: Apache-2.0
 */

import { expect, type Page, type Route } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

export const SCREENSHOT_APP_ORIGIN = 'http://127.0.0.1:4202';
export const SCREENSHOT_OLLAMA_ORIGIN = 'http://localnook-screenshot.invalid';
export const SCREENSHOT_APP_PATH =
  '/?ollamaHost=http%3A%2F%2Flocalnook-screenshot.invalid';
export const SCREENSHOT_MODEL = 'localnook-screenshot:latest';

export const DESKTOP_CHAT_VIEWPORT = { width: 1440, height: 900 } as const;
export const DESKTOP_DIALOG_VIEWPORT = { width: 1440, height: 1024 } as const;
export const RICH_RESPONSE_VIEWPORT = { width: 1440, height: 1200 } as const;
export const MOBILE_CHAT_VIEWPORT = { width: 390, height: 844 } as const;

export const STANDARD_RESPONSE = [
  '# Fixture reply',
  '',
  'This privacy-safe response was rendered from a controlled local screenshot fixture.',
  '',
  '- No live model was contacted.',
  '- No personal conversation data was loaded.',
].join('\n');

const CHART_SPEC = JSON.stringify({
  $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
  title: 'Deterministic sample',
  description: 'Fixed values supplied by the screenshot fixture.',
  width: 320,
  height: 140,
  data: {
    values: [
      { x: 0, y: 0 },
      { x: 1, y: 1 },
      { x: 2, y: 4 },
      { x: 3, y: 9 },
    ],
  },
  mark: { type: 'line', point: true },
  encoding: {
    x: { field: 'x', type: 'quantitative', title: 'Input' },
    y: { field: 'y', type: 'quantitative', title: 'Output' },
  },
});

export const RICH_RESPONSE = [
  '# Local rendering sample',
  '',
  'Inline math is rendered with KaTeX: $E = mc^2$.',
  '',
  '```typescript',
  'const privacy = "browser-local";',
  'console.log(privacy);',
  '```',
  '',
  '```mermaid',
  'flowchart LR',
  '  Fixture[Controlled fixture] --> Render[LocalNook renderers]',
  '```',
  '',
  '```vega-lite',
  CHART_SPEC,
  '```',
].join('\n');

export interface ScreenshotNetworkLog {
  readonly chatRequests: unknown[];
  readonly unexpectedRequests: string[];
}

const MOTION_RESET = `
  *, *::before, *::after {
    animation-delay: 0s !important;
    animation-duration: 0s !important;
    caret-color: transparent !important;
    scroll-behavior: auto !important;
    transition-delay: 0s !important;
    transition-duration: 0s !important;
  }

  @media (min-width: 1024px) {
    main, aside {
      overflow: hidden !important;
    }
  }
`;

export async function openScreenshotApp(
  page: Page,
  responseContent: string = STANDARD_RESPONSE,
): Promise<ScreenshotNetworkLog> {
  await page.clock.setFixedTime(new Date('2026-08-23T09:42:00.000Z'));
  await page.addInitScript((css) => {
    document.addEventListener('DOMContentLoaded', () => {
      const style = document.createElement('style');
      style.dataset['screenshotFixture'] = 'true';
      style.textContent = css;
      document.head.append(style);
    }, { once: true });
  }, MOTION_RESET);

  const networkLog: ScreenshotNetworkLog = {
    chatRequests: [],
    unexpectedRequests: [],
  };
  await page.context().route('**/*', async (route) => {
    await handleRoute(route, responseContent, networkLog);
  });

  await page.goto(SCREENSHOT_APP_PATH, { waitUntil: 'domcontentloaded' });
  await expect(page.getByText('LocalNook', { exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: new RegExp(SCREENSHOT_MODEL) })).toBeEnabled();
  await expect(page.getByRole('alert')).toHaveCount(0);

  const fontsReady = await page.evaluate(async () => {
    await document.fonts.ready;
    return {
      materialIcons: document.fonts.check('24px "Material Icons"'),
      roboto: document.fonts.check('16px Roboto'),
    };
  });
  expect(fontsReady).toEqual({ materialIcons: true, roboto: true });

  return networkLog;
}

export async function sendFixtureMessage(page: Page, content: string): Promise<void> {
  const composer = page.getByRole('textbox', { name: 'Chat message' });
  await composer.fill(content);
  await page.locator('button[mattooltip="Send message"]').click();
  await expect(page.getByRole('heading', { name: /Fixture reply|Local rendering sample/ })).toBeVisible();
  await expect(page.getByText('Time spent: 00:00:01')).toBeVisible();
  await expect(composer).toBeEnabled();
  await expect(page.locator('button[mattooltip="Stop response"]')).toHaveCount(0);
  await expect(page.getByRole('alert')).toHaveCount(0);
}

export function expectIntentionalChatRequest(networkLog: ScreenshotNetworkLog): void {
  expect(networkLog.chatRequests).toHaveLength(1);
  const request = networkLog.chatRequests[0] as Record<string, unknown>;
  expect(Object.keys(request).sort()).toEqual(['messages', 'model', 'stream', 'think']);
  expect(request['model']).toBe(SCREENSHOT_MODEL);
  expect(request['stream']).toBe(true);
  expect(request['think']).toBe(false);

  const messages = request['messages'];
  expect(Array.isArray(messages)).toBe(true);
  expect(messages as unknown[]).not.toHaveLength(0);
  for (const message of messages as Record<string, unknown>[]) {
    expect(Object.keys(message).sort()).toEqual(['content', 'role']);
    expect(typeof message['content']).toBe('string');
    expect(['assistant', 'system', 'user']).toContain(message['role']);
  }
}

export function expectFixtureNetworkOnly(networkLog: ScreenshotNetworkLog): void {
  expect(networkLog.unexpectedRequests).toEqual([]);
}

export async function captureScreenshot(
  page: Page,
  filename: string,
  dimensions: { readonly width: number; readonly height: number },
): Promise<void> {
  const screenshotPath = resolve(process.cwd(), 'docs', 'screenshots', filename);
  await page.mouse.move(1, 1);
  await expect(page.locator('.mat-ripple-element')).toHaveCount(0);
  await page.evaluate(() => new Promise<void>((resolveFrame) => {
    requestAnimationFrame(() => requestAnimationFrame(() => resolveFrame()));
  }));
  // Motion is disabled before application bootstrap. Avoid a second capture-time
  // style mutation, which can rerasterize antialiased panel corners in Chromium.
  await page.screenshot({
    path: screenshotPath,
    animations: 'allow',
    caret: 'hide',
    scale: 'css',
  });

  const png = readFileSync(screenshotPath);
  expect([...png.subarray(0, 8)]).toEqual([137, 80, 78, 71, 13, 10, 26, 10]);
  expect({
    width: png.readUInt32BE(16),
    height: png.readUInt32BE(20),
  }).toEqual(dimensions);
}

async function handleRoute(
  route: Route,
  responseContent: string,
  networkLog: ScreenshotNetworkLog,
): Promise<void> {
  const request = route.request();
  const url = new URL(request.url());

  if (url.origin === SCREENSHOT_APP_ORIGIN) {
    await route.continue();
    return;
  }

  if (url.origin === SCREENSHOT_OLLAMA_ORIGIN) {
    if (request.method() === 'OPTIONS' && ['/api/chat', '/api/tags'].includes(url.pathname)) {
      await route.fulfill({
        status: 204,
        headers: corsHeaders(request.headers()['access-control-request-headers']),
      });
      return;
    }

    if (request.method() === 'GET' && url.pathname === '/api/tags') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        headers: corsHeaders(),
        body: JSON.stringify({
          models: [
            {
              name: SCREENSHOT_MODEL,
              model: SCREENSHOT_MODEL,
              modified_at: '2026-08-23T09:42:00.000Z',
              size: 4_200_000_000,
              digest: 'fixture-completion-thinking',
              details: {
                parent_model: '',
                format: 'gguf',
                family: 'fixture',
                families: ['fixture'],
                parameter_size: '8B',
                quantization_level: 'Q4_K_M',
              },
              capabilities: ['completion', 'thinking'],
            },
            {
              name: 'localnook-compact:latest',
              model: 'localnook-compact:latest',
              modified_at: '2026-08-23T09:42:00.000Z',
              size: 1_100_000_000,
              digest: 'fixture-completion',
              details: {
                parent_model: '',
                format: 'gguf',
                family: 'fixture',
                families: ['fixture'],
                parameter_size: '3B',
                quantization_level: 'Q4_K_M',
              },
              capabilities: ['completion'],
            },
          ],
        }),
      });
      return;
    }

    if (request.method() === 'POST' && url.pathname === '/api/chat') {
      try {
        networkLog.chatRequests.push(request.postDataJSON());
      } catch {
        networkLog.unexpectedRequests.push('POST /api/chat with invalid JSON');
      }
      await route.fulfill({
        status: 200,
        contentType: 'application/x-ndjson',
        headers: corsHeaders(),
        body: ollamaChatStream(responseContent),
      });
      return;
    }
  }

  networkLog.unexpectedRequests.push(`${request.method()} ${request.url()}`);
  await route.abort('blockedbyclient');
}

function corsHeaders(requestedHeaders = 'content-type'): Record<string, string> {
  return {
    'access-control-allow-headers': requestedHeaders,
    'access-control-allow-methods': 'GET, POST, OPTIONS',
    'access-control-allow-origin': SCREENSHOT_APP_ORIGIN,
    'cache-control': 'no-store',
  };
}

function ollamaChatStream(content: string): string {
  const base = {
    model: SCREENSHOT_MODEL,
    created_at: '2026-08-23T09:42:00.000Z',
  };
  return [
    JSON.stringify({
      ...base,
      message: { role: 'assistant', content, thinking: '' },
      done: false,
    }),
    JSON.stringify({
      ...base,
      message: { role: 'assistant', content: '', thinking: '' },
      done: true,
      done_reason: 'stop',
      total_duration: 1_250_000_000,
      load_duration: 100_000_000,
      prompt_eval_count: 42,
      prompt_eval_duration: 400_000_000,
      eval_count: 84,
      eval_duration: 750_000_000,
    }),
    '',
  ].join('\n');
}
