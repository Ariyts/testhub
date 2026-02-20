import { nanoid } from 'nanoid';

// ==================== Core Types ====================

export interface Workspace {
  id: string;
  name: string;
  icon: string;
  blocks: Block[];
  createdAt: string;
  updatedAt: string;
}

export type BlockType = 'folders' | 'cards' | 'links' | 'commands';

export interface Block {
  id: string;
  type: BlockType;
  name: string;
  icon: string;
  color: string;
  workspaceId: string;
  createdAt: string;
  updatedAt: string;
}

// ==================== Module Data Types ====================

// Folders Module
export interface FolderItem {
  id: string;
  blockId: string;
  parentId: string | null;
  type: 'folder' | 'note';
  name: string;
  content?: string; // For notes only
  tags: string[];
  createdAt: string;
  updatedAt: string;
  order: number;
}

// Cards Module  
export interface CardItem {
  id: string;
  blockId: string;
  title: string;
  content: string;
  color: string;
  tags: string[];
  category?: string;
  priority?: 'low' | 'medium' | 'high';
  dueDate?: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
  order: number;
}

// Links Module
export interface LinkItem {
  id: string;
  blockId: string;
  title: string;
  url: string;
  description?: string;
  favicon?: string;
  tags: string[];
  category?: string;
  createdAt: string;
  updatedAt: string;
  order: number;
}

// Commands Module
export interface CommandItem {
  id: string;
  blockId: string;
  title: string;
  command: string;
  description?: string;
  category?: string;
  tags: string[];
  copyCount: number;
  createdAt: string;
  updatedAt: string;
  order: number;
}

// ==================== Sync Types ====================

export type SyncStatus = 'synced' | 'syncing' | 'pending' | 'offline' | 'conflict' | 'error';

export interface SyncConfig {
  token: string;
  repository: string;
  branch: string;
  autoSync: boolean;
  debounceMs: number;
  lastSyncedAt?: string;
}

export interface SyncState {
  status: SyncStatus;
  pendingChanges: number;
  lastError?: string;
  isOnline: boolean;
}

// ==================== UI Types ====================

export interface ThemeConfig {
  mode: 'light' | 'dark' | 'system';
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    textMuted: string;
    border: string;
  };
  fonts: {
    ui: string;
    editor: string;
    mono: string;
  };
  editor: {
    fontSize: number;
    lineHeight: number;
    showLineNumbers: boolean;
  };
}

// ==================== Factory Functions ====================

export function createWorkspace(partial: Partial<Workspace> = {}): Workspace {
  const now = new Date().toISOString();
  return {
    id: nanoid(),
    name: 'New Workspace',
    icon: '📁',
    blocks: [],
    createdAt: now,
    updatedAt: now,
    ...partial,
  };
}

export function createBlock(type: BlockType, workspaceId: string, partial: Partial<Block> = {}): Block {
  const now = new Date().toISOString();
  const defaults: Record<BlockType, { name: string; icon: string; color: string }> = {
    folders: { name: 'Notes', icon: 'folder', color: '#6366f1' },
    cards: { name: 'Cards', icon: 'layout-grid', color: '#8b5cf6' },
    links: { name: 'Links', icon: 'link', color: '#06b6d4' },
    commands: { name: 'Commands', icon: 'terminal', color: '#22c55e' },
  };
  
  return {
    id: nanoid(),
    type,
    workspaceId,
    ...defaults[type],
    createdAt: now,
    updatedAt: now,
    ...partial,
  };
}

export function createFolderItem(blockId: string, partial: Partial<FolderItem> = {}): FolderItem {
  const now = new Date().toISOString();
  return {
    id: nanoid(),
    blockId,
    parentId: null,
    type: 'note',
    name: 'Untitled',
    content: '',
    tags: [],
    createdAt: now,
    updatedAt: now,
    order: 0,
    ...partial,
  };
}

export function createCardItem(blockId: string, partial: Partial<CardItem> = {}): CardItem {
  const now = new Date().toISOString();
  return {
    id: nanoid(),
    blockId,
    title: 'New Card',
    content: '',
    color: '#6366f1',
    tags: [],
    completed: false,
    createdAt: now,
    updatedAt: now,
    order: 0,
    ...partial,
  };
}

export function createLinkItem(blockId: string, partial: Partial<LinkItem> = {}): LinkItem {
  const now = new Date().toISOString();
  return {
    id: nanoid(),
    blockId,
    title: 'New Link',
    url: '',
    tags: [],
    createdAt: now,
    updatedAt: now,
    order: 0,
    ...partial,
  };
}

export function createCommandItem(blockId: string, partial: Partial<CommandItem> = {}): CommandItem {
  const now = new Date().toISOString();
  return {
    id: nanoid(),
    blockId,
    title: 'New Command',
    command: '',
    tags: [],
    copyCount: 0,
    createdAt: now,
    updatedAt: now,
    order: 0,
    ...partial,
  };
}

// ==================== Defaults ====================

export const defaultTheme: ThemeConfig = {
  mode: 'dark',
  colors: {
    primary: '#6366f1',
    secondary: '#8b5cf6',
    accent: '#22d3ee',
    background: '#0a0a0b',
    surface: '#141415',
    text: '#fafafa',
    textMuted: '#71717a',
    border: '#27272a',
  },
  fonts: {
    ui: 'Inter, system-ui, sans-serif',
    editor: 'Inter, system-ui, sans-serif',
    mono: 'JetBrains Mono, monospace',
  },
  editor: {
    fontSize: 16,
    lineHeight: 1.6,
    showLineNumbers: false,
  },
};

export const defaultSyncConfig: SyncConfig = {
  token: '',
  repository: '',
  branch: 'main',
  autoSync: true,
  debounceMs: 2000,
};

// Initial workspace with sample data
export const createInitialWorkspace = (): Workspace => {
  const workspace = createWorkspace({ name: 'Personal', icon: '🏠' });
  const foldersBlock = createBlock('folders', workspace.id, { name: 'Notes' });
  const cardsBlock = createBlock('cards', workspace.id, { name: 'Tasks' });
  const linksBlock = createBlock('links', workspace.id, { name: 'Bookmarks' });
  
  workspace.blocks = [foldersBlock, cardsBlock, linksBlock];
  return workspace;
};
