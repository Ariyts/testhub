import { useState } from 'react';
import {
  Settings,
  Palette,
  Keyboard,
  Cloud,
  Moon,
  Sun,
  Monitor,
  Check,
  Github,
} from 'lucide-react';
import { cn } from '@/utils/cn';
import { Modal } from '@/components/ui/Modal';
import { useUIStore } from '@/stores/useUIStore';

type SettingsTab = 'general' | 'appearance' | 'hotkeys' | 'sync';

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
    { id: 'hotkeys', name: 'Hotkeys', icon: <Keyboard size={16} /> },
    { id: 'sync', name: 'GitHub Sync', icon: <Cloud size={16} /> },
  ];

  return (
    <Modal isOpen={settingsOpen} onClose={closeSettings} title="Settings" size="xl">
      <div className="flex gap-6 -mt-2">
        {/* Sidebar */}
        <nav className="w-44 flex-shrink-0 space-y-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors',
                activeTab === tab.id
                  ? 'bg-indigo-500/20 text-indigo-300'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-700/50'
              )}
            >
              {tab.icon}
              {tab.name}
            </button>
          ))}
        </nav>

        {/* Content */}
        <div className="flex-1 min-h-[400px]">
          {activeTab === 'general' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">General Settings</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-zinc-300">Editor Font Size</p>
                      <p className="text-xs text-zinc-500">Size of text in the editor</p>
                    </div>
                    <input
                      type="number"
                      value={theme.editor.fontSize}
                      onChange={(e) =>
                        updateTheme({
                          editor: { ...theme.editor, fontSize: parseInt(e.target.value) || 16 },
                        })
                      }
                      className="w-20 px-3 py-1.5 bg-zinc-700 border border-zinc-600 rounded-lg text-white text-sm"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-zinc-300">Line Numbers</p>
                      <p className="text-xs text-zinc-500">Show line numbers in editor</p>
                    </div>
                    <button
                      onClick={() =>
                        updateTheme({
                          editor: { ...theme.editor, showLineNumbers: !theme.editor.showLineNumbers },
                        })
                      }
                      className={cn(
                        'w-12 h-6 rounded-full transition-colors relative',
                        theme.editor.showLineNumbers ? 'bg-indigo-500' : 'bg-zinc-600'
                      )}
                    >
                      <div
                        className={cn(
                          'absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform',
                          theme.editor.showLineNumbers ? 'left-6' : 'left-0.5'
                        )}
                      />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'appearance' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Appearance</h3>
                
                {/* Theme Mode */}
                <div className="mb-6">
                  <p className="text-sm font-medium text-zinc-300 mb-3">Theme Mode</p>
                  <div className="flex gap-2">
                    {[
                      { mode: 'light', icon: <Sun size={16} />, label: 'Light' },
                      { mode: 'dark', icon: <Moon size={16} />, label: 'Dark' },
                      { mode: 'system', icon: <Monitor size={16} />, label: 'System' },
                    ].map(({ mode, icon, label }) => (
                      <button
                        key={mode}
                        onClick={() => updateTheme({ mode: mode as 'light' | 'dark' | 'system' })}
                        className={cn(
                          'flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors',
                          theme.mode === mode
                            ? 'bg-indigo-500/20 border-indigo-500 text-indigo-300'
                            : 'border-zinc-600 text-zinc-400 hover:border-zinc-500'
                        )}
                      >
                        {icon}
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Accent Color */}
                <div>
                  <p className="text-sm font-medium text-zinc-300 mb-3">Accent Color</p>
                  <div className="flex gap-2">
                    {['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316', '#22c55e', '#06b6d4'].map(
                      (color) => (
                        <button
                          key={color}
                          onClick={() =>
                            updateTheme({ colors: { ...theme.colors, primary: color } })
                          }
                          className="w-8 h-8 rounded-lg flex items-center justify-center transition-transform hover:scale-110"
                          style={{ backgroundColor: color }}
                        >
                          {theme.colors.primary === color && <Check size={14} className="text-white" />}
                        </button>
                      )
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'hotkeys' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Keyboard Shortcuts</h3>
                <div className="space-y-2">
                  {[
                    { action: 'Quick Switcher', key: '⌘O' },
                    { action: 'Command Palette', key: '⌘P' },
                    { action: 'New Note', key: '⌘N' },
                    { action: 'Toggle Graph', key: '⌘G' },
                    { action: 'Toggle Sidebar', key: '⌘\\' },
                    { action: 'Toggle Backlinks', key: '⌘⇧B' },
                    { action: 'Save', key: '⌘S' },
                  ].map(({ action, key }) => (
                    <div
                      key={action}
                      className="flex items-center justify-between py-2 px-3 rounded-lg bg-zinc-800/50"
                    >
                      <span className="text-sm text-zinc-300">{action}</span>
                      <span className="text-xs bg-zinc-700 px-2 py-1 rounded text-zinc-400">
                        {key}
                      </span>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-zinc-500 mt-4">
                  Hotkey customization coming soon
                </p>
              </div>
            </div>
          )}

          {activeTab === 'sync' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Github size={20} />
                  GitHub Sync
                </h3>
                <p className="text-sm text-zinc-500 mb-6">
                  Sync your data to a GitHub repository. All changes are automatically committed.
                </p>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">
                      Personal Access Token
                    </label>
                    <input
                      type="password"
                      value={syncConfig.token || ''}
                      onChange={(e) => updateSyncConfig({ token: e.target.value })}
                      placeholder="ghp_xxxxxxxxxxxx"
                      className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-indigo-500"
                    />
                    <p className="text-xs text-zinc-500 mt-1">
                      Create a token with <code className="bg-zinc-700 px-1 rounded">repo</code> scope
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">
                      Repository
                    </label>
                    <input
                      type="text"
                      value={syncConfig.repository}
                      onChange={(e) => updateSyncConfig({ repository: e.target.value })}
                      placeholder="username/repository"
                      className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">
                      Branch
                    </label>
                    <input
                      type="text"
                      value={syncConfig.branch}
                      onChange={(e) => updateSyncConfig({ branch: e.target.value })}
                      placeholder="main"
                      className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="flex items-center justify-between py-3 border-t border-zinc-700 mt-4">
                    <div>
                      <p className="text-sm font-medium text-zinc-300">Auto Sync</p>
                      <p className="text-xs text-zinc-500">Automatically sync changes every 2 seconds</p>
                    </div>
                    <button
                      onClick={() => updateSyncConfig({ autoSync: !syncConfig.autoSync })}
                      className={cn(
                        'w-12 h-6 rounded-full transition-colors relative',
                        syncConfig.autoSync ? 'bg-indigo-500' : 'bg-zinc-600'
                      )}
                    >
                      <div
                        className={cn(
                          'absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform',
                          syncConfig.autoSync ? 'left-6' : 'left-0.5'
                        )}
                      />
                    </button>
                  </div>

                  <div className="p-4 bg-zinc-800/50 rounded-lg border border-zinc-700 mt-4">
                    <p className="text-sm text-zinc-400">
                      <strong className="text-zinc-300">File Structure:</strong> Your data will be stored as readable files:
                    </p>
                    <pre className="mt-2 text-xs text-zinc-500 font-mono">
{`/WorkspaceName
  /NotesBlock
    /Folder/Note.md
  /CardsBlock/cards.json
  /LinksBlock/links.json`}
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
