import React from 'react';
import { useSafeBalance } from '../hooks/useSafeBalance';

interface SyncedBalanceProps {
  token: string;
  walletId?: string;
  showUSD?: boolean;
  showSymbol?: boolean;
  precision?: number;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

// Universal component that syncs balance across ALL pages
export default function SyncedBalance({
  token,
  walletId,
  showUSD = true,
  showSymbol = true,
  precision = 8,
  className = '',
  size = 'md'
}: SyncedBalanceProps) {
  const { balance, usdValue, hasChanged } = useSafeBalance(token, walletId);

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return {
          balance: 'text-sm font-medium',
          usd: 'text-xs',
          symbol: 'text-xs'
        };
      case 'lg':
        return {
          balance: 'text-2xl font-bold',
          usd: 'text-lg',
          symbol: 'text-lg'
        };
      default:
        return {
          balance: 'text-base font-semibold',
          usd: 'text-sm',
          symbol: 'text-sm'
        };
    }
  };

  const sizeClasses = getSizeClasses();

  return (
    <div className={`transition-all duration-300 ${className}`}>
      <div className={`text-white ${sizeClasses.balance}`}>
        {balance.toFixed(precision)}
        {showSymbol && (
          <span className={`ml-1 text-muted-foreground ${sizeClasses.symbol}`}>
            {token.toUpperCase()}
          </span>
        )}
      </div>
      {showUSD && (
        <div className={`text-muted-foreground ${sizeClasses.usd}`}>
          ≈${usdValue.toFixed(2)}
        </div>
      )}
    </div>
  );
}

// Specialized components for common use cases
export function BalanceDisplay({ token, walletId, className }: { token: string, walletId?: string, className?: string }) {
  return (
    <SyncedBalance 
      token={token} 
      walletId={walletId}
      showUSD={true}
      showSymbol={true}
      precision={8}
      size="md"
      className={className}
    />
  );
}

export function LargeBalanceDisplay({ token, walletId, className }: { token: string, walletId?: string, className?: string }) {
  return (
    <SyncedBalance 
      token={token} 
      walletId={walletId}
      showUSD={true}
      showSymbol={false}
      precision={6}
      size="lg"
      className={className}
    />
  );
}

export function CompactBalance({ token, walletId, className }: { token: string, walletId?: string, className?: string }) {
  return (
    <SyncedBalance 
      token={token} 
      walletId={walletId}
      showUSD={false}
      showSymbol={true}
      precision={4}
      size="sm"
      className={className}
    />
  );
}
