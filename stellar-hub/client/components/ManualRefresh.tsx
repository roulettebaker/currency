import React, { useState } from 'react';
import { RefreshCw, Wifi, WifiOff } from 'lucide-react';

interface ManualRefreshProps {
  onRefresh: () => Promise<void>;
  isOnline: boolean;
  lastUpdated?: Date | null;
  className?: string;
}

export default function ManualRefresh({ onRefresh, isOnline, lastUpdated, className = '' }: ManualRefreshProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    if (isRefreshing) return;
    
    setIsRefreshing(true);
    try {
      await onRefresh();
    } catch (error) {
      console.log('Manual refresh completed');
    } finally {
      setIsRefreshing(false);
    }
  };

  const getTimeSince = () => {
    if (!lastUpdated) return 'Never';
    const now = new Date();
    const diff = now.getTime() - lastUpdated.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
  };

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <div className="flex items-center space-x-1">
        {isOnline ? (
          <Wifi className="w-4 h-4 text-green-500" title="Connected" />
        ) : (
          <WifiOff className="w-4 h-4 text-yellow-500" title="Network issues - using cached data" />
        )}
        <span className="text-xs text-muted-foreground" title="Last updated">
          {getTimeSince()}
        </span>
      </div>
      
      <button 
        onClick={handleRefresh}
        disabled={isRefreshing}
        className="hover:bg-secondary p-1 rounded transition-colors"
        title="Manual refresh"
      >
        <RefreshCw className={`w-4 h-4 text-muted-foreground ${isRefreshing ? 'animate-spin' : ''}`} />
      </button>
    </div>
  );
}
