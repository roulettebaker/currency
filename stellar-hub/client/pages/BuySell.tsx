import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, TrendingUp, TrendingDown, ChevronDown, CreditCard, Banknote, Wallet } from 'lucide-react';

interface MarketData {
  id: string;
  name: string;
  symbol: string;
  price: number;
  change24h: number;
  volume24h: number;
  marketCap: number;
  icon: string;
  available: boolean;
}

const marketData: MarketData[] = [
  {
    id: 'btc',
    name: 'Bitcoin',
    symbol: 'BTC',
    price: 118442.4,
    change24h: 0.40,
    volume24h: 25680000000,
    marketCap: 2340000000000,
    icon: '₿',
    available: true
  },
  {
    id: 'eth',
    name: 'Ethereum',
    symbol: 'ETH',
    price: 3674.83,
    change24h: 1.69,
    volume24h: 12450000000,
    marketCap: 441000000000,
    icon: 'Ξ',
    available: true
  },
  {
    id: 'bnb',
    name: 'BNB',
    symbol: 'BNB',
    price: 771.64,
    change24h: -2.16,
    volume24h: 2340000000,
    marketCap: 115000000000,
    icon: '◈',
    available: true
  },
  {
    id: 'pol',
    name: 'Polygon',
    symbol: 'POL',
    price: 0.2287,
    change24h: -3.07,
    volume24h: 156000000,
    marketCap: 2100000000,
    icon: '⬟',
    available: true
  },
  {
    id: 'trx',
    name: 'TRON',
    symbol: 'TRX',
    price: 0.4521,
    change24h: 2.15,
    volume24h: 890000000,
    marketCap: 39000000000,
    icon: '🔺',
    available: true
  }
];

const paymentMethods = [
  { id: 'card', name: 'Credit/Debit Card', icon: CreditCard, fee: '3.5%', limits: '$50 - $10,000' },
  { id: 'bank', name: 'Bank Transfer', icon: Banknote, fee: '1.0%', limits: '$100 - $50,000' },
  { id: 'wallet', name: 'Wallet Balance', icon: Wallet, fee: '0%', limits: 'Available balance' }
];

