function withoutTrailingSlash(value: string): string {
  return value.replace(/\/+$/, '')
}

function parseUrl(value: string): URL | null {
  try {
    return new URL(value)
  } catch {
    return null
  }
}

function isDeepSeekOrigin(url: URL): boolean {
  return url.hostname === 'api.deepseek.com'
}

function appendOpenAIEndpoint(baseUrl: string, endpoint: 'chat/completions' | 'responses'): string {
  const base = withoutTrailingSlash(baseUrl)
  if (base.toLowerCase().endsWith(`/${endpoint}`)) {
    return base
  }

  const parsed = parseUrl(base)
  if (!parsed) {
    return `${base}/v1/${endpoint}`
  }

  const path = withoutTrailingSlash(parsed.pathname)
  if (!path || path === '/') {
    const prefix = isDeepSeekOrigin(parsed) ? '' : '/v1'
    return `${parsed.origin}${prefix}/${endpoint}`
  }

  if (path.toLowerCase().endsWith('/v1')) {
    return `${base}/${endpoint}`
  }

  return `${base}/${endpoint}`
}

export function buildOpenAIChatCompletionsUrl(baseUrl: string): string {
  return appendOpenAIEndpoint(baseUrl, 'chat/completions')
}

export function buildOpenAIResponsesUrl(baseUrl: string): string {
  return appendOpenAIEndpoint(baseUrl, 'responses')
}
