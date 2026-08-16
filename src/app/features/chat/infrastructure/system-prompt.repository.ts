/*
 * SPDX-FileCopyrightText: 2026 Keresztes Zsolt <https://kereszteszsolt.hu>
 * SPDX-License-Identifier: Apache-2.0
 */

import { Injectable } from '@angular/core';
import { SystemMessage } from '../models/message.model';

const STORAGE_KEY = 'local-ai-client.system-prompts.v1';
const LEGACY_STORAGE_KEY = 'ollama-chat-system-prompts';

@Injectable({ providedIn: 'root' })
export class SystemPromptRepository {
  load(): SystemMessage[] {
    const currentValue = localStorage.getItem(STORAGE_KEY);
    if (currentValue !== null) {
      return this.parse(currentValue);
    }

    const legacyValue = localStorage.getItem(LEGACY_STORAGE_KEY);
    if (legacyValue === null) {
      return [];
    }

    const prompts = this.parse(legacyValue);
    if (prompts.length > 0) {
      this.save(prompts);
    }
    return prompts;
  }

  save(prompts: readonly SystemMessage[]): void {
    const serializablePrompts = prompts.map(({ sys_msg_id, role, content, active, folder }) => ({
      sys_msg_id,
      role,
      content,
      active,
      folder,
    }));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(serializablePrompts));
  }

  clear(): void {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(LEGACY_STORAGE_KEY);
  }

  private parse(value: string): SystemMessage[] {
    try {
      const parsed: unknown = JSON.parse(value);
      if (!Array.isArray(parsed)) {
        return [];
      }
      return parsed.filter(isSystemMessage);
    } catch {
      return [];
    }
  }
}

function isSystemMessage(value: unknown): value is SystemMessage {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as Partial<SystemMessage>;
  return (
    typeof candidate.sys_msg_id === 'string' &&
    candidate.role === 'system' &&
    typeof candidate.content === 'string' &&
    typeof candidate.active === 'boolean' &&
    typeof candidate.folder === 'string'
  );
}
