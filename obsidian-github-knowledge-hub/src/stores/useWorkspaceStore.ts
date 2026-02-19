import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import {
  Workspace,
  Block,
  BlockType,
  FolderItem,
  CardItem,
  LinkItem,
  CommandItem,
  createWorkspace,
  createBlock,
  createFolderItem,
  createCardItem,
  createLinkItem,
  createCommandItem,
  createInitialWorkspace,
} from '@/types';

interface WorkspaceState {
  workspaces: Workspace[];
  activeWorkspaceId: string | null;
  activeBlockId: string | null;
  activeItemId: string | null;
  
  folderItems: FolderItem[];
  cardItems: CardItem[];
  linkItems: LinkItem[];
  commandItems: CommandItem[];
  
  addWorkspace: (partial?: Partial<Workspace>) => Workspace;
  updateWorkspace: (id: string, updates: Partial<Workspace>) => void;
  deleteWorkspace: (id: string) => void;
  setActiveWorkspace: (id: string) => void;
  getWorkspace: (id: string) => Workspace | undefined;
  
  addBlock: (type: BlockType, workspaceId: string, partial?: Partial<Block>) => Block;
  updateBlock: (id: string, updates: Partial<Block>) => void;
  deleteBlock: (id: string) => void;
  setActiveBlock: (id: string | null) => void;
  getBlock: (id: string) => Block | undefined;
  getBlocksByWorkspace: (workspaceId: string) => Block[];
  
  setActiveItem: (id: string | null) => void;
  
  addFolderItem: (blockId: string, partial?: Partial<FolderItem>) => FolderItem;
  updateFolderItem: (id: string, updates: Partial<FolderItem>) => void;
  deleteFolderItem: (id: string) => void;
  getFolderItemsByBlock: (blockId: string) => FolderItem[];
  getFolderItem: (id: string) => FolderItem | undefined;
  
  addCardItem: (blockId: string, partial?: Partial<CardItem>) => CardItem;
  updateCardItem: (id: string, updates: Partial<CardItem>) => void;
  deleteCardItem: (id: string) => void;
  getCardItemsByBlock: (blockId: string) => CardItem[];
  getCardItem: (id: string) => CardItem | undefined;
  
  addLinkItem: (blockId: string, partial?: Partial<LinkItem>) => LinkItem;
  updateLinkItem: (id: string, updates: Partial<LinkItem>) => void;
  deleteLinkItem: (id: string) => void;
  getLinkItemsByBlock: (blockId: string) => LinkItem[];
  getLinkItem: (id: string) => LinkItem | undefined;
  
  addCommandItem: (blockId: string, partial?: Partial<CommandItem>) => CommandItem;
  updateCommandItem: (id: string, updates: Partial<CommandItem>) => void;
  deleteCommandItem: (id: string) => void;
  getCommandItemsByBlock: (blockId: string) => CommandItem[];
  getCommandItem: (id: string) => CommandItem | undefined;
}

// Create initial sample data
const initialWorkspace = createInitialWorkspace();

const sampleFolderItems: FolderItem[] = [
  createFolderItem(initialWorkspace.blocks[0].id, {
    id: 'welcome',
    name: 'Welcome to Knowledge Hub',
    type: 'note',
    content: `# Welcome to Knowledge Hub 📚

This is your personal knowledge base with Obsidian-like features!

## Key Features

- **Wikilinks**: Link notes using [[Getting Started]] syntax
- **Backlinks**: See all notes that link to the current note
- **Graph View**: Visualize connections between notes
- **Multiple Block Types**: Notes, Cards, Links, Commands
- **Workspaces**: Organize everything by project

## Quick Tips

1. Create new blocks in the sidebar
2. Use \`[[Note Name]]\` to link to other notes
3. Add tags like #tutorial #welcome
4. Switch between workspaces in the header

Happy note-taking! 🎉`,
    tags: ['welcome', 'tutorial'],
    order: 0,
  }),
  createFolderItem(initialWorkspace.blocks[0].id, {
    id: 'getting-started',
    name: 'Getting Started',
    type: 'note',
    content: `# Getting Started

Welcome to your knowledge journey! This note will help you get started.

## Creating Content

You can create different types of content:
1. **Notes** - Markdown documents with wikilinks
2. **Cards** - Quick capture cards for tasks/ideas
3. **Links** - Bookmark manager with descriptions
4. **Commands** - Save and organize shell commands

See also: [[Welcome to Knowledge Hub]]`,
    tags: ['getting-started', 'tutorial'],
    order: 1,
  }),
];

