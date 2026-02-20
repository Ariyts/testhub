import { useEffect, useState } from 'react';
import { CloudOff, RefreshCw, Check, Loader2 } from 'lucide-react';
import { cn } from '@/utils/cn';
import { useUIStore } from '@/stores/useUIStore';
import type { SyncStatus } from '@/types';

export function SyncIndicator() {
  const syncStatus = useUIStore((s) => s.syncStatus);
  const pendingChanges = useUIStore((s) => s.pendingChanges);
  const isOnline = useUIStore((s) => s.isOnline);
  const setIsOnline = useUIStore((s) => s.setIsOnline);
  const syncConfig = useUIStore((s) => s.syncConfig);
  
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    setIsOnline(navigator.onLine);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [setIsOnline]);

  useEffect(() => {
    if (pendingChanges > 0 && syncConfig.autoSync) {
      const timer = setTimeout(() => { setLastSyncTime(new Date()); }, syncConfig.debounceMs || 2000);
      return () => clearTimeout(timer);
    }
  }, [pendingChanges, syncConfig.autoSync, syncConfig.debounceMs]);

  const statusConfig: Record<SyncStatus, { icon: React.ReactNode; label: string; color: string }> = {
    synced: { icon: <Check size={12} />, label: lastSyncTime ? 'Synced' : 'Synced', color: 'text-emerald-400' },
    syncing: { icon: <Loader2 size={12} className="animate-spin" />, label: 'Syncing...', color: 'text-indigo-400' },
    pending: { icon: <RefreshCw size={12} />, label: `${pendingChanges} pending`, color: 'text-amber-400' },
    offline: { icon: <CloudOff size={12} />, label: 'Offline', color: 'text-zinc-500' },
    conflict: { icon: <RefreshCw size={12} />, label: 'Conflict', color: 'text-red-400' },
    error: { icon: <RefreshCw size={12} />, label: 'Error', color: 'text-red-400' },
  };

  const config = statusConfig[syncStatus];

  return (
    <div className={cn('flex items-center gap-1.5 px-2 py-1 rounded text-xs transition-colors', config.color)} title={syncConfig.repository ? `Syncing to ${syncConfig.repository}` : 'Configure GitHub sync in Settings'}>
      {config.icon}
      <span>{config.label}</span>
    </div>
  );
}
