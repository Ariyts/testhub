import { useState, useEffect, useMemo, useRef } from 'react';
import { FileText, Plus, Search, LayoutGrid, Link, Terminal } from 'lucide-react';
import Fuse from 'fuse.js';
import { cn } from '@/utils/cn';
import { useWorkspaceStore } from '@/stores/useWorkspaceStore';
import { useUIStore } from '@/stores/useUIStore';

interface SearchItem {
  id: string;
  blockId: string;
  type: 'note' | 'card' | 'link' | 'command';
  title: string;
  subtitle?: string;
}

export function QuickSwitcher() {
  const folderItems = useWorkspaceStore((s) => s.folderItems);
  const cardItems = useWorkspaceStore((s) => s.cardItems);
  const linkItems = useWorkspaceStore((s) => s.linkItems);
  const commandItems = useWorkspaceStore((s) => s.commandItems);
  const setActiveItem = useWorkspaceStore((s) => s.setActiveItem);
  const setActiveBlock = useWorkspaceStore((s) => s.setActiveBlock);
  const addFolderItem = useWorkspaceStore((s) => s.addFolderItem);
  const activeBlockId = useWorkspaceStore((s) => s.activeBlockId);
  
  const quickSwitcherOpen = useUIStore((s) => s.quickSwitcherOpen);
  const closeQuickSwitcher = useUIStore((s) => s.closeQuickSwitcher);
  
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Build searchable items
  const allItems: SearchItem[] = useMemo(() => {
    const items: SearchItem[] = [];
    
    folderItems.filter((i) => i.type === 'note').forEach((item) => {
      items.push({
        id: item.id,
        blockId: item.blockId,
        type: 'note',
        title: item.name,
        subtitle: item.tags.join(', '),
      });
    });
    
    cardItems.forEach((item) => {
      items.push({
        id: item.id,
        blockId: item.blockId,
        type: 'card',
        title: item.title,
        subtitle: item.tags.join(', '),
      });
    });
    
    linkItems.forEach((item) => {
      items.push({
        id: item.id,
        blockId: item.blockId,
        type: 'link',
        title: item.title,
        subtitle: item.url,
      });
    });
    
    commandItems.forEach((item) => {
      items.push({
        id: item.id,
        blockId: item.blockId,
        type: 'command',
        title: item.title,
        subtitle: item.command,
      });
    });
    
    return items;
  }, [folderItems, cardItems, linkItems, commandItems]);

  const fuse = useMemo(
    () => new Fuse(allItems, {
      keys: ['title', 'subtitle'],
      threshold: 0.4,
    }),
    [allItems]
  );

  const results = useMemo(() => {
    if (!query) return allItems.slice(0, 10);
    return fuse.search(query).slice(0, 10).map((r) => r.item);
  }, [query, fuse, allItems]);

  useEffect(() => {
    if (quickSwitcherOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [quickSwitcherOpen]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const handleSelect = (item: SearchItem) => {
    setActiveBlock(item.blockId);
    setActiveItem(item.id);
    closeQuickSwitcher();
  };

  const handleCreate = () => {
    if (activeBlockId) {
      const note = addFolderItem(activeBlockId, { 
        name: query || 'Untitled', 
        type: 'note' 
      });
      setActiveItem(note.id);
    }
    closeQuickSwitcher();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((i) => Math.min(i + 1, results.length));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((i) => Math.max(i - 1, 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex === results.length) {
          handleCreate();
        } else if (results[selectedIndex]) {
          handleSelect(results[selectedIndex]);
        }
        break;
      case 'Escape':
        closeQuickSwitcher();
        break;
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'note': return <FileText size={14} className="text-zinc-500" />;
      case 'card': return <LayoutGrid size={14} className="text-purple-400" />;
      case 'link': return <Link size={14} className="text-cyan-400" />;
      case 'command': return <Terminal size={14} className="text-emerald-400" />;
      default: return <FileText size={14} />;
    }
  };

  if (!quickSwitcherOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] bg-black/60 backdrop-blur-sm"
      onClick={closeQuickSwitcher}
    >
      <div
        className="w-full max-w-xl bg-zinc-800 rounded-xl shadow-2xl border border-zinc-700 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 px-4 py-3 border-b border-zinc-700">
          <Search size={18} className="text-zinc-500" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search notes, cards, links..."
            className="flex-1 bg-transparent text-white placeholder-zinc-500 focus:outline-none"
          />
          <span className="text-xs text-zinc-600 bg-zinc-700/50 px-2 py-1 rounded">ESC</span>
        </div>

        <div className="max-h-80 overflow-y-auto">
          {results.map((item, index) => (
            <button
              key={item.id}
              onClick={() => handleSelect(item)}
              className={cn(
                'w-full flex items-center gap-3 px-4 py-3 text-left transition-colors',
                selectedIndex === index
                  ? 'bg-indigo-500/20 text-white'
                  : 'text-zinc-300 hover:bg-zinc-700/50'
              )}
            >
              {getIcon(item.type)}
              <div className="flex-1 min-w-0">
                <p className="truncate font-medium">{item.title}</p>
                {item.subtitle && (
                  <p className="text-xs text-zinc-500 truncate">{item.subtitle}</p>
                )}
              </div>
              <span className="text-xs text-zinc-600 uppercase">{item.type}</span>
            </button>
          ))}

          {query && activeBlockId && (
            <button
              onClick={handleCreate}
              className={cn(
                'w-full flex items-center gap-3 px-4 py-3 text-left transition-colors',
                selectedIndex === results.length
                  ? 'bg-indigo-500/20 text-white'
                  : 'text-zinc-300 hover:bg-zinc-700/50'
              )}
            >
              <Plus size={14} className="text-indigo-400" />
              <span>
                Create <span className="font-medium">"{query}"</span>
              </span>
            </button>
          )}

          {results.length === 0 && !query && (
            <p className="px-4 py-6 text-center text-zinc-500">No items yet</p>
          )}
        </div>

        <div className="px-4 py-2 border-t border-zinc-700 flex items-center gap-4 text-xs text-zinc-500">
          <span><kbd className="bg-zinc-700 px-1.5 py-0.5 rounded">↑↓</kbd> Navigate</span>
          <span><kbd className="bg-zinc-700 px-1.5 py-0.5 rounded">↵</kbd> Select</span>
          <span><kbd className="bg-zinc-700 px-1.5 py-0.5 rounded">Esc</kbd> Close</span>
        </div>
      </div>
    </div>
  );
}
