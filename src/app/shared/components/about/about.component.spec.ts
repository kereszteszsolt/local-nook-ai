// SPDX-FileCopyrightText: 2026 Keresztes Zsolt <https://kereszteszsolt.hu>
// SPDX-License-Identifier: Apache-2.0

import { TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { APP_INFO_CONFIG, AppInfoConfig, DEFAULT_APP_INFO_CONFIG } from '../../../core/config/app-info.config';
import { AboutComponent } from './about.component';

describe('AboutComponent branding', () => {
  const testAppInfo: AppInfoConfig = {
    ...DEFAULT_APP_INFO_CONFIG,
    productName: 'Example Nook',
    supportRemarkText: 'An injected support remark. Thank you for reading!',
    description: 'An injected project description.',
    poster: 'app-assets/assets/example.svg',
    sourceUrl: 'https://example.org/source',
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
    providers: [{ provide: APP_INFO_CONFIG, useValue: testAppInfo }],
  }));

  it('renders injected metadata, artwork and destinations rather than hardcoded identity', () => {
    const fixture = TestBed.createComponent(AboutComponent);
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;

    expect(element.textContent).toContain('About Example Nook');
    expect(element.textContent).toContain(testAppInfo.description);
    expect([...element.querySelectorAll('.support-note p span')].map((line) => line.textContent?.trim())).toEqual([
      'An injected support remark.', 'Thank you for reading!',
    ]);
    expect(element.textContent).toContain(`© ${new Date().getFullYear()} Example Author, Apache-2.0`);
    expect(element.querySelector('img')?.getAttribute('src')).toBe(testAppInfo.poster);
    expect([...element.querySelectorAll('a')].map((link) => link.getAttribute('href'))).toEqual([
      testAppInfo.developer.website, testAppInfo.sourceUrl, testAppInfo.developer.github,
      testAppInfo.developer.buyMeACoffee, testAppInfo.developer.waysToSupport, 'https://www.apache.org/licenses/LICENSE-2.0',
    ]);
    expect(fixture.componentInstance.projectLinks[0].description).toContain('hu | en');
  });

  it('omits optional empty artwork and destinations', () => {
    TestBed.overrideProvider(APP_INFO_CONFIG, { useValue: {
      ...testAppInfo, poster: '', website: '', sourceUrl: '',
      developer: { ...testAppInfo.developer, website: '', github: '', waysToSupport: '', buyMeACoffee: '' },
    } });
    const fixture = TestBed.createComponent(AboutComponent);
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;

    expect(element.querySelector('img')).toBeNull();
    expect(element.querySelector('.about-support-actions')).toBeNull();
    expect(element.querySelectorAll('a').length).toBe(1);
    expect(element.querySelector('a')?.getAttribute('href')).toBe('https://www.apache.org/licenses/LICENSE-2.0');
  });
});
