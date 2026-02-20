import { useState, useEffect, useMemo } from 'react';
import { FileText, Link2 } from 'lucide-react';
import { useWorkspaceStore } from '@/stores/useWorkspaceStore';
import { useUIStore } from '@/stores/useUIStore';

interface FoldersContentProps {
  blockId: string;
}

export function FoldersContent({ blockId }: FoldersContentProps) {
  const activeItemId = useWorkspaceStore((s) => s.activeItemId);
  const getFolderItem = useWorkspaceStore((s) => s.getFolderItem);
  const updateFolderItem = useWorkspaceStore((s) => s.updateFolderItem);
  // ✅ FIXED: Select raw data
  const folderItems = useWorkspaceStore((s) => s.folderItems);
  const setActiveItem = useWorkspaceStore((s) => s.setActiveItem);
  const backlinksOpen = useUIStore((s) => s.backlinksOpen);
  
  const item = activeItemId ? getFolderItem(activeItemId) : null;
  // ✅ FIXED: Filter in useMemo
  const allItems = useMemo(
    () => folderItems.filter((i) => i.blockId === blockId),
    [folderItems, blockId]
  );
  const notes = allItems.filter((i) => i.type === 'note');
  const [localContent, setLocalContent] = useState('');

  useEffect(() => {
    if (item) setLocalContent(item.content || '');
  }, [item?.id, item?.content]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (item && localContent !== item.content) {
        updateFolderItem(item.id, { content: localContent });
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [localContent, item?.id]);

  // Find backlinks
  const backlinks = notes.filter((n) => {
    if (n.id === item?.id) return false;
    const wikilinkRegex = /\[\[([^\]|]+)(?:\|[^\]]+)?\]\]/g;
    let match;
    while ((match = wikilinkRegex.exec(n.content || '')) !== null) {
      if (match[1].trim().toLowerCase() === item?.name.toLowerCase()) return true;
    }
    return false;
  });

  if (!item) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-zinc-500">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-600/20 flex items-center justify-center mb-4 border border-zinc-800">
          <FileText size={32} className="text-zinc-600" />
        </div>
        <h2 className="text-lg font-medium text-zinc-300 mb-1">No note selected</h2>
        <p className="text-sm text-zinc-600">Select a note from the sidebar</p>
      </div>
    );
  }

  if (item.type === 'folder') {
    const children = allItems.filter((i) => i.parentId === item.id);
    return (
      <div className="flex-1 p-8">
        <h1 className="text-2xl font-bold text-zinc-100 mb-6">{item.name}</h1>
        <div className="space-y-2">
          {children.length === 0 ? (
            <p className="text-zinc-500">This folder is empty</p>
          ) : (
            children.map((child) => (
              <button
                key={child.id}
                onClick={() => setActiveItem(child.id)}
                className="flex items-center gap-3 w-full p-3 rounded-lg bg-zinc-800/50 hover:bg-zinc-800 transition-colors"
              >
                <FileText size={18} className="text-zinc-500" />
                <span className="text-zinc-200">{child.name}</span>
              </button>
            ))
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex">
      <div className="flex-1 flex flex-col min-w-0">
        <div className="px-12 pt-10 pb-4">
          <input
            type="text"
            value={item.name}
            onChange={(e) => updateFolderItem(item.id, { name: e.target.value })}
            className="w-full bg-transparent text-3xl font-bold text-zinc-100 placeholder-zinc-600 focus:outline-none"
            placeholder="Untitled"
          />
          <div className="flex items-center gap-2 mt-2 text-sm text-zinc-600">
            <span>{new Date(item.updatedAt).toLocaleDateString()}</span>
            {item.tags.length > 0 && (
              <>
                <span>•</span>
                <div className="flex gap-1">
                  {item.tags.map((tag: string) => (
                    <span key={tag} className="text-indigo-400">#{tag}</span>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto px-12 pb-12">
          <textarea
            value={localContent}
            onChange={(e) => setLocalContent(e.target.value)}
            className="w-full h-full bg-transparent text-zinc-300 placeholder-zinc-600 focus:outline-none resize-none leading-relaxed"
            placeholder="Start writing..."
          />
        </div>
      </div>
      
      {backlinksOpen && (
        <aside className="w-64 border-l border-zinc-800 bg-zinc-900/50 flex flex-col">
          <div className="p-4 border-b border-zinc-800">
            <h3 className="text-sm font-medium text-zinc-400 flex items-center gap-2">
              <Link2 size={14} />
              Backlinks
            </h3>
          </div>
          <div className="flex-1 overflow-y-auto p-3">
            {backlinks.length === 0 ? (
              <p className="text-xs text-zinc-700">No backlinks found</p>
            ) : (
              <div className="space-y-1">
                {backlinks.map((linkedNote) => (
                  <button
                    key={linkedNote.id}
                    onClick={() => setActiveItem(linkedNote.id)}
                    className="w-full flex items-center gap-2 p-2 rounded text-left hover:bg-zinc-800 transition-colors"
                  >
                    <FileText size={12} className="text-zinc-600" />
                    <span className="text-xs text-zinc-400 truncate">{linkedNote.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </aside>
      )}
    </div>
  );
}
