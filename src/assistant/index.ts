export function isAssistantMode(): boolean {
  return process.env.CLAUDE_CODE_ASSISTANT_MODE === '1'
}

export async function initializeAssistantTeam(..._args: any[]): Promise<any> {
  return null
}

export function markAssistantForced(): void {}

export function isAssistantForced(): boolean {
  return false
}

export function getAssistantSystemPromptAddendum(): string | null {
  return null
}

export function getAssistantActivationPath(): string | null {
  return null
}
