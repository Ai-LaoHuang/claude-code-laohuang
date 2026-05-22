import { isAutoMemoryEnabled, getAutoMemPath } from '../../memdir/paths.js'
import { getProjectDir } from '../../utils/sessionStorage.js'
import { getOriginalCwd } from '../../bootstrap/state.js'
import { buildConsolidationPrompt } from '../../services/autoDream/consolidationPrompt.js'
import { recordConsolidation } from '../../services/autoDream/consolidationLock.js'
import { registerBundledSkill } from '../bundledSkills.js'

export function registerDreamSkill(): void {
  registerBundledSkill({
    name: 'dream',
    description:
      'Reflect over recent sessions and consolidate durable memory files. Useful for pruning stale memories, updating MEMORY.md, and turning recent work into long-term context.',
    whenToUse:
      'Use when the user wants to consolidate memory, refresh auto-memory, prune stale entries, or explicitly asks to run /dream.',
    userInvocable: true,
    isEnabled: () => isAutoMemoryEnabled(),
    async getPromptForCommand(args) {
      const memoryRoot = getAutoMemPath()
      const transcriptDir = getProjectDir(getOriginalCwd())
      await recordConsolidation()

      let extra = ''
      if (args.trim()) {
        extra = `\n\nUser emphasis for this dream run:\n${args.trim()}`
      }

      const prompt = buildConsolidationPrompt(memoryRoot, transcriptDir, extra)
      return [{ type: 'text', text: prompt }]
    },
  })
}
