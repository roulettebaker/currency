import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Info, Copy, Check, ChevronDown, Fuel } from 'lucide-react';
import MyWalletsModal from '../components/MyWalletsModal';
import { getCryptoIcon } from '../components/CryptoIcons';
import { copyWithFeedback } from '../lib/clipboard';
import { useWallet } from '../contexts/WalletContext';
import { LargeBalanceDisplay } from '../components/SyncedBalance';

interface CoinData {
  id: string;
  name: string;
  symbol: string;
  price: number;
  change24h: number;
  balance: number;
  usdValue: number;
  icon: string;
  network: string;
  address: string;
  gasBalance?: number;
}

const coinData: { [key: string]: CoinData } = {
  btc: {
    id: 'btc',
    name: 'BTC (Bitcoin)',
    symbol: 'BTC',
    price: 118442.4,
    change24h: 0.40,
    balance: 0,
    usdValue: 0,
    icon: '₿',
    network: 'Bitcoin',
    address: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh'
  },
  eth: {
    id: 'eth',
    name: 'ETH (ERC20)',
    symbol: 'ETH',
    price: 3731.45,
    change24h: 3.44,
    balance: 0,
    usdValue: 0,
    icon: 'Ξ',
    network: 'ERC20',
    address: '0xaca432e2...8fc416b768',
    gasBalance: 6.09
  },
  bnb: {
    id: 'bnb',
    name: 'BNB (BEP20)',
    symbol: 'BNB',
    price: 771.64,
    change24h: -2.16,
    balance: 0,
    usdValue: 0,
    icon: '◈',
    network: 'BEP20',
    address: '0x1234567890abcdef1234567890abcdef12345678'
  },
  pol: {
    id: 'pol',
    name: 'POL (Polygon)',
    symbol: 'POL',
    price: 0.2287,
    change24h: -3.07,
    balance: 0,
    usdValue: 0,
    icon: '⬟',
    network: 'Polygon',
    address: '0xabcdef1234567890abcdef1234567890abcdef12'
  }
};

// Mock price update function - in real app this would connect to WebSocket or API
const usePriceUpdates = (coinId: string) => {
  const [price, setPrice] = useState(coinData[coinId]?.price || 0);
  const [change24h, setChange24h] = useState(coinData[coinId]?.change24h || 0);

  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate price updates with small random changes
      const randomChange = (Math.random() - 0.5) * 0.02; // ±1% max change
      const newPrice = price * (1 + randomChange);
      const newChange = change24h + (Math.random() - 0.5) * 0.1;
      
      setPrice(newPrice);
      setChange24h(newChange);
      
      // Update the global coin data
      if (coinData[coinId]) {
        coinData[coinId].price = newPrice;
        coinData[coinId].change24h = newChange;
      }
    }, 3000); // Update every 3 seconds

    return () => clearInterval(interval);
  }, [price, change24h, coinId]);

  return { price, change24h };
};

