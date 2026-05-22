import type { Command } from '../../types/command.js'

const fork = {
  type: 'local',
  name: 'fork',
  description: 'Forked subagents are unavailable in this recovered build',
  supportsNonInteractive: false,
  isHidden: true,
  isEnabled: () => false,
  load: async () => ({ call: async () => ({ type: 'skip' }) }),
} satisfies Command

export default fork
