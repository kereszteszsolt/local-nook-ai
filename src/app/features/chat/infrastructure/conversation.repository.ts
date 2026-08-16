/*
 * SPDX-FileCopyrightText: 2026 Keresztes Zsolt <https://kereszteszsolt.hu>
 * SPDX-License-Identifier: Apache-2.0
 */

import { Injectable } from '@angular/core';
import { Message } from '../models/message.model';

export const CONVERSATION_DATABASE_NAME = 'local-ai-client.conversations';
export const CONVERSATION_DATABASE_VERSION = 4;
const CONVERSATIONS_STORE = 'conversations';
const MESSAGES_STORE = 'messages';
const METADATA_STORE = 'metadata';
const ACTIVE_CONVERSATION_KEY = 'active-conversation-id';

export interface ConversationSummary {
  readonly id: string;
  readonly title: string;
  readonly createdAt: number;
  readonly updatedAt: number;
}

export interface StoredConversation extends ConversationSummary {
  readonly modelId?: string;
  readonly thinkingEnabled?: boolean;
  readonly messages: readonly Message[];
}

interface ConversationRecord extends ConversationSummary {
  readonly modelId?: string;
  readonly thinkingEnabled?: boolean;
}

interface MessageRecord extends Message {
  readonly id: string;
  readonly conversationId: string;
  readonly sequence: number;
}

interface MetadataRecord {
  readonly key: string;
  readonly value: string;
}

@Injectable({ providedIn: 'root' })
export class ConversationRepository {
  async create(
    messages: readonly Message[],
    modelId?: string,
    thinkingEnabled = false,
  ): Promise<StoredConversation> {
    const now = Date.now();
    const normalizedModelId = normalizeModelId(modelId);
    const conversation: ConversationRecord = {
      id: crypto.randomUUID(),
      title: titleFromMessages(messages),
      createdAt: now,
      updatedAt: now,
      ...(normalizedModelId ? { modelId: normalizedModelId } : {}),
      thinkingEnabled,
    };
    const persistedMessages = withStableMessageIds(messages);
    const database = await this.openDatabase();

    await completeTransaction(database.transaction(
      [CONVERSATIONS_STORE, MESSAGES_STORE, METADATA_STORE],
      'readwrite',
    ), (stores) => {
      stores[CONVERSATIONS_STORE].add(conversation);
      this.writeMessages(stores[MESSAGES_STORE], conversation.id, persistedMessages);
      stores[METADATA_STORE].put({ key: ACTIVE_CONVERSATION_KEY, value: conversation.id });
    });
    database.close();

    return { ...conversation, messages: persistedMessages };
  }

  async list(): Promise<ConversationSummary[]> {
    const database = await this.openDatabase();
    const transaction = database.transaction(CONVERSATIONS_STORE, 'readonly');
    const records = await requestResult<ConversationRecord[]>(
      transaction.objectStore(CONVERSATIONS_STORE).getAll(),
    );
    await transactionComplete(transaction);
    database.close();

    return records
      .map(({ id, title, createdAt, updatedAt }) => ({ id, title, createdAt, updatedAt }))
      .sort((left, right) => right.updatedAt - left.updatedAt);
  }

  async read(id: string): Promise<StoredConversation | null> {
    const database = await this.openDatabase();
    const transaction = database.transaction([CONVERSATIONS_STORE, MESSAGES_STORE], 'readonly');
    const conversation = await requestResult<ConversationRecord | undefined>(
      transaction.objectStore(CONVERSATIONS_STORE).get(id),
    );
    if (!conversation) {
      await transactionComplete(transaction);
      database.close();
      return null;
    }

    const messages = await requestResult<MessageRecord[]>(
      transaction.objectStore(MESSAGES_STORE).index('by-conversation-id').getAll(id),
    );
    await transactionComplete(transaction);
    database.close();

    return {
      ...conversation,
      messages: messages
        .sort((left, right) => left.sequence - right.sequence)
        .map(toMessage),
    };
  }

