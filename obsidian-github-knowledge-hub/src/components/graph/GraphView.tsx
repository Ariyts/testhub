import { X, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';
import { useWorkspaceStore } from '@/stores/useWorkspaceStore';
import { useUIStore } from '@/stores/useUIStore';
import { FolderItem } from '@/types';

export function GraphView() {
  const folderItems = useWorkspaceStore((s) => s.folderItems);
  const setActiveItem = useWorkspaceStore((s) => s.setActiveItem);
  const setActiveBlock = useWorkspaceStore((s) => s.setActiveBlock);
  const graphOpen = useUIStore((s) => s.graphOpen);
  const toggleGraph = useUIStore((s) => s.toggleGraph);
  
  const notes = folderItems.filter((i) => i.type === 'note');

  // Simple graph - just show list of notes with their connections
  const getConnections = (note: FolderItem) => {
    const wikilinkRegex = /\[\[([^\]|]+)(?:\|[^\]]+)?\]\]/g;
    const connections: FolderItem[] = [];
    let match;
    while ((match = wikilinkRegex.exec(note.content || '')) !== null) {
      const linkedNote = notes.find((n) => n.name.toLowerCase() === match[1].trim().toLowerCase());
      if (linkedNote && linkedNote.id !== note.id && !connections.includes(linkedNote)) {
        connections.push(linkedNote);
      }
    }
    return connections;
  };

  if (!graphOpen) return null;

  return (
    <div className="fixed inset-0 z-40 bg-zinc-950 flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-sm">📊</span>
          Graph View
        </h2>
        <button onClick={toggleGraph} className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors">
          <X size={18} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="grid gap-4 max-w-4xl mx-auto">
          {notes.map((note) => {
            const connections = getConnections(note);
            return (
              <div key={note.id} className="bg-zinc-900 rounded-lg border border-zinc-800 p-4">
                <button
                  onClick={() => { setActiveBlock(note.blockId); setActiveItem(note.id); toggleGraph(); }}
                  className="text-indigo-400 hover:text-indigo-300 font-medium"
                >
                  {note.name}
                </button>
                {connections.length > 0 && (
                  <div className="mt-2 text-sm text-zinc-500">
                    → {connections.map((c) => c.name).join(', ')}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="px-4 py-2 border-t border-zinc-800 text-sm text-zinc-500">
        {notes.length} notes
      </div>
    </div>
  );
}
