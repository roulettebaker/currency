import React, { useState } from 'react';
import { useRealTimeData } from '../hooks/useRealTimeData';
import { Plus, Minus, RefreshCw, Database } from 'lucide-react';

export default function DemoControls() {
  const { selectedWallet, updateBalanceInstant, manualRefresh } = useRealTimeData();
  const [isVisible, setIsVisible] = useState(false);

  if (!selectedWallet) return null;

  const updateBalance = async (token: string, change: number) => {
    const currentBalance = selectedWallet.balance[token] || 0;
    const newBalance = Math.max(0, currentBalance + change);
    await updateBalanceInstant(selectedWallet.id, token, newBalance);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Toggle Button */}
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="bg-primary text-white p-3 rounded-full shadow-lg hover:bg-primary/90 mb-2"
        title="Demo Controls"
      >
        <Database className="w-5 h-5" />
      </button>

      {/* Controls Panel */}
      {isVisible && (
        <div className="bg-secondary border border-border rounded-lg p-4 shadow-xl min-w-[300px]">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-white font-medium">Demo Controls</h3>
            <button
              onClick={manualRefresh}
              className="text-muted-foreground hover:text-white"
              title="Force Refresh"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
          
          <div className="space-y-3">
            <div className="text-xs text-muted-foreground mb-2">
              Simulate balance changes to test real-time updates
            </div>
            
            {/* ETH Controls */}
            <div className="flex items-center justify-between">
              <span className="text-white text-sm">ETH</span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => updateBalance('eth', -0.01)}
                  className="bg-red-600 text-white p-1 rounded hover:bg-red-700"
                  title="Decrease ETH"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <span className="text-xs text-muted-foreground min-w-[60px] text-center">
                  {(selectedWallet.balance.eth || 0).toFixed(3)}
                </span>
                <button
                  onClick={() => updateBalance('eth', 0.01)}
                  className="bg-green-600 text-white p-1 rounded hover:bg-green-700"
                  title="Increase ETH"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* BTC Controls */}
            <div className="flex items-center justify-between">
              <span className="text-white text-sm">BTC</span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => updateBalance('btc', -0.001)}
                  className="bg-red-600 text-white p-1 rounded hover:bg-red-700"
                  title="Decrease BTC"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <span className="text-xs text-muted-foreground min-w-[60px] text-center">
                  {(selectedWallet.balance.btc || 0).toFixed(5)}
                </span>
                <button
                  onClick={() => updateBalance('btc', 0.001)}
                  className="bg-green-600 text-white p-1 rounded hover:bg-green-700"
                  title="Increase BTC"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* USDC Controls */}
            <div className="flex items-center justify-between">
              <span className="text-white text-sm">USDC</span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => updateBalance('usdc', -10)}
                  className="bg-red-600 text-white p-1 rounded hover:bg-red-700"
                  title="Decrease USDC"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <span className="text-xs text-muted-foreground min-w-[60px] text-center">
                  {(selectedWallet.balance.usdc || 0).toFixed(0)}
                </span>
                <button
                  onClick={() => updateBalance('usdc', 10)}
                  className="bg-green-600 text-white p-1 rounded hover:bg-green-700"
                  title="Increase USDC"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-border">
            <div className="text-xs text-muted-foreground">
              Changes reflect instantly across all pages
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
