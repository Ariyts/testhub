import { useState } from 'react';
import {
  Plus,
  Settings,
  ChevronDown,
  Folder,
  LayoutGrid,
  Link,
  Terminal,
  MoreHorizontal,
  Edit3,
  Trash2,
  Link2,
  Network,
  Search,
  X,
} from 'lucide-react';
import { cn } from '@/utils/cn';
import { useWorkspaceStore } from '@/stores/useWorkspaceStore';
import { useUIStore } from '@/stores/useUIStore';
import { moduleRegistry, getModule } from '@/modules';
import { BlockType } from '@/types';
import { SyncIndicator } from '@/components/sync/SyncIndicator';
import { SettingsModal } from '@/components/settings/SettingsModal';
import { GraphView } from '@/components/graph/GraphView';
import { QuickSwitcher } from '@/components/navigation/QuickSwitcher';
import { CommandPalette } from '@/components/navigation/CommandPalette';
import { useHotkeys } from '@/hooks/useHotkeys';

const blockIcons: Record<BlockType, React.ReactNode> = {
  folders: <Folder size={18} />,
  cards: <LayoutGrid size={18} />,
  links: <Link size={18} />,
  commands: <Terminal size={18} />,
};

export function App() {
  const workspaces = useWorkspaceStore((s) => s.workspaces);
  const activeWorkspaceId = useWorkspaceStore((s) => s.activeWorkspaceId);
  const activeBlockId = useWorkspaceStore((s) => s.activeBlockId);
  const setActiveWorkspace = useWorkspaceStore((s) => s.setActiveWorkspace);
  const setActiveBlock = useWorkspaceStore((s) => s.setActiveBlock);
  const addWorkspace = useWorkspaceStore((s) => s.addWorkspace);
  const updateWorkspace = useWorkspaceStore((s) => s.updateWorkspace);
  const deleteWorkspace = useWorkspaceStore((s) => s.deleteWorkspace);
  const addBlock = useWorkspaceStore((s) => s.addBlock);
  const updateBlock = useWorkspaceStore((s) => s.updateBlock);
  const deleteBlock = useWorkspaceStore((s) => s.deleteBlock);
  const getBlock = useWorkspaceStore((s) => s.getBlock);
  
  const secondPanelOpen = useUIStore((s) => s.secondPanelOpen);
  const toggleSecondPanel = useUIStore((s) => s.toggleSecondPanel);
  const backlinksOpen = useUIStore((s) => s.backlinksOpen);
  const toggleBacklinks = useUIStore((s) => s.toggleBacklinks);
  const toggleGraph = useUIStore((s) => s.toggleGraph);
  const openSettings = useUIStore((s) => s.openSettings);
  const openQuickSwitcher = useUIStore((s) => s.openQuickSwitcher);
  const theme = useUIStore((s) => s.theme);
  
  const [showBlockCreator, setShowBlockCreator] = useState(false);
  const [workspaceMenuOpen, setWorkspaceMenuOpen] = useState(false);
  const [blockContextMenu, setBlockContextMenu] = useState<{ id: string; x: number; y: number } | null>(null);
  const [editingWorkspace, setEditingWorkspace] = useState<string | null>(null);
  const [editingWorkspaceName, setEditingWorkspaceName] = useState('');
  const [editingBlock, setEditingBlock] = useState<string | null>(null);
  const [editingBlockName, setEditingBlockName] = useState('');

  const activeWorkspace = workspaces.find((w) => w.id === activeWorkspaceId);
  const activeBlock = activeBlockId ? getBlock(activeBlockId) : null;
  const blocks = activeWorkspace?.blocks || [];

  // Initialize hotkeys
  useHotkeys();

  const handleCreateBlock = (type: BlockType) => {
    if (!activeWorkspaceId) return;
    const block = addBlock(type, activeWorkspaceId);
    setActiveBlock(block.id);
    setShowBlockCreator(false);
  };

  const handleDeleteBlock = (id: string) => {
    deleteBlock(id);
    setBlockContextMenu(null);
  };

  const handleRenameBlock = (id: string) => {
    const block = getBlock(id);
    if (block) {
      setEditingBlock(id);
      setEditingBlockName(block.name);
    }
    setBlockContextMenu(null);
  };

  const handleSaveBlockName = () => {
    if (editingBlock && editingBlockName.trim()) {
      updateBlock(editingBlock, { name: editingBlockName.trim() });
    }
    setEditingBlock(null);
    setEditingBlockName('');
  };

  const handleCreateWorkspace = () => {
    const workspace = addWorkspace({ name: 'New Workspace' });
    setActiveWorkspace(workspace.id);
    setEditingWorkspace(workspace.id);
    setEditingWorkspaceName(workspace.name);
    setWorkspaceMenuOpen(false);
  };

  const handleDeleteWorkspace = (id: string) => {
    if (workspaces.length > 1) {
      deleteWorkspace(id);
    }
    setWorkspaceMenuOpen(false);
  };

  // Render module components
  const activeModule = activeBlock ? getModule(activeBlock.type) : null;
  const SidebarComponent = activeModule?.SidebarComponent;
  const ContentComponent = activeModule?.ContentComponent;

  return (
    <div
      className={cn(
        'flex h-screen overflow-hidden',
        theme.mode === 'dark' ? 'bg-zinc-950 text-zinc-100' : 'bg-white text-zinc-900'
      )}
    >
      {/* Level 1: Block Rail */}
      <aside className="w-14 flex flex-col items-center py-3 bg-zinc-900 border-r border-zinc-800">
        {/* Workspace Selector */}
        <div className="relative mb-4">
          <button
            onClick={() => setWorkspaceMenuOpen(!workspaceMenuOpen)}
            className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg hover:scale-105 transition-transform"
            title={activeWorkspace?.name}
          >
            {activeWorkspace?.icon || activeWorkspace?.name[0] || 'K'}
          </button>
          
          {/* Workspace Dropdown */}
          {workspaceMenuOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setWorkspaceMenuOpen(false)} />
              <div className="absolute left-full ml-2 top-0 z-50 w-56 bg-zinc-800 border border-zinc-700 rounded-lg shadow-xl py-1">
                <div className="px-3 py-2 text-xs font-medium text-zinc-500 uppercase tracking-wide">
                  Workspaces
                </div>
                {workspaces.map((ws) => (
                  <div
                    key={ws.id}
                    className={cn(
                      'flex items-center gap-2 px-3 py-2 cursor-pointer',
                      ws.id === activeWorkspaceId ? 'bg-indigo-500/20 text-indigo-300' : 'text-zinc-300 hover:bg-zinc-700'
                    )}
                  >
                    {editingWorkspace === ws.id ? (
                      <input
                        type="text"
                        value={editingWorkspaceName}
                        onChange={(e) => setEditingWorkspaceName(e.target.value)}
                        onBlur={() => {
                          if (editingWorkspaceName.trim()) {
                            updateWorkspace(ws.id, { name: editingWorkspaceName.trim() });
                          }
                          setEditingWorkspace(null);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            if (editingWorkspaceName.trim()) {
                              updateWorkspace(ws.id, { name: editingWorkspaceName.trim() });
                            }
                            setEditingWorkspace(null);
                          }
                        }}
                        className="flex-1 bg-zinc-700 px-2 py-1 rounded text-sm outline-none"
                        autoFocus
                        onClick={(e) => e.stopPropagation()}
                      />
                    ) : (
                      <>
                        <span
                          className="flex-1"
                          onClick={() => {
                            setActiveWorkspace(ws.id);
                            setWorkspaceMenuOpen(false);
                          }}
                        >
                          {ws.icon} {ws.name}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingWorkspace(ws.id);
                            setEditingWorkspaceName(ws.name);
                          }}
                          className="p-1 hover:bg-zinc-600 rounded"
                        >
                          <Edit3 size={12} />
                        </button>
                        {workspaces.length > 1 && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteWorkspace(ws.id);
                            }}
                            className="p-1 hover:bg-zinc-600 rounded text-red-400"
                          >
                            <Trash2 size={12} />
                          </button>
                        )}
                      </>
                    )}
                  </div>
                ))}
                <div className="border-t border-zinc-700 mt-1 pt-1">
                  <button
                    onClick={handleCreateWorkspace}
                    className="w-full flex items-center gap-2 px-3 py-2 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700"
                  >
                    <Plus size={14} />
                    New Workspace
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
        
        {/* Block Icons */}
        <div className="flex-1 flex flex-col items-center gap-1">
          {blocks.map((block) => (
            <button
              key={block.id}
              onClick={() => setActiveBlock(block.id)}
              onContextMenu={(e) => {
                e.preventDefault();
                setBlockContextMenu({ id: block.id, x: e.clientX, y: e.clientY });
              }}
              className={cn(
                'w-10 h-10 rounded-xl flex items-center justify-center transition-all',
                activeBlockId === block.id
                  ? 'bg-zinc-700 text-white'
                  : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800'
              )}
              title={block.name}
              style={{
                borderLeft: activeBlockId === block.id ? `3px solid ${block.color}` : 'none',
              }}
            >
              {blockIcons[block.type]}
            </button>
          ))}
          
          {/* Add Block Button */}
          <div className="relative">
            <button
              onClick={() => setShowBlockCreator(!showBlockCreator)}
              className="w-10 h-10 rounded-xl flex items-center justify-center text-zinc-600 hover:text-zinc-400 hover:bg-zinc-800 transition-colors"
              title="Add block"
            >
              <Plus size={20} />
            </button>
            
            {/* Block Type Selector */}
            {showBlockCreator && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowBlockCreator(false)} />
                <div className="absolute left-full ml-2 top-0 z-50 w-64 bg-zinc-800 border border-zinc-700 rounded-lg shadow-xl py-2">
                  <div className="px-3 py-2 text-xs font-medium text-zinc-500 uppercase tracking-wide">
                    Add Block
                  </div>
                  {Object.values(moduleRegistry).map((module) => (
                    <button
                      key={module.type}
                      onClick={() => handleCreateBlock(module.type)}
                      className="w-full flex items-center gap-3 px-3 py-2 text-zinc-300 hover:bg-zinc-700 transition-colors"
                    >
                      <div className="w-8 h-8 rounded-lg bg-zinc-700 flex items-center justify-center">
                        {blockIcons[module.type]}
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-medium">{module.name}</p>
                        <p className="text-xs text-zinc-500">{module.description}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
        
        {/* Bottom Actions */}
        <div className="flex flex-col items-center gap-1">
          <button
            onClick={openQuickSwitcher}
            className="w-10 h-10 rounded-xl flex items-center justify-center text-zinc-600 hover:text-zinc-400 hover:bg-zinc-800 transition-colors"
            title="Search (⌘O)"
          >
            <Search size={18} />
          </button>
          <button
            onClick={toggleGraph}
            className="w-10 h-10 rounded-xl flex items-center justify-center text-zinc-600 hover:text-zinc-400 hover:bg-zinc-800 transition-colors"
            title="Graph View (⌘G)"
          >
            <Network size={18} />
          </button>
          <button
            onClick={openSettings}
            className="w-10 h-10 rounded-xl flex items-center justify-center text-zinc-600 hover:text-zinc-400 hover:bg-zinc-800 transition-colors"
            title="Settings"
          >
            <Settings size={18} />
          </button>
        </div>
      </aside>
      
      {/* Level 2: Block Content Panel */}
      {secondPanelOpen && activeBlock && SidebarComponent && (
        <aside className="w-64 flex flex-col bg-zinc-900/50 border-r border-zinc-800">
          {/* Block Header */}
          <div className="flex items-center justify-between px-3 py-2 border-b border-zinc-800">
            {editingBlock === activeBlock.id ? (
              <input
                type="text"
                value={editingBlockName}
                onChange={(e) => setEditingBlockName(e.target.value)}
                onBlur={handleSaveBlockName}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveBlockName();
                  if (e.key === 'Escape') setEditingBlock(null);
                }}
                className="flex-1 bg-zinc-700 px-2 py-1 rounded text-sm outline-none"
                autoFocus
              />
            ) : (
              <div className="flex items-center gap-2">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: activeBlock.color }}
                />
                <span className="text-sm font-medium text-zinc-300">{activeBlock.name}</span>
              </div>
            )}
            <button
              onClick={() => toggleSecondPanel()}
              className="p-1 rounded hover:bg-zinc-800 text-zinc-500 hover:text-zinc-300"
            >
              <X size={14} />
            </button>
          </div>
          
          {/* Module Sidebar */}
          <div className="flex-1 overflow-hidden">
            <SidebarComponent blockId={activeBlock.id} />
          </div>
        </aside>
      )}
      
      {/* Level 3: Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 bg-zinc-950">
        {/* Header */}
        <header className="flex items-center justify-between px-4 py-2 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            {!secondPanelOpen && activeBlock && (
              <button
                onClick={toggleSecondPanel}
                className="p-2 rounded-lg text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800"
              >
                <ChevronDown size={16} className="rotate-90" />
              </button>
            )}
            <span className="text-sm text-zinc-500">
              {activeWorkspace?.name} {activeBlock && `/ ${activeBlock.name}`}
            </span>
          </div>
          
          <div className="flex items-center gap-1">
            <SyncIndicator />
            
            {activeBlock?.type === 'folders' && (
              <button
                onClick={toggleBacklinks}
                className={cn(
                  'p-2 rounded-lg transition-colors',
                  backlinksOpen
                    ? 'text-indigo-400 bg-indigo-500/10'
                    : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800'
                )}
                title="Toggle backlinks"
              >
                <Link2 size={16} />
              </button>
            )}
            
            <button
              onClick={() => setBlockContextMenu(activeBlock ? { id: activeBlock.id, x: 0, y: 0 } : null)}
              className="p-2 rounded-lg text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800"
            >
              <MoreHorizontal size={16} />
            </button>
          </div>
        </header>
        
        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {activeBlock && ContentComponent ? (
            <ContentComponent blockId={activeBlock.id} />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center h-full text-zinc-500">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-center justify-center mb-4 border border-zinc-800">
                <Folder size={40} className="text-zinc-700" />
              </div>
              <h2 className="text-xl font-semibold text-zinc-300 mb-2">Welcome to Knowledge Hub</h2>
              <p className="text-sm text-zinc-600 mb-6">Select a block or create a new one to get started</p>
              <button
                onClick={() => setShowBlockCreator(true)}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg transition-colors"
              >
                <Plus size={16} />
                Create Block
              </button>
            </div>
          )}
        </div>
      </main>
      
      {/* Block Context Menu */}
      {blockContextMenu && (
        <>
          <div className="fixed inset-0 z-50" onClick={() => setBlockContextMenu(null)} />
          <div
            className="fixed z-50 bg-zinc-800 border border-zinc-700 rounded-lg shadow-xl py-1 min-w-[140px]"
            style={{ 
              left: blockContextMenu.x || 60, 
              top: blockContextMenu.y || 100 
            }}
          >
            <button
              onClick={() => handleRenameBlock(blockContextMenu.id)}
              className="w-full flex items-center gap-2 px-3 py-1.5 text-sm text-zinc-300 hover:bg-zinc-700"
            >
              <Edit3 size={14} />
              Rename
            </button>
            <button
              onClick={() => handleDeleteBlock(blockContextMenu.id)}
              className="w-full flex items-center gap-2 px-3 py-1.5 text-sm text-red-400 hover:bg-zinc-700"
            >
              <Trash2 size={14} />
              Delete
            </button>
          </div>
        </>
      )}
      
      {/* Modals */}
      <QuickSwitcher />
      <CommandPalette />
      <GraphView />
      <SettingsModal />
    </div>
  );
}
