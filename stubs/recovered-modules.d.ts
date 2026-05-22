declare module 'vscode-languageserver-protocol' {
  export type InitializeParams = any
  export type InitializeResult = any
  export type ServerCapabilities = any
  export type PublishDiagnosticsParams = any
}

declare module 'cli-highlight' {
  export const highlight: any
  export const supportsLanguage: any
}

declare module 'highlight.js' {
  export const getLanguage: any
  const value: any
  export default value
}

declare module '@ant/computer-use-mcp' {
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
  export const API_RESIZE_PARAMS: any
  export const DEFAULT_GRANT_FLAGS: any
  export const targetImageSize: any
  export const buildComputerUseTools: any
  export const bindSessionContext: any
  export const createComputerUseMcpServer: any
  export const createComputerUseMcpServerForCli: any
}

declare module 'audio-capture-napi' {
  export const isNativeAudioAvailable: any
  export const isNativeRecordingActive: any
  export const stopNativeRecording: any
  export const startNativeRecording: any
  const value: any
  export default value
}

declare module '*.md' {
  const content: string
  export default content
}

declare module '@ant/computer-use-mcp/types' {
  export type CoordinateMode = any
  export type CuSubGates = any
  export type ComputerUseHostAdapter = any
  export type Logger = any
  export type CuPermissionRequest = any
  export type CuPermissionResponse = any
  export const DEFAULT_GRANT_FLAGS: any
}

declare module '@ant/computer-use-input' {
  export type ComputerUseInput = any
  export type ComputerUseInputAPI = any
  const value: any
  export default value
}

declare module '@ant/computer-use-swift' {
  export type ComputerUseAPI = any
  const value: any
  export default value
}

declare module '@anthropic-ai/mcpb' {
  export type McpbManifest = any
  export type McpbUserConfigurationOption = any
  export const McpbManifestSchema: any
  export const extractMcpb: any
  export const parseMcpbManifest: any
  export const getMcpConfigForManifest: any
}

declare module 'fflate' {
  export const unzipSync: any
  export const zipSync: any
  export const strFromU8: any
  export const strToU8: any
}

declare module 'url-handler-napi' {
  export const registerUrlHandler: any
  export const unregisterUrlHandler: any
  export const waitForUrlEvent: any
  const value: any
  export default value
}

declare module '@opentelemetry/exporter-metrics-otlp-grpc' { export const OTLPMetricExporter: any; const value: any; export default value }
declare module '@opentelemetry/exporter-metrics-otlp-http' { export const OTLPMetricExporter: any; const value: any; export default value }
declare module '@opentelemetry/exporter-metrics-otlp-proto' { export const OTLPMetricExporter: any; const value: any; export default value }
declare module '@opentelemetry/exporter-prometheus' { export const PrometheusExporter: any; const value: any; export default value }
declare module '@opentelemetry/exporter-logs-otlp-grpc' { export const OTLPLogExporter: any; const value: any; export default value }
declare module '@opentelemetry/exporter-logs-otlp-http' { export const OTLPLogExporter: any; const value: any; export default value }
declare module '@opentelemetry/exporter-logs-otlp-proto' { export const OTLPLogExporter: any; const value: any; export default value }
declare module '@opentelemetry/exporter-trace-otlp-grpc' { export const OTLPTraceExporter: any; const value: any; export default value }
declare module '@opentelemetry/exporter-trace-otlp-http' { export const OTLPTraceExporter: any; export const OTLPLogExporter: any; const value: any; export default value }
declare module '@opentelemetry/exporter-trace-otlp-proto' { export const OTLPTraceExporter: any; const value: any; export default value }

declare module '@aws-sdk/client-bedrock' {
  export const BedrockClient: any
  export const ListFoundationModelsCommand: any
  export const GetFoundationModelCommand: any
  export const ListInferenceProfilesCommand: any
  export const GetInferenceProfileCommand: any
}
