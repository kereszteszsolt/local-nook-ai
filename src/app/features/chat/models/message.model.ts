export type ChatRole = 'system' | 'user' | 'assistant';

export interface ModelContextMessage {
  role: ChatRole;
  content: string;
}

export interface ReqMessage extends ModelContextMessage {
  thinking?: string;
  think?: boolean;
}

export interface Message extends ReqMessage {
  id?: string;
  req_id?: string;
  ref_id?: string;
  total_duration?: number;
}

export interface SystemMessage extends ModelContextMessage {
  sys_msg_id: string;
  role: 'system';
  active: boolean;
  folder: string;
  /** Browser-local persistence metadata; never included in an Ollama request. */
  source?: 'built-in' | 'user';
  /** Explicit model-context order for browser-local persistence. */
  position?: number;
}