export default function BuySell() {
  const [activeTab, setActiveTab] = useState<'buy' | 'sell'>('buy');
  const [selectedCrypto, setSelectedCrypto] = useState(marketData[0]);
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState(paymentMethods[0]);
  const [showCryptoSelector, setShowCryptoSelector] = useState(false);
  const [showPaymentSelector, setShowPaymentSelector] = useState(false);

  const formatMarketCap = (value: number) => {
    if (value >= 1e12) return `$${(value / 1e12).toFixed(1)}T`;
    if (value >= 1e9) return `$${(value / 1e9).toFixed(1)}B`;
    if (value >= 1e6) return `$${(value / 1e6).toFixed(1)}M`;
    return `$${value.toLocaleString()}`;
  };

  const formatVolume = (value: number) => {
    if (value >= 1e9) return `$${(value / 1e9).toFixed(1)}B`;
    if (value >= 1e6) return `$${(value / 1e6).toFixed(1)}M`;
    return `$${value.toLocaleString()}`;
  };

  const calculateTotal = () => {
    const baseAmount = parseFloat(amount) || 0;
    const cryptoAmount = baseAmount / selectedCrypto.price;
    const feePercentage = parseFloat(paymentMethod.fee.replace('%', '')) / 100;
    const fee = baseAmount * feePercentage;
    const total = baseAmount + fee;
    
    return { cryptoAmount, fee, total };
  };

  const { cryptoAmount, fee, total } = calculateTotal();

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center">
          <Link to="/" className="mr-4 hover:bg-secondary p-1 rounded">
            <ArrowLeft className="w-6 h-6 text-white" />
          </Link>
          <h1 className="text-lg font-medium text-white">Buy/Sell Crypto</h1>
        </div>
      </div>

      {/* Buy/Sell Tabs */}
      <div className="flex border-b border-border">
        {['buy', 'sell'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as 'buy' | 'sell')}
            className={`flex-1 py-3 px-4 text-center font-medium transition-colors ${
              activeTab === tab
                ? 'text-white border-b-2 border-primary bg-accent/50'
                : 'text-muted-foreground hover:text-foreground hover:bg-secondary/30'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Market Overview */}
      <div className="p-4 border-b border-border">
        <h2 className="text-white font-medium mb-3">Market Overview</h2>
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          {marketData.slice(0, 5).map((crypto) => (
            <button
              key={crypto.id}
              onClick={() => setSelectedCrypto(crypto)}
              className={`p-3 rounded-lg border transition-colors ${
                selectedCrypto.id === crypto.id
                  ? 'border-primary bg-primary/10'
                  : 'border-border bg-secondary hover:bg-accent'
              }`}
            >
              <div className="text-center">
                <div className="text-lg mb-1">{crypto.icon}</div>
                <div className="text-white text-sm font-medium">{crypto.symbol}</div>
                <div className="text-xs text-muted-foreground mb-1">
                  ${crypto.price.toLocaleString()}
                </div>
                <div className={`text-xs flex items-center justify-center ${
                  crypto.change24h >= 0 ? 'text-green-400' : 'text-red-400'
                }`}>
                  {crypto.change24h >= 0 ? (
                    <TrendingUp className="w-3 h-3 mr-1" />
                  ) : (
                    <TrendingDown className="w-3 h-3 mr-1" />
                  )}
                  {Math.abs(crypto.change24h).toFixed(2)}%
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Trading Form */}
      <div className="p-4 space-y-4">
        {/* Cryptocurrency Selection */}
        <div>
          <label className="text-white font-medium mb-2 block">
            {activeTab === 'buy' ? 'Buy' : 'Sell'} Cryptocurrency
          </label>
          <div className="relative">
            <button
              onClick={() => setShowCryptoSelector(!showCryptoSelector)}
              className="w-full bg-secondary border border-border rounded-lg p-3 flex items-center justify-between hover:bg-accent"
            >
              <div className="flex items-center space-x-3">
                <div className="text-2xl">{selectedCrypto.icon}</div>
                <div className="text-left">
                  <div className="text-white font-medium">{selectedCrypto.name}</div>
                  <div className="text-muted-foreground text-sm">
                    ${selectedCrypto.price.toLocaleString()} 
                    <span className={`ml-2 ${selectedCrypto.change24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {selectedCrypto.change24h >= 0 ? '+' : ''}{selectedCrypto.change24h.toFixed(2)}%
                    </span>
                  </div>
                </div>
              </div>
              <ChevronDown className="w-5 h-5 text-muted-foreground" />
            </button>

            {showCryptoSelector && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-secondary border border-border rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
                {marketData.map((crypto) => (
                  <button
                    key={crypto.id}
                    onClick={() => {
                      setSelectedCrypto(crypto);
                      setShowCryptoSelector(false);
                    }}
                    className="w-full p-3 flex items-center justify-between hover:bg-accent text-left"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="text-xl">{crypto.icon}</div>
                      <div>
                        <div className="text-white font-medium">{crypto.name}</div>
                        <div className="text-muted-foreground text-sm">
                          ${crypto.price.toLocaleString()}
                        </div>
                      </div>
                    </div>
                    <div className={`text-sm ${crypto.change24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {crypto.change24h >= 0 ? '+' : ''}{crypto.change24h.toFixed(2)}%
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Amount Input */}
        <div>
          <label className="text-white font-medium mb-2 block">
            Amount {activeTab === 'buy' ? '(USD)' : `(${selectedCrypto.symbol})`}
          </label>
          <div className="relative">
            <input
              type="number"
              placeholder={activeTab === 'buy' ? "Enter USD amount" : `Enter ${selectedCrypto.symbol} amount`}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-secondary border border-border rounded-lg px-4 py-3 text-white placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
              {activeTab === 'buy' ? 'USD' : selectedCrypto.symbol}
            </div>
          </div>
          {amount && (
            <div className="mt-2 text-sm text-muted-foreground">
              ≈ {activeTab === 'buy' ? `${cryptoAmount.toFixed(8)} ${selectedCrypto.symbol}` : `$${(parseFloat(amount) * selectedCrypto.price).toFixed(2)}`}
            </div>
          )}
        </div>

        {/* Payment Method (only for buy) */}
        {activeTab === 'buy' && (
          <div>
            <label className="text-white font-medium mb-2 block">Payment Method</label>
            <div className="relative">
              <button
                onClick={() => setShowPaymentSelector(!showPaymentSelector)}
                className="w-full bg-secondary border border-border rounded-lg p-3 flex items-center justify-between hover:bg-accent"
              >
                <div className="flex items-center space-x-3">
                  <paymentMethod.icon className="w-5 h-5 text-muted-foreground" />
                  <div className="text-left">
                    <div className="text-white font-medium">{paymentMethod.name}</div>
                    <div className="text-muted-foreground text-sm">
                      Fee: {paymentMethod.fee} • {paymentMethod.limits}
                    </div>
                  </div>
                </div>
                <ChevronDown className="w-5 h-5 text-muted-foreground" />
              </button>

              {showPaymentSelector && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-secondary border border-border rounded-lg shadow-lg z-50">
                  {paymentMethods.map((method) => (
                    <button
                      key={method.id}
                      onClick={() => {
                        setPaymentMethod(method);
                        setShowPaymentSelector(false);
                      }}
                      className="w-full p-3 flex items-center space-x-3 hover:bg-accent text-left"
                    >
                      <method.icon className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <div className="text-white font-medium">{method.name}</div>
                        <div className="text-muted-foreground text-sm">
                          Fee: {method.fee} • {method.limits}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Order Summary */}
        {amount && (
          <div className="bg-secondary border border-border rounded-lg p-4">
            <h3 className="text-white font-medium mb-3">Order Summary</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  {activeTab === 'buy' ? 'You pay:' : 'You receive:'}
                </span>
                <span className="text-white">
                  {activeTab === 'buy' ? `$${amount}` : `$${(parseFloat(amount) * selectedCrypto.price).toFixed(2)}`}
                </span>
              </div>
              {activeTab === 'buy' && (
                <>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Fee ({paymentMethod.fee}):</span>
                    <span className="text-white">${fee.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between border-t border-border pt-2">
                    <span className="text-muted-foreground">Total:</span>
                    <span className="text-white font-medium">${total.toFixed(2)}</span>
                  </div>
                </>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  {activeTab === 'buy' ? 'You receive:' : 'You pay:'}
                </span>
                <span className="text-white font-medium">
                  {activeTab === 'buy' ? `${cryptoAmount.toFixed(8)} ${selectedCrypto.symbol}` : `${amount} ${selectedCrypto.symbol}`}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Action Button */}
        <button
          disabled={!amount || parseFloat(amount) <= 0}
          className={`w-full py-4 rounded-lg font-medium transition-colors ${
            activeTab === 'buy'
              ? 'bg-green-600 hover:bg-green-700 text-white'
              : 'bg-red-600 hover:bg-red-700 text-white'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {activeTab === 'buy' ? `Buy ${selectedCrypto.symbol}` : `Sell ${selectedCrypto.symbol}`}
        </button>

        {/* Market Stats */}
        <div className="bg-secondary border border-border rounded-lg p-4">
          <h3 className="text-white font-medium mb-3">{selectedCrypto.name} Market Stats</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-muted-foreground text-sm">24h Volume</div>
              <div className="text-white font-medium">{formatVolume(selectedCrypto.volume24h)}</div>
            </div>
            <div>
              <div className="text-muted-foreground text-sm">Market Cap</div>
              <div className="text-white font-medium">{formatMarketCap(selectedCrypto.marketCap)}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Overlays for dropdowns */}
      {(showCryptoSelector || showPaymentSelector) && (
        <div 
          className="fixed inset-0 z-40"
          onClick={() => {
            setShowCryptoSelector(false);
            setShowPaymentSelector(false);
          }}
        />
      )}
    </div>
  );
}
