// @generated stub from scan-missing-imports
// 该文件自动生成，对应 ant-internal 的 feature() gated 模块。
// 所有外部 build 的代码路径在 DCE 后都不会真的执行这里的代码，这只是
// bun build resolver 的占位符。
const __target = function noop() {}
const __handler: ProxyHandler<any> = {
  get(_t, prop) {
    if (prop === '__esModule') return true
    if (prop === 'default') return new Proxy(__target, __handler)
    if (prop === Symbol.toPrimitive) return () => undefined
    if (prop === Symbol.iterator) return function* () {}
    if (prop === Symbol.asyncIterator) return async function* () {}
    if (prop === 'then') return undefined
    return new Proxy(__target, __handler)
  },
  apply() {
    return new Proxy(__target, __handler)
  },
  construct() {
    return new Proxy(__target, __handler)
  },
}
const stub: any = new Proxy(__target, __handler)
export default stub
export const __stubMissing = true
// 兼容常见的命名导出 —— 没列在这里的也会通过 default Proxy 兜底
export const createCachedMCState = stub
export const isCachedMicrocompactEnabled = stub
export const isModelSupportedForCacheEditing = stub
export const getCachedMCConfig = stub
export const markToolsSentToAPI = stub
export const resetCachedMCState = stub
export const checkProtectedNamespace = stub
export const getCoordinatorUserContext = stub

export type ComputerExecutor = any
export type DisplayGeometry = any
export type FrontmostApp = any
export type InstalledApp = any
export type ResolvePrepareCaptureResult = any
export type RunningApp = any
export type ScreenshotResult = any
export type ComputerUseSessionContext = any
export type CuCallToolResult = any
export type CuPermissionRequest = any
export type CuPermissionResponse = any
export type ScreenshotDims = any

export const API_RESIZE_PARAMS = stub
export const DEFAULT_GRANT_FLAGS = {
  clipboardRead: true,
  clipboardWrite: true,
  systemKeyCombos: true,
}
export const bindSessionContext = stub
export const buildComputerUseTools = stub
export const createComputerUseMcpServer = stub
export function targetImageSize(width: number, height: number, _params?: unknown): [number, number] {
  return [width, height]
}
