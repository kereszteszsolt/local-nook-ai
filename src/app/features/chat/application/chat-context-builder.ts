/*
 * SPDX-FileCopyrightText: 2026 Keresztes Zsolt <https://kereszteszsolt.hu>
 * SPDX-License-Identifier: Apache-2.0
 */

import { Injectable } from '@angular/core';
import { Message, ModelContextMessage, SystemMessage } from '../models/message.model';

@Injectable({ providedIn: 'root' })
export class ChatContextBuilder {
  build(
    systemPrompts: readonly SystemMessage[],
    messages: readonly Message[],
  ): ModelContextMessage[] {
    const activeSystemPrompts = systemPrompts
      .filter((prompt) => prompt.active && prompt.content.trim().length > 0)
      .map(({ role, content }) => ({ role, content }));

    const conversationMessages = messages
      .filter(
        (message) =>
          message.role !== 'system' && message.content.trim().length > 0,
      )
      .map(({ role, content }) => ({ role, content }));

    return [...activeSystemPrompts, ...conversationMessages];
  }
}
