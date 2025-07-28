import { useState, useEffect } from 'react';
import { useWallet } from '../contexts/WalletContext';

// Safe balance hook that never throws network errors
export function useSafeBalance(token: string, walletId?: string) {
  const { selectedWallet, wallets } = useWallet();
  const targetWallet = walletId 
    ? wallets.find(w => w.id === walletId)
    : selectedWallet;
    
  const [balance, setBalance] = useState(0);
  const [hasChanged, setHasChanged] = useState(false);

  useEffect(() => {
    if (targetWallet?.balance) {
      const newBalance = targetWallet.balance[token] || 0;

      if (newBalance !== balance) {
        console.log(`🔄 useSafeBalance: ${token} balance ${balance} → ${newBalance}`);
        setBalance(newBalance);
        setHasChanged(true);
        setTimeout(() => setHasChanged(false), 2000);
      }
    }
  }, [targetWallet?.balance, targetWallet?.updatedAt, token, balance]);

  return {
    balance,
    hasChanged,
    formatted: balance.toFixed(8),
    usdValue: balance * getPriceForToken(token)
  };
}

// Safe price lookup
function getPriceForToken(token: string): number {
  const prices: { [key: string]: number } = {
    eth: 3674.83,
    btc: 67892.40,
    bnb: 771.64,
    usdc: 1.00,
    usdt: 1.00,
    pol: 0.45,
    trx: 0.20
  };
  return prices[token.toLowerCase()] || 0;
}
