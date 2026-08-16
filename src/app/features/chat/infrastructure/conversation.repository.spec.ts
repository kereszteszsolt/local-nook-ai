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
    ]);
    const reloaded = await new ConversationRepository().readActive();

    expect(reloaded).toEqual(created);
    expect(reloaded?.messages.map((message) => message.content)).toEqual([
      'First request',
      'First response',
    ]);
    expect(reloaded?.messages.every((message) => Boolean(message.id))).toBeTrue();
  });

  it('lists, updates, and deletes a conversation without leaving its active reference behind', async () => {
    const created = await repository.create([{ role: 'user', content: 'Keep this ID' }]);
    const updated = await repository.update(created.id, [
      ...created.messages,
      { role: 'assistant', content: 'A completed answer' },
    ]);

    expect((await repository.list()).map((conversation) => conversation.id)).toEqual([created.id]);
    expect(updated?.messages[0].id).toBe(created.messages[0].id);
    expect(updated?.messages).toHaveSize(2);

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