export default function CoinDetail() {
  const { coinId } = useParams<{ coinId: string }>();
  const [copied, setCopied] = useState(false);
  const [activeFilter, setActiveFilter] = useState('All');
  const [showActions, setShowActions] = useState(true);
  const [showMyWallets, setShowMyWallets] = useState(false);

  const { getWalletAddress, selectedWallet, loading } = useWallet();

  const coin = coinData[coinId || 'eth'] || coinData.eth;
  const { price, change24h } = usePriceUpdates(coin.id);

  // Get live wallet address
  const walletAddress = getWalletAddress();

  const handleCopyAddress = async () => {
    await copyWithFeedback(
      walletAddress,
      () => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      },
      (error) => {
        console.error('Copy failed:', error);
        // Show user feedback for manual copy
        alert(`Copy failed. Please copy manually: ${walletAddress}`);
      }
    );
  };

  const formatPrice = (price: number) => {
    if (price >= 1000) {
      return `$${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    return `$${price.toFixed(6)}`;
  };

  const filters = ['All', 'Receive', 'Send', 'Pending', 'Fee'];

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        <Link to="/" className="hover:bg-secondary p-1 rounded">
          <ArrowLeft className="w-6 h-6 text-white" />
        </Link>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowMyWallets(true)}
            className="text-sm text-muted-foreground hover:text-white"
          >
            SSS
          </button>
        </div>
      </div>

      {/* Coin Title */}
      <div className="px-4 mb-6">
        <div className="flex items-center justify-center space-x-2">
          <h1 className="text-xl font-medium text-white">{coin.name}</h1>
          <Info className="w-5 h-5 text-muted-foreground" />
        </div>
      </div>

      {/* Gas Balance (for ETH) */}
      {coin.gasBalance && (
        <div className="flex justify-center mb-4">
          <div className="bg-secondary border border-border rounded-lg px-3 py-1 flex items-center space-x-2">
            <Fuel className="w-4 h-4 text-muted-foreground" />
            <span className="text-white text-sm">{coin.gasBalance}</span>
          </div>
        </div>
      )}

      {/* Coin Icon */}
      <div className="flex justify-center mb-6">
        <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center">
          {getCryptoIcon(coin.id, 64)}
        </div>
      </div>

      {/* Balance */}
      <div className="text-center mb-6">
        <div className="text-6xl font-light text-white mb-2">
          <LargeBalanceDisplay token={coin.id} />
        </div>
        <div className="flex items-center justify-center space-x-4 text-lg">
          <span className="text-white font-medium">{formatPrice(price)}</span>
          <span className={`${change24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {change24h >= 0 ? '+' : ''}{change24h.toFixed(2)}%
          </span>
        </div>
      </div>

      {/* Address */}
      <div className="px-4 mb-6">
        <button 
          onClick={handleCopyAddress}
          className="w-full bg-secondary border border-border rounded-lg p-3 flex items-center justify-center space-x-2 hover:bg-accent"
        >
          <span className="text-white font-mono text-sm">{walletAddress}</span>
          {copied ? (
            <Check className="w-4 h-4 text-green-400" />
          ) : (
            <Copy className="w-4 h-4 text-muted-foreground" />
          )}
        </button>
      </div>

      {/* Action Buttons */}
      <div className="px-4 mb-6">
        <div className="grid grid-cols-3 gap-3 mb-4">
          <Link
            to={`/swap?from=${coin.id}`}
            className="bg-secondary border border-border text-white py-3 px-4 rounded-lg font-medium text-center hover:bg-accent transition-colors"
          >
            Swap
          </Link>
          <Link
            to={`/receive?coin=${coin.id}`}
            className="bg-secondary border border-border text-white py-3 px-4 rounded-lg font-medium text-center hover:bg-accent transition-colors"
          >
            Receive
          </Link>
          <Link
            to={`/send?coin=${coin.id}`}
            className="bg-secondary border border-border text-white py-3 px-4 rounded-lg font-medium text-center hover:bg-accent transition-colors"
          >
            Send
          </Link>
        </div>

        {/* Additional Actions */}
        {showActions && (
          <div className="grid grid-cols-2 gap-3 mb-4">
            <Link
              to={`/buy-sell?coin=${coin.id}`}
              className="bg-secondary border border-border text-white py-3 px-4 rounded-lg font-medium text-center hover:bg-accent transition-colors flex items-center justify-center space-x-2"
            >
              <div className="w-5 h-5 bg-orange-500 rounded flex items-center justify-center text-xs">$</div>
              <span>Buy/Sell {coin.symbol}</span>
            </Link>
            {coin.id === 'eth' && (
              <Link
                to="/gas-station"
                className="bg-secondary border border-border text-white py-3 px-4 rounded-lg font-medium text-center hover:bg-accent transition-colors flex items-center justify-center space-x-2"
              >
                <Fuel className="w-5 h-5 text-blue-400" />
                <span>Gas Station</span>
              </Link>
            )}
          </div>
        )}

        {/* Toggle Actions */}
        <div className="flex justify-center">
          <button 
            onClick={() => setShowActions(!showActions)}
            className="hover:bg-secondary p-2 rounded"
          >
            <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform ${showActions ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="px-4 mb-4">
        <div className="flex space-x-2 overflow-x-auto">
          {filters.map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-4 py-2 rounded-full text-sm whitespace-nowrap transition-colors ${
                activeFilter === filter
                  ? 'bg-primary text-white'
                  : 'bg-secondary text-muted-foreground hover:bg-accent'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Blockchain Explorer Link */}
      <div className="px-4 mb-8">
        <button 
          onClick={() => {
            const explorerUrl = coin.id === 'eth'
              ? `https://etherscan.io/address/${walletAddress}`
              : coin.id === 'btc'
              ? `https://blockstream.info/address/${walletAddress}`
              : `https://bscscan.com/address/${walletAddress}`;
            window.open(explorerUrl, '_blank');
          }}
          className="text-primary hover:text-primary/80 text-sm font-medium"
        >
          View my address on blockchain explorer
        </button>
      </div>

      {/* Transaction List Placeholder */}
      <div className="px-4 pb-8">
        <div className="text-center py-8">
          <div className="text-muted-foreground text-sm">
            No transactions yet
          </div>
        </div>
      </div>

      {/* My Wallets Modal */}
      <MyWalletsModal
        isOpen={showMyWallets}
        onClose={() => setShowMyWallets(false)}
      />
    </div>
  );
}
