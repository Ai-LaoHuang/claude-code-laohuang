import type { Message } from '../../types/message.js'
import type { CompactionResult } from './compact.js'

export function isReactiveOnlyMode(): boolean {
  return false
}

export function isReactiveCompactEnabled(): boolean {
  return false
}

export function isWithheldPromptTooLong(_error: unknown): boolean {
  return false
}

export function isWithheldMediaSizeError(_error: unknown): boolean {
  return false
}

export async function tryReactiveCompact(..._args: any[]): Promise<any> {
  return { ok: false, messages: [], committed: false }
}

export async function reactiveCompactOnPromptTooLong(
  _messages: Message[],
  _cacheSafeParams: unknown,
  _options: unknown,
): Promise<
  | {
      ok: true
      result: CompactionResult
    }
  | {
      ok: false
      reason: 'too_few_groups' | 'aborted' | 'exhausted' | 'error' | 'media_unstrippable'
    }
> {
  return {
    ok: false,
    reason: 'error',
  }
}
