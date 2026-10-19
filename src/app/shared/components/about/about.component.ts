// SPDX-FileCopyrightText: 2026 Keresztes Zsolt <https://kereszteszsolt.hu>
// SPDX-License-Identifier: Apache-2.0

import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatDialogClose, MatDialogContent, MatDialogTitle } from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';
import { APP_INFO_CONFIG } from '../../../core/config/app-info.config';
import { AuthorAttributionComponent } from '../author-attribution/author-attribution.component';

@Component({
  selector: 'app-about',
  imports: [MatButton, MatIconButton, MatDialogClose, MatDialogContent, MatDialogTitle, MatIcon, MatTooltip, AuthorAttributionComponent],
  templateUrl: './about.component.html',
  styleUrl: './about.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AboutComponent {
  readonly appInfo = inject(APP_INFO_CONFIG);
  readonly supportRemarkLines = this.appInfo.supportRemarkText.trim().split(/(?<=[.!?])\s+/).filter(Boolean);
  private readonly languages = this.appInfo.developer.websiteLanguages;
  private readonly availableLanguages = this.languages.length ? ` Available in ${this.languages.join(' | ')}.` : '';
  readonly projectLinks = [
    { label: this.appInfo.developer.websiteLabel, href: this.appInfo.developer.website, icon: 'language', description: "Author's website." + this.availableLanguages },
    { label: 'Source', href: this.appInfo.sourceUrl, icon: 'code', description: `View the ${this.appInfo.productName} source code on GitHub.` },
    { label: 'GitHub profile', href: this.appInfo.developer.github, icon: 'person_outline', description: "The author's GitHub profile." },
    { label: 'Project website', href: this.appInfo.website, icon: 'open_in_new', description: `Visit the ${this.appInfo.productName} website.` },
  ].filter((link) => !!link.href);
  readonly supportLinks = [
    { label: 'Buy me a Coffee', href: this.appInfo.developer.buyMeACoffee, icon: 'local_cafe', coffee: true, description: 'Support the author with a coffee on Buy Me a Coffee.' },
    { label: 'Ways to support', href: this.appInfo.developer.waysToSupport, icon: 'favorite_border', coffee: false, description: 'Ways to support the author.' + this.availableLanguages },
  ].filter((link) => !!link.href);
}
