import type React from 'react'

declare global {
namespace React {
  type Dispatch<A> = import('react').Dispatch<A>
  type SetStateAction<S> = import('react').SetStateAction<S>
  type ReactNode = import('react').ReactNode
  type Key = import('react').Key
}
}

declare global {
const MACRO: {
  VERSION: string
  COMMITS: string
  SENTRY_RELEASE: string
  PACKAGE_URL: string
  MANUAL_RELEASE_NOTES: string
  BUILD_CHANNEL: string
  BUILD_DATE: string
  BUILD_TIME: string
  PROD: boolean
  DEBUG: boolean
  USE_BUILTIN_RIPGREP: boolean
  ISSUES_EXPLAINER: string
  FEEDBACK_CHANNEL: string
  NATIVE_PACKAGE_URL: string
  VERSION_CHANGELOG: string
}
}
