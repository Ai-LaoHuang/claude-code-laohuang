import type React from 'react'

export type Option<T = string> = {
  value: T
  label: React.ReactNode
  description?: React.ReactNode
  disabled?: boolean
}
