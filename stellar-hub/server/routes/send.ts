import { Request, Response } from 'express';
import { walletService } from '../services/walletService';
import { mockDB } from '../../client/lib/mockAPI';

// Send transaction endpoint - handles transaction creation and balance updates atomically
export async function sendTransaction(req: Request, res: Response) {
  try {
    const { 
      walletId, 
      to, 
      amount, 
      token, 
      network = 'ethereum'
    } = req.body;

    console.log('Received send transaction request:', { walletId, to, amount, token, network });

    // Validate required fields
    if (!walletId || !to || !amount || !token) {
      console.log('Missing fields validation failed:', {
        walletId: !!walletId,
        to: !!to,
        amount: !!amount,
        token: !!token
      });
      return res.status(400).json({
        error: 'Missing required fields: walletId, to, amount, token',
        received: { walletId: !!walletId, to: !!to, amount: !!amount, token: !!token }
      });
    }

    // Validate amount is a valid number
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      return res.status(400).json({
        error: 'Invalid amount: must be a positive number',
        received: { amount, parsedAmount: numAmount }
      });
    }

    // Generate transaction hash
    const txHash = '0x' + Math.random().toString(16).substring(2, 66);
    
    try {
      // Validate walletId format
      if (typeof walletId !== 'string' || walletId.trim() === '') {
        return res.status(400).json({
          error: 'Invalid walletId format'
        });
      }

      // Get sender wallet
      const wallet = await walletService.getWalletById(walletId);
      
      if (!wallet) {
        return res.status(404).json({ 
          error: 'Wallet not found' 
        });
      }

      // Check balance
      const currentBalance = wallet.balance[token.toLowerCase()] || 0;
      console.log(`💰 Balance check: current=${currentBalance} ${token}, requested=${parseFloat(amount)}`);

      if (currentBalance < parseFloat(amount)) {
        return res.status(400).json({
          error: 'Insufficient balance',
          details: {
            currentBalance,
            requestedAmount: parseFloat(amount),
            token: token.toLowerCase()
          }
        });
      }

      // Create transaction data
      const transactionData = {
        walletId,
        from: wallet.address,
        to,
        amount: parseFloat(amount),
        token: token.toLowerCase(),
        network,
        txHash,
        status: 'confirmed' as const, // Set as confirmed for demo
        timestamp: new Date(),
      };

      // 1. Create transaction record
      const transaction = await walletService.createTransaction(transactionData);
      
      // 2. Update wallet balance
      const newBalance = Math.max(0, currentBalance - parseFloat(amount));
      await walletService.updateWalletBalance(walletId, token.toLowerCase(), newBalance);
      
      console.log(`✅ Transaction sent: ${amount} ${token} from ${wallet.address} to ${to}`);
      console.log(`✅ Balance updated: ${token} ${currentBalance} -> ${newBalance}`);
      
      res.status(201).json({ 
        success: true, 
        transaction: {
          ...transaction,
          hash: txHash
        },
        newBalance,
        message: 'Transaction sent successfully'
      });
      
    } catch (mongoError) {
      console.log('MongoDB failed, using mock service for send transaction:', mongoError.message);

      try {
        // Fallback to mock service
        const mockWallets = await mockDB.getWallets();
        const mockWallet = mockWallets.wallets.find(w => w.id === walletId || w._id === walletId);

        if (!mockWallet) {
          return res.status(404).json({
            error: 'Wallet not found in fallback service'
          });
        }

        const currentBalance = mockWallet.balance[token.toLowerCase()] || 0;
        console.log(`💰 Mock balance check: current=${currentBalance} ${token}, requested=${parseFloat(amount)}`);

        if (currentBalance < parseFloat(amount)) {
          return res.status(400).json({
            error: 'Insufficient balance',
            details: {
              currentBalance,
              requestedAmount: parseFloat(amount),
              token: token.toLowerCase(),
              service: 'mock'
            }
          });
        }

        // Create mock transaction
        const mockTxData = {
          id: txHash,
          walletId,
          type: 'send' as const,
          amount: parseFloat(amount),
          token: token.toLowerCase(),
          from: mockWallet.address,
          to,
          hash: txHash,
          status: 'confirmed' as const,
          timestamp: new Date(),
          network
        };

        const mockTxResponse = await mockDB.createTransaction(mockTxData);

        // Update mock balance
        const newBalance = Math.max(0, currentBalance - parseFloat(amount));
        await mockDB.updateWalletBalance(walletId, token.toLowerCase(), newBalance);

        res.status(201).json({
          success: true,
          transaction: mockTxResponse.transaction,
          newBalance,
          message: 'Transaction sent using fallback service',
          fallback: true
        });
      } catch (fallbackError) {
        console.error('Both MongoDB and mock service failed:', fallbackError);
        res.status(500).json({
          error: 'All services unavailable',
          details: 'Both database and fallback service failed'
        });
      }
    }
  } catch (error) {
    console.error('Error sending transaction:', error);
    res.status(500).json({ 
      error: 'Failed to send transaction',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
