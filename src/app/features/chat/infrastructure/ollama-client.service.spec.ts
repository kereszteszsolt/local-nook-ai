/*
 * SPDX-FileCopyrightText: 2026 Keresztes Zsolt <https://kereszteszsolt.hu>
 * SPDX-License-Identifier: Apache-2.0
 */

import { TestBed } from '@angular/core/testing';
import {
  OLLAMA_BROWSER_CLIENT_FACTORY,
  OllamaBrowserClient,
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
  let service: OllamaClientService;

  beforeEach(() => {
    list = jasmine.createSpy('list');
    chat = jasmine.createSpy('chat');
    abort = jasmine.createSpy('abort');
    const client = { list, chat, abort } as unknown as OllamaBrowserClient;

    TestBed.configureTestingModule({
      providers: [
        OllamaClientService,
        { provide: OLLAMA_BROWSER_CLIENT_FACTORY, useValue: () => client },
      ],
    });
    service = TestBed.inject(OllamaClientService);
  });

  it('maps the official model response to the application model contract', async () => {
    list.and.callFake(async () => ({ models: [{ name: 'qwen3:8b', model: 'qwen3:8b' }] }));

    await expectAsync(service.listModels()).toBeResolvedTo([
      { name: 'qwen3:8b', model: 'qwen3:8b' },
    ]);
  });

  it('maps streamed content, thinking, and duration without app-owned wire parsing', async () => {
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
