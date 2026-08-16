/*
 * SPDX-FileCopyrightText: 2026 Keresztes Zsolt <https://kereszteszsolt.hu>
 * SPDX-License-Identifier: Apache-2.0
 */

import { TestBed } from '@angular/core/testing';
import { ChatFacade } from './chat-facade.service';
import { ChatContextBuilder } from './chat-context-builder';
import {
  OllamaChatChunk,
  OllamaChatRequest,
  OllamaClientService,
} from '../infrastructure/ollama-client.service';
import { SystemPromptRepository } from '../infrastructure/system-prompt.repository';
import {
  ConversationRepository,
  ConversationSummary,
  StoredConversation,
} from '../infrastructure/conversation.repository';
import { AiModelDto } from '../models/ai-model.model';
import { Message, SystemMessage } from '../models/message.model';

class FakeOllamaClientService {
  responseNumber = 0;
  pauseFirstResponse = false;
  models: AiModelDto[] = [{ name: 'qwen3:8b', model: 'qwen3:8b', supportsThinking: true }];
  readonly requests: OllamaChatRequest[] = [];
  nextResponse: readonly OllamaChatChunk[] | null = null;

  private releasePausedResponse: (() => void) | null = null;
  private firstRequestStartedResolve: (() => void) | null = null;
  private firstRequestStartedPromise: Promise<void> = Promise.resolve();

  async listModels(): Promise<AiModelDto[]> {
    return this.models;
  }

  async *streamChat(request: OllamaChatRequest): AsyncGenerator<OllamaChatChunk> {
    this.requests.push(request);
    this.responseNumber++;
    const responseNumber = this.responseNumber;

    if (this.nextResponse) {
      const chunks = this.nextResponse;
      this.nextResponse = null;
      for (const chunk of chunks) {
        yield chunk;
      }
      return;
    }

    if (this.pauseFirstResponse && responseNumber === 1) {
      this.firstRequestStartedResolve?.();
      await new Promise<void>((resolve) => {
        this.releasePausedResponse = resolve;
      });
    }

    yield {
      content: `response-${responseNumber}`,
      thinking: '',
      done: true,
      totalDuration: responseNumber,
    };
  }

  abortActiveRequest(): void {
    this.releasePausedResponse?.();
    this.releasePausedResponse = null;
  }

  pauseNextFirstResponse(): void {
    this.pauseFirstResponse = true;
    this.firstRequestStartedPromise = new Promise<void>((resolve) => {
      this.firstRequestStartedResolve = resolve;
    });
  }

  waitForFirstRequest(): Promise<void> {
    return this.firstRequestStartedPromise;
  }
}

class FakePromptRepository {
  load(): SystemMessage[] {
    return [];
  }

  save(): void {}
  clear(): void {}
}

class FakeConversationRepository {
  activeConversation: StoredConversation | null = null;
  failWrites = false;
  private nextConversation = 0;
  private readonly conversations = new Map<string, StoredConversation>();

  async create(messages: readonly Message[]): Promise<StoredConversation> {
    this.throwWhenWritesFail();
    const now = Date.now();
    this.activeConversation = {
      id: `conversation-${++this.nextConversation}`,
      title: 'Test conversation',
      createdAt: now,
      updatedAt: now,
      messages: this.withMessageIds(messages),
    };
    this.conversations.set(this.activeConversation.id, this.activeConversation);
    return this.activeConversation;
  }

  async update(id: string, messages: readonly Message[]): Promise<StoredConversation | null> {
    this.throwWhenWritesFail();
    if (this.activeConversation?.id !== id) {
      return null;
    }
    this.activeConversation = {
      ...this.activeConversation,
      updatedAt: Date.now(),
      messages: this.withMessageIds(messages),
    };
    this.conversations.set(id, this.activeConversation);
    return this.activeConversation!;
  }

  async list(): Promise<ConversationSummary[]> {
    const conversations = new Map(this.conversations);
    if (this.activeConversation) {
      conversations.set(this.activeConversation.id, this.activeConversation);
    }
    return [...conversations.values()]
      .map(({ id, title, createdAt, updatedAt }) => ({ id, title, createdAt, updatedAt }));
  }

  async read(id: string): Promise<StoredConversation | null> {
    return this.activeConversation?.id === id
      ? this.activeConversation
      : (this.conversations.get(id) ?? null);
  }

  async readActive(): Promise<StoredConversation | null> {
    return this.activeConversation;
  }

  async clearActive(): Promise<void> {
    this.throwWhenWritesFail();
    this.activeConversation = null;
  }

  async setActive(id: string): Promise<boolean> {
    const conversation = await this.read(id);
    if (!conversation) {
      return false;
    }
    this.activeConversation = conversation;
    return true;
  }

  async delete(id: string): Promise<void> {
    this.throwWhenWritesFail();
    this.conversations.delete(id);
    if (this.activeConversation?.id === id) {
      this.activeConversation = null;
    }
  }

  async deleteAll(): Promise<void> {
    this.throwWhenWritesFail();
    this.conversations.clear();
    this.activeConversation = null;
  }

  private withMessageIds(messages: readonly Message[]): Message[] {
    return messages.map((message, index) => ({ ...message, id: message.id ?? `message-${index}` }));
  }

  private throwWhenWritesFail(): void {
    if (this.failWrites) {
      throw new Error('Storage unavailable');
    }
  }
}

