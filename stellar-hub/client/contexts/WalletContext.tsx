import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { walletApi, transactionApi, generalApi } from '../lib/api';
import { mockDB, Transaction } from '../lib/mockAPI';
import { shouldSkipAPICall, markAPIAsFailed, markAPIAsWorking, clearAPIFailedState } from '../lib/networkUtils';

export interface WalletData {
  _id?: string;
  id: string;
  name: string;
  type: 'native' | 'imported';
  address: string;
  publicKey: string;
  network: 'ethereum' | 'bsc' | 'tron';
  balance: { [tokenSymbol: string]: number };
  createdAt?: Date;
  updatedAt?: Date;
  isActive?: boolean;
  isSelected?: boolean;
}

interface WalletContextType {
  selectedWallet: WalletData | null;
  wallets: WalletData[];
  transactions: Transaction[];
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  refreshWallets: () => Promise<void>;
  selectWallet: (walletId: string) => void;
  addWallet: (name: string, type?: 'native' | 'imported') => Promise<void>;
  getWalletAddress: (network?: string) => string;
  updateBalance: (walletId: string, token: string, amount: number) => Promise<void>;
  createTransaction: (txData: Partial<Transaction>) => Promise<void>;
  refreshTransactions: () => Promise<void>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function useWallet(): WalletContextType {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}

interface WalletProviderProps {
  children: ReactNode;
}

export function WalletProvider({ children }: WalletProviderProps) {
  const [selectedWallet, setSelectedWallet] = useState<WalletData | null>(null);
  const [wallets, setWallets] = useState<WalletData[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Initialize Chrome Extension API state
  useEffect(() => {
    const isExtension = typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id;
    if (isExtension) {
      console.log('🔌 Chrome Extension detected: Clearing API failed state');
      clearAPIFailedState();
    }
  }, []);

  // Generate wallet data helper
  const generateWalletData = () => {
    const address = '0x' + Array.from({ length: 40 }, () => 
      Math.floor(Math.random() * 16).toString(16)
    ).join('');
    
    const publicKey = '0x' + Array.from({ length: 128 }, () => 
      Math.floor(Math.random() * 16).toString(16)
    ).join('');

    return { address, publicKey };
  };

  // Load wallets with real-time updates
  const refreshWallets = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Try API first if network allows, then fallback to mock API
      let response;

      if (!shouldSkipAPICall()) {
        try {
          console.log('🔄 Attempting API call to:', 'https://safepal-wallet-backend.onrender.com/api/wallets');
          response = await walletApi.getWallets();
          console.log('✅ API connected and working, response:', response);
          markAPIAsWorking();
        } catch (apiError) {
          console.error('❌ API failed with error:', apiError);

          const isExtension = typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id;
          const errorMessage = apiError instanceof Error ? apiError.message : String(apiError);

          // Better error handling for Chrome extension
          if (isExtension) {
            if (errorMessage.includes('timeout') || errorMessage.includes('Failed to fetch')) {
              console.log('🔌 Extension network issue, will retry next polling cycle');
              setError('Network issue - retrying...');
              setLoading(false);
              return; // Exit early, retry next time
            }
          }

          // For persistent failures, fall back to mock data
          console.log('⚠️ API persistently unavailable, using mock data');
          setError('Using offline mode');
          markAPIAsFailed();
          response = await mockDB.getWallets();
        }
      } else {
        console.log('⚠️ Skipping API call, using mock data');
        response = await mockDB.getWallets();
      }

      if (response.success && response.wallets) {
        const walletsData = response.wallets.map((wallet: any) => ({
          id: wallet._id || wallet.id,
          _id: wallet._id || wallet.id,
          name: wallet.name,
          type: wallet.type,
          address: wallet.address,
          publicKey: wallet.publicKey,
          network: wallet.network,
          balance: wallet.balance || {},
          createdAt: wallet.createdAt,
          updatedAt: wallet.updatedAt,
          isActive: wallet.isActive,
          isSelected: false
        }));

        // Force React re-render by checking if data actually changed
        const currentWalletsString = JSON.stringify(wallets);
        const newWalletsString = JSON.stringify(walletsData);

        if (currentWalletsString !== newWalletsString) {
          console.log('💡 Wallet data changed, updating state...');
          setWallets([...walletsData]); // Force new array reference

          // Update selected wallet if it exists in new data
          if (selectedWallet) {
            const updatedSelectedWallet = walletsData.find(w => w.id === selectedWallet.id);
            if (updatedSelectedWallet) {
              console.log('💡 Selected wallet balance updated:', updatedSelectedWallet.balance);
              setSelectedWallet({...updatedSelectedWallet, isSelected: true});
            }
          }
        } else {
          console.log('ℹ️ No wallet data changes detected');
        }

        setLastUpdated(new Date());

        // If no wallets exist, seed the database with sample data
        if (walletsData.length === 0) {
          console.log('🌱 No wallets found, seeding database...');
          try {
            await generalApi.seedDatabase();
            console.log('✅ Database seeded, refreshing wallets...');
            // Refresh again after seeding
            const seededResponse = await walletApi.getWallets();
            if (seededResponse.success && seededResponse.wallets) {
              const seededWallets = seededResponse.wallets.map((wallet: any) => ({
                id: wallet._id || wallet.id,
                _id: wallet._id || wallet.id,
                name: wallet.name,
                type: wallet.type,
                address: wallet.address,
                publicKey: wallet.publicKey,
                network: wallet.network,
                balance: wallet.balance || {},
                createdAt: wallet.createdAt,
                updatedAt: wallet.updatedAt,
                isActive: wallet.isActive,
                isSelected: false
              }));
              setWallets(seededWallets);
              if (seededWallets.length > 0) {
                const firstWallet = { ...seededWallets[0], isSelected: true };
                setSelectedWallet(firstWallet);
              }
            }
          } catch (seedError) {
            console.log('⚠️ Could not seed database, using fallback wallet');
            // Create fallback wallet if seeding fails
            const fallbackWallet = createDefaultWallet();
            setWallets([fallbackWallet]);
            setSelectedWallet(fallbackWallet);
          }
        } else {
          // Set first wallet as selected if none selected
          if (!selectedWallet) {
            const firstWallet = { ...walletsData[0], isSelected: true };
            setSelectedWallet(firstWallet);
          }
        }

        // Cache in localStorage
        localStorage.setItem('safepal_wallets', JSON.stringify(walletsData));

        setError(null);
      }
    } catch (error) {
      console.error('Error loading wallets:', error);
      setError('Failed to load wallet data');

      // Fallback to localStorage
      const storedWallets = localStorage.getItem('safepal_wallets');
      if (storedWallets) {
        const parsedWallets = JSON.parse(storedWallets);
        setWallets(parsedWallets);
        if (!selectedWallet && parsedWallets.length > 0) {
          setSelectedWallet(parsedWallets[0]);
        }
      }
    }

    setLoading(false);
  }, []); // Remove selectedWallet dependency to prevent infinite loops

  // Load transactions for selected wallet
  const refreshTransactions = useCallback(async () => {
    if (!selectedWallet) return;

    try {
      let response;

      // Check if we should skip API call
      if (!shouldSkipAPICall()) {
        try {
          response = await walletApi.getWalletTransactions(selectedWallet.id);
          console.log('✅ Transactions loaded from API');
          markAPIAsWorking();
        } catch (apiError) {
          console.log('⚠️ API failed for transactions, using mock data');
          markAPIAsFailed();
          response = await mockDB.getTransactions(selectedWallet.id);
        }
      } else {
        console.log('⚠️ Skipping API, using mock transactions');
        response = await mockDB.getTransactions(selectedWallet.id);
      }

      if (response && response.success) {
        setTransactions(response.transactions || []);
      }
    } catch (error) {
      console.error('Error loading transactions:', error);
      // Ensure we always have an empty array as fallback
      setTransactions([]);
    }
  }, [selectedWallet]);

  // Create default wallet
  const createDefaultWallet = (): WalletData => {
    const { address, publicKey } = generateWalletData();
    return {
      id: Date.now().toString(),
      name: 'Main Wallet',
      type: 'native',
      address,
      publicKey,
      network: 'ethereum',
      balance: {
        eth: 2.5,
        btc: 0.05,
        bnb: 10.0,
        usdc: 1000,
        usdt: 500,
        pol: 2500,
        trx: 15000
      },
      isActive: true,
      isSelected: true
    };
  };

  // Add new wallet
  const addWallet = async (name: string, type: 'native' | 'imported' = 'native') => {
    const { address, publicKey } = generateWalletData();
    const customId = Date.now().toString();

    try {
      let response;

      if (!shouldSkipAPICall()) {
        try {
          response = await walletApi.createWallet({
            name,
            type,
            address,
            publicKey,
            network: 'ethereum',
            id: customId // Pass the custom ID
          });
          markAPIAsWorking();
        } catch (apiError) {
          markAPIAsFailed();
          response = await mockDB.createWallet({
            name,
            type,
            address,
            publicKey,
            network: 'ethereum',
            id: customId // Pass the custom ID
          });
        }
      } else {
        response = await mockDB.createWallet({
          name,
          type,
          address,
          publicKey,
          network: 'ethereum',
          id: customId // Pass the custom ID
        });
      }

      if (response.success) {
        await refreshWallets(); // Refresh from database
        return;
      }
    } catch (error) {
      console.error('Error creating wallet:', error);
    }

    // Fallback to localStorage
    const newWallet: WalletData = {
      id: customId,
      name,
      type,
      address,
      publicKey,
      network: 'ethereum',
      balance: {
        eth: Math.random() * 5,
        btc: Math.random() * 0.1,
        bnb: Math.random() * 20,
        usdc: Math.random() * 2000,
        usdt: Math.random() * 1000,
        pol: Math.random() * 5000,
        trx: Math.random() * 20000
      },
      isActive: true,
      isSelected: false
    };

    const updatedWallets = [...wallets, newWallet];
    setWallets(updatedWallets);
    localStorage.setItem('safepal_wallets', JSON.stringify(updatedWallets));
  };

  // Update wallet balance
  const updateBalance = async (walletId: string, token: string, amount: number) => {
    try {
      let response;

      if (!shouldSkipAPICall()) {
        try {
          response = await walletApi.updateWalletBalance(walletId, token, amount);
          markAPIAsWorking();
        } catch (apiError) {
          markAPIAsFailed();
          response = await mockDB.updateWalletBalance(walletId, token, amount);
        }
      } else {
        response = await mockDB.updateWalletBalance(walletId, token, amount);
      }

      if (response.success) {
        // Update local state immediately for instant feedback
        setWallets(prev => prev.map(wallet =>
          wallet.id === walletId
            ? { ...wallet, balance: { ...wallet.balance, [token]: amount }, updatedAt: new Date() }
            : wallet
        ));

        if (selectedWallet?.id === walletId) {
          setSelectedWallet(prev => prev ? {
            ...prev,
            balance: { ...prev.balance, [token]: amount },
            updatedAt: new Date()
          } : null);
        }

        setLastUpdated(new Date());
      }
    } catch (error) {
      console.error('Error updating balance:', error);
    }
  };

  // Create transaction
  const createTransaction = async (txData: Partial<Transaction>) => {
    try {
      let response;

      if (!shouldSkipAPICall()) {
        try {
          response = await transactionApi.createTransaction(txData as any);
          markAPIAsWorking();

          // If this is a send transaction, update local wallet balance immediately
          if (txData.type === 'send' && txData.walletId && txData.token && txData.amount) {
            const wallet = wallets.find(w => w.id === txData.walletId);
            if (wallet) {
              const currentBalance = wallet.balance[txData.token] || 0;
              const newBalance = Math.max(0, currentBalance - txData.amount);
              await updateBalance(txData.walletId, txData.token, newBalance);
            }
          }
        } catch (apiError) {
          markAPIAsFailed();
          response = await mockDB.createTransaction(txData);
        }
      } else {
        response = await mockDB.createTransaction(txData);
      }

      if (response && response.success) {
        setTransactions(prev => [response.transaction, ...prev]);
        setLastUpdated(new Date());
      }
    } catch (error) {
      console.error('Error creating transaction:', error);
    }
  };

  // Select wallet
  const selectWallet = (walletId: string) => {
    const wallet = wallets.find(w => w.id === walletId);
    if (wallet) {
      const updatedWallets = wallets.map(w => ({
        ...w,
        isSelected: w.id === walletId
      }));
      
      setWallets(updatedWallets);
      setSelectedWallet({ ...wallet, isSelected: true });
      localStorage.setItem('safepal_wallets', JSON.stringify(updatedWallets));
      localStorage.setItem('safepal_selected_wallet', walletId);
    }
  };

  // Get wallet address for specific network
  const getWalletAddress = (network?: string): string => {
    if (!selectedWallet) return '0x0000000000000000000000000000000000000000';
    return selectedWallet.address;
  };

  // Load wallets and set up real-time listeners
  useEffect(() => {
    refreshWallets();

    // Set up real-time listener for mock DB updates
    const unsubscribe = mockDB.subscribe(() => {
      refreshWallets();
      refreshTransactions();
    });

    return unsubscribe;
  }, [refreshWallets, refreshTransactions]);

  // Load transactions when selected wallet changes
  useEffect(() => {
    if (selectedWallet) {
      refreshTransactions();
    }
  }, [selectedWallet?.id, refreshTransactions]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      refreshWallets();
      refreshTransactions();
    }, 30000);

    return () => clearInterval(interval);
  }, [refreshWallets, refreshTransactions]);

  const value = {
    selectedWallet,
    wallets,
    transactions,
    loading,
    error,
    lastUpdated,
    refreshWallets,
    selectWallet,
    addWallet,
    getWalletAddress,
    updateBalance,
    createTransaction,
    refreshTransactions
  };

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}
