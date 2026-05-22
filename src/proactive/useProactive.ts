import { useEffect } from 'react'
import { TICK_TAG } from '../constants/xml.js'
import {
  getMinSleepDurationMs,
  isContextBlocked,
  isProactiveActive,
  isProactivePaused,
  setNextTickAt,
} from './index.js'

type UseProactiveOptions = {
  isLoading: boolean
  queuedCommandsLength: number
  hasActiveLocalJsxUI: boolean
  isInPlanMode: boolean
  onSubmitTick(prompt: string): void
  onQueueTick(prompt: string): void
}

function buildTickPrompt(): string {
  return `<${TICK_TAG}>${new Date().toLocaleTimeString()}</${TICK_TAG}>`
}

export function useProactive({
  isLoading,
  queuedCommandsLength,
  hasActiveLocalJsxUI,
  isInPlanMode,
  onSubmitTick,
  onQueueTick,
}: UseProactiveOptions): void {
  useEffect(() => {
    if (
      !isProactiveActive() ||
      isProactivePaused() ||
      isContextBlocked() ||
      isLoading ||
      queuedCommandsLength > 0 ||
      hasActiveLocalJsxUI ||
      isInPlanMode
    ) {
      setNextTickAt(null)
      return
    }

    const delayMs = getMinSleepDurationMs()
    const dueAt = Date.now() + delayMs
    setNextTickAt(dueAt)

    const timer = setTimeout(() => {
      setNextTickAt(null)
      if (
        !isProactiveActive() ||
        isProactivePaused() ||
        isContextBlocked()
      ) {
        return
      }
      const tick = buildTickPrompt()
      if (queuedCommandsLength > 0 || isLoading) {
        onQueueTick(tick)
        return
      }
      onSubmitTick(tick)
    }, delayMs)

    return () => {
      clearTimeout(timer)
      setNextTickAt(null)
    }
  }, [
    hasActiveLocalJsxUI,
    isInPlanMode,
    isLoading,
    onQueueTick,
    onSubmitTick,
    queuedCommandsLength,
  ])
}

