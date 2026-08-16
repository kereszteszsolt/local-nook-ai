/*
 * SPDX-FileCopyrightText: 2026 Keresztes Zsolt <https://kereszteszsolt.hu>
 * SPDX-License-Identifier: Apache-2.0
 */

import { inject, InjectionToken } from '@angular/core';
import { Ollama } from 'ollama/browser';

export interface OllamaRuntimeConfig {
  readonly host: string;
}

export const DEFAULT_OLLAMA_RUNTIME_CONFIG = {
  host: 'http://localhost:11434',
} as const satisfies OllamaRuntimeConfig;

export const OLLAMA_RUNTIME_CONFIG = new InjectionToken<OllamaRuntimeConfig>(
  'OLLAMA_RUNTIME_CONFIG',
  {
    providedIn: 'root',
    factory: () => DEFAULT_OLLAMA_RUNTIME_CONFIG,
  },
);

export type OllamaBrowserClient = Pick<Ollama, 'abort' | 'chat' | 'list'>;
export type OllamaBrowserClientFactory = () => OllamaBrowserClient;

export const OLLAMA_BROWSER_CLIENT_FACTORY = new InjectionToken<OllamaBrowserClientFactory>(
  'OLLAMA_BROWSER_CLIENT_FACTORY',
  {
    providedIn: 'root',
    factory: () => {
      const config = inject(OLLAMA_RUNTIME_CONFIG);
      return () => new Ollama({ host: config.host });
    },
  },
);
