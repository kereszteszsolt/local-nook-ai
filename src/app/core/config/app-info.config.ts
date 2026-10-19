/*
 * SPDX-FileCopyrightText: 2026 Keresztes Zsolt <https://kereszteszsolt.hu>
 * SPDX-License-Identifier: Apache-2.0
 */

import { InjectionToken } from '@angular/core';
import appMetadata from '../../../../brand/branding.json';

export interface AppInfoConfig {
  readonly productName: string;
  readonly tagline: string;
  readonly website: string;
  readonly sourceUrl: string;
  readonly description: string;
  readonly supportRemarkText: string;
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
    throw new Error('Application artwork must stay inside brand/assets/.');
  }
  return `app-assets/${path}`;
}

export const DEFAULT_APP_INFO_CONFIG = {
  productName: appMetadata.appName,
  tagline: appMetadata.appTagline,
  website: appMetadata.appWebsite,
  sourceUrl: appMetadata.appGithubUrl,
  description: appMetadata.appDescription,
  supportRemarkText: appMetadata.supportRemarkText,
  favicon: assetUrl(appMetadata.appFavicon),
  icon: assetUrl(appMetadata.appIcon),
  poster: assetUrl(appMetadata.appPoster),
  developer: {
    name: appMetadata.authorName,
    website: appMetadata.authorWebsite,
    websiteLabel: appMetadata.authorWebsite ? new URL(appMetadata.authorWebsite).hostname : '',
    websiteLanguages: appMetadata.authorWebsiteLanguages,
    github: appMetadata.authorGithub,
    waysToSupport: appMetadata.authorWaysToSupportUrl,
    buyMeACoffee: appMetadata.authorBuyMeACoffeeUrl,
  },
} as const satisfies AppInfoConfig;

export const APP_INFO_CONFIG = new InjectionToken<AppInfoConfig>('APP_INFO_CONFIG', {
  providedIn: 'root',
  factory: () => DEFAULT_APP_INFO_CONFIG,
});
