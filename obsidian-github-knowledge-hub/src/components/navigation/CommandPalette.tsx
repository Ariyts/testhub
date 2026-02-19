import { useState, useEffect, useMemo, useRef } from 'react';
import {
  Command,
  Settings,
  Network,
  Moon,
  Sun,
  Link2,
  Folder,
  LayoutGrid,
  Link,
  Terminal,
} from 'lucide-react';
import Fuse from 'fuse.js';
import { cn } from '@/utils/cn';
import { useWorkspaceStore } from '@/stores/useWorkspaceStore';
import { useUIStore } from '@/stores/useUIStore';

interface CommandItem {
  id: string;
  name: string;
  shortcut?: string;
  icon: React.ReactNode;
  action: () => void;
  category: string;
}

export function CommandPalette() {
  const addBlock = useWorkspaceStore((s) => s.addBlock);
  const activeWorkspaceId = useWorkspaceStore((s) => s.activeWorkspaceId);
  const setActiveBlock = useWorkspaceStore((s) => s.setActiveBlock);
  
  const commandPaletteOpen = useUIStore((s) => s.commandPaletteOpen);
  const closeCommandPalette = useUIStore((s) => s.closeCommandPalette);
  const openSettings = useUIStore((s) => s.openSettings);
  const toggleGraph = useUIStore((s) => s.toggleGraph);
  const toggleBacklinks = useUIStore((s) => s.toggleBacklinks);
  const toggleSecondPanel = useUIStore((s) => s.toggleSecondPanel);
  const theme = useUIStore((s) => s.theme);
  const updateTheme = useUIStore((s) => s.updateTheme);
  
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const commands: CommandItem[] = useMemo(
    () => [
      {
        id: 'new-notes-block',
        name: 'Create Notes Block',
        icon: <Folder size={16} />,
        category: 'Create',
        action: () => {
          if (activeWorkspaceId) {
            const block = addBlock('folders', activeWorkspaceId);
            setActiveBlock(block.id);
          }
        },
      },
      {
        id: 'new-cards-block',
        name: 'Create Cards Block',
        icon: <LayoutGrid size={16} />,
        category: 'Create',
        action: () => {
          if (activeWorkspaceId) {
            const block = addBlock('cards', activeWorkspaceId);
            setActiveBlock(block.id);
          }
        },
      },
      {
        id: 'new-links-block',
        name: 'Create Links Block',
        icon: <Link size={16} />,
        category: 'Create',
        action: () => {
          if (activeWorkspaceId) {
            const block = addBlock('links', activeWorkspaceId);
            setActiveBlock(block.id);
          }
        },
      },
      {
        id: 'new-commands-block',
        name: 'Create Commands Block',
        icon: <Terminal size={16} />,
        category: 'Create',
        action: () => {
          if (activeWorkspaceId) {
            const block = addBlock('commands', activeWorkspaceId);
            setActiveBlock(block.id);
          }
        },
      },
      {
        id: 'toggle-graph',
        name: 'Toggle Graph View',
        shortcut: '⌘G',
        icon: <Network size={16} />,
        category: 'View',
        action: toggleGraph,
      },
      {
        id: 'toggle-sidebar',
        name: 'Toggle Sidebar',
        shortcut: '⌘\\',
        icon: <Command size={16} />,
        category: 'View',
        action: toggleSecondPanel,
      },
      {
        id: 'toggle-backlinks',
        name: 'Toggle Backlinks Panel',
        shortcut: '⌘⇧B',
        icon: <Link2 size={16} />,
        category: 'View',
        action: toggleBacklinks,
      },
      {
        id: 'toggle-theme',
        name: theme.mode === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode',
        icon: theme.mode === 'dark' ? <Sun size={16} /> : <Moon size={16} />,
        category: 'Settings',
        action: () => {
          updateTheme({ mode: theme.mode === 'dark' ? 'light' : 'dark' });
        },
      },
      {
        id: 'open-settings',
        name: 'Open Settings',
        shortcut: '⌘,',
        icon: <Settings size={16} />,
        category: 'Settings',
        action: openSettings,
      },
    ],
    [activeWorkspaceId, addBlock, setActiveBlock, toggleGraph, toggleSecondPanel, toggleBacklinks, theme.mode, updateTheme, openSettings]
  );

  const fuse = useMemo(
    () => new Fuse(commands, { keys: ['name', 'category'], threshold: 0.4 }),
    [commands]
  );

  const results = useMemo(() => {
    if (!query) return commands;
    return fuse.search(query).map((r) => r.item);
  }, [query, fuse, commands]);

  useEffect(() => {
    if (commandPaletteOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [commandPaletteOpen]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const handleSelect = (command: CommandItem) => {
    command.action();
    closeCommandPalette();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((i) => Math.min(i + 1, results.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((i) => Math.max(i - 1, 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (results[selectedIndex]) {
          handleSelect(results[selectedIndex]);
        }
        break;
      case 'Escape':
        closeCommandPalette();
        break;
    }
  };

  if (!commandPaletteOpen) return null;

  // Group commands by category
  const groupedCommands: Record<string, CommandItem[]> = {};
  results.forEach((cmd) => {
    const category = cmd.category || 'Other';
    if (!groupedCommands[category]) groupedCommands[category] = [];
    groupedCommands[category].push(cmd);
  });

  let flatIndex = 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] bg-black/60 backdrop-blur-sm"
      onClick={closeCommandPalette}
    >
      <div
        className="w-full max-w-xl bg-zinc-800 rounded-xl shadow-2xl border border-zinc-700 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 px-4 py-3 border-b border-zinc-700">
          <Command size={18} className="text-zinc-500" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a command..."
            className="flex-1 bg-transparent text-white placeholder-zinc-500 focus:outline-none"
          />
        </div>

        <div className="max-h-80 overflow-y-auto">
          {Object.entries(groupedCommands).map(([category, cmds]) => (
            <div key={category}>
              <div className="px-4 py-2 text-xs font-medium text-zinc-500 uppercase tracking-wide bg-zinc-800/50">
                {category}
              </div>
              {cmds.map((cmd) => {
                const currentIndex = flatIndex++;
                return (
                  <button
                    key={cmd.id}
                    onClick={() => handleSelect(cmd)}
                    className={cn(
                      'w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors',
                      selectedIndex === currentIndex
                        ? 'bg-indigo-500/20 text-white'
                        : 'text-zinc-300 hover:bg-zinc-700/50'
                    )}
                  >
                    <span className="text-zinc-500">{cmd.icon}</span>
                    <span className="flex-1">{cmd.name}</span>
                    {cmd.shortcut && (
                      <span className="text-xs text-zinc-600 bg-zinc-700/50 px-2 py-0.5 rounded">
                        {cmd.shortcut}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}

          {results.length === 0 && (
            <p className="px-4 py-6 text-center text-zinc-500">No commands found</p>
          )}
        </div>
      </div>
    </div>
  );
}
