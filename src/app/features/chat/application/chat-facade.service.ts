/*
 * SPDX-FileCopyrightText: 2026 Keresztes Zsolt <https://kereszteszsolt.hu>
 * SPDX-License-Identifier: Apache-2.0
 */

import { computed, inject, Injectable, signal } from '@angular/core';
import { AiModelDto } from '../models/ai-model.model';
import { Message, SystemMessage } from '../models/message.model';
import { OllamaClientService } from '../infrastructure/ollama-client.service';
import { ActiveModelRepository } from '../infrastructure/active-model.repository';
import { SystemPromptRepository } from '../infrastructure/system-prompt.repository';
import {
  ConversationRepository,
  ConversationSummary,
} from '../infrastructure/conversation.repository';
import { ChatContextBuilder } from './chat-context-builder';

@Injectable({ providedIn: 'root' })
export class ChatFacade {
  private readonly ollamaClient = inject(OllamaClientService);
  private readonly activeModelRepository = inject(ActiveModelRepository);
  private readonly promptRepository = inject(SystemPromptRepository);
  private readonly conversationRepository = inject(ConversationRepository);
  private readonly contextBuilder = inject(ChatContextBuilder);

  private readonly availableModels = signal<AiModelDto[]>([]);
  private readonly selectedModel = signal<AiModelDto | null>(null);
  private readonly messageHistory = signal<Message[]>([]);
  private readonly currentResponse = signal('');
  private readonly currentThinking = signal('');
  private readonly loadingResponse = signal(false);
  private readonly systemPrompts = signal<SystemMessage[]>([]);
  private readonly lastError = signal<string | null>(null);
  private readonly activeConversationId = signal<string | null>(null);
  private readonly activeConversationModelId = signal<string | null>(null);
  private readonly storedConversations = signal<ConversationSummary[]>([]);
  private readonly loadingConversations = signal(false);
  private conversationRestore: Promise<void> = Promise.resolve();
  private activeReferenceUpdate: Promise<void> = Promise.resolve();
  private generationSequence = 0;
  private activeGenerationId: number | null = null;
  private modelsLoaded = false;

  readonly aiModels = this.availableModels.asReadonly();
  readonly currentModel = this.selectedModel.asReadonly();
  readonly currentModelSupportsThinking = computed(() => this.selectedModel()?.supportsThinking === true);
  readonly messageHistoryList = this.messageHistory.asReadonly();
  readonly partialResponse = this.currentResponse.asReadonly();
  readonly partialThinking = this.currentThinking.asReadonly();
  readonly isLoadingResponse = this.loadingResponse.asReadonly();
  readonly systemPromptsSignal = this.systemPrompts.asReadonly();
  readonly errorMessage = this.lastError.asReadonly();
  readonly activeConversation = this.activeConversationId.asReadonly();
  readonly conversations = this.storedConversations.asReadonly();
  readonly isLoadingConversations = this.loadingConversations.asReadonly();

  async loadModels(): Promise<void> {
    this.lastError.set(null);
    try {
      const models = await this.ollamaClient.listModels();
      this.availableModels.set(models);
      this.modelsLoaded = true;
      this.reconcileSelectedModel(models);

      if (models.length === 0) {
        this.lastError.set('No local Ollama models are available. Pull a model and refresh the list.');
      }
    } catch (error: unknown) {
      this.modelsLoaded = false;
      this.availableModels.set([]);
      this.selectedModel.set(null);
      this.lastError.set(toUserMessage(error, 'Could not connect to the local Ollama server.'));
    }
  }

  loadSystemPrompts(): void {
    this.systemPrompts.set(this.promptRepository.load());
  }

  saveSystemPrompts(prompts: readonly SystemMessage[]): void {
    const normalized = prompts.map(({ sys_msg_id, role, content, active, folder }) => ({
      sys_msg_id,
      role,
      content,
      active,
      folder,
    }));
    this.promptRepository.save(normalized);
    this.systemPrompts.set(normalized);
  }

