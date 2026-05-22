import { useTranslation, type TranslationKey } from '../../i18n'
import type { SettingsTab } from '../../stores/uiStore'

type SettingsNavItem = {
  tab: SettingsTab
  icon: string
  labelKey: TranslationKey
}

type SettingsNavSection = {
  titleKey: TranslationKey
  items: SettingsNavItem[]
}

const SETTINGS_NAV_SECTIONS: SettingsNavSection[] = [
  {
    titleKey: 'settings.group.aiSetup',
    items: [
      { tab: 'providers', icon: 'dns', labelKey: 'settings.tab.providers' },
      { tab: 'permissions', icon: 'shield', labelKey: 'settings.tab.permissions' },
      { tab: 'general', icon: 'tune', labelKey: 'settings.tab.general' },
      { tab: 'h5Access', icon: 'qr_code_2', labelKey: 'settings.tab.h5Access' },
      { tab: 'adapters', icon: 'chat', labelKey: 'settings.tab.adapters' },
    ],
  },
  {
    titleKey: 'settings.group.workspace',
    items: [
      { tab: 'terminal', icon: 'terminal', labelKey: 'settings.tab.terminal' },
      { tab: 'activity', icon: 'monitoring', labelKey: 'settings.tab.activity' },
    ],
  },
  {
    titleKey: 'settings.group.extensions',
    items: [
      { tab: 'mcp', icon: 'dns', labelKey: 'settings.tab.mcp' },
      { tab: 'agents', icon: 'smart_toy', labelKey: 'settings.tab.agents' },
      { tab: 'skills', icon: 'auto_awesome', labelKey: 'settings.tab.skills' },
      { tab: 'memory', icon: 'history_edu', labelKey: 'settings.tab.memory' },
      { tab: 'plugins', icon: 'extension', labelKey: 'settings.tab.plugins' },
      { tab: 'computerUse', icon: 'mouse', labelKey: 'settings.tab.computerUse' },
    ],
  },
  {
    titleKey: 'settings.group.system',
    items: [
      { tab: 'diagnostics', icon: 'monitor_heart', labelKey: 'settings.tab.diagnostics' },
    ],
  },
]

const SETTINGS_ABOUT_ITEM: SettingsNavItem = {
  tab: 'about',
  icon: 'info',
  labelKey: 'settings.tab.about',
}

type SettingsNavigationProps = {
  activeTab: SettingsTab
  onSelectTab: (tab: SettingsTab) => void
}

export function SettingsNavigation({ activeTab, onSelectTab }: SettingsNavigationProps) {
  const t = useTranslation()

  return (
    <div className="settings-navigation w-[208px] border-r border-[var(--color-border)] py-3 flex-shrink-0 flex flex-col bg-[var(--color-surface-container-low)]/40">
      <div className="flex-1 overflow-y-auto px-2">
        {SETTINGS_NAV_SECTIONS.map((section) => (
          <div key={section.titleKey} className="mb-3">
            <div className="px-2.5 pb-1 pt-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--color-text-tertiary)]">
              {t(section.titleKey)}
            </div>
            <div className="flex flex-col gap-0.5">
              {section.items.map((item) => (
                <TabButton
                  key={item.tab}
                  icon={item.icon}
                  label={t(item.labelKey)}
                  active={activeTab === item.tab}
                  onClick={() => onSelectTab(item.tab)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="border-t border-[var(--color-border)]/40 px-2 pt-2">
        <TabButton
          icon={SETTINGS_ABOUT_ITEM.icon}
          label={t(SETTINGS_ABOUT_ITEM.labelKey)}
          active={activeTab === SETTINGS_ABOUT_ITEM.tab}
          onClick={() => onSelectTab(SETTINGS_ABOUT_ITEM.tab)}
        />
      </div>
    </div>
  )
}

function TabButton({ icon, label, active, onClick }: { icon: string; label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm text-left transition-colors ${
        active
          ? 'bg-[var(--color-surface-selected)] text-[var(--color-text-primary)] font-medium'
          : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)]'
      }`}
    >
      <span className="material-symbols-outlined text-[18px]">{icon}</span>
      {label}
    </button>
  )
}
