import { feature } from 'bun:bundle'
import type { Command } from '../../commands.js'

function isEnabled(): boolean {
  return feature('BRIDGE_MODE') ? true : false
}

const bridge = {
  type: 'local-jsx',
  name: 'remote-control',
  aliases: ['rc'],
  description: 'Connect this terminal for remote-control sessions',
  argumentHint: '[name]',
  isEnabled,
  immediate: true,
  load: () => import('./bridge.js'),
} satisfies Command

export default bridge
