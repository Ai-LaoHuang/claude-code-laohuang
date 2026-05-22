import { afterEach, beforeEach, describe, expect, test } from 'bun:test'
import * as fs from 'fs/promises'
import * as os from 'os'
import * as path from 'path'

import { handleProvidersApi } from '../api/providers.js'
import { PROVIDER_PRESETS } from '../config/providerPresets.js'
import { buildOpenAIChatCompletionsUrl, buildOpenAIResponsesUrl } from '../proxy/upstreamUrl.js'
import { openaiChatStreamToAnthropic } from '../proxy/streaming/openaiChatStreamToAnthropic.js'
import { anthropicToOpenaiChat } from '../proxy/transform/anthropicToOpenaiChat.js'
import { openaiChatToAnthropic } from '../proxy/transform/openaiChatToAnthropic.js'
import type { AnthropicRequest, OpenAIChatResponse } from '../proxy/transform/types.js'

let tmpDir: string
let originalConfigDir: string | undefined

beforeEach(async () => {
  tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'laohuang-provider-proxy-test-'))
  originalConfigDir = process.env.CLAUDE_CONFIG_DIR
  process.env.CLAUDE_CONFIG_DIR = tmpDir
})

afterEach(async () => {
  if (originalConfigDir !== undefined) {
    process.env.CLAUDE_CONFIG_DIR = originalConfigDir
  } else {
    delete process.env.CLAUDE_CONFIG_DIR
  }
  await fs.rm(tmpDir, { recursive: true, force: true })
})

function makeRequest(
  method: string,
  urlStr: string,
  body?: Record<string, unknown>,
): { req: Request; url: URL; segments: string[] } {
  const url = new URL(urlStr, 'http://localhost:3456')
  const init: RequestInit = { method }
  if (body) {
    init.headers = { 'Content-Type': 'application/json' }
    init.body = JSON.stringify(body)
  }
  const req = new Request(url.toString(), init)
  const segments = url.pathname.split('/').filter(Boolean)
  return { req, url, segments }
}

function makeStream(chunks: string[]): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder()
  return new ReadableStream({
    start(controller) {
      for (const chunk of chunks) {
        controller.enqueue(encoder.encode(chunk))
      }
      controller.close()
    },
  })
}

async function collectSse(stream: ReadableStream<Uint8Array>): Promise<Array<{ event: string; data: Record<string, unknown> }>> {
  const decoder = new TextDecoder()
  const reader = stream.getReader()
  let text = ''
  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    text += decoder.decode(value, { stream: true })
  }

  return text
    .split('\n\n')
    .filter(Boolean)
    .flatMap((block) => {
      const lines = block.split('\n')
      const event = lines.find((line) => line.startsWith('event: '))?.slice(7)
      const data = lines.find((line) => line.startsWith('data: '))?.slice(6)
      if (!event || !data) return []
      try {
        return [{ event, data: JSON.parse(data) as Record<string, unknown> }]
      } catch {
        return []
      }
    })
}

describe('LaoHuang provider presets', () => {
  test('GET /api/providers/presets returns configured presets', async () => {
    const { req, url, segments } = makeRequest('GET', '/api/providers/presets')
    const response = await handleProvidersApi(req, url, segments)

    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({ presets: PROVIDER_PRESETS })
  })

  test('includes LaoHuang OpenAI-compatible preset before custom', () => {
    const openaiCompatible = PROVIDER_PRESETS.find((preset) => preset.id === 'openai-compatible')
    const custom = PROVIDER_PRESETS.find((preset) => preset.id === 'custom')

    expect(PROVIDER_PRESETS.at(-2)?.id).toBe('openai-compatible')
    expect(PROVIDER_PRESETS.at(-1)?.id).toBe('custom')
    expect(openaiCompatible?.apiFormat).toBe('openai_chat')
    expect(openaiCompatible?.baseUrl).toBe('https://api.example.com/v1')
    expect(openaiCompatible?.promoText).toContain('DeepSeek')
    expect(custom?.authStrategy).toBe('auth_token')
  })

  test('keeps current third-party defaults aligned with LaoHuang runtime needs', () => {
    const minimax = PROVIDER_PRESETS.find((preset) => preset.id === 'minimax')
    const deepseek = PROVIDER_PRESETS.find((preset) => preset.id === 'deepseek')
    const lmstudio = PROVIDER_PRESETS.find((preset) => preset.id === 'lmstudio')
    const ollama = PROVIDER_PRESETS.find((preset) => preset.id === 'ollama')

    expect(minimax?.defaultModels.main).toBe('MiniMax-M2.7')
    expect(minimax?.modelContextWindows?.['MiniMax-M2.7']).toBe(204800)
    expect(deepseek?.authStrategy).toBe('auth_token')
    expect(deepseek?.defaultModels.main).toBe('deepseek-v4-pro')
    expect(deepseek?.modelContextWindows?.['deepseek-v4-pro']).toBe(1000000)
    expect(lmstudio?.needsApiKey).toBe(false)
    expect(lmstudio?.authStrategy).toBe('auth_token_empty_api_key')
    expect(ollama?.needsApiKey).toBe(false)
    expect(ollama?.authStrategy).toBe('auth_token_empty_api_key')
  })

  test('GET and PUT provider settings stay isolated under CLAUDE_CONFIG_DIR', async () => {
    const initial = {
      env: {
        ANTHROPIC_MODEL: 'MiniMax-M2.7',
        ANTHROPIC_BASE_URL: 'https://api.minimaxi.com/anthropic',
      },
      model: 'MiniMax-M2.7',
    }
    await fs.mkdir(path.join(tmpDir, 'cc-haha'), { recursive: true })
    await fs.writeFile(
      path.join(tmpDir, 'cc-haha', 'settings.json'),
      JSON.stringify(initial, null, 2),
      'utf-8',
    )

    const getReq = makeRequest('GET', '/api/providers/settings')
    const getRes = await handleProvidersApi(getReq.req, getReq.url, getReq.segments)
    expect(getRes.status).toBe(200)
    expect(await getRes.json()).toEqual(initial)

    const updateBody = {
      model: 'provider-model',
      env: {
        ANTHROPIC_MODEL: 'provider-model',
        ANTHROPIC_BASE_URL: 'https://api.example.com/v1',
      },
    }
    const putReq = makeRequest('PUT', '/api/providers/settings', updateBody)
    const putRes = await handleProvidersApi(putReq.req, putReq.url, putReq.segments)
    expect(putRes.status).toBe(200)

    const updatedRaw = await fs.readFile(path.join(tmpDir, 'cc-haha', 'settings.json'), 'utf-8')
    expect(JSON.parse(updatedRaw)).toEqual(updateBody)
  })
})

