import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatSnackBar } from '@angular/material/snack-bar';
import { provideMarkdown } from 'ngx-markdown';
import { ChatMessageComponent } from './chat-message.component';

describe('ChatMessageComponent', () => {
  let component: ChatMessageComponent;
  let fixture: ComponentFixture<ChatMessageComponent>;
  let snackBar: jasmine.SpyObj<MatSnackBar>;

  beforeEach(async () => {
    snackBar = jasmine.createSpyObj<MatSnackBar>('MatSnackBar', ['open']);

    await TestBed.configureTestingModule({
      imports: [ChatMessageComponent, NoopAnimationsModule],
      providers: [
        provideMarkdown(),
        { provide: MatSnackBar, useValue: snackBar },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ChatMessageComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('message', {
      role: 'assistant',
      content: 'Hello',
      ref_id: 'request-1',
    });
    fixture.componentRef.setInput('hideToolbar', false);
    fixture.detectChanges();
  });

  it('emits the original request id for regeneration', () => {
    const emitted: string[] = [];
    component.regenerate.subscribe((requestId) => emitted.push(requestId));

    component.onRegenerate();

    expect(emitted).toEqual(['request-1']);
  });

  it('shows a non-blocking status when clipboard access is unavailable', async () => {
    const originalClipboard = Object.getOwnPropertyDescriptor(navigator, 'clipboard');
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: undefined });

    try {
      await component.copyContentToClipboard('Hello');
    } finally {
      if (originalClipboard) {
        Object.defineProperty(navigator, 'clipboard', originalClipboard);
      } else {
        Object.defineProperty(navigator, 'clipboard', {
          configurable: true,
          value: undefined,
        });
      }
    }

    expect(snackBar.open).toHaveBeenCalledWith(
      'Clipboard access is not available in this browser.',
      'Dismiss',
      { duration: 3000 },
    );
  });

  it('keeps thinking collapsed until the user expands it', () => {
    fixture.componentRef.setInput('message', {
      role: 'assistant',
      content: 'The answer is 2.',
      thinking: 'I added one and one.',
      ref_id: 'request-1',
    });
    fixture.detectChanges();

    const toggleButton: HTMLButtonElement | null = fixture.nativeElement.querySelector(
      'button[aria-label="Expand thinking"]',
    );

    expect(component.showThinkingExpanded).toBeFalse();
    expect(fixture.nativeElement.querySelector('.thinking-content')).toBeNull();
    expect(toggleButton?.getAttribute('aria-expanded')).toBe('false');

    toggleButton?.click();
    fixture.detectChanges();

    expect(component.showThinkingExpanded).toBeTrue();
    expect(fixture.nativeElement.querySelector('.thinking-content')).not.toBeNull();
    expect(
      (fixture.nativeElement.querySelector(
        'button[aria-label="Collapse thinking"]',
      ) as HTMLButtonElement | null)?.getAttribute('aria-expanded'),
    ).toBe('true');
  });

  it('shows only the latest short thinking preview while streaming', () => {
    fixture.componentRef.setInput('message', {
      role: 'assistant',
      content: '',
      thinking: `${'Earlier detail. '.repeat(40)}Latest thought is visible.`,
    });
    fixture.componentRef.setInput('isStreaming', true);
    fixture.detectChanges();

    const preview: HTMLElement | null = fixture.nativeElement.querySelector('.thinking-preview');
    const initialPreviewText: HTMLElement | null = fixture.nativeElement.querySelector('.thinking-preview-text');
    const scrollTo = spyOn(preview as HTMLDivElement, 'scrollTo');

    expect(preview?.textContent).toContain('Latest thought is visible.');
    expect(fixture.nativeElement.querySelector('.thinking-content')).toBeNull();
    expect(fixture.nativeElement.querySelector('button[aria-label="Expand thinking"]')).toBeNull();

    fixture.componentRef.setInput('message', {
      role: 'assistant',
      content: '',
      thinking: `${'Earlier detail. '.repeat(40)}A newer thought replaces the preview.`,
    });
    fixture.detectChanges();

    const updatedPreviewText: HTMLElement | null = fixture.nativeElement.querySelector('.thinking-preview-text');

    expect(updatedPreviewText?.textContent).toContain('A newer thought replaces the preview.');
    expect(updatedPreviewText).toBe(initialPreviewText);
    expect(scrollTo).toHaveBeenCalled();
  });
});
