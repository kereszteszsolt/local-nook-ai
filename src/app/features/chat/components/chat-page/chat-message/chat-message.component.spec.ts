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
});
