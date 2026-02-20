import { useState } from 'react';
import { ExternalLink, Trash2, Globe, Tag, X, Plus, Link } from 'lucide-react';
import { useWorkspaceStore } from '@/stores/useWorkspaceStore';

interface LinksContentProps {
  blockId: string;
}

export function LinksContent({ blockId }: LinksContentProps) {
  const activeItemId = useWorkspaceStore((s) => s.activeItemId);
  const getLinkItem = useWorkspaceStore((s) => s.getLinkItem);
  const updateLinkItem = useWorkspaceStore((s) => s.updateLinkItem);
  const deleteLinkItem = useWorkspaceStore((s) => s.deleteLinkItem);
  const setActiveItem = useWorkspaceStore((s) => s.setActiveItem);
  const getLinkItemsByBlock = useWorkspaceStore((s) => s.getLinkItemsByBlock);
  
  const item = activeItemId ? getLinkItem(activeItemId) : null;
  const [newTag, setNewTag] = useState('');

  if (!item) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-zinc-500">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 flex items-center justify-center mb-4 border border-zinc-800">
          <Link size={32} className="text-zinc-600" />
        </div>
        <h2 className="text-lg font-medium text-zinc-300 mb-1">No link selected</h2>
        <p className="text-sm text-zinc-600">Select a link from the sidebar</p>
      </div>
    );
  }

  const handleAddTag = () => {
    if (newTag.trim() && !item.tags.includes(newTag.trim())) {
      updateLinkItem(item.id, { tags: [...item.tags, newTag.trim()] });
      setNewTag('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    updateLinkItem(item.id, { tags: item.tags.filter((t) => t !== tag) });
  };

  const handleDelete = () => {
    deleteLinkItem(item.id);
    setActiveItem(null);
  };

  return (
    <div className="flex-1 p-8 max-w-2xl mx-auto">
      <div className="flex items-start gap-4 mb-6">
        <div className="w-12 h-12 rounded-xl bg-zinc-800 flex items-center justify-center flex-shrink-0">
          <Globe size={24} className="text-cyan-400" />
        </div>
        <div className="flex-1">
          <input
            type="text"
            value={item.title}
            onChange={(e) => updateLinkItem(item.id, { title: e.target.value })}
            className="w-full bg-transparent text-2xl font-bold text-zinc-100 placeholder-zinc-600 focus:outline-none"
            placeholder="Link title"
          />
          <p className="text-sm text-zinc-600 mt-1">Added {new Date(item.createdAt).toLocaleDateString()}</p>
        </div>
        <button onClick={handleDelete} className="p-2 rounded-lg text-zinc-600 hover:text-red-400 hover:bg-zinc-800 transition-colors">
          <Trash2 size={18} />
        </button>
      </div>
      
      <div className="space-y-6">
        <div>
          <label className="block text-xs font-medium text-zinc-500 uppercase tracking-wide mb-2">
            <ExternalLink size={12} className="inline mr-1" />URL
          </label>
          <div className="flex gap-2">
            <input
              type="url"
              value={item.url}
              onChange={(e) => updateLinkItem(item.id, { url: e.target.value })}
              placeholder="https://..."
              className="flex-1 bg-zinc-800/50 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-zinc-600"
            />
            {item.url && (
              <a href={item.url} target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 rounded-lg transition-colors flex items-center gap-2">
                <ExternalLink size={16} />Open
              </a>
            )}
          </div>
        </div>
        
        <div>
          <label className="block text-xs font-medium text-zinc-500 uppercase tracking-wide mb-2">Description</label>
          <textarea
            value={item.description || ''}
            onChange={(e) => updateLinkItem(item.id, { description: e.target.value })}
            placeholder="Add a description..."
            rows={3}
            className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg p-3 text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-zinc-600 resize-none"
          />
        </div>
        
        <div>
          <label className="block text-xs font-medium text-zinc-500 uppercase tracking-wide mb-2">Category</label>
          <input
            type="text"
            value={item.category || ''}
            onChange={(e) => updateLinkItem(item.id, { category: e.target.value })}
            placeholder="Enter category..."
            className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-zinc-600"
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