  async readActive(): Promise<StoredConversation | null> {
    const database = await this.openDatabase();
    const transaction = database.transaction(METADATA_STORE, 'readonly');
    const activeRecord = await requestResult<MetadataRecord | undefined>(
      transaction.objectStore(METADATA_STORE).get(ACTIVE_CONVERSATION_KEY),
    );
    await transactionComplete(transaction);
    database.close();

    return activeRecord ? this.read(activeRecord.value) : null;
  }

  async update(id: string, messages: readonly Message[]): Promise<StoredConversation | null> {
    const database = await this.openDatabase();
    const existing = await requestResult<ConversationRecord | undefined>(
      database.transaction(CONVERSATIONS_STORE, 'readonly').objectStore(CONVERSATIONS_STORE).get(id),
    );
    if (!existing) {
      database.close();
      return null;
    }

    const updated: ConversationRecord = {
      ...existing,
      title: titleFromMessages(messages),
      updatedAt: Date.now(),
    };
    const persistedMessages = withStableMessageIds(messages);
    await completeTransaction(database.transaction(
      [CONVERSATIONS_STORE, MESSAGES_STORE, METADATA_STORE],
      'readwrite',
    ), (stores) => {
      stores[CONVERSATIONS_STORE].put(updated);
      const messageStore = stores[MESSAGES_STORE];
      this.replaceMessages(messageStore, id, persistedMessages);
      stores[METADATA_STORE].put({ key: ACTIVE_CONVERSATION_KEY, value: id });
    });
    database.close();

    return { ...updated, messages: persistedMessages };
  }

  async updateModel(id: string, modelId: string): Promise<boolean> {
    const normalizedModelId = normalizeModelId(modelId);
    if (!normalizedModelId) {
      return false;
    }

    const database = await this.openDatabase();
    const readTransaction = database.transaction(CONVERSATIONS_STORE, 'readonly');
    const existing = await requestResult<ConversationRecord | undefined>(
      readTransaction.objectStore(CONVERSATIONS_STORE).get(id),
    );
    await transactionComplete(readTransaction);
    if (!existing) {
      database.close();
      return false;
    }

    const updated: ConversationRecord = {
      ...existing,
      modelId: normalizedModelId,
      updatedAt: Date.now(),
    };
    await completeTransaction(database.transaction(CONVERSATIONS_STORE, 'readwrite'), (stores) => {
      stores[CONVERSATIONS_STORE].put(updated);
    });
    database.close();
    return true;
  }

  async updateThinkingEnabled(id: string, thinkingEnabled: boolean): Promise<boolean> {
    const database = await this.openDatabase();
    const readTransaction = database.transaction(CONVERSATIONS_STORE, 'readonly');
    const existing = await requestResult<ConversationRecord | undefined>(
      readTransaction.objectStore(CONVERSATIONS_STORE).get(id),
    );
    await transactionComplete(readTransaction);
    if (!existing) {
      database.close();
      return false;
    }

    const updated: ConversationRecord = {
      ...existing,
      thinkingEnabled,
      updatedAt: Date.now(),
    };
    await completeTransaction(database.transaction(CONVERSATIONS_STORE, 'readwrite'), (stores) => {
      stores[CONVERSATIONS_STORE].put(updated);
    });
    database.close();
    return true;
  }

  async delete(id: string): Promise<void> {
    const database = await this.openDatabase();
    await completeTransaction(database.transaction(
      [CONVERSATIONS_STORE, MESSAGES_STORE, METADATA_STORE],
      'readwrite',
    ), (stores) => {
      stores[CONVERSATIONS_STORE].delete(id);
      const messageStore = stores[MESSAGES_STORE];
      messageStore.index('by-conversation-id').openCursor(IDBKeyRange.only(id)).onsuccess = (event) => {
        const cursor = (event.target as IDBRequest<IDBCursorWithValue | null>).result;
        if (cursor) {
          cursor.delete();
          cursor.continue();
        }
      };
      const activeRequest = stores[METADATA_STORE].get(ACTIVE_CONVERSATION_KEY);
      activeRequest.onsuccess = () => {
        if (activeRequest.result?.value === id) {
          stores[METADATA_STORE].delete(ACTIVE_CONVERSATION_KEY);
        }
      };
    });
    database.close();
  }

