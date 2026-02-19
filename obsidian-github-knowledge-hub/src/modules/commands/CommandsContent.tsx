import { useState } from 'react';
import { 
  Terminal, 
  Trash2, 
  Tag,
  FolderOpen,
  X,
  Plus,
  Copy,
  Check,
  Hash
} from 'lucide-react';
import { cn } from '@/utils/cn';
import { useWorkspaceStore } from '@/stores/useWorkspaceStore';

interface CommandsContentProps {
  blockId: string;
}

export function CommandsContent({ blockId }: CommandsContentProps) {
  const activeItemId = useWorkspaceStore((s) => s.activeItemId);
  const getCommandItem = useWorkspaceStore((s) => s.getCommandItem);
  const updateCommandItem = useWorkspaceStore((s) => s.updateCommandItem);
  const deleteCommandItem = useWorkspaceStore((s) => s.deleteCommandItem);
  const setActiveItem = useWorkspaceStore((s) => s.setActiveItem);
  const getCommandItemsByBlock = useWorkspaceStore((s) => s.getCommandItemsByBlock);
  
  const item = activeItemId ? getCommandItem(activeItemId) : null;
  const allItems = getCommandItemsByBlock(blockId);
  const [newTag, setNewTag] = useState('');
  const [copied, setCopied] = useState(false);

  // Get unique categories
  const categories = [...new Set(allItems.map((i) => i.category).filter(Boolean))] as string[];

  if (!item) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-zinc-500">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-green-600/20 flex items-center justify-center mb-4 border border-zinc-800">
          <Terminal size={32} className="text-zinc-600" />
        </div>
        <h2 className="text-lg font-medium text-zinc-300 mb-1">No command selected</h2>
        <p className="text-sm text-zinc-600">Select a command from the sidebar or create a new one</p>
      </div>
    );
  }

  const handleAddTag = () => {
    if (newTag.trim() && !item.tags.includes(newTag.trim())) {
      updateCommandItem(item.id, { tags: [...item.tags, newTag.trim()] });
      setNewTag('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    updateCommandItem(item.id, { tags: item.tags.filter((t) => t !== tag) });
  };

  const handleDelete = () => {
    deleteCommandItem(item.id);
    setActiveItem(null);
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(item.command);
    setCopied(true);
    updateCommandItem(item.id, { copyCount: item.copyCount + 1 });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex-1 p-8 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-start gap-4 mb-6">
        <div className="w-12 h-12 rounded-xl bg-zinc-800 flex items-center justify-center flex-shrink-0">
          <Terminal size={24} className="text-emerald-400" />
        </div>
        
        <div className="flex-1">
          <input
            type="text"
            value={item.title}
            onChange={(e) => updateCommandItem(item.id, { title: e.target.value })}
            className="w-full bg-transparent text-2xl font-bold text-zinc-100 placeholder-zinc-600 focus:outline-none"
            placeholder="Command name"
          />
          <p className="text-sm text-zinc-600 mt-1">
            Copied {item.copyCount} times
          </p>
        </div>
        
        <button
          onClick={handleDelete}
          className="p-2 rounded-lg text-zinc-600 hover:text-red-400 hover:bg-zinc-800 transition-colors"
        >
          <Trash2 size={18} />
        </button>
      </div>
      
      {/* Content */}
      <div className="space-y-6">
        {/* Command */}
        <div>
          <label className="block text-xs font-medium text-zinc-500 uppercase tracking-wide mb-2">
            <Hash size={12} className="inline mr-1" />
            Command
          </label>
          <div className="relative">
            <textarea
              value={item.command}
              onChange={(e) => updateCommandItem(item.id, { command: e.target.value })}
              placeholder="Enter your command..."
              rows={4}
              className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-4 pr-12 text-emerald-300 placeholder-zinc-600 focus:outline-none focus:border-zinc-600 font-mono text-sm resize-none"
            />
            <button
              onClick={handleCopy}
              className={cn(
                'absolute top-3 right-3 p-2 rounded-lg transition-colors',
                copied
                  ? 'bg-emerald-500/20 text-emerald-400'
                  : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200'
              )}
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
            </button>
          </div>
        </div>
        
        {/* Description */}
        <div>
          <label className="block text-xs font-medium text-zinc-500 uppercase tracking-wide mb-2">
            Description
          </label>
          <textarea
            value={item.description || ''}
            onChange={(e) => updateCommandItem(item.id, { description: e.target.value })}
            placeholder="What does this command do?"
            rows={3}
            className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg p-3 text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-zinc-600 resize-none"
          />
        </div>
        
        {/* Category */}
        <div>
          <label className="block text-xs font-medium text-zinc-500 uppercase tracking-wide mb-2">
            <FolderOpen size={12} className="inline mr-1" />
            Category
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={item.category || ''}
              onChange={(e) => updateCommandItem(item.id, { category: e.target.value })}
              placeholder="Enter category..."
              className="flex-1 bg-zinc-800/50 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-zinc-600"
              list="command-categories"
            />
            <datalist id="command-categories">
              {categories.map((cat) => (
                <option key={cat} value={cat} />
              ))}
            </datalist>
          </div>
        </div>
        
        {/* Tags */}
        <div>
          <label className="block text-xs font-medium text-zinc-500 uppercase tracking-wide mb-2">
            <Tag size={12} className="inline mr-1" />
            Tags
          </label>
          <div className="flex flex-wrap gap-2 mb-2">
            {item.tags.map((tag) => (
              <span
                key={tag}
                className="flex items-center gap-1 px-2 py-1 rounded-full bg-zinc-800 text-sm text-zinc-300"
              >
                #{tag}
                <button
                  onClick={() => handleRemoveTag(tag)}
                  className="p-0.5 hover:text-red-400"
                >
                  <X size={12} />
                </button>
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
            <button
              onClick={handleAddTag}
              className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-sm text-zinc-300 transition-colors"
            >
              <Plus size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
