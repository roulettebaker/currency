import React, { useState } from 'react';
import { generalApi, walletApi, transactionApi } from '../lib/api';
import { useWallet } from '../contexts/WalletContext';

export default function DatabaseDebug() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const { refreshWallets, refreshTransactions, selectedWallet } = useWallet();

  const testOperation = async (operation: string, apiCall: () => Promise<any>) => {
    setIsLoading(true);
    setResult(null);
    
    try {
      console.log(`🧪 Testing: ${operation}`);
      const response = await apiCall();
      console.log(`✅ ${operation} Result:`, response);
      setResult({ success: true, data: response });
    } catch (error) {
      console.error(`❌ ${operation} Error:`, error);
      setResult({ success: false, error: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  const operations = [
    {
      name: 'Seed Database',
      action: () => testOperation('Seed Database', () => generalApi.seedDatabase())
    },
    {
      name: 'Health Check',
      action: () => testOperation('Health Check', () => generalApi.healthCheck())
    },
    {
      name: 'Get Wallets',
      action: () => testOperation('Get Wallets', () => walletApi.getWallets())
    },
    {
      name: 'Refresh Wallets',
      action: () => testOperation('Refresh Wallets', async () => {
        await refreshWallets();
        return { message: 'Wallets refreshed' };
      })
    },
    {
      name: 'Get Transactions',
      action: () => testOperation('Get Transactions', () => 
        selectedWallet ? walletApi.getWalletTransactions(selectedWallet.id) : 
        Promise.reject(new Error('No wallet selected'))
      )
    },
    {
      name: 'Refresh Transactions',
      action: () => testOperation('Refresh Transactions', async () => {
        await refreshTransactions();
        return { message: 'Transactions refreshed' };
      })
    }
  ];

  if (process.env.NODE_ENV === 'production') {
    return null; // Don't show in production
  }

  return (
    <div className="fixed bottom-4 left-4 bg-gray-800 border border-gray-600 rounded-lg p-4 max-w-sm z-50">
      <h3 className="text-white font-semibold mb-3 text-sm">Database Debug</h3>
      
      <div className="space-y-2">
        {operations.map((op, index) => (
          <button
            key={index}
            onClick={op.action}
            disabled={isLoading}
            className="w-full text-left px-2 py-1 text-xs bg-gray-700 hover:bg-gray-600 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {op.name}
          </button>
        ))}
      </div>

      {isLoading && (
        <div className="mt-3 text-xs text-yellow-400">
          Testing operation...
        </div>
      )}

      {result && (
        <div className="mt-3 text-xs">
          <div className={`font-semibold ${result.success ? 'text-green-400' : 'text-red-400'}`}>
            {result.success ? '✅ Success' : '❌ Error'}
          </div>
          <div className="text-gray-300 mt-1 max-h-32 overflow-y-auto">
            <pre className="whitespace-pre-wrap break-words">
              {JSON.stringify(result.success ? result.data : result.error, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
