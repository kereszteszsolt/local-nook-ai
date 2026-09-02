/*
 * SPDX-FileCopyrightText: 2026 Keresztes Zsolt <https://kereszteszsolt.hu>
 * SPDX-License-Identifier: Apache-2.0
 */

import { TestBed } from '@angular/core/testing';
import {
  DEFAULT_OLLAMA_RUNTIME_CONFIG,
  OLLAMA_BROWSER_CLIENT_FACTORY,
  OLLAMA_RUNTIME_CONFIG,
  OllamaBrowserClient,
  OllamaRuntimeConfig,
  resolveOllamaRuntimeConfig,
} from '../../../core/config/ollama.config';
import { OllamaClientService } from './ollama-client.service';

function createStream(chunks: readonly object[]) {
  let index = 0;
  return {
    [Symbol.asyncIterator]() {
      return this;
    },
    async next() {
      const value = chunks[index++];
      return value === undefined ? { done: true, value: undefined } : { done: false, value };
    },
    async return() {
      return { done: true, value: undefined };
    },
  };
}

describe('OllamaClientService', () => {
  let list: jasmine.Spy;
  let chat: jasmine.Spy;
  let abort: jasmine.Spy;
  let createClient: jasmine.Spy;
  let client: OllamaBrowserClient;
  let service: OllamaClientService;

  beforeEach(() => {
    list = jasmine.createSpy('list');
    chat = jasmine.createSpy('chat');
    abort = jasmine.createSpy('abort');
    client = { list, chat, abort } as unknown as OllamaBrowserClient;
    createClient = jasmine.createSpy('createClient').and.returnValue(client);
  });

  function configureService(
    runtimeConfig: OllamaRuntimeConfig = DEFAULT_OLLAMA_RUNTIME_CONFIG,
  ): void {
    TestBed.configureTestingModule({
      providers: [
        OllamaClientService,
        { provide: OLLAMA_RUNTIME_CONFIG, useValue: runtimeConfig },
        { provide: OLLAMA_BROWSER_CLIENT_FACTORY, useValue: createClient },
      ],
    });
    service = TestBed.inject(OllamaClientService);
  }

  it('passes the normalized runtime override to the injected SDK client factory', async () => {
    const runtimeConfig = resolveOllamaRuntimeConfig(
      '?ollamaHost=http%3A%2F%2F127.0.0.1%3A11435%2F',
    );
    configureService(runtimeConfig);
    list.and.resolveTo({ models: [] });

    await service.listModels();

    expect(createClient).toHaveBeenCalledOnceWith('http://127.0.0.1:11435');
  });

  it('rejects invalid runtime configuration before creating an SDK client', async () => {
    configureService(resolveOllamaRuntimeConfig('?ollamaHost=not-an-origin'));

    await expectAsync(service.listModels()).toBeRejectedWithError(
      Error,
      /Invalid Ollama endpoint override/,
    );
    expect(createClient).not.toHaveBeenCalled();
    expect(list).not.toHaveBeenCalled();
  });

  it('maps browser network failures to configured-endpoint startup guidance', async () => {
    configureService({ host: 'http://ollama.local:11434', validationError: null });
    list.and.rejectWith(new TypeError('Failed to fetch'));

    await expectAsync(service.listModels()).toBeRejectedWithError(
      Error,
      'Cannot reach Ollama at http://ollama.local:11434. Start Ollama, check the configured endpoint, and set OLLAMA_ORIGINS to allow this application origin if the browser blocks the request.',
    );
  });

  it('maps streaming startup network failures to the same recoverable guidance', async () => {
    configureService({ host: 'http://ollama.local:11434', validationError: null });
    chat.and.rejectWith(new TypeError('Network request failed'));

    const nextChunk = service.streamChat({
      model: 'qwen3:8b',
      messages: [{ role: 'user', content: 'Hi' }],
      think: false,
    }).next();

    await expectAsync(nextChunk).toBeRejectedWithError(
      Error,
      /Cannot reach Ollama at http:\/\/ollama\.local:11434.*OLLAMA_ORIGINS/,
    );
  });

  it('maps network failures raised after streaming has started', async () => {
    configureService({ host: 'http://ollama.local:11434', validationError: null });
    async function* failingStream() {
      yield { message: { content: 'Hello', thinking: '' }, done: false };
      throw new TypeError('Network error');
    }
    chat.and.resolveTo(failingStream());
    const iterator = service.streamChat({
      model: 'qwen3:8b',
      messages: [{ role: 'user', content: 'Hi' }],
      think: false,
    });

    await expectAsync(iterator.next()).toBeResolvedTo({
      done: false,
      value: { content: 'Hello', thinking: '', done: false, totalDuration: undefined },
    });
    await expectAsync(iterator.next()).toBeRejectedWithError(
      Error,
      /Cannot reach Ollama at http:\/\/ollama\.local:11434.*OLLAMA_ORIGINS/,
    );
  });

  it('preserves abort errors for the facade cancellation path', async () => {
    configureService();
    const abortError = new DOMException('The request was aborted.', 'AbortError');
    chat.and.rejectWith(abortError);

    const nextChunk = service.streamChat({
      model: 'qwen3:8b',
      messages: [{ role: 'user', content: 'Hi' }],
      think: false,
    }).next();

    await expectAsync(nextChunk).toBeRejectedWith(abortError);
  });

  it('preserves specific model errors from the official SDK', async () => {
    configureService();
    const modelError = new Error('model "missing:latest" not found');
    chat.and.rejectWith(modelError);

    const nextChunk = service.streamChat({
      model: 'missing:latest',
      messages: [{ role: 'user', content: 'Hi' }],
      think: false,
    }).next();

    await expectAsync(nextChunk).toBeRejectedWith(modelError);
  });

  it('preserves non-network type errors from the official SDK', async () => {
    configureService();
    const sdkError = new TypeError('Unexpected response shape');
    list.and.rejectWith(sdkError);

    await expectAsync(service.listModels()).toBeRejectedWith(sdkError);
  });

  it('maps the official model response to the application model contract', async () => {
    configureService();
    list.and.callFake(async () => ({
      models: [
        { name: 'qwen3:8b', model: 'qwen3:8b', capabilities: ['completion', 'thinking'] },
        { name: 'qwen3-embedding:0.6b', model: 'qwen3-embedding:0.6b', capabilities: ['embedding'] },
      ],
    }));

    await expectAsync(service.listModels()).toBeResolvedTo([
      { name: 'qwen3:8b', model: 'qwen3:8b', supportsThinking: true },
    ]);
  });

  it('keeps models from older Ollama servers that do not advertise capabilities', async () => {
    configureService();
    list.and.callFake(async () => ({ models: [{ name: 'llama3.1:8b', model: 'llama3.1:8b' }] }));

    await expectAsync(service.listModels()).toBeResolvedTo([
      { name: 'llama3.1:8b', model: 'llama3.1:8b', supportsThinking: false },
    ]);
  });

  it('maps streamed content, thinking, and duration without app-owned wire parsing', async () => {
    configureService();
    const stream = createStream([
      { message: { content: 'Hello', thinking: 'Plan' }, done: false, total_duration: 0 },
      { message: { content: '!', thinking: '' }, done: true, total_duration: 123 },
    ]);
    chat.and.callFake(async () => stream);

    const chunks = [];
    for await (const chunk of service.streamChat({
      model: 'qwen3:8b',
      messages: [{ role: 'user', content: 'Hi' }],
      think: true,
    })) {
      chunks.push(chunk);
    }

    expect(chat).toHaveBeenCalledWith({
      model: 'qwen3:8b',
      messages: [{ role: 'user', content: 'Hi' }],
      stream: true,
      think: true,
    });
    expect(chunks).toEqual([
      { content: 'Hello', thinking: 'Plan', done: false, totalDuration: undefined },
      { content: '!', thinking: '', done: true, totalDuration: 123 },
    ]);
  });

  it('cancels the active stream through its dedicated official SDK client', async () => {
    configureService();
    const stream = createStream([
      { message: { content: 'Hello', thinking: '' }, done: false, total_duration: 0 },
    ]);
    chat.and.callFake(async () => stream);
    const iterator = service.streamChat({
      model: 'qwen3:8b',
      messages: [{ role: 'user', content: 'Hi' }],
      think: false,
    });

    await iterator.next();
    service.abortActiveRequest();

    expect(abort).toHaveBeenCalledOnceWith();
    await iterator.return(undefined);
  });
});
