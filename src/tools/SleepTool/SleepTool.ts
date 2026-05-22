import { createElement } from 'react'
import { Text } from '../../ink.js'
import { buildTool, type ToolDef } from '../../Tool.js'
import { formatDuration } from '../../utils/format.js'
import { lazySchema } from '../../utils/lazySchema.js'
import { jsonStringify } from '../../utils/slowOperations.js'
import {
  isProactiveActive,
  resolveSleepDurationMs,
} from '../../proactive/index.js'
import { DESCRIPTION, SLEEP_TOOL_NAME, SLEEP_TOOL_PROMPT } from './prompt.js'
import { z } from 'zod/v4'

const inputSchema = lazySchema(() =>
  z.strictObject({
    duration_ms: z
      .number()
      .int()
      .nonnegative()
      .optional()
      .describe(
        'How long to sleep in milliseconds. Omit to use the configured minimum sleep duration.',
      ),
    duration_seconds: z
      .number()
      .nonnegative()
      .optional()
      .describe('Optional alias for duration_ms expressed in seconds.'),
    reason: z
      .string()
      .optional()
      .describe('Short reason for sleeping, such as waiting for a build or review.'),
  }),
)
type InputSchema = ReturnType<typeof inputSchema>

const outputSchema = lazySchema(() =>
  z.object({
    slept_ms: z.number().int().nonnegative(),
    interrupted: z.boolean(),
    message: z.string(),
  }),
)
type OutputSchema = ReturnType<typeof outputSchema>

type Output = z.infer<OutputSchema>

function durationFromInput(input: z.infer<InputSchema>): number {
  if (typeof input.duration_ms === 'number') {
    return input.duration_ms
  }
  if (typeof input.duration_seconds === 'number') {
    return input.duration_seconds * 1000
  }
  return resolveSleepDurationMs(null)
}

function waitForDuration(ms: number, signal: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      signal.removeEventListener('abort', onAbort)
      resolve()
    }, ms)

    const onAbort = () => {
      clearTimeout(timer)
      signal.removeEventListener('abort', onAbort)
      const error = new Error('Sleep interrupted')
      error.name = 'AbortError'
      reject(error)
    }

    if (signal.aborted) {
      onAbort()
      return
    }

    signal.addEventListener('abort', onAbort)
  })
}

export const SleepTool = buildTool({
  name: SLEEP_TOOL_NAME,
  searchHint: 'pause autonomous work until later',
  maxResultSizeChars: 50_000,
  get inputSchema(): InputSchema {
    return inputSchema()
  },
  get outputSchema(): OutputSchema {
    return outputSchema()
  },
  isEnabled() {
    return isProactiveActive()
  },
  isConcurrencySafe() {
    return true
  },
  isReadOnly() {
    return true
  },
  toAutoClassifierInput(input) {
    return input.reason
      ? `${durationFromInput(input)}ms: ${input.reason}`
      : `${durationFromInput(input)}ms`
  },
  async description() {
    return DESCRIPTION
  },
  async prompt() {
    return SLEEP_TOOL_PROMPT
  },
  mapToolResultToToolResultBlockParam(output, toolUseID) {
    return {
      tool_use_id: toolUseID,
      type: 'tool_result',
      content: jsonStringify(output),
    }
  },
  renderToolUseMessage(input) {
    return createElement(
      Text,
      { dimColor: true },
      `Sleep ${formatDuration(resolveSleepDurationMs(durationFromInput(input as z.infer<InputSchema>)))}`,
    )
  },
  renderToolResultMessage(output) {
    return createElement(
      Text,
      { dimColor: true },
      output.interrupted
        ? `Sleep interrupted after ${formatDuration(output.slept_ms)}`
        : `Slept for ${formatDuration(output.slept_ms)}`,
    )
  },
  async call(input, context) {
    const targetMs = resolveSleepDurationMs(durationFromInput(input))
    const startedAt = Date.now()

    try {
      await waitForDuration(targetMs, context.abortController.signal)
      return {
        data: {
          slept_ms: Date.now() - startedAt,
          interrupted: false,
          message: `Slept for ${formatDuration(targetMs)}.`,
        },
      }
    } catch (error) {
      if ((error as Error).name !== 'AbortError') {
        throw error
      }
      const sleptMs = Date.now() - startedAt
      return {
        data: {
          slept_ms: sleptMs,
          interrupted: true,
          message: `Sleep interrupted after ${formatDuration(sleptMs)}.`,
        },
      }
    }
  },
} satisfies ToolDef<InputSchema, Output>)
