import type { ValidationResult } from 'src/Tool.js'
import { isClaudeSettingsPath } from '../permissions/filesystem.js'
import { validateSettingsFileContent } from './validation.js'

/**
 * Validates settings file edits to ensure the result conforms to SettingsSchema.
 * This is used by FileEditTool to avoid code duplication.
 *
 * @param filePath - The file path being edited
 * @param originalContent - The original file content before edits
 * @param getUpdatedContent - A closure that returns the content after applying edits
 * @returns Validation result with error details if validation fails
 */
export function validateInputForSettingsFileEdit(
  filePath: string,
  originalContent: string,
  getUpdatedContent: () => string,
): Extract<ValidationResult, { result: false }> | null {
  // Only validate Claude settings files
  if (!isClaudeSettingsPath(filePath)) {
    return null
  }

  // Check if the current file (before edit) conforms to the schema
  const beforeValidation = validateSettingsFileContent(originalContent)

  if (!beforeValidation.isValid) {
    // If the before version is invalid, allow the edit (don't block it)
    return null
  }

  // If the before version is valid, ensure the after version is also valid
  const updatedContent = getUpdatedContent()
  const afterValidation = validateSettingsFileContent(updatedContent)

  if (!afterValidation.isValid) {
    const invalid = afterValidation as Extract<typeof afterValidation, { isValid: false }>
    return {
      result: false,
      message: `Claude-code-laohuang settings.json validation failed after edit:\n${invalid.error}\n\nFull schema:\n${invalid.fullSchema}\nIMPORTANT: Do not update the env unless explicitly instructed to do so.`,
      errorCode: 10,
    }
  }

  return null
}