describe('LaoHuang OpenAI-compatible proxy transforms', () => {
  test('builds compatible upstream URLs without duplicating /v1', () => {
    expect(buildOpenAIChatCompletionsUrl('https://api.deepseek.com')).toBe(
      'https://api.deepseek.com/chat/completions',
    )
    expect(buildOpenAIChatCompletionsUrl('https://openrouter.ai/api/v1')).toBe(
      'https://openrouter.ai/api/v1/chat/completions',
    )
    expect(buildOpenAIChatCompletionsUrl('https://example.com/v1/chat/completions')).toBe(
      'https://example.com/v1/chat/completions',
    )
    expect(buildOpenAIResponsesUrl('https://api.openai.com/v1')).toBe(
      'https://api.openai.com/v1/responses',
    )
  })

  test('round-trips Anthropic tool use through OpenAI Chat format', () => {
    const req: AnthropicRequest = {
      model: 'provider-model',
      max_tokens: 128,
      messages: [{ role: 'user', content: 'Read package.json' }],
      tools: [
        {
          name: 'Read',
          description: 'Read a file',
          input_schema: {
            type: 'object',
            properties: { file_path: { type: 'string' } },
            required: ['file_path'],
          },
        },
      ],
    }

    const openaiRequest = anthropicToOpenaiChat(req)
    expect(openaiRequest.tools?.[0]?.function.name).toBe('Read')

    const openaiToolResponse: OpenAIChatResponse = {
      id: 'chatcmpl_tool',
      object: 'chat.completion',
      created: 1,
      model: 'provider-model',
      choices: [
        {
          index: 0,
          message: {
            role: 'assistant',
            content: null,
            tool_calls: [
              {
                id: 'call_read_package',
                type: 'function',
                function: { name: 'Read', arguments: '{"file_path":"package.json"}' },
              },
            ],
          },
          finish_reason: 'tool_calls',
        },
      ],
      usage: { prompt_tokens: 10, completion_tokens: 4, total_tokens: 14 },
    }

    const anthropicToolUse = openaiChatToAnthropic(openaiToolResponse, 'provider-model')
    const toolUse = anthropicToolUse.content.find((block) => block.type === 'tool_use')
    expect(toolUse?.type).toBe('tool_use')
    if (toolUse?.type === 'tool_use') {
      expect(toolUse.id).toBe('call_read_package')
      expect(toolUse.name).toBe('Read')
      expect(toolUse.input).toEqual({ file_path: 'package.json' })
    }
  })

  test('streams OpenAI Chat tool calls as Anthropic tool_use events', async () => {
    const sseChunks = [
      'data: {"id":"c1","object":"chat.completion.chunk","created":0,"model":"provider-model","choices":[{"index":0,"delta":{"tool_calls":[{"index":0,"id":"call_stream_read","type":"function","function":{"name":"Read","arguments":"{\\"file_path\\":"}}]},"finish_reason":null}]}\n\n',
      'data: {"id":"c1","object":"chat.completion.chunk","created":0,"model":"provider-model","choices":[{"index":0,"delta":{"tool_calls":[{"index":0,"function":{"arguments":"\\"package.json\\"}"}}]},"finish_reason":null}]}\n\n',
      'data: {"id":"c1","object":"chat.completion.chunk","created":0,"model":"provider-model","choices":[{"index":0,"delta":{},"finish_reason":"tool_calls"}]}\n\n',
      'data: [DONE]\n\n',
    ]

    const events = await collectSse(openaiChatStreamToAnthropic(makeStream(sseChunks), 'provider-model'))
    const toolStart = events.find(
      (event) => event.event === 'content_block_start' &&
        (event.data.content_block as Record<string, unknown>)?.type === 'tool_use',
    )
    const jsonDeltas = events.filter(
      (event) => event.event === 'content_block_delta' &&
        (event.data.delta as Record<string, unknown>)?.type === 'input_json_delta',
    )

    expect(toolStart).toBeDefined()
    expect((toolStart?.data.content_block as Record<string, unknown>).id).toBe('call_stream_read')
    expect(jsonDeltas.length).toBeGreaterThan(0)
    expect(events.some((event) => event.event === 'message_stop')).toBe(true)
  })
})
