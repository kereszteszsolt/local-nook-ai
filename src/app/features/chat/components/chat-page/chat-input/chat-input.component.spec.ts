import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogModule } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ChatInputComponent, ChatSubmitEvent } from './chat-input.component';

describe('ChatInputComponent', () => {
  let component: ChatInputComponent;
  let fixture: ComponentFixture<ChatInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChatInputComponent, MatDialogModule, NoopAnimationsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(ChatInputComponent);
    component = fixture.componentInstance;
    component.isLoading = false;
    component.supportsThinking = true;
    fixture.detectChanges();
  });

  it('emits a typed chat payload instead of JSON text', () => {
    const emitted: ChatSubmitEvent[] = [];
    component.sendMessage.subscribe((event) => emitted.push(event));
    component.currentMessage = '  Hello  ';
    component.thinkEnabled = true;

    component.onSendCurrentMessage();

    expect(emitted).toEqual([{ content: 'Hello', think: true }]);
    expect(component.currentMessage).toBe('');
  });

  it('turns off thinking when the selected model does not support it', () => {
    component.thinkEnabled = true;
    component.supportsThinking = false;

    expect(component.thinkEnabled).toBeFalse();
    expect(component.thinkingSupported).toBeFalse();
  });
});
