/*
 * SPDX-FileCopyrightText: 2026 Keresztes Zsolt <https://kereszteszsolt.hu>
 * SPDX-License-Identifier: Apache-2.0
 */

import { ACTIVE_MODEL_STORAGE_KEY, ActiveModelRepository } from './active-model.repository';

describe('ActiveModelRepository', () => {
  const repository = new ActiveModelRepository();

  beforeEach(() => localStorage.clear());
  afterEach(() => localStorage.clear());

  it('persists the canonical model identifier', () => {
    repository.save('qwen3:8b');

    expect(repository.load()).toBe('qwen3:8b');
  });

  it('ignores blank model identifiers and clears the selection', () => {
    localStorage.setItem(ACTIVE_MODEL_STORAGE_KEY, '  ');

    expect(repository.load()).toBeNull();

    repository.save('');

    expect(localStorage.getItem(ACTIVE_MODEL_STORAGE_KEY)).toBeNull();
  });
});
