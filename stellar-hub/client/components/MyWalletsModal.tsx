import React, { useState } from 'react';
import { X, Check, MoreHorizontal, Plus, Sun, Lock, Settings } from 'lucide-react';
import WalletSetup from './WalletSetup';
import { useWallets } from '../hooks/useWallets';

interface Wallet {
  id: string;
  name: string;
  balance: string | { [key: string]: number };
  isSelected: boolean;
  type: 'native' | 'imported';
}

interface MyWalletsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onWalletAdded?: (walletName: string) => void;
}

export default function MyWalletsModal({ isOpen, onClose, onWalletAdded }: MyWalletsModalProps) {
  const [activeTab, setActiveTab] = useState<'native' | 'imported'>('native');
  const [showWalletSetup, setShowWalletSetup] = useState(false);
  const { wallets, addWallet, selectWallet } = useWallets();

  const handleAddWallet = () => {
    setShowWalletSetup(true);
  };

  const handleWalletSetupComplete = (walletName: string) => {
    setShowWalletSetup(false);
    addWallet(walletName);
    onWalletAdded?.(walletName);
  };

  if (!isOpen) return null;

  const filteredWallets = wallets.filter(wallet => wallet.type === activeTab);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50" 
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-md bg-background border-t border-border rounded-t-2xl animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-medium text-white">My Wallets</h2>
          <button 
            onClick={onClose}
            className="hover:bg-secondary p-1 rounded"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border">
          <button
            onClick={() => setActiveTab('native')}
            className={`flex-1 py-3 px-4 text-center font-medium transition-colors ${
              activeTab === 'native'
                ? 'text-white border-b-2 border-primary bg-accent/50'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Native
          </button>
          <button
            onClick={() => setActiveTab('imported')}
            className={`flex-1 py-3 px-4 text-center font-medium transition-colors ${
              activeTab === 'imported'
                ? 'text-white border-b-2 border-primary bg-accent/50'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Imported
          </button>
        </div>

        {/* Wallet List */}
        <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
          {filteredWallets.map((wallet) => (
            <div
              key={wallet.id}
              className={`bg-secondary border rounded-lg p-4 flex items-center justify-between ${
                wallet.isSelected ? 'border-primary' : 'border-border'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-gray-600 to-gray-800 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">👤</span>
                </div>
                <div>
                  <div className="text-white font-medium">{wallet.name}</div>
                  <div className="text-muted-foreground text-sm">
                    {typeof wallet.balance === 'string' ? wallet.balance : '≈$0'}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                {wallet.isSelected && (
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                )}
                <button className="hover:bg-accent p-1 rounded">
                  <MoreHorizontal className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>
            </div>
          ))}
          
          {filteredWallets.length === 0 && (
            <div className="text-center py-8">
              <div className="text-muted-foreground">No {activeTab} wallets</div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border">
          <div className="flex items-center justify-between">
            <button
              onClick={handleAddWallet}
              className="flex items-center space-x-2 text-primary hover:text-primary/80"
            >
              <Plus className="w-5 h-5" />
              <span className="font-medium">Add Wallet</span>
            </button>
            
            <div className="flex items-center space-x-3">
              <button className="hover:bg-secondary p-2 rounded">
                <Sun className="w-5 h-5 text-muted-foreground" />
              </button>
              <button className="hover:bg-secondary p-2 rounded">
                <Lock className="w-5 h-5 text-muted-foreground" />
              </button>
              <button className="hover:bg-secondary p-2 rounded">
                <Settings className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Wallet Setup Modal */}
      <WalletSetup
        isOpen={showWalletSetup}
        onClose={() => setShowWalletSetup(false)}
        onComplete={handleWalletSetupComplete}
      />
    </div>
  );
}