  clearSystemPrompts(): void {
    this.promptRepository.clear();
    this.systemPrompts.set([]);
  }

  async setCurrentModel(model: AiModelDto | null): Promise<void> {
    const selected = model && this.availableModels().find(
      (availableModel) => availableModel.model === model.model,
    );
    this.lastError.set(null);
    this.activateModel(selected ?? null);
    if (selected) {
      await this.persistSelectedModelForActiveConversation(selected.model);
    }
  }

  async restoreConversation(): Promise<void> {
    this.conversationRestore = this.restoreActiveConversation();
    return this.conversationRestore;
  }

  async openConversation(id: string): Promise<void> {
    if (this.loadingResponse()) {
      return;
    }

    this.loadingConversations.set(true);
    try {
      const conversation = await this.conversationRepository.read(id);
      if (!conversation || !await this.conversationRepository.setActive(id)) {
        await this.loadConversations();
        this.lastError.set('This conversation is no longer available.');
        return;
      }
      this.activeConversationId.set(conversation.id);
      this.messageHistory.set([...conversation.messages]);
      this.activeConversationModelId.set(conversation.modelId ?? null);
      this.lastError.set(null);
      this.reconcileSelectedModel();
    } catch (error: unknown) {
      this.lastError.set(toUserMessage(error, 'Could not open browser-local conversation history.'));
    } finally {
      this.loadingConversations.set(false);
    }
  }

  async deleteConversation(id: string): Promise<void> {
    if (this.loadingResponse()) {
      return;
    }

    this.loadingConversations.set(true);
    try {
      await this.conversationRepository.delete(id);
      if (this.activeConversationId() === id) {
        this.activeConversationId.set(null);
        this.activeConversationModelId.set(null);
        this.messageHistory.set([]);
      }
      await this.loadConversations();
    } catch (error: unknown) {
      this.lastError.set(toUserMessage(error, 'Could not delete browser-local conversation history.'));
    } finally {
      this.loadingConversations.set(false);
    }
  }

  async deleteAllConversations(): Promise<void> {
    if (this.loadingResponse()) {
      return;
    }

    this.loadingConversations.set(true);
    try {
      await this.conversationRepository.deleteAll();
      this.activeConversationId.set(null);
      this.activeConversationModelId.set(null);
      this.messageHistory.set([]);
      this.storedConversations.set([]);
    } catch (error: unknown) {
      this.lastError.set(toUserMessage(error, 'Could not delete browser-local conversation history.'));
    } finally {
      this.loadingConversations.set(false);
    }
  }

  async sendChatMessage(userInput: string, think = false): Promise<void> {
    await this.conversationRestore;
    const content = userInput.trim();
    if (!content || this.loadingResponse()) {
      return;
    }

    if (!this.hasSelectedModel()) {
      return;
    }

    const requestId = crypto.randomUUID();
    const requestThinking = think && this.currentModelSupportsThinking();
    const nextHistory: Message[] = [
      ...this.messageHistory(),
      { role: 'user', content, req_id: requestId, think: requestThinking },
    ];
    const persistedHistory = await this.persistHistory(nextHistory);
    if (!persistedHistory) {
      return;
    }

    this.messageHistory.set(persistedHistory);
    await this.generateResponse(persistedHistory, requestId, requestThinking);
  }

  async regenerateResponse(requestId: string): Promise<void> {
    if (this.loadingResponse()) {
      return;
    }

    if (!this.hasSelectedModel()) {
      return;
    }

    const history = this.messageHistory();
    const userMessageIndex = history.findIndex(
      (message) => message.role === 'user' && message.req_id === requestId,
    );
    if (userMessageIndex < 0) {
      this.lastError.set('The original user message is no longer available for regeneration.');
      return;
    }

    const userMessage = history[userMessageIndex];
    const truncatedHistory = history.slice(0, userMessageIndex + 1);
    const persistedHistory = await this.persistHistory(truncatedHistory);
    if (!persistedHistory) {
      return;
    }

    this.messageHistory.set(persistedHistory);
    await this.generateResponse(
      persistedHistory,
      requestId,
      userMessage.think === true && this.currentModelSupportsThinking(),
    );
  }

