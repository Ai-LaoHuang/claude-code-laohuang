export type SentinelCategory = 'shell' | 'filesystem' | 'system_settings'

export function getSentinelCategory(_bundleId: string): SentinelCategory | null {
  return null
}

export function getSentinelApps(): string[] {
  return []
}

export const sentinelApps: string[] = []
