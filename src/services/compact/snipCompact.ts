import type { Message } from '../../types/message.js'

export function isSnipMarkerMessage(_message: Message): boolean {
  return false
}

export function snipCompactIfNeeded(..._args: any[]): any {
  return { ok: false, messages: [], committed: false }
}
export function isSnipRuntimeEnabled(..._args: any[]): boolean {
  return false
}
export function shouldNudgeForSnips(..._args: any[]): boolean {
  return false
}
export const SNIP_NUDGE_TEXT = ''
