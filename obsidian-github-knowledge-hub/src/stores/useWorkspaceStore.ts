import { create } from 'zustand';
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
} from '@/types';

// Initial workspace
const initialWorkspace = createWorkspace({ name: 'Personal', icon: '🏠' });
const notesBlock = createBlock('folders', initialWorkspace.id, { name: 'Notes' });
const cardsBlock = createBlock('cards', initialWorkspace.id, { name: 'Tasks' });
const linksBlock = createBlock('links', initialWorkspace.id, { name: 'Bookmarks' });
initialWorkspace.blocks = [notesBlock, cardsBlock, linksBlock];

// Sample data
const sampleFolderItems: FolderItem[] = [
  createFolderItem(notesBlock.id, {
    id: 'welcome',
    name: 'Welcome to Knowledge Hub',
    type: 'note',
    content: `# Welcome to Knowledge Hub 📚

This is your personal knowledge base!

## Features
- **Wikilinks**: Link notes using [[Note Name]] syntax
- **Graph View**: Visualize connections
- **Multiple Block Types**: Notes, Cards, Links, Commands

Happy note-taking! 🎉`,
    tags: ['welcome'],
    order: 0,
  }),
  createFolderItem(notesBlock.id, {
    id: 'getting-started',
    name: 'Getting Started',
    type: 'note',
    content: `# Getting Started

Welcome! Create notes, cards, and links to organize your knowledge.`,
    tags: ['tutorial'],
    order: 1,
  }),
];

const sampleCardItems: CardItem[] = [
  createCardItem(cardsBlock.id, {
    id: 'card-1',
    title: 'Explore features',
    content: 'Try creating notes and cards',
    color: '#6366f1',
    priority: 'medium',
    completed: false,
    tags: [],
    order: 0,
  }),
];

const sampleLinkItems: LinkItem[] = [
  createLinkItem(linksBlock.id, {
    id: 'link-1',
    title: 'GitHub',
    url: 'https://github.com',
    description: 'Where the world builds software',
    category: 'Dev',
    tags: [],
    order: 0,
  }),
];

interface State {
  workspaces: Workspace[];
  activeWorkspaceId: string | null;
  activeBlockId: string | null;
  activeItemId: string | null;
  folderItems: FolderItem[];
  cardItems: CardItem[];
  linkItems: LinkItem[];
  commandItems: CommandItem[];
  
