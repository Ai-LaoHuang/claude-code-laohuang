import React from 'react'
import { UserTextMessage } from './UserTextMessage.js'

export function UserForkBoilerplateMessage(props: {
  addMargin: boolean
  param: { text: string }
}): React.ReactNode {
  return <UserTextMessage {...props} />
}
