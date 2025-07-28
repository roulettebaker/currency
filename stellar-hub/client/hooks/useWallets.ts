import { useState, useEffect } from 'react';
import { walletApi } from '../lib/api';
import { shouldSkipAPICall, markAPIAsFailed, markAPIAsWorking, shouldRetryAPI } from '../lib/networkUtils';

interface Wallet {
  id: string;
  name: string;
  balance: string;
  isSelected: boolean;
  type: 'native' | 'imported';
  _id?: string;
  address?: string;
  network?: string;
}

const WALLETS_STORAGE_KEY = 'safepal_wallets';
const SELECTED_WALLET_KEY = 'safepal_selected_wallet';

export function useWallets() {
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [isFirstTime, setIsFirstTime] = useState(false);
  const [loading, setLoading] = useState(true);

  // Helper function to generate wallet data
  const generateWalletData = () => {
    const address = '0x' + Array.from({ length: 40 }, () =>
      Math.floor(Math.random() * 16).toString(16)
    ).join('');

    const publicKey = '0x' + Array.from({ length: 128 }, () =>
      Math.floor(Math.random() * 16).toString(16)
    ).join('');

    return { address, publicKey };
  };

  // Load wallets from both MongoDB and localStorage (fallback)
  const loadWallets = async () => {
    setLoading(true);

    // Check if we should skip API call entirely
    const skipAPI = shouldSkipAPICall() && !shouldRetryAPI();

    if (!skipAPI) {
      try {
        console.log('Attempting to fetch wallets from API...');
        const response = await walletApi.getWallets();

        if (response && typeof response === 'object' && 'success' in response && response.success && response.wallets) {
          const mongoWallets = response.wallets.map((wallet: any, index: number) => ({
            id: wallet._id || wallet.id || `wallet_${index}`,
            name: wallet.name || `Wallet ${index + 1}`,
            balance: '≈$0',
            isSelected: index === 0, // First wallet selected by default
            type: wallet.type || 'native',
            _id: wallet._id || wallet.id,
            address: wallet.address,
            network: wallet.network || 'ethereum'
          }));

          setWallets(mongoWallets);
          setIsFirstTime(mongoWallets.length === 0);

          // Save to localStorage as cache and mark API as working
          localStorage.setItem(WALLETS_STORAGE_KEY, JSON.stringify(mongoWallets));
          markAPIAsWorking();
          setLoading(false);
          return;
        }
      } catch (error) {
        // Handle specific error types more gracefully
        if (error instanceof Error) {
          if (error.message.includes('aborted') || error.message.includes('timeout')) {
            console.log('API request timed out, falling back to localStorage');
          } else if (error.message.includes('Network connection failed')) {
            console.log('Network unavailable, falling back to localStorage');
          } else {
            console.log('API failed, falling back to localStorage:', error.message);
          }
        } else {
          console.log('API failed, falling back to localStorage:', error);
        }
        markAPIAsFailed();
      }
    } else {
      console.log('Skipping API call, using localStorage directly');
    }

    // Fallback to localStorage
    const storedWallets = localStorage.getItem(WALLETS_STORAGE_KEY);
    if (storedWallets) {
      try {
        const parsedWallets = JSON.parse(storedWallets);
        if (Array.isArray(parsedWallets) && parsedWallets.length > 0) {
          setWallets(parsedWallets);
          setIsFirstTime(false);
        } else {
          setIsFirstTime(true);
        }
      } catch (error) {
        console.error('Error parsing stored wallets:', error);
        setIsFirstTime(true);
      }
    } else {
      // Create a default wallet if no stored wallets and no API
      const defaultWallet: Wallet = {
        id: 'default_wallet_1',
        name: 'Main Wallet',
        balance: '≈$24,284.93',
        isSelected: true,
        type: 'native',
        address: '0x742d35Cc7f15C6B4BF8Df4345678901234567890',
        network: 'ethereum'
      };
      setWallets([defaultWallet]);
      localStorage.setItem(WALLETS_STORAGE_KEY, JSON.stringify([defaultWallet]));
      setIsFirstTime(false);
    }
    setLoading(false);
  };

  useEffect(() => {
    const safeLoadWallets = async () => {
      try {
        await loadWallets();
      } catch (error) {
        console.warn('Failed to load wallets in useEffect:', error);
        setLoading(false);
        setIsFirstTime(true);

        // Ensure we have a fallback wallet even if everything fails
        const fallbackWallet: Wallet = {
          id: 'fallback_wallet_1',
          name: 'Demo Wallet',
          balance: '≈$24,284.93',
          isSelected: true,
          type: 'native',
          address: '0x742d35Cc7f15C6B4BF8Df4345678901234567890',
          network: 'ethereum'
        };
        setWallets([fallbackWallet]);
        localStorage.setItem(WALLETS_STORAGE_KEY, JSON.stringify([fallbackWallet]));
      }
    };

    safeLoadWallets();
  }, []);

  const addWallet = async (name: string, type: 'native' | 'imported' = 'native') => {
    const { address, publicKey } = generateWalletData();

    // Skip API call if we know it's failing
    const skipAPI = shouldSkipAPICall() && !shouldRetryAPI();

    if (!skipAPI) {
      try {
        // Try to save to API with shorter timeout
        const response = await Promise.race([
          walletApi.createWallet({
            name,
            type,
            address,
            publicKey,
            network: 'ethereum'
          }),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 3000))
        ]);

        if (response && typeof response === 'object' && 'success' in response && response.success && response.wallet) {
          const newWallet: Wallet = {
            id: response.wallet._id || response.wallet.id || Date.now().toString(),
            name: response.wallet.name || name,
            balance: '≈$0',
            isSelected: wallets.length === 0,
            type: response.wallet.type || type,
            _id: response.wallet._id || response.wallet.id,
            address: response.wallet.address || address,
            network: response.wallet.network || 'ethereum'
          };

          const updatedWallets = [...wallets, newWallet];
          setWallets(updatedWallets);
          localStorage.setItem(WALLETS_STORAGE_KEY, JSON.stringify(updatedWallets));
          setIsFirstTime(false);
          return;
        }
      } catch (error) {
        // Handle specific error types more gracefully
        if (error instanceof Error) {
          if (error.message.includes('aborted') || error.message.includes('timeout')) {
            console.log('API request timed out when creating wallet, saving to localStorage only');
          } else if (error.message.includes('Network connection failed')) {
            console.log('Network unavailable when creating wallet, saving to localStorage only');
          } else {
            console.log('API failed when creating wallet, saving to localStorage only:', error.message);
          }
        } else {
          console.log('API failed when creating wallet, saving to localStorage only:', error);
        }
        markAPIAsFailed();
      }
    }

    // Fallback to localStorage only
    const newWallet: Wallet = {
      id: Date.now().toString(),
      name,
      balance: '≈$0',
      isSelected: wallets.length === 0,
      type,
      address,
      network: 'ethereum'
    };

    const updatedWallets = [...wallets, newWallet];
    setWallets(updatedWallets);
    localStorage.setItem(WALLETS_STORAGE_KEY, JSON.stringify(updatedWallets));
    setIsFirstTime(false);
  };

  const selectWallet = (walletId: string) => {
    const updatedWallets = wallets.map(wallet => ({
      ...wallet,
      isSelected: wallet.id === walletId
    }));
    setWallets(updatedWallets);
    localStorage.setItem(WALLETS_STORAGE_KEY, JSON.stringify(updatedWallets));
    localStorage.setItem(SELECTED_WALLET_KEY, walletId);
  };

  const getSelectedWallet = () => {
    return wallets.find(wallet => wallet.isSelected);
  };

  return {
    wallets,
    isFirstTime,
    addWallet,
    selectWallet,
    getSelectedWallet,
    hasWallets: wallets.length > 0,
    loading,
    refreshWallets: loadWallets
  };
}