  abortChatMessage(): void {
    if (this.activeGenerationId === null) {
      return;
    }

    this.activeGenerationId = null;
    this.ollamaClient.abortActiveRequest();
    this.resetPartialState();
    this.loadingResponse.set(false);
  }

  newChat(): void {
    this.abortChatMessage();
    this.messageHistory.set([]);
    this.activeConversationId.set(null);
    this.activeConversationModelId.set(null);
    this.activeReferenceUpdate = this.clearActiveConversation();
    this.resetPartialState();
    this.lastError.set(null);
  }

  private async generateResponse(
    historyForContext: readonly Message[],
    requestId: string,
    think: boolean,
  ): Promise<void> {
    const model = this.selectedModel();
    if (!model) {
      this.lastError.set('Select an available Ollama model before sending a message.');
      return;
    }

    const generationId = ++this.generationSequence;
    this.activeGenerationId = generationId;
    this.lastError.set(null);
    this.resetPartialState();
    this.loadingResponse.set(true);

    let response = '';
    let thinking = '';
    let totalDuration: number | undefined;

    try {
      const context = this.contextBuilder.build(this.systemPrompts(), historyForContext);
      for await (const chunk of this.ollamaClient.streamChat({
        model: model.model,
        messages: context,
        think,
      })) {
        if (this.activeGenerationId !== generationId) {
          return;
        }

        response += chunk.content;
        thinking += chunk.thinking;
        totalDuration = chunk.totalDuration ?? totalDuration;
        this.currentResponse.set(response);
        this.currentThinking.set(thinking);
      }

      if (this.activeGenerationId !== generationId) {
        return;
      }

      if (response.trim().length > 0) {
        const completedHistory: Message[] = [
          ...this.messageHistory(),
          {
            role: 'assistant',
            content: response,
            thinking,
            total_duration: totalDuration,
            ref_id: requestId,
          },
        ];
        const persistedHistory = await this.persistHistory(completedHistory);
        this.messageHistory.set(persistedHistory ?? completedHistory);
      } else {
        this.lastError.set('Ollama completed the request without returning content.');
      }
    } catch (error: unknown) {
      if (this.activeGenerationId === generationId && !isAbortError(error)) {
        this.lastError.set(toUserMessage(error, 'The Ollama response stream failed.'));
      }
    } finally {
      if (this.activeGenerationId === generationId) {
        this.activeGenerationId = null;
        this.resetPartialState();
        this.loadingResponse.set(false);
      }
    }
  }

  private hasSelectedModel(): boolean {
    if (this.selectedModel()) {
      return true;
    }

    this.lastError.set('Select an available Ollama model before sending a message.');
    return false;
  }

  private resetPartialState(): void {
    this.currentResponse.set('');
    this.currentThinking.set('');
  }

  private async persistHistory(messages: readonly Message[]): Promise<Message[] | null> {
    try {
      await this.activeReferenceUpdate;
      const activeConversationId = this.activeConversationId();
      const selectedModel = this.selectedModel();
      if (!selectedModel) {
        this.lastError.set('Select an available Ollama model before sending a message.');
        return null;
      }

      if (!activeConversationId) {
        const conversation = await this.conversationRepository.create(messages, selectedModel.model);
        this.activeConversationId.set(conversation.id);
        this.activeConversationModelId.set(conversation.modelId ?? selectedModel.model);
        await this.loadConversations();
        return [...conversation.messages];
      }

      if (this.activeConversationModelId() === null) {
        const modelUpdated = await this.conversationRepository.updateModel(
          activeConversationId,
          selectedModel.model,
        );
        if (!modelUpdated) {
          this.activeConversationId.set(null);
          this.activeConversationModelId.set(null);
          return this.persistHistory(messages);
        }
        this.activeConversationModelId.set(selectedModel.model);
      }

      const conversation = await this.conversationRepository.update(activeConversationId, messages);
      if (!conversation) {
        this.activeConversationId.set(null);
        this.activeConversationModelId.set(null);
        return this.persistHistory(messages);
      }
      this.activeConversationModelId.set(conversation.modelId ?? selectedModel.model);
      await this.loadConversations();
      return [...conversation.messages];
    } catch (error: unknown) {
      this.lastError.set(toUserMessage(error, 'Could not save browser-local conversation history.'));
      return null;
    }
  }

