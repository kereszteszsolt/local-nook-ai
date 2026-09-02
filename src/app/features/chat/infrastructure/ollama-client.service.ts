/*
 * SPDX-FileCopyrightText: 2026 Keresztes Zsolt <https://kereszteszsolt.hu>
 * SPDX-License-Identifier: Apache-2.0
 */

import { inject, Injectable } from '@angular/core';
import type { ChatResponse } from 'ollama/browser';
import {
  OLLAMA_BROWSER_CLIENT_FACTORY,
  OLLAMA_RUNTIME_CONFIG,
  OllamaBrowserClient,
} from '../../../core/config/ollama.config';
import { AiModelDto } from '../models/ai-model.model';
import { ModelContextMessage } from '../models/message.model';

export interface OllamaChatRequest {
  readonly model: string;
  readonly messages: readonly ModelContextMessage[];
  readonly think: boolean;
}

export interface OllamaChatChunk {
  readonly content: string;
  readonly thinking: string;
  readonly done: boolean;
  readonly totalDuration?: number;
}

interface ActiveOllamaRequest {
  readonly id: number;
  readonly client: OllamaBrowserClient;
}

@Injectable({ providedIn: 'root' })
export class OllamaClientService {
  private readonly createClient = inject(OLLAMA_BROWSER_CLIENT_FACTORY);
  private readonly runtimeConfig = inject(OLLAMA_RUNTIME_CONFIG);
  private requestSequence = 0;
  private activeRequest: ActiveOllamaRequest | null = null;

  async listModels(): Promise<AiModelDto[]> {
    const client = this.createConfiguredClient();
    try {
      const response = await client.list();
      return response.models
        .filter((model) => supportsChat(model as OllamaModelWithCapabilities))
        .map((model) => ({
          name: model.name,
          model: model.model,
          supportsThinking: (model as OllamaModelWithCapabilities).capabilities?.includes('thinking') === true,
        }));
    } catch (error: unknown) {
      throw this.mapConnectionError(error);
    }
  }

  async *streamChat(request: OllamaChatRequest): AsyncGenerator<OllamaChatChunk> {
    const requestId = ++this.requestSequence;
    const client = this.createConfiguredClient();
    this.activeRequest = { id: requestId, client };

    try {
      const stream = await client.chat({
        model: request.model,
        messages: request.messages.map(({ role, content }) => ({ role, content })),
        stream: true,
        think: request.think,
      });

      if (this.activeRequest?.id !== requestId) {
        client.abort();
        return;
      }

      for await (const part of stream) {
        yield this.mapChunk(part);
      }
    } catch (error: unknown) {
      throw this.mapConnectionError(error);
    } finally {
      if (this.activeRequest?.id === requestId) {
        this.activeRequest = null;
      }
    }
  }

  abortActiveRequest(): void {
    const request = this.activeRequest;
    if (!request) {
      return;
    }

    this.activeRequest = null;
    request.client.abort();
  }

  private mapChunk(part: ChatResponse): OllamaChatChunk {
    return {
      content: part.message.content ?? '',
      thinking: part.message.thinking ?? '',
      done: part.done,
      totalDuration: part.done ? part.total_duration : undefined,
    };
  }

  private createConfiguredClient(): OllamaBrowserClient {
    if (this.runtimeConfig.validationError) {
      throw new Error(this.runtimeConfig.validationError);
    }

    return this.createClient(this.runtimeConfig.host);
  }

  private mapConnectionError(error: unknown): unknown {
    if (!isBrowserNetworkFailure(error)) {
      return error;
    }

    return new Error(
      `Cannot reach Ollama at ${this.runtimeConfig.host}. Start Ollama, check the configured endpoint, and set OLLAMA_ORIGINS to allow this application origin if the browser blocks the request.`,
    );
  }
}

type OllamaModelWithCapabilities = {
  readonly capabilities?: readonly string[];
};

function supportsChat(model: OllamaModelWithCapabilities): boolean {
  return model.capabilities === undefined || model.capabilities.includes('completion');
}

function isBrowserNetworkFailure(error: unknown): boolean {
  if (!(error instanceof Error)) {
    return false;
  }

  return error.name === 'NetworkError'
    || (error instanceof TypeError
      && /failed to fetch|fetch failed|load failed|network(?:\s?error| request failed)/i.test(error.message));
}
