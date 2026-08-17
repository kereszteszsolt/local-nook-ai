/*
 * SPDX-FileCopyrightText: 2026 Keresztes Zsolt <https://kereszteszsolt.hu>
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  BUILT_IN_SYSTEM_PROMPT,
  BUILT_IN_SYSTEM_PROMPT_ID,
  SYSTEM_PROMPT_DATABASE_NAME,
  SYSTEM_PROMPT_DATABASE_VERSION,
  SystemPromptRepository,
} from './system-prompt.repository';

describe('SystemPromptRepository', () => {
  let repository: SystemPromptRepository;

  beforeEach(async () => {
    await deletePromptDatabase();
    localStorage.clear();
    repository = new SystemPromptRepository();
  });

  afterEach(async () => {
    localStorage.clear();
    await deletePromptDatabase();
  });

  it('creates a dedicated versioned IndexedDB schema and seeds the active built-in prompt', async () => {
    const prompts = await repository.load();
    const database = await openPromptDatabase();

    expect(database.version).toBe(SYSTEM_PROMPT_DATABASE_VERSION);
    expect(Array.from(database.objectStoreNames)).toEqual(['metadata', 'prompts']);
    expect(prompts).toEqual([jasmine.objectContaining({
      sys_msg_id: BUILT_IN_SYSTEM_PROMPT_ID,
      source: 'built-in',
      active: true,
      position: 0,
      content: BUILT_IN_SYSTEM_PROMPT.content,
    })]);
    database.close();
  });

  it('documents concise, renderer-safe Markdown fences', () => {
    expect(BUILT_IN_SYSTEM_PROMPT.content).toContain('`$...$` or `$$...$$` for KaTeX.');
    expect(BUILT_IN_SYSTEM_PROMPT.content).toContain('```mermaid` followed by valid Mermaid');
    expect(BUILT_IN_SYSTEM_PROMPT.content).toContain('```vega-lite` followed by one valid JSON object');
    expect(BUILT_IN_SYSTEM_PROMPT.content).toContain('Never use a `json` fence, nested fences, `transform`, `calc`, `calculate`');
    expect(BUILT_IN_SYSTEM_PROMPT.content).toContain('```vega-lite');
    expect(BUILT_IN_SYSTEM_PROMPT.content).toContain('`"$schema":"https://vega.github.io/schema/vega-lite/v5.json"`');
    expect(BUILT_IN_SYSTEM_PROMPT.content).toContain('`"data":{"values":[...]}`, `"mark":"line"`, and `"encoding":{"x":{"field":"x","type":"quantitative"},"y":{"field":"y","type":"quantitative"}}`');
    expect(BUILT_IN_SYSTEM_PROMPT.content).toContain('`encoding` is required.');
    expect(BUILT_IN_SYSTEM_PROMPT.content).toContain('Calculate values from the requested formula; for equations, include every real root in the x range.');
  });

  it('migrates valid current localStorage prompts once, preserving active state and order', async () => {
    localStorage.setItem('local-ai-client.system-prompts.v1', JSON.stringify([
      { sys_msg_id: 'first', role: 'system', content: 'First', active: false, folder: 'Research' },
      { sys_msg_id: 'second', role: 'system', content: 'Second', active: true, folder: 'General' },
      { role: 'system', content: 'Invalid' },
    ]));

    const migrated = await repository.load();
    localStorage.setItem('local-ai-client.system-prompts.v1', JSON.stringify([
      { sys_msg_id: 'should-not-return', role: 'system', content: 'No', active: true, folder: 'General' },
    ]));
    const reloaded = await new SystemPromptRepository().load();

    expect(migrated.map((prompt) => [prompt.sys_msg_id, prompt.active, prompt.position])).toEqual([
      [BUILT_IN_SYSTEM_PROMPT_ID, true, 0],
      ['first', false, 1],
      ['second', true, 2],
    ]);
    expect(localStorage.getItem('local-ai-client.system-prompts.v1')).toBeNull();
    expect(reloaded.map((prompt) => prompt.sys_msg_id)).toEqual([
      BUILT_IN_SYSTEM_PROMPT_ID,
      'first',
      'second',
    ]);
  });

  it('falls back to the legacy key when no valid current prompt exists', async () => {
    localStorage.setItem('local-ai-client.system-prompts.v1', '{invalid');
    localStorage.setItem('ollama-chat-system-prompts', JSON.stringify([
      { sys_msg_id: 'legacy', role: 'system', content: 'Legacy prompt', active: true, folder: 'General' },
    ]));

    const prompts = await repository.load();

    expect(prompts.map((prompt) => prompt.sys_msg_id)).toEqual([
      BUILT_IN_SYSTEM_PROMPT_ID,
      'legacy',
    ]);
    expect(localStorage.getItem('ollama-chat-system-prompts')).toBeNull();
  });

  it('preserves a legacy prompt that collides with the built-in ID without replacing the default', async () => {
    localStorage.setItem('ollama-chat-system-prompts', JSON.stringify([
      {
        sys_msg_id: BUILT_IN_SYSTEM_PROMPT_ID,
        role: 'system',
        content: 'Legacy custom prompt',
        active: true,
        folder: 'General',
      },
    ]));

    const prompts = await repository.load();

    expect(prompts[0]).toEqual(jasmine.objectContaining({
      sys_msg_id: BUILT_IN_SYSTEM_PROMPT_ID,
      content: BUILT_IN_SYSTEM_PROMPT.content,
      source: 'built-in',
    }));
    expect(prompts[1]).toEqual(jasmine.objectContaining({
      content: 'Legacy custom prompt',
      source: 'user',
    }));
    expect(prompts[1].sys_msg_id).not.toBe(BUILT_IN_SYSTEM_PROMPT_ID);
  });

  it('protects the canonical built-in content while allowing its active state to change', async () => {
    await repository.load();

    const saved = await repository.save([
      {
        sys_msg_id: BUILT_IN_SYSTEM_PROMPT_ID,
        role: 'system',
        content: 'Overwritten instructions',
        active: false,
        folder: 'Wrong folder',
      },
      { sys_msg_id: 'custom', role: 'system', content: 'Custom prompt', active: true, folder: 'General' },
    ]);

    expect(saved[0]).toEqual(jasmine.objectContaining({
      sys_msg_id: BUILT_IN_SYSTEM_PROMPT_ID,
      content: BUILT_IN_SYSTEM_PROMPT.content,
      folder: '',
      active: false,
      source: 'built-in',
    }));
    expect(saved[1]).toEqual(jasmine.objectContaining({ source: 'user', position: 1 }));
  });

  it('retains the built-in prompt when custom prompts are cleared and restores its canonical active default', async () => {
    await repository.save([
      { sys_msg_id: 'custom', role: 'system', content: 'Custom prompt', active: true, folder: 'General' },
    ]);

    const cleared = await repository.clear();
    const restored = await repository.restoreBuiltInPrompt();

    expect(cleared).toEqual([jasmine.objectContaining({
      sys_msg_id: BUILT_IN_SYSTEM_PROMPT_ID,
      active: true,
    })]);
    expect(restored).toEqual([jasmine.objectContaining({
      sys_msg_id: BUILT_IN_SYSTEM_PROMPT_ID,
      active: true,
      content: BUILT_IN_SYSTEM_PROMPT.content,
    })]);
  });

  it('rejects IndexedDB failures without removing the legacy source', async () => {
    localStorage.setItem('ollama-chat-system-prompts', JSON.stringify([
      { sys_msg_id: 'legacy', role: 'system', content: 'Legacy prompt', active: true, folder: 'General' },
    ]));
    const open = spyOn(indexedDB, 'open').and.throwError('Storage unavailable');

    await expectAsync(repository.load()).toBeRejectedWithError('Storage unavailable');
    expect(localStorage.getItem('ollama-chat-system-prompts')).not.toBeNull();

    open.and.callThrough();
  });
});

function openPromptDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(SYSTEM_PROMPT_DATABASE_NAME);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function deletePromptDatabase(): Promise<void> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.deleteDatabase(SYSTEM_PROMPT_DATABASE_NAME);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
    request.onblocked = () => reject(new Error('System prompt test database is still open.'));
  });
}
