import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import '@testing-library/jest-dom'

const windowControlsMock = vi.hoisted(() => ({
  show: true,
}))
const openProjectMenuMock = vi.hoisted(() => ({
  paths: [] as Array<string | null | undefined>,
}))

vi.mock('../../i18n', () => ({
  useTranslation: () => (key: string) => {
    const translations: Record<string, string> = {
      'tabs.close': 'Close',
      'tabs.closeOthers': 'Close Others',
      'tabs.closeLeft': 'Close Left',
      'tabs.closeRight': 'Close Right',
      'tabs.closeAll': 'Close All',
      'tabs.closeConfirmTitle': 'Session Running',
      'tabs.closeConfirmMessage': 'Still running',
      'tabs.closeConfirmKeep': 'Keep Running',
      'tabs.closeConfirmStop': 'Stop & Close',
      'tabs.more': 'More',
      'tabs.openTerminal': 'Open Terminal',
      'tabs.showWorkspace': 'Show Workspace',
      'tabs.hideWorkspace': 'Hide Workspace',
      'common.cancel': 'Cancel',
    }

    return translations[key] ?? key
  },
}))

vi.mock('./OpenProjectMenu', () => ({
  OpenProjectMenu: ({ path }: { path: string | null | undefined }) => {
    if (!path) return null
    openProjectMenuMock.paths.push(path)
    return <div data-testid="open-project-menu">{path}</div>
  },
}))

vi.mock('./WindowControls', () => ({
  WindowControls: () => (windowControlsMock.show ? <div data-testid="window-controls" /> : null),
  get showWindowControls() {
    return windowControlsMock.show
  },
}))

