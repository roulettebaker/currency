// Mock API service that simulates MongoDB operations with real-time updates
import { WalletData } from '../contexts/WalletContext';

export interface Transaction {
  id: string;
  walletId: string;
  type: 'send' | 'receive';
  amount: number;
  token: string;
  from: string;
  to: string;
  hash: string;
  status: 'pending' | 'confirmed' | 'failed';
  timestamp: Date;
  network: string;
}

class MockDatabaseService {
  private wallets: Map<string, WalletData> = new Map();
  private transactions: Map<string, Transaction> = new Map();
  private balances: Map<string, { [token: string]: number }> = new Map();
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.initializeMockData();
    this.startPeriodicUpdates();
  }

  // Reset wallet balances to default values
  resetBalances() {
    const defaultBalances = {
      eth: 10.0,
      btc: 0.5,
      bnb: 50.0,
      usdc: 5000,
      usdt: 2500,
      pol: 10000,
      trx: 50000
    };

    for (const [walletId, wallet] of this.wallets.entries()) {
      wallet.balance = { ...defaultBalances };
      wallet.updatedAt = new Date();
      this.wallets.set(walletId, wallet);
      this.balances.set(walletId, { ...defaultBalances });
    }

    this.notifyListeners();
    console.log('🔄 Mock wallet balances reset to defaults');
  }

  // Initialize with mock data
  private initializeMockData() {
    const defaultWallet: WalletData = {
      id: 'wallet_1',
      _id: 'wallet_1',
      name: 'Main Wallet',
      type: 'native',
      address: '0x742d35Cc7f15C6B4BF8Df4345678901234567890',
      publicKey: '0x' + Array.from({ length: 128 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
      network: 'ethereum',
      balance: {
        eth: 10.0,    // Increased from 2.5 to avoid insufficient balance
        btc: 0.5,     // Increased for demo
        bnb: 50.0,    // Increased for demo
        usdc: 5000,   // Increased for demo
        usdt: 2500,   // Increased for demo
        pol: 10000,   // Added
        trx: 50000    // Added
      },
      isActive: true,
      isSelected: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.wallets.set(defaultWallet.id, defaultWallet);
    this.balances.set(defaultWallet.id, defaultWallet.balance);

    // Add some mock transactions
    this.addMockTransactions(defaultWallet.id);
  }

  private addMockTransactions(walletId: string) {
    const mockTransactions: Transaction[] = [
      {
        id: 'tx_1',
        walletId,
        type: 'receive',
        amount: 0.5,
        token: 'ETH',
        from: '0x123...abc',
        to: this.wallets.get(walletId)?.address || '',
        hash: '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
        status: 'confirmed',
        timestamp: new Date(Date.now() - 86400000), // 1 day ago
        network: 'ethereum'
      },
      {
        id: 'tx_2',
        walletId,
        type: 'send',
        amount: 0.1,
        token: 'ETH',
        from: this.wallets.get(walletId)?.address || '',
        to: '0x456...def',
        hash: '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
        status: 'confirmed',
        timestamp: new Date(Date.now() - 43200000), // 12 hours ago
        network: 'ethereum'
      }
    ];

    mockTransactions.forEach(tx => this.transactions.set(tx.id, tx));
  }

  // Simulate periodic balance updates (like real blockchain data)
  private startPeriodicUpdates() {
    setInterval(() => {
      this.simulateBalanceChange();
    }, 10000); // Update every 10 seconds
  }

  private simulateBalanceChange() {
    for (const [walletId, balance] of this.balances.entries()) {
      // Simulate small random changes in ETH balance (±0.001)
      const ethChange = (Math.random() - 0.5) * 0.002;
      balance.eth = Math.max(0, balance.eth + ethChange);
      
      // Update wallet object
      const wallet = this.wallets.get(walletId);
      if (wallet) {
        wallet.balance = { ...balance };
        wallet.updatedAt = new Date();
        this.wallets.set(walletId, wallet);
      }
    }
    
    this.notifyListeners();
  }

  // Add listener for data changes
  subscribe(callback: () => void) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  private notifyListeners() {
    this.listeners.forEach(callback => callback());
  }

  // API Methods
  async getWallets(): Promise<{ success: boolean; wallets: WalletData[] }> {
    await this.simulateDelay();
    return {
      success: true,
      wallets: Array.from(this.wallets.values())
    };
  }

  async createWallet(walletData: Partial<WalletData>): Promise<{ success: boolean; wallet: WalletData }> {
    await this.simulateDelay();
    
    const newWallet: WalletData = {
      id: 'wallet_' + Date.now(),
      _id: 'wallet_' + Date.now(),
      name: walletData.name || 'New Wallet',
      type: walletData.type || 'native',
      address: walletData.address || '0x' + Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
      publicKey: walletData.publicKey || '0x' + Array.from({ length: 128 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
      network: walletData.network || 'ethereum',
      balance: { eth: 0, btc: 0, bnb: 0, usdc: 0, usdt: 0 },
      isActive: true,
      isSelected: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.wallets.set(newWallet.id, newWallet);
    this.balances.set(newWallet.id, newWallet.balance);
    this.notifyListeners();

    return { success: true, wallet: newWallet };
  }

  async updateWalletBalance(walletId: string, token: string, amount: number): Promise<{ success: boolean }> {
    await this.simulateDelay();
    
    const wallet = this.wallets.get(walletId);
    const balance = this.balances.get(walletId);
    
    if (wallet && balance) {
      balance[token] = amount;
      wallet.balance[token] = amount;
      wallet.updatedAt = new Date();
      
      this.wallets.set(walletId, wallet);
      this.balances.set(walletId, balance);
      this.notifyListeners();
      
      return { success: true };
    }
    
    return { success: false };
  }

  async getTransactions(walletId: string): Promise<{ success: boolean; transactions: Transaction[] }> {
    await this.simulateDelay();
    
    const walletTransactions = Array.from(this.transactions.values())
      .filter(tx => tx.walletId === walletId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    
    return { success: true, transactions: walletTransactions };
  }

  async createTransaction(txData: Partial<Transaction>): Promise<{ success: boolean; transaction: Transaction }> {
    await this.simulateDelay();
    
    const transaction: Transaction = {
      id: 'tx_' + Date.now(),
      walletId: txData.walletId || '',
      type: txData.type || 'send',
      amount: txData.amount || 0,
      token: txData.token || 'ETH',
      from: txData.from || '',
      to: txData.to || '',
      hash: '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
      status: 'pending',
      timestamp: new Date(),
      network: txData.network || 'ethereum'
    };

    this.transactions.set(transaction.id, transaction);
    
    // Simulate transaction confirmation after 3 seconds
    setTimeout(() => {
      transaction.status = 'confirmed';
      this.transactions.set(transaction.id, transaction);
      this.notifyListeners();
    }, 3000);
    
    this.notifyListeners();
    return { success: true, transaction };
  }

  private simulateDelay(): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, Math.random() * 200 + 100)); // 100-300ms delay
  }

  // Manual refresh method
  async forceRefresh(): Promise<void> {
    await this.simulateDelay();
    this.notifyListeners();
  }
}

export const mockDB = new MockDatabaseService();
