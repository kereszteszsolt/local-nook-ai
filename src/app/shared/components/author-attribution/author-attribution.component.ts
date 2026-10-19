// SPDX-FileCopyrightText: 2026 Keresztes Zsolt <https://kereszteszsolt.hu>
// SPDX-License-Identifier: Apache-2.0

import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { MatTooltip } from '@angular/material/tooltip';
import { APP_INFO_CONFIG } from '../../../core/config/app-info.config';

@Component({
  selector: 'app-author-attribution',
  imports: [MatTooltip],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <p>© {{ currentYear }} {{ appInfo.developer.name }},
      <a href="https://www.apache.org/licenses/LICENSE-2.0" target="_blank" rel="noopener noreferrer"
        matTooltip="Read the Apache-2.0 license.&#10;https://www.apache.org/licenses/LICENSE-2.0"
        matTooltipClass="link-tooltip" matTooltipPosition="above">Apache-2.0</a>
    </p>
    @if (showWebsite() && appInfo.developer.website) {
      <p><a [href]="appInfo.developer.website" target="_blank" rel="noopener noreferrer"
        [matTooltip]="websiteTooltip" matTooltipClass="link-tooltip" matTooltipPosition="above">{{ appInfo.developer.websiteLabel }}</a></p>
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
export class AuthorAttributionComponent {
  readonly appInfo = inject(APP_INFO_CONFIG);
  readonly showWebsite = input(true);
  readonly websiteTooltip = "Author's website." +
    (this.appInfo.developer.websiteLanguages.length ? ` Available in ${this.appInfo.developer.websiteLanguages.join(' | ')}.` : '') +
    '\n' + this.appInfo.developer.website;

  get currentYear(): number {
    return new Date().getFullYear();
  }
}
