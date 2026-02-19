import { useState, useMemo } from 'react';
import {
  FileText,
  Folder,
  FolderOpen,
  ChevronRight,
  ChevronDown,
  Plus,
  MoreHorizontal,
  Trash2,
  Edit3,
} from 'lucide-react';
import { cn } from '@/utils/cn';
import { useWorkspaceStore } from '@/stores/useWorkspaceStore';
import { FolderItem } from '@/types';

interface FoldersSidebarProps {
  blockId: string;
}

export function FoldersSidebar({ blockId }: FoldersSidebarProps) {
  const items = useWorkspaceStore((s) => s.getFolderItemsByBlock(blockId));
  const activeItemId = useWorkspaceStore((s) => s.activeItemId);
  const setActiveItem = useWorkspaceStore((s) => s.setActiveItem);
  const addFolderItem = useWorkspaceStore((s) => s.addFolderItem);
  const deleteFolderItem = useWorkspaceStore((s) => s.deleteFolderItem);
  const updateFolderItem = useWorkspaceStore((s) => s.updateFolderItem);
  
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [contextMenu, setContextMenu] = useState<{ id: string; x: number; y: number } | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  // Build tree structure
  const tree = useMemo(() => {
    const rootItems: FolderItem[] = [];
    const childrenMap: Record<string, FolderItem[]> = {};
    
    items.forEach((item) => {
      if (item.parentId) {
        if (!childrenMap[item.parentId]) {
          childrenMap[item.parentId] = [];
        }
        childrenMap[item.parentId].push(item);
      } else {
        rootItems.push(item);
      }
    });
    
    // Sort by order and then by name
    const sort = (arr: FolderItem[]) => 
      arr.sort((a, b) => {
        if (a.type !== b.type) return a.type === 'folder' ? -1 : 1;
        return a.order - b.order || a.name.localeCompare(b.name);
      });
    
    sort(rootItems);
    Object.values(childrenMap).forEach(sort);
    
    return { rootItems, childrenMap };
  }, [items]);

  const toggleFolder = (id: string) => {
    setExpandedFolders((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleCreateNote = (parentId: string | null = null) => {
    const item = addFolderItem(blockId, { 
      type: 'note', 
      name: 'Untitled',
      parentId,
      order: items.length,
    });
    setActiveItem(item.id);
    setEditingId(item.id);
    setEditingName(item.name);
    if (parentId) {
      setExpandedFolders((prev) => new Set(prev).add(parentId));
    }
  };

  const handleCreateFolder = (parentId: string | null = null) => {
    const item = addFolderItem(blockId, { 
      type: 'folder', 
      name: 'New Folder',
      parentId,
      order: items.length,
    });
    setEditingId(item.id);
    setEditingName(item.name);
    if (parentId) {
      setExpandedFolders((prev) => new Set(prev).add(parentId));
    }
  };

  const handleRename = (id: string) => {
    if (editingName.trim()) {
      updateFolderItem(id, { name: editingName.trim() });
    }
    setEditingId(null);
    setEditingName('');
  };

  const handleContextMenu = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    setContextMenu({ id, x: e.clientX, y: e.clientY });
  };

  const closeContextMenu = () => setContextMenu(null);

  const renderItem = (item: FolderItem, depth: number = 0) => {
    const children = tree.childrenMap[item.id] || [];
    const isExpanded = expandedFolders.has(item.id);
    const isActive = activeItemId === item.id;
    const isEditing = editingId === item.id;

    return (
      <div key={item.id}>
        <div
          className={cn(
            'group flex items-center gap-1 py-1 px-2 rounded-md text-sm cursor-pointer transition-colors',
            isActive
              ? 'bg-zinc-800 text-zinc-100'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
          )}
          style={{ paddingLeft: `${depth * 12 + 8}px` }}
          onClick={() => {
            if (item.type === 'folder') {
              toggleFolder(item.id);
            } else {
              setActiveItem(item.id);
            }
          }}
          onContextMenu={(e) => handleContextMenu(e, item.id)}
        >
          {item.type === 'folder' ? (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFolder(item.id);
                }}
                className="p-0.5 hover:bg-zinc-700 rounded"
              >
                {isExpanded ? (
                  <ChevronDown size={12} className="text-zinc-500" />
                ) : (
                  <ChevronRight size={12} className="text-zinc-500" />
                )}
              </button>
              {isExpanded ? (
                <FolderOpen size={14} className="text-amber-400/70" />
              ) : (
                <Folder size={14} className="text-amber-400/70" />
              )}
            </>
          ) : (
            <>
              <span className="w-4" />
              <FileText size={14} className="text-zinc-500" />
            </>
          )}
          
          {isEditing ? (
            <input
              type="text"
              value={editingName}
              onChange={(e) => setEditingName(e.target.value)}
              onBlur={() => handleRename(item.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleRename(item.id);
                if (e.key === 'Escape') setEditingId(null);
              }}
              className="flex-1 bg-zinc-700 px-1 py-0.5 rounded text-xs outline-none"
              autoFocus
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <span className="flex-1 truncate text-xs">{item.name}</span>
          )}
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleContextMenu(e, item.id);
            }}
            className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-zinc-700 rounded"
          >
            <MoreHorizontal size={12} />
          </button>
        </div>
        
        {item.type === 'folder' && isExpanded && (
          <div>
            {children.map((child) => renderItem(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-zinc-800">
        <span className="text-xs font-medium text-zinc-500 uppercase tracking-wide">Files</span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => handleCreateFolder(null)}
            className="p-1 rounded hover:bg-zinc-800 text-zinc-500 hover:text-zinc-300"
            title="New folder"
          >
            <Folder size={14} />
          </button>
          <button
            onClick={() => handleCreateNote(null)}
            className="p-1 rounded hover:bg-zinc-800 text-zinc-500 hover:text-zinc-300"
            title="New note"
          >
            <Plus size={14} />
          </button>
        </div>
      </div>
      
      {/* File tree */}
      <div className="flex-1 overflow-y-auto py-2 px-1">
        {tree.rootItems.length === 0 ? (
          <div className="text-center py-8 text-zinc-600 text-xs">
            No notes yet.<br />
            <button
              onClick={() => handleCreateNote(null)}
              className="text-indigo-400 hover:text-indigo-300 mt-2"
            >
              Create your first note
            </button>
          </div>
        ) : (
          tree.rootItems.map((item) => renderItem(item))
        )}
      </div>
      
      {/* Context Menu */}
      {contextMenu && (
        <>
          <div
            className="fixed inset-0 z-50"
            onClick={closeContextMenu}
          />
          <div
            className="fixed z-50 bg-zinc-800 border border-zinc-700 rounded-lg shadow-xl py-1 min-w-[140px]"
            style={{ left: contextMenu.x, top: contextMenu.y }}
          >
            {items.find((i) => i.id === contextMenu.id)?.type === 'folder' && (
              <>
                <button
                  onClick={() => {
                    handleCreateNote(contextMenu.id);
                    closeContextMenu();
                  }}
                  className="w-full flex items-center gap-2 px-3 py-1.5 text-sm text-zinc-300 hover:bg-zinc-700"
                >
                  <Plus size={14} />
                  New Note
                </button>
                <button
                  onClick={() => {
                    handleCreateFolder(contextMenu.id);
                    closeContextMenu();
                  }}
                  className="w-full flex items-center gap-2 px-3 py-1.5 text-sm text-zinc-300 hover:bg-zinc-700"
                >
                  <Folder size={14} />
                  New Folder
                </button>
                <div className="border-t border-zinc-700 my-1" />
              </>
            )}
            <button
              onClick={() => {
                const item = items.find((i) => i.id === contextMenu.id);
                if (item) {
                  setEditingId(item.id);
                  setEditingName(item.name);
                }
                closeContextMenu();
              }}
              className="w-full flex items-center gap-2 px-3 py-1.5 text-sm text-zinc-300 hover:bg-zinc-700"
            >
              <Edit3 size={14} />
              Rename
            </button>
            <button
              onClick={() => {
                deleteFolderItem(contextMenu.id);
                closeContextMenu();
              }}
              className="w-full flex items-center gap-2 px-3 py-1.5 text-sm text-red-400 hover:bg-zinc-700"
            >
              <Trash2 size={14} />
              Delete
            </button>
          </div>
        </>
      )}
    </div>
  );
}
