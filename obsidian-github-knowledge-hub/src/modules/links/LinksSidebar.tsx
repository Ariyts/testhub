import { useMemo, useState } from 'react';
import { Plus, ExternalLink, Globe } from 'lucide-react';
import { cn } from '@/utils/cn';
import { useWorkspaceStore } from '@/stores/useWorkspaceStore';

interface LinksSidebarProps {
  blockId: string;
}

export function LinksSidebar({ blockId }: LinksSidebarProps) {
  const items = useWorkspaceStore((s) => s.getLinkItemsByBlock(blockId));
  const activeItemId = useWorkspaceStore((s) => s.activeItemId);
  const setActiveItem = useWorkspaceStore((s) => s.setActiveItem);
  const addLinkItem = useWorkspaceStore((s) => s.addLinkItem);
  
  const [searchQuery, setSearchQuery] = useState('');

  const filteredItems = useMemo(() => {
    if (!searchQuery) return items;
    const q = searchQuery.toLowerCase();
    return items.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.url.toLowerCase().includes(q) ||
        item.tags.some((t) => t.toLowerCase().includes(q)) ||
        item.category?.toLowerCase().includes(q)
    );
  }, [items, searchQuery]);

  // Group by category
  const grouped = useMemo(() => {
    const groups: Record<string, typeof items> = {};
    filteredItems.forEach((item) => {
      const category = item.category || 'Uncategorized';
      if (!groups[category]) groups[category] = [];
      groups[category].push(item);
    });
    return groups;
  }, [filteredItems]);

  const handleCreate = () => {
    const item = addLinkItem(blockId, { 
      title: 'New Link',
      order: items.length,
    });
    setActiveItem(item.id);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-zinc-800">
        <span className="text-xs font-medium text-zinc-500 uppercase tracking-wide">Links</span>
        <button
          onClick={handleCreate}
          className="p-1 rounded hover:bg-zinc-800 text-zinc-500 hover:text-zinc-300"
          title="New link"
        >
          <Plus size={14} />
        </button>
      </div>
      
      {/* Search */}
      <div className="px-2 py-2 border-b border-zinc-800">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search links..."
          className="w-full bg-zinc-800/50 border border-zinc-700 rounded px-2 py-1 text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-zinc-600"
        />
      </div>
      
      {/* Links list */}
      <div className="flex-1 overflow-y-auto py-2">
        {filteredItems.length === 0 ? (
          <div className="text-center py-8 text-zinc-600 text-xs">
            {searchQuery ? (
              'No links found'
            ) : (
              <>
                No links yet.<br />
                <button
                  onClick={handleCreate}
                  className="text-indigo-400 hover:text-indigo-300 mt-2"
                >
                  Add your first link
                </button>
              </>
            )}
          </div>
        ) : (
          Object.entries(grouped).map(([category, categoryItems]) => (
            <div key={category} className="mb-3">
              <div className="px-3 py-1 text-xs font-medium text-zinc-600 uppercase tracking-wide">
                {category}
              </div>
              <div className="space-y-0.5 px-2">
                {categoryItems.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => setActiveItem(item.id)}
                    className={cn(
                      'group flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors',
                      activeItemId === item.id
                        ? 'bg-zinc-800'
                        : 'hover:bg-zinc-800/50'
                    )}
                  >
                    <Globe size={14} className="text-zinc-500 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-zinc-200 truncate">{item.title}</p>
                      <p className="text-xs text-zinc-600 truncate">{item.url}</p>
                    </div>
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:bg-zinc-700 rounded text-zinc-500 hover:text-zinc-300"
                    >
                      <ExternalLink size={12} />
                    </a>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
