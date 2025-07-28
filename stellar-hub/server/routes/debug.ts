import { Request, Response } from 'express';
import { walletService } from '../services/walletService';
import { mockDB } from '../../client/lib/mockAPI';

// Debug endpoint to check wallet balances and state
export async function debugWalletBalances(req: Request, res: Response) {
  try {
    console.log('🔍 Debug: Checking wallet balances...');
    
    let mongoBalances = null;
    let mockBalances = null;
    
    // Try MongoDB first
    try {
      const mongoWallets = await walletService.getAllActiveWallets();
      mongoBalances = mongoWallets.map(wallet => ({
        id: wallet.id || wallet._id,
        name: wallet.name,
        balance: wallet.balance,
        address: wallet.address
      }));
      console.log('✅ MongoDB wallets found:', mongoBalances.length);
    } catch (mongoError) {
      console.log('❌ MongoDB failed:', mongoError.message);
    }
    
    // Try mock service
    try {
      const mockWallets = await mockDB.getWallets();
      mockBalances = mockWallets.wallets.map(wallet => ({
        id: wallet.id || wallet._id,
        name: wallet.name,
        balance: wallet.balance,
        address: wallet.address
      }));
      console.log('✅ Mock wallets found:', mockBalances.length);
    } catch (mockError) {
      console.log('❌ Mock service failed:', mockError.message);
    }
    
    const debugInfo = {
      timestamp: new Date().toISOString(),
      mongodb: {
        available: !!mongoBalances,
        wallets: mongoBalances
      },
      mock: {
        available: !!mockBalances,
        wallets: mockBalances
      }
    };
    
    res.json({
      success: true,
      debug: debugInfo
    });
    
  } catch (error) {
    console.error('Debug endpoint failed:', error);
    res.status(500).json({ 
      error: 'Debug failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

// Debug endpoint to reset mock balances
export async function resetMockBalances(req: Request, res: Response) {
  try {
    console.log('🔄 Resetting mock balances...');
    
    // Reset to initial values
    await mockDB.updateWalletBalance('wallet_1', 'eth', 2.5);
    await mockDB.updateWalletBalance('wallet_1', 'btc', 0.0125);
    await mockDB.updateWalletBalance('wallet_1', 'bnb', 15.7);
    await mockDB.updateWalletBalance('wallet_1', 'usdc', 1000);
    await mockDB.updateWalletBalance('wallet_1', 'usdt', 500);
    
    console.log('✅ Mock balances reset to defaults');
    
    res.json({
      success: true,
      message: 'Mock balances reset to default values',
      balances: {
        eth: 2.5,
        btc: 0.0125,
        bnb: 15.7,
        usdc: 1000,
        usdt: 500
      }
    });
    
  } catch (error) {
    console.error('Reset failed:', error);
    res.status(500).json({ 
      error: 'Reset failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
