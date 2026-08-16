import { Component, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';
import { Message } from '../../../models/message.model';
import { NgClass } from '@angular/common';
import { MarkdownComponent } from 'ngx-markdown';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { TimeSpentPipe } from '../../../pipes/time-spent/time-spent.pipe';
import { MatTooltip } from '@angular/material/tooltip';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'ollama-chat-chat-message',
  imports: [
    NgClass,
    MarkdownComponent,
    MatIconButton,
    MatIcon,
    TimeSpentPipe,
    MatTooltip
  ],
  templateUrl: './chat-message.component.html',
  styleUrl: './chat-message.component.scss'
})
export class ChatMessageComponent implements OnInit {
  private readonly snackBar = inject(MatSnackBar);

  @Input({ required: true }) message!: Message;
  @Input({ required: true }) hideToolbar: boolean = false;
  @Output() regenerate: EventEmitter<string> = new EventEmitter<string>();

  showThinkingExpanded = true;

  ngOnInit(): void {
    const prismWindow = window as Window & {
      Prism?: { plugins?: { autoloader?: { languages_path: string } } };
    };
    const autoloader = prismWindow.Prism?.plugins?.autoloader;
    if (autoloader) {
      autoloader.languages_path = 'prismjs-components/';
    }
  }

  toggleThinkingVisibility(): void {
    this.showThinkingExpanded = !this.showThinkingExpanded;
  }

  async copyContentToClipboard(content: string): Promise<void> {
    if (!navigator.clipboard?.writeText) {
      this.showClipboardStatus('Clipboard access is not available in this browser.');
      return;
    }

    try {
      await navigator.clipboard.writeText(content);
      this.showClipboardStatus('Copied to clipboard.');
    } catch {
      this.showClipboardStatus('Could not copy the message to the clipboard.');
    }
  }

  onRegenerate(): void {
    if (this.message.ref_id) {
      this.regenerate.emit(this.message.ref_id);
    }
  }

  private showClipboardStatus(message: string): void {
    this.snackBar.open(message, 'Dismiss', { duration: 3000 });
  }
}
