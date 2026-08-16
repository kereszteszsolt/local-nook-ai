import { AfterViewChecked, Component, ElementRef, inject, OnInit, ViewChild } from '@angular/core';
import {
  ChatInputComponent,
  ChatSubmitEvent,
} from '../../components/chat-page/chat-input/chat-input.component';
import { ChatFacade } from '../../application/chat-facade.service';
import { ChatMessageComponent } from '../../components/chat-page/chat-message/chat-message.component';

@Component({
  selector: 'ollama-chat-chat-page',
  imports: [ChatInputComponent, ChatMessageComponent],
  templateUrl: './chat-page.component.html',
  styleUrl: './chat-page.component.scss',
})
export class ChatPageComponent implements AfterViewChecked, OnInit {
  @ViewChild('scrollContainer') scrollContainer?: ElementRef<HTMLDivElement>;

  readonly chatFacade = inject(ChatFacade);
  readonly messages = this.chatFacade.messageHistoryList;
  readonly partialResponse = this.chatFacade.partialResponse;
  readonly isLoading = this.chatFacade.isLoadingResponse;
  readonly partialThinking = this.chatFacade.partialThinking;
  readonly errorMessage = this.chatFacade.errorMessage;

  ngAfterViewChecked(): void {
    this.scrollToBottom();
  }

  ngOnInit(): void {
    this.chatFacade.loadSystemPrompts();
    void this.chatFacade.restoreConversation();
  }

  onSendMessage(message: ChatSubmitEvent): void {
    void this.chatFacade.sendChatMessage(message.content, message.think);
  }

  onAbortMessage(): void {
    this.chatFacade.abortChatMessage();
  }

  onNewChat(): void {
    this.chatFacade.newChat();
  }

  onRegenerateMessage(requestId: string): void {
    void this.chatFacade.regenerateResponse(requestId);
  }

  private scrollToBottom(): void {
    const element = this.scrollContainer?.nativeElement;
    if (element) {
      element.scrollTop = element.scrollHeight;
    }
  }
}
