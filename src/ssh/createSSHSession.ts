export type SSHSession = any

export class SSHSessionError extends Error {}

export async function createSSHSession(..._args: any[]): Promise<SSHSession> {
  return null
}

export async function createLocalSSHSession(..._args: any[]): Promise<SSHSession> {
  return null
}
