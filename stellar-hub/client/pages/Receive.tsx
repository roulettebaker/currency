import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Copy, Check, Share2, Download, ChevronDown } from 'lucide-react';
import { copyWithFeedback } from '../lib/clipboard';
import { useWallet } from '../contexts/WalletContext';
import { getCryptoIcon } from '../components/CryptoIcons';

interface Cryptocurrency {
  id: string;
  name: string;
  symbol: string;
  network: string;
  qrCode: string;
}

// Generate dynamic QR code placeholder
const generateQRCode = (address: string) => {
  return `data:image/svg+xml;base64,${btoa(`
    <svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#fff"/>
      <rect x="20" y="20" width="10" height="10" fill="#000"/>
      <rect x="40" y="20" width="10" height="10" fill="#000"/>
      <rect x="60" y="20" width="10" height="10" fill="#000"/>
      <rect x="20" y="40" width="10" height="10" fill="#000"/>
      <rect x="60" y="40" width="10" height="10" fill="#000"/>
      <rect x="20" y="60" width="10" height="10" fill="#000"/>
      <rect x="40" y="60" width="10" height="10" fill="#000"/>
      <rect x="60" y="60" width="10" height="10" fill="#000"/>
      <text x="100" y="100" text-anchor="middle" dy=".3em" font-family="monospace" font-size="8" fill="#666">
        QR Code for ${address.substring(0, 8)}...
      </text>
    </svg>
  `)}`;
};

const cryptocurrencies: Cryptocurrency[] = [
  {
    id: 'btc',
    name: 'Bitcoin',
    symbol: 'BTC',
    network: 'Bitcoin',
    qrCode: ''
  },
  {
    id: 'eth',
    name: 'Ethereum',
    symbol: 'ETH',
    network: 'ERC20',
    qrCode: ''
  },
  {
    id: 'bnb',
    name: 'BNB',
    symbol: 'BNB',
    network: 'BEP20',
    qrCode: ''
  },
  {
    id: 'trx',
    name: 'TRON',
    symbol: 'TRX',
    network: 'TRC20',
    qrCode: ''
  }
];