describe('TabBar', () => {
  beforeEach(() => {
    Object.defineProperty(window, '__TAURI__', {
      configurable: true,
      value: {},
    })

    openProjectMenuMock.paths = []
    windowControlsMock.show = true
    vi.resetModules()
  })

  afterEach(async () => {
    cleanup()

    const { useTabStore } = await import('../../stores/tabStore')
    const { useChatStore } = await import('../../stores/chatStore')
    const { useSessionStore } = await import('../../stores/sessionStore')
    const { useWorkspacePanelStore } = await import('../../stores/workspacePanelStore')
    const { useTerminalPanelStore } = await import('../../stores/terminalPanelStore')

    useTabStore.setState({ tabs: [], activeTabId: null })
    useChatStore.setState({
      sessions: {},
    } as Partial<ReturnType<typeof useChatStore.getState>>)
    useSessionStore.setState({
      sessions: [],
      activeSessionId: null,
      isLoading: false,
      error: null,
      isBatchMode: false,
      selectedSessionIds: new Set(),
    } as Partial<ReturnType<typeof useSessionStore.getState>>)
    useWorkspacePanelStore.setState(useWorkspacePanelStore.getInitialState(), true)
    useTerminalPanelStore.setState(useTerminalPanelStore.getInitialState(), true)

    delete (window as typeof window & { __TAURI__?: unknown }).__TAURI__
  })

  it('renders only the active conversation title in the top bar', async () => {
    const { TabBar } = await import('./TabBar')
    const { useTabStore } = await import('../../stores/tabStore')

    useTabStore.setState({
      tabs: [
        { sessionId: 'tab-1', title: 'First Session', type: 'session', status: 'idle' },
        { sessionId: 'tab-2', title: 'Current Session', type: 'session', status: 'idle' },
        { sessionId: 'tab-3', title: 'Hidden Session', type: 'session', status: 'idle' },
      ],
      activeTabId: 'tab-2',
    })

    render(<TabBar />)

    expect(screen.getByText('Current Session')).toBeInTheDocument()
    expect(screen.queryByText('First Session')).not.toBeInTheDocument()
    expect(screen.queryByText('Hidden Session')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'More' })).toBeInTheDocument()
  })

  it('marks only the drag gutter and title area as native drag regions', async () => {
    const { TabBar } = await import('./TabBar')
    const { useTabStore } = await import('../../stores/tabStore')

    useTabStore.setState({
      tabs: [{ sessionId: 'tab-1', title: 'Untitled Session', type: 'session', status: 'idle' }],
      activeTabId: 'tab-1',
    })

    render(<TabBar />)

    expect(screen.getByTestId('tab-bar')).not.toHaveAttribute('data-tauri-drag-region')
    expect(screen.getByTestId('tab-bar-drag-gutter')).toHaveAttribute('data-tauri-drag-region')
    expect(screen.getByText('Untitled Session').closest('.app-top-bar__title')).toHaveAttribute('data-tauri-drag-region')
  })

  it('opens a new terminal tab when no session tab is active', async () => {
    windowControlsMock.show = false
    const { TabBar } = await import('./TabBar')
    const { useTabStore } = await import('../../stores/tabStore')

    useTabStore.setState({ tabs: [], activeTabId: null })

    render(<TabBar />)

    fireEvent.click(screen.getByRole('button', { name: 'Open Terminal' }))

    const terminalTabs = useTabStore.getState().tabs.filter((tab) => tab.type === 'terminal')
    expect(terminalTabs).toHaveLength(1)
    expect(useTabStore.getState().activeTabId).toBe(terminalTabs[0]?.sessionId)
    expect(screen.queryByTestId('window-controls')).not.toBeInTheDocument()
  })

  it('passes the active session workdir into the open-project control', async () => {
    const { TabBar } = await import('./TabBar')
    const { useTabStore } = await import('../../stores/tabStore')
    const { useSessionStore } = await import('../../stores/sessionStore')

    useTabStore.setState({
      tabs: [{ sessionId: 'tab-1', title: 'Workspace Session', type: 'session', status: 'idle' }],
      activeTabId: 'tab-1',
    })
    useSessionStore.setState({
      sessions: [{
        id: 'tab-1',
        title: 'Workspace Session',
        createdAt: '2026-05-13T00:00:00.000Z',
        modifiedAt: '2026-05-13T00:00:00.000Z',
        messageCount: 0,
        projectPath: '/repo',
        workDir: '/repo/worktree',
        workDirExists: true,
      }],
      activeSessionId: 'tab-1',
    })

    render(<TabBar />)

    expect(screen.getByTestId('open-project-menu')).toHaveTextContent('/repo/worktree')
    expect(openProjectMenuMock.paths[openProjectMenuMock.paths.length - 1]).toBe('/repo/worktree')
  })

  it('hides the open-project control when the active session workdir is unavailable or not desktop', async () => {
    const { TabBar } = await import('./TabBar')
    const { useTabStore } = await import('../../stores/tabStore')
    const { useSessionStore } = await import('../../stores/sessionStore')

    useTabStore.setState({
      tabs: [{ sessionId: 'tab-1', title: 'Workspace Session', type: 'session', status: 'idle' }],
      activeTabId: 'tab-1',
    })
    useSessionStore.setState({
      sessions: [{
        id: 'tab-1',
        title: 'Workspace Session',
        createdAt: '2026-05-13T00:00:00.000Z',
        modifiedAt: '2026-05-13T00:00:00.000Z',
        messageCount: 0,
        projectPath: '/repo',
        workDir: '/repo/worktree',
        workDirExists: false,
      }],
      activeSessionId: 'tab-1',
    })

    const view = render(<TabBar />)
    expect(screen.queryByTestId('open-project-menu')).not.toBeInTheDocument()

    delete (window as typeof window & { __TAURI__?: unknown }).__TAURI__
    await act(async () => {
      vi.resetModules()
      const { TabBar: BrowserTabBar } = await import('./TabBar')
      view.rerender(<BrowserTabBar />)
    })

    expect(screen.queryByTestId('open-project-menu')).not.toBeInTheDocument()
  })

  it('toggles the bottom terminal panel from the toolbar for an active session', async () => {
    const { TabBar } = await import('./TabBar')
    const { useTabStore } = await import('../../stores/tabStore')
    const { useTerminalPanelStore } = await import('../../stores/terminalPanelStore')

    useTabStore.setState({
      tabs: [{ sessionId: 'tab-1', title: 'First Session', type: 'session', status: 'idle' }],
      activeTabId: 'tab-1',
    })

    render(<TabBar />)

    fireEvent.click(screen.getByRole('button', { name: 'Open Terminal' }))

    expect(useTabStore.getState().tabs.some((tab) => tab.type === 'terminal')).toBe(false)
    expect(useTerminalPanelStore.getState().isPanelOpen('tab-1')).toBe(true)
  })

  it('toggles the workspace panel for the active session from the toolbar', async () => {
    const { TabBar } = await import('./TabBar')
    const { useTabStore } = await import('../../stores/tabStore')
    const { useWorkspacePanelStore } = await import('../../stores/workspacePanelStore')

    useTabStore.setState({
      tabs: [{ sessionId: 'tab-1', title: 'First Session', type: 'session', status: 'idle' }],
      activeTabId: 'tab-1',
    })

    render(<TabBar />)

    fireEvent.click(screen.getByRole('button', { name: 'Show Workspace' }))
    expect(useWorkspacePanelStore.getState().isPanelOpen('tab-1')).toBe(true)

    fireEvent.click(screen.getByRole('button', { name: 'Hide Workspace' }))
    expect(useWorkspacePanelStore.getState().isPanelOpen('tab-1')).toBe(false)
  })

  it('hides the workspace toolbar button for non-session tabs', async () => {
    const { TabBar } = await import('./TabBar')
    const { useTabStore } = await import('../../stores/tabStore')

    useTabStore.setState({
      tabs: [
        { sessionId: '__terminal__1', title: 'Terminal 1', type: 'terminal', status: 'idle' },
        { sessionId: '__settings__', title: 'Settings', type: 'settings', status: 'idle' },
      ],
      activeTabId: '__terminal__1',
    })

    const { rerender } = render(<TabBar />)

    expect(screen.queryByRole('button', { name: 'Show Workspace' })).not.toBeInTheDocument()

    await act(async () => {
      useTabStore.getState().setActiveTab('__settings__')
    })
    rerender(<TabBar />)

    expect(screen.queryByRole('button', { name: 'Show Workspace' })).not.toBeInTheDocument()
  })

  it('closes the active tab from the title more menu and clears session panel state', async () => {
    const { TabBar } = await import('./TabBar')
    const { useTabStore } = await import('../../stores/tabStore')
    const { useChatStore } = await import('../../stores/chatStore')
    const { useWorkspacePanelStore } = await import('../../stores/workspacePanelStore')
    const { useTerminalPanelStore } = await import('../../stores/terminalPanelStore')
    const disconnectSession = vi.fn()

    useTabStore.setState({
      tabs: [{ sessionId: 'tab-1', title: 'First Session', type: 'session', status: 'idle' }],
      activeTabId: 'tab-1',
    })
    useChatStore.setState({
      sessions: {},
      disconnectSession,
    } as Partial<ReturnType<typeof useChatStore.getState>>)
    useWorkspacePanelStore.getState().openPanel('tab-1')
    useTerminalPanelStore.getState().openPanel('tab-1')

    render(<TabBar />)

    fireEvent.click(screen.getByRole('button', { name: 'More' }))
    fireEvent.click(screen.getByRole('button', { name: 'Close' }))

    expect(disconnectSession).toHaveBeenCalledWith('tab-1')
    expect(useTabStore.getState().tabs).toEqual([])
    expect(useWorkspacePanelStore.getState().panelBySession['tab-1']).toBeUndefined()
    expect(useTerminalPanelStore.getState().panelBySession['tab-1']).toBeUndefined()
  })

  it('closes an active terminal tab without disconnecting chat sessions', async () => {
    const { TabBar } = await import('./TabBar')
    const { useTabStore } = await import('../../stores/tabStore')
    const { useChatStore } = await import('../../stores/chatStore')
    const disconnectSession = vi.fn()

    useTabStore.setState({
      tabs: [{ sessionId: '__terminal__1', title: 'Terminal 1', type: 'terminal', status: 'idle' }],
      activeTabId: '__terminal__1',
    })
    useChatStore.setState({
      sessions: {},
      disconnectSession,
    } as Partial<ReturnType<typeof useChatStore.getState>>)

    render(<TabBar />)

    fireEvent.click(screen.getByRole('button', { name: 'More' }))
    fireEvent.click(screen.getByRole('button', { name: 'Close' }))

    expect(disconnectSession).not.toHaveBeenCalled()
    expect(useTabStore.getState().tabs).toEqual([])
  })
})
