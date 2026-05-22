import { spawnSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { join } from 'node:path'

type Check = {
  title: string
  command: string[]
  cwd?: string
}

const root = process.cwd()
const full = process.argv.includes('--full')

function runCheck(check: Check) {
  const cwd = check.cwd ?? root
  const label = check.command.join(' ')
  console.log(`\n[quality:laohuang] ${check.title}`)
  console.log(`$ ${label}`)

  const result = spawnSync(check.command[0], check.command.slice(1), {
    cwd,
    env: process.env,
    stdio: 'inherit',
  })

  if (result.status !== 0) {
    throw new Error(`${check.title} failed with exit code ${result.status ?? 'unknown'}`)
  }
}

const desktopDir = join(root, 'desktop')
const checks: Check[] = [
  {
    title: 'LaoHuang runtime/provider smoke',
    command: ['bun', 'run', 'smoke:laohuang-runtime'],
  },
  {
    title: 'Provider proxy transform smoke',
    command: ['bun', 'run', 'smoke:provider-proxy'],
  },
  {
    title: 'Core tool registry smoke',
    command: ['bun', 'run', 'smoke:tools'],
  },
  {
    title: 'Desktop server provider/proxy tests',
    command: ['bun', 'run', 'test:desktop-server'],
  },
  {
    title: 'Desktop TypeScript check',
    command: ['bun', 'run', 'lint'],
    cwd: desktopDir,
  },
  {
    title: 'ChatInput regression tests',
    command: ['bun', 'run', 'test', '--', '--run', 'src/components/chat/ChatInput.test.tsx'],
    cwd: desktopDir,
  },
]

if (full) {
  checks.push({
    title: 'Desktop production build',
    command: ['bun', 'run', 'build'],
    cwd: desktopDir,
  })
}

if (!existsSync(join(root, 'package.json')) || !existsSync(join(desktopDir, 'package.json'))) {
  throw new Error('Run this command from the LaoHuang project root')
}

for (const check of checks) {
  runCheck(check)
}

console.log('\n[quality:laohuang] ok')
