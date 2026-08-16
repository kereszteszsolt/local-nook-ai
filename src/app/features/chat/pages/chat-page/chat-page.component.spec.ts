import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogModule } from '@angular/material/dialog';
import { provideMarkdown } from 'ngx-markdown';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ChatFacade } from '../../application/chat-facade.service';
import { ChatPageComponent } from './chat-page.component';

describe('ChatPageComponent', () => {
  let component: ChatPageComponent;
  let fixture: ComponentFixture<ChatPageComponent>;
  let facade: {
    messageHistoryList: ReturnType<typeof signal>;
    partialResponse: ReturnType<typeof signal>;
    partialThinking: ReturnType<typeof signal>;
    isLoadingResponse: ReturnType<typeof signal>;
    errorMessage: ReturnType<typeof signal>;
    conversations: ReturnType<typeof signal>;
    activeConversation: ReturnType<typeof signal>;
    isLoadingConversations: ReturnType<typeof signal>;
    loadSystemPrompts: jasmine.Spy;
    restoreConversation: jasmine.Spy;
    sendChatMessage: jasmine.Spy;
    abortChatMessage: jasmine.Spy;
    newChat: jasmine.Spy;
    regenerateResponse: jasmine.Spy;
    openConversation: jasmine.Spy;
    deleteConversation: jasmine.Spy;
    deleteAllConversations: jasmine.Spy;
  };

  beforeEach(async () => {
    facade = {
      messageHistoryList: signal([]),
      partialResponse: signal(''),
      partialThinking: signal(''),
      isLoadingResponse: signal(false),
      errorMessage: signal<string | null>(null),
      conversations: signal([]),
      activeConversation: signal<string | null>(null),
      isLoadingConversations: signal(false),
      loadSystemPrompts: jasmine.createSpy('loadSystemPrompts'),
      restoreConversation: jasmine.createSpy('restoreConversation').and.resolveTo(),
      sendChatMessage: jasmine.createSpy('sendChatMessage').and.resolveTo(),
      abortChatMessage: jasmine.createSpy('abortChatMessage'),
      newChat: jasmine.createSpy('newChat'),
      regenerateResponse: jasmine.createSpy('regenerateResponse').and.resolveTo(),
      openConversation: jasmine.createSpy('openConversation').and.resolveTo(),
      deleteConversation: jasmine.createSpy('deleteConversation').and.resolveTo(),
      deleteAllConversations: jasmine.createSpy('deleteAllConversations').and.resolveTo(),
    };

    await TestBed.configureTestingModule({
      imports: [ChatPageComponent, MatDialogModule, NoopAnimationsModule],
      providers: [
        provideMarkdown(),
        { provide: ChatFacade, useValue: facade },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ChatPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('loads browser-local prompts when the page starts', () => {
    expect(facade.loadSystemPrompts).toHaveBeenCalledOnceWith();
    expect(facade.restoreConversation).toHaveBeenCalledOnceWith();
  });

  it('passes the typed composer event to the facade', () => {
    component.onSendMessage({ content: 'Hello', think: true });
    expect(facade.sendChatMessage).toHaveBeenCalledOnceWith('Hello', true);
  });

  it('delegates conversation controls to the facade', () => {
    component.onOpenConversation('conversation-1');
    component.onDeleteConversation('conversation-1');
    component.onConfirmDeleteAll();

    expect(facade.openConversation).toHaveBeenCalledOnceWith('conversation-1');
    expect(facade.deleteConversation).toHaveBeenCalledOnceWith('conversation-1');
    expect(facade.deleteAllConversations).toHaveBeenCalledOnceWith();
  });
});
