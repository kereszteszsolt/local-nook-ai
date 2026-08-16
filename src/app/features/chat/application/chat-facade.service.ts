/*
 * SPDX-FileCopyrightText: 2026 Keresztes Zsolt <https://kereszteszsolt.hu>
 * SPDX-License-Identifier: Apache-2.0
 */

import { inject, Injectable, signal } from '@angular/core';
import { AiModelDto } from '../models/ai-model.model';
import { Message, SystemMessage } from '../models/message.model';
import { OllamaClientService } from '../infrastructure/ollama-client.service';
import { SystemPromptRepository } from '../infrastructure/system-prompt.repository';
import { ChatContextBuilder } from './chat-context-builder';

@Injectable({ providedIn: 'root' })
export class ChatFacade {
  private readonly ollamaClient = inject(OllamaClientService);
  private readonly promptRepository = inject(SystemPromptRepository);
  private readonly contextBuilder = inject(ChatContextBuilder);

  private readonly availableModels = signal<AiModelDto[]>([]);
  private readonly selectedModel = signal<AiModelDto | null>(null);
  private readonly messageHistory = signal<Message[]>([]);
  private readonly currentResponse = signal('');
  private readonly currentThinking = signal('');
  private readonly loadingResponse = signal(false);
  private readonly systemPrompts = signal<SystemMessage[]>([]);
  private readonly lastError = signal<string | null>(null);
  private generationSequence = 0;
  private activeGenerationId: number | null = null;

  readonly aiModels = this.availableModels.asReadonly();
  readonly currentModel = this.selectedModel.asReadonly();
  readonly messageHistoryList = this.messageHistory.asReadonly();
  readonly partialResponse = this.currentResponse.asReadonly();
  readonly partialThinking = this.currentThinking.asReadonly();
  readonly isLoadingResponse = this.loadingResponse.asReadonly();
  readonly systemPromptsSignal = this.systemPrompts.asReadonly();
  readonly errorMessage = this.lastError.asReadonly();

  async loadModels(): Promise<void> {
    this.lastError.set(null);
    try {
      const models = await this.ollamaClient.listModels();
      this.availableModels.set(models);

      const current = this.selectedModel();
      const stillAvailable = current && models.some((model) => model.model === current.model);
      this.selectedModel.set(stillAvailable ? current : (models[0] ?? null));

      if (models.length === 0) {
        this.lastError.set('No local Ollama models are available. Pull a model and refresh the list.');
      }
    } catch (error: unknown) {
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

  setCurrentModel(model: AiModelDto | null): void {
    this.selectedModel.set(model);
    this.lastError.set(null);
  }

  async sendChatMessage(userInput: string, think = false): Promise<void> {
    const content = userInput.trim();
    if (!content || this.loadingResponse()) {
      return;
    }

    if (!this.hasSelectedModel()) {
      return;
    }

    const requestId = crypto.randomUUID();
    const nextHistory: Message[] = [
      ...this.messageHistory(),
      { role: 'user', content, req_id: requestId, think },
    ];
    this.messageHistory.set(nextHistory);
    await this.generateResponse(nextHistory, requestId, think);
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
    this.messageHistory.set(truncatedHistory);
    await this.generateResponse(truncatedHistory, requestId, userMessage.think === true);
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
        this.messageHistory.update((messages) => [
          ...messages,
          {
            role: 'assistant',
            content: response,
            thinking,
            total_duration: totalDuration,
            ref_id: requestId,
          },
        ]);
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
