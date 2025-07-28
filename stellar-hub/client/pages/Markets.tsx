import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Search, TrendingUp, TrendingDown, Star, BarChart3, Eye } from 'lucide-react';

interface MarketCoin {
  id: string;
  name: string;
  symbol: string;
  price: number;
  change24h: number;
  change7d: number;
  volume24h: number;
  marketCap: number;
  rank: number;
  icon: string;
  watchlisted: boolean;
}

const marketCoins: MarketCoin[] = [
  {
    id: 'btc',
    name: 'Bitcoin',
    symbol: 'BTC',
    price: 118442.4,
    change24h: 0.40,
    change7d: 5.2,
    volume24h: 25680000000,
    marketCap: 2340000000000,
    rank: 1,
    icon: '₿',
    watchlisted: true
  },
  {
    id: 'eth',
    name: 'Ethereum',
    symbol: 'ETH',
    price: 3674.83,
    change24h: 1.69,
    change7d: 3.8,
    volume24h: 12450000000,
    marketCap: 441000000000,
    rank: 2,
    icon: 'Ξ',
    watchlisted: false
  },
  {
    id: 'bnb',
    name: 'BNB',
    symbol: 'BNB',
    price: 771.64,
    change24h: -2.16,
    change7d: -1.4,
    volume24h: 2340000000,
    marketCap: 115000000000,
    rank: 3,
    icon: '◈',
    watchlisted: true
  },
  {
    id: 'xrp',
    name: 'XRP',
    symbol: 'XRP',
    price: 2.45,
    change24h: 8.75,
    change7d: 12.3,
    volume24h: 8900000000,
    marketCap: 139000000000,
    rank: 4,
    icon: '💧',
    watchlisted: false
  },
  {
    id: 'sol',
    name: 'Solana',
    symbol: 'SOL',
    price: 234.56,
    change24h: -3.42,
    change7d: 8.9,
    volume24h: 3200000000,
    marketCap: 112000000000,
    rank: 5,
    icon: '☀️',
    watchlisted: false
  },
  {
    id: 'ada',
    name: 'Cardano',
    symbol: 'ADA',
    price: 1.15,
    change24h: 2.18,
    change7d: 6.7,
    volume24h: 1400000000,
    marketCap: 40800000000,
    rank: 6,
    icon: '🔷',
    watchlisted: false
  },
  {
    id: 'avax',
    name: 'Avalanche',
    symbol: 'AVAX',
    price: 45.32,
    change24h: -1.87,
    change7d: 4.2,
    volume24h: 890000000,
    marketCap: 18200000000,
    rank: 7,
    icon: '🔺',
    watchlisted: false
  },
  {
    id: 'dot',
    name: 'Polkadot',
    symbol: 'DOT',
    price: 8.94,
    change24h: 0.95,
    change7d: 2.1,
    volume24h: 450000000,
    marketCap: 12500000000,
    rank: 8,
    icon: '⚫',
    watchlisted: false
  }
];

const sortOptions = [
  { value: 'rank', label: 'Market Cap' },
  { value: 'price', label: 'Price' },
  { value: 'change24h', label: '24h Change' },
  { value: 'volume24h', label: '24h Volume' },
  { value: 'name', label: 'Name' }
];

