export type AssistantSession = {
  id: string
  name?: string
  path?: string
  updatedAt?: string
}

export async function discoverAssistantSessions(..._args: any[]): Promise<AssistantSession[]> {
  return []
}
