import { useState, useEffect, useCallback } from 'react';
import { walletApi, ApiError } from '../lib/api';

export interface WalletData {
  _id?: string;
  name: string;
  type: 'native' | 'imported';
  address: string;
  publicKey: string;
  network: 'ethereum' | 'bsc' | 'tron';
  balance: { [tokenSymbol: string]: number };
  createdAt?: Date;
  updatedAt?: Date;
  isActive?: boolean;
}

export function useWalletsDB() {
  const [wallets, setWallets] = useState<WalletData[]>([]);
  const [selectedWallet, setSelectedWallet] = useState<WalletData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if this is first time user (no wallets in database)
  const isFirstTime = wallets.length === 0;
  const hasWallets = wallets.length > 0;

  // Fetch wallets from database
  const fetchWallets = useCallback(async (type?: 'native' | 'imported') => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await walletApi.getWallets(type);
      if (response.success) {
        setWallets(response.wallets);
        
        // Set first wallet as selected if none is selected
        if (!selectedWallet && response.wallets.length > 0) {
          setSelectedWallet(response.wallets[0]);
        }
      }
    } catch (err) {
      const errorMessage = err instanceof ApiError 
        ? err.message 
        : 'Failed to fetch wallets';
      setError(errorMessage);
      console.error('Error fetching wallets:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedWallet]);

  // Create a new wallet
  const addWallet = useCallback(async (
    name: string, 
    type: 'native' | 'imported' = 'native',
    additionalData?: {
      address?: string;
      mnemonic?: string;
      privateKey?: string;
      publicKey?: string;
      network?: 'ethereum' | 'bsc' | 'tron';
    }
  ) => {
    setLoading(true);
    setError(null);

    try {
      // Generate or use provided wallet data
      const walletData = {
        name,
        type,
        address: additionalData?.address || generateAddress(),
        publicKey: additionalData?.publicKey || generatePublicKey(),
        network: additionalData?.network || 'ethereum' as const,
        mnemonic: type === 'native' ? (additionalData?.mnemonic || generateMnemonic()) : undefined,
        privateKey: additionalData?.privateKey,
      };

      const response = await walletApi.createWallet(walletData);
      
      if (response.success) {
        const newWallet = response.wallet;
        setWallets(prev => [...prev, newWallet]);
        setSelectedWallet(newWallet);
        return newWallet;
      }
    } catch (err) {
      const errorMessage = err instanceof ApiError 
        ? err.message 
        : 'Failed to create wallet';
      setError(errorMessage);
      console.error('Error creating wallet:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Select a wallet
  const selectWallet = useCallback((wallet: WalletData) => {
    setSelectedWallet(wallet);
  }, []);

  // Update wallet balance
  const updateWalletBalance = useCallback(async (
    walletId: string, 
    tokenSymbol: string, 
    balance: number
  ) => {
    try {
      const response = await walletApi.updateWalletBalance(walletId, tokenSymbol, balance);
      
      if (response.success) {
        // Update local state
        setWallets(prev => prev.map(wallet => 
          wallet._id === walletId 
            ? { ...wallet, balance: { ...wallet.balance, [tokenSymbol]: balance } }
            : wallet
        ));

        // Update selected wallet if it's the one being updated
        if (selectedWallet?._id === walletId) {
          setSelectedWallet(prev => prev ? {
            ...prev,
            balance: { ...prev.balance, [tokenSymbol]: balance }
          } : null);
        }
      }
    } catch (err) {
      const errorMessage = err instanceof ApiError 
        ? err.message 
        : 'Failed to update wallet balance';
      setError(errorMessage);
      console.error('Error updating wallet balance:', err);
    }
  }, [selectedWallet]);

  // Remove wallet
  const removeWallet = useCallback(async (walletId: string) => {
    try {
      const response = await walletApi.deactivateWallet(walletId);
      
      if (response.success) {
        setWallets(prev => prev.filter(wallet => wallet._id !== walletId));
        
        // If the removed wallet was selected, select another one
        if (selectedWallet?._id === walletId) {
          const remainingWallets = wallets.filter(wallet => wallet._id !== walletId);
          setSelectedWallet(remainingWallets.length > 0 ? remainingWallets[0] : null);
        }
      }
    } catch (err) {
      const errorMessage = err instanceof ApiError 
        ? err.message 
        : 'Failed to remove wallet';
      setError(errorMessage);
      console.error('Error removing wallet:', err);
    }
  }, [selectedWallet, wallets]);

  // Get wallets by type
  const getWalletsByType = useCallback(async (type: 'native' | 'imported') => {
    return fetchWallets(type);
  }, [fetchWallets]);

  // Load wallets on mount
  useEffect(() => {
    fetchWallets();
  }, [fetchWallets]);

  return {
    wallets,
    selectedWallet,
    loading,
    error,
    isFirstTime,
    hasWallets,
    addWallet,
    selectWallet,
    updateWalletBalance,
    removeWallet,
    fetchWallets,
    getWalletsByType,
    clearError: () => setError(null),
  };
}

// Helper functions for wallet generation (you can replace these with actual crypto libraries)
function generateAddress(): string {
  return '0x' + Array.from({ length: 40 }, () => 
    Math.floor(Math.random() * 16).toString(16)
  ).join('');
}

function generatePublicKey(): string {
  return '0x' + Array.from({ length: 128 }, () => 
    Math.floor(Math.random() * 16).toString(16)
  ).join('');
}

function generateMnemonic(): string {
  const words = [
    'abandon', 'ability', 'able', 'about', 'above', 'absent', 'absorb', 'abstract',
    'absurd', 'abuse', 'access', 'accident', 'account', 'accuse', 'achieve', 'acid',
    'acoustic', 'acquire', 'across', 'act', 'action', 'actor', 'actress', 'actual'
  ];
  
  return Array.from({ length: 12 }, () => 
    words[Math.floor(Math.random() * words.length)]
  ).join(' ');
}
