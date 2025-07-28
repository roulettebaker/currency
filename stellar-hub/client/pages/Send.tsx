import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Search } from 'lucide-react';
import { getCryptoIcon } from '../components/CryptoIcons';
import { useWallet } from '../contexts/WalletContext';
import { useBalance } from '../contexts/BalanceContext';

interface Cryptocurrency {
  id: string;
  name: string;
  symbol: string;
  balance: number;
  usdValue: number;
  icon: string;
  contractAddress?: string;
}

// Base cryptocurrency template - balances will be populated from context
const baseCryptocurrencies: Omit<Cryptocurrency, 'balance' | 'usdValue'>[] = [
  {
    id: 'btc',
    name: 'BTC (Bitcoin)',
    symbol: 'BTC',
    icon: '₿'
  },
  {
    id: 'eth',
    name: 'ETH (ERC20)',
    symbol: 'ETH',
    icon: 'Ξ'
  },
  {
    id: 'bnb',
    name: 'BNB (BEP20)',
    symbol: 'BNB',
    icon: '◈'
  },
  {
    id: 'pol',
    name: 'POL (Polygon)',
    symbol: 'POL',
    icon: '⬟'
  },
  {
    id: 'trx',
    name: 'TRX (Tron)',
    symbol: 'TRX',
    icon: '🔺'
  },
  {
    id: 'usdc',
    name: 'USDC (ERC20)',
    symbol: 'USDC',
    icon: '💎',
    contractAddress: '0xa0b8...eb48'
  },
  {
    id: 'usdt',
    name: 'USDT (ERC20)',
    symbol: 'USDT',
    icon: '💰',
    contractAddress: '0xdac1...1ec7'
  }
];

export default function Send() {
  const [searchQuery, setSearchQuery] = useState('');
  const [cryptocurrencies, setCryptocurrencies] = useState<Cryptocurrency[]>([]);
  const navigate = useNavigate();
  const { selectedWallet } = useWallet();
  const { getBalance, refreshBalances } = useBalance();

  // Refresh balances when component mounts
  useEffect(() => {
    refreshBalances();
  }, [refreshBalances]);

  // Update cryptocurrencies with real balance data
  useEffect(() => {
    if (selectedWallet) {
      const updatedCryptos = baseCryptocurrencies.map(crypto => {
        const balance = getBalance(selectedWallet.id, crypto.symbol.toLowerCase());
        // Simple USD conversion (mock prices for demo)
        const mockPrices: { [key: string]: number } = {
          btc: 45000,
          eth: 3000,
          bnb: 300,
          pol: 0.8,
          trx: 0.1,
          usdc: 1,
          usdt: 1
        };
        const usdValue = balance * (mockPrices[crypto.id] || 0);

        return {
          ...crypto,
          balance,
          usdValue
        };
      });
      setCryptocurrencies(updatedCryptos);
    }
  }, [selectedWallet, getBalance]);

  const filteredCryptos = cryptocurrencies.filter(crypto =>
    crypto.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    crypto.symbol.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCoinSelect = (crypto: Cryptocurrency) => {
    navigate(`/send/${crypto.id}`, { state: { crypto } });
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <div className="flex items-center p-4 border-b border-border">
        <Link to="/" className="mr-4">
          <ArrowLeft className="w-6 h-6 text-white" />
        </Link>
        <h1 className="text-lg font-medium text-white flex-1">Choose coin to send</h1>
      </div>

      {/* Search */}
      <div className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search coins"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-secondary border border-border rounded-lg pl-10 pr-4 py-3 text-white placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      {/* Cryptocurrency List */}
      <div className="px-4 space-y-2">
        {filteredCryptos.map((crypto) => (
          <button
            key={crypto.id}
            onClick={() => handleCoinSelect(crypto)}
            className="w-full bg-secondary border border-border rounded-lg p-4 flex items-center justify-between hover:bg-accent transition-colors"
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 flex items-center justify-center">
                {getCryptoIcon(crypto.id, 40)}
              </div>
              <div className="text-left">
                <div className="text-white font-medium">{crypto.name}</div>
                {crypto.contractAddress && (
                  <div className="text-muted-foreground text-sm">{crypto.contractAddress}</div>
                )}
              </div>
            </div>
            <div className="text-right">
              <div className="text-white font-semibold">{crypto.balance}</div>
              <div className="text-muted-foreground">≈${crypto.usdValue}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
