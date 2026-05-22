import type { Command } from '../../types/command.js'

const workflows = {
  type: 'local',
  name: 'workflows',
  description: 'Workflow scripts are unavailable in this recovered build',
  supportsNonInteractive: false,
  isHidden: true,
  isEnabled: () => false,
  load: async () => ({ call: async () => ({ type: 'skip' }) }),
} satisfies Command

export default workflows