  setActiveWorkspace: (id: string) => void;
  setActiveBlock: (id: string | null) => void;
  setActiveItem: (id: string | null) => void;
  addWorkspace: (partial?: Partial<Workspace>) => Workspace;
  updateWorkspace: (id: string, updates: Partial<Workspace>) => void;
  deleteWorkspace: (id: string) => void;
  addBlock: (type: BlockType, workspaceId: string, partial?: Partial<Block>) => Block;
  updateBlock: (id: string, updates: Partial<Block>) => void;
  deleteBlock: (id: string) => void;
  getBlock: (id: string) => Block | undefined;
  getBlocksByWorkspace: (workspaceId: string) => Block[];
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

export const useWorkspaceStore = create<State>()((set, get) => ({
  workspaces: [initialWorkspace],
  activeWorkspaceId: initialWorkspace.id,
  activeBlockId: notesBlock.id,
  activeItemId: 'welcome',
  folderItems: sampleFolderItems,
  cardItems: sampleCardItems,
  linkItems: sampleLinkItems,
  commandItems: [],

  setActiveWorkspace: (id) => {
    const workspace = get().workspaces.find(w => w.id === id);
    set({
      activeWorkspaceId: id,
      activeBlockId: workspace?.blocks[0]?.id || null,
      activeItemId: null,
    });
  },

  setActiveBlock: (id) => set({ activeBlockId: id, activeItemId: null }),
  setActiveItem: (id) => set({ activeItemId: id }),

  addWorkspace: (partial) => {
    const workspace = createWorkspace(partial);
    set(state => ({ workspaces: [...state.workspaces, workspace] }));
    return workspace;
  },

  updateWorkspace: (id, updates) => {
    set(state => ({
      workspaces: state.workspaces.map(w => 
        w.id === id ? { ...w, ...updates, updatedAt: new Date().toISOString() } : w
      ),
    }));
  },

  deleteWorkspace: (id) => {
    set(state => {
      const newWorkspaces = state.workspaces.filter(w => w.id !== id);
      const newActiveId = state.activeWorkspaceId === id 
        ? newWorkspaces[0]?.id || null 
        : state.activeWorkspaceId;
      return {
        workspaces: newWorkspaces,
        activeWorkspaceId: newActiveId,
        activeBlockId: null,
        activeItemId: null,
      };
    });
  },

  addBlock: (type, workspaceId, partial) => {
    const block = createBlock(type, workspaceId, partial);
    set(state => ({
      workspaces: state.workspaces.map(w => 
        w.id === workspaceId 
          ? { ...w, blocks: [...w.blocks, block], updatedAt: new Date().toISOString() }
          : w
      ),
    }));
    return block;
  },

  updateBlock: (id, updates) => {
    set(state => ({
      workspaces: state.workspaces.map(w => ({
        ...w,
        blocks: w.blocks.map(b => 
          b.id === id ? { ...b, ...updates, updatedAt: new Date().toISOString() } : b
        ),
      })),
    }));
  },

  deleteBlock: (id) => {
    set(state => {
      const newWorkspaces = state.workspaces.map(w => ({
        ...w,
        blocks: w.blocks.filter(b => b.id !== id),
      }));
      return {
        workspaces: newWorkspaces,
        folderItems: state.folderItems.filter(i => i.blockId !== id),
        cardItems: state.cardItems.filter(i => i.blockId !== id),
        linkItems: state.linkItems.filter(i => i.blockId !== id),
        commandItems: state.commandItems.filter(i => i.blockId !== id),
        activeBlockId: state.activeBlockId === id ? null : state.activeBlockId,
        activeItemId: state.activeBlockId === id ? null : state.activeItemId,
      };
    });
  },

  getBlock: (id) => {
    for (const w of get().workspaces) {
      const block = w.blocks.find(b => b.id === id);
      if (block) return block;
    }
    return undefined;
  },

  getBlocksByWorkspace: (workspaceId) => {
    return get().workspaces.find(w => w.id === workspaceId)?.blocks || [];
  },

  addFolderItem: (blockId, partial) => {
    const item = createFolderItem(blockId, partial);
    set(state => ({ folderItems: [...state.folderItems, item] }));
    return item;
  },

  updateFolderItem: (id, updates) => {
    set(state => ({
      folderItems: state.folderItems.map(i => 
        i.id === id ? { ...i, ...updates, updatedAt: new Date().toISOString() } : i
      ),
    }));
  },

  deleteFolderItem: (id) => {
    set(state => ({
      folderItems: state.folderItems.filter(i => i.id !== id),
      activeItemId: state.activeItemId === id ? null : state.activeItemId,
    }));
  },

  getFolderItemsByBlock: (blockId) => get().folderItems.filter(i => i.blockId === blockId),
  getFolderItem: (id) => get().folderItems.find(i => i.id === id),

  addCardItem: (blockId, partial) => {
    const item = createCardItem(blockId, partial);
    set(state => ({ cardItems: [...state.cardItems, item] }));
    return item;
  },

  updateCardItem: (id, updates) => {
    set(state => ({
      cardItems: state.cardItems.map(i => 
        i.id === id ? { ...i, ...updates, updatedAt: new Date().toISOString() } : i
      ),
    }));
  },

  deleteCardItem: (id) => {
    set(state => ({
      cardItems: state.cardItems.filter(i => i.id !== id),
      activeItemId: state.activeItemId === id ? null : state.activeItemId,
    }));
  },

  getCardItemsByBlock: (blockId) => get().cardItems.filter(i => i.blockId === blockId),
  getCardItem: (id) => get().cardItems.find(i => i.id === id),

  addLinkItem: (blockId, partial) => {
    const item = createLinkItem(blockId, partial);
    set(state => ({ linkItems: [...state.linkItems, item] }));
    return item;
  },

  updateLinkItem: (id, updates) => {
    set(state => ({
      linkItems: state.linkItems.map(i => 
        i.id === id ? { ...i, ...updates, updatedAt: new Date().toISOString() } : i
      ),
    }));
  },

  deleteLinkItem: (id) => {
    set(state => ({
      linkItems: state.linkItems.filter(i => i.id !== id),
      activeItemId: state.activeItemId === id ? null : state.activeItemId,
    }));
  },

  getLinkItemsByBlock: (blockId) => get().linkItems.filter(i => i.blockId === blockId),
  getLinkItem: (id) => get().linkItems.find(i => i.id === id),

  addCommandItem: (blockId, partial) => {
    const item = createCommandItem(blockId, partial);
    set(state => ({ commandItems: [...state.commandItems, item] }));
    return item;
  },

  updateCommandItem: (id, updates) => {
    set(state => ({
      commandItems: state.commandItems.map(i => 
        i.id === id ? { ...i, ...updates, updatedAt: new Date().toISOString() } : i
      ),
    }));
  },

  deleteCommandItem: (id) => {
    set(state => ({
      commandItems: state.commandItems.filter(i => i.id !== id),
      activeItemId: state.activeItemId === id ? null : state.activeItemId,
    }));
  },

  getCommandItemsByBlock: (blockId) => get().commandItems.filter(i => i.blockId === blockId),
  getCommandItem: (id) => get().commandItems.find(i => i.id === id),
}));
