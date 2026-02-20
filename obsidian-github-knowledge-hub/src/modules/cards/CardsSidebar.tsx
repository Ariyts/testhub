import { useMemo, useState } from 'react';
import { Plus, CheckCircle2, Circle, Tag } from 'lucide-react';
import { cn } from '@/utils/cn';
import { useWorkspaceStore } from '@/stores/useWorkspaceStore';

interface CardsSidebarProps {
  blockId: string;
}

export function CardsSidebar({ blockId }: CardsSidebarProps) {
  // ✅ FIXED: Select raw data, filter in useMemo
  const cardItems = useWorkspaceStore((s) => s.cardItems);
  const activeItemId = useWorkspaceStore((s) => s.activeItemId);
  const setActiveItem = useWorkspaceStore((s) => s.setActiveItem);
  const addCardItem = useWorkspaceStore((s) => s.addCardItem);
  const updateCardItem = useWorkspaceStore((s) => s.updateCardItem);
  
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');

  // ✅ FIXED: Filter in useMemo to avoid new array on every render
  const items = useMemo(
    () => cardItems.filter((i) => i.blockId === blockId),
    [cardItems, blockId]
  );

  const filteredItems = useMemo(() => {
    return items
      .filter((item) => {
        if (filter === 'active') return !item.completed;
        if (filter === 'completed') return item.completed;
        return true;
      })
      .sort((a, b) => a.order - b.order);
  }, [items, filter]);

  const handleCreate = () => {
    const item = addCardItem(blockId, { title: 'New Card', order: items.length });
    setActiveItem(item.id);
  };

  const stats = useMemo(() => {
    const total = items.length;
    const completed = items.filter((i) => i.completed).length;
    return { total, completed, active: total - completed };
  }, [items]);

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between px-3 py-2 border-b border-zinc-800">
        <span className="text-xs font-medium text-zinc-500 uppercase tracking-wide">Cards</span>
        <button onClick={handleCreate} className="p-1 rounded hover:bg-zinc-800 text-zinc-500 hover:text-zinc-300" title="New card">
          <Plus size={14} />
        </button>
      </div>
      
      <div className="flex items-center gap-1 px-3 py-2 border-b border-zinc-800">
        {(['all', 'active', 'completed'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              'px-2 py-1 text-xs rounded transition-colors',
              filter === f ? 'bg-zinc-800 text-zinc-200' : 'text-zinc-500 hover:text-zinc-300'
            )}
          >
            {f === 'all' ? `All (${stats.total})` : f === 'active' ? `Active (${stats.active})` : `Done (${stats.completed})`}
          </button>
        ))}
      </div>
      
      <div className="flex-1 overflow-y-auto py-2 px-2 space-y-1">
        {filteredItems.length === 0 ? (
          <div className="text-center py-8 text-zinc-600 text-xs">
            {filter === 'all' ? (
              <>
                No cards yet.<br />
                <button onClick={handleCreate} className="text-indigo-400 hover:text-indigo-300 mt-2">Create your first card</button>
              </>
            ) : `No ${filter} cards`}
          </div>
        ) : (
          filteredItems.map((item) => (
            <div
              key={item.id}
              className={cn(
                'group flex items-start gap-2 p-2 rounded-lg cursor-pointer transition-colors',
                activeItemId === item.id ? 'bg-zinc-800' : 'hover:bg-zinc-800/50'
              )}
              onClick={() => setActiveItem(item.id)}
            >
              <button
                onClick={(e) => { e.stopPropagation(); updateCardItem(item.id, { completed: !item.completed }); }}
                className="mt-0.5 flex-shrink-0"
              >
                {item.completed ? (
                  <CheckCircle2 size={16} className="text-emerald-500" />
                ) : (
                  <Circle size={16} className="text-zinc-600 hover:text-zinc-400" />
                )}
              </button>
              <div className="flex-1 min-w-0">
                <p className={cn('text-sm truncate', item.completed ? 'text-zinc-500 line-through' : 'text-zinc-200')}>
                  {item.title}
                </p>
                {item.tags.length > 0 && (
                  <div className="flex items-center gap-1 mt-1">
                    <Tag size={10} className="text-zinc-600" />
                    <span className="text-xs text-zinc-600 truncate">{item.tags.join(', ')}</span>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
