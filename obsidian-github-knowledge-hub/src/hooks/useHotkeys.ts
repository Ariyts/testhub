import { useEffect } from 'react';
import { useUIStore } from '@/stores/useUIStore';
import { useWorkspaceStore } from '@/stores/useWorkspaceStore';

export function useHotkeys() {
  const openQuickSwitcher = useUIStore((s) => s.openQuickSwitcher);
  const openCommandPalette = useUIStore((s) => s.openCommandPalette);
  const toggleSecondPanel = useUIStore((s) => s.toggleSecondPanel);
  const toggleGraph = useUIStore((s) => s.toggleGraph);
  const toggleBacklinks = useUIStore((s) => s.toggleBacklinks);
  
  const addFolderItem = useWorkspaceStore((s) => s.addFolderItem);
  const setActiveItem = useWorkspaceStore((s) => s.setActiveItem);
  const activeBlockId = useWorkspaceStore((s) => s.activeBlockId);
  const getBlock = useWorkspaceStore((s) => s.getBlock);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMod = e.metaKey || e.ctrlKey;
      const isShift = e.shiftKey;

      if (isMod && e.key === 'o') {
        e.preventDefault();
        openQuickSwitcher();
      } else if (isMod && e.key === 'p') {
        e.preventDefault();
        openCommandPalette();
      } else if (isMod && e.key === 'n') {
        e.preventDefault();
        if (activeBlockId) {
          const block = getBlock(activeBlockId);
          if (block?.type === 'folders') {
            const item = addFolderItem(activeBlockId, { name: 'Untitled', type: 'note' });
            setActiveItem(item.id);
          }
        }
      } else if (isMod && e.key === 'g') {
        e.preventDefault();
        toggleGraph();
      } else if (isMod && e.key === '\\') {
        e.preventDefault();
        toggleSecondPanel();
      } else if (isMod && isShift && e.key === 'b') {
        e.preventDefault();
        toggleBacklinks();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [openQuickSwitcher, openCommandPalette, addFolderItem, setActiveItem, activeBlockId, getBlock, toggleGraph, toggleSecondPanel, toggleBacklinks]);
}
