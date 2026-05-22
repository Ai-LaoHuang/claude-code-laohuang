import type { Command } from '../../types/command.js'

const peers = {
  type: 'local',
  name: 'peers',
  description: 'Peer inbox is unavailable in this recovered build',
  supportsNonInteractive: false,
  isHidden: true,
  isEnabled: () => false,
  load: async () => ({ call: async () => ({ type: 'skip' }) }),
} satisfies Command

export default peers
