import { getCompanion } from './companion.js'
import { getGlobalConfig } from '../utils/config.js'

type MessageLike = {
  type?: string
  message?: {
    content?: unknown
  }
  content?: unknown
}

function extractText(content: unknown): string {
  if (typeof content === 'string') return content
  if (Array.isArray(content)) {
    return content
      .map(part => {
        if (typeof part === 'string') return part
        if (part && typeof part === 'object' && 'text' in part) {
          const text = (part as { text?: unknown }).text
          return typeof text === 'string' ? text : ''
        }
        return ''
      })
      .filter(Boolean)
      .join(' ')
  }
  return ''
}

function getLatestTranscriptText(messages: readonly MessageLike[]): string {
  for (let i = messages.length - 1; i >= 0; i--) {
    const msg = messages[i]
    if (!msg) continue
    const text = extractText(msg.message?.content ?? msg.content)
    if (text) return text
  }
  return ''
}

function normalize(text: string): string {
  return text.trim().toLowerCase()
}

function includesAny(text: string, needles: readonly string[]): boolean {
  return needles.some(needle => text.includes(needle))
}

export async function fireCompanionObserver(
  messages: readonly MessageLike[],
  onReaction: (reaction: string) => void,
): Promise<void> {
  const companion = getCompanion()
  if (!companion || getGlobalConfig().companionMuted) return

  const text = normalize(getLatestTranscriptText(messages))
  if (!text) return
  if (text.startsWith('/buddy')) return

  const name = companion.name.toLowerCase()

  if (text.includes(name)) {
    if (text.includes('?')) {
      onReaction(`${companion.name} tilts their head like they totally understand.`)
      return
    }
    onReaction(`${companion.name} perks up at the sound of their name.`)
    return
  }

  if (includesAny(text, ['thanks', 'thank you', 'nice', 'good job', 'great', 'love', '太棒', '厉害'])) {
    onReaction(`${companion.name} looks delighted.`)
    return
  }

  if (includesAny(text, ['bug', 'error', 'stuck', 'broken', 'fail', 'wtf', '烦', '卡住', '报错'])) {
    onReaction(`${companion.name} scoots closer with emotional support energy.`)
    return
  }

  if (includesAny(text, ['done', 'fixed', 'solved', 'ship it', '搞定', '修好了'])) {
    onReaction(`${companion.name} does a tiny victory lap.`)
    return
  }

  if (includesAny(text, ['sleep', 'late', 'tired', '累', '困'])) {
    onReaction(`${companion.name} votes for one more stretch break.`)
  }
}
