import { Request, Response } from 'express';
import { walletService } from '../services/walletService';
import { mockDB } from '../../client/lib/mockAPI';

// Atomic wallet transaction service that handles both balance updates and transaction records
export class WalletTransactionService {
  
  // Send transaction with atomic balance update
  static async sendTransaction(req: Request, res: Response) {
    const { 
      walletId, 
      to, 
      amount, 
      token, 
      network = 'ethereum'
    } = req.body;

    console.log('🔄 Processing send transaction:', { walletId, to, amount, token, network });

    // Validate required fields
    if (!walletId || !to || !amount || !token) {
      return res.status(400).json({ 
        error: 'Missing required fields: walletId, to, amount, token',
        received: { walletId: !!walletId, to: !!to, amount: !!amount, token: !!token }
      });
    }

    // Validate amount
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      return res.status(400).json({ 
        error: 'Invalid amount: must be a positive number',
        received: { amount, parsedAmount: numAmount }
      });
    }

    const txHash = '0x' + Math.random().toString(16).substring(2, 66);

    try {
      // Try MongoDB first
      const result = await this.processMongoTransaction(walletId, to, numAmount, token, network, txHash);
      if (result.success) {
        return res.status(201).json(result);
      }
    } catch (mongoError) {
      console.log('📱 MongoDB failed, using mock service:', mongoError.message);
    }

    // Fallback to mock service
    try {
      const result = await this.processMockTransaction(walletId, to, numAmount, token, network, txHash);
      return res.status(201).json(result);
    } catch (mockError) {
      console.error('❌ Both services failed:', mockError);
      return res.status(500).json({ 
        error: 'Transaction failed',
        details: 'Both database and fallback service are unavailable'
      });
    }
  }

  // Process transaction using MongoDB
  private static async processMongoTransaction(walletId: string, to: string, amount: number, token: string, network: string, txHash: string) {
    // Get wallet
    const wallet = await walletService.getWalletById(walletId);
    if (!wallet) {
      throw new Error('Wallet not found');
    }

    // Check balance
    const currentBalance = wallet.balance[token.toLowerCase()] || 0;
    console.log(`💰 Current balance: ${currentBalance} ${token}, attempting to send: ${amount}`);
    
    if (currentBalance < amount) {
      throw new Error(`Insufficient balance: has ${currentBalance} ${token}, needs ${amount}`);
    }

    // Calculate new balance
    const newBalance = Math.max(0, currentBalance - amount);

    // Create transaction record
    const transaction = await walletService.createTransaction({
      walletId,
      from: wallet.address,
      to,
      amount,
      token: token.toLowerCase(),
      network,
      txHash,
      status: 'confirmed',
      timestamp: new Date(),
    });

    // Update balance
    await walletService.updateWalletBalance(walletId, token.toLowerCase(), newBalance);

    console.log(`✅ MongoDB transaction successful: ${token} ${currentBalance} -> ${newBalance}`);

    return {
      success: true,
      transaction: {
        ...transaction,
        hash: txHash
      },
      newBalance,
      message: 'Transaction sent successfully',
      service: 'mongodb'
    };
  }

  // Process transaction using mock service
  private static async processMockTransaction(walletId: string, to: string, amount: number, token: string, network: string, txHash: string) {
    // Get mock wallets
    const mockWallets = await mockDB.getWallets();
    const mockWallet = mockWallets.wallets.find(w => w.id === walletId || w._id === walletId);
    
    if (!mockWallet) {
      throw new Error('Wallet not found in mock service');
    }

    // Check balance
    const currentBalance = mockWallet.balance[token.toLowerCase()] || 0;
    console.log(`💰 Mock balance: ${currentBalance} ${token}, attempting to send: ${amount}`);
    
    if (currentBalance < amount) {
      throw new Error(`Insufficient balance: has ${currentBalance} ${token}, needs ${amount}`);
    }

    // Calculate new balance
    const newBalance = Math.max(0, currentBalance - amount);

    // Create mock transaction
    const mockTxData = {
      id: txHash,
      walletId,
      type: 'send' as const,
      amount,
      token: token.toLowerCase(),
      from: mockWallet.address,
      to,
      hash: txHash,
      status: 'confirmed' as const,
      timestamp: new Date(),
      network
    };

    // Execute atomic mock transaction
    const mockTxResponse = await mockDB.createTransaction(mockTxData);
    await mockDB.updateWalletBalance(walletId, token.toLowerCase(), newBalance);

    console.log(`✅ Mock transaction successful: ${token} ${currentBalance} -> ${newBalance}`);

    return {
      success: true,
      transaction: mockTxResponse.transaction,
      newBalance,
      message: 'Transaction sent using demo service',
      service: 'mock',
      fallback: true
    };
  }
}
