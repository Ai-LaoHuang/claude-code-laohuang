import { anthropicToOpenaiChat } from '../src/desktop-server/proxy/transform/anthropicToOpenaiChat.ts'
import { openaiChatToAnthropic } from '../src/desktop-server/proxy/transform/openaiChatToAnthropic.ts'
import { openaiChatStreamToAnthropic } from '../src/desktop-server/proxy/streaming/openaiChatStreamToAnthropic.ts'
import {
  buildOpenAIChatCompletionsUrl,
  buildOpenAIResponsesUrl,
} from '../src/desktop-server/proxy/upstreamUrl.ts'
import { ProviderService } from '../src/desktop-server/services/providerService.ts'
import type {
  AnthropicRequest,
  OpenAIChatResponse,
} from '../src/desktop-server/proxy/transform/types.ts'
import type { ApiFormat } from '../src/desktop-server/types/provider.ts'

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message)
}

async function readStream(stream: ReadableStream<Uint8Array>): Promise<string> {
  const reader = stream.getReader()
  const decoder = new TextDecoder()
  let output = ''
  while (true) {
    const { value, done } = await reader.read()
    if (done) break
    output += decoder.decode(value, { stream: true })
  }
  output += decoder.decode()
  return output
}

async function runStaticProxySmoke(): Promise<void> {
  assert(
    buildOpenAIChatCompletionsUrl('https://api.deepseek.com') ===
      'https://api.deepseek.com/chat/completions',
    'DeepSeek OpenAI Chat URL should not add /v1',
  )
  assert(
    buildOpenAIChatCompletionsUrl('https://openrouter.ai/api/v1') ===
      'https://openrouter.ai/api/v1/chat/completions',
    'OpenAI-compatible /v1 Chat URL should append /chat/completions',
  )
  assert(
    buildOpenAIResponsesUrl('https://api.openai.com/v1') ===
      'https://api.openai.com/v1/responses',
    'OpenAI Responses URL should preserve /v1 base',
  )

  const firstAnthropicRequest: AnthropicRequest = {
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

  const openaiRequest = anthropicToOpenaiChat(firstAnthropicRequest)
  assert(openaiRequest.tools?.[0]?.function.name === 'Read', 'Anthropic tool should become OpenAI function tool')

  const toolResponse: OpenAIChatResponse = {
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
              function: {
                name: 'Read',
                arguments: '{"file_path":"package.json"}',
              },
            },
          ],
        },
        finish_reason: 'tool_calls',
      },
    ],
    usage: { prompt_tokens: 10, completion_tokens: 4, total_tokens: 14 },
  }

  const anthropicToolUse = openaiChatToAnthropic(toolResponse, 'provider-model')
  const toolUse = anthropicToolUse.content.find((block) => block.type === 'tool_use')
  assert(toolUse?.type === 'tool_use', 'OpenAI tool call should become Anthropic tool_use')
  assert(toolUse.id === 'call_read_package', 'Tool call id should be preserved')

  const secondAnthropicRequest: AnthropicRequest = {
    model: 'provider-model',
    max_tokens: 128,
    messages: [
      firstAnthropicRequest.messages[0]!,
      { role: 'assistant', content: [toolUse] },
      {
        role: 'user',
        content: [
          {
            type: 'tool_result',
            tool_use_id: 'call_read_package',
            content: '{"name":"claude-code-laohuang"}',
          },
        ],
      },
    ],
  }

  const secondOpenaiRequest = anthropicToOpenaiChat(secondAnthropicRequest)
  assert(
    secondOpenaiRequest.messages.some(
      (message) => message.role === 'tool' && message.tool_call_id === 'call_read_package',
    ),
    'Anthropic tool_result should become OpenAI tool message with matching id',
  )

  const finalResponse: OpenAIChatResponse = {
    id: 'chatcmpl_final',
    object: 'chat.completion',
    created: 2,
    model: 'provider-model',
    choices: [
      {
        index: 0,
        message: { role: 'assistant', content: 'claude-code-laohuang' },
        finish_reason: 'stop',
      },
    ],
    usage: { prompt_tokens: 20, completion_tokens: 3, total_tokens: 23 },
  }
  const finalAnthropic = openaiChatToAnthropic(finalResponse, 'provider-model')
  assert(finalAnthropic.content[0]?.type === 'text', 'Final response should become Anthropic text')
  assert(finalAnthropic.stop_reason === 'end_turn', 'Final response should stop with end_turn')

  const encoder = new TextEncoder()
  const upstream = new ReadableStream<Uint8Array>({
    start(controller) {
      const events = [
        {
          id: 'chatcmpl_stream_tool',
          object: 'chat.completion.chunk',
          created: 3,
          model: 'provider-model',
          choices: [
            {
              index: 0,
              delta: {
                tool_calls: [
                  {
                    index: 0,
                    id: 'call_stream_read',
                    type: 'function',
                    function: { name: 'Read', arguments: '{"file_path":' },
                  },
                ],
              },
              finish_reason: null,
            },
          ],
        },
        {
          id: 'chatcmpl_stream_tool',
          object: 'chat.completion.chunk',
          created: 3,
          model: 'provider-model',
          choices: [
            {
              index: 0,
              delta: {
                tool_calls: [
                  {
                    index: 0,
                    function: { arguments: '"package.json"}' },
                  },
                ],
              },
              finish_reason: null,
            },
          ],
        },
        {
          id: 'chatcmpl_stream_tool',
          object: 'chat.completion.chunk',
          created: 3,
          model: 'provider-model',
          choices: [{ index: 0, delta: {}, finish_reason: 'tool_calls' }],
          usage: { prompt_tokens: 10, completion_tokens: 4, total_tokens: 14 },
        },
      ]
      for (const event of events) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`))
      }
      controller.enqueue(encoder.encode('data: [DONE]\n\n'))
      controller.close()
    },
  })
  const anthropicStream = await readStream(openaiChatStreamToAnthropic(upstream, 'provider-model'))
  assert(anthropicStream.includes('"type":"tool_use"'), 'Stream should contain tool_use block')
  assert(anthropicStream.includes('call_stream_read'), 'Stream should preserve tool id')
  assert(anthropicStream.includes('input_json_delta'), 'Stream should contain JSON argument deltas')
  assert(anthropicStream.includes('message_stop'), 'Stream should end with message_stop')
}

async function runOptionalLiveSmoke(): Promise<void> {
  const baseUrl = process.env.PROVIDER_BASE_URL
  const apiKey = process.env.PROVIDER_API_KEY
  const modelId = process.env.PROVIDER_MODEL
  const apiFormat = (process.env.PROVIDER_API_FORMAT || 'openai_chat') as ApiFormat

  if (!baseUrl || !apiKey || !modelId) {
    console.log('live=skipped')
    return
  }

  const result = await new ProviderService().testProviderConfig({
    baseUrl,
    apiKey,
    modelId,
    apiFormat,
  })

  assert(result.connectivity.success, `Live connectivity failed: ${result.connectivity.error}`)
  if (result.proxy) {
    assert(result.proxy.success, `Live proxy pipeline failed: ${result.proxy.error}`)
  }
  console.log(`live=ok model=${result.proxy?.modelUsed || result.connectivity.modelUsed || modelId}`)
}

await runStaticProxySmoke()
console.log('static=ok')
console.log('stream=ok')
await runOptionalLiveSmoke()

export {}
