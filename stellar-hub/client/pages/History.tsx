import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowUpRight, ArrowDownLeft, RotateCcw, Clock, Search, Filter, ExternalLink } from 'lucide-react';
import { useWallet } from '../contexts/WalletContext';

interface Transaction {
  id: string;
  type: 'send' | 'receive' | 'swap' | 'buy' | 'sell';
  cryptocurrency: string;
  symbol: string;
  amount: number;
  usdValue: number;
  status: 'completed' | 'pending' | 'failed';
  timestamp: Date;
  address?: string;
  txHash: string;
  network: string;
  fee?: number;
  fromToken?: string;
  toToken?: string;
}

const mockTransactions: Transaction[] = [
  {
    id: '1',
    type: 'receive',
    cryptocurrency: 'Bitcoin',
    symbol: 'BTC',
    amount: 0.00123456,
    usdValue: 146.25,
    status: 'completed',
    timestamp: new Date('2024-01-15T10:30:00'),
    address: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
    txHash: '1a2b3c4d5e6f7890abcdef1234567890abcdef1234567890abcdef1234567890',
    network: 'Bitcoin',
    fee: 0.0001
  },
  {
    id: '2',
    type: 'send',
    cryptocurrency: 'Ethereum',
    symbol: 'ETH',
    amount: 0.5,
    usdValue: 1837.42,
    status: 'completed',
    timestamp: new Date('2024-01-14T15:45:00'),
    address: '0x742C4B7B6f7A1234567890abcdef1234567890ab',
    txHash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
    network: 'ERC20',
    fee: 0.002
  },
  {
    id: '3',
    type: 'swap',
    cryptocurrency: 'BNB',
    symbol: 'BNB',
    amount: 2.5,
    usdValue: 1929.10,
    status: 'completed',
    timestamp: new Date('2024-01-13T09:20:00'),
    txHash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
    network: 'BEP20',
    fee: 0.001,
    fromToken: 'USDT',
    toToken: 'BNB'
  },
  {
    id: '4',
    type: 'buy',
    cryptocurrency: 'Polygon',
    symbol: 'POL',
    amount: 1000,
    usdValue: 228.70,
    status: 'pending',
    timestamp: new Date('2024-01-12T14:10:00'),
    txHash: '0x9876543210fedcba9876543210fedcba9876543210fedcba9876543210fedcba',
    network: 'Polygon',
    fee: 0.5
  },
  {
    id: '5',
    type: 'send',
    cryptocurrency: 'TRON',
    symbol: 'TRX',
    amount: 500,
    usdValue: 226.05,
    status: 'failed',
    timestamp: new Date('2024-01-11T11:30:00'),
    address: 'TQn9Y2khEsLJW1ChVWFMSMeRDow5KcbLSE',
    txHash: 'failed_tx_hash',
    network: 'TRC20',
    fee: 1.0
  }
];

