import { create } from 'zustand';
import { ThemeConfig, SyncConfig, SyncStatus, defaultTheme, defaultSyncConfig } from '@/types';

interface UIState {
  secondPanelOpen: boolean;
  backlinksOpen: boolean;
  graphOpen: boolean;
  
  quickSwitcherOpen: boolean;
  commandPaletteOpen: boolean;
  settingsOpen: boolean;
  blockCreatorOpen: boolean;
  
  syncStatus: SyncStatus;
  pendingChanges: number;
  isOnline: boolean;
  
  theme: ThemeConfig;
  syncConfig: SyncConfig;
  
  toggleSecondPanel: () => void;
  toggleBacklinks: () => void;
  toggleGraph: () => void;
  openQuickSwitcher: () => void;
  closeQuickSwitcher: () => void;
  openCommandPalette: () => void;
  closeCommandPalette: () => void;
  openSettings: () => void;
  closeSettings: () => void;
  openBlockCreator: () => void;
  closeBlockCreator: () => void;
  setSyncStatus: (status: SyncStatus) => void;
  setPendingChanges: (count: number) => void;
  setIsOnline: (online: boolean) => void;
  updateTheme: (updates: Partial<ThemeConfig>) => void;
  updateSyncConfig: (updates: Partial<SyncConfig>) => void;
}

export const useUIStore = create<UIState>()((set) => ({
  secondPanelOpen: true,
  backlinksOpen: false,
  graphOpen: false,
  quickSwitcherOpen: false,
  commandPaletteOpen: false,
  settingsOpen: false,
  blockCreatorOpen: false,
  syncStatus: 'synced',
  pendingChanges: 0,
  isOnline: true,
  theme: defaultTheme,
  syncConfig: defaultSyncConfig,

  toggleSecondPanel: () => set((state) => ({ secondPanelOpen: !state.secondPanelOpen })),
  toggleBacklinks: () => set((state) => ({ backlinksOpen: !state.backlinksOpen })),
  toggleGraph: () => set((state) => ({ graphOpen: !state.graphOpen })),
  openQuickSwitcher: () => set({ quickSwitcherOpen: true }),
  closeQuickSwitcher: () => set({ quickSwitcherOpen: false }),
  openCommandPalette: () => set({ commandPaletteOpen: true }),
  closeCommandPalette: () => set({ commandPaletteOpen: false }),
  openSettings: () => set({ settingsOpen: true }),
  closeSettings: () => set({ settingsOpen: false }),
  openBlockCreator: () => set({ blockCreatorOpen: true }),
  closeBlockCreator: () => set({ blockCreatorOpen: false }),
  setSyncStatus: (status) => set({ syncStatus: status }),
  setPendingChanges: (count) => set({ pendingChanges: count }),
  setIsOnline: (online) => set({ isOnline: online }),
  updateTheme: (updates) => set((state) => ({ 
    theme: { ...state.theme, ...updates } 
  })),
  updateSyncConfig: (updates) => set((state) => ({ 
    syncConfig: { ...state.syncConfig, ...updates } 
  })),
}));
