/*
 * SPDX-FileCopyrightText: 2026 Keresztes Zsolt <https://kereszteszsolt.hu>
 * SPDX-License-Identifier: Apache-2.0
 */

import { SystemPromptRepository } from './system-prompt.repository';

describe('SystemPromptRepository', () => {
  const repository = new SystemPromptRepository();

  beforeEach(() => localStorage.clear());
  afterEach(() => localStorage.clear());

  it('returns an empty list for malformed storage data', () => {
    localStorage.setItem('local-ai-client.system-prompts.v1', '{not-json');
    expect(repository.load()).toEqual([]);
  });

  it('filters invalid entries and preserves valid prompts', () => {
    localStorage.setItem('local-ai-client.system-prompts.v1', JSON.stringify([
      { sys_msg_id: 'valid', role: 'system', content: 'Be helpful.', active: true, folder: 'General' },
      { role: 'system', content: 'Missing fields' },
    ]));

    expect(repository.load()).toEqual([
      { sys_msg_id: 'valid', role: 'system', content: 'Be helpful.', active: true, folder: 'General' },
    ]);
  });

  it('migrates the legacy prompt key without coupling storage to the display name', () => {
    localStorage.setItem('ollama-chat-system-prompts', JSON.stringify([
      { sys_msg_id: 'legacy', role: 'system', content: 'Legacy prompt', active: true, folder: 'General' },
    ]));

    expect(repository.load()[0].sys_msg_id).toBe('legacy');
    expect(localStorage.getItem('local-ai-client.system-prompts.v1')).not.toBeNull();
  });
});
