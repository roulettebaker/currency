import { ObjectId } from 'mongodb';
import { getCollection } from '../config/database';

export interface Wallet {
  _id?: ObjectId;
  id?: string; // Custom ID for compatibility
  name: string;
  type: 'native' | 'imported';
  address: string;
  mnemonic?: string; // Only for native wallets
  privateKey?: string; // Encrypted
  publicKey: string;
  network: 'ethereum' | 'bsc' | 'tron';
  balance: {
    [tokenSymbol: string]: number;
  };
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

export interface Transaction {
  _id?: ObjectId;
  walletId: ObjectId | string; // Support both ObjectId and string for compatibility
  from: string;
  to: string;
  amount: number;
  token: string;
  network: string;
  txHash: string;
  status: 'pending' | 'confirmed' | 'failed';
  gasUsed?: number;
  gasPrice?: number;
  blockNumber?: number;
  timestamp: Date;
}

class WalletService {
  private readonly WALLET_COLLECTION = 'wallets';
  private readonly TRANSACTION_COLLECTION = 'transactions';

  async createWallet(walletData: Omit<Wallet, '_id' | 'createdAt' | 'updatedAt'>): Promise<Wallet> {
    const collection = await getCollection(this.WALLET_COLLECTION);

    const wallet: Wallet = {
      ...walletData,
      id: walletData.id || new ObjectId().toString(), // Ensure we have an ID
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await collection.insertOne(wallet);
    return { ...wallet, _id: result.insertedId };
  }

  async getWalletById(walletId: string): Promise<Wallet | null> {
    const collection = await getCollection(this.WALLET_COLLECTION);

    try {
      // Try to query by MongoDB ObjectId first
      if (ObjectId.isValid(walletId)) {
        return await collection.findOne({ _id: new ObjectId(walletId) }) as Wallet | null;
      }

      // If not valid ObjectId, search by custom id field
      return await collection.findOne({ id: walletId }) as Wallet | null;
    } catch (error) {
      console.error('Error in getWalletById:', error);
      return null;
    }
  }

  async getWalletsByType(type: 'native' | 'imported'): Promise<Wallet[]> {
    const collection = await getCollection(this.WALLET_COLLECTION);
    return await collection.find({ type, isActive: true }).toArray() as Wallet[];
  }

  async getAllActiveWallets(): Promise<Wallet[]> {
    const collection = await getCollection(this.WALLET_COLLECTION);
    return await collection.find({ isActive: true }).toArray() as Wallet[];
  }

  async updateWalletBalance(walletId: string, tokenSymbol: string, balance: number): Promise<boolean> {
    const collection = await getCollection(this.WALLET_COLLECTION);

    try {
      let query: any;

      // Try to update by MongoDB ObjectId first
      if (ObjectId.isValid(walletId)) {
        query = { _id: new ObjectId(walletId) };
      } else {
        // If not valid ObjectId, search by custom id field
        query = { id: walletId };
      }

      const result = await collection.updateOne(
        query,
        {
          $set: {
            [`balance.${tokenSymbol}`]: balance,
            updatedAt: new Date()
          }
        }
      );

      return result.modifiedCount > 0;
    } catch (error) {
      console.error('Error in updateWalletBalance:', error);
      return false;
    }
  }

  async deactivateWallet(walletId: string): Promise<boolean> {
    const collection = await getCollection(this.WALLET_COLLECTION);

    try {
      let query: any;

      // Try to update by MongoDB ObjectId first
      if (ObjectId.isValid(walletId)) {
        query = { _id: new ObjectId(walletId) };
      } else {
        // If not valid ObjectId, search by custom id field
        query = { id: walletId };
      }

      const result = await collection.updateOne(
        query,
        {
          $set: {
            isActive: false,
            updatedAt: new Date()
          }
        }
      );

      return result.modifiedCount > 0;
    } catch (error) {
      console.error('Error in deactivateWallet:', error);
      return false;
    }
  }

  async createTransaction(transactionData: Omit<Transaction, '_id'>): Promise<Transaction> {
    const collection = await getCollection(this.TRANSACTION_COLLECTION);
    
    const result = await collection.insertOne(transactionData);
    return { ...transactionData, _id: result.insertedId };
  }

  async getTransactionsByWallet(walletId: string, limit: number = 50): Promise<Transaction[]> {
    const collection = await getCollection(this.TRANSACTION_COLLECTION);

    try {
      let query: any;

      // Try to query by MongoDB ObjectId first
      if (ObjectId.isValid(walletId)) {
        query = { walletId: new ObjectId(walletId) };
      } else {
        // If not valid ObjectId, search by string walletId
        query = { walletId: walletId };
      }

      return await collection
        .find(query)
        .sort({ timestamp: -1 })
        .limit(limit)
        .toArray() as Transaction[];
    } catch (error) {
      console.error('Error in getTransactionsByWallet:', error);
      return [];
    }
  }

  async updateTransactionStatus(txHash: string, status: Transaction['status'], blockNumber?: number): Promise<boolean> {
    const collection = await getCollection(this.TRANSACTION_COLLECTION);
    
    const updateData: any = { status };
    if (blockNumber) {
      updateData.blockNumber = blockNumber;
    }

    const result = await collection.updateOne(
      { txHash },
      { $set: updateData }
    );

    return result.modifiedCount > 0;
  }
}

export const walletService = new WalletService();
