/*
 * SPDX-FileCopyrightText: 2026 Keresztes Zsolt <https://kereszteszsolt.hu>
 * SPDX-License-Identifier: Apache-2.0
 */

import { InjectionToken } from '@angular/core';
import branding from '../../../../brand/branding.json';

export interface BrandConfig {
  readonly productName: string;
  readonly extendedProductName: string;
  readonly tagline: string;
  readonly repositoryName: string;
  readonly website: string;
  readonly sourceUrl: string;
  readonly description: string;
  readonly license: string;
  readonly licenseUrl: string;
  readonly favicon?: string;
  readonly icon?: string;
  readonly poster?: string;
  readonly developer: {
    readonly name: string;
    readonly website: string;
    readonly websiteLabel: string;
    readonly websiteLanguages: readonly string[];
    readonly github: string;
    readonly waysToSupport: string;
    readonly buyMeACoffee: string;
  };
}

function assetUrl(path: string): string {
  if (!path) return '';
  if (!path.startsWith('assets/') || path.includes('\\') || path.split('/').includes('..')) {
    throw new Error('Brand artwork must stay inside brand/assets/.');
  }
  return `brand/${path}`;
}

export const DEFAULT_BRAND_CONFIG = {
  productName: branding.appName,
  extendedProductName: branding.appExtendedName,
  tagline: branding.appTagline,
  repositoryName: branding.technical.repository,
  website: branding.appWebsite,
  sourceUrl: branding.appGithubUrl,
  description: branding.appDescription,
  license: branding.license,
  licenseUrl: branding.licenseUrl,
  favicon: assetUrl(branding.appFavicon),
  icon: assetUrl(branding.appIcon),
  poster: assetUrl(branding.appPoster),
  developer: {
    name: branding.authorName,
    website: branding.authorWebsite,
    websiteLabel: branding.authorWebsite ? new URL(branding.authorWebsite).hostname : '',
    websiteLanguages: branding.authorWebsiteLanguages,
    github: branding.authorGithub,
    waysToSupport: branding.authorWaysToSupportUrl,
    buyMeACoffee: branding.authorBuyMeACoffeeUrl,
  },
} as const satisfies BrandConfig;

export const BRAND_CONFIG = new InjectionToken<BrandConfig>('BRAND_CONFIG', {
  providedIn: 'root',
  factory: () => DEFAULT_BRAND_CONFIG,
});
