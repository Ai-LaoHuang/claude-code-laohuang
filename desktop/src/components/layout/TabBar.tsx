import { useCallback, useState } from 'react'
import {
  SCHEDULED_TAB_ID,
  SETTINGS_TAB_ID,
  TERMINAL_TAB_PREFIX,
  useTabStore,
  type Tab,
} from '../../stores/tabStore'
import { useChatStore } from '../../stores/chatStore'
import { useSessionStore } from '../../stores/sessionStore'
import { useWorkspacePanelStore } from '../../stores/workspacePanelStore'
import { useTerminalPanelStore } from '../../stores/terminalPanelStore'
import { useTranslation } from '../../i18n'
import { WindowControls, showWindowControls } from './WindowControls'
import { OpenProjectMenu } from './OpenProjectMenu'
import { Folder, FolderOpen, MoreHorizontal, SquareTerminal } from 'lucide-react'

const isTauri = typeof window !== 'undefined' && ('__TAURI_INTERNALS__' in window || '__TAURI__' in window)

function isSessionTab(tab: Tab | null) {
  if (!tab) return false
  const tabType = (tab as Partial<Tab>).type
  if (tabType === 'session') return true
  if (tabType) return false
  return isSessionTabId(tab.sessionId)
}

function isSessionTabId(tabId: string | null) {
  if (!tabId) return false
  return tabId !== SETTINGS_TAB_ID &&
    tabId !== SCHEDULED_TAB_ID &&
    !tabId.startsWith(TERMINAL_TAB_PREFIX)
}

