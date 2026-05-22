import {
  activateProactive,
  deactivateProactive,
  isContextBlocked,
  isProactiveActive,
  isProactivePaused,
  pauseProactive,
  resumeProactive,
  setContextBlocked,
} from '../proactive/index.js'
import type { Command, LocalCommandCall } from '../types/command.js'

function renderStatus(): string {
  if (!isProactiveActive()) {
    return 'Proactive mode is currently off.'
  }

  const flags = [
    'on',
    isProactivePaused() ? 'paused' : 'running',
    isContextBlocked() ? 'context-blocked' : null,
  ].filter(Boolean)

  return `Proactive mode is ${flags.join(' · ')}.`
}

export const call: LocalCommandCall = async args => {
  const subcommand = args.trim().toLowerCase()

  if (subcommand === '' || subcommand === 'status') {
    return { type: 'text', value: renderStatus() }
  }

  if (subcommand === 'off' || subcommand === 'disable' || subcommand === 'stop') {
    deactivateProactive()
    return { type: 'text', value: 'Proactive mode disabled.' }
  }

  if (subcommand === 'pause') {
    if (!isProactiveActive()) {
      return { type: 'text', value: 'Proactive mode is off.' }
    }
    pauseProactive()
    return { type: 'text', value: 'Proactive mode paused.' }
  }

  if (subcommand === 'resume') {
    activateProactive('command')
    resumeProactive()
    setContextBlocked(false)
    return { type: 'text', value: 'Proactive mode resumed.' }
  }

  if (subcommand === 'on' || subcommand === 'enable' || subcommand === 'start') {
    activateProactive('command')
    setContextBlocked(false)
    return { type: 'text', value: 'Proactive mode enabled.' }
  }

  return {
    type: 'text',
    value: 'Usage: /proactive [on|off|status|pause|resume]',
  }
}

const proactive = {
  type: 'local',
  name: 'proactive',
  description: 'Toggle proactive autonomous mode',
  supportsNonInteractive: true,
  immediate: true,
  argumentHint: '[on|off|status|pause|resume]',
  load: () => import('./proactive.js'),
} satisfies Command

export default proactive
