import { getGlobalConfig } from '../utils/config.js'

type Listener = () => void

const listeners = new Set<Listener>()

const DEFAULT_SLEEP_DURATION_MS = 15_000
const DEFAULT_MAX_SLEEP_DURATION_MS = 5 * 60_000

let proactiveActive = false
let proactivePaused = false
let proactiveContextBlocked = false
let nextTickAt: number | null = null

function emit(): void {
  for (const listener of listeners) {
    try {
      listener()
    } catch {
      // Ignore listener failures so one bad subscriber does not break
      // proactive state updates for the rest of the app.
    }
  }
}

export function subscribeToProactiveChanges(listener: Listener): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export function isProactiveActive(): boolean {
  return proactiveActive
}

export function activateProactive(_source: 'command' | 'flag' | 'env' = 'command'): void {
  proactiveActive = true
  proactivePaused = false
  proactiveContextBlocked = false
  emit()
}

export function deactivateProactive(): void {
  proactiveActive = false
  proactivePaused = false
  proactiveContextBlocked = false
  nextTickAt = null
  emit()
}

export function isProactivePaused(): boolean {
  return proactivePaused
}

export function pauseProactive(): void {
  proactivePaused = true
  nextTickAt = null
  emit()
}

export function resumeProactive(): void {
  proactivePaused = false
  emit()
}

export function setContextBlocked(blocked: boolean): void {
  proactiveContextBlocked = blocked
  if (blocked) {
    nextTickAt = null
  }
  emit()
}

export function isContextBlocked(): boolean {
  return proactiveContextBlocked
}

export function setNextTickAt(value: number | null): void {
  nextTickAt = value
  emit()
}

export function getNextTickAt(): number | null {
  return nextTickAt
}

export function getMinSleepDurationMs(): number {
  return Math.max(1_000, getGlobalConfig().minSleepDurationMs ?? DEFAULT_SLEEP_DURATION_MS)
}

export function getMaxSleepDurationMs(): number {
  return getGlobalConfig().maxSleepDurationMs ?? DEFAULT_MAX_SLEEP_DURATION_MS
}

export function resolveSleepDurationMs(requestedMs?: number | null): number {
  const min = getMinSleepDurationMs()
  const max = getMaxSleepDurationMs()
  const requested = requestedMs == null ? min : Math.max(0, Math.round(requestedMs))

  if (max === -1) {
    return Math.max(min, requested)
  }

  return Math.min(Math.max(min, requested), Math.max(min, max))
}

