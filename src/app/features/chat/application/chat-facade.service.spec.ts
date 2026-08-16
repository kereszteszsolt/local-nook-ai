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
import { ActiveModelRepository } from '../infrastructure/active-model.repository';
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

class FakeActiveModelRepository {
  modelId: string | null = null;

  load(): string | null {
    return this.modelId;
  }

  save(modelId: string): void {
    this.modelId = modelId;
  }

  clear(): void {
    this.modelId = null;
  }
}

class FakeConversationRepository {
  activeConversation: StoredConversation | null = null;
  failWrites = false;
  private nextConversation = 0;
  private readonly conversations = new Map<string, StoredConversation>();

  async create(messages: readonly Message[], modelId?: string): Promise<StoredConversation> {
    this.throwWhenWritesFail();
    const now = Date.now();
    this.activeConversation = {
      id: `conversation-${++this.nextConversation}`,
      title: 'Test conversation',
      createdAt: now,
      updatedAt: now,
      ...(modelId ? { modelId } : {}),
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

  async updateModel(id: string, modelId: string): Promise<boolean> {
    this.throwWhenWritesFail();
    const conversation = await this.read(id);
    if (!conversation) {
      return false;
    }

    const updated: StoredConversation = {
      ...conversation,
      modelId,
      updatedAt: Date.now(),
    };
    this.conversations.set(id, updated);
    if (this.activeConversation?.id === id) {
      this.activeConversation = updated;
    }
    return true;
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
  let activeModelRepository: FakeActiveModelRepository;

  beforeEach(() => {
    client = new FakeOllamaClientService();
    conversationRepository = new FakeConversationRepository();
    activeModelRepository = new FakeActiveModelRepository();
    TestBed.configureTestingModule({
      providers: [
        ChatFacade,
        ChatContextBuilder,
        { provide: OllamaClientService, useValue: client },
        { provide: ActiveModelRepository, useValue: activeModelRepository },
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

  it('restores the latest browser-local model when no conversation model applies', async () => {
    client.models = [
      { name: 'qwen3:8b', model: 'qwen3:8b', supportsThinking: true },
      { name: 'llama3.1:8b', model: 'llama3.1:8b', supportsThinking: false },
    ];
    activeModelRepository.modelId = 'llama3.1:8b';

    await facade.loadModels();

    expect(facade.currentModel()?.model).toBe('llama3.1:8b');
  });

  it('activates an available conversation model when opening a saved chat', async () => {
    client.models = [
      { name: 'qwen3:8b', model: 'qwen3:8b', supportsThinking: true },
      { name: 'llama3.1:8b', model: 'llama3.1:8b', supportsThinking: false },
    ];
    const qwenConversation = await conversationRepository.create([
      { role: 'user', content: 'Use Qwen' },
    ], 'qwen3:8b');
    const llamaConversation = await conversationRepository.create([
      { role: 'user', content: 'Use Llama' },
    ], 'llama3.1:8b');
    await facade.loadModels();

    await facade.openConversation(qwenConversation.id);
    expect(facade.currentModel()?.model).toBe('qwen3:8b');
    expect(activeModelRepository.modelId).toBe('qwen3:8b');

    await facade.openConversation(llamaConversation.id);
    expect(facade.currentModel()?.model).toBe('llama3.1:8b');
    expect(activeModelRepository.modelId).toBe('llama3.1:8b');
  });

  it('reconciles an active restored conversation model after model discovery', async () => {
    client.models = [
      { name: 'qwen3:8b', model: 'qwen3:8b', supportsThinking: true },
      { name: 'llama3.1:8b', model: 'llama3.1:8b', supportsThinking: false },
    ];
    conversationRepository.activeConversation = {
      id: 'active-conversation',
      title: 'Saved locally',
      createdAt: 1,
      updatedAt: 2,
      modelId: 'llama3.1:8b',
      messages: [{ id: 'message-1', role: 'user', content: 'Saved locally' }],
    };

    await facade.restoreConversation();
    await facade.loadModels();

    expect(facade.currentModel()?.model).toBe('llama3.1:8b');
    expect(activeModelRepository.modelId).toBe('llama3.1:8b');
  });

  it('falls back without overwriting an unavailable conversation model', async () => {
    client.models = [{ name: 'qwen3:8b', model: 'qwen3:8b', supportsThinking: true }];
    conversationRepository.activeConversation = {
      id: 'unavailable-model',
      title: 'Saved locally',
      createdAt: 1,
      updatedAt: 2,
      modelId: 'removed-model:latest',
      messages: [{ id: 'message-1', role: 'user', content: 'Saved locally' }],
    };
    await facade.loadModels();

    await facade.restoreConversation();

    expect(facade.currentModel()?.model).toBe('qwen3:8b');
    expect(conversationRepository.activeConversation?.modelId).toBe('removed-model:latest');
    expect(activeModelRepository.modelId).toBe('qwen3:8b');
    expect(facade.errorMessage()).toContain('unavailable');
  });

  it('keeps an unavailable conversation model after continuing with the fallback', async () => {
    client.models = [{ name: 'qwen3:8b', model: 'qwen3:8b', supportsThinking: true }];
    conversationRepository.activeConversation = {
      id: 'unavailable-model',
      title: 'Saved locally',
      createdAt: 1,
      updatedAt: 2,
      modelId: 'removed-model:latest',
      messages: [{ id: 'message-1', role: 'user', content: 'Saved locally' }],
    };
    await facade.loadModels();
    await facade.restoreConversation();

    await facade.sendChatMessage('Continue with the fallback');

    expect(conversationRepository.activeConversation?.modelId).toBe('removed-model:latest');
    expect(client.requests[0].model).toBe('qwen3:8b');
  });

  it('keeps the global model preference when a refresh returns no models', async () => {
    activeModelRepository.modelId = 'qwen3:8b';
    client.models = [];

    await facade.loadModels();

    expect(facade.currentModel()).toBeNull();
    expect(activeModelRepository.modelId).toBe('qwen3:8b');
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
    expect(conversationRepository.activeConversation?.modelId).toBe('qwen3:8b');
  });

  it('persists an explicit model change to the active conversation', async () => {
    client.models = [
      { name: 'qwen3:8b', model: 'qwen3:8b', supportsThinking: true },
      { name: 'llama3.1:8b', model: 'llama3.1:8b', supportsThinking: false },
    ];
    await facade.loadModels();
    await facade.sendChatMessage('Hello');

    await facade.setCurrentModel(client.models[1]);

    expect(facade.currentModel()?.model).toBe('llama3.1:8b');
    expect(activeModelRepository.modelId).toBe('llama3.1:8b');
    expect(conversationRepository.activeConversation?.modelId).toBe('llama3.1:8b');
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
