import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useWallet } from './WalletContext';
import { walletApi } from '../lib/api';
import { shouldSkipAPICall, markAPIAsFailed, markAPIAsWorking } from '../lib/networkUtils';

interface BalanceState {
  [walletId: string]: {
    [token: string]: number;
  };
}

interface BalanceContextType {
  balances: BalanceState;
  getBalance: (walletId: string, token: string) => number;
  updateBalance: (walletId: string, token: string, amount: number) => Promise<void>;
  refreshBalances: () => Promise<void>;
  subscribeToBalance: (walletId: string, token: string, callback: (balance: number) => void) => () => void;
  lastUpdated: Date | null;
  isLoading: boolean;
  isOnline: boolean;
  retryCount: number;
  // Chrome Extension optimizations
  forceUpdate: () => void;
  getLastChangeTime: (walletId: string, token: string) => Date | null;
  setOptimisticBalance: (walletId: string, token: string, amount: number) => void;
}

const BalanceContext = createContext<BalanceContextType | undefined>(undefined);

export function useBalance() {
  const context = useContext(BalanceContext);
  if (!context) {
    throw new Error('useBalance must be used within BalanceProvider');
  }
  return context;
}

interface BalanceProviderProps {
  children: ReactNode;
}

export function BalanceProvider({ children }: BalanceProviderProps) {
  const [balances, setBalances] = useState<BalanceState>({});
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [subscribers, setSubscribers] = useState<Map<string, Set<(balance: number) => void>>>(new Map());
  const [isOnline, setIsOnline] = useState(true);
  const [retryCount, setRetryCount] = useState(0);
  const [lastChangeMap, setLastChangeMap] = useState<Map<string, Date>>(new Map());
  const [updateTrigger, setUpdateTrigger] = useState(0);

  const { selectedWallet, wallets } = useWallet();

  // Get balance for specific wallet and token - memoized to prevent re-renders
  const getBalance = useCallback((walletId: string, token: string): number => {
    return balances[walletId]?.[token] || 0;
  }, [balances]);

  // Subscribe to balance changes for specific wallet+token
  const subscribeToBalance = useCallback((walletId: string, token: string, callback: (balance: number) => void) => {
    const key = `${walletId}:${token}`;
    const currentSubs = subscribers.get(key) || new Set();
    currentSubs.add(callback);
    setSubscribers(prev => new Map(prev).set(key, currentSubs));

    // Return unsubscribe function
    return () => {
      const subs = subscribers.get(key);
      if (subs) {
        subs.delete(callback);
        if (subs.size === 0) {
          setSubscribers(prev => {
            const newMap = new Map(prev);
            newMap.delete(key);
            return newMap;
          });
        }
      }
    };
  }, [subscribers]);

  // Notify subscribers when balance changes
  const notifySubscribers = useCallback((walletId: string, token: string, newBalance: number) => {
    const key = `${walletId}:${token}`;
    const subs = subscribers.get(key);
    if (subs) {
      subs.forEach(callback => callback(newBalance));
    }

    // Track change time for Chrome Extension optimization
    setLastChangeMap(prev => new Map(prev).set(key, new Date()));
  }, [subscribers]);

  // Refresh all balances from database
  const refreshBalances = useCallback(async () => {
    if (!wallets.length) return;

    setIsLoading(true);

    // Skip API calls entirely if we've had too many failures
    if (retryCount >= 3) {
      console.log('🔄 Skipping API calls due to repeated failures, using cached data');
      const cachedBalances: BalanceState = {};
      wallets.forEach(wallet => {
        cachedBalances[wallet.id] = wallet.balance || {};
      });
      setBalances(cachedBalances);
      setIsLoading(false);
      return;
    }

    try {
      const newBalances: BalanceState = {};

      for (const wallet of wallets) {
        // Always start with cached data
        newBalances[wallet.id] = wallet.balance || {};

        try {
          // Only try API if we haven't failed too many times and network is available
          if (retryCount < 2 && !shouldSkipAPICall()) {
            const response = await walletApi.getWallet(wallet.id);

            if (response && response.success && response.wallet) {
              newBalances[wallet.id] = response.wallet.balance || {};
              console.log(`✅ Refreshed balance for wallet ${wallet.id}`);
              markAPIAsWorking();
            }
          } else if (shouldSkipAPICall()) {
            console.log(`⚠️ Skipping API call for wallet ${wallet.id}, using cached balance`);
          }
        } catch (error) {
          // Mark API as failed and continue with cached data
          markAPIAsFailed();
          console.log(`⚠️ API failed for wallet ${wallet.id}, using cached balance`);
        }
      }

      // Update state and notify subscribers
      setBalances(prev => {
        const updated = { ...prev, ...newBalances };
        
        // Notify all subscribers of changes
        Object.entries(newBalances).forEach(([walletId, tokenBalances]) => {
          Object.entries(tokenBalances).forEach(([token, balance]) => {
            const oldBalance = prev[walletId]?.[token] || 0;
            if (oldBalance !== balance) {
              notifySubscribers(walletId, token, balance);
            }
          });
        });
        
        return updated;
      });

      setLastUpdated(new Date());
      setIsOnline(true);
      setRetryCount(0);
      console.log('✅ Balances refreshed successfully');
    } catch (error) {
      console.error('❌ Failed to refresh balances:', error);
      setIsOnline(false);
      setRetryCount(prev => prev + 1);

      // Don't throw the error - just log it and continue with cached data
    } finally {
      setIsLoading(false);
    }
  }, [wallets, notifySubscribers]);

  // Set optimistic balance (for immediate UI updates in Chrome Extension)
  const setOptimisticBalance = useCallback((walletId: string, token: string, amount: number) => {
    setBalances(prev => {
      const updated = {
        ...prev,
        [walletId]: {
          ...prev[walletId],
          [token]: amount
        }
      };

      // Immediate notification for instant UI updates
      notifySubscribers(walletId, token, amount);

      return updated;
    });

    // Force immediate re-render across all components
    setUpdateTrigger(prev => prev + 1);
  }, [notifySubscribers]);

  // Update single balance (optimistic + API sync)
  const updateBalance = useCallback(async (walletId: string, token: string, amount: number) => {
    // Immediate optimistic update for Chrome Extension responsiveness
    setOptimisticBalance(walletId, token, amount);
    setLastUpdated(new Date());

    // Skip API sync if we've had network issues or should skip API calls
    if (retryCount >= 2 || shouldSkipAPICall()) {
      console.log('💾 Balance updated locally (API disabled due to network issues)');
      return;
    }

    try {
      await walletApi.updateWalletBalance(walletId, token, amount);
      console.log(`✅ Balance synced to database: ${token} = ${amount}`);
      setIsOnline(true);
      markAPIAsWorking();
    } catch (error) {
      // Mark API as failed and continue with local update
      markAPIAsFailed();
      setIsOnline(false);
      console.log('⚠️ Failed to sync balance to API, keeping local update');
    }
  }, [notifySubscribers, retryCount, setOptimisticBalance]);

  // Smart auto-refresh optimized for Chrome Extension
  useEffect(() => {
    // Initial load
    refreshBalances();

    // Don't set up auto-refresh if we're having persistent network issues
    if (retryCount >= 3) {
      console.log('🚫 Auto-refresh disabled due to persistent network issues');
      return;
    }

    // More frequent updates for Chrome Extension (reduced intervals)
    const getRetryInterval = () => {
      if (retryCount === 0) return 15000; // 15 seconds when working (faster for extension)
      if (retryCount === 1) return 30000; // 30 seconds after first failure
      return 60000; // 1 minute after second failure
    };

    const interval = setInterval(() => {
      if (retryCount < 3) {
        refreshBalances();
      }
    }, getRetryInterval());

    return () => clearInterval(interval);
  }, [refreshBalances, retryCount]);

  // Refresh on wallet change and force update trigger (Chrome Extension optimization)
  useEffect(() => {
    if (selectedWallet && retryCount < 2) {
      refreshBalances();
    }
  }, [selectedWallet?.id, refreshBalances, retryCount, updateTrigger]);

  // Chrome Extension utility functions
  const forceUpdate = useCallback(() => {
    setUpdateTrigger(prev => prev + 1);
  }, []);

  const getLastChangeTime = useCallback((walletId: string, token: string): Date | null => {
    const key = `${walletId}:${token}`;
    return lastChangeMap.get(key) || null;
  }, [lastChangeMap]);

  const value = {
    balances,
    getBalance,
    updateBalance,
    refreshBalances,
    subscribeToBalance,
    lastUpdated,
    isLoading,
    isOnline,
    retryCount,
    // Chrome Extension optimizations
    forceUpdate,
    getLastChangeTime,
    setOptimisticBalance
  };

  return (
    <BalanceContext.Provider value={value}>
      {children}
    </BalanceContext.Provider>
  );
}
