import React, { useState } from 'react';
import { useBalance } from '../contexts/BalanceContext';
import { useWallet } from '../contexts/WalletContext';
import { Database, Plus, Minus, RefreshCw, Eye } from 'lucide-react';

export default function BalanceSyncDemo() {
  const [isVisible, setIsVisible] = useState(false);
  const { selectedWallet } = useWallet();

  // Safe balance context usage
  const balanceState = React.useMemo(() => {
    try {
      const { useBalance } = require('../contexts/BalanceContext');
      return useBalance();
    } catch (error) {
      return {
        updateBalance: async () => {},
        refreshBalances: async () => {},
        lastUpdated: null,
        isLoading: false,
        isOnline: false,
        retryCount: 0
      };
    }
  }, []);

  const { updateBalance, refreshBalances, lastUpdated, isLoading, isOnline, retryCount } = balanceState;

  if (!selectedWallet) return null;

  const updateTokenBalance = async (token: string, change: number) => {
    const currentBalance = selectedWallet.balance[token] || 0;
    const newBalance = Math.max(0, currentBalance + change);
    await updateBalance(selectedWallet.id, token, newBalance);
  };

  return (
    <div className="fixed bottom-20 right-4 z-50">
      {/* Toggle Button */}
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 mb-2 flex items-center space-x-2"
        title="Balance Sync Demo"
      >
        <Database className="w-5 h-5" />
        <span className="text-xs">Sync Test</span>
      </button>

      {/* Demo Panel */}
      {isVisible && (
        <div className="bg-secondary border border-border rounded-lg p-4 shadow-xl min-w-[350px]">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-white font-medium flex items-center space-x-2">
              <Eye className="w-4 h-4" />
              <span>Balance Sync Demo</span>
            </h3>
            <button
              onClick={refreshBalances}
              className={`text-muted-foreground hover:text-white ${isLoading ? 'animate-spin' : ''}`}
              title="Refresh from MongoDB"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
          
          <div className="space-y-3">
            <div className="text-xs text-muted-foreground mb-2">
              🎯 <strong>Test Instructions:</strong><br/>
              1. Change balances below<br/>
              2. Navigate to other pages<br/>
              3. See balances sync instantly!
            </div>
            
            {/* ETH Controls */}
            <div className="flex items-center justify-between bg-background p-2 rounded">
              <span className="text-white text-sm font-medium">ETH</span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => updateTokenBalance('eth', -0.01)}
                  className="bg-red-600 text-white p-1 rounded hover:bg-red-700"
                  title="Decrease ETH"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <span className="text-xs text-muted-foreground min-w-[60px] text-center">
                  {(selectedWallet.balance.eth || 0).toFixed(3)}
                </span>
                <button
                  onClick={() => updateTokenBalance('eth', 0.01)}
                  className="bg-green-600 text-white p-1 rounded hover:bg-green-700"
                  title="Increase ETH"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* USDT Controls */}
            <div className="flex items-center justify-between bg-background p-2 rounded">
              <span className="text-white text-sm font-medium">USDT</span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => updateTokenBalance('usdt', -10)}
                  className="bg-red-600 text-white p-1 rounded hover:bg-red-700"
                  title="Decrease USDT"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <span className="text-xs text-muted-foreground min-w-[60px] text-center">
                  {(selectedWallet.balance.usdt || 0).toFixed(0)}
                </span>
                <button
                  onClick={() => updateTokenBalance('usdt', 10)}
                  className="bg-green-600 text-white p-1 rounded hover:bg-green-700"
                  title="Increase USDT"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* BTC Controls */}
            <div className="flex items-center justify-between bg-background p-2 rounded">
              <span className="text-white text-sm font-medium">BTC</span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => updateTokenBalance('btc', -0.001)}
                  className="bg-red-600 text-white p-1 rounded hover:bg-red-700"
                  title="Decrease BTC"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <span className="text-xs text-muted-foreground min-w-[60px] text-center">
                  {(selectedWallet.balance.btc || 0).toFixed(5)}
                </span>
                <button
                  onClick={() => updateTokenBalance('btc', 0.001)}
                  className="bg-green-600 text-white p-1 rounded hover:bg-green-700"
                  title="Increase BTC"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-border">
            <div className="text-xs text-muted-foreground space-y-1">
              <div>✅ Changes sync instantly across ALL pages</div>
              <div className={`flex items-center space-x-1 ${isOnline ? 'text-green-400' : 'text-yellow-400'}`}>
                <span>{isOnline ? '🟢' : '🟡'}</span>
                <span>{isOnline ? 'Connected to MongoDB Atlas' : 'Using cached data'}</span>
              </div>
              {lastUpdated && (
                <div>🕐 Last sync: {lastUpdated.toLocaleTimeString()}</div>
              )}
              {retryCount > 0 && (
                <div className="text-yellow-400">⚠️ Connection issues (retry #{retryCount})</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
