import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { CdkTextareaAutosize } from '@angular/cdk/text-field';
import { MatTooltip } from '@angular/material/tooltip';
import { SystemPromptSettingsComponent } from '../../../dialogs/system-prompt-settings/system-prompt-settings.component';
import { MatDialog } from '@angular/material/dialog';
import { MatSlideToggle } from '@angular/material/slide-toggle';

export interface ChatSubmitEvent {
  readonly content: string;
  readonly think: boolean;
}

@Component({
  selector: 'ollama-chat-chat-input',
  imports: [
    MatIconButton,
    MatIcon,
    FormsModule,
    CdkTextareaAutosize,
    MatTooltip,
    MatSlideToggle,
  ],
  templateUrl: './chat-input.component.html',
  styleUrl: './chat-input.component.scss',
})
export class ChatInputComponent {
  @Input({ required: true }) isLoading = false;
  @Input({ required: true })
  set supportsThinking(value: boolean) {
    this.thinkingSupported = value;
    if (!value) {
      this.thinkEnabled = false;
    }
  }

  @Output() readonly sendMessage = new EventEmitter<ChatSubmitEvent>();
  @Output() readonly abort = new EventEmitter<void>();

  private readonly dialog = inject(MatDialog);

  currentMessage = '';
  thinkEnabled = false;
  thinkingSupported = false;

  onSendCurrentMessage(): void {
    const content = this.currentMessage.trim();
    if (!content || this.isLoading) {
      return;
    }

    this.sendMessage.emit({ content, think: this.thinkEnabled });
    this.currentMessage = '';
  }

  onKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.onSendCurrentMessage();
    }
  }

  onClearInput(): void {
    this.currentMessage = '';
  }

  onAbort(): void {
    this.abort.emit();
  }

  openSystemPromptSettings(): void {
    this.dialog.open(SystemPromptSettingsComponent);
  }
}
