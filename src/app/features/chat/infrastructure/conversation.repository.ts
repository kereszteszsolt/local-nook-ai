/*
 * SPDX-FileCopyrightText: 2026 Keresztes Zsolt <https://kereszteszsolt.hu>
 * SPDX-License-Identifier: Apache-2.0
 */

import { Injectable } from '@angular/core';
import { Message } from '../models/message.model';

export const CONVERSATION_DATABASE_NAME = 'local-ai-client.conversations';
export const CONVERSATION_DATABASE_VERSION = 1;
const CONVERSATIONS_STORE = 'conversations';
const MESSAGES_STORE = 'messages';
const METADATA_STORE = 'metadata';
const ACTIVE_CONVERSATION_KEY = 'active-conversation-id';

export interface ConversationSummary {
  readonly id: string;
  readonly createdAt: number;
  readonly updatedAt: number;
}

export interface StoredConversation extends ConversationSummary {
  readonly messages: readonly Message[];
}

interface ConversationRecord extends ConversationSummary {}

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
  async create(messages: readonly Message[]): Promise<StoredConversation> {
    const now = Date.now();
    const conversation: ConversationRecord = {
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
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
      .map(({ id, createdAt, updatedAt }) => ({ id, createdAt, updatedAt }))
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

    const updated: ConversationRecord = { ...existing, updatedAt: Date.now() };
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
      request.onupgradeneeded = () => {
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
