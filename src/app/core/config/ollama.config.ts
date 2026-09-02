/*
 * SPDX-FileCopyrightText: 2026 Keresztes Zsolt <https://kereszteszsolt.hu>
 * SPDX-License-Identifier: Apache-2.0
 */

import { InjectionToken } from '@angular/core';
import { Ollama } from 'ollama/browser';

export interface OllamaRuntimeConfig {
  readonly host: string;
  readonly validationError: string | null;
}

export const DEFAULT_OLLAMA_RUNTIME_CONFIG = {
  host: 'http://localhost:11434',
  validationError: null,
} as const satisfies OllamaRuntimeConfig;

const INVALID_OLLAMA_HOST_MESSAGE =
  'Invalid Ollama endpoint override. Set ollamaHost to an absolute http/https origin without credentials, a path, query, or fragment (for example http://localhost:11434), or remove the parameter.';

export function resolveOllamaRuntimeConfig(search: string): OllamaRuntimeConfig {
  const parameters = new URLSearchParams(search);
  if (!parameters.has('ollamaHost')) {
    return DEFAULT_OLLAMA_RUNTIME_CONFIG;
  }

  const override = parameters.get('ollamaHost') ?? '';
  try {
    const url = new URL(override);
    const isHttpOrigin = url.protocol === 'http:' || url.protocol === 'https:';
    const isOriginOnly = url.pathname === '/' && url.search === '' && url.hash === '';
    const hasNoCredentials = url.username === '' && url.password === '';

    if (!isHttpOrigin || !isOriginOnly || !hasNoCredentials) {
      throw new Error(INVALID_OLLAMA_HOST_MESSAGE);
    }

    return {
      host: url.origin,
      validationError: null,
    };
  } catch {
    return {
      host: DEFAULT_OLLAMA_RUNTIME_CONFIG.host,
      validationError: INVALID_OLLAMA_HOST_MESSAGE,
    };
  }
}

export const OLLAMA_RUNTIME_CONFIG = new InjectionToken<OllamaRuntimeConfig>(
  'OLLAMA_RUNTIME_CONFIG',
  {
    providedIn: 'root',
    factory: () => resolveOllamaRuntimeConfig(globalThis.location?.search ?? ''),
  },
);

export type OllamaBrowserClient = Pick<Ollama, 'abort' | 'chat' | 'list'>;
export type OllamaBrowserClientFactory = (host: string) => OllamaBrowserClient;

export const OLLAMA_BROWSER_CLIENT_FACTORY = new InjectionToken<OllamaBrowserClientFactory>(
  'OLLAMA_BROWSER_CLIENT_FACTORY',
  {
    providedIn: 'root',
    factory: () => (host: string) => new Ollama({ host }),
  },
);
