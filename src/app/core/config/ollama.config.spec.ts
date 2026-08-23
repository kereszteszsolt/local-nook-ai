/*
 * SPDX-FileCopyrightText: 2026 Keresztes Zsolt <https://kereszteszsolt.hu>
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  DEFAULT_OLLAMA_RUNTIME_CONFIG,
  resolveOllamaRuntimeConfig,
} from './ollama.config';

describe('Ollama runtime configuration', () => {
  it('uses the safe local default when no override is present', () => {
    expect(resolveOllamaRuntimeConfig('?unrelated=value')).toEqual(
      DEFAULT_OLLAMA_RUNTIME_CONFIG,
    );
  });

  it('accepts and normalizes an absolute http or https origin', () => {
    expect(resolveOllamaRuntimeConfig(
      '?ollamaHost=https%3A%2F%2Follama.example.test%3A11434%2F',
    )).toEqual({
      host: 'https://ollama.example.test:11434',
      validationError: null,
    });
  });

  [
    'ollama.local:11434',
    'ftp://ollama.local',
    'http://user:secret@ollama.local:11434',
    'http://ollama.local:11434/api',
    'http://ollama.local:11434?token=secret',
    'http://ollama.local:11434#fragment',
  ].forEach((override) => {
    it(`rejects the invalid explicit override ${override.split('secret').join('[redacted]')}`, () => {
      const config = resolveOllamaRuntimeConfig(
        `?ollamaHost=${encodeURIComponent(override)}`,
      );

      expect(config.host).toBe(DEFAULT_OLLAMA_RUNTIME_CONFIG.host);
      expect(config.validationError).toContain('Invalid Ollama endpoint override');
      expect(config.validationError).not.toContain('secret');
    });
  });
});
