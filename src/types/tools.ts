export type ShellProgress = {
  type?: string
  output: string
  fullOutput: string
  elapsedTimeSeconds?: number
  totalLines?: number
  totalBytes?: number
  timeoutMs?: number
  taskId?: string
}

export type PowerShellProgress = ShellProgress
export type AgentToolProgress = any
export type BashProgress = any
export type MCPProgress = any
export type REPLToolProgress = any
export type SkillToolProgress = any
export type TaskOutputProgress = any
export type ToolProgressData = any
export type WebSearchProgress = any
export type SdkWorkflowProgress = any