export default function Receive() {
  const [searchParams] = useSearchParams();
  const coinParam = searchParams.get('coin') || 'eth';
  
  const { selectedWallet, getWalletAddress, loading } = useWallet();
  const [selectedCrypto, setSelectedCrypto] = useState(
    cryptocurrencies.find(c => c.id === coinParam) || cryptocurrencies[1]
  );
  const [copied, setCopied] = useState(false);
  const [showCryptoSelector, setShowCryptoSelector] = useState(false);

  // Get live wallet address
  const walletAddress = getWalletAddress();

  // Update QR code when address or crypto changes
  useEffect(() => {
    if (walletAddress) {
      setSelectedCrypto(prev => ({
        ...prev,
        qrCode: generateQRCode(walletAddress)
      }));
    }
  }, [walletAddress, selectedCrypto.id]);

  const handleCopyAddress = async () => {
    await copyWithFeedback(
      walletAddress,
      () => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      },
      (error) => {
        console.error('Copy failed:', error);
        alert(`Copy failed. Please copy manually: ${walletAddress}`);
      }
    );
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Receive ${selectedCrypto.symbol}`,
          text: `Send ${selectedCrypto.symbol} to this address: ${walletAddress}`,
          url: window.location.href
        });
      } catch (err) {
        console.log('Share cancelled or failed');
        handleCopyAddress();
      }
    } else {
      handleCopyAddress();
    }
  };

  const handleDownloadQR = () => {
    const link = document.createElement('a');
    link.download = `${selectedCrypto.symbol}-wallet-qr.svg`;
    link.href = selectedCrypto.qrCode;
    link.click();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-muted-foreground">Loading wallet...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center">
          <Link to="/" className="mr-4">
            <ArrowLeft className="w-6 h-6 text-white" />
          </Link>
          <h1 className="text-lg font-medium text-white">Receive Crypto</h1>
        </div>
        <button onClick={handleShare} className="text-white">
          <Share2 className="w-6 h-6" />
        </button>
      </div>

      {/* Content */}
      <div className="p-4 space-y-6">
        {/* Cryptocurrency Selector */}
        <div>
          <h2 className="text-white font-medium mb-3">Select Cryptocurrency</h2>
          <div className="relative">
            <button
              onClick={() => setShowCryptoSelector(!showCryptoSelector)}
              className="w-full bg-secondary border border-border rounded-lg p-4 flex items-center justify-between hover:bg-accent transition-colors"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 flex items-center justify-center">
                  {getCryptoIcon(selectedCrypto.id, 40)}
                </div>
                <div className="text-left">
                  <div className="text-white font-medium">{selectedCrypto.name}</div>
                  <div className="text-muted-foreground text-sm">{selectedCrypto.network}</div>
                </div>
              </div>
              <ChevronDown className="w-5 h-5 text-muted-foreground" />
            </button>

            {/* Dropdown */}
            {showCryptoSelector && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-secondary border border-border rounded-lg shadow-lg z-50">
                {cryptocurrencies.map((crypto) => (
                  <button
                    key={crypto.id}
                    onClick={() => {
                      setSelectedCrypto(crypto);
                      setShowCryptoSelector(false);
                    }}
                    className="w-full p-3 flex items-center space-x-3 hover:bg-accent text-left"
                  >
                    <div className="w-8 h-8 flex items-center justify-center">
                      {getCryptoIcon(crypto.id, 32)}
                    </div>
                    <div>
                      <div className="text-white font-medium">{crypto.name}</div>
                      <div className="text-muted-foreground text-sm">{crypto.network}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* QR Code */}
        <div className="text-center">
          <h3 className="text-white font-medium mb-2">Scan QR Code</h3>
          <p className="text-muted-foreground text-sm mb-4">
            Share this QR code to receive {selectedCrypto.symbol}
          </p>
          
          <div className="bg-white rounded-xl p-6 mx-auto w-fit">
            <div className="w-48 h-48 bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary rounded-lg flex items-center justify-center mx-auto mb-2">
                  {getCryptoIcon(selectedCrypto.id, 32)}
                </div>
                <div className="text-gray-600 font-medium">QR Code</div>
                <div className="text-gray-500 text-sm">{selectedCrypto.symbol}</div>
              </div>
            </div>
          </div>

          <button
            onClick={handleDownloadQR}
            className="mt-4 bg-secondary border border-border text-white py-2 px-4 rounded-lg font-medium flex items-center justify-center space-x-2 mx-auto hover:bg-accent transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Download QR</span>
          </button>
        </div>

        {/* Wallet Address */}
        <div>
          <h3 className="text-white font-medium mb-3">Wallet Address</h3>
          <div className="bg-secondary border border-border rounded-lg p-4">
            <div className="text-white text-sm break-all font-mono mb-3">
              {walletAddress}
            </div>
            
            {selectedWallet && (
              <div className="text-muted-foreground text-xs mb-3">
                Wallet: {selectedWallet.name} ({selectedWallet.network})
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-2 mt-3">
            <button
              onClick={handleCopyAddress}
              className={`flex-1 py-3 rounded-lg font-medium flex items-center justify-center space-x-2 transition-colors ${
                copied 
                  ? 'bg-green-600 text-white' 
                  : 'bg-primary text-white hover:bg-primary/90'
              }`}
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied!' : 'Copy Address'}</span>
            </button>
            <button
              onClick={handleShare}
              className="flex-1 py-3 rounded-lg font-medium flex items-center justify-center space-x-2 bg-secondary border border-border text-white hover:bg-accent transition-colors"
            >
              <Share2 className="w-4 h-4" />
              <span>Share</span>
            </button>
          </div>
        </div>

        {/* Warning */}
        <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-4">
          <div className="text-yellow-400 text-sm">
            <strong>Important:</strong> Only send {selectedCrypto.symbol} ({selectedCrypto.network}) to this address. 
            Sending other cryptocurrencies may result in permanent loss.
          </div>
        </div>
      </div>
    </div>
  );
}
