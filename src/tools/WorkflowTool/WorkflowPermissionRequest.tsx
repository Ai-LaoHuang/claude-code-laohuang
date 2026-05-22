import React from 'react'
import { FallbackPermissionRequest } from '../../components/permissions/FallbackPermissionRequest.js'

export function WorkflowPermissionRequest(props: any): React.ReactNode {
  return <FallbackPermissionRequest {...props} />
}
