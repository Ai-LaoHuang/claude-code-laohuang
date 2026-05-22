// Local recovery stub for missing filePersistence types

export const DEFAULT_UPLOAD_CONCURRENCY = 5
export const FILE_COUNT_LIMIT = 100
export const OUTPUTS_SUBDIR = 'outputs'

export interface FailedPersistence {
  filePath?: string
  filename?: string
  error: string
}

export interface PersistedFile {
  filePath?: string
  filename?: string
  fileId?: string
  file_id?: string
}

export interface FilesPersistedEventData {
  persisted?: PersistedFile[]
  files: PersistedFile[]
  failed: FailedPersistence[]
}

export type TurnStartTime = number
