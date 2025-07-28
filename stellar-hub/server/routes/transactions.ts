import { Request, Response } from 'express';
import { walletService } from '../services/walletService';
import { ObjectId } from 'mongodb';
import { mockDB } from '../../client/lib/mockAPI';

// Create a new transaction
export async function createTransaction(req: Request, res: Response) {
  try {
    const {
      walletId,
      from,
      to,
      amount,
      token,
      network,
      txHash,
      gasUsed,
      gasPrice,
      type = 'send' // Add transaction type (send/receive)
    } = req.body;

    if (!walletId || !from || !to || !amount || !token || !network) {
      return res.status(400).json({
        error: 'Missing required fields: walletId, from, to, amount, token, network'
      });
    }

    // Generate transaction hash if not provided
    const finalTxHash = txHash || '0x' + Math.random().toString(16).substring(2, 66);

    const transactionData = {
      walletId: new ObjectId(walletId),
      from,
      to,
      amount: parseFloat(amount),
      token: token.toLowerCase(),
      network,
      txHash: finalTxHash,
      status: 'pending' as const,
      gasUsed,
      gasPrice,
      timestamp: new Date(),
    };

    try {
      // 1. Create the transaction record
      const transaction = await walletService.createTransaction(transactionData);

      // 2. Update wallet balance (only for 'send' transactions from this wallet)
      if (type === 'send') {
        // Get current wallet to verify the sender
        const wallet = await walletService.getWalletById(walletId);

        if (wallet && wallet.address.toLowerCase() === from.toLowerCase()) {
          // Decrease the balance for the sent token
          const currentBalance = wallet.balance[token.toLowerCase()] || 0;
          const newBalance = Math.max(0, currentBalance - parseFloat(amount));

          await walletService.updateWalletBalance(walletId, token.toLowerCase(), newBalance);
          console.log(`✅ Updated wallet balance: ${token} ${currentBalance} -> ${newBalance}`);
        }
      }

      res.status(201).json({
        success: true,
        transaction,
        message: 'Transaction created and wallet balance updated'
      });
    } catch (mongoError) {
      console.log('MongoDB failed, falling back to mock service for transaction');

      // Fallback to mock service
      const mockTxData = {
        id: finalTxHash,
        walletId,
        type: type as 'send' | 'receive',
        amount: parseFloat(amount),
        token: token.toLowerCase(),
        from,
        to,
        hash: finalTxHash,
        status: 'pending' as const,
        timestamp: new Date(),
        network
      };

      const mockResponse = await mockDB.createTransaction(mockTxData);

      if (type === 'send' && mockResponse.success) {
        // Update mock balance as well
        await mockDB.updateWalletBalance(walletId, token.toLowerCase(),
          Math.max(0, parseFloat(amount)) // Decrease balance in mock too
        );
      }

      res.status(201).json({
        success: true,
        transaction: mockResponse.transaction,
        message: 'Transaction created using fallback service',
        fallback: true
      });
    }
  } catch (error) {
    console.error('Error creating transaction:', error);
    res.status(500).json({
      error: 'Failed to create transaction',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

// Update transaction status
export async function updateTransactionStatus(req: Request, res: Response) {
  try {
    const { txHash } = req.params;
    const { status, blockNumber } = req.body;

    if (!status || !['pending', 'confirmed', 'failed'].includes(status)) {
      return res.status(400).json({ 
        error: 'Invalid status. Must be pending, confirmed, or failed' 
      });
    }

    const success = await walletService.updateTransactionStatus(txHash, status, blockNumber);
    
    if (!success) {
      return res.status(404).json({ 
        error: 'Transaction not found or update failed' 
      });
    }

    res.json({ 
      success: true, 
      message: 'Transaction status updated successfully' 
    });
  } catch (error) {
    console.error('Error updating transaction status:', error);
    res.status(500).json({ 
      error: 'Failed to update transaction status',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
