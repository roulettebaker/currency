import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { ArrowUpRight, ArrowDownLeft, RotateCcw, ShoppingCart, MoreHorizontal, Search, RefreshCw, User, Menu, Eye, EyeOff, ChevronDown, X, Grid3X3, TrendingUp, Wallet, Clock } from 'lucide-react';
import MyWalletsModal from '../components/MyWalletsModal';
import RealTimeBalance from '../components/RealTimeBalance';

import { getCryptoIcon } from '../components/CryptoIcons';
import { useRealTimeData, useBalanceUpdates } from '../hooks/useRealTimeData';
import { useDebugPolling } from '../hooks/useDebugPolling';

interface Cryptocurrency {
  id: string;
  name: string;
  symbol: string;
  balance: number;
  usdValue: number;
  price: number;
  change24h: number;
  icon: string;
  network: string;
}

interface NFT {
  id: string;
  name: string;
  collection: string;
  image: string;
  value: number;
}

interface DeFiPosition {
  id: string;
  protocol: string;
  type: string;
  amount: number;
  apy: number;
  value: number;
}

const cryptocurrencies: Cryptocurrency[] = [
  {
    id: 'btc',
    name: 'BTC (Bitcoin)',
    symbol: 'BTC',
    balance: 0.00000000,
    usdValue: 0,
    price: 118442.4,
    change24h: 0.40,
    icon: '₿',
    network: 'BTC'
  },
  {
    id: 'eth',
    name: 'ETH (ERC20)',
    symbol: 'ETH',
    balance: 0.00000000,
    usdValue: 0,
    price: 3674.83,
    change24h: 1.69,
    icon: 'Ξ',
    network: 'ERC20'
  },
  {
    id: 'bnb',
    name: 'BNB (BEP20)',
    symbol: 'BNB',
    balance: 0.00000000,
    usdValue: 0,
    price: 771.64,
    change24h: -2.16,
    icon: '◈',
    network: 'BEP20'
  },
  {
    id: 'pol',
    name: 'POL (Polygon)',
    symbol: 'POL',
    balance: 0.00000000,
    usdValue: 0,
    price: 0.2287,
    change24h: -3.07,
    icon: '⬟',
    network: 'Polygon'
  },
  {
    id: 'trx',
    name: 'TRX (Tron)',
    symbol: 'TRX',
    balance: 0.00000000,
    usdValue: 0,
    price: 0.4521,
    change24h: 2.15,
    icon: '🔺',
    network: 'TRC20'
  },
  {
    id: 'usdc',
    name: 'USDC (ERC20)',
    symbol: 'USDC',
    balance: 0.00000000,
    usdValue: 0,
    price: 1.00,
    change24h: 0.01,
    icon: '��',
    network: 'ERC20'
  },
  {
    id: 'usdt',
    name: 'USDT (ERC20)', 
    symbol: 'USDT',
    balance: 0.00000000,
    usdValue: 0,
    price: 0.9999,
    change24h: -0.01,
    icon: '💰',
    network: 'ERC20'
  }
];

const nfts: NFT[] = [
  {
    id: '1',
    name: 'Bored Ape #1234',
    collection: 'Bored Ape Yacht Club',
    image: '��',
    value: 45.2
  },
  {
    id: '2',
    name: 'CryptoPunk #5678',
    collection: 'CryptoPunks',
    image: '👤',
    value: 78.5
  }
];

const defiPositions: DeFiPosition[] = [
  {
    id: '1',
    protocol: 'Uniswap V3',
    type: 'Liquidity Pool',
    amount: 1000,
    apy: 12.5,
    value: 1250.50
  },
  {
    id: '2',
    protocol: 'Compound',
    type: 'Lending',
    amount: 5000,
    apy: 4.2,
    value: 5210.00
  }
];

