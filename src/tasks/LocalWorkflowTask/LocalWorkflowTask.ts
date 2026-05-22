export type LocalWorkflowTaskState = any

export function killWorkflowTask(_id: string, _setAppState?: unknown): void {}
export function skipWorkflowAgent(_id: string, _agentId?: string, _setAppState?: unknown): void {}
export function retryWorkflowAgent(_id: string, _agentId?: string, _setAppState?: unknown): void {}
