export type CopilotMentionPayload = {
  entityType: 'role' | 'privilege_set' | 'user'
  id: string
  label: string
}

export type ChatHistoryItem =
  | { role: 'user'; content: string; mentions?: CopilotMentionPayload[] }
  | { role: 'assistant'; content: string }
