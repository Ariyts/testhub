import { FoldersSidebar } from './folders/FoldersSidebar';
import { FoldersContent } from './folders/FoldersContent';
import { CardsSidebar } from './cards/CardsSidebar';
import { CardsContent } from './cards/CardsContent';
import { LinksSidebar } from './links/LinksSidebar';
import { LinksContent } from './links/LinksContent';
import { CommandsSidebar } from './commands/CommandsSidebar';
import { CommandsContent } from './commands/CommandsContent';
import { BlockType } from '@/types';

export interface ModuleDefinition {
  type: BlockType;
  name: string;
  icon: string;
  description: string;
  SidebarComponent: React.ComponentType<{ blockId: string }>;
  ContentComponent: React.ComponentType<{ blockId: string }>;
}

export const moduleRegistry: Record<BlockType, ModuleDefinition> = {
  folders: {
    type: 'folders',
    name: 'Notes',
    icon: 'folder',
    description: 'Markdown notes with folders, wikilinks, and backlinks',
    SidebarComponent: FoldersSidebar,
    ContentComponent: FoldersContent,
  },
  cards: {
    type: 'cards',
    name: 'Cards',
    icon: 'layout-grid',
    description: 'Quick capture cards for tasks and ideas',
    SidebarComponent: CardsSidebar,
    ContentComponent: CardsContent,
  },
  links: {
    type: 'links',
    name: 'Links',
    icon: 'link',
    description: 'Bookmark manager with categories and tags',
    SidebarComponent: LinksSidebar,
    ContentComponent: LinksContent,
  },
  commands: {
    type: 'commands',
    name: 'Commands',
    icon: 'terminal',
    description: 'Save and organize shell commands',
    SidebarComponent: CommandsSidebar,
    ContentComponent: CommandsContent,
  },
};

export function getModule(type: BlockType): ModuleDefinition {
  return moduleRegistry[type];
}