  async deleteAll(): Promise<void> {
    const database = await this.openDatabase();
    await completeTransaction(database.transaction(
      [CONVERSATIONS_STORE, MESSAGES_STORE, METADATA_STORE],
      'readwrite',
    ), (stores) => {
      stores[CONVERSATIONS_STORE].clear();
      stores[MESSAGES_STORE].clear();
      stores[METADATA_STORE].delete(ACTIVE_CONVERSATION_KEY);
    });
    database.close();
  }

  async setActive(id: string): Promise<boolean> {
    if (!await this.read(id)) {
      return false;
    }

    const database = await this.openDatabase();
    await completeTransaction(database.transaction(METADATA_STORE, 'readwrite'), (stores) => {
      stores[METADATA_STORE].put({ key: ACTIVE_CONVERSATION_KEY, value: id });
    });
    database.close();
    return true;
  }

  async clearActive(): Promise<void> {
    const database = await this.openDatabase();
    await completeTransaction(database.transaction(METADATA_STORE, 'readwrite'), (stores) => {
      stores[METADATA_STORE].delete(ACTIVE_CONVERSATION_KEY);
    });
    database.close();
  }

  private async openDatabase(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(CONVERSATION_DATABASE_NAME, CONVERSATION_DATABASE_VERSION);
      request.onerror = () => reject(request.error ?? new Error('Could not open conversation storage.'));
      request.onupgradeneeded = (event) => {
        const database = request.result;
        if (!database.objectStoreNames.contains(CONVERSATIONS_STORE)) {
          database.createObjectStore(CONVERSATIONS_STORE, { keyPath: 'id' });
        }
        if (!database.objectStoreNames.contains(MESSAGES_STORE)) {
          const messages = database.createObjectStore(MESSAGES_STORE, { keyPath: 'id' });
          messages.createIndex('by-conversation-id', 'conversationId');
        }
        if (!database.objectStoreNames.contains(METADATA_STORE)) {
          database.createObjectStore(METADATA_STORE, { keyPath: 'key' });
        }
        if ((event as IDBVersionChangeEvent).oldVersion < 2) {
          const conversations = request.transaction?.objectStore(CONVERSATIONS_STORE);
          conversations?.openCursor().addEventListener('success', (event) => {
            const cursor = (event.target as IDBRequest<IDBCursorWithValue | null>).result;
            if (cursor) {
              cursor.update({ ...cursor.value, title: 'Untitled conversation' });
              cursor.continue();
            }
          });
        }
      };
      request.onsuccess = () => resolve(request.result);
    });
  }

  private writeMessages(store: IDBObjectStore, conversationId: string, messages: readonly Message[]): void {
    messages.forEach((message, sequence) => {
      store.put({
        ...message,
        id: message.id ?? crypto.randomUUID(),
        conversationId,
        sequence,
      } satisfies MessageRecord);
    });
  }

  private replaceMessages(
    store: IDBObjectStore,
    conversationId: string,
    messages: readonly Message[],
  ): void {
    const request = store.index('by-conversation-id').openCursor(IDBKeyRange.only(conversationId));
    request.onsuccess = () => {
      const cursor = request.result;
      if (cursor) {
        cursor.delete();
        cursor.continue();
        return;
      }
      this.writeMessages(store, conversationId, messages);
    };
  }
}

function toMessage({ id, conversationId, sequence, ...message }: MessageRecord): Message {
  return { ...message, id };
}

function withStableMessageIds(messages: readonly Message[]): Message[] {
  return messages.map((message) => ({ ...message, id: message.id ?? crypto.randomUUID() }));
}

function titleFromMessages(messages: readonly Message[]): string {
  const firstUserMessage = messages.find(
    (message) => message.role === 'user' && message.content.trim().length > 0,
  );
  return firstUserMessage?.content.trim().slice(0, 80) || 'Untitled conversation';
}

function normalizeModelId(modelId: string | undefined): string | undefined {
  const normalizedModelId = modelId?.trim();
  return normalizedModelId || undefined;
}

function requestResult<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error('IndexedDB request failed.'));
  });
}

function transactionComplete(
  transaction: IDBTransaction,
): Promise<void> {
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
