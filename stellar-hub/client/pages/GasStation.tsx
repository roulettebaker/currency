import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ChevronDown, ArrowDown, RefreshCw, Clock, Menu } from 'lucide-react';
import MyWalletsModal from '../components/MyWalletsModal';

interface GasOption {
  type: 'Less' | 'Standard' | 'High';
  gwei: number;
  ethCost: number;
  usdCost: number;
}

interface TransactionAction {
  action: string;
  low: number;
  standard: number;
  high: number;
}

const gasOptions: GasOption[] = [
  { type: 'Less', gwei: 2, ethCost: 0.000042, usdCost: 0.16 },
  { type: 'Standard', gwei: 2, ethCost: 0.000042, usdCost: 0.16 },
  { type: 'High', gwei: 3, ethCost: 0.000063, usdCost: 0.24 }
];

const transactionActions: TransactionAction[] = [
  { action: 'USDT Transfer', low: 0.56, standard: 0.56, high: 0.84 },
  { action: 'Opensea:Sale', low: 1.49, standard: 1.49, high: 2.24 },
  { action: 'UniswapV3:Swap', low: 1.34, standard: 1.34, high: 2.01 }
];

export default function GasStation() {
  const [payToken, setPayToken] = useState({ symbol: 'SFP', network: 'BEP20', balance: 0 });
  const [receiveToken, setReceiveToken] = useState({ symbol: 'ETH', network: 'ERC20', balance: 0 });
  const [payAmount, setPayAmount] = useState('10');
  const [receiveAmount, setReceiveAmount] = useState('0.00063056');
  const [showPaySelector, setShowPaySelector] = useState(false);
  const [showReceiveSelector, setShowReceiveSelector] = useState(false);
  const [showMyWallets, setShowMyWallets] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center">
          <Link to="/coin/eth" className="mr-4 hover:bg-secondary p-1 rounded">
            <ArrowLeft className="w-6 h-6 text-white" />
          </Link>
          <h1 className="text-xl font-medium text-white">Gas Station</h1>
        </div>
        <div className="flex items-center space-x-3">
          <RefreshCw className="w-5 h-5 text-muted-foreground" />
          <button
            onClick={() => setShowMyWallets(true)}
            className="text-sm text-muted-foreground hover:text-white flex items-center space-x-1"
          >
            <span>SSS</span>
          </button>
          <Menu className="w-5 h-5 text-muted-foreground" />
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Gas Fee Controls */}
        <div className="flex justify-end space-x-2 mb-4">
          <button className="px-3 py-1 bg-secondary text-white rounded-full text-sm">MIN</button>
          <button className="px-3 py-1 bg-secondary text-muted-foreground rounded-full text-sm">50%</button>
          <button className="px-3 py-1 bg-secondary text-muted-foreground rounded-full text-sm">MAX</button>
        </div>

        {/* Pay Section */}
        <div className="bg-secondary rounded-lg p-4">
          <div className="text-white font-medium mb-3">Pay</div>
          <div className="flex items-center justify-between mb-2">
            <div className="relative">
              <button
                onClick={() => setShowPaySelector(!showPaySelector)}
                className="flex items-center space-x-2 hover:bg-accent p-2 rounded"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center">
                  <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                    <span className="text-purple-600 font-bold text-xs">S</span>
                  </div>
                </div>
                <div>
                  <div className="text-white font-medium">{payToken.symbol}</div>
                  <div className="text-muted-foreground text-sm">{payToken.network}</div>
                </div>
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
            <div className="text-right">
              <input
                type="text"
                value={payAmount}
                onChange={(e) => setPayAmount(e.target.value)}
                className="bg-transparent text-white text-2xl text-right focus:outline-none w-20"
              />
            </div>
          </div>
          <div className="text-muted-foreground text-sm">Balance {payToken.balance}</div>
        </div>

        {/* Swap Arrow */}
        <div className="flex justify-center">
          <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center">
            <ArrowDown className="w-5 h-5 text-white" />
          </div>
        </div>

        {/* Receive Section */}
        <div className="bg-secondary rounded-lg p-4">
          <div className="text-white font-medium mb-3">Receive (Estimate)</div>
          <div className="flex items-center justify-between mb-2">
            <div className="relative">
              <button
                onClick={() => setShowReceiveSelector(!showReceiveSelector)}
                className="flex items-center space-x-2 hover:bg-accent p-2 rounded"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">◊</span>
                </div>
                <div>
                  <div className="text-white font-medium">{receiveToken.symbol}</div>
                  <div className="text-muted-foreground text-sm">{receiveToken.network}</div>
                </div>
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
            <div className="text-right">
              <div className="text-white text-2xl">{receiveAmount}</div>
            </div>
          </div>
          <div className="text-muted-foreground text-sm">Balance {receiveToken.balance}</div>
        </div>

        {/* Insufficient Balance Warning */}
        <div className="text-red-400 text-sm">
          Insufficient balance
        </div>

        {/* Buy Button */}
        <button 
          disabled
          className="w-full bg-muted text-muted-foreground py-4 rounded-lg font-medium disabled:opacity-50"
        >
          Buy
        </button>

        {/* Gas Tracker */}
        <div>
          <div className="flex items-center space-x-2 mb-3">
            <span className="text-white font-medium">Gas Tracker</span>
            <RefreshCw className="w-4 h-4 text-muted-foreground" />
          </div>
          
          <div className="grid grid-cols-3 gap-3 mb-6">
            {gasOptions.map((option) => (
              <div key={option.type} className="bg-secondary rounded-lg p-3 text-center">
                <div className="text-white font-medium mb-1">{option.type}</div>
                <div className="text-muted-foreground text-sm mb-1">{option.gwei} Gwei</div>
                <div className="text-white text-sm">{option.ethCost.toFixed(6)} ETH</div>
                <div className="text-muted-foreground text-xs">${option.usdCost.toFixed(2)}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Estimated Cost of Transaction Actions */}
        <div className="bg-secondary rounded-lg p-4">
          <h3 className="text-white font-medium mb-3">Estimated Cost of Transaction Actions</h3>
          
          {/* Table Header */}
          <div className="grid grid-cols-4 gap-2 mb-2 text-muted-foreground text-sm">
            <div>Action</div>
            <div className="text-center">L</div>
            <div className="text-center">S</div>
            <div className="text-center">H</div>
          </div>

          {/* Table Rows */}
          {transactionActions.map((action, index) => (
            <div key={index} className="grid grid-cols-4 gap-2 py-2 border-t border-border">
              <div className="text-white text-sm">{action.action}</div>
              <div className="text-white text-sm text-center">${action.low.toFixed(2)}</div>
              <div className="text-white text-sm text-center">${action.standard.toFixed(2)}</div>
              <div className="text-white text-sm text-center">${action.high.toFixed(2)}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Overlays for dropdowns */}
      {(showPaySelector || showReceiveSelector) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setShowPaySelector(false);
            setShowReceiveSelector(false);
          }}
        />
      )}

      {/* My Wallets Modal */}
      <MyWalletsModal
        isOpen={showMyWallets}
        onClose={() => setShowMyWallets(false)}
      />
    </div>
  );
}
