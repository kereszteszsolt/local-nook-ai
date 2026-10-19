import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { App } from './app';
import { BRAND_CONFIG, BrandConfig, DEFAULT_BRAND_CONFIG } from './core/config/brand.config';
import { ChatFacade } from './features/chat/application/chat-facade.service';

const testBrand: BrandConfig = {
  ...DEFAULT_BRAND_CONFIG,
  productName: 'Test Nook',
  tagline: 'Local test conversations',
  favicon: 'brand/assets/test-mark.svg',
  developer: {
    ...DEFAULT_BRAND_CONFIG.developer,
    name: 'Keresztes Zsolt',
    website: 'https://kereszteszsolt.hu',
  },
};

describe('App', () => {
  let favicon: HTMLLinkElement;

  afterEach(() => favicon.remove());
  beforeEach(async () => {
    favicon = document.createElement('link');
    favicon.rel = 'icon';
    document.head.prepend(favicon);
    const chatFacade = {
      currentModel: signal(null).asReadonly(),
      aiModels: signal([]).asReadonly(),
      loadModels: jasmine.createSpy('loadModels').and.callFake(async () => undefined),
      setCurrentModel: jasmine.createSpy('setCurrentModel'),
    };

    await TestBed.configureTestingModule({
      imports: [App, NoopAnimationsModule],
      providers: [
        provideRouter([]),
        { provide: BRAND_CONFIG, useValue: testBrand },
        { provide: ChatFacade, useValue: chatFacade },
      ],
    }).compileComponents();
  });

  it('creates the application shell', () => {
    const fixture = TestBed.createComponent(App);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('sets the browser title from BrandConfig', () => {
    TestBed.createComponent(App);
    expect(TestBed.inject(Title).getTitle()).toBe('Test Nook');
  });

  it('sets the favicon from the injected brand', () => {
    TestBed.createComponent(App);
    expect(favicon.getAttribute('href')).toBe('brand/assets/test-mark.svg');
  });

  it('does not request an image for an empty favicon', () => {
    TestBed.overrideProvider(BRAND_CONFIG, { useValue: { ...testBrand, favicon: '' } });
    favicon.href = 'stale.svg';
    TestBed.createComponent(App);
    expect(favicon.hasAttribute('href')).toBeFalse();
  });

  it('defines the canonical product name centrally', () => {
    expect(DEFAULT_BRAND_CONFIG).toEqual(jasmine.objectContaining({
      productName: 'LocalNook AI',
    }));
  });
});
