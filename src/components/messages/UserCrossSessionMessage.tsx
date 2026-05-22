import React from 'react'
import { UserTextMessage } from './UserTextMessage.js'

export function UserCrossSessionMessage(props: {
  addMargin: boolean
  param: { text: string }
}): React.ReactNode {
  return <UserTextMessage {...props} />
}
