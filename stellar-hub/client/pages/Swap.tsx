import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowUpDown, ChevronDown, ChevronRight, Clock } from 'lucide-react';

interface Token {
  id: string;
  name: string;
  symbol: string;
  balance: number;
  icon: string;
  network: string;
}

const tokens: Token[] = [
  {
    id: 'bnb',
    name: 'BNB',
    symbol: 'BEP20',
    balance: 0,
    icon: '◈',
    network: 'BEP20'
  },
  {
    id: 'sfp',
    name: 'SFP',
    symbol: 'BEP20',
    balance: 0,
    icon: '🛡️',
    network: 'BEP20'
  }
];

export default function Swap() {
  const [fromToken, setFromToken] = useState(tokens[0]);
  const [toToken, setToToken] = useState(tokens[1]);
  const [fromAmount, setFromAmount] = useState('');
  const [slippage, setSlippage] = useState('MIN');
  
  const exchangeRate = "1 BNB ≈ 1541.05612 SFP";
  const fee = "0.2%";
  const provider = "1inch";

  const handleSwapTokens = () => {
    const temp = fromToken;
    setFromToken(toToken);
    setToToken(temp);
  };

  const handleSlippageClick = (value: string) => {
    setSlippage(value);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center">
          <Link to="/" className="mr-4">
            <ArrowLeft className="w-6 h-6 text-white" />
          </Link>
          <h1 className="text-lg font-medium text-white">Swap</h1>
        </div>
        <Clock className="w-6 h-6 text-white" />
      </div>

      <div className="p-4 space-y-4">
        {/* Slippage Controls */}
        <div className="flex justify-end space-x-2 mb-4">
          {['MIN', '50%', 'MAX'].map((option) => (
            <button
              key={option}
              onClick={() => handleSlippageClick(option)}
              className={`px-3 py-1 rounded-full text-sm ${
                slippage === option 
                  ? 'bg-primary text-white' 
                  : 'bg-secondary text-muted-foreground'
              }`}
            >
              {option}
            </button>
          ))}
        </div>

        {/* From Token */}
        <div className="bg-secondary rounded-lg p-4">
          <div className="text-muted-foreground text-sm mb-2">Pay</div>
          <div className="flex items-center justify-between">
            <button className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center text-white font-bold">
                {fromToken.icon}
              </div>
              <div>
                <div className="text-white font-medium">{fromToken.name}</div>
                <div className="text-muted-foreground text-sm">{fromToken.symbol}</div>
              </div>
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            </button>
            <div className="text-right">
              <input
                type="number"
                placeholder="0"
                value={fromAmount}
                onChange={(e) => setFromAmount(e.target.value)}
                className="bg-transparent text-white text-xl text-right focus:outline-none w-20"
              />
            </div>
          </div>
          <div className="text-muted-foreground text-sm mt-2">
            Balance {fromToken.balance}
          </div>
        </div>

        {/* Swap Button */}
        <div className="flex justify-center">
          <button
            onClick={handleSwapTokens}
            className="w-12 h-12 bg-primary rounded-full flex items-center justify-center"
          >
            <ArrowUpDown className="w-6 h-6 text-white" />
          </button>
        </div>

        {/* To Token */}
        <div className="bg-secondary rounded-lg p-4">
          <div className="text-muted-foreground text-sm mb-2">Receive (Estimate)</div>
          <div className="flex items-center justify-between">
            <button className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                {toToken.icon}
              </div>
              <div>
                <div className="text-white font-medium">{toToken.name}</div>
                <div className="text-muted-foreground text-sm">{toToken.symbol}</div>
              </div>
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            </button>
            <div className="text-right">
              <div className="text-white text-xl">0</div>
            </div>
          </div>
          <div className="text-muted-foreground text-sm mt-2">
            Balance {toToken.balance}
          </div>
        </div>

        {/* Warning */}
        <div className="text-red-400 text-sm p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
          Minimum exchange amount is 0.0001 BNB.
        </div>

        {/* Swap Button */}
        <button
          disabled={!fromAmount || parseFloat(fromAmount) === 0}
          className="w-full bg-muted text-muted-foreground py-4 rounded-lg font-medium disabled:opacity-50"
        >
          Swap
        </button>

        {/* Provider Info */}
        <div className="bg-secondary rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-white font-medium">Provider</span>
            <div className="flex items-center space-x-2">
              <span className="text-white">{provider}</span>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Rate</span>
              <div className="flex items-center space-x-2">
                <span className="text-white">{exchangeRate}</span>
                <div className="flex items-center space-x-1 text-muted-foreground">
                  <span>≈</span>
                  <span>1%</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Fee</span>
              <span className="text-white">{fee}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
