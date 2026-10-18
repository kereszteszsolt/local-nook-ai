// SPDX-FileCopyrightText: 2026 Keresztes Zsolt <https://kereszteszsolt.hu>
// SPDX-License-Identifier: Apache-2.0

import { TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { BRAND_CONFIG, BrandConfig, DEFAULT_BRAND_CONFIG } from '../../../core/config/brand.config';
import { AboutComponent } from './about.component';

describe('AboutComponent branding', () => {
  const testBrand: BrandConfig = {
    ...DEFAULT_BRAND_CONFIG,
    extendedProductName: 'Example Nook',
    description: 'An injected project description.',
    poster: 'brand/assets/example.svg',
    sourceUrl: 'https://example.org/source',
    license: 'Example license',
    licenseUrl: 'https://example.org/license',
    developer: {
      name: 'Example Author',
      website: 'https://example.org',
      websiteLabel: 'example.org',
      websiteLanguages: ['hu', 'en'],
      github: 'https://example.org/profile',
      waysToSupport: 'https://example.org/support',
      buyMeACoffee: 'https://example.org/coffee',
    },
  };

  beforeEach(() => TestBed.configureTestingModule({
    imports: [AboutComponent, NoopAnimationsModule],
    providers: [{ provide: BRAND_CONFIG, useValue: testBrand }],
  }));

  it('renders injected metadata, artwork and destinations rather than hardcoded identity', () => {
    const fixture = TestBed.createComponent(AboutComponent);
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;

    expect(element.textContent).toContain('About Example Nook');
    expect(element.textContent).toContain(testBrand.description);
    expect(element.textContent).toContain(`© ${new Date().getFullYear()} Example Author, Example license`);
    expect(element.querySelector('img')?.getAttribute('src')).toBe(testBrand.poster);
    expect([...element.querySelectorAll('a')].map((link) => link.getAttribute('href'))).toEqual([
      testBrand.developer.website, testBrand.sourceUrl, testBrand.developer.github,
      testBrand.developer.buyMeACoffee, testBrand.developer.waysToSupport, testBrand.licenseUrl,
    ]);
    expect(fixture.componentInstance.projectLinks[0].description).toContain('hu | en');
  });

  it('omits optional empty artwork and destinations', () => {
    TestBed.overrideProvider(BRAND_CONFIG, { useValue: {
      ...testBrand, poster: '', website: '', sourceUrl: '',
      developer: { ...testBrand.developer, website: '', github: '', waysToSupport: '', buyMeACoffee: '' },
    } });
    const fixture = TestBed.createComponent(AboutComponent);
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;

    expect(element.querySelector('img')).toBeNull();
    expect(element.querySelector('.about-support-actions')).toBeNull();
    expect(element.querySelectorAll('a').length).toBe(1);
    expect(element.querySelector('a')?.getAttribute('href')).toBe(testBrand.licenseUrl);
  });
});
