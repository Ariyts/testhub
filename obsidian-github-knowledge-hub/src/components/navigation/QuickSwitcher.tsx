import { useState, useMemo } from 'react';
import { FileText, Search, LayoutGrid, Link, Terminal } from 'lucide-react';
import { useWorkspaceStore } from '@/stores/useWorkspaceStore';
import { useUIStore } from '@/stores/useUIStore';

export function QuickSwitcher() {
  const folderItems = useWorkspaceStore((s) => s.folderItems);
  const cardItems = useWorkspaceStore((s) => s.cardItems);
  const linkItems = useWorkspaceStore((s) => s.linkItems);
  const commandItems = useWorkspaceStore((s) => s.commandItems);
  const setActiveItem = useWorkspaceStore((s) => s.setActiveItem);
  const setActiveBlock = useWorkspaceStore((s) => s.setActiveBlock);
  
  const quickSwitcherOpen = useUIStore((s) => s.quickSwitcherOpen);
  const closeQuickSwitcher = useUIStore((s) => s.closeQuickSwitcher);
  
  const [query, setQuery] = useState('');

  const allItems = useMemo(() => {
    const items: { id: string; blockId: string; type: string; title: string }[] = [];
    
    folderItems.filter((i) => i.type === 'note').forEach((item) => {
      items.push({ id: item.id, blockId: item.blockId, type: 'note', title: item.name });
    });
    cardItems.forEach((item) => {
      items.push({ id: item.id, blockId: item.blockId, type: 'card', title: item.title });
    });
    linkItems.forEach((item) => {
      items.push({ id: item.id, blockId: item.blockId, type: 'link', title: item.title });
    });
    commandItems.forEach((item) => {
      items.push({ id: item.id, blockId: item.blockId, type: 'command', title: item.title });
    });
    
    return items;
  }, [folderItems, cardItems, linkItems, commandItems]);

  const results = useMemo(() => {
    if (!query) return allItems.slice(0, 10);
    const q = query.toLowerCase();
    return allItems.filter((i) => i.title.toLowerCase().includes(q)).slice(0, 10);
  }, [query, allItems]);

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
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] bg-black/60 backdrop-blur-sm" onClick={closeQuickSwitcher}>
      <div className="w-full max-w-xl bg-zinc-800 rounded-xl shadow-2xl border border-zinc-700 overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-3 px-4 py-3 border-b border-zinc-700">
          <Search size={18} className="text-zinc-500" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search..."
            className="flex-1 bg-transparent text-white placeholder-zinc-500 focus:outline-none"
            autoFocus
          />
        </div>

        <div className="max-h-80 overflow-y-auto">
          {results.map((item) => (
            <button
              key={item.id}
              onClick={() => { setActiveBlock(item.blockId); setActiveItem(item.id); closeQuickSwitcher(); }}
              className="w-full flex items-center gap-3 px-4 py-3 text-left text-zinc-300 hover:bg-zinc-700/50"
            >
              {getIcon(item.type)}
              <span className="truncate font-medium">{item.title}</span>
              <span className="text-xs text-zinc-600 uppercase ml-auto">{item.type}</span>
            </button>
          ))}
          {results.length === 0 && <p className="px-4 py-6 text-center text-zinc-500">No items found</p>}
        </div>
      </div>
    </div>
  );
}
