// SPDX-FileCopyrightText: 2026 Keresztes Zsolt <https://kereszteszsolt.hu>
// SPDX-License-Identifier: Apache-2.0

import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { MatTooltip } from '@angular/material/tooltip';
import { BRAND_CONFIG } from '../../../core/config/brand.config';

@Component({
  selector: 'app-brand-attribution',
  imports: [MatTooltip],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <p>© {{ currentYear }} {{ brand.developer.name }},
      <a [href]="brand.licenseUrl" target="_blank" rel="noopener noreferrer"
        [matTooltip]="'Read the ' + brand.license + ' license.\n' + brand.licenseUrl"
        matTooltipClass="brand-tooltip" matTooltipPosition="above">{{ brand.license }}</a>
    </p>
    @if (showWebsite() && brand.developer.website) {
      <p><a [href]="brand.developer.website" target="_blank" rel="noopener noreferrer"
        [matTooltip]="websiteTooltip" matTooltipClass="brand-tooltip" matTooltipPosition="above">{{ brand.developer.websiteLabel }}</a></p>
    }
  `,
  styles: `
    :host { display: block; color: var(--color-text-muted); font-size: .75rem; line-height: 1.7; }
    p { margin: 0; }
    p + p { margin-top: .35rem; }
    a { color: var(--color-accent); text-underline-offset: .2rem; overflow-wrap: anywhere; }
    a:hover { text-decoration: underline; }
    a:focus-visible { outline: 2px solid var(--color-accent); outline-offset: 3px; border-radius: 2px; }
  `,
})
export class BrandAttributionComponent {
  readonly brand = inject(BRAND_CONFIG);
  readonly showWebsite = input(true);
  readonly websiteTooltip = "Author's website." +
    (this.brand.developer.websiteLanguages.length ? ` Available in ${this.brand.developer.websiteLanguages.join(' | ')}.` : '') +
    '\n' + this.brand.developer.website;

  get currentYear(): number {
    return new Date().getFullYear();
  }
}
