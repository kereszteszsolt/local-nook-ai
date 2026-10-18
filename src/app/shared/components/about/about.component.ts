// SPDX-FileCopyrightText: 2026 Keresztes Zsolt <https://kereszteszsolt.hu>
// SPDX-License-Identifier: Apache-2.0

import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatDialogClose, MatDialogContent, MatDialogTitle } from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';
import { BRAND_CONFIG } from '../../../core/config/brand.config';
import { BrandAttributionComponent } from '../brand-attribution/brand-attribution.component';

@Component({
  selector: 'app-about',
  imports: [MatButton, MatIconButton, MatDialogClose, MatDialogContent, MatDialogTitle, MatIcon, MatTooltip, BrandAttributionComponent],
  templateUrl: './about.component.html',
  styleUrl: './about.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AboutComponent {
  readonly brand = inject(BRAND_CONFIG);
  private readonly languages = this.brand.developer.websiteLanguages;
  private readonly availableLanguages = this.languages.length ? ` Available in ${this.languages.join(' | ')}.` : '';
  readonly projectLinks = [
    { label: this.brand.developer.websiteLabel, href: this.brand.developer.website, icon: 'language', description: "Author's website." + this.availableLanguages },
    { label: 'Source', href: this.brand.sourceUrl, icon: 'code', description: `View the ${this.brand.extendedProductName} source code on GitHub.` },
    { label: 'GitHub profile', href: this.brand.developer.github, icon: 'person_outline', description: "The author's GitHub profile." },
    { label: 'Project website', href: this.brand.website, icon: 'open_in_new', description: `Visit the ${this.brand.extendedProductName} website.` },
  ].filter((link) => !!link.href);
  readonly supportLinks = [
    { label: 'Buy me a Coffee', href: this.brand.developer.buyMeACoffee, icon: 'local_cafe', coffee: true, description: 'Support the author with a coffee on Buy Me a Coffee.' },
    { label: 'Ways to support', href: this.brand.developer.waysToSupport, icon: 'favorite_border', coffee: false, description: 'Ways to support the author.' + this.availableLanguages },
  ].filter((link) => !!link.href);
}
