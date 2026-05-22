import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { spawnSync } from 'node:child_process'

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(message)
  }
}

function readJson<T>(path: string): T {
  return JSON.parse(readFileSync(path, 'utf8')) as T
}

function run(command: string, args: string[]) {
  const result = spawnSync(command, args, {
    cwd: process.cwd(),
    encoding: 'utf8',
  })
  if (result.status !== 0) {
    throw new Error(
      [
        `Command failed: ${command} ${args.join(' ')}`,
        result.stdout.trim(),
        result.stderr.trim(),
      ].filter(Boolean).join('\n'),
    )
  }
}

type ProviderIndex = {
  activeId: string | null
  providers: Array<{
    id: string
    name: string
    baseUrl: string
    models: { main: string }
  }>
}

const root = process.cwd()
const buildScriptPath = join(root, 'script', 'build_and_run.sh')
const configDir = process.env.CLAUDE_CONFIG_DIR || join(root, '.desktop-gpt55-claude')
const providersPath = join(configDir, 'cc-haha', 'providers.json')
const settingsPath = join(configDir, 'cc-haha', 'settings.json')

assert(existsSync(buildScriptPath), `Missing build script: ${buildScriptPath}`)
run('bash', ['-n', buildScriptPath])

const buildScript = readFileSync(buildScriptPath, 'utf8')
assert(
  buildScript.includes('USE_CODEX_BRIDGE="${USE_CODEX_BRIDGE:-0}"'),
  'build_and_run.sh must default USE_CODEX_BRIDGE to 0',
)
assert(
  buildScript.includes('preserving existing provider config'),
  'build_and_run.sh should preserve provider config unless USE_CODEX_BRIDGE=1',
)
assert(
  buildScript.includes('if [[ "${USE_CODEX_BRIDGE}" == "1" ]]'),
  'build_and_run.sh should only inject bridge provider env when USE_CODEX_BRIDGE=1',
)

assert(existsSync(providersPath), `Missing provider index: ${providersPath}`)
assert(existsSync(settingsPath), `Missing provider settings: ${settingsPath}`)

const providers = readJson<ProviderIndex>(providersPath)
const activeProvider = providers.providers.find((provider) => provider.id === providers.activeId)
assert(activeProvider, 'Provider index must have an active provider')

const usesLocalBridge =
  activeProvider.baseUrl.includes('127.0.0.1:8644') ||
  activeProvider.baseUrl.includes('localhost:8644')

if (process.env.USE_CODEX_BRIDGE !== '1') {
  assert(
    !usesLocalBridge,
    `Active provider points at the local Codex bridge while USE_CODEX_BRIDGE is not enabled: ${activeProvider.baseUrl}`,
  )
}

const settings = readJson<{ env?: Record<string, string> }>(settingsPath)
const env = settings.env ?? {}
assert(env.ANTHROPIC_MODEL === activeProvider.models.main, 'settings.json ANTHROPIC_MODEL must match active provider main model')
assert(env.ANTHROPIC_BASE_URL === activeProvider.baseUrl, 'settings.json ANTHROPIC_BASE_URL must match active provider baseUrl')

console.log('laohuang-runtime=ok')
console.log(`provider=${activeProvider.name}`)
console.log(`model=${activeProvider.models.main}`)
console.log(`baseUrl=${activeProvider.baseUrl}`)

