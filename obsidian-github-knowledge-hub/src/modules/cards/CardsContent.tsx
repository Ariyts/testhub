import { useState } from 'react';
import { CheckCircle2, Circle, Trash2, Flag, Tag, Calendar, X, Plus, LayoutGrid } from 'lucide-react';
import { cn } from '@/utils/cn';
import { useWorkspaceStore } from '@/stores/useWorkspaceStore';

interface CardsContentProps {
  blockId: string;
}

export function CardsContent({ blockId }: CardsContentProps) {
  const activeItemId = useWorkspaceStore((s) => s.activeItemId);
  const getCardItem = useWorkspaceStore((s) => s.getCardItem);
  const updateCardItem = useWorkspaceStore((s) => s.updateCardItem);
  const deleteCardItem = useWorkspaceStore((s) => s.deleteCardItem);
  const setActiveItem = useWorkspaceStore((s) => s.setActiveItem);
  
  const item = activeItemId ? getCardItem(activeItemId) : null;
  const [newTag, setNewTag] = useState('');

  if (!item) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-zinc-500">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-600/20 flex items-center justify-center mb-4 border border-zinc-800">
          <LayoutGrid size={32} className="text-zinc-600" />
        </div>
        <h2 className="text-lg font-medium text-zinc-300 mb-1">No card selected</h2>
        <p className="text-sm text-zinc-600">Select a card from the sidebar</p>
      </div>
    );
  }

  const handleAddTag = () => {
    if (newTag.trim() && !item.tags.includes(newTag.trim())) {
      updateCardItem(item.id, { tags: [...item.tags, newTag.trim()] });
      setNewTag('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    updateCardItem(item.id, { tags: item.tags.filter((t) => t !== tag) });
  };

  const handleDelete = () => {
    deleteCardItem(item.id);
    setActiveItem(null);
  };

  const priorities = [
    { value: 'low' as const, label: 'Low', color: 'bg-blue-500' },
    { value: 'medium' as const, label: 'Medium', color: 'bg-amber-500' },
    { value: 'high' as const, label: 'High', color: 'bg-red-500' },
  ];

  return (
    <div className="flex-1 p-8 max-w-2xl mx-auto">
      <div className="flex items-start gap-4 mb-6">
        <button onClick={() => updateCardItem(item.id, { completed: !item.completed })} className="mt-1">
          {item.completed ? (
            <CheckCircle2 size={28} className="text-emerald-500" />
          ) : (
            <Circle size={28} className="text-zinc-600 hover:text-zinc-400" />
          )}
        </button>
        
        <div className="flex-1">
          <input
            type="text"
            value={item.title}
            onChange={(e) => updateCardItem(item.id, { title: e.target.value })}
            className={cn('w-full bg-transparent text-2xl font-bold placeholder-zinc-600 focus:outline-none', item.completed ? 'text-zinc-500 line-through' : 'text-zinc-100')}
            placeholder="Card title"
          />
          <p className="text-sm text-zinc-600 mt-1">Created {new Date(item.createdAt).toLocaleDateString()}</p>
        </div>
        
        <button onClick={handleDelete} className="p-2 rounded-lg text-zinc-600 hover:text-red-400 hover:bg-zinc-800 transition-colors">
          <Trash2 size={18} />
        </button>
      </div>
      
      <div className="space-y-6">
        <div>
          <label className="block text-xs font-medium text-zinc-500 uppercase tracking-wide mb-2">Description</label>
          <textarea
            value={item.content}
            onChange={(e) => updateCardItem(item.id, { content: e.target.value })}
            placeholder="Add a description..."
            rows={4}
            className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg p-3 text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-zinc-600 resize-none"
          />
        </div>
        
        <div>
          <label className="block text-xs font-medium text-zinc-500 uppercase tracking-wide mb-2">
            <Flag size={12} className="inline mr-1" />Priority
          </label>
          <div className="flex gap-2">
            {priorities.map((p) => (
              <button
                key={p.value}
                onClick={() => updateCardItem(item.id, { priority: p.value })}
                className={cn('flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-colors text-sm', item.priority === p.value ? 'bg-zinc-800 border-zinc-600 text-zinc-200' : 'border-zinc-800 text-zinc-500 hover:border-zinc-700')}
              >
                <div className={cn('w-2 h-2 rounded-full', p.color)} />
                {p.label}
              </button>
            ))}
          </div>
        </div>
        
        <div>
          <label className="block text-xs font-medium text-zinc-500 uppercase tracking-wide mb-2">
            <Calendar size={12} className="inline mr-1" />Due Date
          </label>
          <input
            type="date"
            value={item.dueDate || ''}
            onChange={(e) => updateCardItem(item.id, { dueDate: e.target.value || undefined })}
            className="bg-zinc-800/50 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-200 focus:outline-none focus:border-zinc-600"
          />
        </div>
        
        <div>
          <label className="block text-xs font-medium text-zinc-500 uppercase tracking-wide mb-2">
            <Tag size={12} className="inline mr-1" />Tags
          </label>
          <div className="flex flex-wrap gap-2 mb-2">
            {item.tags.map((tag) => (
              <span key={tag} className="flex items-center gap-1 px-2 py-1 rounded-full bg-zinc-800 text-sm text-zinc-300">
                #{tag}
                <button onClick={() => handleRemoveTag(tag)} className="p-0.5 hover:text-red-400"><X size={12} /></button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
              placeholder="Add tag..."
              className="flex-1 bg-zinc-800/50 border border-zinc-700 rounded-lg px-3 py-1.5 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-zinc-600"
            />
            <button onClick={handleAddTag} className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-sm text-zinc-300 transition-colors">
              <Plus size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