describe('ChatFacade', () => {
  let facade: ChatFacade;
  let client: FakeOllamaClientService;
  let conversationRepository: FakeConversationRepository;

  beforeEach(() => {
    client = new FakeOllamaClientService();
    conversationRepository = new FakeConversationRepository();
    TestBed.configureTestingModule({
      providers: [
        ChatFacade,
        ChatContextBuilder,
        { provide: OllamaClientService, useValue: client },
        { provide: SystemPromptRepository, useClass: FakePromptRepository },
        { provide: ConversationRepository, useValue: conversationRepository },
      ],
    });
    facade = TestBed.inject(ChatFacade);
  });

  it('does not append an unsent user message when no model is selected', async () => {
    await facade.sendChatMessage('Hello');

    expect(facade.messageHistoryList()).toEqual([]);
    expect(facade.errorMessage()).toContain('Select an available Ollama model');
    expect(client.requests).toEqual([]);
  });

  it('restores only the active persisted conversation after reload', async () => {
    conversationRepository.activeConversation = {
      id: 'active-conversation',
      title: 'Saved locally',
      createdAt: 1,
      updatedAt: 2,
      messages: [{ id: 'message-1', role: 'user', content: 'Saved locally' }],
    };

    await facade.restoreConversation();

    expect(facade.messageHistoryList()).toEqual([
      { id: 'message-1', role: 'user', content: 'Saved locally' },
    ]);
  });

  it('opens one stored conversation without mixing it with the active history', async () => {
    const first = await conversationRepository.create([
      { role: 'user', content: 'First conversation' },
    ]);
    await conversationRepository.create([{ role: 'user', content: 'Second conversation' }]);
    await facade.restoreConversation();

    await facade.openConversation(first.id);

    expect(facade.messageHistoryList().map((message) => message.content)).toEqual([
      'First conversation',
    ]);
    expect(facade.conversations()).toHaveSize(2);
  });

  it('clears active state when deleting the active conversation or all conversations', async () => {
    const first = await conversationRepository.create([{ role: 'user', content: 'First' }]);
    await conversationRepository.create([{ role: 'user', content: 'Second' }]);
    await facade.restoreConversation();

    await facade.deleteConversation('conversation-2');
    await facade.openConversation(first.id);
    await facade.deleteAllConversations();

    expect(facade.messageHistoryList()).toEqual([]);
    expect(facade.activeConversation()).toBeNull();
    expect(facade.conversations()).toEqual([]);
  });

  it('creates a new conversation without overwriting the previous one', async () => {
    await facade.loadModels();
    await facade.sendChatMessage('First conversation');
    facade.newChat();
    await facade.sendChatMessage('Second conversation');

    expect(facade.conversations()).toHaveSize(2);
    expect(facade.messageHistoryList().map((message) => message.content)).toEqual([
      'Second conversation',
      'response-2',
    ]);
  });

  it('stores a completed assistant response after the stream finishes', async () => {
    await facade.loadModels();
    await facade.sendChatMessage('Hello', true);

    expect(facade.messageHistoryList().map(({ role, content }) => ({ role, content }))).toEqual([
      { role: 'user', content: 'Hello' },
      { role: 'assistant', content: 'response-1' },
    ]);
    expect(client.requests[0].think).toBeTrue();
    expect(conversationRepository.activeConversation?.messages).toHaveSize(2);
  });

  it('does not request thinking from a model that does not support it', async () => {
    client.models = [{ name: 'llama3.1:8b', model: 'llama3.1:8b', supportsThinking: false }];
    await facade.loadModels();

    await facade.sendChatMessage('Hello', true);

    expect(client.requests[0].think).toBeFalse();
    expect(facade.messageHistoryList()[0].think).toBeFalse();
  });

  it('surfaces storage failures without sending the request', async () => {
    conversationRepository.failWrites = true;
    await facade.loadModels();

    await facade.sendChatMessage('Hello');

    expect(facade.messageHistoryList()).toEqual([]);
    expect(facade.errorMessage()).toContain('Could not save browser-local conversation history.');
    expect(client.requests).toEqual([]);
  });

  it('regenerates from the original user message without duplicating it', async () => {
    await facade.loadModels();
    await facade.sendChatMessage('Hello');
    const requestId = facade.messageHistoryList()[0].req_id!;

    await facade.regenerateResponse(requestId);

    const history = facade.messageHistoryList();
    expect(history.filter((message) => message.role === 'user')).toHaveSize(1);
    expect(history).toHaveSize(2);
    expect(history[1].content).toBe('response-2');
  });

  it('does not store a thinking-only completion as an assistant answer', async () => {
    client.nextResponse = [{
      content: '',
      thinking: 'Internal reasoning only',
      done: true,
      totalDuration: 42,
    }];
    await facade.loadModels();

    await facade.sendChatMessage('Hello', true);

    expect(facade.messageHistoryList().map(({ role, content }) => ({ role, content }))).toEqual([
      { role: 'user', content: 'Hello' },
    ]);
    expect(facade.errorMessage()).toContain('without returning content');
  });

  it('ignores late chunks from an aborted generation after a replacement starts', async () => {
    client.pauseNextFirstResponse();
    await facade.loadModels();

    const firstGeneration = facade.sendChatMessage('First');
    await client.waitForFirstRequest();
    facade.abortChatMessage();

    const replacementGeneration = facade.sendChatMessage('Second');
    await Promise.all([firstGeneration, replacementGeneration]);

    expect(facade.messageHistoryList().map(({ role, content }) => ({ role, content }))).toEqual([
      { role: 'user', content: 'First' },
      { role: 'user', content: 'Second' },
      { role: 'assistant', content: 'response-2' },
    ]);
    expect(facade.isLoadingResponse()).toBeFalse();
  });
});
