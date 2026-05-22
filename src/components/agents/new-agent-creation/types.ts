import type { AgentMemoryScope } from '../../../tools/AgentTool/agentMemory.js'
import type { AgentDefinition } from '../../../tools/AgentTool/loadAgentsDir.js'
import type { SettingSource } from '../../../utils/settings/constants.js'

export type AgentWizardData = {
  location?: SettingSource
  creationMethod?: 'manual' | 'generate'
  generationPrompt?: string
  generatedAgent?: Partial<AgentDefinition>
  isGenerating?: boolean
  wasGenerated?: boolean
  agentType?: string
  systemPrompt?: string
  whenToUse?: string
  selectedTools?: string[]
  selectedModel?: string
  selectedColor?: string
  memory?: AgentMemoryScope
  finalAgent?: AgentDefinition & {
    getSystemPrompt: () => string
    source: SettingSource
  }
}
