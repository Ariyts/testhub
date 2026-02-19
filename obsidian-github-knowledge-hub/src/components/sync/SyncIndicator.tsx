import { useEffect, useState } from 'react';
import { CloudOff, RefreshCw, AlertCircle, Check, Loader2 } from 'lucide-react';
import { cn } from '@/utils/cn';
import { useUIStore } from '@/stores/useUIStore';
import type { SyncStatus } from '@/types';

export function SyncIndicator() {
  const syncStatus = useUIStore((s) => s.syncStatus);
  const setSyncStatus = useUIStore((s) => s.setSyncStatus);
  const pendingChanges = useUIStore((s) => s.pendingChanges);
  const isOnline = useUIStore((s) => s.isOnline);
  const setIsOnline = useUIStore((s) => s.setIsOnline);
  const syncConfig = useUIStore((s) => s.syncConfig);
  
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);

  // Monitor online status
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

  // Auto-sync simulation
  useEffect(() => {
    if (!isOnline) {
      setSyncStatus('offline');
      return;
    }

    if (pendingChanges > 0 && syncConfig.autoSync) {
      setSyncStatus('syncing');
      
      // Simulate sync with debounce
      const timer = setTimeout(() => {
        setSyncStatus('synced');
        setLastSyncTime(new Date());
      }, syncConfig.debounceMs || 2000);
      
      return () => clearTimeout(timer);
    }
  }, [pendingChanges, isOnline, syncConfig.autoSync, syncConfig.debounceMs, setSyncStatus]);

  const statusConfig: Record<SyncStatus, { icon: React.ReactNode; label: string; color: string }> = {
    synced: {
      icon: <Check size={12} />,
      label: lastSyncTime ? `Synced ${formatTimeAgo(lastSyncTime)}` : 'Synced',
      color: 'text-emerald-400',
    },
    syncing: {
      icon: <Loader2 size={12} className="animate-spin" />,
      label: 'Syncing...',
      color: 'text-indigo-400',
    },
    pending: {
      icon: <RefreshCw size={12} />,
      label: `${pendingChanges} pending`,
      color: 'text-amber-400',
    },
    offline: {
      icon: <CloudOff size={12} />,
      label: 'Offline',
      color: 'text-zinc-500',
    },
    conflict: {
      icon: <AlertCircle size={12} />,
      label: 'Conflict',
      color: 'text-red-400',
    },
    error: {
      icon: <AlertCircle size={12} />,
      label: 'Error',
      color: 'text-red-400',
    },
  };

  const config = statusConfig[syncStatus];

  return (
    <div
      className={cn(
        'flex items-center gap-1.5 px-2 py-1 rounded text-xs transition-colors',
        config.color
      )}
      title={syncConfig.repository ? `Syncing to ${syncConfig.repository}` : 'Configure GitHub sync in Settings'}
    >
      {config.icon}
      <span>{config.label}</span>
    </div>
  );
}

function formatTimeAgo(date: Date): string {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}
