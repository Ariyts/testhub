import { useState } from 'react';
import { Settings, Palette, Keyboard, Cloud, Moon, Sun, Check } from 'lucide-react';
import { cn } from '@/utils/cn';
import { Modal } from '@/components/ui/Modal';
import { useUIStore } from '@/stores/useUIStore';

type SettingsTab = 'general' | 'appearance' | 'sync';

export function SettingsModal() {
  const settingsOpen = useUIStore((s) => s.settingsOpen);
  const closeSettings = useUIStore((s) => s.closeSettings);
  const theme = useUIStore((s) => s.theme);
  const updateTheme = useUIStore((s) => s.updateTheme);
  const syncConfig = useUIStore((s) => s.syncConfig);
  const updateSyncConfig = useUIStore((s) => s.updateSyncConfig);
  
  const [activeTab, setActiveTab] = useState<SettingsTab>('general');

  const tabs: { id: SettingsTab; name: string; icon: React.ReactNode }[] = [
    { id: 'general', name: 'General', icon: <Settings size={16} /> },
    { id: 'appearance', name: 'Appearance', icon: <Palette size={16} /> },
    { id: 'sync', name: 'GitHub Sync', icon: <Cloud size={16} /> },
  ];

  return (
    <Modal isOpen={settingsOpen} onClose={closeSettings} title="Settings" size="xl">
      <div className="flex gap-6 -mt-2">
        <nav className="w-44 flex-shrink-0 space-y-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn('w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors', activeTab === tab.id ? 'bg-indigo-500/20 text-indigo-300' : 'text-zinc-400 hover:text-white hover:bg-zinc-700/50')}
            >
              {tab.icon}
              {tab.name}
            </button>
          ))}
        </nav>

        <div className="flex-1 min-h-[300px]">
          {activeTab === 'general' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-white mb-4">General Settings</h3>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-zinc-300">Editor Font Size</p>
                  <p className="text-xs text-zinc-500">Size of text in the editor</p>
                </div>
                <input
                  type="number"
                  value={theme.editor.fontSize}
                  onChange={(e) => updateTheme({ editor: { ...theme.editor, fontSize: parseInt(e.target.value) || 16 } })}
                  className="w-20 px-3 py-1.5 bg-zinc-700 border border-zinc-600 rounded-lg text-white text-sm"
                />
              </div>
            </div>
          )}

          {activeTab === 'appearance' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-white mb-4">Appearance</h3>
              <div>
                <p className="text-sm font-medium text-zinc-300 mb-3">Theme Mode</p>
                <div className="flex gap-2">
                  {[
                    { mode: 'light', icon: <Sun size={16} />, label: 'Light' },
                    { mode: 'dark', icon: <Moon size={16} />, label: 'Dark' },
                  ].map(({ mode, icon, label }) => (
                    <button
                      key={mode}
                      onClick={() => updateTheme({ mode: mode as 'light' | 'dark' })}
                      className={cn('flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors', theme.mode === mode ? 'bg-indigo-500/20 border-indigo-500 text-indigo-300' : 'border-zinc-600 text-zinc-400 hover:border-zinc-500')}
                    >
                      {icon}
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-zinc-300 mb-3">Accent Color</p>
                <div className="flex gap-2">
                  {['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316', '#22c55e', '#06b6d4'].map((color) => (
                    <button
                      key={color}
                      onClick={() => updateTheme({ colors: { ...theme.colors, primary: color } })}
                      className="w-8 h-8 rounded-lg flex items-center justify-center transition-transform hover:scale-110"
                      style={{ backgroundColor: color }}
                    >
                      {theme.colors.primary === color && <Check size={14} className="text-white" />}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'sync' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-white mb-4">GitHub Sync</h3>
              <p className="text-sm text-zinc-500">Sync your data to a GitHub repository.</p>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">Personal Access Token</label>
                  <input
                    type="password"
                    value={syncConfig.token || ''}
                    onChange={(e) => updateSyncConfig({ token: e.target.value })}
                    placeholder="ghp_xxxxxxxxxxxx"
                    className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">Repository</label>
                  <input
                    type="text"
                    value={syncConfig.repository}
                    onChange={(e) => updateSyncConfig({ repository: e.target.value })}
                    placeholder="username/repository"
                    className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">Branch</label>
                  <input
                    type="text"
                    value={syncConfig.branch}
                    onChange={(e) => updateSyncConfig({ branch: e.target.value })}
                    placeholder="main"
                    className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
