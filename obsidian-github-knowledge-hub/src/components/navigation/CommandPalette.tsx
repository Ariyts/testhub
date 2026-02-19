import { useState, useMemo } from 'react';
import { Command, Settings, Network, Moon, Sun, Folder, LayoutGrid, Link, Terminal } from 'lucide-react';
import { useWorkspaceStore } from '@/stores/useWorkspaceStore';
import { useUIStore } from '@/stores/useUIStore';

export function CommandPalette() {
  const addBlock = useWorkspaceStore((s) => s.addBlock);
  const activeWorkspaceId = useWorkspaceStore((s) => s.activeWorkspaceId);
  const setActiveBlock = useWorkspaceStore((s) => s.setActiveBlock);
  
  const commandPaletteOpen = useUIStore((s) => s.commandPaletteOpen);
  const closeCommandPalette = useUIStore((s) => s.closeCommandPalette);
  const openSettings = useUIStore((s) => s.openSettings);
  const toggleGraph = useUIStore((s) => s.toggleGraph);
  const theme = useUIStore((s) => s.theme);
  const updateTheme = useUIStore((s) => s.updateTheme);
  
  const [query, setQuery] = useState('');

  const commands = useMemo(() => [
    { id: 'new-notes', name: 'Create Notes Block', icon: <Folder size={16} />, action: () => { if (activeWorkspaceId) setActiveBlock(addBlock('folders', activeWorkspaceId).id); } },
    { id: 'new-cards', name: 'Create Cards Block', icon: <LayoutGrid size={16} />, action: () => { if (activeWorkspaceId) setActiveBlock(addBlock('cards', activeWorkspaceId).id); } },
    { id: 'new-links', name: 'Create Links Block', icon: <Link size={16} />, action: () => { if (activeWorkspaceId) setActiveBlock(addBlock('links', activeWorkspaceId).id); } },
    { id: 'new-commands', name: 'Create Commands Block', icon: <Terminal size={16} />, action: () => { if (activeWorkspaceId) setActiveBlock(addBlock('commands', activeWorkspaceId).id); } },
    { id: 'toggle-graph', name: 'Toggle Graph View', icon: <Network size={16} />, action: toggleGraph },
    { id: 'toggle-theme', name: theme.mode === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode', icon: theme.mode === 'dark' ? <Sun size={16} /> : <Moon size={16} />, action: () => updateTheme({ mode: theme.mode === 'dark' ? 'light' : 'dark' }) },
    { id: 'open-settings', name: 'Open Settings', icon: <Settings size={16} />, action: openSettings },
  ], [activeWorkspaceId, addBlock, setActiveBlock, toggleGraph, theme.mode, updateTheme, openSettings]);

  const results = useMemo(() => {
    if (!query) return commands;
    const q = query.toLowerCase();
    return commands.filter((c) => c.name.toLowerCase().includes(q));
  }, [query, commands]);

  if (!commandPaletteOpen) return null;

  const handleSelect = (cmd: typeof commands[0]) => {
    cmd.action();
    closeCommandPalette();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] bg-black/60 backdrop-blur-sm" onClick={closeCommandPalette}>
      <div className="w-full max-w-xl bg-zinc-800 rounded-xl shadow-2xl border border-zinc-700 overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-3 px-4 py-3 border-b border-zinc-700">
          <Command size={18} className="text-zinc-500" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command..."
            className="flex-1 bg-transparent text-white placeholder-zinc-500 focus:outline-none"
            autoFocus
          />
        </div>

        <div className="max-h-80 overflow-y-auto">
          {results.map((cmd) => (
            <button
              key={cmd.id}
              onClick={() => handleSelect(cmd)}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-zinc-300 hover:bg-zinc-700/50"
            >
              <span className="text-zinc-500">{cmd.icon}</span>
              <span>{cmd.name}</span>
            </button>
          ))}
          {results.length === 0 && <p className="px-4 py-6 text-center text-zinc-500">No commands found</p>}
        </div>
      </div>
    </div>
  );
}
