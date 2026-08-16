/*
 * SPDX-FileCopyrightText: 2026 Keresztes Zsolt <https://kereszteszsolt.hu>
 * SPDX-License-Identifier: Apache-2.0
 */

import { ChatContextBuilder } from './chat-context-builder';
import { Message, SystemMessage } from '../models/message.model';

describe('ChatContextBuilder', () => {
  const builder = new ChatContextBuilder();

  it('prepends active system prompts and sends only role/content fields', () => {
    const prompts: SystemMessage[] = [
      { sys_msg_id: 'active', role: 'system', content: 'Be concise.', active: true, folder: 'General' },
      { sys_msg_id: 'inactive', role: 'system', content: 'Ignore me.', active: false, folder: 'General' },
    ];
    const messages: Message[] = [
      { role: 'user', content: 'Hello', req_id: 'request-1', think: true },
      { role: 'assistant', content: 'Hi', ref_id: 'request-1', total_duration: 42 },
      { role: 'system', content: 'Do not duplicate me.' },
    ];

    expect(builder.build(prompts, messages)).toEqual([
      { role: 'system', content: 'Be concise.' },
      { role: 'user', content: 'Hello' },
      { role: 'assistant', content: 'Hi' },
    ]);
  });

  it('omits empty prompts and messages', () => {
    expect(builder.build(
      [{ sys_msg_id: 'empty', role: 'system', content: '  ', active: true, folder: 'General' }],
      [{ role: 'user', content: '  ', req_id: 'request-1' }],
    )).toEqual([]);
  });
});
