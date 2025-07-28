import { useState, useEffect } from 'react';
import { useBalance } from '../contexts/BalanceContext';
import { useWallet } from '../contexts/WalletContext';

// Hook for reactive balance that updates in real-time across all pages
export function useReactiveBalance(token: string, walletId?: string) {
  const { getBalance, subscribeToBalance } = useBalance();
  const { selectedWallet } = useWallet();
  
  const targetWalletId = walletId || selectedWallet?.id || '';
  const [balance, setBalance] = useState(() => getBalance(targetWalletId, token));
  const [hasChanged, setHasChanged] = useState(false);

  useEffect(() => {
    if (!targetWalletId) return;

    // Subscribe to balance changes for this specific token
    const unsubscribe = subscribeToBalance(targetWalletId, token, (newBalance) => {
      const oldBalance = balance;
      setBalance(newBalance);
      
      // Flash change indicator
      if (oldBalance !== newBalance) {
        setHasChanged(true);
        setTimeout(() => setHasChanged(false), 2000);
      }
    });

    // Update initial balance
    setBalance(getBalance(targetWalletId, token));

    return unsubscribe;
  }, [targetWalletId, token, getBalance, subscribeToBalance, balance]);

  return {
    balance,
    hasChanged,
    formatted: balance.toFixed(8),
    shortFormatted: balance.toFixed(4)
  };
}

// Hook for getting all balances for a wallet
export function useWalletBalances(walletId?: string) {
  const { balances, refreshBalances, lastUpdated } = useBalance();
  const { selectedWallet } = useWallet();
  
  const targetWalletId = walletId || selectedWallet?.id || '';
  const walletBalances = balances[targetWalletId] || {};

  return {
    balances: walletBalances,
    refreshBalances,
    lastUpdated,
    isEmpty: Object.keys(walletBalances).length === 0
  };
}

// Hook for balance with USD conversion
export function useBalanceWithUSD(token: string, walletId?: string) {
  const { balance, hasChanged } = useReactiveBalance(token, walletId);
  
  // Mock prices (you can replace with real price API)
  const prices: { [key: string]: number } = {
    eth: 3674.83,
    btc: 67892.40,
    bnb: 771.64,
    usdc: 1.00,
    usdt: 1.00,
    pol: 0.45,
    trx: 0.20
  };

  const price = prices[token.toLowerCase()] || 0;
  const usdValue = balance * price;

  return {
    balance,
    usdValue,
    hasChanged,
    formatted: {
      balance: balance.toFixed(8),
      usd: usdValue.toFixed(2)
    }
  };
}
