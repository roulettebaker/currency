import React, { useState, useEffect } from 'react';
import { Link, useParams, useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, QrCode, AlertCircle, CheckCircle, X } from 'lucide-react';
import { getCryptoIcon } from '../components/CryptoIcons';
import { useWallet } from '../contexts/WalletContext';
import { useBalance } from '../contexts/BalanceContext';
import { sendApi } from '../lib/api';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../components/ui/alert-dialog";
import { useToast } from "../hooks/use-toast";

interface Cryptocurrency {
  id: string;
  name: string;
  symbol: string;
  balance: number;
  usdValue: number;
  icon: string;
}

type TransactionState = 'form' | 'confirming' | 'processing' | 'success' | 'error';

export default function SendForm() {
  const { coinId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { selectedWallet } = useWallet();
  const { getBalance, updateBalance, refreshBalances, setOptimisticBalance } = useBalance();

  // Transaction state management - ALL HOOKS MUST BE AT THE TOP
  const [transactionState, setTransactionState] = useState<TransactionState>('form');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [transactionHash, setTransactionHash] = useState('');
  const [crypto, setCrypto] = useState<Cryptocurrency | null>(null);
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('ETH');
  const [isLoading, setIsLoading] = useState(true);

  // Load real balance data when component mounts - with stable dependencies
  useEffect(() => {
    let mounted = true;

    if (selectedWallet?.id && coinId) {
      const balance = getBalance(selectedWallet.id, coinId.toLowerCase());
      const mockPrices: { [key: string]: number } = {
        btc: 45000,
        eth: 3000,
        bnb: 300,
        pol: 0.8,
        trx: 0.1,
        usdc: 1,
        usdt: 1
      };

      const cryptoData: Cryptocurrency = {
        id: coinId,
        name: `${coinId.toUpperCase()} (${coinId === 'eth' ? 'ERC20' : 'Native'})`,
        symbol: coinId.toUpperCase(),
        balance,
        usdValue: balance * (mockPrices[coinId] || 0),
        icon: coinId.toUpperCase()[0]
      };

      if (mounted) {
        setCrypto(cryptoData);
        setIsLoading(false);
      }
    }

    return () => {
      mounted = false;
    };
  }, [selectedWallet?.id, coinId]); // Removed getBalance dependency

  // Check for crypto passed from location state - run once
  useEffect(() => {
    if (location.state?.crypto && !crypto) {
      setCrypto(location.state.crypto);
      setIsLoading(false);
    }
  }, []); // Run only once since location.state doesn't change after navigation

  // Update crypto when balance changes - separate effect
  useEffect(() => {
    if (crypto && selectedWallet?.id && coinId) {
      const newBalance = getBalance(selectedWallet.id, coinId.toLowerCase());
      if (newBalance !== crypto.balance) {
        setCrypto(prev => prev ? {
          ...prev,
          balance: newBalance,
          usdValue: newBalance * (prev.usdValue / prev.balance || 0)
        } : null);
      }
    }
  }, [getBalance, selectedWallet?.id, coinId, crypto?.balance]); // Monitor balance changes

  // Return loading state if no crypto data yet - AFTER ALL HOOKS
  if (isLoading || !crypto || !selectedWallet) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  const handleMaxClick = () => {
    // For ETH, leave some gas for transactions
    if (crypto.id === 'eth') {
      const maxAmount = Math.max(0, crypto.balance - 0.01); // Reserve 0.01 ETH for gas (more conservative)
      setAmount(maxAmount.toFixed(6)); // Limit to 6 decimal places
    } else {
      setAmount(crypto.balance.toFixed(6)); // Limit to 6 decimal places
    }
  };

  const isValidAddress = (address: string) => {
    // Enhanced validation for different address formats
    if (!address) return false;
    
    // Ethereum address validation (basic)
    if (address.startsWith('0x') && address.length === 42) {
      return /^0x[a-fA-F0-9]{40}$/.test(address);
    }
    
    // ENS domain validation
    if (address.includes('.eth')) {
      return address.length > 4 && address.endsWith('.eth');
    }
    
    // Space ID validation
    if (address.includes('.bnb') || address.includes('.arb')) {
      return address.length > 4;
    }
    
    // Fallback for other formats
    return address.length > 10;
  };

  const hasValidAmount = () => {
    const numAmount = parseFloat(amount);
    return numAmount > 0 && numAmount <= crypto.balance;
  };

  const hasSufficientBalance = () => {
    const numAmount = parseFloat(amount);
    if (crypto.id === 'eth') {
      // Need to leave gas fee - more conservative
      return numAmount + 0.01 <= crypto.balance;
    }
    return numAmount <= crypto.balance;
  };

  const isFormValid = () => {
    return recipient !== '' &&
           amount !== '' &&
           isValidAddress(recipient) &&
           hasValidAmount() &&
           parseFloat(amount) <= crypto.balance;
  };

  const handleNextClick = () => {
    // Validation checks
    if (!recipient) {
      toast({
        title: "Address Required",
        description: "Please input address.",
        variant: "destructive",
      });
      return;
    }

    if (!isValidAddress(recipient)) {
      toast({
        title: "Invalid Address",
        description: "Please enter a valid recipient address.",
        variant: "destructive",
      });
      return;
    }

    if (!amount) {
      toast({
        title: "Amount Required",
        description: "Please enter an amount.",
        variant: "destructive",
      });
      return;
    }

    if (!hasValidAmount()) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount.",
        variant: "destructive",
      });
      return;
    }

    if (!hasSufficientBalance()) {
      toast({
        title: "Insufficient Balance",
        description: `You don't have enough ${crypto.symbol} to complete this transaction.`,
        variant: "destructive",
      });
      return;
    }

    // Show confirmation dialog
    setShowConfirmDialog(true);
  };

  const handleConfirmTransaction = async () => {
    setShowConfirmDialog(false);
    setTransactionState('processing');

    try {
      if (!selectedWallet) {
        throw new Error("No wallet selected");
      }

      // Create send transaction (this handles both transaction creation and balance update)
      const sendData = {
        walletId: selectedWallet.id,
        to: recipient,
        amount: parseFloat(amount),
        token: crypto.symbol.toLowerCase(),
        network: 'ethereum'
      };

      console.log('Sending transaction data:', sendData);

      // Immediate optimistic balance update for Chrome Extension responsiveness
      const newBalance = crypto.balance - parseFloat(amount);
      setOptimisticBalance(selectedWallet.id, crypto.symbol.toLowerCase(), newBalance);

      // Update local crypto state immediately
      setCrypto(prev => prev ? {
        ...prev,
        balance: newBalance,
        usdValue: newBalance * (prev.usdValue / prev.balance || 0)
      } : null);

      // Call API to send transaction and update balance atomically
      const response = await sendApi.sendTransaction(sendData);

      if (response.success) {
        setTransactionHash(response.transaction.hash || response.transaction.txHash || '');

        // Update balance with the actual server response if available
        if (response.newBalance !== undefined) {
          await updateBalance(selectedWallet.id, crypto.symbol.toLowerCase(), response.newBalance);
          // Update crypto state with server response
          setCrypto(prev => prev ? {
            ...prev,
            balance: response.newBalance,
            usdValue: response.newBalance * (prev.usdValue / prev.balance || 0)
          } : null);
        }
      }

      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 1500));

      setTransactionState('success');
      toast({
        title: "Transaction Sent",
        description: `Successfully sent ${amount} ${crypto.symbol}`,
        variant: "default",
      });

      // Refresh balances to ensure sync (reduced delay for Chrome Extension)
      setTimeout(() => {
        refreshBalances();
      }, 500);

    } catch (error) {
      setTransactionState('error');
      toast({
        title: "Transaction Failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
      console.error('Transaction error:', error);
    }
  };

  const handleCancel = () => {
    if (transactionState === 'form') {
      navigate('/');
    } else {
      // Reset to form state
      setTransactionState('form');
      setTransactionHash('');
    }
  };

  const handleGoBack = () => {
    setShowConfirmDialog(false);
  };

  // Success Screen
  if (transactionState === 'success') {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center">
            <button onClick={() => navigate('/')} className="mr-4">
              <ArrowLeft className="w-6 h-6 text-white" />
            </button>
            <h1 className="text-lg font-medium text-white">Transaction Sent</h1>
          </div>
        </div>

        {/* Success Content */}
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
          <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mb-6">
            <CheckCircle className="w-12 h-12 text-white" />
          </div>
          
          <h2 className="text-2xl font-bold text-white mb-4">
            Transaction sent successfully!
          </h2>
          
          <div className="bg-secondary rounded-lg p-4 mb-6 w-full max-w-sm">
            <div className="text-muted-foreground text-sm mb-2">Amount</div>
            <div className="text-white font-bold text-lg">
              {amount} {crypto.symbol}
            </div>
            <div className="text-muted-foreground text-sm mt-2">To</div>
            <div className="text-white text-sm break-all">
              {recipient}
            </div>
            <div className="text-muted-foreground text-sm mt-2">Transaction Hash</div>
            <div className="text-blue-400 text-xs break-all">
              {transactionHash}
            </div>
          </div>

          <p className="text-muted-foreground text-sm mb-8">
            Your transaction has been submitted to the network. 
            It may take a few minutes to confirm.
          </p>
        </div>

        {/* Action Button */}
        <div className="p-4 bg-background border-t border-border safe-area-pb">
          <button
            onClick={() => navigate('/')}
            className="w-full bg-primary text-white py-3 rounded-lg font-medium"
          >
            Done
          </button>
        </div>
      </div>
    );
  }

  // Processing Screen
  if (transactionState === 'processing') {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center">
            <button onClick={() => navigate('/')} className="mr-4">
              <ArrowLeft className="w-6 h-6 text-white" />
            </button>
            <h1 className="text-lg font-medium text-white">Processing Transaction</h1>
          </div>
        </div>

        {/* Processing Content */}
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
          <div className="w-20 h-20 border-4 border-primary border-t-transparent rounded-full animate-spin mb-6"></div>
          
          <h2 className="text-2xl font-bold text-white mb-4">
            Sending Transaction...
          </h2>
          
          <p className="text-muted-foreground text-sm">
            Please wait while we process your transaction.
          </p>
        </div>
      </div>
    );
  }

  // Main Form
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center">
          <Link to="/send" className="mr-4">
            <ArrowLeft className="w-6 h-6 text-white" />
          </Link>
          <h1 className="text-lg font-medium text-white">Send</h1>
        </div>
        <button onClick={() => navigate('/')} className="text-white">
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Form Content */}
      <div className="flex-1 overflow-y-auto pb-24">
        {/* Currency Selection */}
        <div className="p-4">
          <div className="flex items-center space-x-3 bg-secondary rounded-lg p-4">
            <div className="w-10 h-10 flex items-center justify-center">
              {getCryptoIcon('eth', 40)}
            </div>
            <div>
              <div className="text-white font-medium text-lg">ETH</div>
              <div className="text-muted-foreground text-sm">ERC20</div>
            </div>
          </div>
        </div>

        {/* Recipient Address */}
        <div className="px-4 pb-4">
          <div className="text-white font-medium mb-3">To</div>
          <div className="relative mb-2">
            <input
              type="text"
              placeholder="Please enter address, Space ID, ENS..."
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              className="w-full bg-secondary border border-border rounded-lg pl-4 pr-12 py-3 text-white placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <button className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <QrCode className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>

          {/* Error message for empty input when user has tried to interact */}
          {recipient === '' && (
            <div className="text-red-500 text-sm mb-3">
              Please input address
            </div>
          )}

          {/* Info box */}
          <div className="flex items-start space-x-3 p-3 bg-secondary rounded-lg border border-border">
            <AlertCircle className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
            <span className="text-muted-foreground text-sm">
              Please ensure that the receiving address supports the ERC20 network.
            </span>
          </div>
        </div>

        {/* Amount */}
        <div className="px-4">
          <div className="text-white font-medium mb-3">Amount</div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleMaxClick}
                  className="px-3 py-1 bg-primary text-white rounded-full text-sm font-medium"
                >
                  MAX
                </button>
                <span className="text-white font-medium">ETH</span>
              </div>
              <button className="text-muted-foreground">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>

            <div className="flex items-center justify-between">
              <input
                type="number"
                placeholder="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="bg-transparent text-2xl text-white placeholder-muted-foreground focus:outline-none border-none w-auto flex-1"
                step="0.000001"
                min="0"
                max={crypto.balance}
              />
              <span className="text-muted-foreground text-lg">USD</span>
            </div>
          </div>

          <div className="mt-6 space-y-2">
            <div className="text-muted-foreground text-sm">
              Available Balance: {crypto.balance} ETH (ERC20)
            </div>
            {parseFloat(amount) > crypto.balance && amount !== '' && (
              <div className="text-red-500 text-sm">
                Insufficient balance
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons - Fixed at bottom with safe area */}
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border safe-area-pb z-50">
        <div className="p-4 max-w-md mx-auto">
          <div className="flex space-x-3">
            <button
              onClick={handleCancel}
              className="flex-1 bg-secondary text-white py-3 rounded-xl font-medium hover:bg-accent transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleNextClick}
              disabled={!isFormValid()}
              className={`flex-1 py-3 rounded-xl font-medium transition-colors ${
                isFormValid()
                  ? 'bg-primary text-white hover:bg-primary/90'
                  : 'bg-muted text-muted-foreground cursor-not-allowed'
              }`}
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent className="bg-secondary border-border text-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">
              Confirm Transaction
            </AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              Are you sure you want to send this transaction?
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <div className="my-4 p-4 bg-background rounded-lg border border-border">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Amount:</span>
                <span className="text-white font-medium">{amount} {crypto.symbol}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">To:</span>
                <span className="text-white text-sm break-all">{recipient}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Network:</span>
                <span className="text-white">Ethereum (ERC20)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Gas Fee:</span>
                <span className="text-white">~0.001 ETH</span>
              </div>
            </div>
          </div>

          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <AlertDialogCancel 
              onClick={handleGoBack}
              className="bg-secondary border-border text-white hover:bg-accent"
            >
              Go Back
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmTransaction}
              className="bg-primary text-white hover:bg-primary/90"
            >
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
