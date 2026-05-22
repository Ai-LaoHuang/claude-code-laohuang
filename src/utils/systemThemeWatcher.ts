import type { ThemeName } from './theme.js'

export function watchSystemTheme(
  _querier: unknown,
  _setSystemTheme: (theme: ThemeName) => void,
): () => void {
  return () => {}
}
