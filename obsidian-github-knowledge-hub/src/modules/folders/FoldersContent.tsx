import { useEffect, useRef, useCallback } from 'react';
import { EditorView, keymap, placeholder, lineNumbers } from '@codemirror/view';
import { EditorState, Extension } from '@codemirror/state';
import { markdown } from '@codemirror/lang-markdown';
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands';
import { syntaxHighlighting, HighlightStyle } from '@codemirror/language';
import { tags } from '@lezer/highlight';
import { FileText, Link2 } from 'lucide-react';
import { useWorkspaceStore } from '@/stores/useWorkspaceStore';
import { useUIStore } from '@/stores/useUIStore';

// Editor theme
const editorTheme = EditorView.theme({
  '&': {
    height: '100%',
    fontSize: '16px',
    backgroundColor: 'transparent',
  },
  '.cm-content': {
    fontFamily: 'Inter, system-ui, sans-serif',
    padding: '0',
    caretColor: '#6366f1',
  },
  '.cm-cursor': {
    borderLeftColor: '#6366f1',
  },
  '.cm-selectionBackground, &.cm-focused .cm-selectionBackground': {
    backgroundColor: 'rgba(99, 102, 241, 0.3)',
  },
  '.cm-activeLine': {
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
  },
  '.cm-gutters': {
    backgroundColor: 'transparent',
    borderRight: 'none',
    color: '#3f3f46',
  },
  '.cm-line': {
    padding: '0',
  },
  '&.cm-focused': {
    outline: 'none',
  },
});

// Syntax highlighting
const highlightStyle = HighlightStyle.define([
  { tag: tags.heading1, color: '#fafafa', fontWeight: 'bold', fontSize: '1.875rem' },
  { tag: tags.heading2, color: '#fafafa', fontWeight: 'bold', fontSize: '1.5rem' },
  { tag: tags.heading3, color: '#fafafa', fontWeight: 'bold', fontSize: '1.25rem' },
  { tag: tags.heading4, color: '#e4e4e7', fontWeight: 'bold', fontSize: '1.125rem' },
  { tag: tags.emphasis, color: '#c4b5fd', fontStyle: 'italic' },
  { tag: tags.strong, color: '#fafafa', fontWeight: 'bold' },
  { tag: tags.link, color: '#6366f1', textDecoration: 'underline' },
  { tag: tags.url, color: '#6366f1' },
  { tag: tags.monospace, color: '#22d3ee', fontFamily: 'JetBrains Mono, monospace' },
  { tag: tags.quote, color: '#71717a', fontStyle: 'italic' },
  { tag: tags.list, color: '#6366f1' },
  { tag: tags.meta, color: '#71717a' },
  { tag: tags.processingInstruction, color: '#6366f1' },
]);

interface FoldersContentProps {
  blockId: string;
}

