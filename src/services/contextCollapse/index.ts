import type { Message } from '../../types/message.js'

export function initContextCollapse(..._args: any[]): void {}
export function resetContextCollapse(..._args: any[]): void {}
export function isContextCollapseEnabled(): boolean {
  return false
}

export function getStats() {
  return {
    collapsedSpans: 0,
    collapsedMessages: 0,
    stagedSpans: 0,
    health: {
      totalSpawns: 0,
      totalErrors: 0,
      totalEmptySpawns: 0,
      lastError: undefined as string | undefined,
      emptySpawnWarningEmitted: false,
    },
  }
}

export function subscribe(_callback: () => void): () => void {
  return () => {}
}

export async function applyCollapsesIfNeeded(messages: Message[], ..._args: any[]) {
  return { messages, didCollapse: false }
}

export function isWithheldPromptTooLong(..._args: any[]): boolean {
  return false
}

export function recoverFromOverflow(messages: Message[], ..._args: any[]) {
  return { ok: false as const, messages, committed: 0 }
}
