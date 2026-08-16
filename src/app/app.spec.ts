import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { App } from './app';
import { BRAND_CONFIG, BrandConfig } from './core/config/brand.config';
import { ChatFacade } from './features/chat/application/chat-facade.service';

const testBrand: BrandConfig = {
  productName: 'Test Nook',
  tagline: 'Local test conversations',
  repositoryName: 'ng-ollama',
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
});
