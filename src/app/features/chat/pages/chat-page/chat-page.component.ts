import { DatePipe } from '@angular/common';
import { AfterViewChecked, Component, ElementRef, inject, OnInit, ViewChild } from '@angular/core';
import { MatIconButton } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';
import {
  ChatInputComponent,
  ChatSubmitEvent,
} from '../../components/chat-page/chat-input/chat-input.component';
import { ChatFacade } from '../../application/chat-facade.service';
import { ChatMessageComponent } from '../../components/chat-page/chat-message/chat-message.component';
import {
  ConversationDeleteConfirmationComponent,
  ConversationDeleteConfirmationData,
} from '../../dialogs/conversation-delete-confirmation/conversation-delete-confirmation.component';
import type { ConversationSummary } from '../../infrastructure/conversation.repository';

@Component({
  selector: 'ollama-chat-chat-page',
  imports: [
    ChatInputComponent,
    ChatMessageComponent,
    DatePipe,
    MatIconButton,
    MatIcon,
    MatTooltip,
  ],
  templateUrl: './chat-page.component.html',
  styleUrl: './chat-page.component.scss',
})
export class ChatPageComponent implements AfterViewChecked, OnInit {
  @ViewChild('scrollContainer') scrollContainer?: ElementRef<HTMLDivElement>;

  private readonly dialog = inject(MatDialog);
  readonly chatFacade = inject(ChatFacade);
  readonly messages = this.chatFacade.messageHistoryList;
  readonly partialResponse = this.chatFacade.partialResponse;
  readonly isLoading = this.chatFacade.isLoadingResponse;
  readonly partialThinking = this.chatFacade.partialThinking;
  readonly currentModelSupportsThinking = this.chatFacade.currentModelSupportsThinking;
  readonly thinkingEnabled = this.chatFacade.thinkingEnabled;
  readonly errorMessage = this.chatFacade.errorMessage;
  readonly conversations = this.chatFacade.conversations;
  readonly activeConversation = this.chatFacade.activeConversation;
  readonly isLoadingConversations = this.chatFacade.isLoadingConversations;

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

  onThinkingEnabledChange(enabled: boolean): void {
    void this.chatFacade.setThinkingEnabled(enabled);
  }

  onAbortMessage(): void {
    this.chatFacade.abortChatMessage();
  }

  onNewChat(): void {
    this.chatFacade.newChat();
  }

  onOpenConversation(id: string): void {
    void this.chatFacade.openConversation(id);
  }

  onRequestDeleteConversation(conversation: ConversationSummary): void {
    this.confirmDeletion({
      heading: 'Delete conversation?',
      message: `Delete "${conversation.title}" and its messages?`,
      confirmLabel: 'Delete',
    }, () => this.chatFacade.deleteConversation(conversation.id));
  }

  onRequestDeleteAll(): void {
    this.confirmDeletion({
      heading: 'Delete all conversations?',
      message: 'Delete all saved conversations and their messages?',
      confirmLabel: 'Delete all',
    }, () => this.chatFacade.deleteAllConversations());
  }

  currentConversationTitle(): string {
    return this.conversations().find((conversation) => conversation.id === this.activeConversation())?.title ?? 'New conversation';
  }

  onRegenerateMessage(requestId: string): void {
    void this.chatFacade.regenerateResponse(requestId);
  }

  private scrollToBottom(): void {
    const element = this.scrollContainer?.nativeElement;
    if (!element) {
      return;
    }

    const nextScrollTop = Math.max(0, element.scrollHeight - element.clientHeight);
    if (Math.abs(element.scrollTop - nextScrollTop) < 1) {
      return;
    }

    if (this.isLoading()) {
      element.scrollTo({ top: nextScrollTop, behavior: 'smooth' });
    } else {
      element.scrollTop = nextScrollTop;
    }
  }

  private confirmDeletion(
    data: ConversationDeleteConfirmationData,
    deleteConversations: () => Promise<void>,
  ): void {
    this.dialog.open(ConversationDeleteConfirmationComponent, { data })
      .afterClosed()
      .subscribe((confirmed) => {
        if (confirmed === true) {
          void deleteConversations();
        }
      });
  }
}