const sampleCardItems: CardItem[] = [
  createCardItem(initialWorkspace.blocks[1].id, {
    id: 'card-1',
    title: 'Set up Knowledge Hub',
    content: 'Configure GitHub sync and create initial workspace structure',
    color: '#22c55e',
    priority: 'high',
    completed: true,
    tags: ['setup'],
    order: 0,
  }),
  createCardItem(initialWorkspace.blocks[1].id, {
    id: 'card-2',
    title: 'Explore features',
    content: 'Try creating notes, cards, and links.',
    color: '#6366f1',
    priority: 'medium',
    completed: false,
    tags: ['learning'],
    order: 1,
  }),
];

const sampleLinkItems: LinkItem[] = [
  createLinkItem(initialWorkspace.blocks[2].id, {
    id: 'link-1',
    title: 'Obsidian',
    url: 'https://obsidian.md',
    description: 'A powerful knowledge base',
    category: 'Tools',
    tags: ['productivity', 'notes'],
    order: 0,
  }),
  createLinkItem(initialWorkspace.blocks[2].id, {
    id: 'link-2',
    title: 'GitHub',
    url: 'https://github.com',
    description: 'Where the world builds software',
    category: 'Development',
    tags: ['dev', 'git'],
    order: 1,
  }),
];

export const useWorkspaceStore = create<WorkspaceState>()(
  immer((set, get) => ({
    workspaces: [initialWorkspace],
    activeWorkspaceId: initialWorkspace.id,
    activeBlockId: initialWorkspace.blocks[0].id,
    activeItemId: 'welcome',
    
    folderItems: sampleFolderItems,
    cardItems: sampleCardItems,
    linkItems: sampleLinkItems,
    commandItems: [],
    
    addWorkspace: (partial) => {
      const workspace = createWorkspace(partial);
      set((state) => {
        state.workspaces.push(workspace);
      });
      return workspace;
    },
    
    updateWorkspace: (id, updates) => {
      set((state) => {
        const workspace = state.workspaces.find((w) => w.id === id);
        if (workspace) {
          Object.assign(workspace, updates, { updatedAt: new Date().toISOString() });
        }
      });
    },
    
    deleteWorkspace: (id) => {
      set((state) => {
        state.workspaces = state.workspaces.filter((w) => w.id !== id);
        if (state.activeWorkspaceId === id) {
          state.activeWorkspaceId = state.workspaces[0]?.id || null;
          state.activeBlockId = null;
          state.activeItemId = null;
        }
      });
    },
    
    setActiveWorkspace: (id) => {
      set((state) => {
        state.activeWorkspaceId = id;
        const workspace = state.workspaces.find((w) => w.id === id);
        state.activeBlockId = workspace?.blocks[0]?.id || null;
        state.activeItemId = null;
      });
    },
    
    getWorkspace: (id) => get().workspaces.find((w) => w.id === id),
    
    addBlock: (type, workspaceId, partial) => {
      const block = createBlock(type, workspaceId, partial);
      set((state) => {
        const workspace = state.workspaces.find((w) => w.id === workspaceId);
        if (workspace) {
          workspace.blocks.push(block);
          workspace.updatedAt = new Date().toISOString();
        }
      });
      return block;
    },
    
    updateBlock: (id, updates) => {
      set((state) => {
        for (const workspace of state.workspaces) {
          const block = workspace.blocks.find((b) => b.id === id);
          if (block) {
            Object.assign(block, updates, { updatedAt: new Date().toISOString() });
            workspace.updatedAt = new Date().toISOString();
            break;
          }
        }
      });
    },
    
    deleteBlock: (id) => {
      set((state) => {
        for (const workspace of state.workspaces) {
          const index = workspace.blocks.findIndex((b) => b.id === id);
          if (index !== -1) {
            workspace.blocks.splice(index, 1);
            workspace.updatedAt = new Date().toISOString();
            
            state.folderItems = state.folderItems.filter((i) => i.blockId !== id);
            state.cardItems = state.cardItems.filter((i) => i.blockId !== id);
            state.linkItems = state.linkItems.filter((i) => i.blockId !== id);
            state.commandItems = state.commandItems.filter((i) => i.blockId !== id);
            
            if (state.activeBlockId === id) {
              state.activeBlockId = workspace.blocks[0]?.id || null;
              state.activeItemId = null;
            }
            break;
          }
        }
      });
    },
    
    setActiveBlock: (id) => {
      set((state) => {
        state.activeBlockId = id;
        state.activeItemId = null;
      });
    },
    
    getBlock: (id) => {
      for (const workspace of get().workspaces) {
        const block = workspace.blocks.find((b) => b.id === id);
        if (block) return block;
      }
      return undefined;
    },
    
    getBlocksByWorkspace: (workspaceId) => {
      const workspace = get().workspaces.find((w) => w.id === workspaceId);
      return workspace?.blocks || [];
    },
    
    setActiveItem: (id) => {
      set((state) => {
        state.activeItemId = id;
      });
    },
    
    addFolderItem: (blockId, partial) => {
      const item = createFolderItem(blockId, partial);
      set((state) => {
        state.folderItems.push(item);
      });
      return item;
    },
    
    updateFolderItem: (id, updates) => {
      set((state) => {
        const item = state.folderItems.find((i) => i.id === id);
        if (item) {
          Object.assign(item, updates, { updatedAt: new Date().toISOString() });
        }
      });
    },
    
    deleteFolderItem: (id) => {
      set((state) => {
        const toDelete = new Set<string>([id]);
        let changed = true;
        while (changed) {
          changed = false;
          for (const item of state.folderItems) {
            if (item.parentId && toDelete.has(item.parentId) && !toDelete.has(item.id)) {
              toDelete.add(item.id);
              changed = true;
            }
          }
        }
        state.folderItems = state.folderItems.filter((i) => !toDelete.has(i.id));
        if (state.activeItemId && toDelete.has(state.activeItemId)) {
          state.activeItemId = null;
        }
      });
    },
    
    getFolderItemsByBlock: (blockId) => get().folderItems.filter((i) => i.blockId === blockId),
    getFolderItem: (id) => get().folderItems.find((i) => i.id === id),
    
    addCardItem: (blockId, partial) => {
      const item = createCardItem(blockId, partial);
      set((state) => {
        state.cardItems.push(item);
      });
      return item;
    },
    
    updateCardItem: (id, updates) => {
      set((state) => {
        const item = state.cardItems.find((i) => i.id === id);
        if (item) {
          Object.assign(item, updates, { updatedAt: new Date().toISOString() });
        }
      });
    },
    
    deleteCardItem: (id) => {
      set((state) => {
        state.cardItems = state.cardItems.filter((i) => i.id !== id);
        if (state.activeItemId === id) {
          state.activeItemId = null;
        }
      });
    },
    
    getCardItemsByBlock: (blockId) => get().cardItems.filter((i) => i.blockId === blockId),
    getCardItem: (id) => get().cardItems.find((i) => i.id === id),
    
    addLinkItem: (blockId, partial) => {
      const item = createLinkItem(blockId, partial);
      set((state) => {
        state.linkItems.push(item);
      });
      return item;
    },
    
    updateLinkItem: (id, updates) => {
      set((state) => {
        const item = state.linkItems.find((i) => i.id === id);
        if (item) {
          Object.assign(item, updates, { updatedAt: new Date().toISOString() });
        }
      });
    },
    
    deleteLinkItem: (id) => {
      set((state) => {
        state.linkItems = state.linkItems.filter((i) => i.id !== id);
        if (state.activeItemId === id) {
          state.activeItemId = null;
        }
      });
    },
    
    getLinkItemsByBlock: (blockId) => get().linkItems.filter((i) => i.blockId === blockId),
    getLinkItem: (id) => get().linkItems.find((i) => i.id === id),
    
    addCommandItem: (blockId, partial) => {
      const item = createCommandItem(blockId, partial);
      set((state) => {
        state.commandItems.push(item);
      });
      return item;
    },
    
    updateCommandItem: (id, updates) => {
      set((state) => {
        const item = state.commandItems.find((i) => i.id === id);
        if (item) {
          Object.assign(item, updates, { updatedAt: new Date().toISOString() });
        }
      });
    },
    
    deleteCommandItem: (id) => {
      set((state) => {
        state.commandItems = state.commandItems.filter((i) => i.id !== id);
        if (state.activeItemId === id) {
          state.activeItemId = null;
        }
      });
    },
    
    getCommandItemsByBlock: (blockId) => get().commandItems.filter((i) => i.blockId === blockId),
    getCommandItem: (id) => get().commandItems.find((i) => i.id === id),
  }))
);
