import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import '@testing-library/jest-dom'

const viewportMocks = vi.hoisted(() => ({
  isMobile: false,
}))

vi.mock('../../hooks/useMobileViewport', () => ({
  useMobileViewport: () => viewportMocks.isMobile,
}))

vi.mock('../../lib/desktopRuntime', () => ({
  isTauriRuntime: () => false,
}))

vi.mock('../../i18n', () => ({
  useTranslation: () => (key: string) => ({
    'permMode.askPermissions': 'Ask permissions',
    'permMode.askPermDesc': 'Ask before changing files or running commands',
    'permMode.autoAccept': 'Auto accept edits',
    'permMode.autoAcceptDesc': 'Automatically accept edit operations',
    'permMode.planMode': 'Plan mode',
    'permMode.planModeDesc': 'Plan before executing',
    'permMode.bypass': 'Bypass permissions',
    'permMode.bypassDesc': 'Run without permission prompts',
    'permMode.executionPermissions': 'Execution Permissions',
    'permMode.label.default': 'Ask permissions',
    'permMode.label.acceptEdits': 'Auto accept edits',
    'permMode.label.plan': 'Plan mode',
    'permMode.label.bypassPermissions': 'Bypass permissions',
    'permMode.label.dontAsk': 'Bypass permissions',
    'permMode.codexLabel.default': 'Default permissions',
    'permMode.codexLabel.acceptEdits': 'Auto review',
    'permMode.codexLabel.plan': 'Plan mode',
    'permMode.codexLabel.bypassPermissions': 'Full access',
    'permMode.codexLabel.dontAsk': "Don't ask",
    'permMode.enableBypassTitle': 'Enable bypass mode',
    'permMode.enableBypassSubtitle': 'This is risky',
    'permMode.enableBypassBody': 'Bypass permissions for this workspace.',
    'permMode.permReadWrite': 'Read and write files',
    'permMode.permShell': 'Run shell commands',
    'permMode.permPackages': 'Install packages',
    'permMode.enableBypassBtn': 'Enable bypass',
    'common.cancel': 'Cancel',
    'tabs.close': 'Close',
  }[key] ?? key),
}))

import { PermissionModeSelector } from './PermissionModeSelector'
import { useSettingsStore } from '../../stores/settingsStore'
import { useSessionStore } from '../../stores/sessionStore'
import { useTabStore } from '../../stores/tabStore'

describe('PermissionModeSelector mobile access', () => {
  beforeEach(() => {
    viewportMocks.isMobile = false
    useSettingsStore.setState({ permissionMode: 'default' })
    useSessionStore.setState({ sessions: [], activeSessionId: null })
    useTabStore.setState({ activeTabId: null, tabs: [] })
  })

  it('labels the compact mobile trigger and opens a phone-sized menu sheet', () => {
    viewportMocks.isMobile = true

    render(<PermissionModeSelector compact workDir="/repo" />)

    const trigger = screen.getByRole('button', { name: 'Ask permissions' })
    expect(trigger).toHaveClass('h-11', 'w-11')
    expect(trigger).toHaveAttribute('aria-haspopup', 'menu')
    expect(trigger).toHaveAttribute('aria-expanded', 'false')

    fireEvent.click(trigger)

    expect(trigger).toHaveAttribute('aria-expanded', 'true')
    expect(trigger).toHaveAttribute('aria-controls', 'permission-mode-menu')
    expect(screen.getByRole('dialog', { name: 'Execution Permissions' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument()
    expect(screen.getByRole('menuitem', { name: /Auto accept edits/ })).toBeInTheDocument()
  })

  it('renders the Codex composer menu as a viewport popover with visible options', () => {
    render(<PermissionModeSelector variant="codexComposer" />)

    const trigger = screen.getByRole('button', { name: 'Default permissions' })
    fireEvent.click(trigger)

    const menu = screen.getByRole('menu')
    expect(menu).toHaveAttribute('id', 'permission-mode-menu')
    expect(menu).toHaveClass('fixed', 'z-[10000]', 'codex-composer-permission-menu')
    expect(menu).not.toHaveClass('absolute', 'bottom-full')
    expect(document.querySelectorAll('#permission-mode-menu')).toHaveLength(1)
    expect(screen.getByRole('menuitem', { name: /Auto review/ })).toBeInTheDocument()
    expect(screen.getByRole('menuitem', { name: /Full access/ })).toBeInTheDocument()
  })
})
