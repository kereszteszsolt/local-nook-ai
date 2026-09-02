/*
 * SPDX-FileCopyrightText: 2026 Keresztes Zsolt <https://kereszteszsolt.hu>
 * SPDX-License-Identifier: Apache-2.0
 */

import { expect, test } from '@playwright/test';
import {
  captureScreenshot,
  DESKTOP_CHAT_VIEWPORT,
  DESKTOP_DIALOG_VIEWPORT,
  expectFixtureNetworkOnly,
  expectIntentionalChatRequest,
  MOBILE_CHAT_VIEWPORT,
  openScreenshotApp,
  RICH_RESPONSE,
  RICH_RESPONSE_VIEWPORT,
  SCREENSHOT_MODEL,
  sendFixtureMessage,
} from './screenshot-fixtures';

test('captures the desktop chat view from an isolated fixture conversation', async ({ page }) => {
  await page.setViewportSize(DESKTOP_CHAT_VIEWPORT);
  const networkLog = await openScreenshotApp(page);

  await sendFixtureMessage(page, 'Summarize how this screenshot protects local privacy.');
  await expect(page.getByText('Browser-local history')).toBeVisible();
  expectIntentionalChatRequest(networkLog);

  await captureScreenshot(page, 'desktop-chat.png', DESKTOP_CHAT_VIEWPORT);
  expectFixtureNetworkOnly(networkLog);
});

test('captures deterministic model selection choices', async ({ page }) => {
  await page.setViewportSize(DESKTOP_DIALOG_VIEWPORT);
  const networkLog = await openScreenshotApp(page);

  await page.getByRole('button', { name: new RegExp(SCREENSHOT_MODEL) }).click();
  const menu = page.getByRole('menu');
  await expect(menu).toBeVisible();
  await expect(menu.getByRole('menuitem', { name: SCREENSHOT_MODEL })).toBeVisible();
  await expect(menu.getByRole('menuitem', { name: 'localnook-compact:latest' })).toBeVisible();

  await captureScreenshot(page, 'model-selection.png', DESKTOP_DIALOG_VIEWPORT);
  expectFixtureNetworkOnly(networkLog);
});

test('captures browser-local system prompt management', async ({ page }) => {
  await page.setViewportSize(DESKTOP_DIALOG_VIEWPORT);
  const networkLog = await openScreenshotApp(page);

  await page.locator('button[mattooltip="Show system prompts"]').click();
  const dialog = page.getByRole('dialog');
  await expect(dialog.getByRole('heading', { name: 'System Prompts' })).toBeVisible();
  await expect(dialog.getByRole('heading', { name: 'Rich response formats' })).toBeVisible();
  await expect(dialog.getByRole('switch', { name: 'Deactivate LocalNook rich response formats' })).toBeVisible();

  await captureScreenshot(page, 'system-prompts.png', DESKTOP_DIALOG_VIEWPORT);
  expectFixtureNetworkOnly(networkLog);
});

test('captures rich Markdown, code, KaTeX, Mermaid, and Vega-Lite output', async ({ page }) => {
  await page.setViewportSize(RICH_RESPONSE_VIEWPORT);
  const networkLog = await openScreenshotApp(page, RICH_RESPONSE);

  await sendFixtureMessage(page, 'Render the controlled local rich-response sample.');
  await expect(page.locator('pre code .token.keyword')).toBeVisible();
  await expect(page.locator('.katex')).toBeVisible();
  await expect(page.locator('.mermaid svg')).toBeVisible();
  await expect(page.locator('.vega-lite-chart svg')).toBeVisible();
  await expect(page.locator('.vega-lite-fallback')).toHaveCount(0);
  await expect(page.getByRole('alert')).toHaveCount(0);
  expectIntentionalChatRequest(networkLog);

  await captureScreenshot(page, 'rich-response.png', RICH_RESPONSE_VIEWPORT);
  expectFixtureNetworkOnly(networkLog);
});

test('captures the representative mobile chat layout', async ({ page }) => {
  await page.setViewportSize(MOBILE_CHAT_VIEWPORT);
  const networkLog = await openScreenshotApp(page);

  await sendFixtureMessage(page, 'Show the privacy-safe mobile fixture response.');
  await expect(page.getByRole('heading', { name: 'Fixture reply' })).toBeVisible();
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'auto' }));
  expectIntentionalChatRequest(networkLog);

  await captureScreenshot(page, 'mobile-chat.png', MOBILE_CHAT_VIEWPORT);
  expectFixtureNetworkOnly(networkLog);
});
