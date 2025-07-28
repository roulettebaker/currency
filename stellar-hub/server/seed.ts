import { ObjectId } from 'mongodb';
import { walletService, Wallet, Transaction } from './services/walletService';

export async function seedDatabase() {
  console.log('🌱 Seeding database with sample data...');

  try {
    // Create sample wallets
    const sampleWallets = [
      {
        id: 'wallet_1',
        name: 'Main Wallet',
        type: 'native' as const,
        address: '0xa1b2c3d4e5f6789012345678901234567890abcd',
        publicKey: '0x04abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
        network: 'ethereum' as const,
        balance: {
          eth: 2.5,
          btc: 0.05,
          bnb: 10.0,
          usdc: 1000,
          usdt: 500,
          pol: 2500,
          trx: 15000
        },
        isActive: true
      },
      {
        id: 'wallet_2',
        name: 'Trading Wallet',
        type: 'imported' as const,
        address: '0xb2c3d4e5f6789012345678901234567890abcdef1',
        publicKey: '0x04bcdef1234567890bcdef1234567890bcdef1234567890bcdef1234567890bcdef1234567890bcdef1234567890bcdef1234567890bcdef1234567890bcdef12345678901',
        network: 'ethereum' as const,
        balance: {
          eth: 5.2,
          btc: 0.15,
          bnb: 25.5,
          usdc: 5000,
          usdt: 2500,
          pol: 10000,
          trx: 50000
        },
        isActive: true
      }
    ];

    const createdWallets = [];
    for (const walletData of sampleWallets) {
      try {
        const wallet = await walletService.createWallet(walletData);
        createdWallets.push(wallet);
        console.log(`✅ Created wallet: ${wallet.name} (ID: ${wallet.id})`);
      } catch (error) {
        console.log(`⚠��� Wallet ${walletData.name} already exists or error occurred`);
      }
    }

    // Create sample transactions
    const sampleTransactions: Omit<Transaction, '_id'>[] = [
      {
        walletId: 'wallet_1',
        from: '0xa1b2c3d4e5f6789012345678901234567890abcd',
        to: '0xbc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
        amount: 0.00123456,
        token: 'BTC',
        network: 'Bitcoin',
        txHash: '1a2b3c4d5e6f7890abcdef1234567890abcdef1234567890abcdef1234567890',
        status: 'confirmed',
        gasUsed: 21000,
        gasPrice: 20,
        blockNumber: 18500000,
        timestamp: new Date('2024-01-15T10:30:00')
      },
      {
        walletId: 'wallet_1',
        from: '0x742C4B7B6f7A1234567890abcdef1234567890ab',
        to: '0xa1b2c3d4e5f6789012345678901234567890abcd',
        amount: 0.5,
        token: 'ETH',
        network: 'ERC20',
        txHash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
        status: 'confirmed',
        gasUsed: 21000,
        gasPrice: 25,
        blockNumber: 18500001,
        timestamp: new Date('2024-01-14T15:45:00')
      },
      {
        walletId: 'wallet_2',
        from: '0xb2c3d4e5f6789012345678901234567890abcdef1',
        to: '0x1234567890abcdef1234567890abcdef12345678',
        amount: 2.5,
        token: 'BNB',
        network: 'BEP20',
        txHash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
        status: 'confirmed',
        gasUsed: 21000,
        gasPrice: 5,
        blockNumber: 32000000,
        timestamp: new Date('2024-01-13T09:20:00')
      },
      {
        walletId: 'wallet_1',
        from: '0xa1b2c3d4e5f6789012345678901234567890abcd',
        to: '0x9876543210fedcba9876543210fedcba98765432',
        amount: 1000,
        token: 'POL',
        network: 'Polygon',
        txHash: '0x9876543210fedcba9876543210fedcba9876543210fedcba9876543210fedcba',
        status: 'pending',
        gasUsed: 21000,
        gasPrice: 30,
        timestamp: new Date('2024-01-12T14:10:00')
      },
      {
        walletId: 'wallet_2',
        from: '0xb2c3d4e5f6789012345678901234567890abcdef1',
        to: 'TQn9Y2khEsLJW1ChVWFMSMeRDow5KcbLSE',
        amount: 500,
        token: 'TRX',
        network: 'TRC20',
        txHash: 'failed_tx_hash_sample',
        status: 'failed',
        gasUsed: 0,
        gasPrice: 10,
        timestamp: new Date('2024-01-11T11:30:00')
      }
    ];

    for (const txData of sampleTransactions) {
      try {
        const transaction = await walletService.createTransaction(txData);
        console.log(`�� Created transaction: ${transaction.token} ${transaction.amount} (${transaction.status})`);
      } catch (error) {
        console.log(`⚠️ Transaction already exists or error occurred:`, error);
      }
    }

    console.log('🎉 Database seeding completed successfully!');
    return { success: true };
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    return { success: false, error };
  }
}

// Auto-run seed if this file is executed directly (disabled in production builds)
if (import.meta.url === `file://${process.argv[1]}` &&
    process.argv[1].includes('seed.ts') &&
    process.env.NODE_ENV !== 'production') {
  seedDatabase().then((result) => {
    if (result.success) {
      console.log('✅ Seeding completed');
      process.exit(0);
    } else {
      console.error('❌ Seeding failed:', result.error);
      process.exit(1);
    }
  });
}
