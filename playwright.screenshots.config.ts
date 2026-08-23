/*
 * SPDX-FileCopyrightText: 2026 Keresztes Zsolt <https://kereszteszsolt.hu>
 * SPDX-License-Identifier: Apache-2.0
 */

import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e/screenshots',
  outputDir: './e2e/test-output/screenshots',
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 45_000,
  expect: {
    timeout: 15_000,
  },
  reporter: [['line']],
  use: {
    baseURL: 'http://127.0.0.1:4202',
    browserName: 'chromium',
    viewport: { width: 1440, height: 1024 },
    deviceScaleFactor: 1,
    locale: 'en-US',
    timezoneId: 'UTC',
    colorScheme: 'light',
    reducedMotion: 'reduce',
    serviceWorkers: 'block',
    screenshot: 'off',
    trace: 'off',
    video: 'off',
    launchOptions: {
      args: ['--disable-gpu', '--font-render-hinting=none'],
    },
  },
  webServer: {
    command: 'npm start -- --host 127.0.0.1 --port 4202',
    url: 'http://127.0.0.1:4202',
    reuseExistingServer: false,
    timeout: 120_000,
    stdout: 'pipe',
    stderr: 'pipe',
    env: {
      NG_CLI_ANALYTICS: 'false',
    },
  },
});
