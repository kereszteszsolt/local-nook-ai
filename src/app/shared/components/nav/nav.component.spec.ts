import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatDialog } from '@angular/material/dialog';
import { BRAND_CONFIG, DEFAULT_BRAND_CONFIG } from '../../../core/config/brand.config';
import { ChatFacade } from '../../../features/chat/application/chat-facade.service';
import { AiModelDto } from '../../../features/chat/models/ai-model.model';
import { NavComponent } from './nav.component';

describe('NavComponent', () => {
  let component: NavComponent;
  let fixture: ComponentFixture<NavComponent>;
  let loadModels: jasmine.Spy;
  let setCurrentModel: jasmine.Spy;

  const models: AiModelDto[] = [{ name: 'qwen3:8b', model: 'qwen3:8b', supportsThinking: true }];

  afterEach(() => TestBed.inject(MatDialog).closeAll());

  beforeEach(async () => {
    loadModels = jasmine.createSpy('loadModels').and.callFake(async () => undefined);
    setCurrentModel = jasmine.createSpy('setCurrentModel');
    const chatFacade = {
      currentModel: signal<AiModelDto | null>(models[0]).asReadonly(),
      aiModels: signal(models).asReadonly(),
      loadModels,
      setCurrentModel,
    };

    await TestBed.configureTestingModule({
      imports: [NavComponent, NoopAnimationsModule],
      providers: [
        { provide: ChatFacade, useValue: chatFacade },
        { provide: BRAND_CONFIG, useValue: DEFAULT_BRAND_CONFIG },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(NavComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('loads local models and renders the configured product name', () => {
    expect(loadModels).toHaveBeenCalledOnceWith();
    expect((fixture.nativeElement as HTMLElement).textContent).toContain(DEFAULT_BRAND_CONFIG.productName);
  });

  it('delegates model selection to the facade', () => {
    component.onModelChange(models[0]);
    expect(setCurrentModel).toHaveBeenCalledOnceWith(models[0]);
  });

  it('opens the About dialog from the header without changing the model', async () => {
    const button = (fixture.nativeElement as HTMLElement).querySelector<HTMLButtonElement>('.about-button');
    expect(button?.querySelector('mat-icon')).toBeNull();
    expect((fixture.nativeElement as HTMLElement).querySelector('.toolbar-actions > button:last-of-type')).toBe(button);
    button?.click();
    fixture.detectChanges();
    await fixture.whenStable();

    const dialog = document.querySelector('[role="dialog"]');
    expect(dialog?.textContent).toContain('About LocalNook AI');
    expect(dialog?.querySelector('img')?.getAttribute('src')).toBe(DEFAULT_BRAND_CONFIG.poster);
    expect(document.querySelector('.about-backdrop')).not.toBeNull();
    expect(setCurrentModel).not.toHaveBeenCalled();
  });
});