  private async clearActiveConversation(): Promise<void> {
    try {
      await this.conversationRepository.clearActive();
    } catch (error: unknown) {
      this.lastError.set(toUserMessage(error, 'Could not start a new browser-local conversation.'));
    }
  }

  private async restoreActiveConversation(): Promise<void> {
    this.loadingConversations.set(true);
    try {
      const conversation = await this.conversationRepository.readActive();
      this.activeConversationId.set(conversation?.id ?? null);
      this.activeConversationModelId.set(conversation?.modelId ?? null);
      this.messageHistory.set(conversation ? [...conversation.messages] : []);
      this.reconcileSelectedModel();
      await this.loadConversations();
    } catch (error: unknown) {
      this.lastError.set(toUserMessage(error, 'Could not restore browser-local conversation history.'));
    } finally {
      this.loadingConversations.set(false);
    }
  }

  private async loadConversations(): Promise<void> {
    this.storedConversations.set(await this.conversationRepository.list());
  }

  private reconcileSelectedModel(models = this.availableModels()): void {
    if (!this.modelsLoaded) {
      return;
    }

    const conversationModelId = this.activeConversationModelId();
    if (conversationModelId) {
      const conversationModel = models.find((model) => model.model === conversationModelId);
      if (conversationModel) {
        this.activateModel(conversationModel);
        return;
      }

      const fallback = models[0] ?? null;
      this.activateModel(fallback, fallback !== null);
      if (fallback) {
        this.lastError.set(`The saved conversation model is unavailable. Switched to ${fallback.name}.`);
      }
      return;
    }

    const savedModelId = this.loadSavedModelId();
    const savedModel = models.find((model) => model.model === savedModelId);
    const selected = savedModel ?? models[0] ?? null;
    this.activateModel(selected, selected !== null);
  }

  private activateModel(model: AiModelDto | null, persistSelection = true): void {
    this.selectedModel.set(model);
    if (!persistSelection) {
      return;
    }

    try {
      if (model) {
        this.activeModelRepository.save(model.model);
      } else {
        this.activeModelRepository.clear();
      }
    } catch (error: unknown) {
      this.lastError.set(toUserMessage(error, 'Could not save the active model selection.'));
    }
  }

  private loadSavedModelId(): string | null {
    try {
      return this.activeModelRepository.load();
    } catch (error: unknown) {
      this.lastError.set(toUserMessage(error, 'Could not restore the active model selection.'));
      return null;
    }
  }

  private async persistSelectedModelForActiveConversation(modelId: string): Promise<void> {
    const activeConversationId = this.activeConversationId();
    if (!activeConversationId || this.activeConversationModelId() === modelId) {
      return;
    }

    try {
      const updated = await this.conversationRepository.updateModel(activeConversationId, modelId);
      if (updated && this.activeConversationId() === activeConversationId) {
        this.activeConversationModelId.set(modelId);
        await this.loadConversations();
      }
    } catch (error: unknown) {
      this.lastError.set(toUserMessage(error, 'Could not save the selected model for this conversation.'));
    }
  }
}

function isAbortError(error: unknown): boolean {
  return error instanceof DOMException
    ? error.name === 'AbortError'
    : Boolean(error && typeof error === 'object' && 'name' in error && error.name === 'AbortError');
}

function toUserMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message.trim()) {
    return `${fallback} ${error.message}`;
  }
  return fallback;
}
