import React, { useState } from 'react';
import { Plus, Download } from 'lucide-react';
import WalletSetup from './WalletSetup';

interface WelcomeScreenProps {
  onWalletCreated: (walletName: string) => void;
}

export default function WelcomeScreen({ onWalletCreated }: WelcomeScreenProps) {
  const [showWalletSetup, setShowWalletSetup] = useState(false);

  const handleCreateWallet = () => {
    setShowWalletSetup(true);
  };

  const handleImportWallet = () => {
    // TODO: Implement import wallet functionality
    console.log('Import wallet clicked');
  };

  const handleWalletSetupComplete = (walletName: string) => {
    setShowWalletSetup(false);
    onWalletCreated(walletName);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md text-center">
        {/* Logo */}
        <div className="mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-primary to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-2xl">S</span>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Welcome to SafePal</h1>
          <p className="text-muted-foreground">
            Your gateway to the decentralized world
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4">
          <button
            onClick={handleCreateWallet}
            className="w-full bg-primary hover:bg-primary/80 text-white py-4 px-6 rounded-lg font-medium transition-colors flex items-center justify-center space-x-3"
          >
            <Plus className="w-5 h-5" />
            <span>Create New Wallet</span>
          </button>

          <button
            onClick={handleImportWallet}
            className="w-full bg-secondary border border-border hover:bg-accent text-white py-4 px-6 rounded-lg font-medium transition-colors flex items-center justify-center space-x-3"
          >
            <Download className="w-5 h-5" />
            <span>Import Existing Wallet</span>
          </button>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-muted-foreground text-sm">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </p>
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