export function FoldersContent({ blockId }: FoldersContentProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  
  const activeItemId = useWorkspaceStore((s) => s.activeItemId);
  const getFolderItem = useWorkspaceStore((s) => s.getFolderItem);
  const updateFolderItem = useWorkspaceStore((s) => s.updateFolderItem);
  const getFolderItemsByBlock = useWorkspaceStore((s) => s.getFolderItemsByBlock);
  const setActiveItem = useWorkspaceStore((s) => s.setActiveItem);
  const addFolderItem = useWorkspaceStore((s) => s.addFolderItem);
  const theme = useUIStore((s) => s.theme);
  const backlinksOpen = useUIStore((s) => s.backlinksOpen);
  
  const item = activeItemId ? getFolderItem(activeItemId) : null;
  const allItems = getFolderItemsByBlock(blockId);
  const notes = allItems.filter((i) => i.type === 'note');

  // Handle wikilink click
  const handleWikilinkClick = useCallback((title: string) => {
    const linkedNote = notes.find(
      (n) => n.name.toLowerCase() === title.toLowerCase()
    );
    if (linkedNote) {
      setActiveItem(linkedNote.id);
    } else {
      // Create new note
      const newNote = addFolderItem(blockId, { name: title, type: 'note' });
      setActiveItem(newNote.id);
    }
  }, [notes, setActiveItem, addFolderItem, blockId]);

  useEffect(() => {
    if (!editorRef.current || !item || item.type !== 'note') return;

    const wikilinkMatcher = /\[\[([^\]|]+)(?:\|[^\]]+)?\]\]/g;

    const clickHandler = EditorView.domEventHandlers({
      click: (event, view) => {
        const pos = view.posAtCoords({ x: event.clientX, y: event.clientY });
        if (pos === null) return false;

        const line = view.state.doc.lineAt(pos);
        const text = line.text;
        
        let match;
        while ((match = wikilinkMatcher.exec(text)) !== null) {
          const start = line.from + match.index;
          const end = start + match[0].length;
          if (pos >= start && pos <= end) {
            event.preventDefault();
            handleWikilinkClick(match[1].split('|')[0].trim());
            return true;
          }
        }
        wikilinkMatcher.lastIndex = 0;
        return false;
      },
    });

    const extensions: Extension[] = [
      editorTheme,
      syntaxHighlighting(highlightStyle),
      markdown(),
      history(),
      keymap.of([...defaultKeymap, ...historyKeymap]),
      placeholder('Start writing...'),
      clickHandler,
      EditorView.updateListener.of((update) => {
        if (update.docChanged && item) {
          const content = update.state.doc.toString();
          updateFolderItem(item.id, { content });
        }
      }),
      EditorView.lineWrapping,
    ];

    if (theme.editor.showLineNumbers) {
      extensions.push(lineNumbers());
    }

    const state = EditorState.create({
      doc: item.content || '',
      extensions,
    });

    const view = new EditorView({
      state,
      parent: editorRef.current,
    });

    viewRef.current = view;

    return () => {
      view.destroy();
    };
  }, [activeItemId, item?.id]);

  // Update content if item changes externally
  useEffect(() => {
    if (viewRef.current && item && item.type === 'note') {
      const currentContent = viewRef.current.state.doc.toString();
      if (currentContent !== (item.content || '')) {
        viewRef.current.dispatch({
          changes: {
            from: 0,
            to: currentContent.length,
            insert: item.content || '',
          },
        });
      }
    }
  }, [item?.content]);

  // Find backlinks
  const backlinks = notes.filter((n) => {
    if (n.id === item?.id) return false;
    const wikilinkRegex = /\[\[([^\]|]+)(?:\|[^\]]+)?\]\]/g;
    let match;
    while ((match = wikilinkRegex.exec(n.content || '')) !== null) {
      if (match[1].trim().toLowerCase() === item?.name.toLowerCase()) {
        return true;
      }
    }
    return false;
  });

  // Find outgoing links
  const outgoingLinks = item?.content ? (() => {
    const links: typeof notes = [];
    const wikilinkRegex = /\[\[([^\]|]+)(?:\|[^\]]+)?\]\]/g;
    let match;
    while ((match = wikilinkRegex.exec(item.content || '')) !== null) {
      const linkedNote = notes.find(
        (n) => n.name.toLowerCase() === match![1].trim().toLowerCase()
      );
      if (linkedNote && !links.includes(linkedNote)) {
        links.push(linkedNote);
      }
    }
    return links;
  })() : [];

  if (!item) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-zinc-500">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-600/20 flex items-center justify-center mb-4 border border-zinc-800">
          <FileText size={32} className="text-zinc-600" />
        </div>
        <h2 className="text-lg font-medium text-zinc-300 mb-1">No note selected</h2>
        <p className="text-sm text-zinc-600">Select a note from the sidebar or create a new one</p>
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
      {/* Editor */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Title */}
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
        
        {/* Editor */}
        <div ref={editorRef} className="flex-1 overflow-y-auto px-12 pb-12 text-zinc-300" />
      </div>
      
      {/* Backlinks Panel */}
      {backlinksOpen && (
        <aside className="w-64 border-l border-zinc-800 bg-zinc-900/50 flex flex-col">
          <div className="p-4 border-b border-zinc-800">
            <h3 className="text-sm font-medium text-zinc-400 flex items-center gap-2">
              <Link2 size={14} />
              Links
            </h3>
          </div>
          
          <div className="flex-1 overflow-y-auto p-3 space-y-4">
            {/* Backlinks */}
            <div>
              <h4 className="text-xs font-medium text-zinc-600 uppercase tracking-wide mb-2">
                Backlinks ({backlinks.length})
              </h4>
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

            {/* Outgoing Links */}
            <div>
              <h4 className="text-xs font-medium text-zinc-600 uppercase tracking-wide mb-2">
                Outgoing ({outgoingLinks.length})
              </h4>
              {outgoingLinks.length === 0 ? (
                <p className="text-xs text-zinc-700">No outgoing links</p>
              ) : (
                <div className="space-y-1">
                  {outgoingLinks.map((linkedNote) => (
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
          </div>
        </aside>
      )}
    </div>
  );
}
