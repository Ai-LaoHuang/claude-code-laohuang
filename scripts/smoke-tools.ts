process.env.ANTHROPIC_API_KEY ||= 'dummy'
process.env.CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC ||= '1'
process.env.USE_BUILTIN_RIPGREP ||= '0'

const { enableConfigs } = await import('../src/utils/config.ts')
enableConfigs()

const { getAllBaseTools } = await import('../src/tools.ts')
const { toolToAPISchema } = await import('../src/utils/api.ts')
const { createFileStateCacheWithSizeLimit } = await import(
  '../src/utils/fileStateCache.ts'
)

const permissionContext = {
  mode: 'default',
  additionalWorkingDirectories: new Map(),
  alwaysAllowRules: {},
  alwaysDenyRules: {},
  alwaysAskRules: {},
  isBypassPermissionsModeAvailable: false,
} as const

const tools = getAllBaseTools()

for (const tool of tools) {
  const schema = (await toolToAPISchema(tool, {
    getToolPermissionContext: async () => permissionContext,
    tools,
    agents: [],
    allowedAgentTypes: [],
  })) as {
    name?: string
    description?: string
    input_schema?: unknown
  } | null

  if (!schema?.name || !schema.description || !schema.input_schema) {
    throw new Error(`Invalid API schema for tool: ${tool.name}`)
  }
}

const appState = { toolPermissionContext: permissionContext }
const toolContext = {
  abortController: new AbortController(),
  getAppState: () => appState,
  readFileState: createFileStateCacheWithSizeLimit(20),
  nestedMemoryAttachmentTriggers: new Set<string>(),
  dynamicSkillDirTriggers: new Set<string>(),
  globLimits: { maxResults: 5 },
}

const readTool = tools.find(tool => tool.name === 'Read')
const globTool = tools.find(tool => tool.name === 'Glob')
const grepTool = tools.find(tool => tool.name === 'Grep')

if (!readTool || !globTool || !grepTool) {
  throw new Error('Expected Read, Glob, and Grep tools to be registered')
}

const callTool = (tool: typeof readTool, input: Record<string, unknown>) =>
  tool.call(input, toolContext as never, undefined, undefined)

const readResult = (await callTool(readTool, {
  file_path: 'package.json',
  offset: 1,
  limit: 5,
})) as {
  data: {
    type: string
    file: { filePath: string }
  }
}
if (readResult.data.type !== 'text') {
  throw new Error(`Read smoke test returned ${readResult.data.type}`)
}

const globResult = (await callTool(globTool, {
  pattern: 'src/tools/*Tool/*Tool.ts*',
})) as {
  data: { filenames: string[] }
}
if (globResult.data.filenames.length === 0) {
  throw new Error('Glob smoke test returned no files')
}

const grepResult = (await callTool(grepTool, {
  pattern: 'export const .*Tool',
  path: 'src/tools',
  glob: '*.ts',
  output_mode: 'files_with_matches',
  head_limit: 5,
})) as {
  data: { filenames: string[] }
}
if (grepResult.data.filenames.length === 0) {
  throw new Error('Grep smoke test returned no files')
}

console.log(`tools=${tools.length}`)
console.log(`schemas=ok`)
console.log(`read=${readResult.data.file.filePath}`)
console.log(`glob=${globResult.data.filenames.length}`)
console.log(`grep=${grepResult.data.filenames.length}`)

export {}
