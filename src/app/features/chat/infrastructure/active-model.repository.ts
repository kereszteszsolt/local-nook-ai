/*
 * SPDX-FileCopyrightText: 2026 Keresztes Zsolt <https://kereszteszsolt.hu>
 * SPDX-License-Identifier: Apache-2.0
 */

import { Injectable } from '@angular/core';

export const ACTIVE_MODEL_STORAGE_KEY = 'local-ai-client.active-model.v1';

@Injectable({ providedIn: 'root' })
export class ActiveModelRepository {
  load(): string | null {
    const modelId = localStorage.getItem(ACTIVE_MODEL_STORAGE_KEY)?.trim();
    return modelId || null;
  }

  save(modelId: string): void {
    const normalizedModelId = modelId.trim();
    if (!normalizedModelId) {
      this.clear();
      return;
    }

    localStorage.setItem(ACTIVE_MODEL_STORAGE_KEY, normalizedModelId);
  }

  clear(): void {
    localStorage.removeItem(ACTIVE_MODEL_STORAGE_KEY);
  }
}
