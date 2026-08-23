import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { App } from './app';
import { BRAND_CONFIG, BrandConfig, DEFAULT_BRAND_CONFIG } from './core/config/brand.config';
import { ChatFacade } from './features/chat/application/chat-facade.service';

const testBrand: BrandConfig = {
  productName: 'Test Nook',
  extendedProductName: 'Test Nook AI',
  tagline: 'Local test conversations',
  repositoryName: 'test-nook',
  developer: {
    name: 'Keresztes Zsolt',
    website: 'https://kereszteszsolt.hu',
  },
};

describe('App', () => {
  beforeEach(async () => {
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

  it('defines the canonical product and repository identity centrally', () => {
    expect(DEFAULT_BRAND_CONFIG).toEqual(jasmine.objectContaining({
      productName: 'LocalNook',
      extendedProductName: 'LocalNook AI',
      repositoryName: 'localnook-ai',
    }));
  });
});
