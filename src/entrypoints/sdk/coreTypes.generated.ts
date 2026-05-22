// Local recovery stub for missing generated SDK types.
// The leaked source tree does not include this codegen artifact.

export type ModelUsage = {
  inputTokens: number
  outputTokens: number
  cacheReadInputTokens: number
  cacheCreationInputTokens: number
  webSearchRequests: number
  costUSD: number
  contextWindow: number
  maxOutputTokens: number
}

export type HookEvent =
  | 'PreToolUse'
  | 'PostToolUse'
  | 'PostToolUseFailure'
  | 'Notification'
  | 'UserPromptSubmit'
  | 'SessionStart'
  | 'SessionEnd'
  | 'Stop'
  | 'StopFailure'
  | 'SubagentStart'
  | 'SubagentStop'
  | 'PreCompact'
  | 'PostCompact'
  | 'PermissionRequest'
  | 'PermissionDenied'
  | 'Setup'
  | 'TeammateIdle'
  | 'TaskCreated'
  | 'TaskCompleted'
  | 'Elicitation'
  | 'ElicitationResult'
  | 'ConfigChange'
  | 'WorktreeCreate'
  | 'WorktreeRemove'
  | 'InstructionsLoaded'
  | 'CwdChanged'
  | 'FileChanged'

export type SDKStatus = 'compacting' | null
export type ModelInfo = any
export type PermissionResult = any
export type PermissionUpdate = any
export type HookInput = any
export type HookJSONOutput = any
export type AsyncHookJSONOutput = any
export type SyncHookJSONOutput = any
export type McpServerConfigForProcessTransport = any
export type McpServerStatus = any
export type RewindFilesResult = any
export type SDKUserMessageReplay = any
export type SDKAssistantMessage = any
export type SDKAssistantMessageError = any
export type SDKUserMessage = any
export type SDKResultSuccess = any
export type SDKResultMessage = any
export type SDKSystemMessage = any
export type SDKPartialAssistantMessage = any
export type SDKCompactBoundaryMessage = any
export type SDKStatusMessage = any
export type SDKAPIRetryMessage = any
export type SDKLocalCommandOutputMessage = any
export type SDKMessage = any
export type SDKSessionInfo = any
export type ExitReason = 'clear' | 'resume' | 'logout' | 'prompt_input_exit' | 'other' | 'bypass_permissions_disabled'
export type PermissionMode = string
export type ConfigScope = 'local' | 'user' | 'project'
export type ApiKeySource = string
export type OutputFormat = Record<string, unknown>
export type ThinkingConfig = Record<string, unknown>
