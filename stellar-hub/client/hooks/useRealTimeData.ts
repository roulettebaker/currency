import { useEffect, useRef, useState } from 'react';
import { useWallet } from '../contexts/WalletContext';

// Enhanced hook for real-time data with immediate feedback
export function useRealTimeData() {
  const {
    selectedWallet,
    wallets,
    transactions,
    loading,
    error,
    lastUpdated,
    refreshWallets,
    refreshTransactions,
    updateBalance,
    createTransaction
  } = useWallet();

  const [isRefreshing, setIsRefreshing] = useState(false);
  const lastRefreshRef = useRef<Date | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Set up automatic polling for real-time updates
  useEffect(() => {
    // Start polling every 5 seconds (more reasonable for API stability)
    intervalRef.current = setInterval(() => {
      if (!loading && !isRefreshing) {
        console.log('🔄 Polling database for real-time updates...');
        refreshWallets();
      }
    }, 5000); // Poll every 5 seconds to avoid overwhelming API

    // Initial refresh
    if (!loading) {
      refreshWallets();
    }

    // Also refresh on window focus (when user switches back to extension)
    const handleFocus = () => {
      console.log('🎯 Window focused, force refreshing...');
      if (!loading && !isRefreshing) {
        refreshWallets();
      }
    };

    window.addEventListener('focus', handleFocus);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      window.removeEventListener('focus', handleFocus);
    };
  }, [refreshWallets, loading, isRefreshing]);

  // Manual refresh with loading state
  const manualRefresh = async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([
        refreshWallets(),
        refreshTransactions()
      ]);
      lastRefreshRef.current = new Date();
    } catch (error) {
      console.error('Refresh failed:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Update balance with immediate feedback
  const updateBalanceInstant = async (walletId: string, token: string, amount: number) => {
    // Instant local update for immediate feedback
    await updateBalance(walletId, token, amount);
    
    // Force refresh to sync with database
    setTimeout(manualRefresh, 100);
  };

  // Create transaction with immediate feedback
  const createTransactionInstant = async (txData: any) => {
    await createTransaction(txData);
    
    // Force refresh to sync with database
    setTimeout(manualRefresh, 100);
  };

  // Get time since last update
  const getTimeSinceUpdate = () => {
    if (!lastUpdated) return null;
    const now = new Date();
    const diff = now.getTime() - lastUpdated.getTime();
    const seconds = Math.floor(diff / 1000);
    
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
  };

  return {
    // Data
    selectedWallet,
    wallets,
    transactions,
    
    // Status
    loading: loading || isRefreshing,
    error,
    lastUpdated,
    timeSinceUpdate: getTimeSinceUpdate(),
    
    // Actions
    manualRefresh,
    updateBalanceInstant,
    createTransactionInstant,
    
    // Utils
    isOnline: !error || error === null,
    hasData: wallets.length > 0
  };
}

// Hook for components that need specific wallet data
export function useWalletData(walletId?: string) {
  const { wallets, selectedWallet, transactions } = useWallet();
  
  const targetWallet = walletId 
    ? wallets.find(w => w.id === walletId)
    : selectedWallet;
    
  const walletTransactions = transactions.filter(tx => 
    tx.walletId === targetWallet?.id
  );

  return {
    wallet: targetWallet,
    transactions: walletTransactions,
    balance: targetWallet?.balance || {},
    address: targetWallet?.address || '',
    name: targetWallet?.name || '',
  };
}

// Hook for watching specific balance changes
export function useBalanceUpdates(token: string) {
  const { selectedWallet, lastUpdated } = useWallet();
  const [previousBalance, setPreviousBalance] = useState<number | null>(null);
  const [hasChanged, setHasChanged] = useState(false);

  useEffect(() => {
    if (selectedWallet && selectedWallet.balance[token] !== undefined) {
      const currentBalance = selectedWallet.balance[token];
      
      if (previousBalance !== null && currentBalance !== previousBalance) {
        setHasChanged(true);
        setTimeout(() => setHasChanged(false), 2000); // Flash for 2 seconds
      }
      
      setPreviousBalance(currentBalance);
    }
  }, [selectedWallet?.balance[token], lastUpdated, token, previousBalance]);

  return {
    balance: selectedWallet?.balance[token] || 0,
    hasChanged,
    previousBalance
  };
}
