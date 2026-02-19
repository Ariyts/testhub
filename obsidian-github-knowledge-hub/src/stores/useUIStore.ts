import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ThemeConfig, SyncConfig, SyncStatus, defaultTheme, defaultSyncConfig } from '@/types';

interface UIState {
  // Panels
  secondPanelOpen: boolean;
  backlinksOpen: boolean;
  graphOpen: boolean;
  
  // Modals
  quickSwitcherOpen: boolean;
  commandPaletteOpen: boolean;
  settingsOpen: boolean;
  blockCreatorOpen: boolean;
  
  // Sync
  syncStatus: SyncStatus;
  pendingChanges: number;
  isOnline: boolean;
  
  // Config
  theme: ThemeConfig;
  syncConfig: SyncConfig;
  
  // Actions
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

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      // Initial state
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

      // Actions
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
    }),
    {
      name: 'knowledge-hub-ui',
      partialize: (state) => ({
        secondPanelOpen: state.secondPanelOpen,
        backlinksOpen: state.backlinksOpen,
        theme: state.theme,
        syncConfig: state.syncConfig,
      }),
    }
  )
);
