/*
 * SPDX-FileCopyrightText: 2026 Keresztes Zsolt <https://kereszteszsolt.hu>
 * SPDX-License-Identifier: Apache-2.0
 */

import { Injectable } from '@angular/core';
import { SystemMessage } from '../models/message.model';

export const SYSTEM_PROMPT_DATABASE_NAME = 'local-ai-client.system-prompts';
export const SYSTEM_PROMPT_DATABASE_VERSION = 1;
export const BUILT_IN_SYSTEM_PROMPT_ID = 'localnook.rich-response-formats.v1';

const PROMPTS_STORE = 'prompts';
const METADATA_STORE = 'metadata';
const MIGRATION_COMPLETE_KEY = 'local-storage-migration-complete';
const STORAGE_KEY = 'local-ai-client.system-prompts.v1';
const LEGACY_STORAGE_KEY = 'ollama-chat-system-prompts';

export const BUILT_IN_SYSTEM_PROMPT: SystemMessage = {
  sys_msg_id: BUILT_IN_SYSTEM_PROMPT_ID,
  role: 'system',
  active: true,
  folder: '',
  source: 'built-in',
  position: 0,
  content: `You are responding in LocalNook. Use standard Markdown. These renderers are available:

- Math: \`$...$\` or \`$$...$$\` for KaTeX.
- Code: \`\`\`language\` followed by code, then \`\`\`.
- Diagrams: \`\`\`mermaid\` followed by valid Mermaid, then \`\`\`. Use only for flow, sequence, state, class, or relationship diagrams; never for charts or function plots.
- Charts: \`\`\`vega-lite\` followed by one valid JSON object, then \`\`\`. Use for function and data plots when useful or requested.

For a Vega-Lite function plot, start with \`"$schema":"https://vega.github.io/schema/vega-lite/v5.json"\`. Always include \`"data":{"values":[...]}\`, \`"mark":"line"\`, and \`"encoding":{"x":{"field":"x","type":"quantitative"},"y":{"field":"y","type":"quantitative"}}\`. \`encoding\` is required. Calculate values from the requested formula; for equations, include every real root in the x range. Never use a \`json\` fence, nested fences, \`transform\`, \`calc\`, \`calculate\`, URLs, expressions, or JavaScript. Put rich blocks only in the final answer, never in thinking.`,
};

interface StoredSystemPrompt extends SystemMessage {
  readonly source: 'built-in' | 'user';
  readonly position: number;
}

interface MetadataRecord {
  readonly key: string;
  readonly value: string;
}

@Injectable({ providedIn: 'root' })
export class SystemPromptRepository {
  async load(): Promise<SystemMessage[]> {
    const database = await this.openDatabase();
    try {
      const migrated = await this.hasCompletedMigration(database);
      if (!migrated) {
        const legacyPrompts = this.readLegacyPrompts();
        await this.seedAndMigrate(database, legacyPrompts);
        this.removeLegacyStorage();
      } else {
        await this.ensureBuiltInPrompt(database);
      }
      return await this.readPrompts(database);
    } finally {
      database.close();
    }
  }

  async save(prompts: readonly SystemMessage[]): Promise<SystemMessage[]> {
    const database = await this.openDatabase();
    try {
      const builtInActive = prompts.find(
        (prompt) => prompt.sys_msg_id === BUILT_IN_SYSTEM_PROMPT_ID,
      )?.active;
      const customPrompts = prompts.filter(
        (prompt) => prompt.sys_msg_id !== BUILT_IN_SYSTEM_PROMPT_ID,
      );
      const records = [
        canonicalBuiltIn(builtInActive),
        ...customPrompts
          .filter(isSystemMessage)
          .map((prompt, index) => toStoredPrompt(prompt, index + 1)),
      ];

      await completeTransaction(database.transaction([PROMPTS_STORE, METADATA_STORE], 'readwrite'), (stores) => {
        stores[PROMPTS_STORE].clear();
        records.forEach((record) => stores[PROMPTS_STORE].put(record));
        stores[METADATA_STORE].put({ key: MIGRATION_COMPLETE_KEY, value: 'true' });
      });

      return records;
    } finally {
      database.close();
    }
  }

  async restoreBuiltInPrompt(): Promise<SystemMessage[]> {
    const prompts = await this.load();
    return this.save([
      canonicalBuiltIn(true),
      ...prompts.filter((prompt) => prompt.sys_msg_id !== BUILT_IN_SYSTEM_PROMPT_ID),
    ]);
  }

  async clear(): Promise<SystemMessage[]> {
    await this.load();
    return this.save([]);
  }

  private async hasCompletedMigration(database: IDBDatabase): Promise<boolean> {
    const transaction = database.transaction(METADATA_STORE, 'readonly');
    const metadata = await requestResult<MetadataRecord | undefined>(
      transaction.objectStore(METADATA_STORE).get(MIGRATION_COMPLETE_KEY),
    );
    await transactionComplete(transaction);
    return metadata?.value === 'true';
  }

  private async seedAndMigrate(database: IDBDatabase, legacyPrompts: SystemMessage[]): Promise<void> {
    const records = [
      canonicalBuiltIn(true),
      ...toUniqueStoredPrompts(legacyPrompts),
    ];
    await completeTransaction(database.transaction([PROMPTS_STORE, METADATA_STORE], 'readwrite'), (stores) => {
      records.forEach((record) => stores[PROMPTS_STORE].put(record));
      stores[METADATA_STORE].put({ key: MIGRATION_COMPLETE_KEY, value: 'true' });
    });
  }

