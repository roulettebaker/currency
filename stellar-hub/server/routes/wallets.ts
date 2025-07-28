import { Request, Response } from 'express';
import { walletService, Wallet } from '../services/walletService';
import { mockDB } from '../../client/lib/mockAPI';

// Create a new wallet
export async function createWallet(req: Request, res: Response) {
  try {
    const { name, type, address, mnemonic, privateKey, publicKey, network } = req.body;

    if (!name || !type || !address || !publicKey || !network) {
      return res.status(400).json({ 
        error: 'Missing required fields: name, type, address, publicKey, network' 
      });
    }

    const walletData = {
      name,
      type,
      address,
      mnemonic: type === 'native' ? mnemonic : undefined,
      privateKey, // Should be encrypted before storing
      publicKey,
      network,
      balance: {},
      isActive: true,
    };

    const wallet = await walletService.createWallet(walletData);
    
    // Don't return sensitive data
    const { mnemonic: _, privateKey: __, ...safeWallet } = wallet;
    
    res.status(201).json({ 
      success: true, 
      wallet: safeWallet 
    });
  } catch (error) {
    console.error('Error creating wallet:', error);
    res.status(500).json({ 
      error: 'Failed to create wallet',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

// Get all active wallets
export async function getWallets(req: Request, res: Response) {
  try {
    const { type } = req.query;

    let wallets: Wallet[];

    if (type && (type === 'native' || type === 'imported')) {
      wallets = await walletService.getWalletsByType(type);
    } else {
      wallets = await walletService.getAllActiveWallets();
    }

    // Remove sensitive data
    const safeWallets = wallets.map(({ mnemonic, privateKey, ...wallet }) => wallet);

    res.json({
      success: true,
      wallets: safeWallets
    });
  } catch (error) {
    console.error('Error fetching wallets from MongoDB, falling back to mock data:', error);

    // Fallback to mock data when MongoDB is unavailable
    try {
      const mockResponse = await mockDB.getWallets();
      res.json({
        success: true,
        wallets: mockResponse.wallets,
        fallback: true
      });
    } catch (mockError) {
      console.error('Mock database also failed:', mockError);
      res.status(500).json({
        error: 'Failed to fetch wallets',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}

// Get wallet by ID
export async function getWallet(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const wallet = await walletService.getWalletById(id);

    if (!wallet) {
      return res.status(404).json({
        error: 'Wallet not found'
      });
    }

    // Remove sensitive data
    const { mnemonic, privateKey, ...safeWallet } = wallet;

    res.json({
      success: true,
      wallet: safeWallet
    });
  } catch (error) {
    console.error('Error fetching wallet from MongoDB, falling back to mock data:', error);

    // Fallback to mock data when MongoDB is unavailable
    try {
      const mockResponse = await mockDB.getWallets();
      const mockWallet = mockResponse.wallets.find(w => w.id === req.params.id || w._id === req.params.id);

      if (!mockWallet) {
        return res.status(404).json({
          error: 'Wallet not found'
        });
      }

      res.json({
        success: true,
        wallet: mockWallet,
        fallback: true
      });
    } catch (mockError) {
      console.error('Mock database also failed:', mockError);
      res.status(500).json({
        error: 'Failed to fetch wallet',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}

// Update wallet balance
export async function updateWalletBalance(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { tokenSymbol, balance } = req.body;

    if (!tokenSymbol || balance === undefined) {
      return res.status(400).json({
        error: 'Missing required fields: tokenSymbol, balance'
      });
    }

    const success = await walletService.updateWalletBalance(id, tokenSymbol, balance);

    if (!success) {
      return res.status(404).json({
        error: 'Wallet not found or update failed'
      });
    }

    res.json({
      success: true,
      message: 'Wallet balance updated successfully'
    });
  } catch (error) {
    console.error('Error updating wallet balance in MongoDB, falling back to mock data:', error);

    // Fallback to mock data when MongoDB is unavailable
    try {
      const { id } = req.params;
      const { tokenSymbol, balance } = req.body;

      const mockResponse = await mockDB.updateWalletBalance(id, tokenSymbol, balance);

      if (!mockResponse.success) {
        return res.status(404).json({
          error: 'Wallet not found or update failed'
        });
      }

      res.json({
        success: true,
        message: 'Wallet balance updated successfully (mock)',
        fallback: true
      });
    } catch (mockError) {
      console.error('Mock database also failed:', mockError);
      res.status(500).json({
        error: 'Failed to update wallet balance',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}

// Deactivate wallet
export async function deactivateWallet(req: Request, res: Response) {
  try {
    const { id } = req.params;
    
    const success = await walletService.deactivateWallet(id);
    
    if (!success) {
      return res.status(404).json({ 
        error: 'Wallet not found or deactivation failed' 
      });
    }

    res.json({ 
      success: true, 
      message: 'Wallet deactivated successfully' 
    });
  } catch (error) {
    console.error('Error deactivating wallet:', error);
    res.status(500).json({ 
      error: 'Failed to deactivate wallet',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

// Get wallet transactions
export async function getWalletTransactions(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { limit } = req.query;

    const transactions = await walletService.getTransactionsByWallet(
      id,
      limit ? parseInt(limit as string) : 50
    );

    res.json({
      success: true,
      transactions
    });
  } catch (error) {
    console.error('Error fetching wallet transactions from MongoDB, falling back to mock data:', error);

    // Fallback to mock data when MongoDB is unavailable
    try {
      const { id } = req.params;
      const mockResponse = await mockDB.getTransactions(id);

      res.json({
        success: true,
        transactions: mockResponse.transactions,
        fallback: true
      });
    } catch (mockError) {
      console.error('Mock database also failed:', mockError);
      res.status(500).json({
        error: 'Failed to fetch wallet transactions',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}
