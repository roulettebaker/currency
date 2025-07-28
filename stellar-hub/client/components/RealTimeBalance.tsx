import React, { useEffect, useState } from 'react';
import { useSafeBalance } from '../hooks/useSafeBalance';
import { useBalance } from '../contexts/BalanceContext';

interface RealTimeBalanceProps {
  tokenId: string;
  tokenSymbol: string;
  walletId?: string;
}

export default function RealTimeBalance({ tokenId, tokenSymbol, walletId }: RealTimeBalanceProps) {
  const { balance, usdValue, hasChanged, formatted } = useSafeBalance(tokenId, walletId);
  const { getLastChangeTime } = useBalance();
  const [isRecentlyChanged, setIsRecentlyChanged] = useState(false);
  const [lastBalance, setLastBalance] = useState(balance);

  // Force re-render when balance changes
  useEffect(() => {
    if (balance !== lastBalance) {
      console.log(`💰 Balance changed for ${tokenSymbol}: ${lastBalance} → ${balance}`);
      setLastBalance(balance);
      setIsRecentlyChanged(true);
      setTimeout(() => setIsRecentlyChanged(false), 1000);
    }
  }, [balance, lastBalance, tokenSymbol]);

  // Enhanced change detection for Chrome Extension
  useEffect(() => {
    if (walletId) {
      const lastChange = getLastChangeTime(walletId, tokenId.toLowerCase());
      if (lastChange) {
        const timeSinceChange = Date.now() - lastChange.getTime();
        // Show change indicator for 3 seconds
        if (timeSinceChange < 3000) {
          setIsRecentlyChanged(true);
          const timeout = setTimeout(() => {
            setIsRecentlyChanged(false);
          }, 3000 - timeSinceChange);
          return () => clearTimeout(timeout);
        }
      }
    }
  }, [balance, walletId, tokenId, getLastChangeTime]);

  const showHighlight = hasChanged || isRecentlyChanged;

  return (
    <div className="transition-all duration-300">
      <div className="text-white font-semibold">
        {formatted}
      </div>
      <div className="text-muted-foreground">
        ≈${usdValue.toFixed(2)}
      </div>
    </div>
  );
}
