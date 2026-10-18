// SPDX-FileCopyrightText: 2026 Keresztes Zsolt <https://kereszteszsolt.hu>
// SPDX-License-Identifier: Apache-2.0

import { readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const brand = JSON.parse(await readFile(resolve(root, 'brand/branding.json'), 'utf8'));
const source = brand.appFavicon;
if (!source.startsWith('assets/') || source.includes('\\') || source.split('/').includes('..') || !source.endsWith('.svg')) {
  throw new Error('The favicon source must be an SVG inside brand/assets/.');
}
const svg = await readFile(resolve(root, 'brand', source));
const browser = await chromium.launch();

try {
  const page = await browser.newPage();
  const frames = await page.evaluate(async (url) => {
    const image = new Image();
    image.src = url;
    await image.decode();
    return [16, 32, 48, 64].map((size) => {
      const canvas = document.createElement('canvas');
      canvas.width = canvas.height = size;
      const context = canvas.getContext('2d');
      if (!context) throw new Error('Canvas rendering is unavailable.');
      context.imageSmoothingQuality = 'high';
      context.drawImage(image, 0, 0, size, size);
      return { size, png: canvas.toDataURL('image/png').split(',')[1] };
    });
  }, `data:image/svg+xml;base64,${svg.toString('base64')}`);

  const directory = Buffer.alloc(6 + frames.length * 16);
  directory.writeUInt16LE(1, 2);
  directory.writeUInt16LE(frames.length, 4);
  const images = [];
  let offset = directory.length;
  for (const [index, frame] of frames.entries()) {
    const png = Buffer.from(frame.png, 'base64');
    const entry = 6 + index * 16;
    directory[entry] = directory[entry + 1] = frame.size;
    directory.writeUInt16LE(1, entry + 4);
    directory.writeUInt16LE(32, entry + 6);
    directory.writeUInt32LE(png.length, entry + 8);
    directory.writeUInt32LE(offset, entry + 12);
    images.push(png);
    offset += png.length;
  }
  await writeFile(resolve(root, 'public/favicon.ico'), Buffer.concat([directory, ...images]));
  console.log(`Generated public/favicon.ico from brand/${source} (${frames.map((frame) => frame.size).join(', ')} px).`);
} finally {
  await browser.close();
}
