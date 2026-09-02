/*
 * SPDX-FileCopyrightText: 2026 Keresztes Zsolt <https://kereszteszsolt.hu>
 * SPDX-License-Identifier: Apache-2.0
 */

import { InjectionToken } from '@angular/core';

export interface BrandConfig {
  readonly productName: string;
  readonly extendedProductName: string;
  readonly tagline: string;
  readonly repositoryName: string;
  readonly developer: {
    readonly name: string;
    readonly website: string;
  };
}

export const DEFAULT_BRAND_CONFIG = {
  productName: 'LocalNook',
  extendedProductName: 'LocalNook AI',
  tagline: 'Private local conversations with Ollama',
  repositoryName: 'localnook-ai',
  developer: {
    name: 'Keresztes Zsolt',
    website: 'https://kereszteszsolt.hu',
  },
} as const satisfies BrandConfig;

export const BRAND_CONFIG = new InjectionToken<BrandConfig>('BRAND_CONFIG', {
  providedIn: 'root',
  factory: () => DEFAULT_BRAND_CONFIG,
});
