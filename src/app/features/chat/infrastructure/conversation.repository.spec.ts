/*
 * SPDX-FileCopyrightText: 2026 Keresztes Zsolt <https://kereszteszsolt.hu>
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  CONVERSATION_DATABASE_NAME,
  CONVERSATION_DATABASE_VERSION,
  ConversationRepository,
} from './conversation.repository';

describe('ConversationRepository', () => {
  let repository: ConversationRepository;

  beforeEach(async () => {
    await deleteConversationDatabase();
    repository = new ConversationRepository();
  });

  afterEach(async () => {
    await deleteConversationDatabase();
  });

  it('persists ordered messages with stable IDs and restores the active conversation', async () => {
    const created = await repository.create([
      { role: 'user', content: 'First request', req_id: 'request-1' },
      { role: 'assistant', content: 'First response', ref_id: 'request-1' },
    ], 'qwen3:8b');
    const reloaded = await new ConversationRepository().readActive();

    expect(reloaded).toEqual(created);
    expect(reloaded?.messages.map((message) => message.content)).toEqual([
      'First request',
      'First response',
    ]);
    expect(reloaded?.messages.every((message) => Boolean(message.id))).toBeTrue();
    expect(reloaded?.modelId).toBe('qwen3:8b');
  });

  it('lists, updates, and deletes a conversation without leaving its active reference behind', async () => {
    const created = await repository.create([{ role: 'user', content: 'Keep this ID' }], 'qwen3:8b');
    const updated = await repository.update(created.id, [
      ...created.messages,
      { role: 'assistant', content: 'A completed answer' },
    ]);

    expect((await repository.list()).map((conversation) => conversation.id)).toEqual([created.id]);
    expect(updated?.messages[0].id).toBe(created.messages[0].id);
    expect(updated?.messages).toHaveSize(2);
    expect(updated?.modelId).toBe('qwen3:8b');

    await repository.delete(created.id);

    await expectAsync(repository.read(created.id)).toBeResolvedTo(null);
    await expectAsync(repository.readActive()).toBeResolvedTo(null);
  });

  it('creates the explicit versioned schema through IndexedDB upgrade handling', async () => {
    await repository.list();
    const database = await openConversationDatabase();

    expect(database.version).toBe(CONVERSATION_DATABASE_VERSION);
    expect(Array.from(database.objectStoreNames)).toEqual([
      'conversations',
      'messages',
      'metadata',
    ]);
    database.close();
  });

  it('upgrades version-one conversations with a usable fallback title', async () => {
    await createVersionOneDatabase();

    const conversations = await repository.list();

    expect(conversations).toEqual([{
      id: 'legacy-conversation',
      title: 'Untitled conversation',
      createdAt: 1,
      updatedAt: 2,
    }]);
  });

  it('keeps version-two conversations without model metadata readable', async () => {
    await createVersionTwoDatabase();

    const conversation = await repository.read('version-two-conversation');

    expect(conversation?.modelId).toBeUndefined();
    expect(conversation?.messages.map((message) => message.content)).toEqual(['Legacy conversation']);
  });

  it('updates conversation model metadata without changing ordered messages', async () => {
    const created = await repository.create([
      { role: 'user', content: 'Keep this message' },
      { role: 'assistant', content: 'Keep this response' },
    ], 'qwen3:8b');

    const updated = await repository.updateModel(created.id, 'llama3.1:8b');
    const reloaded = await repository.read(created.id);

    expect(updated).toBeTrue();
    expect(reloaded?.modelId).toBe('llama3.1:8b');
    expect(reloaded?.messages).toEqual(created.messages);
  });

  it('deletes all conversations and clears the active reference', async () => {
    await repository.create([{ role: 'user', content: 'First conversation' }]);
    await repository.create([{ role: 'user', content: 'Second conversation' }]);

    await repository.deleteAll();

    await expectAsync(repository.list()).toBeResolvedTo([]);
    await expectAsync(repository.readActive()).toBeResolvedTo(null);
  });

  it('rejects storage failures instead of silently discarding a write', async () => {
    const open = spyOn(indexedDB, 'open').and.throwError('Storage unavailable');

    await expectAsync(repository.create([{ role: 'user', content: 'Hello' }])).toBeRejectedWithError(
      'Storage unavailable',
    );

    open.and.callThrough();
  });
});

function openConversationDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(CONVERSATION_DATABASE_NAME);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function deleteConversationDatabase(): Promise<void> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.deleteDatabase(CONVERSATION_DATABASE_NAME);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
    request.onblocked = () => reject(new Error('Conversation test database is still open.'));
  });
}

function createVersionOneDatabase(): Promise<void> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(CONVERSATION_DATABASE_NAME, 1);
    request.onupgradeneeded = () => {
      const database = request.result;
      database.createObjectStore('conversations', { keyPath: 'id' });
      const messages = database.createObjectStore('messages', { keyPath: 'id' });
      messages.createIndex('by-conversation-id', 'conversationId');
      database.createObjectStore('metadata', { keyPath: 'key' });
      request.transaction?.objectStore('conversations').add({
        id: 'legacy-conversation',
        createdAt: 1,
        updatedAt: 2,
      });
    };
    request.onsuccess = () => {
      request.result.close();
      resolve();
    };
    request.onerror = () => reject(request.error);
  });
}

function createVersionTwoDatabase(): Promise<void> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(CONVERSATION_DATABASE_NAME, 2);
    request.onupgradeneeded = () => {
      const database = request.result;
      database.createObjectStore('conversations', { keyPath: 'id' });
      const messages = database.createObjectStore('messages', { keyPath: 'id' });
      messages.createIndex('by-conversation-id', 'conversationId');
      database.createObjectStore('metadata', { keyPath: 'key' });
      request.transaction?.objectStore('conversations').add({
        id: 'version-two-conversation',
        title: 'Version two conversation',
        createdAt: 1,
        updatedAt: 2,
      });
      request.transaction?.objectStore('messages').add({
        id: 'version-two-message',
        conversationId: 'version-two-conversation',
        sequence: 0,
        role: 'user',
        content: 'Legacy conversation',
      });
    };
    request.onsuccess = () => {
      request.result.close();
      resolve();
    };
    request.onerror = () => reject(request.error);
  });
}