  private async ensureBuiltInPrompt(database: IDBDatabase): Promise<void> {
    const transaction = database.transaction(PROMPTS_STORE, 'readwrite');
    const store = transaction.objectStore(PROMPTS_STORE);
    const request = store.get(BUILT_IN_SYSTEM_PROMPT_ID);
    request.onsuccess = () => {
      const builtIn = request.result as StoredSystemPrompt | undefined;
      if (!builtIn) {
        store.put(canonicalBuiltIn(true));
      } else if (!isCanonicalBuiltIn(builtIn)) {
        store.put(canonicalBuiltIn(builtIn.active));
      }
    };
    await transactionComplete(transaction);
  }

  private async readPrompts(database: IDBDatabase): Promise<SystemMessage[]> {
    const transaction = database.transaction(PROMPTS_STORE, 'readonly');
    const records = await requestResult<StoredSystemPrompt[]>(transaction.objectStore(PROMPTS_STORE).getAll());
    await transactionComplete(transaction);
    return records
      .filter(isStoredSystemPrompt)
      .sort((left, right) => left.position - right.position || left.sys_msg_id.localeCompare(right.sys_msg_id));
  }

  private readLegacyPrompts(): SystemMessage[] {
    const currentValue = localStorage.getItem(STORAGE_KEY);
    const currentPrompts = currentValue === null ? [] : parsePrompts(currentValue);
    if (currentPrompts.length > 0) {
      return currentPrompts;
    }

    const legacyValue = localStorage.getItem(LEGACY_STORAGE_KEY);
    return legacyValue === null ? [] : parsePrompts(legacyValue);
  }

  private removeLegacyStorage(): void {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(LEGACY_STORAGE_KEY);
  }

  private async openDatabase(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(SYSTEM_PROMPT_DATABASE_NAME, SYSTEM_PROMPT_DATABASE_VERSION);
      request.onerror = () => reject(request.error ?? new Error('Could not open system prompt storage.'));
      request.onupgradeneeded = () => {
        const database = request.result;
        if (!database.objectStoreNames.contains(PROMPTS_STORE)) {
          database.createObjectStore(PROMPTS_STORE, { keyPath: 'sys_msg_id' });
        }
        if (!database.objectStoreNames.contains(METADATA_STORE)) {
          database.createObjectStore(METADATA_STORE, { keyPath: 'key' });
        }
      };
      request.onsuccess = () => resolve(request.result);
    });
  }
}

function canonicalBuiltIn(active: boolean | undefined): StoredSystemPrompt {
  return { ...BUILT_IN_SYSTEM_PROMPT, active: active ?? true, source: 'built-in', position: 0 };
}

function toStoredPrompt(prompt: SystemMessage, position: number): StoredSystemPrompt {
  return {
    sys_msg_id: prompt.sys_msg_id,
    role: 'system',
    content: prompt.content,
    active: prompt.active,
    folder: prompt.folder,
    source: 'user',
    position,
  };
}

function toUniqueStoredPrompts(prompts: readonly SystemMessage[]): StoredSystemPrompt[] {
  const usedIds = new Set([BUILT_IN_SYSTEM_PROMPT_ID]);
  return prompts.map((prompt, index) => {
    let id = prompt.sys_msg_id;
    while (usedIds.has(id)) {
      id = crypto.randomUUID();
    }
    usedIds.add(id);
    return toStoredPrompt({ ...prompt, sys_msg_id: id }, index + 1);
  });
}

function parsePrompts(value: string): SystemMessage[] {
  try {
    const parsed: unknown = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter(isSystemMessage) : [];
  } catch {
    return [];
  }
}

function isSystemMessage(value: unknown): value is SystemMessage {
  if (!value || typeof value !== 'object') {
    return false;
  }
  const candidate = value as Partial<SystemMessage>;
  return (
    typeof candidate.sys_msg_id === 'string' &&
    candidate.sys_msg_id.length > 0 &&
    candidate.role === 'system' &&
    typeof candidate.content === 'string' &&
    typeof candidate.active === 'boolean' &&
    typeof candidate.folder === 'string'
  );
}

function isStoredSystemPrompt(value: unknown): value is StoredSystemPrompt {
  return isSystemMessage(value) &&
    (value.source === 'built-in' || value.source === 'user') &&
    typeof value.position === 'number';
}

function isCanonicalBuiltIn(prompt: StoredSystemPrompt): boolean {
  return prompt.source === 'built-in' &&
    prompt.position === 0 &&
    prompt.content === BUILT_IN_SYSTEM_PROMPT.content &&
    prompt.folder === '';
}

function requestResult<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error('IndexedDB request failed.'));
  });
}

function transactionComplete(transaction: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error ?? new Error('IndexedDB transaction failed.'));
    transaction.onabort = () => reject(transaction.error ?? new Error('IndexedDB transaction was aborted.'));
  });
}

function completeTransaction(
  transaction: IDBTransaction,
  operation: (stores: Record<string, IDBObjectStore>) => void,
): Promise<void> {
  const stores = Object.fromEntries(
    Array.from(transaction.objectStoreNames).map((name) => [name, transaction.objectStore(name)]),
  ) as Record<string, IDBObjectStore>;
  operation(stores);
  return transactionComplete(transaction);
}
