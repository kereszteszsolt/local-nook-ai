import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { provideMarkdown } from 'ngx-markdown';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';
import { ChatFacade } from '../../application/chat-facade.service';
import { ChatPageComponent } from './chat-page.component';

describe('ChatPageComponent', () => {
  let component: ChatPageComponent;
  let fixture: ComponentFixture<ChatPageComponent>;
  let afterClosed: jasmine.Spy;
  let facade: {
    messageHistoryList: ReturnType<typeof signal>;
    partialResponse: ReturnType<typeof signal>;
    partialThinking: ReturnType<typeof signal>;
    isLoadingResponse: ReturnType<typeof signal>;
    currentModelSupportsThinking: ReturnType<typeof signal>;
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
      currentModelSupportsThinking: signal(false),
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
    const dialogRef = jasmine.createSpyObj<MatDialogRef<unknown, boolean>>('MatDialogRef', ['afterClosed']);
    afterClosed = dialogRef.afterClosed.and.returnValue(of(true));
    const dialog = jasmine.createSpyObj<MatDialog>('MatDialog', ['open']);
    dialog.open.and.returnValue(dialogRef);

    await TestBed.configureTestingModule({
      imports: [ChatPageComponent, NoopAnimationsModule],
      providers: [
        provideMarkdown(),
        { provide: ChatFacade, useValue: facade },
        { provide: MatDialog, useValue: dialog },
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

  it('delegates modal-confirmed conversation controls to the facade', () => {
    const conversation = {
      id: 'conversation-1',
      title: 'Delete me',
      createdAt: 1,
      updatedAt: 2,
    };

    component.onOpenConversation('conversation-1');
    component.onRequestDeleteConversation(conversation);
    component.onRequestDeleteAll();

    expect(facade.openConversation).toHaveBeenCalledOnceWith('conversation-1');
    expect(facade.deleteConversation).toHaveBeenCalledOnceWith('conversation-1');
    expect(facade.deleteAllConversations).toHaveBeenCalledOnceWith();
  });

  it('does not delete a conversation when its modal is dismissed', () => {
    afterClosed.and.returnValue(of(undefined));
    component.onRequestDeleteConversation({
      id: 'conversation-1',
      title: 'Keep me',
      createdAt: 1,
      updatedAt: 2,
    });

    expect(facade.deleteConversation).not.toHaveBeenCalled();
  });

  it('renders a full-card hover state for a saved conversation', () => {
    facade.conversations.set([{
      id: 'conversation-1',
      title: 'Local chat',
      createdAt: 1,
      updatedAt: 2,
    }]);
    fixture.detectChanges();

    const card: HTMLElement | null = fixture.nativeElement.querySelector('.conversation-card');
    const openButton: HTMLButtonElement | null = card?.querySelector('button') ?? null;

    expect(card?.classList).toContain('hover:bg-surface');
    expect(openButton?.classList).toContain('focus-visible:ring-accent');
  });
});