export default function History() {
  const { transactions: walletTransactions } = useWallet();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  // Use real transactions from wallet context, fallback to mock if empty
  const { selectedWallet } = useWallet();

  // Enhance MongoDB transactions with missing properties
  const enhancedTransactions = walletTransactions.map(tx => {
    // If it's already a mock transaction (has all properties), return as is
    if (tx.cryptocurrency && tx.symbol && tx.type) {
      return tx;
    }

    // For MongoDB transactions, infer missing properties
    const walletAddress = selectedWallet?.address?.toLowerCase() || '';
    const fromAddress = (tx.from || '').toLowerCase();
    const toAddress = (tx.to || '').toLowerCase();

    // Determine transaction type
    let type = 'send'; // default
    if (walletAddress === toAddress) {
      type = 'receive';
    } else if (walletAddress === fromAddress) {
      type = 'send';
    }

    return {
      ...tx,
      id: tx.id || tx._id || Date.now().toString(),
      type,
      cryptocurrency: tx.token || 'Unknown',
      symbol: tx.token || 'UNK',
      usdValue: tx.usdValue || 0,
      address: type === 'receive' ? tx.from : tx.to,
      status: tx.status === 'confirmed' ? 'completed' : tx.status,
      timestamp: tx.timestamp || new Date()
    };
  });

  const transactions = enhancedTransactions.length > 0 ? enhancedTransactions : mockTransactions;

  const filteredTransactions = transactions.filter(tx => {
    // Safely handle both mock transaction structure and real MongoDB transaction structure
    const cryptocurrency = tx.cryptocurrency || tx.token || '';
    const symbol = tx.symbol || tx.token || '';
    const txHash = tx.txHash || '';

    const matchesSearch = cryptocurrency.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         txHash.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = filterType === 'all' || tx.type === filterType;
    const matchesStatus = filterStatus === 'all' || tx.status === filterStatus;

    return matchesSearch && matchesType && matchesStatus;
  });

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'send':
        return <ArrowUpRight className="w-5 h-5 text-red-400" />;
      case 'receive':
        return <ArrowDownLeft className="w-5 h-5 text-green-400" />;
      case 'swap':
        return <RotateCcw className="w-5 h-5 text-blue-400" />;
      case 'buy':
      case 'sell':
        return <Clock className="w-5 h-5 text-yellow-400" />;
      default:
        return <Clock className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-400';
      case 'pending':
        return 'text-yellow-400';
      case 'failed':
        return 'text-red-400';
      default:
        return 'text-muted-foreground';
    }
  };

  const formatDate = (date: Date | string | undefined) => {
    try {
      // Handle undefined, null, or invalid dates
      if (!date) {
        return 'Unknown date';
      }

      // Convert string dates to Date objects
      const validDate = typeof date === 'string' ? new Date(date) : date;

      // Check if the date is valid
      if (isNaN(validDate.getTime())) {
        return 'Invalid date';
      }

      return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(validDate);
    } catch (error) {
      console.warn('Error formatting date:', error);
      return 'Unknown date';
    }
  };

  const openTxInExplorer = (txHash: string, network: string) => {
    let explorerUrl = '';
    switch (network.toLowerCase()) {
      case 'bitcoin':
        explorerUrl = `https://blockstream.info/tx/${txHash}`;
        break;
      case 'erc20':
      case 'ethereum':
        explorerUrl = `https://etherscan.io/tx/${txHash}`;
        break;
      case 'bep20':
        explorerUrl = `https://bscscan.com/tx/${txHash}`;
        break;
      case 'trc20':
        explorerUrl = `https://tronscan.org/#/transaction/${txHash}`;
        break;
      case 'polygon':
        explorerUrl = `https://polygonscan.com/tx/${txHash}`;
        break;
    }
    if (explorerUrl) {
      window.open(explorerUrl, '_blank');
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center">
          <Link to="/" className="mr-4 hover:bg-secondary p-1 rounded">
            <ArrowLeft className="w-6 h-6 text-white" />
          </Link>
          <h1 className="text-lg font-medium text-white">Transaction History</h1>
        </div>
        <button className="hover:bg-secondary p-2 rounded">
          <Filter className="w-5 h-5 text-white" />
        </button>
      </div>

      {/* Search and Filters */}
      <div className="p-4 space-y-3 border-b border-border">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search transactions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-secondary border border-border rounded-lg pl-10 pr-4 py-2 text-white placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* Filter Buttons */}
        <div className="flex space-x-2 overflow-x-auto">
          {['all', 'send', 'receive', 'swap', 'buy', 'sell'].map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-3 py-1 rounded-full text-sm whitespace-nowrap ${
                filterType === type
                  ? 'bg-primary text-white'
                  : 'bg-secondary text-muted-foreground hover:bg-accent'
              }`}
            >
              {type === 'all' ? 'All' : type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>

        <div className="flex space-x-2">
          {['all', 'completed', 'pending', 'failed'].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3 py-1 rounded-full text-sm ${
                filterStatus === status
                  ? 'bg-primary text-white'
                  : 'bg-secondary text-muted-foreground hover:bg-accent'
              }`}
            >
              {status === 'all' ? 'All Status' : status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Transaction List */}
      <div className="p-4 space-y-3">
        {filteredTransactions.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-2">📋</div>
            <div className="text-muted-foreground">No transactions found</div>
          </div>
        ) : (
          filteredTransactions.map((tx) => (
            <div
              key={tx.id || tx._id}
              className="bg-secondary border border-border rounded-lg p-4 hover:bg-accent transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <div className="mt-1">
                    {getTransactionIcon(tx.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-white font-medium capitalize">{tx.type}</span>
                      <span className="text-muted-foreground text-sm">{tx.symbol || tx.token}</span>
                      <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(tx.status)} bg-current bg-opacity-20`}>
                        {tx.status}
                      </span>
                    </div>
                    
                    <div className="text-muted-foreground text-sm mb-2">
                      {formatDate(tx.timestamp)}
                    </div>

                    {/* Transaction Details */}
                    {tx.type === 'swap' && tx.fromToken && tx.toToken && (
                      <div className="text-muted-foreground text-sm">
                        {tx.fromToken} → {tx.toToken}
                      </div>
                    )}

                    {(tx.type === 'send' || tx.type === 'receive') && (tx.address || tx.from || tx.to) && (
                      <div className="text-muted-foreground text-sm font-mono">
                        {(tx.address || tx.from || tx.to || '').slice(0, 10)}...{(tx.address || tx.from || tx.to || '').slice(-8)}
                      </div>
                    )}

                    {/* Transaction Hash */}
                    <button
                      onClick={() => openTxInExplorer(tx.txHash, tx.network)}
                      className="flex items-center space-x-1 text-primary text-sm hover:text-primary/80 mt-1"
                    >
                      <span className="font-mono">
                        {(tx.txHash || '').slice(0, 8)}...{(tx.txHash || '').slice(-6)}
                      </span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                <div className="text-right">
                  <div className={`text-white font-semibold ${
                    tx.type === 'send' ? 'text-red-400' : 
                    tx.type === 'receive' ? 'text-green-400' : 'text-white'
                  }`}>
                    {tx.type === 'send' ? '-' : tx.type === 'receive' ? '+' : ''}
                    {tx.amount} {tx.symbol || tx.token}
                  </div>
                  <div className="text-muted-foreground text-sm">
                    ${(tx.usdValue || 0).toFixed(2)}
                  </div>
                  {tx.fee && (
                    <div className="text-muted-foreground text-xs mt-1">
                      Fee: {tx.fee} {tx.symbol || tx.token}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Summary Stats */}
      <div className="p-4 border-t border-border">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-white font-semibold">
              {filteredTransactions.filter(tx => tx.status === 'completed').length}
            </div>
            <div className="text-muted-foreground text-sm">Completed</div>
          </div>
          <div>
            <div className="text-yellow-400 font-semibold">
              {filteredTransactions.filter(tx => tx.status === 'pending').length}
            </div>
            <div className="text-muted-foreground text-sm">Pending</div>
          </div>
          <div>
            <div className="text-red-400 font-semibold">
              {filteredTransactions.filter(tx => tx.status === 'failed').length}
            </div>
            <div className="text-muted-foreground text-sm">Failed</div>
          </div>
        </div>
      </div>
    </div>
  );
}
