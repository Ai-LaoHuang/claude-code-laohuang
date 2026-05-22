import { Home, Library, PanelRight, Settings, Sparkles, SquareTerminal, TimerReset } from 'lucide-react'
import type { ReactNode } from 'react'
import { useTranslation } from '../../i18n'
import { useChatStore } from '../../stores/chatStore'
import { useSessionStore } from '../../stores/sessionStore'
import { SETTINGS_TAB_ID, SCHEDULED_TAB_ID, useTabStore } from '../../stores/tabStore'
import { useUIStore } from '../../stores/uiStore'

export function AppRail() {
  const t = useTranslation()
  const activeTabId = useTabStore((s) => s.activeTabId)
  const addToast = useUIStore((s) => s.addToast)

  const createSession = async () => {
    try {
      const sessionId = await useSessionStore.getState().createSession()
      useTabStore.getState().openTab(sessionId, t('sidebar.newSession'))
      useChatStore.getState().connectToSession(sessionId)
    } catch (error) {
      addToast({
        type: 'error',
        message: error instanceof Error ? error.message : t('sidebar.sessionListFailed'),
      })
    }
  }

  return (
    <nav className="app-rail" aria-label="Primary">
      <div className="app-rail__dock">
        <RailButton
          icon={<Sparkles size={18} strokeWidth={1.8} />}
          label="LaoHuang"
          onClick={() => undefined}
        />
        <RailDivider />
        <RailButton
          icon={<Home size={17} strokeWidth={1.9} />}
          label={t('sidebar.newSession')}
          active={!activeTabId || (activeTabId !== SETTINGS_TAB_ID && activeTabId !== SCHEDULED_TAB_ID && !activeTabId.startsWith('__terminal__'))}
          onClick={() => void createSession()}
        />
        <RailButton
          icon={<TimerReset size={17} strokeWidth={1.9} />}
          label={t('sidebar.scheduled')}
          active={activeTabId === SCHEDULED_TAB_ID}
          onClick={() => useTabStore.getState().openTab(SCHEDULED_TAB_ID, t('sidebar.scheduled'), 'scheduled')}
        />
        <RailButton
          icon={<SquareTerminal size={17} strokeWidth={1.9} />}
          label={t('tabs.openTerminal')}
          active={Boolean(activeTabId?.startsWith('__terminal__'))}
          onClick={() => useTabStore.getState().openTerminalTab()}
        />
        <RailButton
          icon={<Library size={17} strokeWidth={1.9} />}
          label={t('settings.group.extensions')}
          onClick={() => {
            useUIStore.getState().setPendingSettingsTab('plugins')
            useTabStore.getState().openTab(SETTINGS_TAB_ID, t('sidebar.settings'), 'settings')
          }}
        />
        <RailButton
          icon={<PanelRight size={17} strokeWidth={1.9} />}
          label={t('settings.group.system')}
          onClick={() => {
            useUIStore.getState().setPendingSettingsTab('diagnostics')
            useTabStore.getState().openTab(SETTINGS_TAB_ID, t('sidebar.settings'), 'settings')
          }}
        />
      </div>
      <div className="app-rail__settings">
        <RailButton
          icon={<Settings size={18} strokeWidth={1.9} />}
          label={t('sidebar.settings')}
          active={activeTabId === SETTINGS_TAB_ID}
          onClick={() => useTabStore.getState().openTab(SETTINGS_TAB_ID, t('sidebar.settings'), 'settings')}
        />
      </div>
    </nav>
  )
}

function RailButton({
  icon,
  label,
  active = false,
  onClick,
}: {
  icon: ReactNode
  label: string
  active?: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      className="app-rail__button"
      data-active={active ? 'true' : 'false'}
      aria-label={label}
      title={label}
      onClick={onClick}
    >
      {icon}
    </button>
  )
}

function RailDivider() {
  return <div className="app-rail__divider" aria-hidden="true" />
}
