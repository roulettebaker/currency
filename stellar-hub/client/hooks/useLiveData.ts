import { useEffect, useRef } from 'react';
import { useWallet } from '../contexts/WalletContext';

// Hook for auto-refreshing wallet data
export function useLiveData(intervalMs: number = 30000) { // 30 seconds default
  const { refreshWallets, loading } = useWallet();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Only set up auto-refresh if not loading
    if (!loading) {
      intervalRef.current = setInterval(() => {
        refreshWallets();
      }, intervalMs);
    }

    // Cleanup on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [refreshWallets, intervalMs, loading]);

  // Manual refresh function
  const forceRefresh = () => {
    refreshWallets();
  };

  return { forceRefresh };
}

// Hook for watching wallet changes and triggering updates
export function useWalletSync() {
  const { selectedWallet, refreshWallets } = useWallet();

  useEffect(() => {
    // Refresh data when wallet changes
    if (selectedWallet) {
      refreshWallets();
    }
  }, [selectedWallet?.id, refreshWallets]);

  return { selectedWallet };
}
