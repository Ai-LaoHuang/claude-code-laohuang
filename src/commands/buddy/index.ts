import type { Command } from '../../commands.js'

const buddy = {
  type: 'local',
  name: 'buddy',
  description: 'Hatch, pet, and manage your companion',
  supportsNonInteractive: true,
  immediate: true,
  argumentHint: '[pet|info|mute|unmute|rename <name>]',
  load: () => import('./buddy.js'),
} satisfies Command

export default buddy
