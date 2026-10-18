// SPDX-FileCopyrightText: 2026 Keresztes Zsolt <https://kereszteszsolt.hu>
// SPDX-License-Identifier: Apache-2.0

import { expect, test, type Locator } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { captureScreenshot, DESKTOP_DIALOG_VIEWPORT, expectFixtureNetworkOnly, MOBILE_CHAT_VIEWPORT, openScreenshotApp } from './screenshot-fixtures';

async function expectSingleLineDescription(tooltip: Locator): Promise<void> {
  const lines = await tooltip.evaluate((element) => {
    const text = element.firstChild!;
    const descriptionEnd = text.textContent!.indexOf('\n');
    const range = document.createRange();
    range.setStart(text, 0);
    range.setEnd(text, descriptionEnd < 0 ? text.textContent!.length : descriptionEnd);
    return range.getClientRects().length;
  });
  expect(lines, 'The destination description fits on the first line on desktop').toBe(1);
}

test('branding: the declared favicon and ICO fallback both use the configured artwork', async ({ page }) => {
  const network = await openScreenshotApp(page);
  await expect(page.locator('link[rel~="icon"]')).toHaveCount(1);
  await expect(page.locator('link[rel="icon"]')).toHaveAttribute('sizes', 'any');
  const branding = JSON.parse(readFileSync(resolve('brand/branding.json'), 'utf8'));
  await expect(page.locator('link[rel="icon"]')).toHaveAttribute('href', `brand/${branding.appFavicon}`);

  const response = await page.request.get('/favicon.ico');
  expect(response.ok()).toBe(true);
  const ico = await response.body();
  expect(ico.readUInt16LE(0)).toBe(0);
  expect(ico.readUInt16LE(2)).toBe(1);
  const entries = Array.from({ length: ico.readUInt16LE(4) }, (_, index) => 6 + index * 16);
  const entry = entries.find((offset) => ico[offset] === 32);
  expect(entry, 'The fallback includes a native 32 px tab icon').toBeDefined();
  const size = ico.readUInt32LE(entry! + 8);
  const offset = ico.readUInt32LE(entry! + 12);
  const matches = await page.evaluate(async ({ source, fallback }) => {
    const render = async (url: string) => {
      const image = new Image();
      image.src = url;
      await image.decode();
      const canvas = document.createElement('canvas');
      canvas.width = canvas.height = 32;
      const context = canvas.getContext('2d')!;
      context.imageSmoothingQuality = 'high';
      context.drawImage(image, 0, 0, 32, 32);
      return context.getImageData(0, 0, 32, 32).data;
    };
    const [svg, icoFrame] = await Promise.all([render(source), render(fallback)]);
    return svg.every((channel, index) => channel === icoFrame[index]);
  }, {
    source: `data:image/svg+xml;base64,${readFileSync(resolve('brand', branding.appFavicon)).toString('base64')}`,
    fallback: `data:image/png;base64,${ico.subarray(offset, offset + size).toString('base64')}`,
  });
  expect(matches, 'The ICO fallback matches the configured SVG instead of the Angular template icon').toBe(true);
  expectFixtureNetworkOnly(network);
});

test('branding: About links, speech bubbles and Escape preserve the conversation draft', async ({ page }, testInfo) => {
  await page.setViewportSize(DESKTOP_DIALOG_VIEWPORT);
  const network = await openScreenshotApp(page);
  const draft = page.getByRole('textbox', { name: 'Chat message' });
  await draft.fill('Keep this unsent fixture draft.');
  const about = page.getByRole('button', { name: 'About', exact: true });
  await about.click();
  const dialog = page.getByRole('dialog');
  await expect(page.locator('.about-backdrop')).toHaveCSS('backdrop-filter', 'blur(4px)');
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
  await expectSingleLineDescription(tooltip);
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
    await expectSingleLineDescription(tooltip);
    if (name === 'Ways to support' || name === 'Buy me a Coffee') {
      await page.screenshot({ path: testInfo.outputPath(`${name === 'Ways to support' ? 'support' : 'coffee'}-tooltip.png`) });
    }
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
  await expect(page.locator('.about-backdrop')).toHaveCSS('backdrop-filter', 'blur(4px)');
  await expect(dialog.getByRole('link', { name: 'Ways to support', exact: true })).toBeVisible();
  await expect(dialog.getByRole('link', { name: 'Apache-2.0', exact: true })).toBeVisible();
  expect(await dialog.evaluate((element) => element.scrollWidth <= element.clientWidth)).toBe(true);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await captureScreenshot(page, testInfo.outputPath('about-mobile.png'), MOBILE_CHAT_VIEWPORT);
  for (const name of ['Buy me a Coffee', 'Ways to support']) {
    await dialog.getByRole('link', { name, exact: true }).hover();
    const tooltip = page.locator('.brand-tooltip .mat-mdc-tooltip-surface:visible');
    await expect(tooltip).toBeVisible();
    const bounds = await tooltip.evaluate((element) => ({
      left: element.getBoundingClientRect().left,
      right: element.getBoundingClientRect().right,
      viewport: innerWidth,
      scrollWidth: element.scrollWidth,
      clientWidth: element.clientWidth,
    }));
    expect(bounds.left).toBeGreaterThanOrEqual(7.5);
    expect(bounds.right).toBeLessThanOrEqual(bounds.viewport - 7.5);
    expect(bounds.scrollWidth).toBeLessThanOrEqual(bounds.clientWidth);
    await page.keyboard.press('Escape');
  }
  await dialog.getByRole('button', { name: 'Close about' }).click();
  await expect(dialog).toBeHidden();
  expectFixtureNetworkOnly(network);
});
