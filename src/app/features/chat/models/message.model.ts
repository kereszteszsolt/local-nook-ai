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
}