export default function Markets() {
  const [coins, setCoins] = useState(marketCoins);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('rank');
  const [showWatchlistOnly, setShowWatchlistOnly] = useState(false);

  const formatPrice = (price: number) => {
    if (price >= 1) return `$${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    return `$${price.toFixed(6)}`;
  };

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

  const toggleWatchlist = (coinId: string) => {
    setCoins(prev => prev.map(coin => 
      coin.id === coinId ? { ...coin, watchlisted: !coin.watchlisted } : coin
    ));
  };

  const filteredAndSortedCoins = coins
    .filter(coin => {
      const matchesSearch = coin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           coin.symbol.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesWatchlist = !showWatchlistOnly || coin.watchlisted;
      return matchesSearch && matchesWatchlist;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'rank':
          return a.rank - b.rank;
        case 'price':
          return b.price - a.price;
        case 'change24h':
          return b.change24h - a.change24h;
        case 'volume24h':
          return b.volume24h - a.volume24h;
        case 'name':
          return a.name.localeCompare(b.name);
        default:
          return a.rank - b.rank;
      }
    });

  const marketStats = {
    totalMarketCap: coins.reduce((sum, coin) => sum + coin.marketCap, 0),
    total24hVolume: coins.reduce((sum, coin) => sum + coin.volume24h, 0),
    btcDominance: (coins.find(c => c.id === 'btc')?.marketCap || 0) / coins.reduce((sum, coin) => sum + coin.marketCap, 0) * 100
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center">
          <Link to="/" className="mr-4 hover:bg-secondary p-1 rounded">
            <ArrowLeft className="w-6 h-6 text-white" />
          </Link>
          <h1 className="text-lg font-medium text-white">Markets</h1>
        </div>
        <BarChart3 className="w-6 h-6 text-white" />
      </div>

      {/* Market Stats */}
      <div className="p-4 border-b border-border">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-muted-foreground text-sm">Market Cap</div>
            <div className="text-white font-semibold">{formatMarketCap(marketStats.totalMarketCap)}</div>
          </div>
          <div>
            <div className="text-muted-foreground text-sm">24h Volume</div>
            <div className="text-white font-semibold">{formatVolume(marketStats.total24hVolume)}</div>
          </div>
          <div>
            <div className="text-muted-foreground text-sm">BTC Dominance</div>
            <div className="text-white font-semibold">{marketStats.btcDominance.toFixed(1)}%</div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="p-4 space-y-3 border-b border-border">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search cryptocurrencies..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-secondary border border-border rounded-lg pl-10 pr-4 py-2 text-white placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center justify-between">
          <div className="flex space-x-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-secondary border border-border rounded-lg px-3 py-1 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {sortOptions.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
            <button
              onClick={() => setShowWatchlistOnly(!showWatchlistOnly)}
              className={`px-3 py-1 rounded-lg text-sm flex items-center space-x-1 ${
                showWatchlistOnly 
                  ? 'bg-primary text-white' 
                  : 'bg-secondary text-muted-foreground hover:bg-accent'
              }`}
            >
              <Star className={`w-3 h-3 ${showWatchlistOnly ? 'fill-current' : ''}`} />
              <span>Watchlist</span>
            </button>
          </div>
        </div>
      </div>

      {/* Coins List */}
      <div className="p-4">
        {/* Header Row */}
        <div className="grid grid-cols-12 gap-2 pb-2 mb-3 border-b border-border text-muted-foreground text-sm">
          <div className="col-span-1">#</div>
          <div className="col-span-4">Name</div>
          <div className="col-span-2 text-right">Price</div>
          <div className="col-span-2 text-right">24h</div>
          <div className="col-span-2 text-right">7d</div>
          <div className="col-span-1 text-right">★</div>
        </div>

        {/* Coins */}
        <div className="space-y-2">
          {filteredAndSortedCoins.map((coin) => (
            <Link
              key={coin.id}
              to={`/coin/${coin.id}`}
              className="grid grid-cols-12 gap-2 items-center py-3 px-2 rounded-lg hover:bg-secondary transition-colors"
            >
              {/* Rank */}
              <div className="col-span-1 text-muted-foreground text-sm">
                {coin.rank}
              </div>

              {/* Name and Icon */}
              <div className="col-span-4 flex items-center space-x-2">
                <div className="text-xl">{coin.icon}</div>
                <div>
                  <div className="text-white font-medium">{coin.symbol}</div>
                  <div className="text-muted-foreground text-sm">{coin.name}</div>
                </div>
              </div>

              {/* Price */}
              <div className="col-span-2 text-right">
                <div className="text-white font-medium">{formatPrice(coin.price)}</div>
                <div className="text-muted-foreground text-sm">
                  {formatMarketCap(coin.marketCap)}
                </div>
              </div>

              {/* 24h Change */}
              <div className="col-span-2 text-right">
                <div className={`flex items-center justify-end space-x-1 ${
                  coin.change24h >= 0 ? 'text-green-400' : 'text-red-400'
                }`}>
                  {coin.change24h >= 0 ? (
                    <TrendingUp className="w-3 h-3" />
                  ) : (
                    <TrendingDown className="w-3 h-3" />
                  )}
                  <span>{Math.abs(coin.change24h).toFixed(2)}%</span>
                </div>
                <div className="text-muted-foreground text-sm">
                  {formatVolume(coin.volume24h)}
                </div>
              </div>

              {/* 7d Change */}
              <div className="col-span-2 text-right">
                <div className={`${coin.change7d >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {coin.change7d >= 0 ? '+' : ''}{coin.change7d.toFixed(1)}%
                </div>
              </div>

              {/* Watchlist */}
              <div className="col-span-1 text-right">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    toggleWatchlist(coin.id);
                  }}
                  className="hover:scale-110 transition-transform"
                >
                  <Star 
                    className={`w-4 h-4 ${
                      coin.watchlisted 
                        ? 'text-yellow-400 fill-current' 
                        : 'text-muted-foreground hover:text-yellow-400'
                    }`} 
                  />
                </button>
              </div>
            </Link>
          ))}

          {filteredAndSortedCoins.length === 0 && (
            <div className="text-center py-8">
              <div className="text-4xl mb-2">📊</div>
              <div className="text-muted-foreground">No cryptocurrencies found</div>
              <div className="text-muted-foreground text-sm mt-1">
                Try adjusting your search or filters
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="p-4 border-t border-border">
        <div className="grid grid-cols-2 gap-3">
          <Link
            to="/buy-sell"
            className="bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg font-medium text-center transition-colors"
          >
            Buy Crypto
          </Link>
          <Link
            to="/swap"
            className="bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium text-center transition-colors"
          >
            Swap Tokens
          </Link>
        </div>
      </div>
    </div>
  );
}
