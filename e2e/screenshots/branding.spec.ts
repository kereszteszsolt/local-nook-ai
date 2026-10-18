// SPDX-FileCopyrightText: 2026 Keresztes Zsolt <https://kereszteszsolt.hu>
// SPDX-License-Identifier: Apache-2.0

import { expect, test } from '@playwright/test';
import { captureScreenshot, DESKTOP_DIALOG_VIEWPORT, expectFixtureNetworkOnly, MOBILE_CHAT_VIEWPORT, openScreenshotApp } from './screenshot-fixtures';

test('branding: About links, speech bubbles and Escape preserve the conversation draft', async ({ page }, testInfo) => {
  await page.setViewportSize(DESKTOP_DIALOG_VIEWPORT);
  const network = await openScreenshotApp(page);
  const draft = page.getByRole('textbox', { name: 'Chat message' });
  await draft.fill('Keep this unsent fixture draft.');
  const about = page.getByRole('button', { name: 'About', exact: true });
  await about.click();
  const dialog = page.getByRole('dialog');
  await expect(dialog.getByRole('heading', { name: 'About LocalNook AI' })).toBeVisible();
  await expect(dialog.getByRole('button', { name: 'Close about' })).toBeFocused();
  const poster = dialog.getByRole('img', { name: 'LocalNook AI project poster' });
  await expect(poster).toHaveAttribute('src', 'brand/assets/localnook-ai-poster.svg');
  await expect.poll(() => poster.evaluate((image) => (image as HTMLImageElement).complete && (image as HTMLImageElement).naturalWidth > 0)).toBe(true);
  await expect(page.locator('link[rel="icon"]')).toHaveAttribute('href', 'brand/assets/favicon.svg');
  await captureScreenshot(page, testInfo.outputPath('about-desktop.png'), DESKTOP_DIALOG_VIEWPORT);

  const website = dialog.getByRole('link', { name: 'kereszteszsolt.hu', exact: true });
  await page.keyboard.press('Tab');
  await expect(website).toBeFocused();
  let tooltip = page.locator('.brand-tooltip .mat-mdc-tooltip-surface');
  await expect(tooltip).toBeVisible();
  await expect(tooltip).toHaveText("Author's website. Available in hu | en | ro | de.\nhttps://kereszteszsolt.hu");
  const description = await website.getAttribute('aria-describedby');
  expect(description).toBeTruthy();
  await expect(page.locator(`[id="${description}"]`)).toContainText("Author's website.");
  expect(await page.locator('.brand-tooltip').evaluate((element) => getComputedStyle(element, '::after').content)).toBe('""');
  await page.keyboard.press('Escape');
  await expect(tooltip).toBeHidden();
  await expect(dialog).toBeVisible();

  for (const [name, destination, text] of [
    ['Source', 'https://github.com/kereszteszsolt/local-nook-ai', 'source code on GitHub.'],
    ['GitHub profile', 'https://github.com/kereszteszsolt', "The author's GitHub profile."],
    ['Buy me a Coffee', 'https://buymeacoffee.com/kereszteszsolt', 'Support the author with a coffee on Buy Me a Coffee.'],
    ['Ways to support', 'https://kereszteszsolt.hu/ways-to-support', 'Ways to support the author. Available in hu | en | ro | de.'],
  ]) {
    const link = dialog.getByRole('link', { name, exact: true });
    await expect(link).toHaveAttribute('href', destination);
    await expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    await link.hover();
    tooltip = page.locator('.brand-tooltip .mat-mdc-tooltip-surface:visible');
    await expect(tooltip).toContainText(text);
    await expect(tooltip).toContainText(destination);
    await page.keyboard.press('Escape');
  }

  await page.mouse.move(1, 1);
  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  await expect(about).toBeFocused();
  await expect(draft).toHaveValue('Keep this unsent fixture draft.');
  expectFixtureNetworkOnly(network);
});

test('branding: mobile About and sidebar attribution fit the viewport', async ({ page }, testInfo) => {
  await page.setViewportSize(MOBILE_CHAT_VIEWPORT);
  const network = await openScreenshotApp(page);
  const sidebar = page.getByRole('complementary', { name: 'Conversations' });
  await expect(sidebar).toContainText('© 2026 Keresztes Zsolt, Apache-2.0');
  await expect(sidebar.getByRole('link', { name: 'kereszteszsolt.hu', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'About', exact: true }).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog.getByRole('link', { name: 'Ways to support', exact: true })).toBeVisible();
  await expect(dialog.getByRole('link', { name: 'Apache-2.0', exact: true })).toBeVisible();
  expect(await dialog.evaluate((element) => element.scrollWidth <= element.clientWidth)).toBe(true);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await captureScreenshot(page, testInfo.outputPath('about-mobile.png'), MOBILE_CHAT_VIEWPORT);
  await dialog.getByRole('button', { name: 'Close about' }).click();
  await expect(dialog).toBeHidden();
  expectFixtureNetworkOnly(network);
});
