export class DefaultAzureCredential {
  constructor(..._args: any[]) {}
}

export function getBearerTokenProvider(..._args: any[]): () => Promise<string> {
  return async () => ''
}
