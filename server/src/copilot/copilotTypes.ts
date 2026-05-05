export type CopilotSseType =
  | 'assistant_token'
  | 'agent_thinking'
  | 'tool_call_start'
  | 'tool_call_end'
  | 'tool_call_error'
  | 'confirmation_required'
  | 'assistant_message_complete'
  | 'done'
  | 'error'

export type CopilotSseEvent = { type: CopilotSseType; payload?: unknown }

export type CopilotMention = {
  entityType: 'role' | 'privilege_set' | 'user'
  id: string
  label: string
}

export type ChatHistoryItem =
  | { role: 'user'; content: string; mentions?: CopilotMention[] }
  | { role: 'assistant'; content: string }

export type CopilotChatBody = {
  conversation_id: string
  message: string
  mentions?: CopilotMention[]
  history: ChatHistoryItem[]
}

export type CopilotConfirmBody = {
  conversation_id: string
  tool_call_id: string
  confirmed: boolean
}