// Custom hook for automatic price updates
const usePriceUpdates = () => {
  const [prices, setPrices] = useState<{[key: string]: {price: number, change24h: number}}>({});

  useEffect(() => {
    // Initialize prices
    const initialPrices: {[key: string]: {price: number, change24h: number}} = {};
    cryptocurrencies.forEach(crypto => {
      initialPrices[crypto.id] = {
        price: crypto.price,
        change24h: crypto.change24h
      };
    });
    setPrices(initialPrices);

    // Set up automatic updates
    const interval = setInterval(() => {
      setPrices(prevPrices => {
        const newPrices = { ...prevPrices };

        cryptocurrencies.forEach(crypto => {
          // Simulate real price movements (±2% max change)
          const randomChange = (Math.random() - 0.5) * 0.04;
          const currentPrice = newPrices[crypto.id]?.price || crypto.price;
          const newPrice = currentPrice * (1 + randomChange);

          // Update 24h change slightly
          const currentChange = newPrices[crypto.id]?.change24h || crypto.change24h;
          const changeVariation = (Math.random() - 0.5) * 0.2;
          const newChange = currentChange + changeVariation;

          newPrices[crypto.id] = {
            price: newPrice,
            change24h: newChange
          };
        });

        return newPrices;
      });
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, []);

  return prices;
};

export default function Index() {
  const [activeTab, setActiveTab] = useState('Coin');
  const [searchQuery, setSearchQuery] = useState('');
  const [balanceVisible, setBalanceVisible] = useState(true);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [filterType, setFilterType] = useState('All');
  const [showMyWallets, setShowMyWallets] = useState(false);
  const moreButtonRef = useRef<HTMLButtonElement>(null);
  const [dropdownPosition, setDropdownPosition] = useState<{top: number, left: number} | null>(null);

  // Use real-time data
  const {
    selectedWallet,
    wallets,
    transactions,
    loading,
    error,
    timeSinceUpdate,
    manualRefresh,
    isOnline,
    hasData
  } = useRealTimeData();

  // Debug polling
  const debugInfo = useDebugPolling();

  const priceUpdates = usePriceUpdates();

  // Calculate total balance from real wallet data
  const calculateTotalBalance = () => {
    if (!selectedWallet?.balance) return 0;

    const balance = selectedWallet.balance;
    const ethPrice = priceUpdates.eth?.price || 3674.83;
    const btcPrice = priceUpdates.btc?.price || 67892.40;
    const bnbPrice = priceUpdates.bnb?.price || 771.64;

    return (
      (balance.eth || 0) * ethPrice +
      (balance.btc || 0) * btcPrice +
      (balance.bnb || 0) * bnbPrice +
      (balance.usdc || 0) * 1 +
      (balance.usdt || 0) * 1
    );
  };

  const totalBalance = calculateTotalBalance();
  const btcEquivalent = totalBalance / (priceUpdates.btc?.price || 67892.40);

  const filteredCryptos = cryptocurrencies.filter(crypto => {
    const matchesSearch = crypto.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         crypto.symbol.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (filterType === 'All') return matchesSearch;
    if (filterType === 'ERC20') return matchesSearch && crypto.network.includes('ERC20');
    if (filterType === 'BEP20') return matchesSearch && crypto.network.includes('BEP20');
    if (filterType === 'TRC20') return matchesSearch && crypto.network.includes('TRC20');
    return matchesSearch;
  });

  const moreMenuOptions = [
    { icon: Grid3X3, label: 'DApps', path: '/dapps' },
    { icon: TrendingUp, label: 'Markets', path: '/markets' },
    { icon: Clock, label: 'History', path: '/history' },
    { icon: Wallet, label: 'Settings', path: '/settings' },
    { icon: RefreshCw, label: 'Refresh', action: () => window.location.reload() }
  ];

  // Calculate dropdown position relative to viewport
  const calculateDropdownPosition = () => {
    if (moreButtonRef.current) {
      const rect = moreButtonRef.current.getBoundingClientRect();
      const dropdownWidth = 192; // w-48 = 12rem = 192px
      const dropdownHeight = 200; // approximate height

      let left = rect.right - dropdownWidth;
      let top = rect.bottom + 8;

      // Adjust if dropdown would go off-screen
      if (left < 8) left = 8;
      if (top + dropdownHeight > window.innerHeight) {
        top = rect.top - dropdownHeight - 8;
      }

      setDropdownPosition({ top, left });
    }
  };

  const handleMoreClick = () => {
    if (!showMoreMenu) {
      calculateDropdownPosition();
    }
    setShowMoreMenu(!showMoreMenu);
  };

  // Handle window resize to reposition dropdown
  useEffect(() => {
    const handleResize = () => {
      if (showMoreMenu) {
        calculateDropdownPosition();
      }
    };

    const handleScroll = () => {
      if (showMoreMenu) {
        calculateDropdownPosition();
      }
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [showMoreMenu]);

  return (
    <div className="h-full bg-background text-foreground relative chrome-extension-optimized flex flex-col">
      {/* Header - Compact for Chrome Extension */}
      <div className="flex items-center justify-between p-3 border-b border-border">
        <div className="flex items-center space-x-1">
          <div className="w-8 h-8 rounded-lg overflow-hidden">
            <img
              src="https://cdn.builder.io/api/v1/image/assets%2F5fbbe4272fe8404d89bd02a422643c9f%2F5864bb2b3d084a1dbe9c8377a789bc6f?format=webp&width=800"
              alt="SafePal"
              className="w-full h-full object-cover"
            />
          </div>
          <span className="text-white safepal-font">SafePal</span>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={manualRefresh}
            className="hover:bg-secondary p-1 rounded"
            title="Refresh wallet data"
            disabled={loading}
          >
            <RefreshCw className={`w-5 h-5 text-muted-foreground ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button className="hover:bg-secondary p-1 rounded">
            <User className="w-5 h-5 text-muted-foreground" />
          </button>
          <button
            onClick={() => setShowMyWallets(true)}
            className="text-sm text-muted-foreground hover:text-white"
          >
            SSS
          </button>
          <button className="hover:bg-secondary p-1 rounded">
            <Menu className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-border">
        {['Coin', 'NFT', 'DeFi'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-3 px-4 text-center font-medium transition-colors ${
              activeTab === tab
                ? 'text-white border-b-2 border-primary bg-accent/50'
                : 'text-muted-foreground hover:text-foreground hover:bg-secondary/30'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Balance Section - Optimized for Chrome Extension */}
      <div className="p-3 text-center">
        <div className="flex items-center justify-center space-x-2 mb-2">
          <span className="text-muted-foreground">Balance</span>
          <button 
            onClick={() => setBalanceVisible(!balanceVisible)}
            className="hover:bg-secondary p-1 rounded"
          >
            {balanceVisible ? (
              <Eye className="w-4 h-4 text-muted-foreground" />
            ) : (
              <EyeOff className="w-4 h-4 text-muted-foreground" />
            )}
          </button>
        </div>
        <div className="text-3xl font-light text-white mb-1">
          {balanceVisible ? `~$${totalBalance.toFixed(2)}` : '****'}
        </div>
        <div className="text-muted-foreground">
          {balanceVisible ? `≈${btcEquivalent.toFixed(8)} BTC` : '****'}
        </div>
      </div>

      {/* Action Buttons - Compact for Chrome Extension */}
      <div className="flex justify-center space-x-4 px-3 mb-3">
        <Link to="/send" className="flex flex-col items-center space-y-2 hover:scale-105 transition-transform">
          <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center hover:bg-accent">
            <ArrowUpRight className="w-4 h-4 text-white" />
          </div>
          <span className="text-xs text-white">Send</span>
        </Link>
        <Link to="/receive" className="flex flex-col items-center space-y-2 hover:scale-105 transition-transform">
          <div className="w-11 h-11 bg-secondary rounded-full flex items-center justify-center hover:bg-accent">
            <ArrowDownLeft className="w-4 h-4 text-white" />
          </div>
          <span className="text-xs text-white">Receive</span>
        </Link>
        <Link to="/swap" className="flex flex-col items-center space-y-2 hover:scale-105 transition-transform">
          <div className="w-11 h-11 bg-secondary rounded-full flex items-center justify-center hover:bg-accent">
            <RotateCcw className="w-4 h-4 text-white" />
          </div>
          <span className="text-xs text-white">Swap</span>
        </Link>
        <Link to="/buy-sell" className="flex flex-col items-center space-y-2 hover:scale-105 transition-transform">
          <div className="w-11 h-11 bg-secondary rounded-full flex items-center justify-center hover:bg-accent">
            <ShoppingCart className="w-4 h-4 text-white" />
          </div>
          <span className="text-xs text-white">Buy/Sell</span>
        </Link>
        <div className="relative">
          <button
            ref={moreButtonRef}
            onClick={handleMoreClick}
            className="flex flex-col items-center space-y-2 hover:scale-105 transition-transform"
          >
            <div className="w-11 h-11 bg-secondary rounded-full flex items-center justify-center hover:bg-accent">
              <MoreHorizontal className="w-4 h-4 text-white" />
            </div>
            <span className="text-xs text-white">More</span>
          </button>
          

        </div>
      </div>

      {/* Search and Filter (only for Coin tab) - Chrome Extension Optimized */}
      {activeTab === 'Coin' && (
        <div className="px-3 mb-3 flex items-center space-x-2 chrome-extension-filters">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search coins"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-secondary border border-border rounded-lg pl-10 pr-4 py-2 text-white placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div className="relative">
            <button
              onClick={() => setFilterType(filterType === 'All' ? 'ERC20' : filterType === 'ERC20' ? 'BEP20' : filterType === 'BEP20' ? 'TRC20' : 'All')}
              className="bg-secondary border border-border rounded-lg px-3 py-2 flex items-center space-x-1 hover:bg-accent"
            >
              <span className="text-white text-sm">{filterType}</span>
              <ChevronDown className="w-3 h-3 text-muted-foreground" />
            </button>
          </div>
          <button className="p-2 hover:bg-secondary rounded">
            <MoreHorizontal className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>
      )}

      {/* Tab Content - Chrome Extension Layout */}
      <div className="px-3 space-y-2 chrome-extension-content pb-4">
        {activeTab === 'Coin' && (
          <>
            {filteredCryptos.map((crypto) => (
              <Link 
                key={crypto.id}
                to={`/coin/${crypto.id}`}
                className="block bg-secondary border border-border rounded-lg p-4 hover:bg-accent transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 flex items-center justify-center">
                      {getCryptoIcon(crypto.id, 40)}
                    </div>
                    <div>
                      <div className="text-white font-medium">{crypto.name}</div>
                      <div className="flex items-center space-x-2">
                        <span className="text-white font-semibold">
                          ${(priceUpdates[crypto.id]?.price || crypto.price).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                        <span
                          className={`text-sm ${
                            (priceUpdates[crypto.id]?.change24h || crypto.change24h) >= 0 ? 'text-success' : 'text-danger'
                          }`}
                        >
                          {(priceUpdates[crypto.id]?.change24h || crypto.change24h) >= 0 ? '+' : ''}{(priceUpdates[crypto.id]?.change24h || crypto.change24h).toFixed(2)}%
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <RealTimeBalance tokenId={crypto.id} tokenSymbol={crypto.symbol} />
                  </div>
                </div>
              </Link>
            ))}
          </>
        )}

        {activeTab === 'NFT' && (
          <>
            {nfts.map((nft) => (
              <div
                key={nft.id}
                className="bg-secondary border border-border rounded-lg p-4 hover:bg-accent transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-600 rounded-lg flex items-center justify-center text-2xl">
                      {nft.image}
                    </div>
                    <div>
                      <div className="text-white font-medium">{nft.name}</div>
                      <div className="text-muted-foreground text-sm">{nft.collection}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-white font-semibold">{nft.value} ETH</div>
                    <div className="text-muted-foreground">≈${(nft.value * 3674.83).toFixed(2)}</div>
                  </div>
                </div>
              </div>
            ))}
            {nfts.length === 0 && (
              <div className="text-center py-8">
                <div className="text-4xl mb-2">🖼️</div>
                <div className="text-muted-foreground">No NFTs found</div>
              </div>
            )}
          </>
        )}

        {activeTab === 'DeFi' && (
          <>
            {defiPositions.map((position) => (
              <div
                key={position.id}
                className="bg-secondary border border-border rounded-lg p-4 hover:bg-accent transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-cyan-600 rounded-full flex items-center justify-center text-white font-bold">
                      🏦
                    </div>
                    <div>
                      <div className="text-white font-medium">{position.protocol}</div>
                      <div className="text-muted-foreground text-sm">{position.type}</div>
                      <div className="text-success text-sm">APY: {position.apy}%</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-white font-semibold">${position.value.toFixed(2)}</div>
                    <div className="text-muted-foreground">{position.amount} tokens</div>
                  </div>
                </div>
              </div>
            ))}
            {defiPositions.length === 0 && (
              <div className="text-center py-8">
                <div className="text-4xl mb-2">🏦</div>
                <div className="text-muted-foreground">No DeFi positions</div>
              </div>
            )}
          </>
        )}
      </div>



      {/* Overlay to close more menu */}
      {showMoreMenu && createPortal(
        <div
          className="fixed inset-0 z-[9999] bg-transparent"
          onClick={() => setShowMoreMenu(false)}
        />,
        document.body
      )}

      {/* My Wallets Modal */}
      <MyWalletsModal
        isOpen={showMyWallets}
        onClose={() => setShowMyWallets(false)}
      />

      {/* Portal-based More Menu Dropdown */}
      {showMoreMenu && dropdownPosition && createPortal(
        <div
          className="fixed bg-gray-800 border border-gray-600 rounded-lg shadow-2xl z-[10000] w-48"
          style={{
            top: `${dropdownPosition.top}px`,
            left: `${dropdownPosition.left}px`,
          }}
        >
          <div className="py-2">
            {moreMenuOptions.map((option, index) => (
              <div key={index}>
                {option.path ? (
                  <Link
                    to={option.path}
                    className="flex items-center space-x-3 px-4 py-3 hover:bg-gray-700 text-white transition-colors"
                    onClick={() => setShowMoreMenu(false)}
                  >
                    <option.icon className="w-4 h-4" />
                    <span>{option.label}</span>
                  </Link>
                ) : (
                  <button
                    onClick={() => {
                      option.action?.();
                      setShowMoreMenu(false);
                    }}
                    className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-gray-700 text-white transition-colors text-left"
                  >
                    <option.icon className="w-4 h-4" />
                    <span>{option.label}</span>
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>,
        document.body
      )}

    </div>
  );
}
