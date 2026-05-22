import type { MCPServerConnection } from '../../services/mcp/types.js'
import type { LoadedPlugin, PluginError } from '../../types/plugin.js'
import type { PersistablePluginScope } from '../../utils/plugins/pluginIdentifier.js'

type ItemScope = PersistablePluginScope | 'flagged' | 'builtin' | 'dynamic'

export type UnifiedInstalledItem =
  | {
      type: 'plugin'
      id: string
      name: string
      description?: string
      marketplace: string
      scope: ItemScope
      pendingToggle?: 'will-enable' | 'will-disable'
      pendingEnable?: boolean
      pendingUpdate?: boolean
      errorCount: number
      errors: PluginError[]
      isEnabled: boolean
      plugin: LoadedPlugin
    }
  | {
      type: 'flagged-plugin'
      id: string
      name: string
      marketplace: string
      scope: 'flagged'
      reason: string
      text: string
      flaggedAt: string
    }
  | {
      type: 'failed-plugin'
      id: string
      name: string
      marketplace: string
      scope: PersistablePluginScope
      errorCount: number
      errors: PluginError[]
    }
  | {
      type: 'mcp'
      id: string
      name: string
      description?: string
      scope: ItemScope
      status: 'connected' | 'disabled' | 'pending' | 'needs-auth' | 'failed'
      client: MCPServerConnection
      indented?: boolean
    }
