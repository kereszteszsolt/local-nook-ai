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
import { ConversationRepository, StoredConversation } from '../infrastructure/conversation.repository';
import { AiModelDto } from '../models/ai-model.model';
import { Message, SystemMessage } from '../models/message.model';

class FakeOllamaClientService {
  responseNumber = 0;
  pauseFirstResponse = false;
  readonly requests: OllamaChatRequest[] = [];
  nextResponse: readonly OllamaChatChunk[] | null = null;

  private releasePausedResponse: (() => void) | null = null;
  private firstRequestStartedResolve: (() => void) | null = null;
  private firstRequestStartedPromise: Promise<void> = Promise.resolve();

  async listModels(): Promise<AiModelDto[]> {
    return [{ name: 'qwen3:8b', model: 'qwen3:8b' }];
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

  async create(messages: readonly Message[]): Promise<StoredConversation> {
    this.throwWhenWritesFail();
    const now = Date.now();
    this.activeConversation = {
      id: `conversation-${++this.nextConversation}`,
      createdAt: now,
      updatedAt: now,
      messages: this.withMessageIds(messages),
    };
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
    return this.activeConversation;
  }

  async readActive(): Promise<StoredConversation | null> {
    return this.activeConversation;
  }

  async clearActive(): Promise<void> {
    this.throwWhenWritesFail();
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
      createdAt: 1,
      updatedAt: 2,
      messages: [{ id: 'message-1', role: 'user', content: 'Saved locally' }],
    };

    await facade.restoreConversation();

    expect(facade.messageHistoryList()).toEqual([
      { id: 'message-1', role: 'user', content: 'Saved locally' },
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