export function TabBar() {
  const tabs = useTabStore((s) => s.tabs)
  const activeTabId = useTabStore((s) => s.activeTabId)
  const setActiveTab = useTabStore((s) => s.setActiveTab)
  const closeTab = useTabStore((s) => s.closeTab)
  const disconnectSession = useChatStore((s) => s.disconnectSession)
  const activeTab = tabs.find((tab) => tab.sessionId === activeTabId) ?? null
  const isActiveSessionTab = isSessionTab(activeTab) || isSessionTabId(activeTabId)
  const activeTitle = activeTab?.title?.trim() || 'Claude Code LaoHuang'
  const activeSession = useSessionStore((state) =>
    activeTabId ? state.sessions.find((session) => session.id === activeTabId) : undefined,
  )
  const activeSessionState = useChatStore((state) => activeTabId ? state.sessions[activeTabId] : undefined)
  const openProjectPath = isActiveSessionTab && activeSession?.workDirExists !== false
    ? activeSession?.workDir ?? null
    : null
  const isWorkspacePanelOpen = useWorkspacePanelStore((state) =>
    activeTabId && isActiveSessionTab ? state.isPanelOpen(activeTabId) : false,
  )
  const isTerminalPanelOpen = useTerminalPanelStore((state) =>
    activeTabId && isActiveSessionTab ? state.isPanelOpen(activeTabId) : false,
  )

  const [contextMenu, setContextMenu] = useState<{ sessionId: string; x: number; y: number } | null>(null)
  const [closingTabId, setClosingTabId] = useState<string | null>(null)
  const t = useTranslation()
  const chatState = activeSessionState?.chatState ?? 'idle'
  const tokenUsage = activeSessionState?.tokenUsage ?? { input_tokens: 0, output_tokens: 0 }
  const totalTokens = tokenUsage.input_tokens + tokenUsage.output_tokens
  const lastUpdated = (() => {
    if (!activeSession?.modifiedAt) return ''
    const diff = Date.now() - new Date(activeSession.modifiedAt).getTime()
    if (diff < 60000) return t('session.timeJustNow')
    if (diff < 3600000) return t('session.timeMinutes', { n: Math.floor(diff / 60000) })
    if (diff < 86400000) return t('session.timeHours', { n: Math.floor(diff / 3600000) })
    return t('session.timeDays', { n: Math.floor(diff / 86400000) })
  })()

  const closeTabWithCleanup = useCallback((tab: Tab) => {
    if (isSessionTab(tab)) {
      useWorkspacePanelStore.getState().clearSession(tab.sessionId)
      useTerminalPanelStore.getState().clearSession(tab.sessionId)
    }
    closeTab(tab.sessionId)
  }, [closeTab])

  const handleClose = (sessionId: string) => {
    // Special tabs can always be closed directly
    const tab = tabs.find((t) => t.sessionId === sessionId)
    if (!tab) return
    if (!isSessionTab(tab)) {
      closeTabWithCleanup(tab)
      return
    }

    const sessionState = useChatStore.getState().sessions[sessionId]
    const isRunning = sessionState && sessionState.chatState !== 'idle'

    if (isRunning) {
      setClosingTabId(sessionId)
      return
    }

    disconnectSession(sessionId)
    closeTabWithCleanup(tab)
  }

  const handleContextMenu = (e: React.MouseEvent, sessionId: string) => {
    e.preventDefault()
    setContextMenu({ sessionId, x: e.clientX, y: e.clientY })
  }

  const openActiveTabMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (!activeTabId) return
    const rect = event.currentTarget.getBoundingClientRect()
    setContextMenu({
      sessionId: activeTabId,
      x: rect.left,
      y: rect.bottom + 6,
    })
  }

  const handleCloseOthers = (sessionId: string) => {
    setContextMenu(null)
    const otherTabs = tabs.filter((t) => t.sessionId !== sessionId)
    for (const tab of otherTabs) {
      if (isSessionTab(tab)) disconnectSession(tab.sessionId)
      closeTabWithCleanup(tab)
    }
  }

  const handleCloseLeft = (sessionId: string) => {
    setContextMenu(null)
    const idx = tabs.findIndex((t) => t.sessionId === sessionId)
    const leftTabs = tabs.slice(0, idx)
    for (const tab of leftTabs) {
      if (isSessionTab(tab)) disconnectSession(tab.sessionId)
      closeTabWithCleanup(tab)
    }
  }

  const handleCloseRight = (sessionId: string) => {
    setContextMenu(null)
    const idx = tabs.findIndex((t) => t.sessionId === sessionId)
    const rightTabs = tabs.slice(idx + 1)
    for (const tab of rightTabs) {
      if (isSessionTab(tab)) disconnectSession(tab.sessionId)
      closeTabWithCleanup(tab)
    }
  }

  const handleCloseAll = () => {
    setContextMenu(null)
    for (const tab of tabs) {
      if (isSessionTab(tab)) disconnectSession(tab.sessionId)
      closeTabWithCleanup(tab)
    }
  }

  return (
    <div
      data-testid="tab-bar"
      className="app-top-bar flex min-h-11 items-center bg-[var(--color-surface-container)] select-none border-b border-[var(--color-border)]"
    >
      <div
        className="app-top-bar__title flex min-w-0 flex-1 items-center gap-3 px-4"
        data-tauri-drag-region={isTauri ? true : undefined}
      >
        <div className="min-w-0">
          <div className="flex min-w-0 items-center gap-2">
            <button
              type="button"
              className="app-top-bar__title-button min-w-0 truncate text-left text-[13px] leading-none text-[var(--color-text-primary)]"
              onClick={() => activeTabId && setActiveTab(activeTabId)}
              onContextMenu={(event) => activeTabId && handleContextMenu(event, activeTabId)}
            >
              {activeTitle}
            </button>
            {activeTabId && (
              <button
                type="button"
                aria-label={t('tabs.more')}
                title={t('tabs.more')}
                onClick={openActiveTabMenu}
                className="app-top-bar__more-button inline-flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-[var(--color-text-tertiary)] transition-colors hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text-primary)]"
              >
                <MoreHorizontal size={17} strokeWidth={1.9} />
              </button>
            )}
          </div>
          <div
            data-testid="tab-bar-session-meta"
            className="app-top-bar__meta mt-1 flex min-w-0 items-center gap-1.5 overflow-hidden whitespace-nowrap text-[11px] leading-none text-[var(--color-text-tertiary)]"
          >
            {chatState !== 'idle' && (
              <span className="flex shrink-0 items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-success)] animate-pulse-dot" />
                {t('session.active')}
              </span>
            )}
            {totalTokens > 0 && (
              <>
                <span className="text-[var(--color-outline)]">·</span>
                <span>{totalTokens.toLocaleString()} t</span>
              </>
            )}
            {lastUpdated && (
              <>
                <span className="text-[var(--color-outline)]">·</span>
                <span className="truncate">{t('session.lastUpdated', { time: lastUpdated })}</span>
              </>
            )}
            {activeSession?.messageCount !== undefined && activeSession.messageCount > 0 && (
              <>
                <span className="text-[var(--color-outline)]">·</span>
                <span>{t('session.messages', { count: activeSession.messageCount })}</span>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="app-top-bar__actions flex shrink-0 items-center gap-1 border-l border-[var(--color-border)]/70 px-2">
        {isTauri && isActiveSessionTab && (
          <OpenProjectMenu path={openProjectPath} />
        )}
        <ToolbarIconButton
          icon={<SquareTerminal size={17} strokeWidth={1.9} />}
          label={t('tabs.openTerminal')}
          onClick={() => {
            if (activeTabId && isActiveSessionTab) {
              useTerminalPanelStore.getState().togglePanel(activeTabId)
              return
            }
            useTabStore.getState().openTerminalTab()
          }}
          active={isTerminalPanelOpen}
        />
        {isActiveSessionTab && activeTabId && (
          <ToolbarIconButton
            icon={isWorkspacePanelOpen ? <FolderOpen size={18} strokeWidth={1.9} /> : <Folder size={18} strokeWidth={1.9} />}
            label={t(isWorkspacePanelOpen ? 'tabs.hideWorkspace' : 'tabs.showWorkspace')}
            onClick={() => useWorkspacePanelStore.getState().togglePanel(activeTabId)}
            active={isWorkspacePanelOpen}
          />
        )}
      </div>

      {isTauri && (
        <div
          data-testid="tab-bar-drag-gutter"
          data-tauri-drag-region
          aria-hidden="true"
          className={`min-h-11 flex-shrink-0 ${showWindowControls ? 'w-3' : 'w-4'}`}
        />
      )}

      <WindowControls />

      {contextMenu && (
        <div
          className="fixed z-50 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-md)] py-1 min-w-[160px]"
          style={{ left: contextMenu.x, top: contextMenu.y, boxShadow: 'var(--shadow-dropdown)' }}
        >
          <button
            onClick={() => { handleClose(contextMenu.sessionId); setContextMenu(null) }}
            className="w-full px-3 py-1.5 text-xs text-left text-[var(--color-text-primary)] hover:bg-[var(--color-surface-hover)]"
          >
            {t('tabs.close')}
          </button>
          <button
            onClick={() => handleCloseOthers(contextMenu.sessionId)}
            className="w-full px-3 py-1.5 text-xs text-left text-[var(--color-text-primary)] hover:bg-[var(--color-surface-hover)]"
          >
            {t('tabs.closeOthers')}
          </button>
          <button
            onClick={() => handleCloseLeft(contextMenu.sessionId)}
            className="w-full px-3 py-1.5 text-xs text-left text-[var(--color-text-primary)] hover:bg-[var(--color-surface-hover)]"
          >
            {t('tabs.closeLeft')}
          </button>
          <button
            onClick={() => handleCloseRight(contextMenu.sessionId)}
            className="w-full px-3 py-1.5 text-xs text-left text-[var(--color-text-primary)] hover:bg-[var(--color-surface-hover)]"
          >
            {t('tabs.closeRight')}
          </button>
          <div className="my-1 border-t border-[var(--color-border)]" />
          <button
            onClick={handleCloseAll}
            className="w-full px-3 py-1.5 text-xs text-left text-[var(--color-text-primary)] hover:bg-[var(--color-surface-hover)]"
          >
            {t('tabs.closeAll')}
          </button>
        </div>
      )}

      {closingTabId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30">
          <div className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] p-6 max-w-sm w-full mx-4" style={{ boxShadow: 'var(--shadow-dropdown)' }}>
            <h3 className="text-sm font-semibold text-[var(--color-text-primary)] mb-2">{t('tabs.closeConfirmTitle')}</h3>
            <p className="text-xs text-[var(--color-text-secondary)] mb-4">{t('tabs.closeConfirmMessage')}</p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setClosingTabId(null)} className="px-3 py-1.5 text-xs rounded-lg border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)]">
                {t('common.cancel')}
              </button>
              <button
                onClick={() => {
                  const tab = tabs.find((item) => item.sessionId === closingTabId)
                  if (tab) closeTabWithCleanup(tab)
                  setClosingTabId(null)
                }}
                className="px-3 py-1.5 text-xs rounded-lg border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)]"
              >
                {t('tabs.closeConfirmKeep')}
              </button>
              <button
                onClick={() => {
                  useChatStore.getState().stopGeneration(closingTabId)
                  disconnectSession(closingTabId)
                  const tab = tabs.find((item) => item.sessionId === closingTabId)
                  if (tab) closeTabWithCleanup(tab)
                  setClosingTabId(null)
                }}
                className="px-3 py-1.5 text-xs rounded-lg bg-[var(--color-brand)] text-white hover:opacity-90"
              >
                {t('tabs.closeConfirmStop')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function ToolbarIconButton({
  icon,
  label,
  onClick,
  active = false,
}: {
  icon: React.ReactNode
  label: string
  onClick: () => void
  active?: boolean
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      data-active={active ? 'true' : 'false'}
      className={`inline-flex h-8 w-8 items-center justify-center rounded-[10px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)] ${
        active
          ? 'bg-[var(--color-surface-hover)] text-[var(--color-text-primary)]'
          : 'text-[var(--color-text-tertiary)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text-primary)]'
      }`}
    >
      {icon}
    </button>
  )
}
